/* Faísca Desafios — blocos com o aspecto do MakeCode.
 *
 * O MakeCode desenha os blocos com um renderer derivado do «zelos» do Blockly
 * (mesmo entalhe, cantos de 4 px, linhas de 48 px, campos-pílula de 32 px).
 * Aqui partimos do zelos e aplicamos o que o distingue, medido no renderizador
 * oficial (makecode.microbit.org, Out 2026): fonte monoespaçada 16 px peso 600,
 * cores das gavetas, números em pílula branca com contorno #bfbfbf.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- renderer
  const MONO = 'Consolas, Monaco, Menlo, "Ubuntu Mono", source-code-pro, monospace';

  class MkConstants extends Blockly.zelos.ConstantProvider {
    constructor() {
      super();
      this.FIELD_TEXT_FONTFAMILY = MONO;
      this.FIELD_TEXT_FONTWEIGHT = '600';
      this.FIELD_TEXT_FONTSIZE = 12; // pt → 16 px, como no MakeCode
    }
  }
  class MkRenderer extends Blockly.zelos.Renderer {
    makeConstants_() { return new MkConstants(); }
  }
  Blockly.blockRendering.register('makecode', MkRenderer);

  // ------------------------------------------------------------------ cores
  // Cores das gavetas do MakeCode (pxt-microbit). Secundária = campos-menu;
  // terciária = contorno.
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * k));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  const GAVETAS = {
    basico:   '#1e90ff',
    entrada:  '#d400d4',
    musica:   '#e63022',
    ciclos:   '#00aa00',
    logica:   '#00a4a6',
    pinos:    '#b22222',
  };
  const blockStyles = {};
  for (const [nome, cor] of Object.entries(GAVETAS)) {
    blockStyles[nome] = { colourPrimary: cor, colourSecondary: shade(cor, 0.85), colourTertiary: shade(cor, 0.75) };
  }
  // Números e valores: pílula branca com contorno cinzento (sombra no MakeCode)
  blockStyles.valor = { colourPrimary: '#ffffff', colourSecondary: '#ffffff', colourTertiary: '#bfbfbf' };

  Blockly.Theme.defineTheme('makecode', {
    name: 'makecode',
    base: Blockly.Themes.Classic,
    blockStyles,
    componentStyles: {
      workspaceBackgroundColour: '#ecf0f1',
      flyoutBackgroundColour: '#ffffff',
      flyoutOpacity: 1,
      scrollbarColour: '#c8cdd2',
      scrollbarOpacity: 0.9,
    },
    fontStyle: { family: MONO, weight: '600', size: 12 },
    startHats: false,
  });

  // ------------------------------------------------------------------ ícones
  const ICONES = {
    Heart:      ['.#.#.', '#####', '#####', '.###.', '..#..'],
    SmallHeart: ['.....', '.#.#.', '.###.', '..#..', '.....'],
    Happy:      ['.....', '.#.#.', '.....', '#...#', '.###.'],
    Sad:        ['.....', '.#.#.', '.....', '.###.', '#...#'],
    Surprised:  ['.#.#.', '.....', '..#..', '.#.#.', '..#..'],
    Asleep:     ['.....', '##.##', '.....', '.###.', '.....'],
    Silly:      ['#...#', '.....', '#####', '...##', '...##'],
    Yes:        ['.....', '....#', '...#.', '#.#..', '.#...'],
    No:         ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    Ghost:      ['#####', '#.#.#', '#####', '#####', '#.#.#'],
  };
  const NOMES_ICONES = {
    Heart: 'coração', SmallHeart: 'coração pequeno', Happy: 'contente', Sad: 'triste',
    Surprised: 'surpreendido', Asleep: 'a dormir', Silly: 'pateta', Yes: 'sim', No: 'não', Ghost: 'fantasma',
  };
  function iconeSvg(nome) {
    const g = ICONES[nome];
    let r = '';
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      const on = g[y][x] === '#';
      r += `<rect x="${x * 6}" y="${y * 6}" width="5" height="5" rx="1" fill="${on ? '#ffffff' : '#000000'}" fill-opacity="${on ? 1 : 0.22}"/>`;
    }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29">${r}</svg>`);
  }
  const opcoesIcones = Object.keys(ICONES).map(k => [{ src: iconeSvg(k), width: 24, height: 24, alt: NOMES_ICONES[k] }, k]);

  // ------------------------------------------------------------------ sons e notas
  const SONS = [['riso', 'giggle'], ['feliz', 'happy'], ['olá', 'hello'], ['mistério', 'mysterious'],
    ['triste', 'sad'], ['escorregar', 'slide'], ['voar', 'soaring'], ['mola', 'spring'], ['brilho', 'twinkle'], ['bocejo', 'yawn']];
  const NOTAS = [['Dó', '262'], ['Ré', '294'], ['Mi', '330'], ['Fá', '349'], ['Sol', '392'], ['Lá', '440'], ['Si', '494'], ['Dó alto', '523']];

  // ------------------------------------------------------------------ blocos
  const num = (nome) => ({ type: 'input_value', name: nome, check: 'Number' });
  const menu = (nome) => ({ type: 'input_value', name: nome });
  const PAUSAS = [['100', '100'], ['200', '200'], ['300', '300'], ['500', '500'], ['1000', '1000'], ['2000', '2000']];
  const BATIDAS = [['1', '1'], ['1/2', '0.5'], ['1/4', '0.25'], ['2', '2'], ['4', '4']];

  Blockly.defineBlocksWithJsonArray([
    // Eventos (gaveta Entrada)
    { type: 'mk_agitar', message0: 'em agitar', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando abanas o micro:bit.' },
    { type: 'mk_logo', message0: 'ao logotipo pressionado', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando tocas no logótipo dourado.' },
    { type: 'mk_botao', message0: 'no botão %1 premido', args0: [{ type: 'field_dropdown', name: 'B', options: [['A', 'A'], ['B', 'B'], ['A+B', 'AB']] }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando carregas no botão.' },
    { type: 'mk_pino_tocado', message0: 'no pin %1 premido', args0: [{ type: 'field_dropdown', name: 'P', options: [['P1', 'P1'], ['P0', 'P0']] }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando fechas o circuito entre o pin e o GND.' },
    { type: 'mk_sempre', message0: 'para sempre', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'basico', tooltip: 'Repete sem parar.' },

    // Básico
    { type: 'mk_icone', message0: 'mostrar ícone %1', args0: [{ type: 'field_dropdown', name: 'I', options: opcoesIcones }],
      previousStatement: null, nextStatement: null, style: 'basico', tooltip: 'Desenha um ícone no ecrã de luzes.' },
    { type: 'mk_limpar', message0: 'limpar ecrã', previousStatement: null, nextStatement: null, style: 'basico' },
    { type: 'mk_pausa', message0: 'pausa (ms) %1', args0: [menu('MS')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'basico', tooltip: 'Espera. 1000 ms = 1 segundo.' },

    // Ciclos e lógica
    { type: 'mk_repetir', message0: 'repetir %1 vezes', args0: [num('N')], message1: 'fazer %1', args1: [{ type: 'input_statement', name: 'DO' }],
      inputsInline: true, previousStatement: null, nextStatement: null, style: 'ciclos', tooltip: 'Faz o que está dentro várias vezes.' },
    { type: 'mk_se', message0: 'se %1 então', args0: [{ type: 'input_value', name: 'C', check: 'Boolean' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'SIM' }], message2: 'senão', message3: '%1', args3: [{ type: 'input_statement', name: 'NAO' }],
      previousStatement: null, nextStatement: null, style: 'logica' },
    { type: 'mk_escuro', message0: 'está escuro', output: 'Boolean', style: 'entrada', tooltip: 'Verdadeiro quando há pouca luz.' },
    { type: 'mk_botao_premido', message0: 'botão %1 premido', args0: [{ type: 'field_dropdown', name: 'B', options: [['A', 'A'], ['B', 'B']] }], output: 'Boolean', style: 'entrada' },

    // Música
    { type: 'mk_som', message0: 'tocar som %1', args0: [menu('S')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'musica', tooltip: 'Toca um som do micro:bit.' },
    { type: 'mk_tom', message0: 'tocar tom %1 por %2 batida', args0: [menu('F'), menu('BAT')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'musica', tooltip: 'Toca uma nota.' },

    // Pinos
    { type: 'mk_digital', message0: 'gravação digital pin %1 para %2', args0: [menu('P'), num('V')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'pinos', tooltip: '1 liga, 0 desliga.' },

    // Valores em pílula (sombras, como no MakeCode)
    { type: 'mk_num', message0: '%1', args0: [{ type: 'field_number', name: 'NUM', value: 0 }], output: 'Number', style: 'valor' },
    { type: 'mk_pausa_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: PAUSAS }], output: 'Number', style: 'valor' },
    { type: 'mk_nota_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: NOTAS }], output: 'Number', style: 'valor' },
    { type: 'mk_batida_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: BATIDAS }], output: 'Number', style: 'musica' },
    { type: 'mk_som_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: SONS }], output: null, style: 'musica' },
    { type: 'mk_pino_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: [['P2', 'P2'], ['P0', 'P0'], ['P1', 'P1']] }], output: null, style: 'pinos' },
  ]);

  window.Faisca = window.Faisca || {};
  Object.assign(window.Faisca, { ICONES, NOMES_ICONES, SONS, NOTAS, GAVETAS, iconeSvg });
})();
