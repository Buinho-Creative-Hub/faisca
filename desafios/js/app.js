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

  function entrada(k, origem) {
    if (k === 'agitar' && origem === 'microbit') { sim.svg.classList.remove('a-agitar'); void sim.svg.getBBox(); sim.svg.classList.add('a-agitar'); }
    motor.acontecimento(k);
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
      estado.xml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(ws));
      gravar();
      reiniciar();
    }, 250);
  });

  // ------------------------------------------------------------ desafios
  let festejado = -1;
  function verificar() {
    const d = F.DESAFIOS[estado.atual];
    if (d.livre || festejado === estado.atual) return;
    if (d.ok(registo)) {
      festejado = estado.atual;
      if (estado.feitos <= estado.atual) { estado.feitos = estado.atual + 1; gravar(); }
      desenharCaminho();
      setTimeout(festa, 900);
    }
  }

  function festa() {
    const n = estado.atual;
    const seguinte = F.DESAFIOS[n + 1];
    $('festaTitulo').textContent = 'Conseguiste!';
    $('festaTexto').textContent = !seguinte ? 'Fizeste todos os desafios.'
      : seguinte.livre ? `Fizeste os ${n + 1} desafios! Agora tens todos os blocos para inventar.`
      : `«${F.DESAFIOS[n].titulo}» está feito. No próximo desafio aparecem blocos novos.`;
    $('btnSeguinte').hidden = !seguinte;
    $('btnSeguinte').textContent = !seguinte ? '' : seguinte.livre ? 'Inventar o meu brinquedo' : `Desafio ${n + 2}: ${seguinte.titulo}`;
    $('festa').hidden = false;
    (seguinte ? $('btnSeguinte') : $('btnFicar')).focus();
  }

  function mudarDesafio(n) {
    if (!desbloqueado(n)) return;
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
  F.app = { ws, motor, sim, ble, estado, mudarDesafio, registo: () => registo };
})();
