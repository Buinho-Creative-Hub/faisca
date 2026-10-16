/* Faísca Desafios — os desafios. Cada um traz blocos novos para a caixa.
 * Para criar outro desafio basta acrescentar um objecto a esta lista.
 */
(function () {
  'use strict';
  const F = window.Faisca;

  // Blocos tal como aparecem na caixa (com as pílulas de valor já postas)
  const XML = {
    mk_agitar: '<block type="mk_agitar"></block>',
    mk_logo: '<block type="mk_logo"></block>',
    mk_botao: '<block type="mk_botao"></block>',
    mk_botao_B: '<block type="mk_botao"><field name="B">B</field></block>',
    mk_botao_AB: '<block type="mk_botao"><field name="B">AB</field></block>',
    mk_pino_tocado: '<block type="mk_pino_tocado"></block>',
    mk_sempre: '<block type="mk_sempre"></block>',
    mk_icone: '<block type="mk_icone"><field name="I">Happy</field></block>',
    mk_icone_coracao: '<block type="mk_icone"><field name="I">Heart</field></block>',
    mk_icone_pequeno: '<block type="mk_icone"><field name="I">SmallHeart</field></block>',
    mk_icone_triste: '<block type="mk_icone"><field name="I">Sad</field></block>',
    mk_limpar: '<block type="mk_limpar"></block>',
    mk_pausa: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block>',
    mk_repetir: '<block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value></block>',
    mk_se: '<block type="mk_se"><value name="C"><block type="mk_escuro"></block></value></block>',
    mk_escuro: '<block type="mk_escuro"></block>',
    mk_botao_premido: '<block type="mk_botao_premido"></block>',
    mk_som: '<block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value></block>',
    mk_tom: '<block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value></block>',
    mk_digital_1: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    mk_digital_0: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
  };

  // ---------------------------------------------------- verificação
  // registo: [{t, dir:'in'|'out', v}]. «depois(in, saída)» procura uma saída
  // que aconteça até 8 s depois de uma entrada.
  function depois(reg, entrada, teste, janela = 8000) {
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || e.v !== entrada) continue;
      const seguintes = [];
      for (let j = i + 1; j < reg.length && reg[j].t - e.t <= janela; j++) if (reg[j].dir === 'out') seguintes.push(reg[j].v);
      if (teste(seguintes)) return true;
    }
    return false;
  }
  const conta = (l, v) => l.filter(x => x === v).length;

  const DESAFIOS = [
    {
      titulo: 'Acorda-o',
      missao: 'Faz o micro:bit sorrir quando o agitas.',
      passos: ['Arrasta o bloco «em agitar».', 'Põe lá dentro «mostrar ícone» com a cara contente.', 'Experimenta: carrega em AGITAR.'],
      material: 'micro:bit',
      novos: ['mk_agitar', 'mk_icone'],
      teste: 'agitar',
      ok: r => depois(r, 'agitar', s => s.includes('icone:Happy')),
    },
    {
      titulo: 'Coração a bater',
      missao: 'Quando tocas no logótipo, o coração bate 4 vezes.',
      passos: ['O logotipo é o desenho dourado lá em cima.', 'Dentro de «repetir 4 vezes»: coração, pausa, coração pequeno, pausa.', 'Experimenta: toca no logótipo.'],
      material: 'micro:bit V2',
      novos: ['mk_logo', 'mk_repetir', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa'],
      teste: 'logo',
      ok: r => depois(r, 'logo', s => conta(s, 'icone:Heart') >= 4 && conta(s, 'icone:SmallHeart') >= 4, 15000),
    },
    {
      titulo: 'Sim ou não?',
      missao: 'Botão A: cara contente. Botão B: cara triste.',
      passos: ['Usa dois blocos «no botão premido».', 'No segundo, muda a letra para B.', 'Experimenta os dois botões.'],
      material: 'micro:bit',
      novos: ['mk_botao', 'mk_botao_B', 'mk_icone_triste'],
      teste: 'botao:A',
      ok: r => depois(r, 'botao:A', s => s.includes('icone:Happy')) && depois(r, 'botao:B', s => s.includes('icone:Sad')),
    },
    {
      titulo: 'Faz barulho',
      missao: 'Carrega no A e no B ao mesmo tempo e o micro:bit ri-se.',
      passos: ['Usa «no botão A+B premido».', 'Põe lá dentro «tocar som».', 'Escolhe o som que quiseres.'],
      material: 'micro:bit V2 (altifalante)',
      novos: ['mk_botao_AB', 'mk_som'],
      teste: 'botao:AB',
      ok: r => depois(r, 'botao:AB', s => s.some(x => x.startsWith('som:'))),
    },
    {
      titulo: 'Piano de fruta',
      missao: 'Toca numa banana e o micro:bit toca uma nota.',
      passos: ['Crocodilo do pin 1 à banana (ou a papel de alumínio).', 'Outro crocodilo no GND, seguro na mão.', 'Usa «no pin P1 premido» com «tocar tom».'],
      material: '2 crocodilos + uma fruta',
      novos: ['mk_pino_tocado', 'mk_tom'],
      teste: 'pino:P1',
      ok: r => depois(r, 'pino:P1', s => s.some(x => x.startsWith('tom:'))),
    },
    {
      titulo: 'Luz de fora',
      missao: 'Quando a banana toca, acende-se uma luz de fora.',
      passos: ['LED com crocodilos: perna comprida no pin 2, perna curta no GND.', '«gravação digital pin P2 para 1» antes da nota, «para 0» depois.', 'Experimenta: toca no pin 1.'],
      material: 'LED + 2 crocodilos',
      novos: ['mk_digital_1', 'mk_digital_0'],
      teste: 'pino:P1',
      ok: r => depois(r, 'pino:P1', s => {
        const a = s.indexOf('digital:P2:1');
        const n = s.findIndex((x, i) => i > a && x.startsWith('tom:'));
        return a >= 0 && n > a && s.indexOf('digital:P2:0', n) > n;
      }),
    },
    {
      titulo: 'Inventa',
      missao: 'Agora é contigo: inventa o teu brinquedo.',
      passos: ['Tens todos os blocos, mais «para sempre» e «se… então… senão».', 'Experimenta «se está escuro»: no ecrã, carrega em APAGAR A LUZ.'],
      material: 'o que tiveres',
      novos: ['mk_sempre', 'mk_se', 'mk_escuro', 'mk_botao_premido', 'mk_limpar'],
      livre: true,
      ok: () => false,
    },
  ];

  // Caixa de blocos de um desafio: os blocos de todos os desafios até ele
  function caixa(n) {
    const tipos = [];
    for (let i = 0; i <= n; i++) for (const k of DESAFIOS[i].novos) if (!tipos.includes(k)) tipos.push(k);
    const novos = new Set(DESAFIOS[n].novos);
    // os novos primeiro, com um separador maior, para se verem logo
    const ordem = [...tipos.filter(t => novos.has(t)), ...tipos.filter(t => !novos.has(t))];
    let xml = '<xml>';
    ordem.forEach((t, i) => {
      xml += XML[t];
      if (i === DESAFIOS[n].novos.length - 1 && ordem.length > novos.size) xml += '<sep gap="40"></sep><label text="Blocos que já conheces"></label>';
    });
    return xml + '</xml>';
  }

  F.DESAFIOS = DESAFIOS;
  F.caixa = caixa;
})();
