/* Faísca Desafios — base dos desafios (comum a todas as missões e mascotes).
 * As missões (missoes/<id>.js) e as mascotes (mascotes/<id>.js) registam-se aqui.
 * Aqui ficam os blocos da caixa, as ajudas de verificação por comportamento,
 * a montagem da caixa de cada desafio e a junção mascote × missão.
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
    mk_icone_nao: '<block type="mk_icone"><field name="I">No</field></block>',
    mk_icone_surpreendido: '<block type="mk_icone"><field name="I">Surprised</field></block>',
    mk_icone_dormir: '<block type="mk_icone"><field name="I">Asleep</field></block>',
    mk_iniciar: '<block type="mk_iniciar"></block>',
    mk_gesto: '<block type="mk_gesto"><field name="G">left</field></block>',
    mk_gesto_direita: '<block type="mk_gesto"><field name="G">right</field></block>',
    mk_gesto_baixo: '<block type="mk_gesto"><field name="G">face down</field></block>',
    mk_gesto_queda: '<block type="mk_gesto"><field name="G">freefall</field></block>',
    mk_som_alto: '<block type="mk_som_alto"></block>',
    mk_luz: '<block type="mk_luz"></block>',
    mk_som_nivel: '<block type="mk_som_nivel"></block>',
    mk_temperatura: '<block type="mk_temperatura"></block>',
    mk_tempo: '<block type="mk_tempo"></block>',
    mk_mostrar_numero: '<block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_mostrar_texto: '<block type="mk_mostrar_texto"><value name="T"><shadow type="mk_texto"><field name="TXT">Olá!</field></shadow></value></block>',
    mk_acender: '<block type="mk_acender"><value name="X"><shadow type="mk_num"><field name="NUM">2</field></shadow></value><value name="Y"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block>',
    mk_apagar_led: '<block type="mk_apagar_led"><value name="X"><shadow type="mk_num"><field name="NUM">2</field></shadow></value><value name="Y"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block>',
    mk_grafico: '<block type="mk_grafico"><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="MAX"><shadow type="mk_num"><field name="NUM">255</field></shadow></value></block>',
    mk_var_definir: '<block type="mk_var_definir"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_var_mudar: '<block type="mk_var_mudar"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    mk_var: '<block type="mk_var"><field name="VAR">contador</field></block>',
    mk_conta: '<block type="mk_conta"><field name="OP">+</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_aleatorio: '<block type="mk_aleatorio"><value name="A"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">6</field></shadow></value></block>',
    mk_resto: '<block type="mk_resto"><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block>',
    mk_comparar: '<block type="mk_comparar"><field name="OP">&lt;</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_se_entao: '<block type="mk_se_entao"></block>',
    mk_se_senao: '<block type="mk_se"></block>',
    mk_ler_digital: '<block type="mk_ler_digital"><field name="P">P0</field></block>',
    mk_ler_analogico: '<block type="mk_ler_analogico"><field name="P">P1</field></block>',
    mk_servo: '<block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block>',
    mk_registar: '<block type="mk_registar"><value name="NOME"><shadow type="mk_texto"><field name="TXT">luz</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_tom_livre: '<block type="mk_tom"><value name="F"><shadow type="mk_num"><field name="NUM">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value></block>',
    mk_digital_p0_1: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    mk_digital_p0_0: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
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
  // houve(reg, 'numero:') — alguma saída começa por / corresponde a (texto ou RegExp)?
  const houve = (reg, t) => reg.some(e => e.dir === 'out' && (t instanceof RegExp ? t.test(e.v) : e.v.startsWith(t)));
  // números mostrados no ecrã, por ordem
  const numeros = reg => reg.filter(e => e.dir === 'out' && e.v.startsWith('numero:')).map(e => Number(e.v.slice(7)));
  // valor numérico de uma entrada de sensor ('luz:30' → 30)
  const valorDe = v => Number(String(v).split(':').pop());
  // depois de o sensor passar a um valor que cumpre cond(v), as saídas (até à entrada seguinte) cumprem teste?
  //   aposSensor(r, 'luz', v => v < 40, s => s.includes('icone:Asleep'))
  const aposSensor = (reg, sensor, cond, teste) => causou(reg, teste, x => x.startsWith(sensor + ':') && cond(valorDe(x)));
  F.verif = { depois, conta, visiveis, algumPino, causou, houve, numeros, valorDe, aposSensor };

  // ---------------------------------------------------- mascotes e missões
  // MASCOTE = quem acompanha (nome, género, ilustrações, voz, tema, sons).
  // MISSÃO  = o que se faz (níveis → desafios). Cada desafio traz a sua parte pedagógica
  //           em «tutor» (regras, pistas, gambiarra), escrita para servir qualquer mascote.
  // A criança escolhe as duas coisas; o motor junta-as em F.DESAFIOS / F.TUTOR.
  F.MASCOTES = {};
  F.MISSOES = {};
  F.ORDEM_MASCOTES = [];
  F.ORDEM_MISSOES = [];
  F.registarMascote = m => { F.MASCOTES[m.id] = m; F.ORDEM_MASCOTES.push(m.id); };
  F.registarMissao = m => {
    if (m.xml) Object.assign(XML, m.xml);
    F.MISSOES[m.id] = m; F.ORDEM_MISSOES.push(m.id);
  };
  // desafios de uma missão, por ordem, com o nível de cada um
  F.desafiosDe = missao => missao.niveis.flatMap((nv, k) => nv.desafios.map(d => Object.assign(d, { nivel: k, nivelNome: nv.nome })));

  F.ativar = function (mascoteId, missaoId) {
    const M = F.MASCOTES[mascoteId] || F.MASCOTES[F.ORDEM_MASCOTES[0]];
    const X = F.MISSOES[missaoId];
    F.MASCOTE = M;
    F.MISSAO = X;
    F.DESAFIOS = F.desafiosDe(X);
    F.TUTOR = {
      DESAFIOS: F.DESAFIOS.map(d => d.tutor),
      COMUNS: [...(X.comuns || []), ...(M.comuns || [])],
      GERAIS: M.gerais,
    };
  };

  // Voz da mascote. Um texto pode ser:
  //   'texto'                              igual para todas
  //   { nico: '…', gabi: '…', _: '…' }     um por mascote (_ = as outras)
  // e pode ter: {ola} → apresentação da mascote · [o|a] → masculino|feminino · {nome}
  F.voz = function (t, M = F.MASCOTE) {
    if (t && typeof t === 'object') t = t[M.id] !== undefined ? t[M.id] : t._;
    if (!t) return t;
    return t.replace(/\{ola\}/g, M.ola).replace(/\{nome\}/g, M.nome)
      .replace(/\[([^|\]]*)\|([^\]]*)\]/g, (_, mas, fem) => M.artigo === 'a' ? fem : mas);
  };
})();
