/* Faísca Desafios — cola tudo: desafios, editor, micro:bit do ecrã e o verdadeiro. */
(function () {
  'use strict';
  const F = window.Faisca;
  const $ = id => document.getElementById(id);
  const CHAVE = 'faisca.desafios.v1';
  const params = new URLSearchParams(location.search);

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
    $('btnLigar').textContent = e === 'ligado' ? 'Desligar' : 'Ligar micro:bit';
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

  // ------------------------------------------------------------ Gabi
  const gabiUI = new F.GabiUI();
  const gabi = new F.GabiMotor(m => gabiUI.mostrar(m));
  let gambiarra = null;      // { xml } do programa da criança enquanto ajuda a Gabi
  let sucessoEm = -Infinity;
  let falha = null;
  const analisar = () => gabi.programaMudou(F.gabiAnalisar(ws));
  setInterval(() => gabi.tick(), 1000);
  setInterval(() => verificar(), 400);   // algumas validações dependem do tempo que um desenho fica visível

  function entrada(k, origem) {
    if (k === 'agitar' && origem === 'microbit') { sim.svg.classList.remove('a-agitar'); void sim.svg.getBBox(); sim.svg.classList.add('a-agitar'); }
    motor.acontecimento(k);
    // A Gabi espera que o programa corra antes de concluir que o teste falhou
    gabi.testou();
    const t0 = performance.now();
    clearTimeout(falha);
    falha = setTimeout(() => { if (sucessoEm < t0) gabi.testeFalhou(); }, 4000);
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
        const [e, t] = F.GABI.GERAIS.gambiarraObrigada;
        gabiUI.mostrar({ estado: e, texto: t, tipo: 'sucesso', pedida: true });
        return;
      }
      const s = gabi.sucesso();
      if (estado.feitos <= estado.atual) { estado.feitos = estado.atual + 1; gravar(); }
      desenharCaminho();
      atualizarBotoesGabi();
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
    gabi.entrarDesafio(n, n < estado.feitos);
    analisar();
    atualizarBotoesGabi();
  }

  // ------------------------------------------------------------ a Gabi também erra
  function carregar(xml) {
    ws.clear();
    try { Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws); } catch (e) { console.warn(e); }
  }
  function atualizarBotoesGabi() {
    const g = F.GABI.DESAFIOS[estado.atual] && F.GABI.DESAFIOS[estado.atual].gambiarra;
    $('gabiGambiarra').hidden = !(g && estado.atual < estado.feitos && !gambiarra);
    $('gabiVoltar').hidden = !gambiarra;
  }
  function entrarGambiarra() {
    const g = F.GABI.DESAFIOS[estado.atual].gambiarra;
    gambiarra = { xml: estado.xml };
    festejado = -1;
    carregar(g.xml);
    gabi.reset(); gabi.n = estado.atual;
    gabiUI.mostrar({ estado: 'surpreendida', texto: g.pedido, tipo: 'gambiarra' });
    atualizarBotoesGabi();
  }
  function sairGambiarra(avisar = true) {
    const xml = gambiarra.xml;
    gambiarra = null;
    carregar(xml || '<xml></xml>');
    festejado = estado.atual;
    if (avisar) gabiUI.mostrar({ estado: 'incentivar', texto: 'De volta ao teu programa. Obrigada pela ajuda!', tipo: 'info' });
    atualizarBotoesGabi();
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
  $('gabiAjuda').addEventListener('click', () => { gabiUI.recolher(false, false); gabi.pedirAjuda(); });
  $('gabiGambiarra').addEventListener('click', entrarGambiarra);
  $('gabiVoltar').addEventListener('click', () => sairGambiarra(true));
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

  mudarDesafio(estado.atual);
  window.addEventListener('resize', () => Blockly.svgResize(ws));
  F.app = { ws, motor, sim, ble, estado, mudarDesafio, registo: () => registo, gabi, gabiUI, entrada, entrarGambiarra, sairGambiarra };
})();
