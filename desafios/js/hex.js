/* Faísca Desafios — do programa de blocos para um ficheiro .hex.
 * Traduz os blocos para MicroPython e mete-o (main.py) dentro do MicroPython oficial
 * do micro:bit V2. Funciona sem internet: o firmware vem em vendor/micropython-v2.js
 * e a biblioteca microbit-fs em vendor/microbit-fs.js.
 *
 *   F.paraPython(ws)        → texto do main.py
 *   F.gerarHex(ws)          → Promise<string> com o .hex pronto a gravar
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  const IMAGENS = {
    Heart: 'HEART', SmallHeart: 'HEART_SMALL', Happy: 'HAPPY', Sad: 'SAD', Surprised: 'SURPRISED',
    Asleep: 'ASLEEP', Silly: 'SILLY', Yes: 'YES', No: 'NO', Ghost: 'GHOST',
  };
  const SONS = ['giggle', 'happy', 'hello', 'mysterious', 'sad', 'slide', 'soaring', 'spring', 'twinkle', 'yawn'];
  const PINOS = { P0: 'pin0', P1: 'pin1', P2: 'pin2' };
  const BATIDA_MS = 500;
  const ESCURO = 40;

  function valor(b, nome, defeito) {
    const v = b.getInputTargetBlock(nome);
    if (!v || !v.isEnabled()) return defeito;
    if (v.type === 'mk_num') return Number(v.getFieldValue('NUM'));
    const x = v.getFieldValue('V');
    return x == null ? defeito : x;
  }
  const inteiro = (x, d) => { const n = Math.round(Number(x)); return Number.isFinite(n) ? n : d; };

  class Gerador {
    constructor(ws) {
      this.ws = ws;
      this.somPino = 'pin0';   // passa a None se o P0 for usado como entrada (piano de fruta)
    }
    condicao(b) {
      const v = b.getInputTargetBlock('C');
      if (!v || !v.isEnabled()) return 'False';
      if (v.type === 'mk_escuro') { this.usaLuz = true; return `display.read_light_level() < ${ESCURO}`; }
      if (v.type === 'mk_botao_premido') return v.getFieldValue('B') === 'B' ? 'button_b.is_pressed()' : 'button_a.is_pressed()';
      return 'False';
    }
    bloco(b, ind) {
      const p = '    '.repeat(ind);
      switch (b.type) {
        case 'mk_icone': return [p + `display.show(Image.${IMAGENS[b.getFieldValue('I')] || 'HAPPY'})`];
        case 'mk_limpar': return [p + 'display.clear()'];
        case 'mk_pausa': return [p + `sleep(${Math.max(0, inteiro(valor(b, 'MS', 100), 100))})`];
        case 'mk_repetir': {
          const n = Math.max(0, Math.min(100, inteiro(valor(b, 'N', 0), 0)));
          return [p + `for _ in range(${n}):`, ...this.corpo(b.getInputTargetBlock('DO'), ind + 1)];
        }
        case 'mk_se':
          return [p + `if ${this.condicao(b)}:`, ...this.corpo(b.getInputTargetBlock('SIM'), ind + 1),
            p + 'else:', ...this.corpo(b.getInputTargetBlock('NAO'), ind + 1)];
        case 'mk_som': {
          const s = String(valor(b, 'S', 'giggle')).toLowerCase();
          return [p + `audio.play(Sound.${(SONS.includes(s) ? s : 'giggle').toUpperCase()}, pin=${this.somPino})`];
        }
        case 'mk_tom': {
          const f = Math.max(0, inteiro(valor(b, 'F', 262), 262));
          const ms = Math.max(1, Math.round(Number(valor(b, 'BAT', 1)) * BATIDA_MS) || BATIDA_MS);
          return [p + `music.pitch(${f}, ${ms}, pin=${this.somPino})`];
        }
        case 'mk_digital': {
          const pino = PINOS[valor(b, 'P', 'P2')] || 'pin2';
          return [p + `${pino}.write_digital(${Number(valor(b, 'V', 0)) ? 1 : 0})`];
        }
      }
      return [];
    }
    corpo(b, ind) {
      const out = [];
      for (; b; b = b.getNextBlock()) if (b.isEnabled()) out.push(...this.bloco(b, ind));
      return out.length ? out : ['    '.repeat(ind) + 'pass'];
    }
    gerar() {
      const ev = { agitar: [], logo: [], A: [], B: [], AB: [], P0: [], P1: [], sempre: [] };
      for (const top of this.ws.getTopBlocks(true)) {
        if (!top.isEnabled()) continue;
        const corpo = top.getInputTargetBlock('DO');
        switch (top.type) {
          case 'mk_agitar': ev.agitar.push(corpo); break;
          case 'mk_logo': ev.logo.push(corpo); break;
          case 'mk_botao': ev[top.getFieldValue('B')]?.push(corpo); break;
          case 'mk_pino_tocado': ev[top.getFieldValue('P')]?.push(corpo); break;
          case 'mk_sempre': ev.sempre.push(corpo); break;
        }
      }
      if (ev.P0.length) this.somPino = 'None';  // o som não pode sair pelo pino que estamos a ler

      const L = ['# Feito na Faísca Desafios', 'from microbit import *', 'import music', ''];
      const funcoes = [];
      for (const [k, lista] of Object.entries(ev)) {
        lista.forEach((corpo, i) => {
          const nome = `quando_${k.toLowerCase()}_${i + 1}`;
          funcoes.push([k, nome]);
          L.push(`def ${nome}():`, ...this.corpo(corpo, 1), '');
        });
      }
      const chamar = (k, ind) => funcoes.filter(f => f[0] === k).map(f => '    '.repeat(ind) + f[1] + '()');
      const tem = k => ev[k].length > 0;

      if (this.usaLuz) L.push('display.read_light_level()  # o primeiro valor vem sempre a 0');
      L.push('a_antes = b_antes = ab_ativo = False',
        'logo_antes = p0_antes = p1_antes = False', '', 'while True:');
      if (tem('agitar')) L.push("    if accelerometer.was_gesture('shake'):", ...chamar('agitar', 2));
      if (tem('logo')) L.push('    t = pin_logo.is_touched()', '    if t and not logo_antes:', ...chamar('logo', 2), '    logo_antes = t');
      if (tem('A') || tem('B') || tem('AB')) {
        // como no MakeCode: A e B contam ao largar; A+B conta quando os dois estão carregados
        L.push('    a = button_a.is_pressed()', '    b = button_b.is_pressed()',
          '    if a and b and not ab_ativo:', '        ab_ativo = True', ...(tem('AB') ? chamar('AB', 2) : []),
          '    if ab_ativo:', '        if not a and not b:', '            ab_ativo = False',
          '    else:',
          '        if a_antes and not a:', ...(tem('A') ? chamar('A', 3) : ['            pass']),
          '        if b_antes and not b:', ...(tem('B') ? chamar('B', 3) : ['            pass']),
          '    a_antes = a', '    b_antes = b');
      }
      for (const [k, pino, antes] of [['P0', 'pin0', 'p0_antes'], ['P1', 'pin1', 'p1_antes']]) {
        if (tem(k)) L.push(`    t = ${pino}.is_touched()`, `    if t and not ${antes}:`, ...chamar(k, 2), `    ${antes} = t`);
      }
      L.push(...chamar('sempre', 1), '    sleep(20)', '');
      return L.join('\n');
    }
  }

  F.paraPython = ws => new Gerador(ws).gerar();

  // ------------------------------------------------------------- firmware
  function carregarScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = () => rej(new Error('Não encontrei ' + src));
      document.head.appendChild(s);
    });
  }
  let pronto = null;
  function carregar() {
    if (!pronto) {
      pronto = Promise.all([
        window.MicrobitFs ? 0 : carregarScript('vendor/microbit-fs.js'),
        window.FAISCA_MICROPYTHON ? 0 : carregarScript('vendor/micropython-v2.js'),
      ]).catch(e => { pronto = null; throw e; });
    }
    return pronto;
  }

  F.gerarHex = async function (ws) {
    await carregar();
    const fs = new window.MicrobitFs.MicropythonFsHex(window.FAISCA_MICROPYTHON);
    fs.write('main.py', F.paraPython(ws));
    return fs.getIntelHex();
  };
  F.prepararHex = carregar;
})();
