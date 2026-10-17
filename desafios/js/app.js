/* Faísca Desafios — cola tudo: mascote + missão escolhidas, editor, micro:bit do ecrã e o verdadeiro. */
(function () {
  'use strict';
  const F = window.Faisca;
  const $ = id => document.getElementById(id);

  // Sem missão escolhida: ecrã inicial (inicio.js) e mais nada
  if (!F.MISSAO_ID || !F.MISSOES[F.MISSAO_ID]) { F.mostrarInicio(); return; }
  F.ativar(F.MASCOTE_ID, F.MISSAO_ID);
  const M = F.MASCOTE, X = F.MISSAO;
  F.lembrarMascote(M.id);
  document.documentElement.setAttribute('data-mascote', M.id);
  const CHAVE = F.chaveMissao(X);
  const params = new URLSearchParams(location.search);
  const N = F.DESAFIOS.length;
  const contaveis = F.DESAFIOS.filter(d => !d.livre).length;

  // ------------------------------------------------------------ marca e mascote
  document.title = M.marca.nome + ' · ' + X.titulo;
  $('marcaIcone').innerHTML = M.marca.icone || '';     // conteúdo da própria mascote, não da criança
  $('marcaNome').textContent = M.marca.nome;
  $('marcaSub').textContent = X.titulo;
  $('btnMissoes').href = 'index.html?a=' + encodeURIComponent(M.id);
  $('tutor').setAttribute('aria-label', M.descricao);
  $('tutorNome').textContent = M.nome;
  $('tutorGambiarra').textContent = 'Ajudar ' + M.artigo + ' ' + M.nome;

  // ------------------------------------------------------------ estado guardado
  function ler() { try { return JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { return {}; } }
  function gravar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* sem armazenamento: segue */ } }
  const estado = Object.assign({ feitos: 0, atual: 0, xml: '' }, ler());
  if (params.has('todos')) estado.feitos = Math.max(estado.feitos, N - 1);   // modo professor
  const desbloqueado = i => i <= Math.min(estado.feitos, N - 1);
  if (estado.atual >= N) estado.atual = N - 1;
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
  let silencio = true;      // carregar programas não faz barulho; só os gestos da criança
  if (estado.xml) {
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(estado.xml), ws); } catch (e) { console.warn(e); }
  }
  setTimeout(() => { silencio = false; }, 0);

  // ------------------------------------------------------------ sons do editor (como no MakeCode/Scratch)
  let ultimoSom = 0;
  const somEditor = nome => { const t = performance.now(); if (t - ultimoSom > 80) { ultimoSom = t; F.Som.tocar(nome); } };
  ws.addChangeListener(ev => {
    if (silencio || ev.isUiEvent) return;
    const E = Blockly.Events;
    if (ev.type === E.BLOCK_MOVE && ev.newParentId && ev.newParentId !== ev.oldParentId) somEditor('encaixe');
    else if (ev.type === E.BLOCK_CREATE) somEditor('apanhar');
    else if (ev.type === E.BLOCK_DELETE) somEditor('apagar');
  });

  // ------------------------------------------------------------ micro:bit do ecrã
  const sim = new F.Sim($('sim'), k => entrada(k, 'ecra'));
  let escuro = false;
  const noEcra = {
    principal: true,
    icone: n => sim.icone(n),
    limpar: () => sim.limpar(),
    tocarSom: n => { F.Som.abafar(900); sim.tocarSom(n); },
    tom: (f, ms) => { F.Som.abafar(ms); sim.tom(f, ms); },
    digital: (p, v) => sim.digital(p, v),
    estaEscuro: () => escuro,
    botoes: sim.botoes,
  };

  // ------------------------------------------------------------ micro:bit verdadeiro
  const ble = new F.MicrobitBLE(k => entrada(k, 'microbit'), (e, nome) => {
    const el = $('estado');
    el.classList.toggle('ok', e === 'ligado'); el.classList.remove('aviso');
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
  const tutorUI = new F.TutorUI(M);
  const tutor = new F.TutorMotor(m => { tutorUI.mostrar(m); F.Som.tocar(m.tipo === 'pista' ? 'ajuda' : 'voz'); });
  $('festaMascote').src = tutorUI.sprite('celebrar');
  $('festaMascote').alt = M.nome + ' a celebrar';
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
        F.Som.tocar('sucesso');
        tutorUI.mostrar({ estado: e, texto: F.voz(t), tipo: 'sucesso', pedida: true });
        return;
      }
      const s = tutor.sucesso();
      if (estado.feitos <= estado.atual) { estado.feitos = estado.atual + 1; gravar(); }
      desenharCaminho();
      atualizarBotoesTutor();
      F.Som.tocar('sucesso');
      setTimeout(() => festa(s), 900);
    }
  }

  function festa(s) {
    const n = estado.atual;
    const atual = F.DESAFIOS[n];
    const seguinte = F.DESAFIOS[n + 1];
    const novoNivel = seguinte && seguinte.nivel !== atual.nivel && !seguinte.livre;
    $('festaTitulo').textContent = !seguinte ? 'Missão cumprida!' : novoNivel ? 'Nível desbloqueado!' : 'Conseguiste!';
    let texto = (s && s.texto) ? s.texto : `«${atual.titulo}» está feito. No próximo desafio aparecem blocos novos.`;
    if (novoNivel) texto += ` Abriste o ${seguinte.nivelNome}.`;
    if (!seguinte) texto += ' ' + F.voz(F.TUTOR.GERAIS.fimMissao[1]);
    $('festaTexto').textContent = texto;
    $('festaExtra').hidden = !(s && s.extensao);
    $('festaExtra').textContent = s && s.extensao ? 'Desafio extra: ' + s.extensao : '';
    $('btnSeguinte').textContent = !seguinte ? 'Escolher outra missão' : seguinte.livre ? 'Inventar a minha engenhoca' : `Desafio ${n + 2}: ${seguinte.titulo}`;
    $('festa').hidden = false;
    if (novoNivel || !seguinte) setTimeout(() => F.Som.tocar('nivel'), 700);
    $('btnSeguinte').focus();
  }

  function mudarDesafio(n) {
    if (!desbloqueado(n)) return;
    if (gambiarra) sairGambiarra(false);
    estado.atual = n;
    festejado = -1;
    gravar();
    const d = F.DESAFIOS[n];
    $('missaoNum').textContent = d.livre ? 'Desafio livre' : `${d.nivelNome} · desafio ${n + 1} de ${contaveis}`;
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
    silencio = true;
    ws.clear();
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws); } catch (e) { console.warn(e); }
    setTimeout(() => { silencio = false; }, 0);
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
    tutorUI.mostrar({ estado: 'surpreendida', texto: F.voz(g.pedido), tipo: 'gambiarra' });
    F.Som.tocar('voz');
    atualizarBotoesTutor();
  }
  function sairGambiarra(avisar = true) {
    const xml = gambiarra.xml;
    gambiarra = null;
    carregar(xml || '<xml></xml>');
    festejado = estado.atual;
    if (avisar) { const [e, t] = F.TUTOR.GERAIS.voltarPrograma; tutorUI.mostrar({ estado: e, texto: F.voz(t), tipo: 'info' }); }
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
      if (i > 0 && d.nivel !== F.DESAFIOS[i - 1].nivel) b.classList.add('novo-nivel');   // separador entre níveis
      b.setAttribute('aria-label', (d.livre ? 'Desafio livre' : `Desafio ${i + 1}`) + `: ${d.titulo}` + (aberto ? '' : ' (fechado)'));
      b.title = d.nivelNome + ' — ' + d.titulo;
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
  $('btnSeguinte').addEventListener('click', () => {
    $('festa').hidden = true;
    if (estado.atual + 1 >= N) { location.href = $('btnMissoes').href; return; }
    mudarDesafio(estado.atual + 1);
  });
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
      $('estado').classList.add('aviso');
      $('estado').textContent = 'Para ligar o micro:bit usa o Chrome ou o Edge';
      return;
    }
    try { await ble.ligar(); }
    catch (err) {
      $('estado').classList.remove('ok');
      $('estado').classList.toggle('aviso', !(err && err.name === 'NotFoundError'));
      $('estado').textContent = err && err.name === 'NotFoundError' ? 'micro:bit do ecrã' : 'Não ligou: ' + (err.message || err);
    }
  });

  // ------------------------------------------------ Enviar para o micro:bit (.hex por USB)
  let hexPronto = null;
  const nomeHex = () => (X.hex || X.id) + '-desafio-' + (estado.atual + 1) + '.hex';
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
    estadoEnviar('Descarregado! Agora arrasta o ficheiro ' + nomeHex() + ' da pasta Transferências para a pasta MICROBIT e espera que a luz amarela pare de piscar.', 'ok');
  }
  $('btnGravar').hidden = !podeGravar;
  if (!podeGravar) {
    // Firefox/Safari: o browser não deixa gravar diretamente na pasta MICROBIT → descarregar e arrastar, passo a passo
    $('enviarPasso2').innerHTML = 'Carrega em <strong>Descarregar ficheiro</strong>. O programa vai para a pasta <strong>Transferências</strong>.';
    $('enviarPasso3').hidden = false;
    $('enviarNota').hidden = false;
    $('btnDescarregar').classList.replace('btn-claro', 'btn-escuro');
  }
  $('btnEnviar').addEventListener('click', () => { $('enviar').hidden = false; prepararHex(); });
  $('btnEnviarFechar').addEventListener('click', () => { $('enviar').hidden = true; });
  $('btnDescarregar').addEventListener('click', descarregar);
  $('btnGravar').addEventListener('click', async () => {
    if (!hexPronto) return;
    try {
      const f = await window.showSaveFilePicker({ suggestedName: nomeHex(), types: [{ description: 'Programa micro:bit', accept: { 'application/octet-stream': ['.hex'] } }] });
      estadoEnviar('A gravar… a luz amarela do micro:bit vai piscar.');
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
