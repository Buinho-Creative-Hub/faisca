/* Missão «Citizen sensing» — medir o lugar.
 *
 * As crianças tornam-se cientistas da própria escola: medem a luz, o som e a temperatura com os sensores
 * do micro:bit V2, decidem limites em turma, registam dados (ficheiro MY_DATA.HTM) e fazem um mapa sensorial.
 * Liga ao trabalho do Buinho em citizen sensing (mapa sensorial da escola, limite de barulho decidido pela turma,
 * porta vs pátio, guardiã da horta).
 *   Nível 1 · Medir — ler um sensor e mostrar (número, gráfico).
 *   Nível 2 · Decidir — comparar com um limite, reagir, contar, registar.
 *   Nível 3 · Investigar — estação automática, recordes, médias, comparar lugares, humidade do solo, tempo.
 * Textos para qualquer mascote: {ola}, [o|a]. Validação sempre pelo comportamento (registo), nunca pelos blocos.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { tem, blocos, dentro, soltoCom } = F.ajudasTutor;
  const { causou, houve, numeros, valorDe, aposSensor } = F.verif;

  // ------------------------------------------------------------ ajudas de verificação (pelo registo)
  // último valor de um sensor antes da posição i do registo (null se ainda não mexeram nele)
  function ultimoSensor(reg, i, sensor) {
    for (let j = i - 1; j >= 0; j--) if (reg[j].dir === 'in' && reg[j].v.startsWith(sensor + ':')) return valorDe(reg[j].v);
    return null;
  }
  // saídas logo a seguir à entrada i (até à entrada seguinte)
  function saidasApos(reg, i) {
    const s = [];
    for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= 8000; j++) s.push(reg[j].v);
    return s;
  }
  // depois de «entrada», o micro:bit fez alguma coisa com o valor que o sensor tinha nesse momento
  function mostrou(reg, entrada, sensor, igual) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      const v = ultimoSensor(reg, i, sensor);
      if (v !== null && saidasApos(reg, i).some(x => igual(x, v))) return true;
    }
    return false;
  }
  // o micro:bit acompanha o sensor: para pelo menos n valores diferentes, a seguir aparece o esperado
  function acompanha(reg, sensor, igual, n = 2) {
    const ok = new Set();
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || !e.v.startsWith(sensor + ':')) return;
      const v = valorDe(e.v);
      if (saidasApos(reg, i).some(x => igual(x, v))) ok.add(v);
    });
    return ok.size >= n;
  }
  const numeroIgual = (x, v) => x === 'numero:' + v;
  const registoIgual = (x, v) => x.startsWith('registo:') && valorDe(x) === v;
  const barras = (v, max) => 'grafico:' + Math.max(0, Math.min(25, Math.round(25 * v / max)));
  const grafIgual = max => (x, v) => x === barras(v, max);
  // nome do registo feito depois de «entrada» com o valor do sensor (ou null)
  function nomeRegisto(reg, entrada, sensor) {
    for (let i = reg.length - 1; i >= 0; i--) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      const v = ultimoSensor(reg, i, sensor);
      if (v === null) continue;
      const x = saidasApos(reg, i).find(s => registoIgual(s, v));
      if (x) return x.slice('registo:'.length, x.lastIndexOf(':'));
    }
    return null;
  }

  // ------------------------------------------------------------ ajudas para as regras
  const evs = P.evs;
  const com = (id, r) => Object.assign(r, { id });
  // lista plana de instruções (com os corpos aninhados)
  const plano = lista => (lista || []).flatMap(x => [x, ...plano(x.corpo), ...plano(x.sim), ...plano(x.nao)]);
  // blocos «se» (com os ramos sim/não) dentro de um evento
  const ses = ev => ev ? plano(ev.seq).filter(x => x.tipo === 'mk_se' || x.tipo === 'mk_se_entao') : [];
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  // comparação dentro de um bloco: { op, primeiro } — primeiro = tipo do bloco do lado esquerdo
  function comparacao(p) {
    const u = p.usa || [];
    const k = u.findIndex(x => x.tipo === 'mk_comparar');
    return k < 0 ? null : { op: u[k].op, primeiro: u[k + 1] && u[k + 1].tipo };
  }
  const temIcone = (lista, nome) => plano(lista).some(x => x.tipo === 'mk_icone' && x.icone === nome);
  const temDigital = (lista, v) => plano(lista).some(x => x.tipo === 'mk_digital' && x.v === v);
  // fora: os blocos estão soltos, fora do evento
  const fora = (chave, tipos) => P.regra('fora_' + chave.replace(/[^a-z0-9]/gi, '_'),
    a => evs(a, chave).length > 0 && !evs(a, chave).some(e => tipos.some(t => tem(e, t))) && tipos.some(t => soltoCom(a, t)), [
      ['a_pensar', 'Há blocos cá fora, sozinhos. Quando é que eles vão correr?'],
      'Tudo o que fica fora de um bloco cor-de-rosa (ou do «para sempre») nunca corre.',
      `Encaixa os blocos soltos dentro de «${P.nomeEvento(chave)}».`,
    ], 'Agora estão no sítio certo!');
  // o máximo do gráfico não é o do sensor
  const maxErrado = (chave, max, intervalo) => P.regra('max_errado',
    a => evs(a, chave).some(e => blocos(e, 'mk_grafico').some(p => Number(p.max) !== max)), [
      ['a_pensar', 'O gráfico enche-se cedo demais (ou nunca chega ao fim)… Até quanto vai o valor?'],
      `${intervalo} O segundo número do gráfico é o máximo.`,
      `Escreve ${max} no segundo buraco do «desenhar gráfico de barras».`,
    ], 'Agora o gráfico tem a escala certa!');
  // limite 0 numa comparação
  const limiteZero = (chave, alvo, p1, p2, p3) => P.regra('limite_zero',
    a => evs(a, chave).some(e => blocos(e, alvo).some(p => usa(p, 'mk_comparar') && (p.usa || []).some(u => u.tipo === 'mk_num' && u.n === 0))),
    [['a_pensar', p1], p2, p3], 'Bom limite!');
  // semáforo: triste com barulho, contente sem barulho — trocado?
  function caraTrocada(a) {
    return evs(a, 'sempre').some(e => ses(e).some(d => {
      if (d.tipo !== 'mk_se') return false;
      const c = comparacao(d);
      if (!c || c.primeiro !== 'mk_som_nivel') return false;
      const maior = c.op === '>' || c.op === '>=';
      return maior ? (temIcone(d.nao, 'Sad') || temIcone(d.sim, 'Happy')) : (temIcone(d.sim, 'Sad') || temIcone(d.nao, 'Happy'));
    }));
  }
  const trocada = P.regra('cara_trocada', caraTrocada, [
    ['surpreendida', 'Ui! O micro:bit fica triste no silêncio e contente na barulheira?'],
    'Lê a pergunta do «se»: quando é verdade, corre o «então»; quando não é, corre o «senão».',
    'Troca as caras: a triste vai para o ramo do barulho a mais, a contente para o outro.',
  ], 'Agora sim, triste só com barulho!');

  // ------------------------------------------------------------ XML (blocos da caixa e gambiarras)
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const T = (nome, t) => `<value name="${nome}"><shadow type="mk_texto"><field name="TXT">${t}</field></shadow></value>`;
  const V = (nome, bloco) => `<value name="${nome}">${bloco}</value>`;
  const B = t => `<block type="${t}"></block>`;
  const xVar = n => `<block type="mk_var"><field name="VAR">${n}</field></block>`;
  const xCmp = (a, op, b) => `<block type="mk_comparar"><field name="OP">${op}</field>${typeof a === 'number' ? N('A', a) : V('A', a)}${typeof b === 'number' ? N('B', b) : V('B', b)}</block>`;
  const xConta = (a, op, b) => `<block type="mk_conta"><field name="OP">${op}</field>${typeof a === 'number' ? N('A', a) : V('A', a)}${typeof b === 'number' ? N('B', b) : V('B', b)}</block>`;
  const sNum = x => `<block type="mk_mostrar_numero">${typeof x === 'number' ? N('N', x) : V('N', x)}`;
  const sGraf = (x, m) => `<block type="mk_grafico">${V('V', x)}${N('MAX', m)}`;
  const sIcone = i => `<block type="mk_icone"><field name="I">${i}</field>`;
  const sReg = (nome, x) => `<block type="mk_registar">${T('NOME', nome)}${V('V', x)}`;
  const sDef = (n, x) => `<block type="mk_var_definir"><field name="VAR">${n}</field>${typeof x === 'number' ? N('V', x) : V('V', x)}`;
  const sDig = v => `<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value>${N('V', v)}`;
  const sTom = () => '<block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value>';
  const sPausa = ms => `<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`;
  // encadeia instruções abertas (cada uma é «<block …>…» sem o fecho)
  const seq = (...ins) => ins.length ? ins[0] + (ins.length > 1 ? `<next>${seq(...ins.slice(1))}</next>` : '') + '</block>' : '';
  const sSe = (c, sim, nao) => `<block type="mk_se">${V('C', c)}<statement name="SIM">${seq(...sim)}</statement><statement name="NAO">${seq(...nao)}</statement>`;
  const sSeEntao = (c, ...corpo) => `<block type="mk_se_entao">${V('C', c)}<statement name="SIM">${seq(...corpo)}</statement>`;
  let y = 0;
  const ev = (tipo, campos, corpo) => { y += 170; return `<block type="${tipo}" x="40" y="${y}">${campos}<statement name="DO">${corpo}</statement></block>`; };
  const xml = (...bs) => { const r = '<xml>' + bs.join('') + '</xml>'; y = 0; return r; };
  const botao = (l, c) => ev('mk_botao', l === 'A' ? '' : `<field name="B">${l}</field>`, c);
  const sempre = c => ev('mk_sempre', '', c);
  const inicio = c => ev('mk_iniciar', '', c);
  const somalto = c => ev('mk_som_alto', '', c);
  const logo = c => ev('mk_logo', '', c);

  const XMLS = {
    cs_comparar_maior: `<block type="mk_comparar"><field name="OP">&gt;</field>${N('A', 0)}${N('B', 0)}</block>`,
    cs_registar_som: `<block type="mk_registar">${T('NOME', 'som')}${N('V', 0)}</block>`,
    cs_registar_temp: `<block type="mk_registar">${T('NOME', 'temperatura')}${N('V', 0)}</block>`,
    cs_definir_medida: `<block type="mk_var_definir"><field name="VAR">medida</field>${N('V', 0)}</block>`,
    cs_var_medida: xVar('medida'),
    cs_mudar_medida: `<block type="mk_var_mudar"><field name="VAR">medida</field>${N('V', 1)}</block>`,
    cs_definir_recorde: `<block type="mk_var_definir"><field name="VAR">recorde</field>${N('V', 0)}</block>`,
    cs_var_recorde: xVar('recorde'),
  };

  // ============================================================ NÍVEL 1 · MEDIR
  const N1 = [
    // ---------------------------------------------------------- 1 · Quanta luz há aqui?
    {
      titulo: 'Quanta luz há aqui?',
      missao: 'Carrega no A e o micro:bit diz quanta luz há, de 0 a 255.',
      passos: ['Usa «no botão A premido» com «mostrar número».', 'Encaixa «nível de luz» no buraco do número.', 'Experimenta: muda a luz no controlo e carrega em A.'],
      material: 'micro:bit',
      novos: ['mk_botao', 'mk_mostrar_numero', 'mk_luz'],
      teste: 'botao:A',
      ok: r => mostrou(r, 'botao:A', 'luz', numeroIgual),
      tutor: {
        boasVindas: ['boas_vindas', '{ola} Hoje somos cientistas do lugar onde estamos. Primeira pergunta: quanta luz há aqui?'],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'mk_mostrar_numero', 'mk_luz')),
        testar: 'Tens uma ideia? Vamos testar! Muda a luz no controlo por baixo do micro:bit e carrega em A.',
        regras: [
          P.evento('botao:A', 'Como é que o micro:bit sabe quando queres fazer uma medição?'),
          fora('botao:A', ['mk_mostrar_numero', 'mk_luz']),
          P.bloco('botao:A', 'mk_mostrar_numero', 'O micro:bit já ouve o botão. E como é que ele te conta o que mediu?'),
          P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_luz', 'Esse número é sempre igual… mas a luz muda! Quem é que mede a luz?'),
        ],
        sucesso: 'Mediste a luz! 0 é escuro total, 255 é sol a bater em cheio. O sensor de luz são as próprias luzes do ecrã.',
        extensao: 'Mede a luz junto à janela, no meio da sala e debaixo da mesa. Onde é que há mais?',
        gambiarra: {
          xml: xml(botao('A', seq(sNum(150)))),
          pedido: 'Fiz um medidor de luz… mas diz sempre 150! Tapei-o com a mão e nada mudou. Consegues descobrir porquê?',
        },
      },
    },

    // ---------------------------------------------------------- 2 · Que temperatura faz?
    {
      titulo: 'Que temperatura faz?',
      missao: 'Carrega no B e o micro:bit diz a temperatura, em graus.',
      passos: ['Junta «no botão B premido» com «mostrar número».', 'Encaixa «temperatura (°C)» no número.', 'Experimenta: muda a temperatura no controlo e carrega em B.'],
      material: 'micro:bit',
      novos: ['mk_botao_B', 'mk_temperatura'],
      teste: 'botao:B',
      ok: r => mostrou(r, 'botao:B', 'temperatura', numeroIgual),
      tutor: {
        boasVindas: ['boas_vindas', 'Agora vamos medir o calor. O botão B vai ser o nosso termómetro.'],
        parecePronto: a => evs(a, 'botao:B').some(e => dentro(e, 'mk_mostrar_numero', 'mk_temperatura')),
        testar: 'Tens uma ideia? Vamos testar! Muda a temperatura no controlo e carrega em B.',
        regras: [
          P.evento('botao:B', 'A medição do calor vai num botão novo. Qual é o botão que ainda não usaste?'),
          fora('botao:B', ['mk_mostrar_numero', 'mk_temperatura']),
          P.bloco('botao:B', 'mk_mostrar_numero', 'O B já está à escuta. Como é que ele te mostra a medição?'),
          P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_temperatura', 'Esse número não muda quando aquece… Quem é que sente o calor?'),
        ],
        sucesso: 'Termómetro pronto! O micro:bit mede a temperatura do seu processador, por isso costuma dar um ou dois graus a mais do que a sala.',
        extensao: 'Segura o micro:bit verdadeiro na mão durante um minuto. A temperatura sobe?',
        gambiarra: {
          xml: xml(botao('B', seq(sNum(B('mk_luz'))))),
          pedido: 'O meu termómetro está maluco: tapo-o com a mão e a temperatura desce! Será que estou a medir a coisa certa?',
        },
      },
    },

    // ---------------------------------------------------------- 3 · Ouvido atento
    {
      titulo: 'Ouvido atento',
      missao: 'Toca no logotipo e o micro:bit diz quanto barulho há, de 0 a 255.',
      passos: ['Usa «ao logotipo pressionado» com «mostrar número».', 'Encaixa «nível de som» no número.', 'Experimenta: muda o som no controlo e toca no logotipo.'],
      material: 'micro:bit V2 (tem microfone)',
      novos: ['mk_logo', 'mk_som_nivel'],
      teste: 'logo',
      ok: r => mostrou(r, 'logo', 'som', numeroIgual),
      tutor: {
        boasVindas: ['boas_vindas', 'O micro:bit V2 tem ouvidos: um microfone! Vamos medir o barulho?'],
        parecePronto: a => evs(a, 'logo').some(e => dentro(e, 'mk_mostrar_numero', 'mk_som_nivel')),
        testar: 'Tens uma ideia? Vamos testar! Muda o som no controlo e toca no logotipo dourado.',
        regras: [
          P.evento('logo', 'Desta vez a medição começa com um toque… Onde é que se toca no micro:bit, sem ser nos botões?'),
          fora('logo', ['mk_mostrar_numero', 'mk_som_nivel']),
          P.bloco('logo', 'mk_mostrar_numero', 'O logotipo já sente o teu dedo. E agora, como é que vês a medição?'),
          P.valorEm('logo', 'mk_mostrar_numero', 'mk_som_nivel', 'O número não muda quando falas alto… Quem é que ouve?'),
        ],
        sucesso: 'Ouvido afinado! O microfone do micro:bit tem uma luzinha ao lado do logotipo que acende quando está a ouvir.',
        extensao: 'Mede o barulho no recreio e na biblioteca. Qual é a diferença?',
        gambiarra: {
          xml: xml(logo(seq(sNum(B('mk_temperatura'))))),
          pedido: 'Grito ao pé do micro:bit e ele nem pestaneja! O que é que liguei mal?',
        },
      },
    },

    // ---------------------------------------------------------- 4 · Gráfico da luz
    {
      titulo: 'Gráfico da luz',
      missao: 'O micro:bit desenha a luz sem parar: mais luz, mais barras acesas.',
      passos: ['Usa «para sempre» com «desenhar gráfico de barras».', 'Encaixa «nível de luz» no primeiro buraco; o máximo é 255.', 'Experimenta: mexe no controlo da luz.'],
      material: 'micro:bit',
      novos: ['mk_sempre', 'mk_grafico'],
      teste: 'luz',
      ok: r => acompanha(r, 'luz', grafIgual(255)),
      tutor: {
        boasVindas: ['boas_vindas', 'Números passam depressa. E se a luz fosse um desenho que sobe e desce?'],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_grafico').some(p => usa(p, 'mk_luz') && Number(p.max) === 255)),
        testar: 'Tens uma ideia? Vamos testar! Mexe no controlo da luz e vê as barras.',
        regras: [
          P.evento('sempre', 'Até agora medias uma vez por botão. Como é que o micro:bit mede sem parar?'),
          fora('sempre', ['mk_grafico', 'mk_luz']),
          P.bloco('sempre', 'mk_grafico', 'Já mede sem parar. E se, em vez de números, desenhasse barras?'),
          P.valorEm('sempre', 'mk_grafico', 'mk_luz', 'O gráfico está parado num valor fixo. O que é que ele devia desenhar?'),
          maxErrado('sempre', 255, 'A luz vai de 0 a 255.'),
        ],
        sucesso: 'Um gráfico vivo! Agora vês a luz a mudar sem precisares de ler números.',
        extensao: 'Passa a mão por cima devagar. Consegues deixar só uma barra acesa?',
        gambiarra: {
          xml: xml(botao('A', seq(sGraf(B('mk_luz'), 255)))),
          pedido: 'Fiz o gráfico da luz… mas só mexe quando carrego no A! Eu queria que andasse sozinho.',
        },
      },
    },

    // ---------------------------------------------------------- 5 · Medidor de barulho
    {
      titulo: 'Medidor de barulho',
      missao: 'Faz um medidor de barulho para a sala: quanto mais barulho, mais barras.',
      passos: ['«para sempre» com «desenhar gráfico de barras».', 'Encaixa «nível de som»; o máximo é 255.', 'Experimenta: mexe no controlo do som ou bate palmas.'],
      material: 'micro:bit V2',
      novos: [],
      teste: 'som',
      ok: r => acompanha(r, 'som', grafIgual(255)),
      tutor: {
        boasVindas: ['boas_vindas', 'E se a sala tivesse um medidor de barulho à vista de todos?'],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_grafico').some(p => usa(p, 'mk_som_nivel') && Number(p.max) === 255)),
        testar: 'Tens uma ideia? Vamos testar! Mexe no controlo do som.',
        regras: [
          P.evento('sempre', 'O medidor tem de estar sempre a ouvir. Que bloco repete sem parar?'),
          fora('sempre', ['mk_grafico', 'mk_som_nivel']),
          P.bloco('sempre', 'mk_grafico', 'Como é que o barulho vira barras no ecrã?'),
          P.valorEm('sempre', 'mk_grafico', 'mk_som_nivel', 'Este gráfico não ouve nada… O que é que lhe falta encaixar?'),
          maxErrado('sempre', 255, 'O som vai de 0 a 255.'),
        ],
        sucesso: 'Medidor de barulho a funcionar! Ponham-no à frente da turma e vejam se conseguem ficar só com duas barras.',
        extensao: 'Desafio da turma: quem consegue contar uma história sem passar das três barras?',
        gambiarra: {
          xml: xml(sempre(seq(sGraf(B('mk_som_nivel'), 25)))),
          pedido: 'O meu medidor está sempre cheio, até com a sala calada! Mexi num número e estraguei qualquer coisa…',
        },
      },
    },

    // ---------------------------------------------------------- 6 · Termómetro de parede
    {
      titulo: 'Termómetro de parede',
      missao: 'O micro:bit mostra a temperatura sozinho, segundo a segundo.',
      passos: ['«para sempre» com «mostrar número» e «temperatura (°C)».', 'Junta uma «pausa» de 1000 ms (1 segundo).', 'Experimenta: muda a temperatura no controlo.'],
      material: 'micro:bit',
      novos: ['mk_pausa'],
      teste: 'temperatura',
      ok: r => acompanha(r, 'temperatura', numeroIgual),
      tutor: {
        boasVindas: ['boas_vindas', 'Um termómetro de parede não precisa de botões: mostra a temperatura sempre.'],
        parecePronto: a => evs(a, 'sempre').some(e => dentro(e, 'mk_mostrar_numero', 'mk_temperatura')),
        testar: 'Tens uma ideia? Vamos testar! Muda a temperatura no controlo e espera um bocadinho.',
        regras: [
          P.evento('sempre', 'O termómetro tem de medir sozinho, sem ninguém carregar em nada. Que bloco faz isso?'),
          fora('sempre', ['mk_mostrar_numero', 'mk_temperatura']),
          P.bloco('sempre', 'mk_mostrar_numero', 'Já repete sem parar. O que é que ele mostra?'),
          P.valorEm('sempre', 'mk_mostrar_numero', 'mk_temperatura', 'O número não acompanha o calor. Que valor devia aparecer?'),
          P.bloco('sempre', 'mk_pausa', 'Medir 50 vezes por segundo cansa os olhos… Como é que ele descansa entre medições?', 'Agora mede com calma.'),
        ],
        sucesso: 'Termómetro de parede pronto! Mostra a temperatura sempre, sem precisares de carregar em nada.',
        extensao: 'Põe-no junto à janela de manhã e à tarde. Quantos graus muda?',
        gambiarra: {
          xml: xml(inicio(seq(sNum(B('mk_temperatura'))))),
          pedido: 'O meu termómetro mostra a temperatura uma vez… e depois fica a dormir. A sala aqueceu e nada!',
        },
      },
    },
  ];

  // ============================================================ NÍVEL 2 · DECIDIR
  const N2 = [
    // ---------------------------------------------------------- 7 · Semáforo do barulho
    {
      titulo: 'Semáforo do barulho',
      missao: 'Com barulho a mais, o micro:bit fica triste; sem barulho, fica contente.',
      passos: ['«para sempre» com «se… então… senão».', 'Pergunta: «nível de som» > um limite (por exemplo 128).', 'Triste no «então», contente no «senão». Experimenta com o som.'],
      material: 'micro:bit V2',
      novos: ['mk_se_senao', 'cs_comparar_maior', 'mk_icone', 'mk_icone_triste'],
      caixa: ['mk_sempre', 'mk_som_nivel', 'mk_luz', 'mk_temperatura', 'mk_mostrar_numero', 'mk_grafico', 'mk_pausa'],
      teste: 'som',
      ok: r => aposSensor(r, 'som', v => v >= 200, s => s.includes('icone:Sad')) && aposSensor(r, 'som', v => v <= 30, s => s.includes('icone:Happy')),
      tutor: {
        boasVindas: ['boas_vindas', 'Medir já sabemos. Agora o micro:bit vai decidir: há barulho a mais ou não?'],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_se').some(p => usa(p, 'mk_som_nivel') && usa(p, 'mk_comparar')) &&
          tem(e, 'mk_icone')) && !caraTrocada(a),
        testar: 'Tens uma ideia? Vamos testar! Põe o som no máximo e depois no mínimo.',
        regras: [
          P.evento('sempre', 'O semáforo tem de estar sempre atento. Que bloco repete sem parar?'),
          P.bloco('sempre', 'mk_se', 'O micro:bit tem de escolher entre duas caras. Que bloco faz escolhas?'),
          P.valorEm('sempre', 'mk_se', 'mk_comparar', 'O «se» precisa de uma pergunta de sim ou não. Como é que se pergunta «há barulho a mais?»'),
          P.valorEm('sempre', 'mk_se', 'mk_som_nivel', 'A pergunta compara números… mas qual é o número que muda com o barulho?'),
          limiteZero('sempre', 'mk_se', 'O limite está em 0… Então qualquer barulhinho conta como barulho a mais?',
            'Escolhe um limite a meio: o som vai de 0 a 255.', 'Escreve um número como 128 no outro lado da comparação.'),
          P.bloco('sempre', 'mk_icone', 'A escolha está feita… e o que é que se vê no ecrã?'),
          trocada,
        ],
        sucesso: 'Semáforo do barulho pronto! A turma pode combinar um limite e o micro:bit vigia.',
        extensao: 'E se houvesse uma cara a meio, surpreendida, entre o silêncio e a barulheira?',
        gambiarra: {
          xml: xml(sempre(seq(sSe(xCmp(B('mk_som_nivel'), '&lt;', 128), [sIcone('Sad')], [sIcone('Happy')])))),
          pedido: 'O meu semáforo está ao contrário: fica triste no silêncio e contente na barulheira! Onde é que me enganei?',
        },
      },
    },

    // ---------------------------------------------------------- 8 · Luz de presença
    {
      titulo: 'Luz de presença',
      missao: 'Quando fica escuro, acende-se uma luz de presença (um LED no pin 2).',
      passos: ['LED com crocodilos: perna comprida no pin 2, perna curta no GND.', '«para sempre» com «se está escuro então… senão».', 'Então: pin P2 para 1. Senão: para 0. Experimenta a luz.'],
      material: 'micro:bit, um LED, 2 crocodilos',
      novos: ['mk_se', 'mk_digital_1', 'mk_digital_0'],
      caixa: ['mk_sempre', 'mk_escuro', 'mk_luz', 'mk_comparar', 'mk_icone', 'mk_pausa'],
      teste: 'luz',
      ok: r => aposSensor(r, 'luz', v => v <= 20, s => s.some(x => /^digital:P\d:1$/.test(x))) &&
        aposSensor(r, 'luz', v => v >= 120, s => s.some(x => /^digital:P\d:0$/.test(x))),
      tutor: {
        boasVindas: ['boas_vindas', 'À noite, no corredor, faz jeito uma luzinha. Mas só quando está escuro, para poupar energia!'],
        parecePronto: a => evs(a, 'sempre').some(e => ses(e).some(d => d.tipo === 'mk_se' && (usa(d, 'mk_escuro') || usa(d, 'mk_luz')) &&
          temDigital(d.sim, 1) && temDigital(d.nao, 0))) || evs(a, 'sempre').some(e => ses(e).some(d => d.tipo === 'mk_se' && usa(d, 'mk_luz') &&
          temDigital(d.sim, 0) && temDigital(d.nao, 1))),
        testar: 'Tens uma ideia? Vamos testar! Põe a luz no mínimo e depois no máximo.',
        regras: [
          P.evento('sempre', 'A luz de presença tem de estar sempre a vigiar. Que bloco repete sem parar?'),
          P.bloco('sempre', 'mk_se', 'Acender ou apagar: é uma escolha. Que bloco faz escolhas?'),
          P.regra('sem_pergunta', a => evs(a, 'sempre').some(e => blocos(e, 'mk_se').length) &&
            !evs(a, 'sempre').some(e => blocos(e, 'mk_se').some(p => usa(p, 'mk_escuro') || usa(p, 'mk_luz'))), [
            'O «se» precisa de saber uma coisa sobre a luz. Qual é a pergunta?',
            'Há um bloco cor-de-rosa que responde sim ou não: «está escuro».',
            'Encaixa «está escuro» no buraco do «se».',
          ], 'Boa pergunta!'),
          P.regra('sem_ligar', a => evs(a, 'sempre').some(e => blocos(e, 'mk_se').length) && !evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_digital' && x.v === 1)), [
            'O micro:bit já sabe quando está escuro. Mas quem acende o LED?',
            'O bloco vermelho-escuro «gravação digital pin» liga (1) ou desliga (0) um pino.',
            'Põe «gravação digital pin P2 para 1» no «então».',
          ], 'Luz!'),
          P.regra('trocado', a => evs(a, 'sempre').some(e => ses(e).some(d => d.tipo === 'mk_se' && usa(d, 'mk_escuro') && temDigital(d.sim, 0) && temDigital(d.nao, 1))), [
            ['surpreendida', 'Ui! A luz acende de dia e apaga de noite?'],
            'O «então» corre quando está escuro; o «senão» quando há luz.',
            'Troca: «para 1» no «então», «para 0» no «senão».',
          ], 'Agora sim, só acende no escuro!'),
          P.regra('nunca_apaga', a => evs(a, 'sempre').some(e => blocos(e, 'mk_se').length) && !evs(a, 'sempre').some(e => plano(e.seq).some(x => x.tipo === 'mk_digital' && x.v === 0)), [
            'Acende quando escurece… e quando volta a luz do dia?',
            'O «senão» também precisa de um bloco de luz, com outro número.',
            'Põe «gravação digital pin P2 para 0» no «senão».',
          ], 'Agora apaga de dia!'),
        ],
        sucesso: 'Luz de presença a funcionar! Só gasta energia quando faz falta.',
        extensao: 'E se, quando está escuro, também mostrasse a cara a dormir?',
        gambiarra: {
          xml: xml(sempre(seq(sSe(B('mk_escuro'), [sDig(1)], [sDig(1)])))),
          pedido: 'A minha luz de presença acende quando escurece… e nunca mais apaga, nem de dia! Que gambiarra fiz?',
        },
      },
    },

    // ---------------------------------------------------------- 9 · Sala quente
    {
      titulo: 'Sala quente',
      missao: 'Quando a sala passa dos 25 °C, o micro:bit avisa: abram a janela!',
      passos: ['«para sempre» com «se… então… senão».', 'Pergunta: «temperatura (°C)» > 25. Então: cara surpreendida.', 'Senão: «limpar ecrã». Experimenta com a temperatura.'],
      material: 'micro:bit',
      novos: ['mk_icone_surpreendido', 'mk_limpar'],
      caixa: ['mk_sempre', 'mk_se_senao', 'cs_comparar_maior', 'mk_temperatura', 'mk_luz', 'mk_som_nivel', 'mk_icone', 'mk_mostrar_numero'],
      teste: 'temperatura',
      ok: r => aposSensor(r, 'temperatura', v => v >= 30, s => s.includes('icone:Surprised')) &&
        aposSensor(r, 'temperatura', v => v <= 18, s => s.length > 0 && !s.includes('icone:Surprised')),
      tutor: {
        boasVindas: ['boas_vindas', 'Numa sala muito quente ninguém se concentra. Vamos fazer um alarme de calor?'],
        parecePronto: a => evs(a, 'sempre').some(e => ses(e).some(d => d.tipo === 'mk_se' && usa(d, 'mk_temperatura') && temIcone(d.sim, 'Surprised') && plano(d.nao).length > 0)),
        testar: 'Tens uma ideia? Vamos testar! Sobe a temperatura acima de 25 e depois desce.',
        regras: [
          P.evento('sempre', 'O alarme tem de vigiar a sala o tempo todo. Que bloco repete sem parar?'),
          P.bloco('sempre', 'mk_se', 'Avisar ou não avisar: é uma escolha. Que bloco faz escolhas?'),
          P.valorEm('sempre', 'mk_se', 'mk_comparar', 'O «se» precisa de uma pergunta: «está calor a mais?». Como se compara?'),
          P.valorEm('sempre', 'mk_se', 'mk_temperatura', 'A pergunta compara números… Qual é o que mede o calor?'),
          limiteZero('sempre', 'mk_se', 'Mais de 0 °C? Assim o alarme toca até no inverno!',
            'Escolhe o limite do calor: muita gente acha que acima de 25 °C já custa.', 'Escreve 25 no outro lado da comparação.'),
          P.regra('sem_aviso', a => evs(a, 'sempre').some(e => blocos(e, 'mk_se').length) && !evs(a, 'sempre').some(e => ses(e).some(d => temIcone(d.sim, 'Surprised'))), [
            'Quando está calor a mais, o que é que se vê?',
            'Há uma cara surpreendida no «mostrar ícone».',
            'Põe «mostrar ícone» com a cara surpreendida no «então».',
          ], 'Que cara de calor!'),
          P.regra('nao_limpa', a => evs(a, 'sempre').some(e => ses(e).some(d => d.tipo === 'mk_se' && temIcone(d.sim, 'Surprised') && plano(d.nao).length === 0)), [
            'E quando a sala arrefece? O aviso fica lá para sempre!',
            'O «senão» corre quando já não está calor. Precisa de um bloco.',
            'Põe «limpar ecrã» no «senão».',
          ], 'Agora o aviso desaparece quando arrefece!'),
        ],
        sucesso: 'Alarme de calor pronto! Mediram, decidiram um limite e o micro:bit avisa. Isto é citizen sensing.',
        extensao: 'Junta um som de aviso. E um alarme de frio, abaixo de 16 °C?',
        gambiarra: {
          xml: xml(sempre(seq(sSe(xCmp(B('mk_temperatura'), '&gt;', 25), [sIcone('Surprised')], [])))),
          pedido: 'O meu alarme de calor tocou… e agora a sala arrefeceu e ele continua surpreendido! Que esqueci?',
        },
      },
    },

    // ---------------------------------------------------------- 10 · Contador de barulhos
    {
      titulo: 'Contador de barulhos',
      missao: 'Cada vez que há um barulho forte, o micro:bit conta mais um.',
      passos: ['Usa «em som alto».', 'Lá dentro: «mudar contador em 1» e «mostrar número» com «contador».', 'Experimenta: bate palmas três vezes.'],
      material: 'micro:bit V2',
      novos: ['mk_som_alto', 'mk_var_mudar', 'mk_var'],
      caixa: ['mk_mostrar_numero', 'mk_var_definir', 'mk_iniciar', 'mk_icone', 'mk_som_nivel'],
      teste: 'somalto',
      ok: r => { const ns = new Set(numeros(r)); return houve(r, 'var:') && [...ns].some(k => k >= 1 && ns.has(k + 1)); },
      tutor: {
        boasVindas: ['boas_vindas', 'Quantas portas batem num intervalo? Vamos pôr o micro:bit a contar os barulhos fortes.'],
        parecePronto: a => evs(a, 'somalto').some(e => tem(e, 'mk_var_mudar') && dentro(e, 'mk_mostrar_numero', 'mk_var')),
        testar: 'Tens uma ideia? Vamos testar! Bate palmas três vezes, com calma.',
        regras: [
          P.evento('somalto', 'Que bloco cor-de-rosa acorda quando há um barulho forte?'),
          P.regra('definir_em_vez_de_mudar', a => evs(a, 'somalto').some(e => tem(e, 'mk_var_definir') && !tem(e, 'mk_var_mudar')), [
            ['a_pensar', '«definir» põe sempre o mesmo número… Assim o contador nunca passa do 1!'],
            'Para juntar mais um, há outro bloco vermelho.',
            'Troca «definir contador para» por «mudar contador em 1».',
          ], 'Agora soma!'),
          P.bloco('somalto', 'mk_var_mudar', 'Como é que o micro:bit se lembra de quantos barulhos já ouviu?'),
          P.bloco('somalto', 'mk_mostrar_numero', 'Ele já conta às escondidas. Como é que nos mostra a conta?'),
          P.valorEm('somalto', 'mk_mostrar_numero', 'mk_var', 'O número no ecrã é sempre o mesmo. Que número devia aparecer?'),
        ],
        sucesso: 'Contador de barulhos pronto! Uma variável é uma caixinha onde o micro:bit guarda um número.',
        extensao: 'Quantos barulhos fortes há num intervalo? E numa aula? Façam a comparação.',
        gambiarra: {
          xml: xml(somalto(seq(sDef('contador', 1), sNum(xVar('contador'))))),
          pedido: 'O meu contador está preso no 1! Bato palmas, bato palmas… e nada. Que gambiarra é esta?',
        },
      },
    },

    // ---------------------------------------------------------- 11 · O limite da turma
    {
      titulo: 'O limite da turma',
      missao: 'A turma decide o limite de barulho; o micro:bit guarda-o e vigia.',
      passos: ['«no arranque»: «definir medida para» o número que a turma escolher.', '«para sempre»: se «nível de som» > «medida» → triste, senão contente.', 'Experimenta com o som.'],
      material: 'micro:bit V2',
      novos: ['mk_iniciar', 'cs_definir_medida', 'cs_var_medida'],
      caixa: ['mk_sempre', 'mk_se_senao', 'cs_comparar_maior', 'mk_som_nivel', 'mk_icone', 'mk_icone_triste', 'mk_mostrar_numero'],
      teste: 'som',
      ok: r => houve(r, 'var:') && aposSensor(r, 'som', v => v >= 230, s => s.includes('icone:Sad')) &&
        aposSensor(r, 'som', v => v <= 10, s => s.includes('icone:Happy')),
      tutor: {
        boasVindas: ['boas_vindas', 'Quem decide quanto barulho é demais? A turma! O micro:bit só guarda a decisão e vigia.'],
        parecePronto: a => evs(a, 'inicio').some(e => blocos(e, 'mk_var_definir').some(p => p.n !== 0)) &&
          evs(a, 'sempre').some(e => blocos(e, 'mk_se').some(p => usa(p, 'mk_som_nivel') && usa(p, 'mk_var')) && tem(e, 'mk_icone')) && !caraTrocada(a),
        testar: 'Tens uma ideia? Vamos testar! Põe o som no máximo e depois no mínimo.',
        regras: [
          P.evento('inicio', 'O limite decide-se antes de começar. Que bloco corre uma só vez, quando o micro:bit liga?'),
          P.bloco('inicio', 'mk_var_definir', 'Onde é que o micro:bit guarda o número que a turma escolheu?'),
          P.regra('limite_zero', a => evs(a, 'inicio').some(e => blocos(e, 'mk_var_definir').some(p => p.n === 0)), [
            ['a_pensar', 'A turma escolheu 0? Assim até respirar é barulho a mais!'],
            'Combinem um número entre 0 e 255. A meio fica o 128.',
            'Escreve o limite da turma no «definir medida para».',
          ], 'Limite combinado!'),
          P.evento('sempre', 'Agora o micro:bit tem de vigiar sem parar. Que bloco repete?'),
          P.bloco('sempre', 'mk_se', 'Triste ou contente: o micro:bit tem de escolher. Que bloco faz escolhas?'),
          P.valorEm('sempre', 'mk_se', 'mk_som_nivel', 'A pergunta do «se» tem de ouvir a sala. Que bloco ouve?'),
          P.valorEm('sempre', 'mk_se', 'mk_var', 'O «se» compara com um número escrito à mão… e o limite que a turma guardou?'),
          P.bloco('sempre', 'mk_icone', 'A escolha está feita… e o que é que se vê no ecrã?'),
          trocada,
        ],
        sucesso: 'Agora o limite é da turma! Se mudarem de ideias, basta mudar um número no «no arranque».',
        extensao: 'Façam uma votação: cada grupo propõe um limite. Testem dois e vejam qual é mais justo.',
        gambiarra: {
          xml: xml(inicio(seq(sDef('medida', 100))), sempre(seq(sSe(xCmp(B('mk_som_nivel'), '&gt;', 0), [sIcone('Sad')], [sIcone('Happy')])))),
          pedido: 'Guardei o limite da turma… mas o micro:bit fica triste até com a sala em silêncio! Acho que me esqueci de usar o limite.',
        },
      },
    },

    // ---------------------------------------------------------- 12 · Mapa sensorial
    {
      titulo: 'Mapa sensorial',
      missao: 'Percorre a escola: o A guarda a luz, o B guarda o som de cada sítio.',
      passos: ['No A: «registar dados luz =» «nível de luz».', 'No B: «registar dados som =» «nível de som».', 'Experimenta: muda a luz e o som, carrega em A e B.'],
      material: 'micro:bit V2, pilhas, uma planta da escola',
      novos: ['mk_registar', 'cs_registar_som'],
      caixa: ['mk_botao', 'mk_botao_B', 'mk_luz', 'mk_som_nivel', 'mk_temperatura', 'mk_mostrar_numero'],
      teste: 'botao:A',
      ok: r => mostrou(r, 'botao:A', 'luz', registoIgual) && mostrou(r, 'botao:B', 'som', registoIgual),
      tutor: {
        boasVindas: ['boas_vindas', 'Um mapa sensorial mostra onde a escola é escura, clara, calma ou barulhenta. Vamos recolher os dados?'],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'mk_registar', 'mk_luz')) && evs(a, 'botao:B').some(e => dentro(e, 'mk_registar', 'mk_som_nivel')),
        testar: 'Tens uma ideia? Vamos testar! Muda a luz, carrega em A; muda o som, carrega em B. Vê a tabela.',
        regras: [
          P.evento('botao:A', 'Cada sítio novo, uma medição. Que botão guarda a luz?'),
          P.bloco('botao:A', 'mk_registar', 'Mostrar no ecrã não chega: depois esquecemo-nos! Como é que o micro:bit guarda a medição?'),
          P.valorEm('botao:A', 'mk_registar', 'mk_luz', 'Estás a guardar sempre o mesmo número. O que é que o A devia guardar?'),
          P.evento('botao:B', 'E o som? Qual é o botão que o guarda?'),
          P.bloco('botao:B', 'mk_registar', 'O B já está à escuta. Como é que guarda o barulho na tabela?'),
          com('sem_som_no_B', P.valorEm('botao:B', 'mk_registar', 'mk_som_nivel', 'O B guarda… a coisa errada? Para o mapa precisamos do barulho.')),
        ],
        sucesso: 'Mapa sensorial a caminho! No micro:bit verdadeiro, abre o ficheiro MY_DATA.HTM da pasta MICROBIT: está lá a tua tabela.',
        extensao: 'Juntem as medições de todos os grupos numa planta da escola: pintem os sítios mais escuros e mais barulhentos.',
        gambiarra: {
          xml: xml(botao('A', seq(sReg('luz', B('mk_luz')))), botao('B', seq(sReg('som', B('mk_luz'))))),
          pedido: 'Andei pela escola toda… mas na minha tabela o som é sempre igual à luz! Que gambiarra fiz?',
        },
      },
    },
  ];

  // ============================================================ NÍVEL 3 · INVESTIGAR
  const N3 = [
    // ---------------------------------------------------------- 13 · Estação automática
    {
      titulo: 'Estação automática',
      missao: 'O micro:bit regista sozinho a luz, o som e a temperatura, de segundo a segundo.',
      passos: ['«para sempre» com três «registar dados»: luz, som e temperatura.', 'No fim, uma «pausa» de 1000 ms.', 'Experimenta: muda os três sensores e vê a tabela.'],
      material: 'micro:bit V2, pilhas',
      novos: ['cs_registar_temp'],
      caixa: ['mk_sempre', 'mk_registar', 'cs_registar_som', 'mk_luz', 'mk_som_nivel', 'mk_temperatura', 'mk_pausa', 'mk_mostrar_numero'],
      teste: 'luz',
      ok: r => acompanha(r, 'luz', registoIgual, 1) && acompanha(r, 'som', registoIgual, 1) && acompanha(r, 'temperatura', registoIgual, 1),
      tutor: {
        boasVindas: ['boas_vindas', 'Os cientistas não ficam ao pé dos aparelhos o dia todo: deixam uma estação a registar sozinha. Vamos construir uma?'],
        parecePronto: a => evs(a, 'sempre').some(e => dentro(e, 'mk_registar', 'mk_luz') && dentro(e, 'mk_registar', 'mk_som_nivel') && dentro(e, 'mk_registar', 'mk_temperatura')),
        testar: 'Tens uma ideia? Vamos testar! Muda a luz, o som e a temperatura, com calma, e vê a tabela crescer.',
        regras: [
          P.evento('sempre', 'A estação trabalha sozinha, sem botões. Que bloco repete sem parar?'),
          P.bloco('sempre', 'mk_registar', 'Já repete. E como é que guarda as medições na tabela?'),
          P.regra('falta_luz', a => evs(a, 'sempre').some(e => tem(e, 'mk_registar')) && !evs(a, 'sempre').some(e => dentro(e, 'mk_registar', 'mk_luz')), [
            'A estação já guarda alguma coisa. E a luz?',
            'Precisas de um «registar dados» para cada coisa que medes.',
            'Junta um «registar dados» com «nível de luz».',
          ], 'Luz na tabela!'),
          P.regra('falta_som', a => evs(a, 'sempre').some(e => tem(e, 'mk_registar')) && !evs(a, 'sempre').some(e => dentro(e, 'mk_registar', 'mk_som_nivel')), [
            'E o barulho? Também faz parte do lugar.',
            'Mais um «registar dados», agora para o som.',
            'Junta um «registar dados» com «nível de som».',
          ], 'Som na tabela!'),
          P.regra('falta_temperatura', a => evs(a, 'sempre').some(e => tem(e, 'mk_registar')) && !evs(a, 'sempre').some(e => dentro(e, 'mk_registar', 'mk_temperatura')), [
            'Falta uma coluna à tabela… Quente ou frio?',
            'O terceiro «registar dados» é para o calor.',
            'Junta um «registar dados» com «temperatura (°C)».',
          ], 'Temperatura na tabela!'),
          P.bloco('sempre', 'mk_pausa', 'Registar 50 vezes por segundo enche a memória num instante! Como é que a estação espera um bocadinho?', 'Agora regista com calma.'),
        ],
        sucesso: 'Estação automática a funcionar! Deixa-a num sítio meia hora e terás uma tabela cheia para fazer gráficos.',
        extensao: 'Experimenta pausas maiores: a tabela cresce mais devagar e as pilhas duram mais.',
        gambiarra: {
          xml: xml(sempre(seq(sReg('luz', B('mk_luz')), sReg('som', B('mk_luz')), sReg('temperatura', B('mk_luz')), sPausa(1000)))),
          pedido: 'A minha estação regista três colunas… mas os números são todos iguais! Acho que fiz copiar-colar a mais.',
        },
      },
    },

    // ---------------------------------------------------------- 14 · Recorde de barulho
    {
      titulo: 'Recorde de barulho',
      missao: 'O micro:bit guarda o barulho mais forte; o A mostra o recorde.',
      passos: ['«para sempre»: se «nível de som» > «recorde» então «definir recorde para» «nível de som».', 'No botão A: «mostrar número» com «recorde».', 'Experimenta: sobe e desce o som, depois carrega em A.'],
      material: 'micro:bit V2',
      novos: ['mk_se_entao', 'cs_definir_recorde', 'cs_var_recorde'],
      caixa: ['mk_sempre', 'mk_botao', 'cs_comparar_maior', 'mk_som_nivel', 'mk_mostrar_numero'],
      teste: 'botao:A',
      ok: r => {
        for (let i = 0; i < r.length; i++) {
          if (r[i].dir !== 'in' || r[i].v !== 'botao:A') continue;
          const sons = r.slice(0, i).filter(e => e.dir === 'in' && e.v.startsWith('som:')).map(e => valorDe(e.v));
          if (sons.length < 2) continue;
          const max = Math.max(...sons), ult = sons[sons.length - 1];
          if (max <= ult) continue;
          const guardados = new Set(r.slice(0, i).filter(e => e.dir === 'out' && e.v.startsWith('var:')).map(e => valorDe(e.v)));
          if (saidasApos(r, i).some(x => x.startsWith('numero:') && valorDe(x) >= max && valorDe(x) > ult && guardados.has(valorDe(x)))) return true;
        }
        return false;
      },
      tutor: {
        boasVindas: ['boas_vindas', 'Qual foi o barulho mais forte do intervalo? O micro:bit pode guardar o recorde!'],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_se_entao').some(p => usa(p, 'mk_som_nivel') && usa(p, 'mk_var')) && dentro(e, 'mk_var_definir', 'mk_som_nivel')) &&
          evs(a, 'botao:A').some(e => dentro(e, 'mk_mostrar_numero', 'mk_var')),
        testar: 'Tens uma ideia? Vamos testar! Sobe o som, desce-o outra vez e carrega em A.',
        regras: [
          P.evento('sempre', 'O recorde pode acontecer a qualquer momento. Que bloco está sempre atento?'),
          P.bloco('sempre', 'mk_se_entao', 'Só guardamos quando bate o recorde. Que bloco decide «só se»?'),
          P.valorEm('sempre', 'mk_se_entao', 'mk_comparar', 'O «se» precisa de uma pergunta: «este barulho é maior do que o recorde?».'),
          P.valorEm('sempre', 'mk_se_entao', 'mk_som_nivel', 'A pergunta tem de ouvir a sala. Que bloco ouve?'),
          com('compara_com_recorde', P.valorEm('sempre', 'mk_se_entao', 'mk_var', 'Comparar com um número fixo não chega. Com quem é que o barulho tem de competir?')),
          P.regra('comparacao_trocada', a => evs(a, 'sempre').some(e => blocos(e, 'mk_se_entao').some(p => { const c = comparacao(p); return c && c.primeiro === 'mk_som_nivel' && (c.op === '<' || c.op === '<='); })), [
            ['surpreendida', 'Guardas o barulho quando é MENOR do que o recorde? Assim o recorde nunca sobe!'],
            'Um recorde novo é maior do que o antigo.',
            'Muda a comparação para > (maior do que).',
          ], 'Agora o recorde sobe!'),
          P.bloco('sempre', 'mk_var_definir', 'Bateu o recorde! E agora, onde é que o micro:bit o guarda?'),
          P.valorEm('sempre', 'mk_var_definir', 'mk_som_nivel', 'Estás a guardar um número fixo. Qual é o número novo do recorde?'),
          P.evento('botao:A', 'O recorde está guardado. Como é que pedimos para o ver?'),
          P.bloco('botao:A', 'mk_mostrar_numero', 'O A já está à escuta. Como é que mostra o recorde?'),
          P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'Esse número não é o recorde… Onde é que ele ficou guardado?'),
        ],
        sucesso: 'Recorde guardado! Comparar e guardar o maior é um truque que se usa em todo o lado, das estações meteorológicas aos jogos.',
        extensao: 'E o silêncio mais profundo? Faz o recorde do mais baixo (começa num número alto, como 255).',
        gambiarra: {
          xml: xml(sempre(seq(sSeEntao(xCmp(B('mk_som_nivel'), '&lt;', xVar('recorde')), sDef('recorde', B('mk_som_nivel'))))), botao('A', seq(sNum(xVar('recorde'))))),
          pedido: 'O meu recorde está sempre a zero, mesmo depois de uma barulheira! Acho que troquei alguma coisa na comparação.',
        },
      },
    },

    // ---------------------------------------------------------- 15 · Média da luz
    {
      titulo: 'Média da luz',
      missao: 'Mede a luz em vários sítios com o B; o A mostra a média.',
      passos: ['No B: «mudar contador em 1» e «mudar medida em» «nível de luz».', 'No A: «mostrar número» com a conta «medida ÷ contador».', 'Experimenta: 3 medições com luzes diferentes, depois A.'],
      material: 'micro:bit',
      novos: ['cs_mudar_medida', 'cs_var_medida', 'mk_conta'],
      caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_luz', 'mk_mostrar_numero'],
      teste: 'botao:A',
      ok: r => {
        for (let i = 0; i < r.length; i++) {
          if (r[i].dir !== 'in' || r[i].v !== 'botao:A') continue;
          const vals = [];
          for (let j = 0; j < i; j++) if (r[j].dir === 'in' && r[j].v === 'botao:B') { const v = ultimoSensor(r, j, 'luz'); if (v !== null) vals.push(v); }
          if (vals.length < 2) continue;
          const media = Math.round(vals.reduce((s, x) => s + x, 0) / vals.length * 100) / 100;
          if (saidasApos(r, i).includes('numero:' + media)) return true;
        }
        return false;
      },
      tutor: {
        boasVindas: ['boas_vindas', 'Uma medição pode enganar: e se passou uma nuvem? A média de várias medições é mais justa.'],
        parecePronto: a => evs(a, 'botao:B').some(e => dentro(e, 'mk_var_mudar', 'mk_luz') && blocos(e, 'mk_var_mudar').some(p => !usa(p, 'mk_luz'))) &&
          evs(a, 'botao:A').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '/'))),
        testar: 'Tens uma ideia? Vamos testar! Faz três medições com o B, com luzes diferentes, e depois carrega em A.',
        regras: [
          P.evento('botao:B', 'Cada medição é um carregar de botão. Qual é o botão das medições?'),
          P.bloco('botao:B', 'mk_var_mudar', 'Para fazer a média temos de juntar as medições. Onde é que o micro:bit as vai somando?'),
          P.regra('sem_somar_luz', a => evs(a, 'botao:B').some(e => tem(e, 'mk_var_mudar')) && !evs(a, 'botao:B').some(e => dentro(e, 'mk_var_mudar', 'mk_luz')), [
            'Estás a somar sempre o mesmo número… E a luz que mediste?',
            'O «mudar medida em» pode somar um sensor em vez de um número.',
            'Encaixa «nível de luz» no «mudar medida em».',
          ], 'Agora soma a luz!'),
          P.regra('mesma_variavel', a => evs(a, 'botao:B').some(e => { const m = blocos(e, 'mk_var_mudar'); return m.length >= 2 && new Set(m.map(p => p.var)).size < m.length; }), [
            ['surpreendida', 'Ui! A soma e a conta estão na mesma caixinha. Assim misturam-se!'],
            'Cada coisa na sua variável: uma soma a luz, a outra conta as vezes.',
            'Escolhe «medida» num «mudar» e «contador» no outro.',
          ], 'Cada uma na sua caixinha!'),
          P.regra('sem_contar', a => evs(a, 'botao:B').some(e => dentro(e, 'mk_var_mudar', 'mk_luz')) && !evs(a, 'botao:B').some(e => blocos(e, 'mk_var_mudar').some(p => !usa(p, 'mk_luz'))), [
            'Já sabes a soma. Mas de quantas medições?',
            'Precisas de uma segunda variável que conte as vezes.',
            'Junta «mudar contador em 1» no botão B.',
          ], 'Agora conta as medições!'),
          P.evento('botao:A', 'A média aparece quando pedimos. Que botão fica para isso?'),
          P.bloco('botao:A', 'mk_mostrar_numero', 'O A já está à escuta. Como é que mostra a média?'),
          P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_conta', 'A média não está guardada em lado nenhum: tem de se calcular. Que bloco faz contas?'),
          P.regra('nao_divide', a => evs(a, 'botao:A').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta'))) &&
            !evs(a, 'botao:A').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '/'))), [
            ['a_pensar', 'A média não é a soma… O que é que se faz à soma para a repartir pelas medições?'],
            'Média = soma a dividir pelo número de medições.',
            'Muda a conta para ÷ e encaixa: «medida ÷ contador».',
          ], 'Isso é uma média!'),
        ],
        sucesso: 'Média calculada! Uma medição pode enganar; a média de várias é mais justa. Os cientistas fazem sempre assim.',
        extensao: 'Faz a média da temperatura da sala com cinco medições em sítios diferentes.',
        gambiarra: {
          xml: xml(botao('B', seq(`<block type="mk_var_mudar"><field name="VAR">contador</field>${N('V', 1)}`, `<block type="mk_var_mudar"><field name="VAR">medida</field>${V('V', B('mk_luz'))}`)),
            botao('A', seq(sNum(xVar('medida'))))),
          pedido: 'Fiz três medições e a média deu… 360? A luz só vai até 255! Que gambiarra fiz?',
        },
      },
    },

    // ---------------------------------------------------------- 16 · Porta ou pátio?
    {
      titulo: 'Porta ou pátio?',
      missao: 'Onde faz mais frio: à porta ou no pátio? O A regista a porta, o B o pátio.',
      passos: ['No A: «registar dados» com o nome porta e «temperatura (°C)».', 'No B: o mesmo, com o nome patio.', 'Experimenta: muda a temperatura entre o A e o B.'],
      material: 'micro:bit, pilhas',
      novos: [],
      caixa: ['mk_botao', 'mk_botao_B', 'mk_registar', 'mk_temperatura', 'mk_luz', 'mk_mostrar_numero'],
      teste: 'botao:A',
      ok: r => { const a = nomeRegisto(r, 'botao:A', 'temperatura'), b = nomeRegisto(r, 'botao:B', 'temperatura'); return !!a && !!b && a !== b; },
      tutor: {
        boasVindas: ['boas_vindas', 'Há quem diga que à porta da escola corre um vento gelado. Será verdade? Vamos medir e comparar dois sítios.'],
        parecePronto: a => {
          const nA = evs(a, 'botao:A').flatMap(e => blocos(e, 'mk_registar').filter(p => usa(p, 'mk_temperatura')).map(p => p.nome));
          const nB = evs(a, 'botao:B').flatMap(e => blocos(e, 'mk_registar').filter(p => usa(p, 'mk_temperatura')).map(p => p.nome));
          return nA.length > 0 && nB.length > 0 && nA.some(x => !nB.includes(x));
        },
        testar: 'Tens uma ideia? Vamos testar! Muda a temperatura, carrega em A; muda outra vez, carrega em B. Vê a tabela.',
        regras: [
          P.evento('botao:A', 'Primeiro sítio: a porta. Que botão a regista?'),
          P.bloco('botao:A', 'mk_registar', 'Como é que o A guarda a temperatura da porta na tabela?'),
          com('sem_temp_A', P.valorEm('botao:A', 'mk_registar', 'mk_temperatura', 'O A está a guardar outra coisa… Hoje medimos o calor!')),
          P.evento('botao:B', 'Segundo sítio: o pátio. Que botão fica para ele?'),
          P.bloco('botao:B', 'mk_registar', 'Como é que o B guarda a temperatura do pátio?'),
          com('sem_temp_B', P.valorEm('botao:B', 'mk_registar', 'mk_temperatura', 'O B está a guardar outra coisa… Também queremos o calor do pátio.')),
          P.regra('mesmo_nome', a => {
            const nA = evs(a, 'botao:A').flatMap(e => blocos(e, 'mk_registar').map(p => p.nome));
            const nB = evs(a, 'botao:B').flatMap(e => blocos(e, 'mk_registar').map(p => p.nome));
            return nA.length > 0 && nB.length > 0 && nA.every(x => nB.includes(x));
          }, [
            ['surpreendida', 'Ui! A porta e o pátio têm o mesmo nome na tabela. Depois como é que os distingues?'],
            'Cada sítio precisa do seu nome no «registar dados».',
            'Escreve porta no do A e patio no do B (no espaço do nome).',
          ], 'Cada sítio com o seu nome!'),
        ],
        sucesso: 'Comparação feita! Na tabela tens duas colunas, porta e patio: agora dá para ver onde faz mais frio.',
        extensao: 'Mede às 9h e ao meio-dia. A diferença entre a porta e o pátio muda ao longo do dia?',
        gambiarra: {
          xml: xml(botao('A', seq(sReg('luz', B('mk_temperatura')))), botao('B', seq(sReg('luz', B('mk_temperatura'))))),
          pedido: 'Medi a porta e o pátio… mas na tabela aparece tudo com o mesmo nome e já não sei qual é qual!',
        },
      },
    },

    // ---------------------------------------------------------- 17 · Planta com sede
    {
      titulo: 'Planta com sede',
      missao: 'Dois pregos na terra medem a humidade; se a planta tiver sede, o micro:bit apita.',
      passos: ['Pregos na terra, com crocodilos ao pin 1 e ao GND.', '«para sempre»: gráfico de «leitura analógica pin P1» até 1023.', 'Se a leitura < 300, «tocar tom». Experimenta com o controlo do pin 1.'],
      material: 'micro:bit, 2 pregos, 2 crocodilos, um vaso com terra',
      novos: ['mk_ler_analogico', 'mk_tom'],
      caixa: ['mk_sempre', 'mk_grafico', 'mk_se_entao', 'mk_comparar', 'mk_icone_triste', 'mk_pausa'],
      sim: ['analogico:P1'],
      teste: 'analogico:P1',
      ok: r => acompanha(r, 'analogico:P1', grafIgual(1023)) &&
        aposSensor(r, 'analogico:P1', v => v <= 200, s => s.some(x => x.startsWith('tom:'))) &&
        aposSensor(r, 'analogico:P1', v => v >= 600, s => s.length > 0 && !s.some(x => x.startsWith('tom:'))),
      tutor: {
        boasVindas: ['boas_vindas', 'Na horta da escola, quem se lembra de regar? Vamos pôr o micro:bit de guarda à terra.'],
        parecePronto: a => evs(a, 'sempre').some(e => blocos(e, 'mk_grafico').some(p => usa(p, 'mk_ler_analogico') && Number(p.max) === 1023) &&
          blocos(e, 'mk_se_entao').some(p => usa(p, 'mk_ler_analogico')) && tem(e, 'mk_tom')),
        testar: 'Tens uma ideia? Vamos testar! Põe o pin 1 alto (terra molhada) e depois baixo (terra seca).',
        regras: [
          P.evento('sempre', 'A guardiã nunca dorme. Que bloco repete sem parar?'),
          P.bloco('sempre', 'mk_grafico', 'Como é que vemos de relance se a terra está molhada?'),
          P.valorEm('sempre', 'mk_grafico', 'mk_ler_analogico', 'O gráfico tem de mostrar a terra. Quem é que lê o que se passa entre os pregos?'),
          maxErrado('sempre', 1023, 'A leitura analógica vai de 0 a 1023 — não de 0 a 255.'),
          P.bloco('sempre', 'mk_se_entao', 'E quando a terra está seca? O micro:bit tem de decidir quando chamar alguém.'),
          com('sem_leitura_no_se', P.valorEm('sempre', 'mk_se_entao', 'mk_ler_analogico', 'A pergunta do «se» tem de olhar para a terra. Que bloco a lê?')),
          P.regra('sede_trocada', a => evs(a, 'sempre').some(e => blocos(e, 'mk_se_entao').some(p => { const c = comparacao(p); return c && c.primeiro === 'mk_ler_analogico' && (c.op === '>' || c.op === '>='); })), [
            ['surpreendida', 'Ela apita quando a terra está molhada? Terra seca deixa passar pouca eletricidade…'],
            'Terra seca = leitura baixa. A pergunta é «a leitura é menor do que 300?».',
            'Muda a comparação para < (menor do que).',
          ], 'Agora apita com sede!'),
          P.bloco('sempre', 'mk_tom', 'Já sabe que a planta tem sede… Como é que ela chama por nós?'),
        ],
        sucesso: 'A planta já sabe pedir água! Terra molhada deixa passar mais eletricidade entre os pregos; terra seca, menos.',
        extensao: 'Registem a humidade todas as manhãs durante uma semana. Quando é que a horta precisa mesmo de água?',
        gambiarra: {
          xml: xml(sempre(seq(sGraf('<block type="mk_ler_analogico"><field name="P">P1</field></block>', 255),
            sSeEntao(xCmp('<block type="mk_ler_analogico"><field name="P">P1</field></block>', '&lt;', 300), sTom())))),
          pedido: 'A minha planta parece sempre bem regada, mesmo com a terra seca! O gráfico está quase sempre cheio… Que número enganei?',
        },
      },
    },

    // ---------------------------------------------------------- 18 · Desafio do silêncio
    {
      titulo: 'Desafio do silêncio',
      missao: 'Quanto tempo aguenta a turma calada? O A começa; o primeiro barulho forte mostra os segundos.',
      passos: ['No A: «definir medida para» «tempo de execução (ms)».', '«em som alto»: «mostrar número» com (tempo − medida) ÷ 1000.', 'Experimenta: A, espera um pouco, bate palmas.'],
      material: 'micro:bit V2',
      novos: ['mk_tempo'],
      caixa: ['mk_botao', 'mk_som_alto', 'cs_definir_medida', 'cs_var_medida', 'mk_conta', 'mk_mostrar_numero', 'mk_icone'],
      teste: 'somalto',
      ok: r => {
        for (let i = 0; i < r.length; i++) {
          if (r[i].dir !== 'in' || r[i].v !== 'somalto') continue;
          let tA = null;
          for (let j = i - 1; j >= 0; j--) if (r[j].dir === 'in' && r[j].v === 'botao:A') { tA = r[j].t; break; }
          if (tA === null) continue;
          const esperado = (r[i].t - tA) / 1000;
          if (saidasApos(r, i).some(x => x.startsWith('numero:') && Math.abs(valorDe(x) - esperado) <= 0.4)) return true;
        }
        return false;
      },
      tutor: {
        boasVindas: ['boas_vindas', 'Desafio para a turma: quantos segundos conseguem estar em silêncio? O micro:bit é o árbitro.'],
        parecePronto: a => evs(a, 'botao:A').some(e => dentro(e, 'mk_var_definir', 'mk_tempo')) &&
          evs(a, 'somalto').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '/') &&
            (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '-'))),
        testar: 'Tens uma ideia? Vamos testar! Carrega em A, espera uns segundos e bate palmas.',
        regras: [
          P.evento('botao:A', 'O cronómetro começa com um botão. Qual?'),
          P.bloco('botao:A', 'mk_var_definir', 'Para saber quanto tempo passou, primeiro guardamos a hora de partida. Onde?'),
          P.valorEm('botao:A', 'mk_var_definir', 'mk_tempo', 'Estás a guardar um número fixo. O micro:bit tem um relógio que conta desde que ligou…'),
          P.evento('somalto', 'O desafio acaba no primeiro barulho forte. Que bloco acorda com barulho?'),
          P.bloco('somalto', 'mk_mostrar_numero', 'Alguém fez barulho! Como é que o micro:bit mostra quanto tempo aguentaram?'),
          P.valorEm('somalto', 'mk_mostrar_numero', 'mk_conta', 'O tempo do silêncio tem de se calcular. Que bloco faz contas?'),
          P.regra('sem_subtrair', a => evs(a, 'somalto').some(e => blocos(e, 'mk_mostrar_numero').some(p => usa(p, 'mk_conta'))) &&
            !evs(a, 'somalto').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '-'))), [
            ['a_pensar', 'O relógio conta desde que o micro:bit ligou, não desde o A… Como tiras o tempo que já tinha passado?'],
            'Tempo do silêncio = tempo agora − tempo guardado no A.',
            'Faz a conta «tempo de execução − medida».',
          ], 'Isso, a diferença!'),
          P.regra('sem_segundos', a => evs(a, 'somalto').some(e => blocos(e, 'mk_mostrar_numero').some(p => usa(p, 'mk_conta'))) &&
            !evs(a, 'somalto').some(e => blocos(e, 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta' && u.op === '/'))), [
            ['surpreendida', 'Milhares de segundos de silêncio? Isso era mais de meia hora!'],
            'O micro:bit conta em milésimos de segundo: 1000 ms = 1 segundo.',
            'Divide a diferença por 1000 com outra conta ÷.',
          ], 'Agora sim, segundos!'),
        ],
        sucesso: 'Cronómetro do silêncio pronto! O micro:bit mede o tempo em milésimos de segundo: 1000 ms são 1 segundo.',
        extensao: 'Guardem o melhor tempo da turma com o truque do recorde!',
        gambiarra: {
          xml: xml(botao('A', seq(sDef('medida', B('mk_tempo')))), somalto(seq(sNum(xConta(B('mk_tempo'), '-', xVar('medida')))))),
          pedido: 'Fiz o desafio do silêncio e a turma aguentou… 2357 segundos?! Isso é mais de meia hora! Acho que me esqueci de alguma coisa.',
        },
      },
    },

    // ---------------------------------------------------------- livre
    {
      titulo: 'Inventa a tua estação',
      missao: 'Inventa um aparelho que mede e ajuda a escola.',
      passos: ['Tens os sensores, os gráficos, as variáveis e o registo de dados.', 'Ideia: um aviso de «hora de abrir a janela» com luz, som e calor.'],
      material: 'o que precisares',
      novos: [],
      caixa: ['mk_sempre', 'mk_iniciar', 'mk_botao', 'mk_botao_B', 'mk_som_alto', 'mk_se_senao', 'cs_comparar_maior', 'mk_luz', 'mk_som_nivel', 'mk_temperatura',
        'mk_ler_analogico', 'mk_mostrar_numero', 'mk_grafico', 'mk_icone', 'mk_registar', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_tom', 'mk_pausa'],
      livre: true,
      ok: () => false,
      tutor: {
        boasVindas: ['testar', 'Tens uma ideia? Vamos testar! Agora tens todos os sensores: inventa um aparelho para medir a tua escola. Se precisares de mim, estou aqui.'],
        parecePronto: () => false,
        testar: '',
        regras: [],
        sucesso: '',
        extensao: '',
      },
    },
  ];

  F.registarMissao({
    id: 'citizen-sensing',
    titulo: 'Citizen sensing',
    tema: 'Medir o lugar',
    descricao: 'Mede o som, a luz e a temperatura da escola e faz um mapa sensorial.',
    cor: '#00a4a6',
    xml: XMLS,
    niveis: [
      { nome: 'Nível 1 · Medir', desafios: N1 },
      { nome: 'Nível 2 · Decidir', desafios: N2 },
      { nome: 'Nível 3 · Investigar', desafios: N3 },
    ],
  });
})();
