/* Missão «Natureza» — biodiversidade em Messejana.
 *
 * O micro:bit vai lá para fora: horta, oliveiras, ninhos de cegonha e de andorinha, abelhas,
 * corujas, o calor do verão e a geada do inverno. Nível 1: observar (ler os sensores);
 * nível 2: cuidar (decidir com «se», atuar com LED e servo); nível 3: investigar (guardar dados,
 * contar, comparar e automatizar).
 * Material: micro:bit V2, crocodilos, 2 pregos (humidade da terra: um no pin 1, outro no 3V),
 * LED, servomotor SG90.
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { icones, tem, blocos, dentro, soltoCom } = F.ajudasTutor;
  const { causou, numeros, valorDe, aposSensor, houve } = F.verif;

  // ------------------------------------------------------------ ajudas de leitura do programa
  // lista plana de tudo o que está num evento, incluindo dentro de «repetir» e dos dois ramos do «se»
  const plano = seq => (seq || []).flatMap(d => [d, ...plano(d.corpo), ...plano(d.sim), ...plano(d.nao)]);
  const ses = e => e ? plano(e.seq).filter(d => d.tipo === 'mk_se' || d.tipo === 'mk_se_entao') : [];
  const usa = (d, tipo) => (d.usa || []).some(u => u.tipo === tipo);
  const opDe = d => ((d.usa || []).find(u => u.tipo === 'mk_comparar') || {}).op;
  const ramo = (d, k) => plano(d[k]);
  const temIcone = (lista, nome) => lista.some(p => p.tipo === 'mk_icone' && p.icone === nome);
  const servos = lista => lista.filter(p => p.tipo === 'mk_servo').map(p => Number(p.angulo));
  const com = (id, regra) => Object.assign(regra, { id });   // dar um nome curto às regras das receitas

  // ------------------------------------------------------------ ajudas de verificação (registo)
  // valor do sensor antes da posição i do registo (o último que a criança escolheu)
  function sensorEm(reg, i, k, def) {
    for (let j = i - 1; j >= 0; j--) if (reg[j].dir === 'in' && reg[j].v.startsWith(k + ':')) return valorDe(reg[j].v);
    return def;
  }
  // para cada vez que aconteceu a entrada, as saídas até à entrada seguinte
  function vezes(reg, entrada) {
    const out = [];
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      const s = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= 8000; j++) s.push(reg[j].v);
      out.push({ i, s });
    }
    return out;
  }
  const angulos = s => s.filter(x => x.startsWith('servo:')).map(x => Number(x.split(':')[2]));

  // ------------------------------------------------------------ XML (gambiarras e caixa)
  const N = (n, v) => `<value name="${n}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const TX = (n, t) => `<value name="${n}"><shadow type="mk_texto"><field name="TXT">${t}</field></shadow></value>`;
  const V = (n, bloco) => `<value name="${n}">${bloco}</value>`;
  const NOTA = (f, bat = 1) => `<value name="F"><shadow type="mk_nota_menu"><field name="V">${f}</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">${bat}</field></shadow></value>`;
  const ANALOG = '<block type="mk_ler_analogico"><field name="P">P1</field></block>';

  const XML = {
    mk_var_mudar_pontos: '<block type="mk_var_mudar"><field name="VAR">pontos</field>' + N('V', 1) + '</block>',
    mk_var_pontos: '<block type="mk_var"><field name="VAR">pontos</field></block>',
    mk_var_definir_medida: '<block type="mk_var_definir"><field name="VAR">medida</field>' + N('V', 0) + '</block>',
    mk_var_medida: '<block type="mk_var"><field name="VAR">medida</field></block>',
    mk_var_definir_recorde: '<block type="mk_var_definir"><field name="VAR">recorde</field>' + N('V', 0) + '</block>',
    mk_var_recorde: '<block type="mk_var"><field name="VAR">recorde</field></block>',
    mk_conta_menos: '<block type="mk_conta"><field name="OP">-</field>' + N('A', 0) + N('B', 0) + '</block>',
    mk_registar_temp: '<block type="mk_registar">' + TX('NOME', 'temperatura') + N('V', 0) + '</block>',
  };

  // ============================================================ NÍVEL 1 · OBSERVAR
  const SOL_SOMBRA = {
    titulo: 'Sol ou sombra',
    missao: 'Quando carregas no A, o micro:bit mostra quanta luz há aí.',
    passos: ['Usa «no botão A premido» com «mostrar número».', 'Encaixa «nível de luz» no buraco do número.', 'Experimenta ao sol e à sombra: mexe na luz e carrega em A outra vez.'],
    material: 'micro:bit',
    novos: ['mk_botao', 'mk_mostrar_numero', 'mk_luz'],
    caixa: ['mk_botao', 'mk_mostrar_numero', 'mk_luz'],
    teste: 'botao:A',
    // duas medições com luz diferente, e cada uma mostra a luz daquele momento
    ok: r => {
      const certas = vezes(r, 'botao:A').filter(({ i, s }) => s.includes('numero:' + sensorEm(r, i, 'luz', 150)));
      return new Set(certas.map(({ i }) => sensorEm(r, i, 'luz', 150))).size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', '{ola} Hoje somos cientistas da horta. As plantas gostam de sol ou de sombra? Vamos medir a luz!'],
      parecePronto: a => dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_luz'),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A, depois muda a luz e carrega outra vez.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Queres medir só quando decides tu. O que é que no micro:bit pode dizer «agora!»?')),
        com('sem_numero', P.bloco('botao:A', 'mk_mostrar_numero', 'Já sabe quando medir. E como é que te mostra quanta luz há?')),
        com('sem_luz', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_luz', 'O número que aparece é sempre o mesmo… mas a luz do sol muda! Quem é que mede a luz?')),
      ],
      sucesso: 'Medição feita! Ao sol o número é grande, à sombra é pequeno. Já és cientista da horta.',
      extensao: 'Mede ao pé de três plantas diferentes. Qual delas apanha mais sol?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_mostrar_numero">' + N('N', 0) + '</block></statement></block></xml>',
        pedido: 'Fui medir a luz ao sol e à sombra… e deu sempre 0! Estou a fazer alguma coisa mal?',
      },
    },
  };

  const BICHO_CONTADOR = {
    titulo: 'Bicho-contador',
    missao: 'Cada vez que vês um bicho, carregas no A e o micro:bit conta mais um.',
    passos: ['Dentro de «no botão A premido»: «mudar contador em 1».', 'Depois mostra o número do contador.', 'Experimenta: carrega em A três vezes.'],
    material: 'micro:bit, olhos atentos',
    novos: ['mk_var_mudar', 'mk_var'],
    caixa: ['mk_botao', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => { const n = numeros(r); return n.includes(1) && n.includes(2) && n.includes(3); },
    tutor: {
      boasVindas: ['boas_vindas', 'Quantos bichos há na horta? Formigas, joaninhas, borboletas… Vamos fazer um contador de bichos.'],
      parecePronto: a => tem(a.evento('botao:A'), 'mk_var_mudar') && dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A três vezes: deve dar 1, 2, 3.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Quando vês um bicho, como é que avisas o micro:bit?')),
        com('sem_mudar', P.bloco('botao:A', 'mk_var_mudar', 'Para contar, o micro:bit tem de se lembrar de quantos já viu. Onde é que ele guarda essa conta?')),
        com('sem_numero', P.bloco('botao:A', 'mk_mostrar_numero', 'O micro:bit já conta às escondidas. Como é que nos mostra a conta?')),
        com('sem_var', P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número. Qual é o número que está a crescer?')),
      ],
      sucesso: 'Um, dois, três bichos! Contar é a primeira coisa que os cientistas fazem no campo.',
      extensao: 'E se o B tirasse um, para quando contas o mesmo bicho duas vezes?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">contador</field></block>') + '</block></statement></block></xml>',
        pedido: 'Já vi cinco joaninhas e o meu contador diz sempre 0! O que é que me esqueci?',
      },
    },
  };

  const DIA_NOITE = {
    titulo: 'Dia e noite',
    missao: 'O micro:bit dorme quando fica escuro e acorda quando há luz.',
    passos: ['Dentro de «para sempre»: «se está escuro então … senão …».', 'Em cima, o ícone a dormir. Em baixo, o contente.', 'Experimenta: mexe na luz para pouco e para muito.'],
    material: 'micro:bit',
    novos: ['mk_sempre', 'mk_se', 'mk_icone_dormir'],
    caixa: ['mk_sempre', 'mk_se', 'mk_icone_dormir', 'mk_icone'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v < 40, s => s.includes('icone:Asleep')) && aposSensor(r, 'luz', v => v >= 40, s => s.includes('icone:Happy')),
    tutor: {
      boasVindas: ['boas_vindas', 'As galinhas deitam-se quando o sol se põe. O micro:bit também pode! Vamos fazê-lo dormir de noite.'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_escuro') && temIcone(ramo(d, 'sim'), 'Asleep') && temIcone(ramo(d, 'nao'), 'Happy')),
      testar: 'Tens uma ideia? Vamos testar! Baixa a luz até ao fim, depois volta a subir.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A noite pode chegar a qualquer momento. Quem é que fica sempre de vigia?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Há duas hipóteses: está escuro ou não está. Que bloco escolhe entre duas coisas?')),
        com('trocados', P.regra('trocados', a => ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'nao'), 'Asleep') && temIcone(ramo(d, 'sim'), 'Happy')), [
          ['surpreendida', 'Ui! Então dorme de dia e acorda de noite? Parece uma coruja!'],
          'Lê o «se» em voz alta: «se está escuro então…». O que deve fazer quando está escuro?',
          'Troca: o ícone a dormir vai para cima, o contente para baixo (no «senão»).',
        ], 'Agora sim, dorme de noite!')),
        com('sem_dormir', P.regra('sem_dormir', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Asleep')), [
          'Quando está escuro, o que é que o micro:bit faz?',
          'Há um ícone com os olhos fechados.',
          'Põe «mostrar ícone» a dormir logo a seguir ao «se está escuro então».',
        ], 'Boa noite, micro:bit!')),
        com('sem_acordado', P.regra('sem_acordado', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'nao'), 'Happy')), [
          'E quando volta a luz? Fica a dormir para sempre?',
          'O «senão» é o que acontece quando não está escuro.',
          'Põe o ícone contente no «senão».',
        ], 'Bom dia!')),
      ],
      sucesso: 'Dorme de noite e acorda de manhã, como os pardais. O sensor de luz é o relógio da natureza.',
      extensao: 'E se ao acordar tocasse um som, como um galo?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' + V('C', '<block type="mk_escuro"></block>') +
          '<statement name="SIM"><block type="mk_icone"><field name="I">Happy</field></block></statement><statement name="NAO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></statement></block></xml>',
        pedido: 'O meu micro:bit está todo trocado: dorme ao meio-dia e fica acordado à noite! Ajudas-me?',
      },
    },
  };

  const CANTO_PASSARO = {
    titulo: 'Canto do pássaro',
    missao: 'Quando carregas no A, o micro:bit canta como um pássaro: pelo menos três notas diferentes.',
    passos: ['Usa «no botão A premido».', 'Põe lá dentro três «tocar tom», um a seguir ao outro.', 'Escolhe notas diferentes e experimenta.'],
    material: 'micro:bit V2 (altifalante)',
    novos: ['mk_tom'],
    caixa: ['mk_botao', 'mk_tom', 'mk_pausa', 'mk_repetir'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ s }) => new Set(s.filter(x => x.startsWith('tom:'))).size >= 3),
    tutor: {
      boasVindas: ['boas_vindas', 'Na primavera as andorinhas chegam a cantar. Vamos inventar um canto de pássaro?'],
      parecePronto: a => new Set(blocos(a.evento('botao:A'), 'mk_tom').map(p => p.freq)).size >= 3,
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e ouve o teu pássaro.',
      regras: [
        com('sem_a', P.evento('botao:A', 'O pássaro canta quando tu quiseres. Como é que lhe dizes «canta!»?')),
        com('sem_tom', P.bloco('botao:A', 'mk_tom', 'Um pássaro sem voz… Que bloco faz o micro:bit tocar uma nota?')),
        com('poucas', P.regra('poucas_notas', a => { const t = blocos(a.evento('botao:A'), 'mk_tom'); return t.length > 0 && t.length < 3; }, [
          'Um canto com uma nota só parece um apito. Quantas notas tem o canto de um pássaro?',
          'Junta mais «tocar tom» por baixo, até teres pelo menos três.',
          'Arrasta mais dois «tocar tom» para dentro do botão A.',
        ], 'Agora já é uma melodia!')),
        com('iguais', P.regra('notas_iguais', a => { const t = blocos(a.evento('botao:A'), 'mk_tom'); return t.length >= 3 && new Set(t.map(p => p.freq)).size < 3; }, [
          ['a_pensar', 'Três notas iguais… pi, pi, pi. Os pássaros sobem e descem!'],
          'Carrega na setinha de cada nota e escolhe outra.',
          'Escolhe três notas diferentes, por exemplo Sol, Mi e Dó alto.',
        ], 'Que canto bonito!')),
      ],
      sucesso: 'Piu-piu! Inventaste um canto. Cada pássaro tem o seu: é assim que se reconhecem uns aos outros.',
      extensao: 'Grava o canto de um pássaro de verdade com o telemóvel e tenta imitá-lo com as notas.',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_tom">' + NOTA(262) + '<next><block type="mk_tom">' + NOTA(262) + '<next><block type="mk_tom">' + NOTA(262) + '</block></next></block></next></block></statement></block></xml>',
        pedido: 'O meu pássaro só sabe uma nota: dó, dó, dó! Parece um despertador. Ajudas-me a pô-lo a cantar?',
      },
    },
  };

  const NINHO = {
    titulo: 'Temperatura do ninho',
    missao: 'Quando carregas no B, o micro:bit mostra a temperatura em graus.',
    passos: ['Usa «no botão B premido» com «mostrar número».', 'Encaixa «temperatura (°C)» no número.', 'Experimenta: muda a temperatura e carrega em B.'],
    material: 'micro:bit',
    novos: ['mk_botao_B', 'mk_temperatura'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_mostrar_numero', 'mk_temperatura', 'mk_luz'],
    teste: 'botao:B',
    ok: r => vezes(r, 'botao:B').some(({ i, s }) => s.includes('numero:' + sensorEm(r, i, 'temperatura', 21))),
    tutor: {
      boasVindas: ['boas_vindas', 'As cegonhas fazem ninho lá no alto. Estará quente ou frio lá em cima? Vamos fazer um termómetro.'],
      parecePronto: a => dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_temperatura'),
      testar: 'Tens uma ideia? Vamos testar! Muda a temperatura e carrega em B.',
      regras: [
        com('sem_b', P.evento('botao:B', 'Desta vez é o outro botão que manda medir. Qual é?')),
        com('sem_numero', P.bloco('botao:B', 'mk_mostrar_numero', 'A temperatura é um número. Como é que o micro:bit mostra números?')),
        com('luz_em_vez', P.regra('luz_em_vez', a => dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_luz'), [
          ['surpreendida', 'Hmm, isso mede o calor ou a luz? Ao sol há luz e calor, mas não são a mesma coisa!'],
          'Procura um bloco cor-de-rosa que fala em graus.',
          'Troca «nível de luz» por «temperatura (°C)».',
        ], 'Agora é mesmo um termómetro!')),
        com('sem_temp', P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_temperatura', 'Aparece sempre o mesmo número, faça calor ou frio. Quem mede o calor?')),
      ],
      sucesso: 'Termómetro pronto! O micro:bit mede a temperatura lá dentro dele: ao sol aquece mais do que o ar.',
      extensao: 'Mede à sombra de uma oliveira e ao sol. Quantos graus de diferença?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><field name="B">B</field><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_luz"></block>') + '</block></statement></block></xml>',
        pedido: 'O meu termómetro diz 150 graus! Até as cegonhas fugiam. Acho que fiz uma gambiarra…',
      },
    },
  };

  const GUARDIA_HORTA = {
    titulo: 'Guardiã da horta',
    missao: 'Dois pregos na terra e o micro:bit mostra num gráfico se a terra está seca ou molhada.',
    passos: ['Pregos na terra: crocodilo de um ao pin 1, do outro ao 3V.', 'Dentro de «para sempre»: gráfico de barras da «leitura analógica pin P1» até 1023.', 'Experimenta: mexe no pin 1 (terra seca ↔ molhada).'],
    material: 'micro:bit, 2 crocodilos, 2 pregos, um vaso com terra',
    novos: ['mk_grafico', 'mk_ler_analogico'],
    caixa: ['mk_sempre', 'mk_grafico', 'mk_ler_analogico', 'mk_luz', 'mk_pausa'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v >= 900, s => s.some(x => /^grafico:(2[2-5])$/.test(x))) &&
      aposSensor(r, 'analogico:P1', v => v >= 400 && v <= 620, s => s.some(x => /^grafico:(1[0-5])$/.test(x))) &&
      aposSensor(r, 'analogico:P1', v => v <= 50, s => s.some(x => /^grafico:[0-2]$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'As alfaces têm sede no verão alentejano! Vamos pôr o micro:bit a vigiar a terra da horta.'],
      parecePronto: a => dentro(a.evento('sempre'), 'mk_grafico', 'mk_ler_analogico') && blocos(a.evento('sempre'), 'mk_grafico').some(p => Number(p.max) === 1023),
      testar: 'Tens uma ideia? Vamos testar! Mexe no pin 1: terra seca, meio, molhada.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A terra seca devagarinho, ao longo do dia. Quem é que fica a vigiar sem parar?')),
        com('sem_grafico', P.bloco('sempre', 'mk_grafico', 'Como é que o micro:bit mostra «muito» ou «pouco» com as luzes?')),
        com('luz_em_vez', P.regra('luz_em_vez', a => dentro(a.evento('sempre'), 'mk_grafico', 'mk_luz') && !dentro(a.evento('sempre'), 'mk_grafico', 'mk_ler_analogico'), [
          ['a_pensar', 'A luz diz-nos se há sol… e a água na terra, quem nos diz?'],
          'Os pregos estão ligados ao pin 1. Procura o bloco que lê um pin.',
          'Troca «nível de luz» por «leitura analógica pin P1».',
        ], 'Agora sim, mede a terra!')),
        com('sem_pino', P.valorEm('sempre', 'mk_grafico', 'mk_ler_analogico', 'Com água, a eletricidade passa melhor de um prego para o outro. Como é que o micro:bit lê o pin 1?')),
        com('maximo', P.regra('maximo', a => blocos(a.evento('sempre'), 'mk_grafico').some(p => p.max != null && Number(p.max) !== 1023), [
          'O gráfico enche-se cedo demais. Até quanto vai a leitura de um pin?',
          'A leitura analógica vai de 0 a 1023.',
          'No «até» do gráfico escreve 1023.',
        ], 'Agora o gráfico está certinho!')),
      ],
      sucesso: 'A guardiã está de vigia! Terra molhada, muitas luzes; terra seca, poucas. A água conduz a eletricidade.',
      extensao: 'Mede um vaso regado e outro seco. Rega um pouco e vê o gráfico subir.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_grafico">' + V('V', '<block type="mk_luz"></block>') + N('MAX', 1023) + '</block></statement></block></xml>',
        pedido: 'Reguei as alfaces e o meu gráfico não mexeu nada! Só muda quando passa uma nuvem… O que é que fiz?',
      },
    },
  };

  // ============================================================ NÍVEL 2 · CUIDAR
  const HORA_REGAR = {
    titulo: 'Hora de regar',
    missao: 'Se a terra está seca, cara triste e uma luz acesa; se está molhada, cara contente e luz apagada.',
    passos: ['Dentro de «para sempre»: «se … então … senão» com «leitura analógica pin P1 < 300».', 'Seca: cara triste e P2 para 1. Molhada: cara contente e P2 para 0.', 'Experimenta: terra seca e terra molhada.'],
    material: 'micro:bit, 2 pregos, LED, 4 crocodilos',
    novos: ['mk_se_senao', 'mk_comparar', 'mk_icone_triste', 'mk_digital_1', 'mk_digital_0'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_icone', 'mk_icone_triste', 'mk_digital_1', 'mk_digital_0'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v < 250, s => s.includes('icone:Sad') && s.includes('digital:P2:1')) &&
      aposSensor(r, 'analogico:P1', v => v > 350, s => s.includes('icone:Happy') && s.includes('digital:P2:0')),
    tutor: {
      boasVindas: ['boas_vindas', 'A horta não fala… mas o micro:bit pode avisar quando as plantas têm sede!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar') && usa(d, 'mk_ler_analogico') &&
        temIcone(ramo(d, 'sim'), 'Sad') && ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)),
      testar: 'Tens uma ideia? Vamos testar! Põe a terra seca, depois molhada.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A terra pode secar a qualquer hora. Quem vigia sem parar?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Há duas situações: seca ou molhada. Que bloco escolhe entre duas coisas?')),
        com('sem_comparar', P.regra('sem_comparar', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar')), [
          'Como é que o micro:bit sabe o que é «seco»? Tem de comparar com um número.',
          'Há um bloco verde-azulado que compara dois números: «<».',
          'Encaixa o comparar no «se» e põe «leitura analógica pin P1 < 300».',
        ], 'Já sabe o que é seco!')),
        com('sem_humidade', P.regra('sem_humidade', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar')) && !ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')), [
          'Está a comparar… mas a comparar o quê? Onde está a humidade da terra?',
          'Os pregos estão no pin 1: precisas da leitura analógica.',
          'Encaixa «leitura analógica pin P1» do lado esquerdo do «<».',
        ], 'Agora compara a terra!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => ['>', '>='].includes(opDe(d)) && temIcone(ramo(d, 'sim'), 'Sad')), [
          ['surpreendida', 'Ui! Fica triste com a terra encharcada? Os patos é que gostavam!'],
          'Leitura pequena quer dizer terra seca. O sinal está virado para que lado?',
          'Troca o «>» por «<».',
        ], 'Agora pede água quando tem sede!')),
        com('sem_triste', P.regra('sem_triste', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_comparar')) && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Sad')), [
          'Quando a terra está seca, que cara faz a planta?',
          'Procura o ícone triste.',
          'Põe a cara triste logo dentro do «então».',
        ], 'Coitadinha, tem sede!')),
        com('sem_led', P.regra('sem_led', a => ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Sad')) && !ses(a.evento('sempre')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)), [
          'Quem está longe não vê a carinha. Como é que avisas de longe?',
          'Uma luz de fora no pin 2: «gravação digital pin P2 para 1».',
          'Põe «P2 para 1» no «então» e «P2 para 0» no «senão».',
        ], 'Agora vê-se de longe!')),
      ],
      sucesso: 'Rega à vista! Comparar um número com um limite é o que muitas máquinas fazem: termóstatos, regas, alarmes.',
      extensao: 'O 300 é o melhor limite? Experimenta na terra de verdade e escolhe o teu número.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' +
          V('C', '<block type="mk_comparar"><field name="OP">&gt;</field>' + V('A', ANALOG) + N('B', 300) + '</block>') +
          '<statement name="SIM"><block type="mk_icone"><field name="I">Sad</field><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value>' + N('V', 1) + '</block></next></block></statement>' +
          '<statement name="NAO"><block type="mk_icone"><field name="I">Happy</field><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value>' + N('V', 0) + '</block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu alarme pede água quando a terra já está um charco! Encontras a gambiarra?',
      },
    },
  };

  const ESPANTALHO = {
    titulo: 'Espantalho',
    missao: 'Quando há um barulho forte, o braço do espantalho abana: o servo vai a 180 e volta a 0.',
    passos: ['Usa «em som alto».', 'Lá dentro: servo a 180, uma pausa, servo a 0.', 'Experimenta: carrega em BATER PALMAS.'],
    material: 'micro:bit V2, servomotor, 3 crocodilos, um braço de cartão',
    novos: ['mk_som_alto', 'mk_servo'],
    caixa: ['mk_som_alto', 'mk_servo', 'mk_pausa', 'mk_repetir', 'mk_icone'],
    teste: 'somalto',
    ok: r => vezes(r, 'somalto').some(({ s }) => { const a = angulos(s); return new Set(a).size >= 2 && Math.max(...a) - Math.min(...a) >= 60; }),
    tutor: {
      boasVindas: ['boas_vindas', 'Os pardais andam a comer as sementes! Vamos fazer um espantalho que mexe o braço quando ouve barulho.'],
      parecePronto: a => new Set(servos(plano((a.evento('somalto') || {}).seq))).size >= 2,
      testar: 'Tens uma ideia? Vamos testar! Carrega em BATER PALMAS.',
      regras: [
        com('sem_som', P.evento('somalto', 'O espantalho acorda com barulho. Que bloco cor-de-rosa ouve?')),
        com('sem_servo', P.bloco('somalto', 'mk_servo', 'Ouviu! E agora, o que é que mexe o braço?')),
        com('uma_posicao', P.regra('uma_posicao', a => { const s = servos(plano((a.evento('somalto') || {}).seq)); return s.length > 0 && new Set(s).size < 2; }, [
          'O braço vai para um sítio e fica lá parado. Isso é abanar?',
          'Para abanar, o braço tem de ir para um lado e depois para o outro.',
          'Junta outro «escrever servo» com outro ângulo: 180 e depois 0.',
        ], 'Agora abana!')),
        com('sem_pausa', P.regra('sem_pausa', a => { const e = a.evento('somalto'); return !!e && new Set(servos(plano(e.seq))).size >= 2 && !tem(e, 'mk_pausa'); }, [
          ['a_pensar', 'No ecrã parece que mexe… mas um servo de verdade precisa de tempo para chegar lá!'],
          'Entre os dois movimentos, espera um bocadinho.',
          'Põe uma «pausa» entre os dois «escrever servo».',
        ], 'Assim o motor tem tempo de chegar!')),
      ],
      sucesso: 'Xô, pardais! O espantalho ouve e mexe-se. Os motores dão braços às nossas invenções.',
      extensao: 'E se abanasse três vezes? Usa «repetir».',
      gambiarra: {
        xml: '<xml><block type="mk_som_alto" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field>' + N('A', 90) + '</block></statement></block></xml>',
        pedido: 'Bato palmas e o meu espantalho fica com o braço esticado, sem abanar. Os pardais estão a rir-se de mim!',
      },
    },
  };

  const COMEDOURO = {
    titulo: 'Comedouro',
    missao: 'O botão A abre a porta do comedouro dos pássaros e o B fecha-a.',
    passos: ['No botão A: «escrever servo pin P0 para» um ângulo grande (aberto).', 'No botão B: o servo volta a 0 (fechado).', 'Experimenta: A e depois B.'],
    material: 'micro:bit, servomotor, 3 crocodilos, caixa de cartão, sementes',
    novos: ['mk_botao_B'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_servo', 'mk_icone'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ s }) => { const a = angulos(s); return a.length && a[a.length - 1] >= 60; }) &&
      vezes(r, 'botao:B').some(({ s }) => { const a = angulos(s); return a.length && a[a.length - 1] <= 20; }),
    tutor: {
      boasVindas: ['boas_vindas', 'No inverno há poucas sementes para os passarinhos. Vamos construir um comedouro com porta!'],
      parecePronto: a => { const sa = servos(plano((a.evento('botao:A') || {}).seq)), sb = servos(plano((a.evento('botao:B') || {}).seq)); return sa.some(x => x >= 60) && sb.some(x => x <= 20); },
      testar: 'Tens uma ideia? Vamos testar! Carrega em A para abrir e em B para fechar.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Quem abre a porta do comedouro? Escolhe um botão.')),
        com('sem_b', P.evento('botao:B', 'A porta abre… e para fechar? Precisas de outro botão.')),
        com('sem_servo_a', P.bloco('botao:A', 'mk_servo', 'O botão A já está à escuta. O que é que roda a porta?')),
        com('sem_servo_b', P.bloco('botao:B', 'mk_servo', 'O botão B também tem de mexer no motor. Com que bloco?')),
        com('igual', P.regra('igual', a => { const sa = servos(plano((a.evento('botao:A') || {}).seq)), sb = servos(plano((a.evento('botao:B') || {}).seq)); return sa.length && sb.length && sa[sa.length - 1] === sb[sb.length - 1]; }, [
          'A e B põem a porta no mesmo sítio. Então como é que fecha?',
          'Fechado é 0 graus. Aberto é um número grande, como 90 ou 180.',
          'Muda o ângulo do B para 0.',
        ], 'Abre e fecha!')),
        com('trocados', P.regra('trocados', a => { const sa = servos(plano((a.evento('botao:A') || {}).seq)), sb = servos(plano((a.evento('botao:B') || {}).seq)); return sa.length && sb.length && sa[sa.length - 1] < sb[sb.length - 1]; }, [
          ['surpreendida', 'Ui! O A fecha e o B abre? A missão pede ao contrário.'],
          '0 graus é fechado, 180 é aberto.',
          'Troca os números: o maior no A, o 0 no B.',
        ], 'Agora sim!')),
      ],
      sucesso: 'Comedouro aberto! Os pássaros agradecem. Abre de manhã e fecha à noite, para os ratos não comerem tudo.',
      extensao: 'E se a porta abrisse sozinha quando há luz (de manhã) e fechasse quando fica escuro?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block></statement></block></xml>',
        pedido: 'O meu comedouro nunca fecha e os ratos já descobriram as sementes! Ajudas-me?',
      },
    },
  };

  const ABELHAS = {
    titulo: 'Contador de abelhas',
    missao: 'Uma flor de papel de alumínio no pin 1: cada visita conta mais uma, com um zumbido.',
    passos: ['Crocodilo do pin 1 à flor; segura no GND (és a abelha!).', 'Em «no pin P1 premido»: mudar contador, tocar tom e mostrar o contador.', 'Experimenta: toca no pin 1 três vezes.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, cartolina',
    novos: ['mk_pino_tocado', 'mk_tom_livre'],
    caixa: ['mk_pino_tocado', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero', 'mk_tom_livre', 'mk_icone'],
    teste: 'pino:P1',
    ok: r => { const n = numeros(r); return n.includes(1) && n.includes(2) && n.includes(3) && vezes(r, 'pino:P1').some(({ s }) => s.some(x => x.startsWith('tom:'))); },
    tutor: {
      boasVindas: ['boas_vindas', 'As abelhas visitam as flores do rosmaninho. Quantas visitas recebe uma flor? Vamos contar!'],
      parecePronto: a => { const e = a.eventosDe('pino:')[0]; return !!e && tem(e, 'mk_var_mudar') && tem(e, 'mk_tom') && dentro(e, 'mk_mostrar_numero', 'mk_var'); },
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1, uma, duas, três vezes.',
      regras: [
        com('sem_pino', P.evento('pino:', 'Quando a abelha pousa, fecha um circuito. Que bloco sente o pin a ser tocado?')),
        com('sem_mudar', P.bloco('pino:', 'mk_var_mudar', 'Cada visita tem de ficar guardada. Onde guarda o micro:bit a conta?')),
        com('sem_numero', P.bloco('pino:', 'mk_mostrar_numero', 'Já conta! E como é que vês quantas visitas já houve?')),
        com('sem_var', P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número. Qual é o que vai crescendo?')),
        com('sem_zumbido', P.bloco('pino:', 'mk_tom', 'Uma abelha silenciosa? Que bloco faz bzzz?')),
      ],
      sucesso: 'Bzzz, três visitas! As abelhas levam o pólen de flor em flor: sem elas não havia fruta.',
      extensao: 'Faz duas flores (pin 0 e pin 1) e conta as visitas de cada uma. Qual é a preferida?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', 1) + '</block></statement></block>' +
          '<block type="mk_pino_tocado" x="40" y="200"><field name="P">P1</field><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_num"><field name="NUM">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value>' +
          '<next><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">contador</field></block>') + '</block></next></block></statement></block></xml>',
        pedido: 'A abelha pousa, zumbe… e o meu contador fica sempre no 0! Só conta quando eu carrego no A. Onde está a gambiarra?',
      },
    },
  };

  const GEADA = {
    titulo: 'Alarme de geada',
    missao: 'Se a temperatura descer abaixo de 3 °C, o micro:bit toca um alarme para tapar as plantas.',
    passos: ['Dentro de «para sempre»: «se … então» com «temperatura (°C) < 3».', 'Lá dentro: tocar tom (o alarme).', 'Experimenta: muda a temperatura para 0 e depois para 20.'],
    material: 'micro:bit V2',
    novos: ['mk_se_entao', 'mk_temperatura'],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_temperatura', 'mk_luz', 'mk_tom', 'mk_icone'],
    teste: 'temperatura',
    ok: r => aposSensor(r, 'temperatura', v => v < 3, s => s.some(x => x.startsWith('tom:'))) &&
      aposSensor(r, 'temperatura', v => v >= 10, s => !s.some(x => x.startsWith('tom:'))),
    tutor: {
      boasVindas: ['boas_vindas', 'Em janeiro, de manhã, a horta às vezes fica branca de geada. Brrr! Vamos fazer um alarme.'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura') && ['<', '<='].includes(opDe(d)) && ramo(d, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')),
      testar: 'Tens uma ideia? Vamos testar! Põe 0 graus, depois 20.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A geada chega de madrugada, quando estamos a dormir. Quem fica de vigia?')),
        com('sem_se', P.regra('sem_se', a => !!a.evento('sempre') && ses(a.evento('sempre')).length === 0, [
          'O alarme só deve tocar quando está muito frio. Que bloco decide «só se…»?',
          'Procura o bloco verde-azulado «se … então».',
          'Põe «se … então» dentro do «para sempre».',
        ], 'Já decide!')),
        com('sem_temp', P.regra('sem_temperatura', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura')), [
          'O frio mede-se com quê? Com a luz não é…',
          'Precisas de comparar a «temperatura (°C)» com um número.',
          'No «se», põe «temperatura (°C) < 3».',
        ], 'Agora sente o frio!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura') && ['>', '>='].includes(opDe(d))), [
          ['surpreendida', 'Ui! Assim o alarme toca quando está calor!'],
          'Geada é frio: temperatura MENOR do que 3.',
          'Troca o «>» por «<».',
        ], 'Agora é alarme de frio!')),
        com('sem_alarme', P.regra('sem_alarme', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura')) && !ses(a.evento('sempre')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')), [
          'Está frio… e ninguém acorda. O que é que faz barulho?',
          'Um bloco laranja de música.',
          'Põe «tocar tom» dentro do «então».',
        ], 'Piiii! Toda a gente acorda!')),
      ],
      sucesso: 'Alarme de geada pronto! Os agricultores tapam as plantas com plástico ou palha quando o frio aperta.',
      extensao: 'E quando está muito calor (mais de 35 °C)? Faz outro aviso diferente.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se_entao">' +
          V('C', '<block type="mk_comparar"><field name="OP">&lt;</field>' + V('A', '<block type="mk_luz"></block>') + N('B', 3) + '</block>') +
          '<statement name="SIM"><block type="mk_tom">' + NOTA(523) + '</block></statement></block></statement></block></xml>',
        pedido: 'Esta noite geou e o meu alarme nem piou! Mas tocou quando apaguei a luz… Que gambiarra fiz?',
      },
    },
  };

  const CORUJAS = {
    titulo: 'Silêncio, corujas!',
    missao: 'Se houver barulho, a coruja acorda assustada; se estiver calmo, dorme.',
    passos: ['Dentro de «para sempre»: «se … senão» com «nível de som > 100».', 'Barulho: ícone surpreendido. Calma: ícone a dormir.', 'Experimenta: som alto e som baixo.'],
    material: 'micro:bit V2 (microfone)',
    novos: ['mk_som_nivel', 'mk_icone_surpreendido'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_som_nivel', 'mk_luz', 'mk_icone_surpreendido', 'mk_icone_dormir'],
    teste: 'som',
    ok: r => aposSensor(r, 'som', v => v > 150, s => s.includes('icone:Surprised')) && aposSensor(r, 'som', v => v < 50, s => s.includes('icone:Asleep')),
    tutor: {
      boasVindas: ['boas_vindas', 'No celeiro velho mora uma coruja-das-torres. De dia ela dorme… se não fizermos barulho!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel') && usa(d, 'mk_comparar') &&
        (temIcone(ramo(d, 'sim'), 'Surprised') || temIcone(ramo(d, 'nao'), 'Surprised')) && (temIcone(ramo(d, 'sim'), 'Asleep') || temIcone(ramo(d, 'nao'), 'Asleep'))),
      testar: 'Tens uma ideia? Vamos testar! Sobe o som, depois baixa.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O barulho pode aparecer a qualquer momento. Quem fica a escutar?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Há duas hipóteses: barulho ou silêncio. Que bloco escolhe entre as duas?')),
        com('sem_som', P.regra('sem_som', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel')), [
          'A coruja acorda com quê? Com luz ou com barulho?',
          'Procura o bloco cor-de-rosa que mede o som.',
          'No «se», compara: «nível de som > 100».',
        ], 'Agora escuta!')),
        com('sem_susto', P.regra('sem_susto', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel')) && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Surprised') || temIcone(ramo(d, 'nao'), 'Surprised')), [
          'Quando há barulho, que cara faz a coruja?',
          'Há um ícone com a boca aberta de espanto.',
          'Põe o ícone surpreendido no ramo do barulho.',
        ], 'Que susto!')),
        com('sem_dormir', P.regra('sem_dormir', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_som_nivel')) && !ses(a.evento('sempre')).some(d => temIcone(ramo(d, 'sim'), 'Asleep') || temIcone(ramo(d, 'nao'), 'Asleep')), [
          'E quando volta o silêncio? A coruja fica acordada para sempre?',
          'Há um ícone com os olhos fechados.',
          'Põe o ícone a dormir no outro ramo.',
        ], 'Zzz… de volta ao sono.')),
      ],
      sucesso: 'Shhh! As corujas caçam ratos de noite e dormem de dia. Com menos barulho, há mais bichos à nossa volta.',
      extensao: 'Mede o barulho no recreio e na biblioteca. Onde é que a coruja dormia melhor?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' +
          V('C', '<block type="mk_comparar"><field name="OP">&gt;</field>' + V('A', '<block type="mk_luz"></block>') + N('B', 100) + '</block>') +
          '<statement name="SIM"><block type="mk_icone"><field name="I">Surprised</field></block></statement><statement name="NAO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></statement></block></xml>',
        pedido: 'A minha coruja acorda quando acendem a luz, mas dorme no meio da gritaria! Ajudas-me?',
      },
    },
  };

  // ============================================================ NÍVEL 3 · INVESTIGAR
  const DIARIO = {
    titulo: 'Diário da horta',
    missao: 'Cada vez que carregas no A, o micro:bit escreve no diário a humidade da terra.',
    passos: ['No botão A: «registar dados humidade = leitura analógica pin P1».', 'Escreve «humidade» no nome da coluna. Mostra um visto para saberes que gravou.', 'Experimenta: muda a humidade e carrega em A.'],
    material: 'micro:bit V2, 2 pregos, 2 crocodilos',
    novos: ['mk_registar', 'mk_icone_sim'],
    caixa: ['mk_botao', 'mk_registar', 'mk_ler_analogico', 'mk_luz', 'mk_icone_sim', 'mk_mostrar_numero'],
    sim: ['analogico:P1'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ i, s }) => s.some(x => { const m = x.match(/^registo:([^:]*):(-?[\d.]+)$/); return m && /humid/i.test(m[1]) && Number(m[2]) === sensorEm(r, i, 'analogico:P1', 0); })),
    tutor: {
      boasVindas: ['boas_vindas', 'Os cientistas escrevem tudo num diário. O micro:bit tem um diário dentro dele: vamos usá-lo!'],
      parecePronto: a => blocos(a.evento('botao:A'), 'mk_registar').some(p => /humid/i.test(String(p.nome))) && dentro(a.evento('botao:A'), 'mk_registar', 'mk_ler_analogico'),
      testar: 'Tens uma ideia? Vamos testar! Muda a humidade e carrega em A.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Queres escrever no diário só quando decides. Quem dá a ordem?')),
        com('sem_registar', P.bloco('botao:A', 'mk_registar', 'Mostrar no ecrã não fica guardado. Que bloco escreve no diário do micro:bit?')),
        com('luz_em_vez', P.regra('luz_em_vez', a => dentro(a.evento('botao:A'), 'mk_registar', 'mk_luz') && !dentro(a.evento('botao:A'), 'mk_registar', 'mk_ler_analogico'), [
          ['a_pensar', 'O diário é da terra… mas estás a guardar a luz!'],
          'A humidade vem dos pregos, no pin 1.',
          'Troca «nível de luz» por «leitura analógica pin P1».',
        ], 'Agora guarda a humidade!')),
        com('sem_humidade', P.valorEm('botao:A', 'mk_registar', 'mk_ler_analogico', 'Estás a guardar sempre 0. Onde está a medida da terra?')),
        com('nome', P.regra('nome', a => blocos(a.evento('botao:A'), 'mk_registar').length > 0 && !blocos(a.evento('botao:A'), 'mk_registar').some(p => /humid/i.test(String(p.nome))), [
          'No diário, a coluna chama-se como? Daqui a uma semana vais saber o que era este número?',
          'O nome da coluna é o texto branco do bloco.',
          'Escreve «humidade» no texto do «registar dados».',
        ], 'Bom nome!')),
      ],
      sucesso: 'Diário escrito! No micro:bit verdadeiro, abre o ficheiro MY_DATA.HTM: tens uma tabela com as tuas medições.',
      extensao: 'Mede todos os dias à mesma hora durante uma semana. A terra seca mais depressa ao sol ou à sombra?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_registar">' + TX('NOME', 'humidade') + V('V', '<block type="mk_luz"></block>') + '</block></statement></block></xml>',
        pedido: 'O meu diário diz que a terra tem sempre 150 de humidade… mesmo depois de chover! O que é que guardei mal?',
      },
    },
  };

  const ESPECIES = {
    titulo: 'Cegonhas e andorinhas',
    missao: 'A conta cegonhas (contador), B conta andorinhas (pontos), A+B mostra as duas contas.',
    passos: ['No A: mudar contador em 1. No B: mudar pontos em 1.', 'No A+B: mostrar o contador, uma pausa, e mostrar os pontos.', 'Experimenta: 3 cegonhas, 2 andorinhas, e A+B.'],
    material: 'micro:bit, binóculos (ou um tubo de cartão)',
    novos: ['mk_botao_AB', 'mk_var_mudar_pontos', 'mk_var_pontos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_botao_AB', 'mk_var_mudar', 'mk_var', 'mk_var_mudar_pontos', 'mk_var_pontos', 'mk_mostrar_numero', 'mk_pausa'],
    teste: 'botao:AB',
    ok: r => vezes(r, 'botao:AB').some(({ s }) => s.includes('numero:3') && s.includes('numero:2')),
    tutor: {
      boasVindas: ['boas_vindas', 'Em Messejana há ninhos de cegonha nas torres e andorinhas debaixo dos beirais. Quantas de cada?'],
      parecePronto: a => {
        const va = blocos(a.evento('botao:A'), 'mk_var_mudar').map(p => p.var), vb = blocos(a.evento('botao:B'), 'mk_var_mudar').map(p => p.var);
        const mostrados = new Set(plano((a.evento('botao:AB') || {}).seq).filter(p => p.tipo === 'mk_mostrar_numero').flatMap(p => p.usa.filter(u => u.tipo === 'mk_var').map(u => u.var)));
        return va.length && vb.length && va[0] !== vb[0] && mostrados.has(va[0]) && mostrados.has(vb[0]);
      },
      testar: 'Tens uma ideia? Vamos testar! A três vezes, B duas vezes, e depois A+B.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Viste uma cegonha! Como é que avisas o micro:bit?')),
        com('sem_b', P.evento('botao:B', 'E as andorinhas? Precisam de outro botão.')),
        com('sem_ab', P.evento('botao:AB', 'Já contas as duas. E para ver os resultados, que botão sobra?')),
        com('sem_mudar', P.regra('sem_mudar', a => !tem(a.evento('botao:A'), 'mk_var_mudar') || !tem(a.evento('botao:B'), 'mk_var_mudar'), [
          'Cada botão tem de guardar a sua conta. Onde se guarda?',
          'Usa «mudar … em 1» em cada botão.',
          'Põe «mudar contador em 1» no A e «mudar pontos em 1» no B.',
        ], 'Já contam os dois!')),
        com('mesma_var', P.regra('mesma_var', a => { const va = blocos(a.evento('botao:A'), 'mk_var_mudar').map(p => p.var), vb = blocos(a.evento('botao:B'), 'mk_var_mudar').map(p => p.var); return va.some(v => vb.includes(v)); }, [
          ['surpreendida', 'Ui! Cegonhas e andorinhas estão a ir para a mesma conta. Assim misturam-se!'],
          'Cada espécie precisa da sua variável.',
          'No B, escolhe «pontos» na setinha da variável.',
        ], 'Contas separadas!')),
        com('mostra_um', P.regra('mostra_um', a => { const e = a.evento('botao:AB'); if (!e) return false; const v = new Set(plano(e.seq).filter(p => p.tipo === 'mk_mostrar_numero').flatMap(p => p.usa.filter(u => u.tipo === 'mk_var').map(u => u.var))); return v.size < 2; }, [
          'O A+B mostra só uma das contas. E a outra espécie?',
          'Precisas de dois «mostrar número», um para cada variável.',
          'Mostra o contador, uma pausa, e depois os pontos.',
        ], 'Os dois resultados!')),
      ],
      sucesso: '3 cegonhas e 2 andorinhas! Contar várias espécies é o que fazem os cientistas nos censos de aves.',
      extensao: 'Faz o censo do recreio durante 10 minutos. Qual é a ave mais comum?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', 1) + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="180"><field name="B">B</field><statement name="DO"><block type="mk_var_mudar"><field name="VAR">contador</field>' + N('V', 1) + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="320"><field name="B">AB</field><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">contador</field></block>') +
          '<next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">500</field></shadow></value><next><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">pontos</field></block>') +
          '</block></next></block></next></block></statement></block></xml>',
        pedido: 'Contei 3 cegonhas e 2 andorinhas… e o meu micro:bit diz 5 cegonhas e 0 andorinhas! Que trapalhada!',
      },
    },
  };

  const ESTACAO = {
    titulo: 'Estação do recreio',
    missao: 'Para sempre: o micro:bit regista a luz e a temperatura no diário, com uma pausa entre medições.',
    passos: ['Dentro de «para sempre»: dois «registar dados», um «luz» e outro «temperatura».', 'Encaixa o sensor certo em cada um e junta uma pausa.', 'Experimenta: muda a luz e a temperatura e vê a tabela.'],
    material: 'micro:bit V2, pilhas, um sítio à sombra no recreio',
    novos: ['mk_registar_temp'],
    caixa: ['mk_sempre', 'mk_registar', 'mk_registar_temp', 'mk_luz', 'mk_temperatura', 'mk_pausa'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v === 40, s => s.some(x => /^registo:[^:]*luz[^:]*:40$/i.test(x))) &&
      aposSensor(r, 'temperatura', v => v === 30, s => s.some(x => /^registo:[^:]*temp[^:]*:30$/i.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Uma estação meteorológica mede o tempo sozinha, o dia todo. Vamos pôr uma no recreio!'],
      parecePronto: a => { const e = a.evento('sempre'); const r = blocos(e, 'mk_registar'); return r.some(p => (p.usa || []).some(u => u.tipo === 'mk_luz')) && r.some(p => (p.usa || []).some(u => u.tipo === 'mk_temperatura')) && tem(e, 'mk_pausa'); },
      testar: 'Tens uma ideia? Vamos testar! Muda a luz e a temperatura e espreita a tabela.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A estação mede sozinha, sem ninguém carregar em botões. Que bloco faz isso?')),
        com('sem_registar', P.bloco('sempre', 'mk_registar', 'O que é que guarda as medidas no diário?')),
        com('so_um', P.regra('so_um', a => blocos(a.evento('sempre'), 'mk_registar').length === 1, [
          'Estás a guardar uma coisa. A missão pede duas: quais?',
          'Junta outro «registar dados» por baixo.',
          'Um para a luz, outro para a temperatura.',
        ], 'Duas colunas no diário!')),
        com('temp_errada', P.regra('temp_errada', a => blocos(a.evento('sempre'), 'mk_registar').some(p => /temp/i.test(String(p.nome)) && !(p.usa || []).some(u => u.tipo === 'mk_temperatura')), [
          ['a_pensar', 'A coluna diz «temperatura»… mas o que estás a medir lá dentro?'],
          'Cada coluna precisa do seu sensor.',
          'Encaixa «temperatura (°C)» no registar da temperatura.',
        ], 'Cada coisa no seu sítio!')),
        com('luz_errada', P.regra('luz_errada', a => blocos(a.evento('sempre'), 'mk_registar').some(p => /luz/i.test(String(p.nome)) && !(p.usa || []).some(u => u.tipo === 'mk_luz')), [
          'A coluna da luz está a guardar o quê?',
          'Procura o bloco cor-de-rosa «nível de luz».',
          'Encaixa «nível de luz» no registar da luz.',
        ], 'Agora sim!')),
        com('sem_pausa', P.regra('sem_pausa', a => blocos(a.evento('sempre'), 'mk_registar').length >= 2 && !tem(a.evento('sempre'), 'mk_pausa'), [
          'Sem pausa, o micro:bit mede 50 vezes por segundo. O diário enche num instante! De quanto em quanto tempo queres medir?',
          'Junta uma pausa no fim do «para sempre».',
          'Põe «pausa (ms)» depois dos dois registar.',
        ], 'Assim o diário dura o dia todo!')),
      ],
      sucesso: 'Estação a funcionar! Com os dados, podes fazer um gráfico do dia: quando aquece mais, quando há mais luz.',
      extensao: 'Muda a pausa para 60000 (um minuto) e deixa a estação ligada durante o recreio todo.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_registar">' + TX('NOME', 'luz') + V('V', '<block type="mk_luz"></block>') +
          '<next><block type="mk_registar">' + TX('NOME', 'temperatura') + V('V', '<block type="mk_luz"></block>') +
          '<next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">1000</field></shadow></value></block></next></block></next></block></statement></block></xml>',
        pedido: 'A minha estação diz que a temperatura é 150 graus! Acho que meti o sensor errado em algum lado…',
      },
    },
  };

  const SOMBRA_OLIVEIRAS = {
    titulo: 'Sombra das oliveiras',
    missao: 'A guarda a luz ao sol; B mostra a diferença entre a luz de agora e a guardada.',
    passos: ['No A: «definir medida para nível de luz».', 'No B: mostrar número de (nível de luz − medida).', 'Experimenta: luz alta, A; luz baixa, B.'],
    material: 'micro:bit',
    novos: ['mk_var_definir_medida', 'mk_var_medida', 'mk_conta_menos'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_definir_medida', 'mk_var_medida', 'mk_luz', 'mk_conta_menos', 'mk_mostrar_numero'],
    teste: 'botao:B',
    ok: r => vezes(r, 'botao:B').some(({ i, s }) => {
      let guardada = null;
      for (const a of vezes(r, 'botao:A')) if (a.i < i) guardada = sensorEm(r, a.i, 'luz', 150);
      const agora = sensorEm(r, i, 'luz', 150);
      return guardada !== null && guardada !== agora && s.some(x => x.startsWith('numero:') && Math.abs(Number(x.slice(7))) === Math.abs(agora - guardada));
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Debaixo de uma oliveira está mais fresco. Mas quanta luz é que a árvore tapa? Vamos descobrir!'],
      parecePronto: a => blocos(a.evento('botao:A'), 'mk_var_definir').some(p => (p.usa || []).some(u => u.tipo === 'mk_luz')) &&
        dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_conta') && dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Luz alta e A; depois luz baixa e B.',
      regras: [
        com('sem_a', P.evento('botao:A', 'Primeiro, ao sol, guardas a luz. Que botão dá a ordem?')),
        com('sem_b', P.evento('botao:B', 'Depois, à sombra, queres ver a diferença. Com que botão?')),
        com('nao_guarda', P.regra('nao_guarda', a => !blocos(a.evento('botao:A'), 'mk_var_definir').some(p => (p.usa || []).some(u => u.tipo === 'mk_luz')), [
          'Ao sol, o micro:bit tem de se lembrar de quanta luz havia. Como se guarda um número?',
          'Usa «definir medida para» e encaixa «nível de luz».',
          'No A: «definir medida para nível de luz».',
        ], 'Luz do sol guardada!')),
        com('sem_conta', P.regra('sem_conta', a => !!a.evento('botao:B') && !dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_conta'), [
          'Para saber quanta luz a árvore tapa, temos de fazer uma conta. Qual?',
          'Diferença é uma conta de menos: a de agora menos a guardada.',
          'No B: mostrar número com «nível de luz − medida».',
        ], 'Conta montada!')),
        com('conta_sem_medida', P.regra('conta_sem_medida', a => dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_conta') && !dentro(a.evento('botao:B'), 'mk_mostrar_numero', 'mk_var'), [
          'A conta precisa da luz que guardaste. Onde está ela?',
          'Procura o bloco vermelho «medida».',
          'Encaixa «medida» do lado direito do «−».',
        ], 'Agora compara com o sol!')),
      ],
      sucesso: 'Descobriste quanta luz a oliveira tapa! Um número negativo quer dizer «menos luz do que ao sol».',
      extensao: 'Compara uma oliveira, uma figueira e um toldo. Qual dá a sombra mais escura?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_var_definir"><field name="VAR">medida</field>' + V('V', '<block type="mk_luz"></block>') + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">medida</field></block>') + '</block></statement></block></xml>',
        pedido: 'Fui para debaixo da oliveira, carreguei no B… e mostra a luz do sol outra vez! Onde está a diferença?',
      },
    },
  };

  const RECORDE = {
    titulo: 'Recorde de calor',
    missao: 'O micro:bit guarda a temperatura mais alta do dia; o A mostra o recorde.',
    passos: ['Para sempre: se temperatura > recorde então definir recorde para temperatura.', 'No botão A: mostrar o recorde.', 'Experimenta: 30 graus, depois 25, e carrega em A.'],
    material: 'micro:bit',
    novos: ['mk_var_definir_recorde', 'mk_var_recorde'],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_temperatura', 'mk_var_definir_recorde', 'mk_var_recorde', 'mk_botao', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => vezes(r, 'botao:A').some(({ i, s }) => {
      let max = -Infinity;
      for (let j = 0; j < i; j++) if (r[j].dir === 'in' && r[j].v.startsWith('temperatura:')) max = Math.max(max, valorDe(r[j].v));
      return max > sensorEm(r, i, 'temperatura', 21) && s.includes('numero:' + max);
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'No verão, em Messejana, chega aos 40 graus! Qual foi a hora mais quente? Vamos guardar o recorde.'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_temperatura') && usa(d, 'mk_var') && ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')) &&
        dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Põe 30 graus, depois 25, e carrega em A.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'O recorde pode acontecer a qualquer hora. Quem está sempre a medir?')),
        com('sem_a', P.evento('botao:A', 'No fim do dia queres ver o recorde. Como é que pedes?')),
        com('sem_guardar', P.regra('sem_guardar', a => !blocos(a.evento('sempre'), 'mk_var_definir').some(p => p.var === 'recorde' && (p.usa || []).some(u => u.tipo === 'mk_temperatura')), [
          'Para haver recorde, o micro:bit tem de guardar uma temperatura. Com que bloco?',
          'Usa «definir recorde para» com a «temperatura (°C)».',
          'Põe «definir recorde para temperatura (°C)» dentro do «para sempre».',
        ], 'Já guarda!')),
        com('sem_se', P.regra('sem_se', a => blocos(a.evento('sempre'), 'mk_var_definir').some(p => p.var === 'recorde') && !ses(a.evento('sempre')).some(d => ramo(d, 'sim').some(p => p.tipo === 'mk_var_definir' && p.var === 'recorde')), [
          ['a_pensar', 'Assim o recorde é sempre a temperatura de agora… mesmo quando arrefece! Quando é que há um recorde novo?'],
          'Só se guarda quando a temperatura é MAIOR do que o recorde.',
          'Põe o «definir recorde» dentro de «se temperatura > recorde então».',
        ], 'Isso é que é um recorde!')),
        com('mostra_errado', P.regra('mostra_errado', a => !!a.evento('botao:A') && !dentro(a.evento('botao:A'), 'mk_mostrar_numero', 'mk_var'), [
          'O A mostra o quê? A temperatura de agora ou a mais alta?',
          'O recorde está guardado na variável «recorde».',
          'No A: mostrar número «recorde».',
        ], 'Recorde à vista!')),
      ],
      sucesso: 'Recorde guardado! Os meteorologistas registam a máxima de cada dia. Comparar recordes de anos diferentes mostra se o clima está a mudar.',
      extensao: 'E a temperatura mínima da noite? Usa outra variável para guardar o mais baixo.',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_var_definir"><field name="VAR">recorde</field>' + V('V', '<block type="mk_temperatura"></block>') + '</block></statement></block>' +
          '<block type="mk_botao" x="40" y="200"><statement name="DO"><block type="mk_mostrar_numero">' + V('N', '<block type="mk_var"><field name="VAR">recorde</field></block>') + '</block></statement></block></xml>',
        pedido: 'Hoje chegou aos 30 graus, mas o meu recorde diz 25! Esqueceu-se do calor da tarde. Que gambiarra fiz?',
      },
    },
  };

  const REGA_AUTOMATICA = {
    titulo: 'Rega automática',
    missao: 'Se a terra está seca, o servo abre a torneira (180); se está molhada, fecha (0).',
    passos: ['Para sempre: «se leitura analógica pin P1 < 300 então … senão …».', 'Seca: servo a 180. Molhada: servo a 0.', 'Experimenta: terra seca e depois molhada.'],
    material: 'micro:bit, 2 pregos, servomotor, garrafa com tubo (ou uma torneira de cartão)',
    novos: ['mk_servo'],
    caixa: ['mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_servo', 'mk_pausa'],
    sim: ['analogico:P1'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v < 250, s => angulos(s).some(x => x >= 90)) &&
      aposSensor(r, 'analogico:P1', v => v > 350, s => angulos(s).some(x => x <= 30)),
    tutor: {
      boasVindas: ['boas_vindas', 'E se a horta se regasse sozinha nas férias? Vamos juntar o sensor da terra a um motor!'],
      parecePronto: a => ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico') && ['<', '<='].includes(opDe(d)) && servos(ramo(d, 'sim')).some(x => x >= 90) && servos(ramo(d, 'nao')).some(x => x <= 30)),
      testar: 'Tens uma ideia? Vamos testar! Terra seca, depois molhada.',
      regras: [
        com('sem_sempre', P.evento('sempre', 'A rega automática trabalha sozinha. Quem é que vigia sem parar?')),
        com('sem_se', P.bloco('sempre', 'mk_se', 'Abrir ou fechar a torneira depende da terra. Que bloco escolhe entre duas coisas?')),
        com('sem_humidade', P.regra('sem_humidade', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')), [
          'A torneira abre quando a terra está… como é que o micro:bit sabe?',
          'Compara a leitura do pin 1 com um número.',
          'No «se»: «leitura analógica pin P1 < 300».',
        ], 'Já sente a terra!')),
        com('ao_contrario', P.regra('ao_contrario', a => ses(a.evento('sempre')).some(d => ['>', '>='].includes(opDe(d)) && servos(ramo(d, 'sim')).some(x => x >= 90)), [
          ['surpreendida', 'Ui! Assim rega quando a terra já está encharcada. Vai ser um lago!'],
          'Leitura pequena quer dizer terra seca.',
          'Troca o «>» por «<».',
        ], 'Agora rega quando tem sede!')),
        com('sem_abrir', P.regra('sem_abrir', a => ses(a.evento('sempre')).some(d => usa(d, 'mk_ler_analogico')) && !ses(a.evento('sempre')).some(d => servos(ramo(d, 'sim')).length), [
          'A terra está seca… e a torneira? Quem a abre?',
          'Um «escrever servo» no «então».',
          'Põe «escrever servo pin P0 para 180» no «então».',
        ], 'Água a correr!')),
        com('sem_fechar', P.regra('sem_fechar', a => ses(a.evento('sempre')).some(d => servos(ramo(d, 'sim')).length) && !ses(a.evento('sempre')).some(d => servos(ramo(d, 'nao')).length), [
          'A torneira abre… e depois fica aberta para sempre? Que desperdício de água!',
          'O «senão» é quando a terra já está molhada.',
          'Põe «escrever servo pin P0 para 0» no «senão».',
        ], 'Água poupada!')),
      ],
      sucesso: 'Rega automática pronta! Sensor + decisão + motor: é assim que funcionam muitas máquinas da agricultura.',
      extensao: 'No Alentejo a água é preciosa. E se só regasse à noite, quando está escuro, para a água não evaporar?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se">' +
          V('C', '<block type="mk_comparar"><field name="OP">&lt;</field>' + V('A', ANALOG) + N('B', 300) + '</block>') +
          '<statement name="SIM"><block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block></statement><statement name="NAO"></statement></block></statement></block></xml>',
        pedido: 'A minha rega abriu e nunca mais fechou! A horta está um charco. O que é que me esqueci?',
      },
    },
  };

  const INVENTA = {
    titulo: 'Inventa',
    missao: 'Inventa um guardião para a natureza da tua escola.',
    passos: ['Junta sensores (luz, som, temperatura, humidade), decisões e ações (luzes, sons, motor, diário).', 'Ideias: ninho com alarme, contador de borboletas, abrigo que fecha à noite.'],
    material: 'o que tiveres',
    novos: [],
    caixa: ['mk_sempre', 'mk_botao', 'mk_se_senao', 'mk_comparar', 'mk_ler_analogico', 'mk_luz', 'mk_temperatura', 'mk_som_nivel', 'mk_icone', 'mk_tom', 'mk_servo', 'mk_registar', 'mk_var_mudar', 'mk_mostrar_numero'],
    livre: true,
    ok: () => false,
    tutor: {
      boasVindas: ['testar', 'Tens uma ideia? Vamos testar! Agora inventas tu um guardião da natureza. Se precisares de mim, estou aqui.'],
      parecePronto: () => false,
      testar: '',
      regras: [],
      sucesso: '',
      extensao: '',
    },
  };

  F.registarMissao({
    id: 'natureza',
    titulo: 'Natureza',
    tema: 'Biodiversidade em Messejana',
    descricao: 'Guarda da horta, ninhos e bichos: observar e investigar à volta da escola.',
    cor: '#2e8b57',
    xml: XML,
    niveis: [
      { nome: 'Nível 1 · Observar', desafios: [SOL_SOMBRA, BICHO_CONTADOR, DIA_NOITE, CANTO_PASSARO, NINHO, GUARDIA_HORTA] },
      { nome: 'Nível 2 · Cuidar', desafios: [HORA_REGAR, ESPANTALHO, COMEDOURO, ABELHAS, GEADA, CORUJAS] },
      { nome: 'Nível 3 · Investigar', desafios: [DIARIO, ESPECIES, ESTACAO, SOMBRA_OLIVEIRAS, RECORDE, REGA_AUTOMATICA, INVENTA] },
    ],
  });
})();
