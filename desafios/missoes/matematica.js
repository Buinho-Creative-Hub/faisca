/* Missão «Matemática» — contar, medir, padrões.
 *
 * Números, operações, padrões, coordenadas, medida e acaso (1.º/2.º ciclo), com o micro:bit como
 * contador, dado, cronómetro e quadro de luzes. Três níveis:
 *   1 · Números         — mostrar, contar para cima e para baixo, acaso, dois contadores
 *   2 · Contas e padrões — tabuada, dobro, par/ímpar, coordenadas, soma, probabilidade
 *   3 · Jogos de números — fração em barra, metas, cronómetro, potências, máximo, adivinha
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 * A validação é sempre pelo comportamento (o que aparece no ecrã depois de cada botão/gesto).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { tem, blocos, dentro } = F.ajudasTutor;
  const { causou } = F.verif;

  // ------------------------------------------------------------ XML (caixa e gambiarras)
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const V = (nome, inner) => `<value name="${nome}">${inner}</value>`;
  const vr = k => `<block type="mk_var"><field name="VAR">${k}</field></block>`;
  const conta = (a, op, b) => `<block type="mk_conta"><field name="OP">${op}</field>${a}${b}</block>`;
  const cmp = (op, a, b) => `<block type="mk_comparar"><field name="OP">${op}</field>${a}${b}</block>`;
  const acaso = (a, b) => `<block type="mk_aleatorio">${N('A', a)}${N('B', b)}</block>`;
  const I = (tipo, interior = '') => [`<block type="${tipo}">${interior}`, '</block>'];
  const seq = (...ins) => { ins = ins.filter(Boolean); if (!ins.length) return ''; const r = seq(...ins.slice(1)); return ins[0][0] + (r ? `<next>${r}</next>` : '') + ins[0][1]; };
  let yy = 0;
  const ev = (tipo, campos, corpo) => { yy += 170; return `<block type="${tipo}" x="40" y="${yy}">${campos}<statement name="DO">${corpo}</statement></block>`; };
  const prog = (...bs) => { const x = '<xml>' + bs.join('') + '</xml>'; yy = 0; return x; };
  const BA = c => ev('mk_botao', '', c), BB = c => ev('mk_botao', '<field name="B">B</field>', c);
  const BAB = c => ev('mk_botao', '<field name="B">AB</field>', c), AG = c => ev('mk_agitar', '', c), INI = c => ev('mk_iniciar', '', c);
  const numero = inner => I('mk_mostrar_numero', V('N', inner));
  const numeroN = n => I('mk_mostrar_numero', N('N', n));
  const definir = (k, inner) => I('mk_var_definir', `<field name="VAR">${k}</field>` + V('V', inner));
  const definirN = (k, n) => I('mk_var_definir', `<field name="VAR">${k}</field>` + N('V', n));
  const mudar = (k, n) => I('mk_var_mudar', `<field name="VAR">${k}</field>` + N('V', n));
  const pausa = ms => I('mk_pausa', `<value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`);
  const icone = n => I('mk_icone', `<field name="I">${n}</field>`);
  const repetir = (n, ...c) => I('mk_repetir', N('N', n) + `<statement name="DO">${seq(...c)}</statement>`);
  const se = (c, sim, nao) => I('mk_se', V('C', c) + `<statement name="SIM">${seq(...sim)}</statement><statement name="NAO">${seq(...nao)}</statement>`);
  const seEntao = (c, ...corpo) => I('mk_se_entao', V('C', c) + `<statement name="SIM">${seq(...corpo)}</statement>`);

  const XML = {
    mt_mudar_menos: `<block type="mk_var_mudar"><field name="VAR">contador</field>${N('V', -1)}</block>`,
    mt_mudar_passos: `<block type="mk_var_mudar"><field name="VAR">passos</field>${N('V', 1)}</block>`,
    mt_var_passos: vr('passos'),
    mt_mudar_pontos: `<block type="mk_var_mudar"><field name="VAR">pontos</field>${N('V', 1)}</block>`,
    mt_definir_pontos: `<block type="mk_var_definir"><field name="VAR">pontos</field>${N('V', 0)}</block>`,
    mt_var_pontos: vr('pontos'),
    mt_definir_medida: `<block type="mk_var_definir"><field name="VAR">medida</field>${N('V', 0)}</block>`,
    mt_var_medida: vr('medida'),
    mt_conta_vezes: conta(N('A', 0), '*', N('B', 2)),
    mt_conta_menos: conta(N('A', 0), '-', N('B', 0)),
    mt_conta_div: conta(N('A', 0), '/', N('B', 1000)),
    mt_comparar_igual: cmp('==', N('A', 0), N('B', 0)),
  };

  // ------------------------------------------------------------ verificação
  // Divide o registo em «segmentos»: cada entrada (botão, gesto…) com as saídas que vieram a seguir,
  // e o valor das variáveis no momento dessa entrada.
  function segs(reg) {
    const out = []; let cur = null; const vars = {};
    for (const e of reg) {
      if (e.dir === 'in') { cur = { v: e.v, t: e.t, outs: [], vars: Object.assign({}, vars) }; out.push(cur); continue; }
      if (e.v.startsWith('var:')) { const p = e.v.split(':'); vars[p[1]] = Number(p[2]); }
      if (cur) cur.outs.push(e.v);
    }
    return out;
  }
  const nums = outs => outs.filter(v => v.startsWith('numero:')).map(v => Number(v.slice(7)));
  const ultimo = l => l[l.length - 1];

  // ------------------------------------------------------------ ajudas para as regras
  const evA = a => a.evento('botao:A'), evB = a => a.evento('botao:B');
  const usa = p => p.usa || [];
  const varsDe = p => usa(p).filter(u => u.tipo === 'mk_var').map(u => u.var);
  const numsDe = p => usa(p).filter(u => u.tipo === 'mk_num').map(u => u.n);
  const temOp = (p, op) => usa(p).some(u => u.tipo === 'mk_conta' && u.op === op);
  const comAcaso = ev => blocos(ev, 'mk_var_definir').filter(p => usa(p).some(u => u.tipo === 'mk_aleatorio'));
  // limites do «escolher ao acaso» dentro de um bloco: [de, até]
  function limites(p) {
    const u = usa(p), i = u.findIndex(x => x.tipo === 'mk_aleatorio');
    if (i < 0) return null;
    const n = u.slice(i + 1).filter(x => x.tipo === 'mk_num').slice(0, 2).map(x => x.n);
    return n.length === 2 ? n : null;
  }
  const seDe = ev => blocos(ev, 'mk_se')[0] || blocos(ev, 'mk_se_entao')[0];
  const icDe = l => (l || []).filter(p => p.tipo === 'mk_icone').map(p => p.icone);
  const mostraVar = l => (l || []).filter(p => p.tipo === 'mk_mostrar_numero').flatMap(varsDe);

  // =============================================================== NÍVEL 1 · Números
  const SORTE = {
    titulo: 'O número da sorte',
    missao: 'Quando carregas no A, o micro:bit mostra o número 7.',
    passos: ['Arrasta «no botão A premido».', 'Põe lá dentro «mostrar número».', 'Escreve 7 e experimenta: carrega no A.'],
    material: 'micro:bit',
    novos: ['mk_botao', 'mk_mostrar_numero'],
    caixa: ['mk_agitar', 'mk_icone'],
    teste: 'botao:A',
    ok: r => causou(r, s => s.includes('numero:7'), v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', '{ola} Hoje os números mandam! Primeiro desafio: o micro:bit mostra o número da sorte, o 7.'],
      parecePronto: a => blocos(evA(a), 'mk_mostrar_numero').some(p => p.n === 7),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Como é que o micro:bit sabe que carregaste no botão A?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O micro:bit já sente o botão. E onde é que ele mostra um número?'), { id: 'sem_mostrar' }),
        P.regra('numero_errado', a => blocos(evA(a), 'mk_mostrar_numero').length > 0 && !blocos(evA(a), 'mk_mostrar_numero').some(p => p.n === 7), [
          ['surpreendida', 'Esse número é o 7? Conta pelos dedos…'],
          'Carrega no número branco do bloco e escreve outro.',
          'Escreve 7 dentro de «mostrar número».',
        ], 'Sete! Conta certa.'),
      ],
      sucesso: 'Sete! O micro:bit já sabe mostrar números. Daqui para a frente, eles vão mexer-se.',
      extensao: 'E se o B mostrasse a tua idade?',
      gambiarra: {
        xml: prog(BA(seq(numeroN(1)))),
        pedido: 'Carrego no A e aparece o 1! Fiz uma gambiarra… Ajudas-me a encontrar o 7?',
      },
    },
  };

  const CONTADOR = {
    titulo: 'Mais um, menos um',
    missao: 'O A soma 1 ao contador, o B tira 1. E o micro:bit mostra sempre quanto vai.',
    passos: ['No A: «mudar contador em 1» e mostrar o bloco «contador».', 'No B: «mudar contador em -1» e mostrar outra vez.', 'Experimenta: A, A, B.'],
    material: 'micro:bit',
    novos: ['mk_var_mudar', 'mt_mudar_menos', 'mk_var', 'mk_botao_B'],
    caixa: ['mk_botao', 'mk_mostrar_numero'],
    teste: 'botao:A',
    // cada A mostra o anterior + 1; cada B o anterior − 1 (começa em 0)
    ok: r => {
      let ant = 0, subiu = false, desceu = false;
      for (const s of segs(r)) {
        const ns = nums(s.outs);
        if (!ns.length || (s.v !== 'botao:A' && s.v !== 'botao:B')) continue;
        const x = ultimo(ns);
        if (s.v === 'botao:A') { if (x !== ant + 1) return false; subiu = true; }
        else { if (x !== ant - 1) return false; desceu = true; }
        ant = x;
      }
      return subiu && desceu;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um contador, como os das portas dos museus: entra um, soma; sai um, tira.'],
      parecePronto: a => blocos(evA(a), 'mk_var_mudar').some(p => p.n > 0) && mostraVar(evA(a)?.plano).length > 0 &&
        blocos(evB(a), 'mk_var_mudar').some(p => p.n < 0) && mostraVar(evB(a)?.plano).length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega A, A e depois B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Para contar, o que tem de acontecer de cada vez que carregas no A?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Cada vez que carregas no A, o número cresce. Mas onde fica guardado o número?'), { id: 'a_sem_mudar' }),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O contador já cresce, mas às escondidas. Como é que o vemos?'), { id: 'a_sem_mostrar' }),
        Object.assign(P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O número que aparece muda? Ou é sempre o mesmo?'), { id: 'mostra_sem_var' }),
        Object.assign(P.evento('botao:B', 'E para tirar um? Que botão vai fazer o contrário?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_var_mudar', 'O B tem de tirar um ao contador. Que bloco muda o contador?'), { id: 'b_sem_mudar' }),
        P.regra('b_soma', a => blocos(evB(a), 'mk_var_mudar').length > 0 && !blocos(evB(a), 'mk_var_mudar').some(p => p.n < 0), [
          'O B também soma? Então quando é que o número desce?',
          'Para tirar, o «mudar» leva um número negativo.',
          'No B, escreve -1 no «mudar contador em».',
        ], 'Agora o B tira um!'),
        Object.assign(P.bloco('botao:B', 'mk_mostrar_numero', 'Depois de tirar, como sabes quanto ficou?'), { id: 'b_sem_mostrar' }),
      ],
      sucesso: 'Contador a funcionar! Somar 1 e tirar 1 são contas que fazes de cabeça — agora o micro:bit também.',
      extensao: 'E se o A+B pusesse o contador outra vez a 0?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1), numero(vr('contador')))), BB(seq(mudar('contador', 1), numero(vr('contador'))))),
        pedido: 'O meu contador só sobe! Carrego no B e ele soma em vez de tirar. Encontras a gambiarra?',
      },
    },
  };

  const PASSOS = {
    titulo: 'Conta-passos',
    missao: 'Cada vez que agitas, conta um passo. O A mostra quantos passos já deste.',
    passos: ['«em agitar»: «mudar passos em 1».', '«no botão A premido»: mostrar o número «passos».', 'Agita 3 vezes e carrega no A.'],
    material: 'micro:bit (podes prendê-lo ao sapato)',
    novos: ['mk_agitar', 'mt_mudar_passos', 'mt_var_passos'],
    caixa: ['mk_botao', 'mk_mostrar_numero'],
    teste: 'agitar',
    ok: r => {
      let n = 0, bom = false;
      for (const s of segs(r)) {
        if (s.v === 'agitar') n++;
        else if (s.v === 'botao:A') { const ns = nums(s.outs); if (!ns.length || ultimo(ns) !== n) return false; if (n > 0) bom = true; }
      }
      return bom;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um conta-passos! Cada passo abana o micro:bit. Quantos passos dás até à porta?'],
      parecePronto: a => blocos(a.evento('agitar'), 'mk_var_mudar').some(p => p.n > 0) && mostraVar(evA(a)?.plano).length > 0,
      testar: 'Tens uma ideia? Vamos testar! Agita três vezes e carrega no A.',
      regras: [
        Object.assign(P.evento('agitar', 'Como é que o micro:bit percebe que deste um passo?'), { id: 'sem_agitar' }),
        Object.assign(P.bloco('agitar', 'mk_var_mudar', 'Sentiu o passo! Mas onde fica guardada a conta dos passos?'), { id: 'agitar_sem_mudar' }),
        Object.assign(P.evento('botao:A', 'Os passos estão contados. Como é que os vês quando quiseres?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O A já está à escuta. E o que faz ele com os passos?'), { id: 'a_sem_mostrar' }),
        Object.assign(P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O número que aparece é o dos passos? Ou é sempre o mesmo?'), { id: 'mostra_sem_var' }),
        P.regra('variaveis_diferentes', a => {
          const c = blocos(a.evento('agitar'), 'mk_var_mudar').map(p => p.var), m = mostraVar(evA(a)?.plano);
          return c.length > 0 && m.length > 0 && !m.some(x => c.includes(x));
        }, [
          'Contas numa variável e mostras outra? Qual delas tem os passos?',
          'Carrega na setinha do bloco da variável para escolher outra.',
          'Mostra a mesma variável que o «mudar» faz crescer: «passos».',
        ], 'Mesma variável, conta certa!'),
      ],
      sucesso: 'Conta-passos pronto! Somar 1 de cada vez é a forma mais antiga de contar — como os riscos num pau.',
      extensao: 'Prende o micro:bit ao sapato e conta os passos da sala ao recreio. E de volta, são os mesmos?',
      gambiarra: {
        xml: prog(AG(seq(definirN('passos', 1))), BA(seq(numero(vr('passos'))))),
        pedido: 'Agito, agito, agito… e o meu conta-passos diz sempre 1! Que gambiarra fiz?',
      },
    },
  };

  const DECRESCENTE = {
    titulo: 'Contagem decrescente',
    missao: 'O foguetão conta 5, 4, 3, 2, 1… e parte!',
    passos: ['No A: «definir contador para 5».', '«repetir 5 vezes»: mostrar contador, «mudar contador em -1», pausa.', 'No fim, o ícone surpreendido: o foguetão partiu!'],
    material: 'micro:bit',
    novos: ['mk_var_definir', 'mk_repetir', 'mt_mudar_menos', 'mk_pausa', 'mk_icone_surpreendido'],
    caixa: ['mk_botao', 'mk_mostrar_numero', 'mk_var'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const ns = nums(s).join(',');
      const i1 = s.lastIndexOf('numero:1'), is = s.lastIndexOf('icone:Surprised');
      return ns.includes('5,4,3,2,1') && i1 >= 0 && is > i1;
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Atenção, base de lançamento! O foguetão conta para trás: 5, 4, 3, 2, 1… e lá vai ele.'],
      parecePronto: a => {
        const e = evA(a);
        return blocos(e, 'mk_var_definir').some(p => p.n === 5) && blocos(e, 'mk_repetir').some(p => p.n === 5) &&
          blocos(e, 'mk_var_mudar').some(p => p.n < 0) && mostraVar(e?.plano).length > 0 && tem(e, 'mk_icone');
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e conta com o micro:bit.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão carrega na ignição do foguetão?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_definir', 'De que número começa a contagem?'), { id: 'sem_comeco' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'Vais escrever cinco vezes os mesmos blocos? Há uma maneira de repetir.'), { id: 'sem_repetir' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'O número fica sempre igual. O que tem de mudar de cada vez?'), { id: 'sem_descer' }),
        P.regra('conta_sobe', a => blocos(evA(a), 'mk_var_mudar').length > 0 && !blocos(evA(a), 'mk_var_mudar').some(p => p.n < 0), [
          ['surpreendida', 'Os números estão a subir! Numa contagem decrescente, o que acontece?'],
          'Para descer, o «mudar contador em» leva um número negativo.',
          'Escreve -1 no «mudar contador em».',
        ], 'Agora desce!'),
        P.regra('poucas_vezes', a => blocos(evA(a), 'mk_repetir').some(p => p.n < 5), [
          'O foguetão parou antes do 1. Quantos números há de 5 até 1?',
          'O número do «repetir» é quantas voltas dá.',
          'Escreve 5 no «repetir … vezes».',
        ], 'Cinco voltas, cinco números!'),
        Object.assign(P.bloco('botao:A', 'mk_icone', 'Contagem feita… e o foguetão? Como mostras que partiu?'), { id: 'sem_partida' }),
      ],
      sucesso: '5, 4, 3, 2, 1… descolagem! Contar para trás é tirar 1 de cada vez.',
      extensao: 'E se a contagem começasse no 9? Que números mudavas?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 5), repetir(5, numero(vr('contador')), mudar('contador', 1), pausa(200)), icone('Surprised')))),
        pedido: 'O meu foguetão conta 5, 6, 7, 8… e nunca mais parte! Encontras a gambiarra?',
      },
    },
  };

  const DADO = {
    titulo: 'Lança o dado',
    missao: 'Agita o micro:bit e ele mostra um número ao acaso, de 1 a 6, como um dado.',
    passos: ['«em agitar»: «mostrar número».', 'Dentro dele: «escolher ao acaso de 1 até 6».', 'Agita várias vezes: sai sempre o mesmo?'],
    material: 'micro:bit',
    novos: ['mk_aleatorio'],
    caixa: ['mk_agitar', 'mk_mostrar_numero', 'mk_botao'],
    teste: 'agitar',
    ok: r => {
      const l = segs(r).filter(s => s.v === 'agitar').map(s => ultimo(nums(s.outs))).filter(x => x !== undefined);
      return l.length >= 4 && l.every(x => Number.isInteger(x) && x >= 1 && x <= 6) && new Set(l).size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Esqueceste-te do dado em casa? Não faz mal: o micro:bit vira dado!'],
      parecePronto: a => blocos(a.evento('agitar'), 'mk_mostrar_numero').some(p => { const l = limites(p); return l && l[0] === 1 && l[1] === 6; }),
      testar: 'Tens uma ideia? Vamos testar! Agita várias vezes.',
      regras: [
        Object.assign(P.evento('agitar', 'Com um dado a sério, o que fazes antes de o lançar?'), { id: 'sem_agitar' }),
        Object.assign(P.bloco('agitar', 'mk_mostrar_numero', 'O micro:bit já sente que o agitas. Onde é que aparece o número do dado?'), { id: 'sem_mostrar' }),
        Object.assign(P.valorEm('agitar', 'mk_mostrar_numero', 'mk_aleatorio', 'Um dado dá sempre o mesmo número? O que tem de ser diferente?'), { id: 'sem_acaso' }),
        P.regra('limites', a => blocos(a.evento('agitar'), 'mk_mostrar_numero').some(p => { const l = limites(p); return l && !(l[0] === 1 && l[1] === 6); }), [
          'Um dado tem quantas faces? E qual é o número mais pequeno?',
          'Os dois números do «escolher ao acaso» são o mais pequeno e o maior.',
          'Escreve 1 e 6 no «escolher ao acaso».',
        ], 'De 1 a 6, como um dado a sério!'),
      ],
      sucesso: 'Dado pronto! Cada número tem a mesma hipótese de sair: 1 em 6.',
      extensao: 'Agita 12 vezes e aponta os números. Saíram todos? Algum saiu mais vezes?',
      gambiarra: {
        xml: prog(AG(seq(numero(acaso(1, 60))))),
        pedido: 'O meu dado deu 37! Que dado é este? Encontras a gambiarra?',
      },
    },
  };

  const PLACAR = {
    titulo: 'Placar',
    missao: 'Jogo a dois: o A dá pontos à equipa A, o B à equipa B. O A+B mostra o resultado.',
    passos: ['A: «mudar contador em 1». B: «mudar pontos em 1».', 'A+B: mostrar contador, pausa, mostrar pontos.', 'Experimenta: A, A, B e depois A+B.'],
    material: 'micro:bit',
    novos: ['mk_botao_AB', 'mt_mudar_pontos', 'mt_var_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:AB',
    ok: r => {
      let a = 0, b = 0, bom = false;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') a++;
        else if (s.v === 'botao:B') b++;
        else if (s.v === 'botao:AB') {
          const ns = nums(s.outs);
          if (ns.length < 2 || ns[0] !== a || ns[1] !== b) return false;
          if (a !== b) bom = true;
        }
      }
      return bom;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo a dois! Precisamos de um placar que conte os pontos de cada equipa.'],
      parecePronto: a => {
        const ma = blocos(evA(a), 'mk_var_mudar').map(p => p.var), mb = blocos(evB(a), 'mk_var_mudar').map(p => p.var);
        const ab = mostraVar(a.evento('botao:AB')?.plano);
        return ma.length > 0 && mb.length > 0 && !ma.some(x => mb.includes(x)) && ab.includes(ma[0]) && ab.includes(mb[0]);
      },
      testar: 'Tens uma ideia? Vamos testar! A, A, B… e A+B para ver o resultado.',
      regras: [
        Object.assign(P.evento('botao:A', 'Cada equipa tem o seu botão. Onde se marca um ponto da equipa A?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'A equipa A marcou! Onde fica guardado o ponto?'), { id: 'a_sem_mudar' }),
        Object.assign(P.evento('botao:B', 'E a equipa B, carrega em quê?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_var_mudar', 'A equipa B também marca. Onde guardas os pontos dela?'), { id: 'b_sem_mudar' }),
        P.regra('mesma_conta', a => {
          const ma = blocos(evA(a), 'mk_var_mudar').map(p => p.var), mb = blocos(evB(a), 'mk_var_mudar').map(p => p.var);
          return ma.length > 0 && mb.length > 0 && ma.some(x => mb.includes(x));
        }, [
          ['surpreendida', 'As duas equipas marcam no mesmo sítio? Como sabes quem ganhou?'],
          'Cada equipa precisa da sua variável: contador para uma, pontos para a outra.',
          'No B, carrega na setinha do «mudar» e escolhe «pontos».',
        ], 'Cada equipa com os seus pontos!'),
        Object.assign(P.evento('botao:AB', 'O jogo acabou. Como é que vês o resultado das duas equipas?'), { id: 'sem_ab' }),
        Object.assign(P.bloco('botao:AB', 'mk_mostrar_numero', 'O A+B já está à escuta. O que mostra ele?'), { id: 'ab_sem_mostrar' }),
        P.regra('so_uma_equipa', a => new Set(mostraVar(a.evento('botao:AB')?.plano)).size < 2, [
          'Mostras só uma equipa? E a outra?',
          'Precisas de dois «mostrar número»: um com cada variável.',
          'No A+B: mostra contador, uma pausa, e mostra pontos.',
        ], 'Agora vê-se o resultado todo!'),
      ],
      sucesso: 'Placar pronto! Duas variáveis, duas contas ao mesmo tempo.',
      extensao: 'E se o A+B mostrasse também a diferença de pontos?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1))), BB(seq(mudar('contador', 1))), BAB(seq(numero(vr('contador')), pausa(500), numero(vr('pontos'))))),
        pedido: 'No meu placar a equipa B tem sempre 0 pontos, por mais que carregue no B! Encontras a gambiarra?',
      },
    },
  };

  // =============================================================== NÍVEL 2 · Contas e padrões
  const TABUADA = {
    titulo: 'Tabuada do 3',
    missao: 'Cada vez que carregas no A, salta para o número seguinte da tabuada do 3: 3, 6, 9…',
    passos: ['No A: mudar o contador em 3.', 'Depois mostra o contador.', 'Carrega no A três vezes: 3, 6, 9?'],
    material: 'micro:bit',
    novos: ['mk_var_mudar'],
    caixa: ['mk_botao', 'mk_var', 'mk_mostrar_numero', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:A',
    ok: r => {
      let i = 0;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs); if (!ns.length) continue;
        i++; if (ultimo(ns) !== 3 * i) return false;
      }
      return i >= 3;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'A tabuada do 3 é uma escada: cada degrau sobe 3. Vamos subi-la com o micro:bit?'],
      parecePronto: a => {
        const pl = evA(a)?.plano || [];
        const im = pl.findIndex(p => p.tipo === 'mk_var_mudar' && p.n === 3), is = pl.findIndex(p => p.tipo === 'mk_mostrar_numero' && varsDe(p).length);
        return im >= 0 && is > im;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega três vezes no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão faz subir um degrau da tabuada?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Para subir um degrau, o que acontece ao contador?'), { id: 'sem_mudar' }),
        P.regra('salto_errado', a => blocos(evA(a), 'mk_var_mudar').length > 0 && !blocos(evA(a), 'mk_var_mudar').some(p => p.n === 3), [
          'De quanto em quanto salta a tabuada do 3?',
          'O número do «mudar contador em» é o tamanho do salto.',
          'Escreve 3 no «mudar contador em».',
        ], 'Saltos de 3!'),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O contador já salta. Como vês em que degrau estás?'), { id: 'sem_mostrar' }),
        Object.assign(P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'O número que aparece muda? Qual é a variável que salta?'), { id: 'mostra_sem_var' }),
        P.regra('mostra_antes', a => {
          const pl = evA(a)?.plano || [];
          const im = pl.findIndex(p => p.tipo === 'mk_var_mudar'), is = pl.findIndex(p => p.tipo === 'mk_mostrar_numero');
          return im >= 0 && is >= 0 && is < im;
        }, [
          'Mostras primeiro e só depois contas? Qual é o primeiro número que aparece?',
          'A ordem dos blocos conta: o micro:bit lê-os de cima para baixo.',
          'Põe o «mostrar número» por baixo do «mudar».',
        ], 'Primeiro salta, depois mostra!'),
      ],
      sucesso: '3, 6, 9! Multiplicar é somar o mesmo número várias vezes.',
      extensao: 'Muda o salto para 4. Que tabuada aparece? E até onde chegas com 5 toques?',
      gambiarra: {
        xml: prog(BA(seq(numero(vr('contador')), mudar('contador', 3)))),
        pedido: 'A minha tabuada do 3 começa no 0! Encontras a gambiarra?',
      },
    },
  };

  const DOBRO = {
    titulo: 'Dobra!',
    missao: 'Começa no 1 e cada A dobra o número: 2, 4, 8…',
    passos: ['«no arranque»: «definir contador para 1».', 'No A: «definir contador para» contador × 2.', 'Mostra o contador e carrega no A três vezes.'],
    material: 'micro:bit',
    novos: ['mk_iniciar', 'mt_conta_vezes'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let ant = 1, i = 0;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs); if (!ns.length) continue;
        const x = ultimo(ns);
        if (x !== 2 * ant || x === 0) return false;
        ant = x; i++;
      }
      return i >= 3;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Dobrar é ficar com o dobro: 1 vira 2, 2 vira 4… Até onde chega?'],
      parecePronto: a => blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.n === 1) &&
        blocos(evA(a), 'mk_var_definir').some(p => temOp(p, '*') && numsDe(p).includes(2)) && mostraVar(evA(a)?.plano).length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega três vezes no A.',
      regras: [
        Object.assign(P.evento('inicio', 'Antes de começares a dobrar, de que número parte o contador?'), { id: 'sem_inicio' }),
        P.regra('comeca_zero', a => !blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.n !== 0 && p.n != null), [
          'O dobro de 0 é…? Experimenta fazer a conta.',
          'O contador tem de começar num número que não seja 0.',
          'No «no arranque», define o contador para 1.',
        ], 'Agora há o que dobrar!'),
        Object.assign(P.evento('botao:A', 'Que botão dobra o número?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_definir', 'Dobrar é dar um valor novo ao contador. Que bloco dá um valor a uma variável?'), { id: 'a_sem_definir' }),
        Object.assign(P.valorEm('botao:A', 'mk_var_definir', 'mk_conta', 'Qual é a conta para saber o dobro de um número?'), { id: 'sem_conta' }),
        P.regra('conta_errada', a => blocos(evA(a), 'mk_var_definir').some(p => usa(p).some(u => u.tipo === 'mk_conta')) &&
          !blocos(evA(a), 'mk_var_definir').some(p => temOp(p, '*') && numsDe(p).includes(2) && varsDe(p).length), [
          'O dobro é somar ou multiplicar? E por quanto? E de que número?',
          'Na conta tem de entrar o próprio contador.',
          'Faz «contador × 2» dentro do «definir contador para».',
        ], 'Conta certa: o dobro!'),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'O número já dobra, mas às escondidas. Como o vês?'), { id: 'sem_mostrar' }),
      ],
      sucesso: '2, 4, 8, 16… Dobrar faz os números crescerem depressa!',
      extensao: 'Quantos toques precisas para passar de 100? Adivinha primeiro, depois experimenta.',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', conta(V('A', vr('contador')), '*', N('B', 2))), numero(vr('contador'))))),
        pedido: 'Carrego no A e dá sempre 0… Mas eu dobro! Porquê?',
      },
    },
  };

  const PAR = {
    titulo: 'Par ou ímpar?',
    missao: 'Cada A soma 1 e mostra o número. Depois: ✔ se for par, ✗ se for ímpar.',
    passos: ['No A: mudar contador em 1 e mostrar o contador.', '«se … então … senão» com «resto de contador ÷ 2 = 0».', '✔ em «então», ✗ em «senão».'],
    material: 'micro:bit',
    novos: ['mk_se_senao', 'mt_comparar_igual', 'mk_resto', 'mk_icone_sim', 'mk_icone_nao'],
    caixa: ['mk_botao', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let par = false, impar = false;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs), ic = s.outs.filter(v => v === 'icone:Yes' || v === 'icone:No');
        if (!ns.length || !ic.length) return false;
        const k = ultimo(ns), certo = k % 2 === 0 ? 'icone:Yes' : 'icone:No';
        if (ultimo(ic) !== certo) return false;
        if (k % 2 === 0) par = true; else impar = true;
      }
      return par && impar;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Par ou ímpar? Os pares dividem-se por 2 sem sobrar nada. O micro:bit vai descobrir sozinho.'],
      parecePronto: a => {
        const s = blocos(evA(a), 'mk_se')[0];
        return !!s && usa(s).some(u => u.tipo === 'mk_resto') && icDe(s.sim).includes('Yes') && icDe(s.nao).includes('No') &&
          blocos(evA(a), 'mk_var_mudar').length > 0 && mostraVar(evA(a)?.plano).length > 0;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A quatro vezes.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão vai trazer o número seguinte?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Os números têm de ir mudando: 1, 2, 3… O que faz o contador crescer?'), { id: 'sem_mudar' }),
        Object.assign(P.bloco('botao:A', 'mk_se', 'Como é que o micro:bit escolhe entre ✔ e ✗?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:A', 'mk_se', 'mk_resto', 'Um número é par quando o dividimos por 2 e… sobra quanto?'), { id: 'sem_resto' }),
        P.regra('divide_errado', a => blocos(evA(a), 'mk_se').some(s => {
          const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_resto');
          if (i < 0) return false;
          const d = u.slice(i + 1).filter(x => x.tipo === 'mk_num' || x.tipo === 'mk_var');
          return d.length >= 2 && !(d[1].tipo === 'mk_num' && d[1].n === 2);
        }), [
          'Par quer dizer que se divide por quanto?',
          'No «resto de … ÷ …», o segundo número é o divisor.',
          'Escreve 2 depois do ÷.',
        ], 'Dividir por 2: isso mesmo!'),
        P.regra('sem_icones', a => blocos(evA(a), 'mk_se').some(s => icDe(s.sim).length === 0 && icDe(s.nao).length === 0), [
          'O micro:bit já sabe se é par. Como é que nos diz?',
          'Põe um ícone em cada braço do «se».',
          '✔ em «então» e ✗ em «senão».',
        ], 'Agora diz-nos!'),
        P.regra('icones_trocados', a => blocos(evA(a), 'mk_se').some(s => icDe(s.sim).includes('No') || icDe(s.nao).includes('Yes')), [
          ['surpreendida', 'O 2 é par. Que ícone aparece com o 2?'],
          '«então» corre quando a condição é verdadeira: sobra 0, é par.',
          'Troca: ✔ em «então», ✗ em «senão».',
        ], 'Agora sim!'),
      ],
      sucesso: 'Par, ímpar, par, ímpar… O resto da divisão por 2 diz tudo!',
      extensao: 'E se mostrasse ✔ só nos números da tabuada do 3? Que número mudavas?',
      gambiarra: {
        xml: prog(BA(seq(mudar('contador', 1), numero(vr('contador')),
          se(cmp('==', V('A', `<block type="mk_resto">${V('A', vr('contador'))}${N('B', 2)}</block>`), N('B', 0)), [icone('No')], [icone('Yes')])))),
        pedido: 'O meu micro:bit diz que o 2 é ímpar! Encontras a gambiarra?',
      },
    },
  };

  const DIAGONAL = {
    titulo: 'Diagonal de luzes',
    missao: 'Com uma só variável, acende as luzes da diagonal: (0,0), (1,1)… até (4,4).',
    passos: ['No A: «definir contador para 0» e «repetir 5 vezes».', 'Lá dentro: «acender x contador y contador» e «mudar contador em 1».', 'Experimenta: carrega no A.'],
    material: 'micro:bit',
    novos: ['mk_acender'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_repetir'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const ac = s.filter(v => v.startsWith('acender:')).map(v => v.slice(8));
      const certo = ['0,0', '1,1', '2,2', '3,3', '4,4'];
      return certo.every(c => ac.includes(c)) && ac.every(c => certo.includes(c));
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'O ecrã do micro:bit é uma grelha: x é a coluna, y é a linha. Vamos desenhar uma diagonal com contas!'],
      parecePronto: a => blocos(evA(a), 'mk_acender').some(p => varsDe(p).length >= 2) && tem(evA(a), 'mk_repetir') &&
        blocos(evA(a), 'mk_var_mudar').some(p => p.prof > 0),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão desenha a diagonal?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 5 luzes. Vais pôr 5 blocos, ou há maneira de repetir?'), { id: 'sem_repetir' }),
        Object.assign(P.bloco('botao:A', 'mk_acender', 'Que bloco acende uma luz num sítio certinho da grelha?'), { id: 'sem_acender' }),
        P.regra('acender_fixo', a => blocos(evA(a), 'mk_acender').length > 0 && !blocos(evA(a), 'mk_acender').some(p => varsDe(p).length), [
          'Se o x e o y forem sempre os mesmos números, quantas luzes acendes?',
          'Os números do «acender» podem vir de uma variável.',
          'Põe o bloco «contador» no x e no y.',
        ], 'Agora a luz anda!'),
        P.regra('so_uma_var', a => blocos(evA(a), 'mk_acender').some(p => varsDe(p).length === 1), [
          'Numa diagonal, quando o x anda um, o que acontece ao y?',
          'Na diagonal, o x e o y são sempre iguais: (1,1), (2,2)…',
          'Põe «contador» também no outro buraco do «acender».',
        ], 'Diagonal perfeita!'),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'O contador fica sempre igual. Como passa para a luz seguinte?'), { id: 'sem_mudar' }),
        P.regra('poucas_vezes', a => blocos(evA(a), 'mk_repetir').some(p => p.n < 5), [
          'Quantas luzes tem a diagonal, de um canto ao outro?',
          'O número do «repetir» é quantas luzes acendes.',
          'Escreve 5 no «repetir … vezes».',
        ], 'De canto a canto!'),
      ],
      sucesso: '(0,0), (1,1), (2,2)… Uma diagonal com uma só variável: isto são coordenadas!',
      extensao: 'E a outra diagonal, de (4,0) a (0,4)? Pista: x + y dá sempre 4.',
      gambiarra: {
        // y fixo em 0: sai uma linha em vez da diagonal
        xml: prog(BA(seq(definirN('contador', 0), repetir(5, I('mk_acender', V('X', vr('contador')) + N('Y', 0)), mudar('contador', 1))))),
        pedido: 'Queria uma diagonal e saiu-me uma linha deitada! Encontras a gambiarra?',
      },
    },
  };

  const QUIZ = {
    titulo: 'Quiz da soma',
    missao: 'O A mostra dois números ao acaso. Pensa na soma… e o B mostra se acertaste.',
    passos: ['No A: contador e pontos ao acaso de 1 até 5; mostra os dois.', 'No B: «mostrar número» com contador + pontos.', 'Joga: A, pensa, B.'],
    material: 'micro:bit',
    novos: ['mt_definir_pontos', 'mt_var_pontos', 'mk_conta'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => {
      let par = null, n = 0, dif = false;
      for (const s of segs(r)) {
        const ns = nums(s.outs);
        if (s.v === 'botao:A') par = ns.length >= 2 ? ns.slice(-2) : null;
        else if (s.v === 'botao:B') {
          if (!par || !ns.length) return false;
          if (ultimo(ns) !== par[0] + par[1]) return false;
          if (par[0] !== par[1]) dif = true;     // com dois números iguais, «contador + contador» também acertava
          n++;
        }
      }
      return n >= 2 && dif;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Desafio de cálculo mental! O micro:bit mostra dois números, tu somas de cabeça, e ele confere.'],
      parecePronto: a => comAcaso(evA(a)).length >= 2 && blocos(evA(a), 'mk_mostrar_numero').length >= 2 &&
        blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '+') && new Set(varsDe(p)).size >= 2),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A, pensa na soma, e carrega no B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão lança a pergunta?'), { id: 'sem_a' }),
        P.regra('a_sem_acaso', a => comAcaso(evA(a)).length < 2, [
          'Para o quiz ser surpresa, de onde vêm os números?',
          'Cada variável recebe um «escolher ao acaso».',
          'Define o contador e os pontos, cada um com «escolher ao acaso de 1 até 5».',
        ], 'Números-surpresa!'),
        P.regra('a_sem_mostrar', a => blocos(evA(a), 'mk_mostrar_numero').length < 2, [
          'Como é que ficas a saber quais são os dois números?',
          'Precisas de dois «mostrar número», um para cada variável.',
          'Mostra o contador, uma pausa, e mostra os pontos.',
        ], 'Agora vês os dois!'),
        Object.assign(P.evento('botao:B', 'E a resposta, aparece quando carregas em quê?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_mostrar_numero', 'O B já está à escuta. O que mostra ele?'), { id: 'b_sem_mostrar' }),
        Object.assign(P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_conta', 'O B tem de mostrar a soma. Que bloco faz contas?'), { id: 'b_sem_conta' }),
        P.regra('conta_errada', a => blocos(evB(a), 'mk_mostrar_numero').some(p => usa(p).some(u => u.tipo === 'mk_conta')) &&
          !blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '+') && new Set(varsDe(p)).size >= 2), [
          'Somas o contador com quem? E é mesmo uma soma?',
          'A conta tem de usar as duas variáveis e o sinal +.',
          'Faz «contador + pontos» dentro do «mostrar número».',
        ], 'Soma certa!'),
      ],
      sucesso: 'Quiz pronto! Agora o micro:bit faz as perguntas e tu és a calculadora.',
      extensao: 'E se fosse a tabuada? Troca o + por × e os números vão até 9.',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', acaso(1, 5)), definir('pontos', acaso(1, 5)), numero(vr('contador')), pausa(500), numero(vr('pontos')))),
          BB(seq(numero(conta(V('A', vr('contador')), '+', V('B', vr('contador'))))))),
        pedido: 'O meu quiz dá respostas esquisitas: 2 + 4 dá 4! Encontras a gambiarra?',
      },
    },
  };

  const MOEDAS = {
    titulo: 'Cara ou coroa',
    missao: 'Lança 10 moedas de uma vez: o micro:bit conta quantas saíram cara.',
    passos: ['No A: contador a 0 e «repetir 10 vezes».', 'Lá dentro: «se escolher ao acaso de 1 até 2 = 1 então» mudar contador em 1.', 'No fim, mostra o contador. Dá sempre 5?'],
    material: 'micro:bit (e uma moeda, para comparar)',
    novos: ['mk_se_entao'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_repetir', 'mk_aleatorio', 'mt_comparar_igual', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      const res = [];
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs), vs = s.outs.filter(v => v.startsWith('var:contador:')).map(v => Number(v.split(':')[2]));
        if (!ns.length) continue;
        const x = ultimo(ns);
        if (!vs.length || vs[0] !== 0 || ultimo(vs) !== x || x < 0 || x > 10) return false;
        res.push(x);
      }
      return res.length >= 2 && res.some(x => x < 10);
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Atiras uma moeda ao ar: cara ou coroa? E se atirares 10? Saem sempre 5 caras?'],
      parecePronto: a => {
        const s = blocos(evA(a), 'mk_se_entao')[0];
        return !!s && usa(s).some(u => u.tipo === 'mk_aleatorio') && (s.sim || []).some(p => p.tipo === 'mk_var_mudar') &&
          blocos(evA(a), 'mk_var_definir').some(p => p.n === 0 && p.prof === 0) && mostraVar(evA(a)?.plano).length > 0;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A várias vezes e vê os resultados.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão lança as moedas?'), { id: 'sem_a' }),
        P.regra('sem_zero', a => !blocos(evA(a), 'mk_var_definir').some(p => p.n === 0), [
          'Antes de lançares as moedas outra vez, quantas caras tens?',
          'O contador tem de voltar ao início em cada lançamento.',
          'No começo do A: «definir contador para 0».',
        ], 'Começa do zero!'),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 10 moedas. Como lanças todas sem escrever 10 vezes?'), { id: 'sem_repetir' }),
        Object.assign(P.bloco('botao:A', 'mk_se_entao', 'Só às vezes sai cara. Como é que o micro:bit decide se conta ou não?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:A', 'mk_se_entao', 'mk_aleatorio', 'Uma moeda cai ao acaso. O que falta na condição?'), { id: 'sem_acaso' }),
        P.regra('conta_sempre', a => blocos(evA(a), 'mk_se_entao').length > 0 && !blocos(evA(a), 'mk_se_entao').some(s => (s.sim || []).some(p => p.tipo === 'mk_var_mudar')), [
          'Saiu cara! E onde fica contada? Saem sempre 10 caras?',
          'O «mudar contador» só deve correr quando sai cara: dentro do «se».',
          'Mete «mudar contador em 1» dentro do «se … então».',
        ], 'Só conta as caras!'),
        Object.assign(P.bloco('botao:A', 'mk_mostrar_numero', 'As moedas já foram lançadas. Quantas caras saíram?'), { id: 'sem_mostrar' }),
      ],
      sucesso: 'Às vezes 4, às vezes 6… Quase sempre perto de 5: metade das moedas. Isto é probabilidade!',
      extensao: 'E se lançasses um dado 12 vezes: quantas vezes deve sair o 6?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 0), repetir(10,
          seEntao(cmp('==', V('A', acaso(1, 2)), N('B', 1))), mudar('contador', 1)), numero(vr('contador'))))),
        pedido: 'Lanço 10 moedas e saem sempre 10 caras! Que sorte… ou será gambiarra?',
      },
    },
  };

  // =============================================================== NÍVEL 3 · Jogos de números
  const BARRA = {
    titulo: 'Barra de progresso',
    missao: 'Cada A enche um pouco a barra. Com 10 toques fica cheia — e com 5, a meio!',
    passos: ['No A: mudar contador em 1.', '«desenhar gráfico de barras de» contador «até» 10.', 'Carrega 5 vezes: está a meio?'],
    material: 'micro:bit',
    novos: ['mk_grafico'],
    caixa: ['mk_botao', 'mk_var_mudar', 'mk_var', 'mk_iniciar', 'mk_var_definir'],
    teste: 'botao:A',
    ok: r => {
      let k = 0;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        k++;
        const g = s.outs.filter(v => v.startsWith('grafico:')).map(v => Number(v.slice(8)));
        if (!g.length || ultimo(g) !== Math.round(25 * k / 10)) return false;
      }
      return k >= 4;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'As barras de progresso mostram uma parte de um todo. Vamos fazer uma que se enche aos bocadinhos!'],
      parecePronto: a => blocos(evA(a), 'mk_grafico').some(p => varsDe(p).length && p.max === 10) && blocos(evA(a), 'mk_var_mudar').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega no A cinco vezes.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão enche um bocadinho da barra?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'Para a barra crescer, o que tem de crescer primeiro?'), { id: 'sem_mudar' }),
        Object.assign(P.bloco('botao:A', 'mk_grafico', 'Como é que se vê uma parte de um todo, sem números?'), { id: 'sem_grafico' }),
        Object.assign(P.valorEm('botao:A', 'mk_grafico', 'mk_var', 'A barra cresce? Ou é sempre igual?'), { id: 'grafico_fixo' }),
        P.regra('maximo', a => blocos(evA(a), 'mk_grafico').some(p => p.max !== 10), [
          'Quantos toques enchem a barra toda?',
          'O segundo número do gráfico é o «todo».',
          'Escreve 10 no «até» do gráfico.',
        ], 'O todo são 10!'),
      ],
      sucesso: '5 de 10 é metade! A barra mostra frações sem precisar de números.',
      extensao: 'E se o todo fosse 4? Quantos toques eram metade? E um quarto?',
      gambiarra: {
        // a barra desenha sempre o 1, em vez do contador
        xml: prog(BA(seq(mudar('contador', 1), I('mk_grafico', N('V', 1) + N('MAX', 10))))),
        pedido: 'A minha barra não enche! Carrego, carrego, e fica sempre igual. Encontras a gambiarra?',
      },
    },
  };

  const META = {
    titulo: 'Meta de passos',
    missao: 'Conta os passos ao agitar. Até 4 mostra o número; a partir de 5, festa: meta cumprida!',
    passos: ['«em agitar»: mudar passos em 1.', '«se passos ≥ 5 então» ícone contente, «senão» mostrar passos.', 'Agita 6 vezes.'],
    material: 'micro:bit',
    novos: ['mk_se_senao', 'mk_comparar'],
    caixa: ['mk_agitar', 'mt_mudar_passos', 'mt_var_passos', 'mk_mostrar_numero', 'mk_icone'],
    teste: 'agitar',
    ok: r => {
      let k = 0;
      for (const s of segs(r)) {
        if (s.v !== 'agitar') continue;
        k++;
        const festa = s.outs.includes('icone:Happy');
        if (k >= 5 && !festa) return false;
        if (k < 5 && (festa || ultimo(nums(s.outs)) !== k)) return false;
      }
      return k >= 6;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Uma meta é um número a que queres chegar. A nossa: 5 passos. O micro:bit avisa quando lá chegares!'],
      parecePronto: a => {
        const s = blocos(a.evento('agitar'), 'mk_se')[0];
        if (!s) return false;
        const c = usa(s).find(u => u.tipo === 'mk_comparar'), n = numsDe(s);
        return !!c && ((c.op === '>=' && n.includes(5)) || (c.op === '>' && n.includes(4))) && icDe(s.sim).includes('Happy') && blocos(a.evento('agitar'), 'mk_var_mudar').length > 0;
      },
      testar: 'Tens uma ideia? Vamos testar! Agita seis vezes.',
      regras: [
        Object.assign(P.evento('agitar', 'Como é que o micro:bit conta cada passo?'), { id: 'sem_agitar' }),
        Object.assign(P.bloco('agitar', 'mk_var_mudar', 'Deste um passo. Onde fica contado?'), { id: 'sem_mudar' }),
        Object.assign(P.bloco('agitar', 'mk_se', 'O micro:bit tem de decidir: já chegaste à meta ou ainda não? Que bloco decide?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('agitar', 'mk_se', 'mk_comparar', 'Como é que se compara o número de passos com a meta?'), { id: 'sem_comparar' }),
        P.regra('meta_errada', a => blocos(a.evento('agitar'), 'mk_se').some(s => {
          const c = usa(s).find(u => u.tipo === 'mk_comparar'), n = numsDe(s);
          return c && !((c.op === '>=' && n.includes(5)) || (c.op === '>' && n.includes(4)));
        }), [
          'A meta é 5 passos. Ao 5.º passo já é festa?',
          'Lê a comparação em voz alta: «passos maior ou igual a 5».',
          'Escolhe ≥ e escreve 5.',
        ], 'Meta certa!'),
        P.regra('festa_trocada', a => blocos(a.evento('agitar'), 'mk_se').some(s => icDe(s.nao).includes('Happy') || (!icDe(s.sim).length && icDe(s.nao).length)), [
          ['surpreendida', 'Festa antes da meta?'],
          '«então» corre quando já chegaste à meta.',
          'Põe o ícone contente em «então» e o número em «senão».',
        ], 'Festa no sítio certo!'),
      ],
      sucesso: '1, 2, 3, 4… meta! Comparar números é saber qual é maior.',
      extensao: 'E se a meta fosse 10 e o ecrã mostrasse quantos passos faltam?',
      gambiarra: {
        xml: prog(AG(seq(mudar('passos', 1), se(cmp('>=', V('A', vr('passos')), N('B', 50)), [icone('Happy')], [numero(vr('passos'))])))),
        pedido: 'Já agitei não sei quantas vezes e a festa nunca chega! Encontras a gambiarra?',
      },
    },
  };

  const CRONOMETRO = {
    titulo: 'Cronómetro',
    missao: 'O A arranca o cronómetro, o B mostra quantos segundos passaram.',
    passos: ['No A: «definir medida para» tempo de execução.', 'No B: mostrar (tempo − medida) ÷ 1000.', 'Conta até 3 entre o A e o B.'],
    material: 'micro:bit',
    novos: ['mk_tempo', 'mt_definir_medida', 'mt_var_medida', 'mt_conta_menos', 'mt_conta_div'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      let tA = null, n = 0;
      for (const s of segs(r)) {
        if (s.v === 'botao:A') tA = s.t;
        else if (s.v === 'botao:B') {
          const ns = nums(s.outs);
          if (tA === null || !ns.length) return false;
          if (Math.abs(ultimo(ns) - (s.t - tA) / 1000) > 0.5) return false;
          n++;
        }
      }
      return n >= 1;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'O micro:bit tem um relógio por dentro que conta milissegundos. Vamos fazer um cronómetro!'],
      parecePronto: a => dentro(evA(a), 'mk_var_definir', 'mk_tempo') &&
        blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '/') && temOp(p, '-') && usa(p).some(u => u.tipo === 'mk_tempo') && varsDe(p).length),
      testar: 'Tens uma ideia? Vamos testar! Carrega no A, conta até 3, carrega no B.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão dá a partida?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_definir', 'Para medir, o que tens de guardar quando começas?'), { id: 'a_sem_definir' }),
        Object.assign(P.valorEm('botao:A', 'mk_var_definir', 'mk_tempo', 'Guardas o quê na medida? A hora a que começaste…'), { id: 'sem_tempo_inicio' }),
        Object.assign(P.evento('botao:B', 'E para parar e ver o tempo, carregas em quê?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_mostrar_numero', 'O B já está à escuta. O que mostra ele?'), { id: 'b_sem_mostrar' }),
        P.regra('b_sem_tempo', a => blocos(evB(a), 'mk_mostrar_numero').length > 0 && !blocos(evB(a), 'mk_mostrar_numero').some(p => usa(p).some(u => u.tipo === 'mk_tempo')), [
          'Para saber quanto passou, o que tens de comparar com o início?',
          'O tempo de agora menos o tempo do início dá a duração.',
          'Mostra «tempo de execução − medida».',
        ], 'Agora comparas o agora com o início!'),
        P.regra('ordem', a => blocos(evB(a), 'mk_mostrar_numero').some(p => {
          const u = usa(p), i = u.findIndex(x => x.tipo === 'mk_conta' && x.op === '-');
          return i >= 0 && u[i + 1] && u[i + 1].tipo === 'mk_var';
        }), [
          ['surpreendida', 'Deu um número negativo? Qual é maior: o tempo agora ou o tempo do início?'],
          'Na subtração, o maior vem primeiro.',
          'Faz «tempo de execução − medida», por esta ordem.',
        ], 'Agora dá positivo!'),
        P.regra('sem_divisao', a => blocos(evB(a), 'mk_mostrar_numero').some(p => usa(p).some(u => u.tipo === 'mk_tempo')) &&
          !blocos(evB(a), 'mk_mostrar_numero').some(p => temOp(p, '/') && numsDe(p).includes(1000)), [
          'Deu 3000? O micro:bit conta em milissegundos. Quantos milissegundos tem um segundo?',
          'Para passar de milissegundos a segundos, divide-se.',
          'Põe a subtração dentro de uma conta «÷ 1000».',
        ], 'Segundos certinhos!'),
      ],
      sucesso: 'Cronómetro pronto! Duração = fim − início. E 1000 milissegundos fazem 1 segundo.',
      extensao: 'Quem consegue contar 10 segundos de olhos fechados? O cronómetro diz quem chegou mais perto.',
      gambiarra: {
        xml: prog(BA(seq(definir('medida', '<block type="mk_tempo"></block>'))),
          BB(seq(numero(conta(V('A', conta(V('A', vr('medida')), '-', V('B', '<block type="mk_tempo"></block>'))), '/', N('B', 1000)))))),
        pedido: 'O meu cronómetro diz que passaram menos 3 segundos! Encontras a gambiarra?',
      },
    },
  };

  const POTENCIAS = {
    titulo: 'Potências de 2',
    missao: 'Começa no 1 e dobra 6 vezes seguidas: 1, 2, 4, 8, 16, 32. Que depressa cresce!',
    passos: ['No A: contador a 1 e «repetir 6 vezes».', 'Lá dentro: mostrar o contador e «definir contador para» contador × 2.', 'Carrega no A e conta os saltos.'],
    material: 'micro:bit',
    novos: ['mk_repetir'],
    caixa: ['mk_botao', 'mk_var_definir', 'mk_var', 'mt_conta_vezes', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:A',
    ok: r => causou(r, s => nums(s).join(',').includes('1,2,4,8,16'), v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Uma lenda conta que um rei pagou com grãos de arroz: 1, depois 2, depois 4… Quanto cresce isto?'],
      parecePronto: a => {
        const pl = evA(a)?.plano || [];
        return pl.some(p => p.tipo === 'mk_var_definir' && p.prof === 0 && p.n === 1) && pl.some(p => p.tipo === 'mk_repetir') &&
          pl.some(p => p.tipo === 'mk_var_definir' && p.prof > 0 && temOp(p, '*')) && pl.some(p => p.tipo === 'mk_mostrar_numero' && p.prof > 0);
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão começa a dobrar?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_repetir', 'São 6 dobras seguidas. Como repetes sem escrever 6 vezes?'), { id: 'sem_repetir' }),
        P.regra('comeco', a => !(evA(a)?.plano || []).some(p => p.tipo === 'mk_var_definir' && p.prof === 0 && p.n === 1), [
          'Dobrar o 0 dá…? De que número começas?',
          'Antes do «repetir», o contador tem de começar em 1.',
          'Põe «definir contador para 1» por cima do «repetir».',
        ], 'Começa no 1!'),
        P.regra('sem_dobro', a => !(evA(a)?.plano || []).some(p => p.tipo === 'mk_var_definir' && p.prof > 0 && temOp(p, '*') && numsDe(p).includes(2) && varsDe(p).length), [
          'Em cada volta o número dobra. Dobrar é multiplicar por quanto?',
          'Dentro do «repetir», dá ao contador um valor novo com uma conta.',
          'Dentro do «repetir»: «definir contador para» contador × 2.',
        ], 'Dobra a cada volta!'),
        P.regra('mostra_fora', a => (evA(a)?.plano || []).some(p => p.tipo === 'mk_repetir') && !(evA(a)?.plano || []).some(p => p.tipo === 'mk_mostrar_numero' && p.prof > 0), [
          'Só vês o último número? Como vês todos os saltos?',
          'O «mostrar número» tem de estar dentro do «repetir».',
          'Mete «mostrar número» com o contador dentro do «repetir», antes da conta.',
        ], 'Agora vês cada salto!'),
      ],
      sucesso: '1, 2, 4, 8, 16, 32! São potências de 2. Ao fim de 10 dobras já passavas de 1000!',
      extensao: 'E se fosse ×3? Que números aparecem? Qual chega primeiro a 100?',
      gambiarra: {
        xml: prog(BA(seq(definirN('contador', 0), repetir(6, numero(vr('contador')), definir('contador', conta(V('A', vr('contador')), '*', N('B', 2))))))),
        pedido: 'Dobro, dobro, dobro… e dá sempre 0! Encontras a gambiarra?',
      },
    },
  };

  const MAIOR = {
    titulo: 'O maior dado',
    missao: 'Dois dados de uma vez: o micro:bit mostra os dois e depois o maior.',
    passos: ['No A: contador e pontos ao acaso de 1 a 6; mostra os dois.', '«se contador > pontos então» mostra contador, «senão» mostra pontos.', 'Carrega várias vezes e confere.'],
    material: 'micro:bit',
    novos: ['mk_comparar'],
    caixa: ['mk_botao', 'mk_var_definir', 'mt_definir_pontos', 'mk_var', 'mt_var_pontos', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_pausa', 'mk_se_senao'],
    teste: 'botao:A',
    ok: r => {
      let n = 0, dif = false;
      for (const s of segs(r)) {
        if (s.v !== 'botao:A') continue;
        const ns = nums(s.outs);
        if (ns.length < 3) return false;
        const [x, y, m] = ns.slice(-3);
        if (m !== Math.max(x, y)) return false;
        if (x !== y) dif = true;
        n++;
      }
      return n >= 3 && dif;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo dos dois dados: ganha o maior! O micro:bit lança, mostra e escolhe.'],
      parecePronto: a => {
        const s = blocos(evA(a), 'mk_se')[0];
        if (!s || comAcaso(evA(a)).length < 2) return false;
        const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_comparar');
        if (i < 0) return false;
        const [X, Y] = u.slice(i + 1).filter(x => x.tipo === 'mk_var').map(x => x.var), op = u[i].op;
        const esperado = op === '>' || op === '>=' ? X : op === '<' || op === '<=' ? Y : null;
        return !!esperado && mostraVar(s.sim)[0] === esperado;
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A três vezes e confere.',
      regras: [
        Object.assign(P.evento('botao:A', 'Que botão lança os dados?'), { id: 'sem_a' }),
        P.regra('dois_dados', a => comAcaso(evA(a)).length < 2, [
          'São dois dados. Quantos números ao acaso precisas?',
          'Cada dado é uma variável com «escolher ao acaso de 1 até 6».',
          'Define o contador e os pontos ao acaso, de 1 até 6.',
        ], 'Dois dados lançados!'),
        P.regra('mostra_dados', a => (evA(a)?.plano || []).filter(p => p.tipo === 'mk_mostrar_numero' && p.prof === 0).length < 2, [
          'Antes de dizer qual é o maior, como ficas a saber os dois?',
          'Mostra cada dado, com uma pausa entre eles.',
          'Antes do «se»: mostra o contador, pausa, mostra os pontos.',
        ], 'Agora vês os dois dados!'),
        Object.assign(P.bloco('botao:A', 'mk_se', 'Como é que o micro:bit escolhe qual dos dois mostra?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:A', 'mk_se', 'mk_comparar', 'Como se descobre qual de dois números é o maior?'), { id: 'sem_comparar' }),
        P.regra('trocado', a => blocos(evA(a), 'mk_se').some(s => {
          const u = usa(s), i = u.findIndex(x => x.tipo === 'mk_comparar');
          if (i < 0) return false;
          const [X, Y] = u.slice(i + 1).filter(x => x.tipo === 'mk_var').map(x => x.var), op = u[i].op;
          const esperado = op === '>' || op === '>=' ? X : op === '<' || op === '<=' ? Y : null;
          const m = mostraVar(s.sim)[0];
          return esperado && m && m !== esperado;
        }), [
          ['surpreendida', 'Saiu 5 e 2… e ganhou o 2? Lê a condição em voz alta.'],
          '«então» corre quando a condição é verdadeira: «contador > pontos» quer dizer que o contador é o maior.',
          'Em «então» mostra o contador; em «senão», os pontos.',
        ], 'Ganha mesmo o maior!'),
      ],
      sucesso: 'Comparar dois números e escolher o maior: é o que fazem os árbitros… e os computadores!',
      extensao: 'E se fossem três dados? Pista: compara primeiro dois, e o maior com o terceiro.',
      gambiarra: {
        xml: prog(BA(seq(definir('contador', acaso(1, 6)), definir('pontos', acaso(1, 6)), numero(vr('contador')), pausa(300), numero(vr('pontos')), pausa(300),
          se(cmp('&gt;', V('A', vr('contador')), V('B', vr('pontos'))), [numero(vr('pontos'))], [numero(vr('contador'))])))),
        pedido: 'No meu jogo ganha sempre o mais pequeno! Encontras a gambiarra?',
      },
    },
  };

  const ADIVINHA = {
    titulo: 'Adivinha o número',
    missao: 'Agita: o micro:bit esconde um número de 1 a 5. O A muda o teu palpite; o B diz se acertaste.',
    passos: ['«em agitar»: «definir medida para» escolher ao acaso de 1 até 5.', 'A: mudar contador em 1 e mostrar contador (o teu palpite).', 'B: «se contador = medida» ✔ «senão» ✗.'],
    material: 'micro:bit',
    novos: ['mt_definir_medida', 'mt_var_medida'],
    caixa: ['mk_agitar', 'mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_aleatorio', 'mk_mostrar_numero', 'mk_se_senao', 'mt_comparar_igual', 'mk_icone_sim', 'mk_icone_nao'],
    teste: 'botao:B',
    ok: r => {
      let n = 0, acertou = false;
      for (const s of segs(r)) {
        if (s.v !== 'botao:B') continue;
        const ic = s.outs.filter(v => v === 'icone:Yes' || v === 'icone:No');
        if (!ic.length || s.vars.medida === undefined) return false;
        const certo = (s.vars.contador ?? 0) === s.vars.medida;
        if ((ultimo(ic) === 'icone:Yes') !== certo) return false;
        if (certo) acertou = true;
        n++;
      }
      return n >= 2 && acertou;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Jogo de adivinhar! O micro:bit pensa num número e não diz. Consegues descobri-lo?'],
      parecePronto: a => {
        const s = blocos(evB(a), 'mk_se')[0];
        return comAcaso(a.evento('agitar')).length > 0 && blocos(evA(a), 'mk_var_mudar').length > 0 && !!s &&
          new Set(varsDe(s)).size >= 2 && icDe(s.sim).includes('Yes');
      },
      testar: 'Tens uma ideia? Vamos testar! Agita, depois A e B até acertares.',
      regras: [
        Object.assign(P.evento('agitar', 'Como é que começa o jogo? O micro:bit tem de pensar num número…'), { id: 'sem_agitar' }),
        P.regra('sem_segredo', a => comAcaso(a.evento('agitar')).length === 0, [
          'Onde é que o micro:bit esconde o número secreto?',
          'O segredo é uma variável que recebe um número ao acaso.',
          'Em «em agitar»: «definir medida para» escolher ao acaso de 1 até 5.',
        ], 'Segredo escondido!'),
        Object.assign(P.evento('botao:A', 'Como mudas o teu palpite?'), { id: 'sem_a' }),
        Object.assign(P.bloco('botao:A', 'mk_var_mudar', 'O teu palpite tem de mudar: 1, 2, 3… O que faz o contador crescer?'), { id: 'a_sem_mudar' }),
        Object.assign(P.evento('botao:B', 'Já tens um palpite. Como perguntas se acertaste?'), { id: 'sem_b' }),
        Object.assign(P.bloco('botao:B', 'mk_se', 'Como é que o micro:bit decide se acertaste?'), { id: 'sem_se' }),
        Object.assign(P.valorEm('botao:B', 'mk_se', 'mk_comparar', 'Acertar quer dizer que dois números são… iguais! Como se compara?'), { id: 'sem_comparar' }),
        P.regra('compara_errado', a => blocos(evB(a), 'mk_se').some(s => {
          const v = new Set(varsDe(s));
          return usa(s).some(u => u.tipo === 'mk_comparar') && !(v.has('contador') && v.has('medida'));
        }), [
          'Comparas o teu palpite com quem?',
          'Numa ponta da comparação o palpite (contador), na outra o segredo (medida).',
          'Faz «contador = medida».',
        ], 'Palpite contra segredo!'),
      ],
      sucesso: 'Acertaste! Comparar o palpite com o segredo: é assim que funcionam os jogos de adivinhar.',
      extensao: 'E se o B dissesse «maior» ou «menor»? Assim adivinhavas números de 1 a 100!',
      gambiarra: {
        xml: prog(AG(seq(definir('medida', acaso(1, 5)))), BA(seq(mudar('contador', 1), numero(vr('contador')))),
          BB(seq(se(cmp('==', V('A', vr('contador')), V('B', vr('pontos'))), [icone('Yes')], [icone('No')])))),
        pedido: 'Já tentei todos os números e nunca acerto! Encontras a gambiarra?',
      },
    },
  };

  const LIVRE = {
    titulo: 'Inventa um jogo',
    missao: 'Agora é contigo: inventa um jogo de números para jogar com a tua turma.',
    passos: ['Tens os blocos de números, variáveis, contas e comparações.', 'Ideias: corrida de dados, contagem até 20, tabuada-surpresa…'],
    material: 'o que tiveres',
    novos: ['mk_iniciar', 'mk_agitar', 'mk_botao', 'mk_botao_B', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_conta', 'mk_aleatorio', 'mk_comparar', 'mk_se_senao', 'mk_mostrar_numero', 'mk_acender', 'mk_grafico'],
    caixa: [],
    livre: true,
    ok: () => false,
    tutor: {
      boasVindas: ['testar', 'Tens uma ideia? Vamos testar! Inventa o teu jogo de números. Se precisares de mim, estou aqui.'],
      parecePronto: () => false,
      testar: '',
      regras: [],
      sucesso: '',
      extensao: '',
    },
  };

  F.registarMissao({
    id: 'matematica',
    titulo: 'Matemática',
    tema: 'Contar, medir, padrões',
    descricao: 'Contadores, dados, padrões de luz e jogos de números.',
    cor: '#9400d3',
    xml: XML,
    niveis: [
      { nome: 'Nível 1 · Números', desafios: [SORTE, CONTADOR, PASSOS, DECRESCENTE, DADO, PLACAR] },
      { nome: 'Nível 2 · Contas e padrões', desafios: [TABUADA, DOBRO, PAR, DIAGONAL, QUIZ, MOEDAS] },
      { nome: 'Nível 3 · Jogos de números', desafios: [BARRA, META, CRONOMETRO, POTENCIAS, MAIOR, ADIVINHA] },
      { nome: 'Livre', desafios: [LIVRE] },
    ],
  });
})();
