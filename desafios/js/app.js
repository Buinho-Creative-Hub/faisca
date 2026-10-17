/* Faísca Desafios — cola tudo: pacote (mascote + desafios), editor, micro:bit do ecrã e o verdadeiro. */
(function () {
  'use strict';
  const F = window.Faisca;
  const $ = id => document.getElementById(id);
  const P = F.PACOTE;
  const CHAVE = P.chave || ('faisca.' + P.id + '.v1');
  const params = new URLSearchParams(location.search);

  // ------------------------------------------------------------ marca e mascote do pacote
  document.title = P.titulo;
  $('marcaIcone').innerHTML = P.marca.icone || '';     // conteúdo do próprio pacote, não da criança
  $('marcaNome').textContent = P.marca.nome;
  $('marcaSub').textContent = P.marca.sub;
  $('tutor').setAttribute('aria-label', P.mascote.descricao);
  $('tutorNome').textContent = P.mascote.nome;
  $('tutorGambiarra').textContent = 'Ajudar ' + P.mascote.artigo + ' ' + P.mascote.nome;

  // ------------------------------------------------------------ estado guardado
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem armazenamento: segue */ } }
  const estado = Object.assign({ feitos: 0, atual: 0, xml: '' }, ler());
  if (params.has('todos')) estado.feitos = F.DESAFIOS.length - 1;   // modo professor
  const desbloqueado = i => i <= Math.min(estado.feitos, F.DESAFIOS.length - 1);
  if (!desbloqueado(estado.atual)) estado.atual = estado.feitos;

  // ------------------------------------------------------------ editor
  const ws = Blockly.inject('blocos', {
    renderer: 'makecode',
    theme: 'makecode',
    media: 'vendor/media/',
    toolbox: F.caixa(estado.atual),
    trashcan: true,
    sounds: false,
    zoom: { controls: true, wheel: false, startScale: 1, maxScale: 1.6, minScale: 0.6 },
    move: { scrollbars: true, drag: true, wheel: true },
  });
  if (estado.xml) {
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(estado.xml), ws); } catch (e) { console.warn(e); }
  }

  // ------------------------------------------------------------ micro:bit do ecrã
  const sim = new F.Sim($('sim'), k => entrada(k, 'ecra'));
  let escuro = false;
  const noEcra = {
    principal: true,
    icone: n => sim.icone(n),
    limpar: () => sim.limpar(),
    tocarSom: n => sim.tocarSom(n),
    tom: (f, ms) => sim.tom(f, ms),
    digital: (p, v) => sim.digital(p, v),
    estaEscuro: () => escuro,
    botoes: sim.botoes,
  };

  // ------------------------------------------------------------ micro:bit verdadeiro
  const ble = new F.MicrobitBLE(k => entrada(k, 'microbit'), (e, nome) => {
    const el = $('estado');
    el.classList.toggle('ok', e === 'ligado');
    el.textContent = e === 'ligado' ? 'micro:bit verdadeiro ligado' : e === 'a ligar' ? 'a ligar…' : 'micro:bit do ecrã';
    $('btnLigar').textContent = e === 'ligado' ? 'Desligar' : 'Bluetooth';
    if (e === 'ligado') { ble.enviar('W' + (F.DESAFIOS[estado.atual].livre ? 1 : 0)); reiniciar(); }
  });

  // ------------------------------------------------------------ motor e registo
  let registo = [];
  const motor = new F.Motor(ws, [noEcra, ble], (dir, v) => {
    const t = performance.now();
    registo.push({ t, dir, v });
    registo = registo.filter(e => t - e.t < 30000);
    verificar();
  });

  // ------------------------------------------------------------ mascote (tutor)
  const tutorUI = new F.TutorUI(P.mascote);
  const tutor = new F.TutorMotor(m => tutorUI.mostrar(m));
  $('festaMascote').src = tutorUI.sprite('celebrar');
  $('festaMascote').alt = P.mascote.nome + ' a celebrar';
  let gambiarra = null;      // { xml } do programa da criança enquanto ajuda a mascote
  let sucessoEm = -Infinity;
  let falha = null;
  const analisar = () => tutor.programaMudou(F.analisar(ws));
  setInterval(() => tutor.tick(), 1000);
  setInterval(() => verificar(), 400);   // algumas validações dependem do tempo que um desenho fica visível

  function entrada(k, origem) {
    if (k === 'agitar' && origem === 'microbit') { sim.svg.classList.remove('a-agitar'); void sim.svg.getBBox(); sim.svg.classList.add('a-agitar'); }
    motor.acontecimento(k);
    // A mascote espera que o programa corra antes de concluir que o teste falhou
    tutor.testou();
    const t0 = performance.now();
    clearTimeout(falha);
    falha = setTimeout(() => { if (sucessoEm < t0) tutor.testeFalhou(); }, 4000);
  }

  function reiniciar() {
    sim.reset();
    ble.limpar && ble.ligado && ble.limpar();
    if (ble.ligado) ble.digital('P2', 0);
    registo = [];
    motor.arrancar();
  }

  let espera = null;
  ws.addChangeListener(ev => {
    if (ev.isUiEvent || ev.type === Blockly.Events.FINISHED_LOADING) return;
    clearTimeout(espera);
    espera = setTimeout(() => {
      if (!gambiarra) { estado.xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws)); gravar(); }
      reiniciar();
      analisar();
    }, 250);
  });

  // ------------------------------------------------------------ desafios
  let festejado = -1;
  function verificar() {
    const d = F.DESAFIOS[estado.atual];
    if (d.livre || festejado === estado.atual) return;
    if (d.ok(registo)) {
      festejado = estado.atual;
      sucessoEm = performance.now();
      if (gambiarra) {
        const [e, t] = F.TUTOR.GERAIS.gambiarraObrigada;
        tutorUI.mostrar({ estado: e, texto: t, tipo: 'sucesso', pedida: true });
        return;
      }
      const s = tutor.sucesso();
      if (estado.feitos <= estado.atual) { estado.feitos = estado.atual + 1; gravar(); }
      desenharCaminho();
      atualizarBotoesTutor();
      setTimeout(() => festa(s), 900);
    }
  }

  function festa(s) {
    const n = estado.atual;
    const seguinte = F.DESAFIOS[n + 1];
    $('festaTitulo').textContent = 'Conseguiste!';
    $('festaTexto').textContent = (s && s.texto) ? s.texto
      : !seguinte ? 'Fizeste todos os desafios.'
      : `«${F.DESAFIOS[n].titulo}» está feito. No próximo desafio aparecem blocos novos.`;
    $('festaExtra').hidden = !(s && s.extensao);
    $('festaExtra').textContent = s && s.extensao ? 'Desafio extra: ' + s.extensao : '';
    $('btnSeguinte').hidden = !seguinte;
    $('btnSeguinte').textContent = !seguinte ? '' : seguinte.livre ? 'Inventar o meu brinquedo' : `Desafio ${n + 2}: ${seguinte.titulo}`;
    $('festa').hidden = false;
    (seguinte ? $('btnSeguinte') : $('btnFicar')).focus();
  }

  function mudarDesafio(n) {
    if (!desbloqueado(n)) return;
    if (gambiarra) sairGambiarra(false);
    estado.atual = n;
    festejado = -1;
    gravar();
    const d = F.DESAFIOS[n];
    $('missaoNum').textContent = d.livre ? 'Desafio livre' : `Desafio ${n + 1} de ${F.DESAFIOS.length - 1}`;
    $('missaoTitulo').textContent = d.titulo;
    $('missaoFrase').textContent = d.missao;
    $('missaoPassos').innerHTML = '';
    for (const p of d.passos) { const li = document.createElement('li'); li.textContent = p; $('missaoPassos').appendChild(li); }
    $('missaoMaterial').textContent = d.material;
    $('btnLuz').hidden = !d.livre;
    if (ble.ligado) ble.enviar('W' + (d.livre ? 1 : 0));
    ws.updateToolbox(F.caixa(n));
    desenharCaminho();
    reiniciar();
    tutor.entrarDesafio(n, n < estado.feitos);
    analisar();
    atualizarBotoesTutor();
  }

  // ------------------------------------------------------------ a mascote também erra (gambiarra)
  function carregar(xml) {
    ws.clear();
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws); } catch (e) { console.warn(e); }
  }
  function atualizarBotoesTutor() {
    const g = F.TUTOR.DESAFIOS[estado.atual] && F.TUTOR.DESAFIOS[estado.atual].gambiarra;
    $('tutorGambiarra').hidden = !(g && estado.atual < estado.feitos && !gambiarra);
    $('tutorVoltar').hidden = !gambiarra;
  }
  function entrarGambiarra() {
    const g = F.TUTOR.DESAFIOS[estado.atual].gambiarra;
    gambiarra = { xml: estado.xml };
    festejado = -1;
    carregar(g.xml);
    tutor.reset(); tutor.n = estado.atual;
    tutorUI.mostrar({ estado: 'surpreendida', texto: g.pedido, tipo: 'gambiarra' });
    atualizarBotoesTutor();
  }
  function sairGambiarra(avisar = true) {
    const xml = gambiarra.xml;
    gambiarra = null;
    carregar(xml || '<xml></xml>');
    festejado = estado.atual;
    if (avisar) { const [e, t] = F.TUTOR.GERAIS.voltarPrograma; tutorUI.mostrar({ estado: e, texto: t, tipo: 'info' }); }
    atualizarBotoesTutor();
  }

  const CADEADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  function desenharCaminho() {
    const nav = $('caminho');
    nav.innerHTML = '';
    F.DESAFIOS.forEach((d, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'passo';
      const aberto = desbloqueado(i);
      if (i === estado.atual) b.classList.add('atual');
      else if (i < estado.feitos) b.classList.add('feito');
      if (!aberto) { b.classList.add('fechado'); b.innerHTML = CADEADO; b.setAttribute('aria-disabled', 'true'); }
      else b.textContent = d.livre ? '★' : String(i + 1);
      b.setAttribute('aria-label', (d.livre ? 'Desafio livre' : `Desafio ${i + 1}`) + `: ${d.titulo}` + (aberto ? '' : ' (fechado)'));
      b.title = d.titulo;
      b.addEventListener('click', () => mudarDesafio(i));
      nav.appendChild(b);
    });
  }

  // ------------------------------------------------------------ botões
  $('btnAgitar').addEventListener('click', () => { F.audio(); sim.agitar(); });
  $('btnAB').addEventListener('click', () => { F.audio(); entrada('botao:AB', 'ecra'); });
  $('btnLuz').addEventListener('click', e => {
    escuro = !escuro;
    e.currentTarget.setAttribute('aria-pressed', String(escuro));
    e.currentTarget.textContent = escuro ? 'Acender a luz' : 'Apagar a luz';
    document.querySelector('.sim-placa').style.filter = escuro ? 'brightness(0.55)' : '';
  });
  $('btnRecomecar').addEventListener('click', reiniciar);
  $('tutorAjuda').addEventListener('click', () => { tutorUI.recolher(false, false); tutor.pedirAjuda(); });
  $('tutorGambiarra').addEventListener('click', entrarGambiarra);
  $('tutorVoltar').addEventListener('click', () => sairGambiarra(true));
  $('btnFicar').addEventListener('click', () => { $('festa').hidden = true; });
  $('btnSeguinte').addEventListener('click', () => { $('festa').hidden = true; mudarDesafio(estado.atual + 1); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('festa').hidden = true; });

  let confirmar = null;
  $('btnLimparTudo').addEventListener('click', e => {
    const b = e.currentTarget;
    if (!confirmar) {
      b.textContent = 'Carrega outra vez para apagar';
      confirmar = setTimeout(() => { b.textContent = 'Começar de novo'; confirmar = null; }, 3000);
      return;
    }
    clearTimeout(confirmar); confirmar = null;
    b.textContent = 'Começar de novo';
    ws.clear();
  });

  $('btnLigar').addEventListener('click', async () => {
    if (ble.ligado) { ble.desligar(); return; }
    if (!F.MicrobitBLE.disponivel()) {
      $('estado').textContent = 'Para ligar o micro:bit usa o Chrome ou o Edge';
      return;
    }
    try { await ble.ligar(); }
    catch (err) {
      $('estado').classList.remove('ok');
      $('estado').textContent = err && err.name === 'NotFoundError' ? 'micro:bit do ecrã' : 'Não ligou: ' + (err.message || err);
    }
  });

  // ------------------------------------------------ Enviar para o micro:bit (.hex por USB)
  let hexPronto = null;
  const nomeHex = () => (P.hex || P.id) + '-desafio-' + (estado.atual + 1) + '.hex';
  const podeGravar = typeof window.showSaveFilePicker === 'function';
  function estadoEnviar(txt, tipo = '') { const e = $('enviarEstado'); e.textContent = txt; e.className = 'enviar-estado ' + tipo; }
  async function prepararHex() {
    hexPronto = null;
    estadoEnviar('A preparar o programa…');
    $('btnGravar').disabled = $('btnDescarregar').disabled = true;
    try {
      hexPronto = await F.gerarHex(ws);
      estadoEnviar('');
    } catch (err) {
      console.error(err);
      estadoEnviar('Não consegui preparar o programa: ' + (err.message || err), 'erro');
    }
    $('btnGravar').disabled = $('btnDescarregar').disabled = !hexPronto;
  }
  function descarregar() {
    if (!hexPronto) return;
    const url = URL.createObjectURL(new Blob([hexPronto], { type: 'application/octet-stream' }));
    const a = document.createElement('a');
    a.href = url; a.download = nomeHex();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    estadoEnviar('Descarregado! Arrasta o ficheiro ' + nomeHex() + ' para a pasta MICROBIT.', 'ok');
  }
  $('btnGravar').hidden = !podeGravar;
  if (!podeGravar) $('enviarPasso2').innerHTML = 'Carrega em <strong>Descarregar ficheiro</strong> e arrasta-o para a pasta <strong>MICROBIT</strong>.';
  $('btnEnviar').addEventListener('click', () => { $('enviar').hidden = false; prepararHex(); });
  $('btnEnviarFechar').addEventListener('click', () => { $('enviar').hidden = true; });
  $('btnDescarregar').addEventListener('click', descarregar);
  $('btnGravar').addEventListener('click', async () => {
    if (!hexPronto) return;
    try {
      const f = await window.showSaveFilePicker({ suggestedName: nomeHex(), types: [{ description: 'Programa micro:bit', accept: { 'application/octet-stream': ['.hex'] } }] });
      estadoEnviar('A gravar…');
      const w = await f.createWritable();
      await w.write(hexPronto);
      await w.close();
      estadoEnviar('Gravado! Quando a luz amarela parar, o micro:bit já tem o teu programa.', 'ok');
    } catch (err) {
      if (err && err.name === 'AbortError') { estadoEnviar(''); return; }
      console.error(err);
      estadoEnviar('Não deu para gravar assim. Carrega em «Descarregar ficheiro» e arrasta-o para a pasta MICROBIT.', 'erro');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('enviar').hidden = true; });

  mudarDesafio(estado.atual);
  window.addEventListener('resize', () => Blockly.svgResize(ws));
  F.app = { ws, motor, sim, ble, estado, mudarDesafio, registo: () => registo, tutor, tutorUI, entrada, entrarGambiarra, sairGambiarra };
})();
