/* Faísca Desafios — base dos desafios (comum a todos os pacotes).
 * Os desafios em si vivem nos pacotes (pacotes/<id>.js), que os registam com
 * Faisca.registarPacote({...}). Aqui ficam os blocos da caixa, as ajudas de
 * verificação por comportamento e a montagem da caixa de cada desafio.
 */
(function () {
  'use strict';
  const F = window.Faisca;

  // Blocos tal como aparecem na caixa (com as pílulas de valor já postas)
  const XML = F.XML_CAIXA = {
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
    mk_icone_sim: '<block type="mk_icone"><field name="I">Yes</field></block>',
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

  // Quantas vezes um ícone ficou VISÍVEL (pelo menos minMs) depois de uma entrada.
  // Valida o comportamento, não a presença dos blocos.
  function visiveis(reg, entrada, nome, minMs = 120, janela = 15000) {
    let melhor = 0;
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || e.v !== entrada) continue;
      const ics = [];
      for (let j = i + 1; j < reg.length && reg[j].t - e.t <= janela; j++) {
        if (reg[j].dir === 'out' && (reg[j].v.startsWith('icone:') || reg[j].v === 'limpar')) ics.push(reg[j]);
      }
      let n = 0;
      ics.forEach((x, k) => {
        const fim = k + 1 < ics.length ? ics[k + 1].t : performance.now();
        if (x.v === 'icone:' + nome && fim - x.t >= minMs) n++;
      });
      melhor = Math.max(melhor, n);
    }
    return melhor;
  }
  const algumPino = (reg, teste) => ['pino:P0', 'pino:P1', 'pino:P2'].some(p => depois(reg, p, teste));

  // Como «depois», mas só conta as saídas até à entrada seguinte: a saída tem de ter
  // sido causada por ESTA entrada (ex.: tocar no pino), não por outra logo a seguir (agitar).
  function causou(reg, teste, entradaOk, janela = 8000) {
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || !entradaOk(e.v)) continue;
      const seguintes = [];
      for (let j = i + 1; j < reg.length && reg[j].t - e.t <= janela && reg[j].dir === 'out'; j++) seguintes.push(reg[j].v);
      if (teste(seguintes)) return true;
    }
    return false;
  }

  // Caixa de blocos de um desafio: os blocos de todos os desafios até ele
  function caixa(n) {
    const DESAFIOS = F.DESAFIOS;
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

  F.caixa = caixa;
  F.verif = { depois, conta, visiveis, algumPino, causou };

  // ---------------------------------------------------- pacotes
  // Um pacote junta mascote, marca, mensagens gerais e a lista de desafios.
  // Cada desafio traz a sua parte pedagógica em «tutor» (regras, pistas, gambiarra),
  // para que o desafio e as pistas nunca fiquem desemparelhados.
  F.registarPacote = function (p) {
    if (p.xml) Object.assign(XML, p.xml);
    F.PACOTE = p;
    F.DESAFIOS = p.desafios;
    F.TUTOR = { DESAFIOS: p.desafios.map(d => d.tutor), COMUNS: p.comuns || [], GERAIS: p.gerais };
  };
})();
