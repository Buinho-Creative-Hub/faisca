/* Missão «Toy hacking» — gambiarra e brinquedos.
 *
 * Abrir um brinquedo, perceber como funciona e reinventá-lo com o micro:bit: peluche com o micro:bit
 * lá dentro, abraço = interruptor de alumínio e esponja, festa no nariz = logotipo, a ambulância que
 * o micro:bit «ouve», tapete de pressão em vez de interruptor. Motores a sério precisam de relé ou
 * transístor: aqui usa-se o servomotor (SG90) e LEDs.
 *   Nível 1 · Abrir e perceber — eventos, sons, luzes, gestos.
 *   Nível 2 · Reinventar — servo, som alto, «para sempre» + «se», piscas com pausas.
 *   Nível 3 · Inventar — variáveis, leitura de pinos, acaso, tempo.
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const P = F.pistas;
  const { icones, tem, blocos, dentro, soltoCom } = F.ajudasTutor;
  const { causou, visiveis, numeros } = F.verif;

  // ------------------------------------------------------------ ajudas
  const pinos = a => a.eventosDe('pino:');
  const digitais = ev => blocos(ev, 'mk_digital');
  const servos = ev => blocos(ev, 'mk_servo');
  const algum = (lista, f) => lista.some(f);
  // saídas (com tempo) depois de cada entrada que cumpre ok, até à entrada seguinte
  function saidasApos(reg, ok) {
    const res = [];
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || !ok(reg[i].v)) continue;
      const o = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) o.push(reg[j]);
      res.push(o);
    }
    return res;
  }
  // as saídas «prefixo» mudam com tempo suficiente entre elas (para se verem/mexerem a sério)
  const comPausas = (lista, minMs) => lista.every((e, k) => k === 0 || e.t - lista[k - 1].t >= minMs);
  const angulo = v => Number(String(v).split(':').pop());
  // um «se» (com ou sem senão) dentro do evento
  const ses = ev => ev ? ev.plano.filter(p => p.tipo === 'mk_se' || p.tipo === 'mk_se_entao') : [];
  const ramo = (s, k) => s[k] || [];

  // ------------------------------------------------------------ blocos extra da caixa
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const XML = {
    th_gesto_cima: '<block type="mk_gesto"><field name="G">face up</field></block>',
    th_pino_p0: '<block type="mk_pino_tocado"><field name="P">P0</field></block>',
    th_tom_meia: '<block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block>',
    th_pausa_500: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">500</field></shadow></value></block>',
    th_servo_0: '<block type="mk_servo"><field name="P">P0</field>' + N('A', 0) + '</block>',
    th_servo_180: '<block type="mk_servo"><field name="P">P0</field>' + N('A', 180) + '</block>',
    th_comparar_maior: '<block type="mk_comparar"><field name="OP">&gt;</field>' + N('A', 0) + N('B', 128) + '</block>',
    th_comparar_igual: '<block type="mk_comparar"><field name="OP">==</field>' + N('A', 0) + N('B', 1) + '</block>',
    th_aleatorio_servo: '<block type="mk_aleatorio">' + N('A', 0) + N('B', 10) + '</block>',
    th_definir_vidas: '<block type="mk_var_definir"><field name="VAR">vidas</field>' + N('V', 3) + '</block>',
    th_mudar_vidas: '<block type="mk_var_mudar"><field name="VAR">vidas</field>' + N('V', -1) + '</block>',
    th_var_vidas: '<block type="mk_var"><field name="VAR">vidas</field></block>',
    th_comparar_vidas: '<block type="mk_comparar"><field name="OP">==</field>' + N('A', 0) + N('B', 0) + '</block>',
    th_definir_medida: '<block type="mk_var_definir"><field name="VAR">medida</field>' + N('V', 0) + '</block>',
    th_var_medida: '<block type="mk_var"><field name="VAR">medida</field></block>',
    th_conta_menos: '<block type="mk_conta"><field name="OP">-</field>' + N('A', 0) + N('B', 0) + '</block>',
  };

  // ============================================================ NÍVEL 1 · Abrir e perceber
  const BOTAO_SECRETO = {
    titulo: 'Botão secreto',
    missao: 'Esconde um botão secreto no brinquedo: quando o circuito fecha, o brinquedo fala.',
    passos: ['Crocodilo no pin 1 e outro no GND: duas tiras de alumínio escondidas.', 'Dentro de «no pin P1 premido» põe «tocar som».', 'Experimenta: toca no pin 1.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, um brinquedo velho',
    novos: ['mk_pino_tocado', 'mk_som'],
    teste: 'pino:P1',
    ok: r => causou(r, s => s.some(x => x.startsWith('som:')), v => v.startsWith('pino:')),
    tutor: {
      boasVindas: ['boas_vindas', '{ola} Hoje vamos abrir brinquedos e dar-lhes truques novos. Primeiro truque: um botão secreto que faz o brinquedo falar!'],
      parecePronto: a => pinos(a).some(e => tem(e, 'mk_som')),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1, como quem carrega no botão secreto.',
      regras: [
        P.regra('som_fora', a => pinos(a).length > 0 && !pinos(a).some(e => tem(e, 'mk_som')) && soltoCom(a, 'mk_som'), [
          ['a_pensar', 'O som está ali sozinho, cá fora. Quando é que ele vai tocar?'],
          'Tudo o que fica fora de um bloco cor-de-rosa nunca corre.',
          'Encaixa «tocar som» dentro de «no pin P1 premido».',
        ], 'Encaixou! Já fazem equipa.'),
        P.evento('pino:', 'Um botão secreto é um circuito que se fecha quando lhe tocas. Como é que o micro:bit dá por isso?'),
        P.bloco('pino:', 'mk_som', 'O micro:bit já sente o botão secreto. E o brinquedo, como é que fala?'),
      ],
      sucesso: 'Botão secreto a funcionar! Ninguém vai perceber de onde vem a voz do brinquedo.',
      extensao: 'Esconde o alumínio debaixo de um tapete ou dentro de um livro. Quem descobre o botão?',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="40"><statement name="DO"><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">hello</field></shadow></value></block></statement></block></xml>',
        pedido: 'Escondi o meu botão secreto… mas o brinquedo só fala quando o abano! Encontras a gambiarra?',
      },
    },
  };

  const PELUCHE_RI = {
    titulo: 'Peluche que ri',
    missao: 'Faz uma festa no nariz do peluche e ele ri-se e sorri.',
    passos: ['O micro:bit vai dentro do peluche, com o logotipo no nariz.', 'Em «ao logotipo pressionado»: o som «riso» e a cara contente.', 'Experimenta: toca no logotipo dourado.'],
    material: 'micro:bit V2, um peluche',
    novos: ['mk_logo', 'mk_icone'],
    caixa: ['mk_som', 'mk_pino_tocado'],
    teste: 'logo',
    ok: r => causou(r, s => s.includes('som:giggle') && s.includes('icone:Happy'), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Este peluche tem cócegas no nariz! Vamos pô-lo a rir quando lhe fazes uma festa?'],
      parecePronto: a => !!a.evento('logo') && blocos(a.evento('logo'), 'mk_som').some(p => p.som === 'giggle') && icones(a.evento('logo'), 'Happy').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Toca no logotipo, como uma festa no nariz.',
      regras: [
        P.evento('logo', 'O nariz do peluche é o logotipo dourado. Quem fica à escuta do logotipo?'),
        P.bloco('logo', 'mk_som', 'O peluche já sente a festa. E como é que ele se ri?'),
        P.regra('som_errado', a => blocos(a.evento('logo'), 'mk_som').length > 0 && !blocos(a.evento('logo'), 'mk_som').some(p => p.som === 'giggle'), [
          ['surpreendida', 'Esse som é de quem tem cócegas?'],
          'Carrega na setinha do som e procura um que se pareça com uma gargalhada.',
          'Escolhe o som «riso».',
        ], 'Ahahah! Agora sim.'),
        P.bloco('logo', 'mk_icone', 'Ouve-se o riso… e a cara do peluche, muda?'),
        P.regra('cara_errada', a => icones(a.evento('logo')).length > 0 && icones(a.evento('logo'), 'Happy').length === 0, [
          ['surpreendida', 'Que cara é essa para quem se está a rir?'],
          'Carrega na setinha do desenho para escolher outro.',
          'Escolhe a cara contente.',
        ], 'Agora sim, um sorriso!'),
      ],
      sucesso: 'O peluche ri-se! Transformaste um brinquedo parado num brinquedo com cócegas.',
      extensao: 'E se ele ficasse com cara de sono quando o deitas? Experimenta outro bloco cor-de-rosa.',
      gambiarra: {
        xml: '<xml><block type="mk_logo" x="40" y="40"><statement name="DO"><block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">sad</field></shadow></value><next><block type="mk_icone"><field name="I">Happy</field></block></next></block></statement></block></xml>',
        pedido: 'Fiz cócegas ao meu peluche e ele… ficou triste! Acho que me enganei em alguma coisa. Ajudas-me?',
      },
    },
  };

  const DORME = {
    titulo: 'Brinquedo que dorme',
    missao: 'Quando deitas o brinquedo de barriga para baixo, ele dorme; quando o viras, acorda.',
    passos: ['Usa «em ecrã para baixo» com a cara a dormir.', 'Usa outro com «ecrã para cima» e a cara contente.', 'Experimenta com os botões por baixo do micro:bit.'],
    material: 'micro:bit, um brinquedo ou peluche',
    novos: ['mk_gesto_baixo', 'mk_icone_dormir', 'th_gesto_cima'],
    caixa: ['mk_icone'],
    teste: 'gesto:face down',
    sim: ['gesto:face down', 'gesto:face up'],
    ok: r => causou(r, s => s.includes('icone:Asleep'), v => v === 'gesto:face down') && causou(r, s => s.includes('icone:Happy'), v => v === 'gesto:face up'),
    tutor: {
      boasVindas: ['boas_vindas', 'Até os brinquedos precisam de dormir! Vamos ensinar este a deitar-se e a acordar?'],
      parecePronto: a => icones(a.evento('gesto:face down'), 'Asleep').length > 0 && icones(a.evento('gesto:face up'), 'Happy').length > 0,
      testar: 'Tens uma ideia? Vamos testar! Carrega em «Virar ao contrário» e depois em «Ecrã para cima».',
      regras: [
        P.evento('gesto:face down', 'Como é que o micro:bit sabe que o deitaste de barriga para baixo? Ele tem um sensor que sente para onde está virado…'),
        P.bloco('gesto:face down', 'mk_icone', 'O brinquedo já sente que está deitado. E a cara dele, muda?'),
        P.regra('nao_dorme', a => icones(a.evento('gesto:face down')).length > 0 && icones(a.evento('gesto:face down'), 'Asleep').length === 0, [
          ['surpreendida', 'Deitado e com essa cara? Assim ninguém dorme!'],
          'Há um desenho de olhos fechados na lista do ícone.',
          'No «ecrã para baixo», escolhe a cara a dormir.',
        ], 'Zzz… agora dorme.'),
        P.evento('gesto:face up', 'E para acordar? Que movimento faz o brinquedo quando o levantas?', 'Já sabe quando acorda!'),
        P.regra('nao_acorda', a => icones(a.evento('gesto:face up'), 'Happy').length === 0, [
          'Acordou… e está com que cara?',
          'Põe um «mostrar ícone» no «ecrã para cima».',
          'No «ecrã para cima», escolhe a cara contente.',
        ], 'Bom dia, brinquedo!'),
      ],
      sucesso: 'Dorme e acorda! O sensor de movimento (acelerómetro) sabe para onde o micro:bit está virado.',
      extensao: 'E se ele ressonasse um bocadinho quando adormece? Junta um som.',
      gambiarra: {
        xml: '<xml><block type="mk_gesto" x="40" y="40"><field name="G">face down</field><statement name="DO"><block type="mk_icone"><field name="I">Happy</field></block></statement></block><block type="mk_gesto" x="40" y="200"><field name="G">face up</field><statement name="DO"><block type="mk_icone"><field name="I">Asleep</field></block></statement></block></xml>',
        pedido: 'O meu brinquedo está trocado: deito-o e fica acordado, levanto-o e adormece! Que gambiarra fiz eu?',
      },
    },
  };

  const FAROIS = {
    titulo: 'Faróis do carrinho',
    missao: 'Põe faróis num carrinho velho: botão A acende, botão B apaga.',
    passos: ['LED: perna comprida no pin 2, perna curta no GND (crocodilos).', 'No botão A: «gravação digital pin P2 para 1». No B: «para 0».', 'Experimenta: A e depois B.'],
    material: 'micro:bit, 1 LED, 2 crocodilos, um carrinho de brinquedo',
    novos: ['mk_botao', 'mk_botao_B', 'mk_digital_1', 'mk_digital_0'],
    caixa: ['mk_icone'],
    teste: 'botao:A',
    ok: r => {
      const ultimo = (s, v) => { const d = s.filter(x => x.startsWith('digital:')); return d.length > 0 && d[d.length - 1].endsWith(':' + v) ? d[d.length - 1].split(':')[1] : null; };
      let pA = null, pB = null;
      causou(r, s => !!(pA = ultimo(s, 1)), v => v === 'botao:A');
      causou(r, s => !!(pB = ultimo(s, 0)), v => v === 'botao:B');
      return !!pA && pA === pB;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Este carrinho anda às escuras! Vamos dar-lhe faróis que se acendem e apagam?'],
      parecePronto: a => digitais(a.evento('botao:A')).some(p => p.v === 1) && digitais(a.evento('botao:B')).some(p => p.v === 0),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e depois em B.',
      regras: [
        P.evento('botao:A', 'Os faróis acendem-se quando o condutor carrega num botão. Que botão tem o micro:bit?'),
        P.bloco('botao:A', 'mk_digital', 'Carregas no A… e quem manda a eletricidade para o LED?'),
        P.regra('a_apaga', a => digitais(a.evento('botao:A')).length > 0 && !digitais(a.evento('botao:A')).some(p => p.v === 1), [
          ['surpreendida', 'O A apaga? Mas os faróis estavam apagados!'],
          '«para 1» quer dizer ligado; «para 0» quer dizer desligado.',
          'No botão A, põe «gravação digital pin P2 para 1».',
        ], 'Faróis acesos!'),
        P.evento('botao:B', 'Acender já está. E como se poupa a bateria do carrinho?', 'Já tens o botão para apagar!'),
        P.regra('b_nao_apaga', a => !digitais(a.evento('botao:B')).some(p => p.v === 0), [
          'Carregas no B e os faróis… continuam acesos?',
          'O B precisa de um «gravação digital» com outro número.',
          'No botão B, põe «gravação digital pin P2 para 0».',
        ], 'Isso, o B apaga!'),
      ],
      sucesso: 'Carrinho com faróis! Um LED, dois crocodilos e um brinquedo velho ganhou vida nova.',
      extensao: 'E se o A+B fizesse os faróis piscar três vezes, como quem diz «olá»?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block></statement></block></xml>',
        pedido: 'Os faróis do meu carrinho acendem… mas nunca mais apagam! Carrego no B e nada. Onde está a gambiarra?',
      },
    },
  };

  const SIRENE = {
    titulo: 'Sirene da ambulância',
    missao: 'A ambulância de brinquedo perdeu a sirene: faz uma nova com duas notas a trocar.',
    passos: ['No botão A, usa «repetir 4 vezes».', 'Lá dentro: duas notas diferentes, uma a seguir à outra.', 'Experimenta: carrega no A.'],
    material: 'micro:bit V2 (altifalante), uma ambulância de brinquedo',
    novos: ['mk_repetir', 'th_tom_meia'],
    caixa: ['mk_botao'],
    teste: 'botao:A',
    ok: r => causou(r, s => {
      const t = s.filter(x => x.startsWith('tom:'));
      return t.length >= 6 && t.every((x, k) => k === 0 || x !== t[k - 1]);
    }, v => v === 'botao:A'),
    tutor: {
      boasVindas: ['boas_vindas', 'Ni-nó, ni-nó! Esta ambulância está muda. Vamos fazer-lhe uma sirene nova?'],
      parecePronto: a => { const ev = a.evento('botao:A'); return !!ev && blocos(ev, 'mk_repetir').length > 0 && new Set(blocos(ev, 'mk_tom').filter(p => p.dentroDe === 'mk_repetir').map(p => p.freq)).size >= 2; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e ouve a sirene.',
      regras: [
        P.evento('botao:A', 'Quem liga a sirene? Precisas de um botão à escuta…'),
        P.bloco('botao:A', 'mk_repetir', 'Uma sirene repete o mesmo «ni-nó» muitas vezes. Há algum bloco que repita por nós?'),
        P.regra('notas_fora', a => blocos(a.evento('botao:A'), 'mk_repetir').length > 0 && !blocos(a.evento('botao:A'), 'mk_tom').some(p => p.dentroDe === 'mk_repetir'), [
          ['a_pensar', 'O «repetir» está vazio. O que é que ele vai repetir?'],
          'As notas têm de ficar dentro da boca do «repetir».',
          'Põe dois «tocar tom» dentro do «repetir».',
        ], 'Agora o repetir tem trabalho!'),
        P.regra('mesma_nota', a => { const f = blocos(a.evento('botao:A'), 'mk_tom').filter(p => p.dentroDe === 'mk_repetir').map(p => p.freq); return f.length > 0 && new Set(f).size < 2; }, [
          ['curiosa', 'Ni-ni-ni-ni… Uma sirene a sério faz sempre a mesma nota?'],
          'A sirene troca entre uma nota alta e uma baixa.',
          'Muda a nota do segundo «tocar tom» (por exemplo Lá e Mi).',
        ], 'Ni-nó, ni-nó! Agora sim.'),
      ],
      sucesso: 'A ambulância tem sirene! Uma sirene é só duas notas repetidas — como uma pequena música.',
      extensao: 'E se a luz de emergência (um LED no pin 2) piscasse ao mesmo tempo?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></statement></block></statement></block></xml>',
        pedido: 'A minha sirene faz «ni-ni-ni-ni»… parece um mosquito! Que gambiarra é esta?',
      },
    },
  };

  const ABRACO = {
    titulo: 'Abraço-interruptor',
    missao: 'Quando abraças o peluche, o coração dele bate.',
    passos: ['Duas tiras de alumínio com esponja no meio: o abraço fecha o circuito no pin 0.', 'Em «no pin P0 premido»: coração, pausa, coração pequeno, pausa.', 'Experimenta: toca no pin 0.'],
    material: 'micro:bit, 2 crocodilos, alumínio, esponja, um peluche',
    novos: ['th_pino_p0', 'mk_icone_coracao', 'mk_icone_pequeno', 'mk_pausa'],
    caixa: ['mk_repetir'],
    teste: 'pino:P0',
    ok: r => ['pino:P0', 'pino:P1'].some(p => visiveis(r, p, 'Heart') >= 1 && visiveis(r, p, 'SmallHeart') >= 1),
    tutor: {
      boasVindas: ['boas_vindas', 'Um peluche que sente abraços? Com alumínio e uma esponja fazemos um interruptor que se fecha quando o apertas!'],
      parecePronto: a => pinos(a).some(e => icones(e, 'Heart').length > 0 && icones(e, 'SmallHeart').length > 0 && blocos(e, 'mk_pausa').length > 0),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 0, como num abraço.',
      regras: [
        P.evento('pino:', 'Quando apertas a esponja, as duas tiras de alumínio tocam-se e o circuito fecha. Que bloco dá por isso?'),
        P.regra('sem_coracoes', a => pinos(a).length > 0 && !pinos(a).some(e => icones(e, 'Heart').length > 0 && icones(e, 'SmallHeart').length > 0), [
          ['curiosa', 'Para bater, o coração tem de mudar: grande… pequeno…'],
          'Precisas de dois «mostrar ícone»: um coração e um coração pequeno.',
          'Dentro do pino, põe o coração e depois o coração pequeno.',
        ], 'Já tens os dois corações!'),
        P.regra('sem_pausa', a => pinos(a).some(e => icones(e, 'Heart').length > 0) && !pinos(a).some(e => blocos(e, 'mk_pausa').length > 0), [
          ['a_pensar', 'Abraças e… viste o coração? Foi tão depressa!'],
          'Cada desenho precisa de tempo para se ver. Há um bloco azul que espera.',
          'Põe uma «pausa» depois de cada coração.',
        ], 'Agora vê-se o coração a bater!'),
      ],
      sucesso: 'O peluche sente abraços! Fizeste um interruptor com alumínio e esponja: uma gambiarra a sério.',
      extensao: 'E se o coração batesse 3 vezes por cada abraço?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><field name="P">P0</field><statement name="DO"><block type="mk_icone"><field name="I">Heart</field><next><block type="mk_icone"><field name="I">SmallHeart</field></block></next></block></statement></block></xml>',
        pedido: 'Abraço o meu peluche e o coração… nem se vê! Acho que fiz uma gambiarra. Consegues ver o que falta?',
      },
    },
  };

  // ============================================================ NÍVEL 2 · Reinventar
  const BRACO = {
    titulo: 'Braço que acena',
    missao: 'Põe um braço de cartão no servo e faz o boneco acenar 3 vezes.',
    passos: ['Servo: fio laranja no pin 0, vermelho no 3V, castanho no GND.', 'No botão A: «repetir 3 vezes» com servo 0, pausa, servo 180, pausa.', 'Experimenta: carrega no A.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, cartão, um boneco',
    novos: ['th_servo_0', 'th_servo_180', 'th_pausa_500'],
    caixa: ['mk_botao', 'mk_repetir', 'mk_servo'],
    teste: 'botao:A',
    ok: r => saidasApos(r, v => v === 'botao:A').some(o => {
      const s = o.filter(e => e.v.startsWith('servo:'));
      const a = s.map(e => angulo(e.v));
      return s.length >= 5 && Math.max(...a) - Math.min(...a) >= 90 && comPausas(s, 150);
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Um servo é um motor pequenino que vai para o ângulo que lhe dizes. Vamos pôr um boneco a dizer adeus?'],
      parecePronto: a => { const ev = a.evento('botao:A'); return !!ev && blocos(ev, 'mk_repetir').length > 0 && servos(ev).filter(p => p.dentroDe === 'mk_repetir').length >= 2 && blocos(ev, 'mk_pausa').length >= 2; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no A e vê o braço.',
      regras: [
        P.evento('botao:A', 'Quem dá a ordem para acenar? Precisas de um botão à escuta.'),
        P.bloco('botao:A', 'mk_servo', 'O braço está preso ao servo. Que bloco manda o servo rodar?'),
        P.regra('um_lado_so', a => { const s = servos(a.evento('botao:A')); return s.length > 0 && new Set(s.map(p => p.angulo)).size < 2; }, [
          ['curiosa', 'Acenar é ir para um lado… e depois?'],
          'Precisas de dois ângulos diferentes: um para cada lado.',
          'Usa um servo a 0 e outro a 180.',
        ], 'Lá vai ele, de um lado para o outro!'),
        P.regra('sem_pausa', a => servos(a.evento('botao:A')).length >= 2 && blocos(a.evento('botao:A'), 'mk_pausa').length < 2, [
          ['a_pensar', 'O braço quase não se mexe… será que o servo tem tempo de chegar?'],
          'Um motor demora a rodar. Dá-lhe tempo com um bloco azul.',
          'Põe uma «pausa» depois de cada servo.',
        ], 'Agora o braço tem tempo de chegar!'),
        P.regra('sem_repetir', a => servos(a.evento('botao:A')).length >= 2 && !blocos(a.evento('botao:A'), 'mk_repetir').length, [
          'Acenou uma vez. A missão pede três: vais copiar os blocos todos?',
          'Há um bloco verde que repete por ti.',
          'Mete os servos e as pausas dentro de «repetir 3 vezes».',
        ], 'Adeus, adeus, adeus!'),
      ],
      sucesso: 'O boneco acena! Os servos estão em robôs, portas e brinquedos — e agora num boneco teu.',
      extensao: 'E se ele acenasse devagarinho? Experimenta ângulos intermédios: 0, 45, 90, 135, 180.',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">3</field></shadow></value><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu boneco devia acenar, mas só treme um bocadinho! Que gambiarra fiz?',
      },
    },
  };

  const CANCELA = {
    titulo: 'Cancela da garagem',
    missao: 'Faz uma cancela para a garagem dos carrinhos: A abre, B fecha.',
    passos: ['Cola um palito ao braço do servo (pin 0).', 'No A: servo para 90. No B: servo para 0.', 'Experimenta: A e depois B.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, um palito, uma caixa de cartão',
    novos: ['mk_servo'],
    caixa: ['mk_botao', 'mk_botao_B', 'th_servo_0'],
    teste: 'botao:A',
    ok: r => {
      const fim = (o, f) => { const s = o.filter(e => e.v.startsWith('servo:')); return s.length > 0 && f(angulo(s[s.length - 1].v)); };
      return saidasApos(r, v => v === 'botao:A').some(o => fim(o, x => x >= 60)) && saidasApos(r, v => v === 'botao:B').some(o => fim(o, x => x <= 20));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Os carrinhos estão a fazer fila! Vamos construir uma cancela que sobe e desce?'],
      parecePronto: a => servos(a.evento('botao:A')).some(p => Number(p.angulo) >= 60) && servos(a.evento('botao:B')).some(p => Number(p.angulo) <= 20),
      testar: 'Tens uma ideia? Vamos testar! A para abrir, B para fechar.',
      regras: [
        P.evento('botao:A', 'Quem manda abrir a cancela? Precisas de um botão.'),
        P.bloco('botao:A', 'mk_servo', 'O botão já está à escuta. Quem levanta o palito?'),
        P.evento('botao:B', 'Abrir já está. E para fechar, os carros esperam para sempre?', 'Já tens botão para fechar!'),
        P.bloco('botao:B', 'mk_servo', 'O B também precisa de mexer no servo.'),
        P.regra('nao_fecha', a => servos(a.evento('botao:B')).length > 0 && !servos(a.evento('botao:B')).some(p => Number(p.angulo) <= 20), [
          ['surpreendida', 'Carregas no B e a cancela… fica aberta?'],
          'Fechada é o ângulo do início: deitada.',
          'No botão B, põe o servo para 0.',
        ], 'Fechada! Ninguém passa.'),
        P.regra('nao_abre', a => !servos(a.evento('botao:A')).some(p => Number(p.angulo) >= 60), [
          'O A abre pouquinho… passa algum carro?',
          'Aberta é com o palito em pé: um ângulo maior.',
          'No botão A, põe o servo para 90.',
        ], 'Aberta! Podem passar.'),
      ],
      sucesso: 'Cancela pronta! Com um servo e um palito fizeste a mesma coisa que as cancelas dos parques.',
      extensao: 'E se a cancela fechasse sozinha passados 2 segundos?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block></statement></block></xml>',
        pedido: 'A minha cancela abre bem… mas nunca fecha! Os carros entram todos sem pagar. Encontras a gambiarra?',
      },
    },
  };

  const ASSUSTADO = {
    titulo: 'Boneco assustado',
    missao: 'Quando há um barulho forte, o boneco assusta-se: faz cara de espanto e dá um salto.',
    passos: ['Usa «em som alto».', 'Lá dentro: cara surpreendida e o servo a mexer.', 'Experimenta: carrega em «Bater palmas».'],
    material: 'micro:bit V2 (microfone), servo SG90, 3 crocodilos, um boneco',
    novos: ['mk_som_alto', 'mk_icone_surpreendido'],
    caixa: ['th_servo_180', 'th_servo_0', 'th_pausa_500'],
    teste: 'somalto',
    ok: r => causou(r, s => s.includes('icone:Surprised') && s.some(x => x.startsWith('servo:')), v => v === 'somalto'),
    tutor: {
      boasVindas: ['boas_vindas', 'Este boneco é medricas: assusta-se com tudo! Vamos pô-lo a saltar quando alguém bate palmas?'],
      parecePronto: a => { const ev = a.evento('somalto'); return icones(ev, 'Surprised').length > 0 && servos(ev).length > 0; },
      testar: 'Tens uma ideia? Vamos testar! Carrega em «Bater palmas».',
      regras: [
        P.evento('somalto', 'O micro:bit V2 tem um microfone. Como é que ele dá por um barulho forte?'),
        P.bloco('somalto', 'mk_icone', 'O boneco já ouve o barulho. Que cara faz quem se assusta?'),
        P.regra('cara_errada', a => icones(a.evento('somalto')).length > 0 && !icones(a.evento('somalto'), 'Surprised').length, [
          ['surpreendida', 'Assustado… com essa cara?'],
          'Há um desenho de boca aberta, de espanto.',
          'Escolhe a cara surpreendida.',
        ], 'Que susto!'),
        P.bloco('somalto', 'mk_servo', 'Faz cara de susto… e o corpo, não salta?'),
      ],
      sucesso: 'Que susto! O microfone ouve, o servo salta: o boneco reage ao mundo.',
      extensao: 'E se ele voltasse devagar ao lugar, depois do susto, com pausas?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_icone"><field name="I">Surprised</field><next><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></next></block></statement></block></xml>',
        pedido: 'Bato palmas e o meu boneco nem se mexe! Só se assusta quando carrego no A… Que gambiarra é esta?',
      },
    },
  };

  const AMBULANCIA = {
    titulo: 'Ouvir a ambulância',
    missao: 'O micro:bit «ouve» a sirene da ambulância: com barulho, acende a luz; em silêncio, apaga.',
    passos: ['Em «para sempre», usa «se … então … senão».', 'Condição: «nível de som» > 128. Então LED para 1; senão LED para 0.', 'Experimenta: mexe no controlo do som.'],
    material: 'micro:bit V2, 1 LED, 2 crocodilos, a ambulância de brinquedo',
    novos: ['mk_sempre', 'mk_se_senao', 'th_comparar_maior', 'mk_som_nivel'],
    caixa: ['mk_digital_1', 'mk_digital_0'],
    teste: 'som:200',
    ok: r => F.verif.aposSensor(r, 'som', v => v >= 180, s => s.some(x => /^digital:P\d:1$/.test(x))) &&
      F.verif.aposSensor(r, 'som', v => v <= 40, s => s.some(x => /^digital:P\d:0$/.test(x)) && !s.some(x => /^digital:P\d:1$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Sem fios nenhuns entre os dois: o micro:bit vai ouvir a sirene da ambulância e acender uma luz!'],
      parecePronto: a => ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_som_nivel') && ramo(s, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)),
      testar: 'Tens uma ideia? Vamos testar! Sobe o som (sirene) e depois baixa (silêncio).',
      regras: [
        P.evento('sempre', 'O micro:bit tem de estar sempre a ouvir, não só uma vez. Que bloco repete sem parar?'),
        P.bloco('sempre', 'mk_se', 'Ele ouve sempre… mas tem de decidir: barulho ou silêncio? Que bloco decide?'),
        P.valorEm('sempre', 'mk_se', 'mk_comparar', 'Decidir o quê? O «se» precisa de uma pergunta com resposta sim ou não.'),
        P.valorEm('sempre', 'mk_se', 'mk_som_nivel', 'A pergunta é sobre o barulho. Que bloco mede o barulho?'),
        P.regra('sem_luz', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(s => ramo(s, 'sim').some(p => p.tipo === 'mk_digital' && p.v === 1)), [
          ['curiosa', 'Quando há barulho, o que é que acontece à luz?'],
          'No «então», a luz liga; no «senão», desliga.',
          'Põe «gravação digital pin P2 para 1» no «então» e «para 0» no «senão».',
        ], 'Agora a luz responde à sirene!'),
        P.regra('ao_contrario', a => ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_comparar' && (u.op === '<' || u.op === '<='))), [
          ['surpreendida', 'Ui! Assim a luz acende no silêncio. É isso que queres?'],
          'Olha para o sinal da comparação: «maior que» ou «menor que»?',
          'Muda o sinal para «>».',
        ], 'Isso, agora acende com barulho!'),
      ],
      sucesso: 'O micro:bit ouve a ambulância! Não há fios entre os dois: a ligação é o som.',
      extensao: 'E se, em vez de acender, mostrasse no ecrã o nível de som em barras?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se"><value name="C"><block type="mk_comparar"><field name="OP">&gt;</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_som_nivel"></block></value><value name="B"><shadow type="mk_num"><field name="NUM">128</field></shadow></value></block></value><statement name="SIM"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement><statement name="NAO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block></statement></block></xml>',
        pedido: 'A minha luz acende com a sirene… mas nunca mais apaga, nem em silêncio! Que gambiarra fiz?',
      },
    },
  };

  const EQUILIBRIO = {
    titulo: 'Brinquedo de equilíbrio',
    missao: 'Inclina o brinquedo: o servo roda para o lado para onde ele cai.',
    passos: ['Usa «em inclinado para a esquerda» e «em inclinado para a direita».', 'Esquerda: servo para 0. Direita: servo para 180.', 'Experimenta com os botões de inclinar.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, um brinquedo de equilíbrio',
    novos: ['mk_gesto', 'mk_gesto_direita'],
    caixa: ['th_servo_0', 'th_servo_180', 'mk_icone'],
    teste: 'gesto:left',
    sim: ['gesto:left', 'gesto:right'],
    ok: r => causou(r, s => s.some(x => x.startsWith('servo:') && angulo(x) <= 45), v => v === 'gesto:left') &&
      causou(r, s => s.some(x => x.startsWith('servo:') && angulo(x) >= 135), v => v === 'gesto:right'),
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos fazer um brinquedo que sente para onde está a cair, como um equilibrista!'],
      parecePronto: a => servos(a.evento('gesto:left')).some(p => Number(p.angulo) <= 45) && servos(a.evento('gesto:right')).some(p => Number(p.angulo) >= 135),
      testar: 'Tens uma ideia? Vamos testar! Inclina para a esquerda e depois para a direita.',
      regras: [
        P.evento('gesto:left', 'O micro:bit sente quando o inclinas. Que bloco fica à escuta de inclinar para a esquerda?'),
        P.bloco('gesto:left', 'mk_servo', 'Já sente a inclinação. E o servo, para onde roda?'),
        P.evento('gesto:right', 'Esquerda feita. E quando cai para o outro lado?', 'Já sente os dois lados!'),
        P.bloco('gesto:right', 'mk_servo', 'Para a direita, o servo também tem de rodar.'),
        P.regra('mesmo_lado', a => { const e = servos(a.evento('gesto:left')).map(p => Number(p.angulo)), d = servos(a.evento('gesto:right')).map(p => Number(p.angulo)); return e.length && d.length && !(e.some(x => x <= 45) && d.some(x => x >= 135)); }, [
          ['surpreendida', 'Cai para a esquerda e o servo vai… para onde?'],
          'Cada lado tem o seu ângulo: um pequeno e um grande.',
          'Esquerda: servo para 0. Direita: servo para 180.',
        ], 'Equilíbrio perfeito!'),
      ],
      sucesso: 'O brinquedo sente o equilíbrio! O acelerómetro diz para onde o micro:bit está a cair.',
      extensao: 'E se, direito (ecrã para cima), o servo voltasse ao meio (90)?',
      gambiarra: {
        xml: '<xml><block type="mk_gesto" x="40" y="40"><field name="G">left</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></statement></block><block type="mk_gesto" x="40" y="200"><field name="G">right</field><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">180</field></shadow></value></block></statement></block></xml>',
        pedido: 'O meu equilibrista vai sempre para o mesmo lado, caia para onde cair! Ajudas-me?',
      },
    },
  };

  const PISCA = {
    titulo: 'Pisca do carrinho',
    missao: 'O carrinho vai virar: com o botão B, o pisca liga e desliga 4 vezes.',
    passos: ['No botão B: «repetir 4 vezes».', 'Lá dentro: LED para 1, pausa, LED para 0, pausa.', 'Experimenta: carrega no B.'],
    material: 'micro:bit, 1 LED cor de laranja, 2 crocodilos, um carrinho',
    novos: ['mk_botao_B'],
    caixa: ['mk_repetir', 'mk_digital_1', 'mk_digital_0', 'mk_pausa'],
    teste: 'botao:B',
    ok: r => saidasApos(r, v => v === 'botao:B').some(o => {
      const d = o.filter(e => e.v.startsWith('digital:'));
      return d.filter(e => e.v.endsWith(':1')).length >= 3 && d.filter(e => e.v.endsWith(':0')).length >= 3 && comPausas(d, 90);
    }),
    tutor: {
      boasVindas: ['boas_vindas', 'Pisca-pisca! Antes de virar, o carrinho tem de avisar. Vamos fazer-lhe um pisca?'],
      parecePronto: a => { const ev = a.evento('botao:B'); const d = digitais(ev).filter(p => p.dentroDe === 'mk_repetir'); return d.some(p => p.v === 1) && d.some(p => p.v === 0) && blocos(ev, 'mk_pausa').length >= 2; },
      testar: 'Tens uma ideia? Vamos testar! Carrega no B e olha para o LED.',
      regras: [
        P.evento('botao:B', 'O pisca liga-se com um botão. Qual é o botão desta missão?'),
        P.bloco('botao:B', 'mk_repetir', 'Pisca, pisca, pisca, pisca… vais fazer quatro vezes à mão?'),
        P.regra('nunca_apaga', a => { const d = digitais(a.evento('botao:B')); return d.length > 0 && !d.some(p => p.v === 0); }, [
          ['a_pensar', 'Um pisca que nunca se apaga é um farol!'],
          'Para piscar, a luz liga… e depois desliga.',
          'Dentro do repetir, põe também «gravação digital pin P2 para 0».',
        ], 'Agora pisca!'),
        P.regra('sem_pausas', a => digitais(a.evento('botao:B')).length >= 2 && blocos(a.evento('botao:B'), 'mk_pausa').length < 2, [
          ['curiosa', 'O LED pisca tão depressa que parece sempre aceso. Como se abranda?'],
          'Depois de ligar e depois de desligar, espera um bocadinho.',
          'Põe uma «pausa» a seguir a cada «gravação digital».',
        ], 'Pisca, pisca, agora vê-se!'),
      ],
      sucesso: 'O carrinho tem pisca! Ligar, esperar, desligar, esperar: é assim que todos os piscas funcionam.',
      extensao: 'E se o botão A fizesse o pisca do outro lado, num LED no pin 0?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><field name="B">B</field><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block></next></block></next></block></next></block></statement></block></statement></block></xml>',
        pedido: 'O meu pisca não pisca: fica sempre aceso! Acho que me enganei num número. Encontras?',
      },
    },
  };

  // ============================================================ NÍVEL 3 · Inventar
  const CONTA_ABRACOS = {
    titulo: 'Contador de abraços',
    missao: 'O peluche conta quantos abraços recebe e mostra o número.',
    passos: ['No arranque: definir contador para 0.', 'No pin 0 (o abraço): mudar contador em 1 e mostrar número contador.', 'Experimenta: toca no pin 0 várias vezes.'],
    material: 'micro:bit, 2 crocodilos, alumínio, esponja, um peluche',
    novos: ['mk_iniciar', 'mk_var_definir', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    caixa: ['th_pino_p0'],
    teste: 'pino:P0',
    ok: r => causou(r, s => s.includes('numero:3'), v => v.startsWith('pino:')) && [1, 2, 3].every(n => numeros(r).includes(n)),
    tutor: {
      boasVindas: ['boas_vindas', 'Quantos abraços recebe um peluche por dia? Vamos pô-lo a contar! Para isso precisamos de uma variável: uma caixinha que guarda um número.'],
      parecePronto: a => pinos(a).some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'contador') && dentro(e, 'mk_mostrar_numero', 'mk_var')),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 0 três vezes.',
      regras: [
        P.evento('pino:', 'O abraço fecha o circuito no pin 0. Que bloco dá por isso?'),
        P.regra('poe_sempre_1', a => pinos(a).some(e => blocos(e, 'mk_var_definir').some(p => p.var === 'contador')), [
          ['surpreendida', 'Ui! Em cada abraço o contador volta ao início. Assim nunca passa de um!'],
          '«definir» põe um valor novo; «mudar» soma ao que já lá está.',
          'Usa «mudar contador em 1» dentro do pino; o «definir» vai para o «no arranque».',
        ], 'Agora conta a sério!'),
        P.bloco('pino:', 'mk_var_mudar', 'Abraçaste. Como é que a caixinha do contador fica com mais um?'),
        P.bloco('pino:', 'mk_mostrar_numero', 'O contador já conta, mas às escondidas. Como é que o vemos?'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'Mostra sempre o mesmo número? O que é que devia aparecer?'),
      ],
      sucesso: 'O peluche sabe contar! A variável «contador» guarda o número entre um abraço e o outro.',
      extensao: 'E se ao 10.º abraço o peluche tocasse uma música de festa?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><field name="P">P0</field><statement name="DO"><block type="mk_var_definir"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_var"><field name="VAR">contador</field></block></value></block></next></block></statement></block></xml>',
        pedido: 'O meu peluche já levou três abraços e continua a dizer «1»! Que gambiarra fiz no contador?',
      },
    },
  };

  const COFRE = {
    titulo: 'Alarme do cofre',
    missao: 'Se alguém abre a caixa dos brinquedos, toca um alarme.',
    passos: ['Na tampa, um interruptor de alumínio no pin 0: aberto = 1.', 'Em «para sempre»: se «leitura digital pin P0» = 1, então toca um tom.', 'Experimenta: carrega em «Pin 0» para abrir e fechar.'],
    material: 'micro:bit, 2 crocodilos, alumínio, uma caixa de brinquedos',
    novos: ['mk_ler_digital', 'mk_se_entao', 'th_comparar_igual'],
    caixa: ['mk_sempre', 'mk_tom', 'mk_icone_nao'],
    teste: 'digital:P0:1',
    sim: ['digital:P0'],
    ok: r => F.verif.aposSensor(r, 'digital:P0', v => v === 1, s => s.some(x => /^(tom|som):/.test(x))) &&
      F.verif.aposSensor(r, 'digital:P0', v => v === 0, s => !s.some(x => /^(tom|som):/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Há um ladrão de brinquedos à solta! Vamos guardar a caixa com um alarme?'],
      parecePronto: a => ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_ler_digital') && ramo(s, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')),
      testar: 'Tens uma ideia? Vamos testar! Abre a caixa (pin 0) e depois fecha.',
      regras: [
        P.evento('sempre', 'Um alarme tem de estar sempre de guarda. Que bloco nunca para?'),
        P.regra('sem_se', a => !!a.evento('sempre') && ses(a.evento('sempre')).length === 0, [
          'Está sempre de guarda… mas só deve tocar às vezes. Que bloco decide?',
          'Há um bloco verde-azulado que só faz o que tem dentro quando a resposta é sim: «se … então».',
          'Põe «se … então» dentro de «para sempre».',
        ], 'Agora o alarme sabe decidir!'),
        P.regra('sem_leitura', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(s => (s.usa || []).some(u => u.tipo === 'mk_ler_digital')), [
          ['a_pensar', 'Decidir com base em quê? O micro:bit tem de olhar para o interruptor da tampa.'],
          'Há um bloco vermelho-escuro que lê se o circuito está aberto (1) ou fechado (0): «leitura digital pin».',
          'Faz a pergunta «leitura digital pin P0 = 1» e encaixa-a no «se».',
        ], 'Agora o alarme vigia a tampa!'),
        P.regra('sem_alarme', a => ses(a.evento('sempre')).length > 0 && !ses(a.evento('sempre')).some(s => ramo(s, 'sim').some(p => p.tipo === 'mk_tom' || p.tipo === 'mk_som')), [
          ['curiosa', 'A tampa abriu… e o alarme, ouve-se?'],
          'Dentro do «então» põe um bloco laranja de música.',
          'Põe «tocar tom» dentro do «se … então».',
        ], 'Uiii-uiii! Alarme ligado!'),
        P.regra('sempre_a_tocar', a => (a.evento('sempre') ? a.evento('sempre').plano : []).some(p => (p.tipo === 'mk_tom' || p.tipo === 'mk_som') && p.dentroDe !== 'mk_se_entao' && p.dentroDe !== 'mk_se'), [
          ['a_pensar', 'O alarme toca mesmo com a caixa fechada? Isso acorda a casa toda!'],
          'O som só deve correr quando a condição é verdadeira.',
          'Mete o «tocar tom» dentro do «se … então».',
        ], 'Agora só toca quando abrem a caixa!'),
      ],
      sucesso: 'Cofre protegido! A leitura digital diz se o circuito está aberto (1) ou fechado (0).',
      extensao: 'E se o alarme também mostrasse uma cruz ✖ no ecrã?',
      gambiarra: {
        xml: '<xml><block type="mk_sempre" x="40" y="40"><statement name="DO"><block type="mk_se_entao"><value name="C"><block type="mk_comparar"><field name="OP">==</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_ler_digital"><field name="P">P0</field></block></value><value name="B"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></value></block><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">523</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.5</field></shadow></value></block></next></block></statement></block></xml>',
        pedido: 'O meu alarme não se cala, mesmo com a caixa fechada! Os vizinhos estão a reclamar… Encontras a gambiarra?',
      },
    },
  };

  const ROLETA = {
    titulo: 'Roleta do robô',
    missao: 'Abana o robô e o braço dele aponta para um sítio ao acaso.',
    passos: ['Em «em agitar»: servo para «escolher ao acaso de 0 até 180».', 'Desenha à volta do servo os prémios (ou as tarefas!).', 'Experimenta: agita várias vezes.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, cartão e canetas',
    novos: ['mk_agitar', 'th_aleatorio_servo'],
    caixa: ['mk_servo'],
    teste: 'agitar',
    ok: r => {
      const a = saidasApos(r, v => v === 'agitar').flatMap(o => o.filter(e => e.v.startsWith('servo:')).map(e => angulo(e.v)));
      return new Set(a).size >= 2 && Math.max(...a) >= 40;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Quem arruma a sala hoje? Vamos fazer uma roleta-robô que decide ao acaso!'],
      parecePronto: a => dentro(a.evento('agitar'), 'mk_servo', 'mk_aleatorio'),
      testar: 'Tens uma ideia? Vamos testar! Agita várias vezes e vê para onde aponta.',
      regras: [
        P.evento('agitar', 'A roleta gira quando abanas o robô. Que bloco sente o abanão?'),
        P.bloco('agitar', 'mk_servo', 'O robô já sente o abanão. Quem mexe o ponteiro?'),
        P.valorEm('agitar', 'mk_servo', 'mk_aleatorio', 'O ponteiro vai sempre parar no mesmo sítio. Uma roleta assim tem graça?'),
        P.regra('acaso_pequeno', a => servos(a.evento('agitar')).some(p => (p.usa || []).some(u => u.tipo === 'mk_aleatorio') && Math.max(...(p.usa || []).filter(u => u.tipo === 'mk_num').map(u => u.n), 0) < 90), [
          ['curiosa', 'O ponteiro mexe-se… mas só um bocadinho. Até onde vai a roleta?'],
          'O servo vai de 0 a 180 graus. Olha para os números do «escolher ao acaso».',
          'Muda para «escolher ao acaso de 0 até 180».',
        ], 'Agora a roleta dá a volta toda!'),
      ],
      sucesso: 'Roleta pronta! O micro:bit escolhe um número ao acaso e o servo mostra-o com o braço.',
      extensao: 'O ponteiro quase não se mexe? Confirma os números: de 0 até 180 é a volta toda do servo.',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="40"><statement name="DO"><block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block></statement></block></xml>',
        pedido: 'A minha roleta é batoteira: aponta sempre para o mesmo sítio! Ajudas-me a torná-la justa?',
      },
    },
  };

  const TAPETE = {
    titulo: 'Tapete das vidas',
    missao: 'Um tapete de pressão no chão: cada vez que o pisas perdes uma vida; sem vidas, cara triste.',
    passos: ['No arranque: definir vidas para 3.', 'No pin 1 (o tapete): mudar vidas em -1 e mostrar número vidas.', 'Se vidas = 0, então cara triste. Experimenta: pisa 3 vezes.'],
    material: 'micro:bit, 2 crocodilos, cartão, alumínio, esponja',
    novos: ['th_definir_vidas', 'th_mudar_vidas', 'th_var_vidas', 'th_comparar_vidas'],
    caixa: ['mk_iniciar', 'mk_pino_tocado', 'mk_mostrar_numero', 'mk_se_entao', 'mk_icone_triste'],
    teste: 'pino:P1',
    ok: r => {
      const n = numeros(r);
      const i2 = n.indexOf(2), i1 = n.indexOf(1, i2 + 1), i0 = n.indexOf(0, i1 + 1);
      return i2 >= 0 && i1 > i2 && i0 > i1 && causou(r, s => s.includes('numero:0') && s.includes('icone:Sad'), v => v.startsWith('pino:'));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'O chão é lava! Vamos fazer um tapete-armadilha que te tira vidas quando o pisas?'],
      parecePronto: a => !!a.evento('inicio') && blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'vidas') &&
        pinos(a).some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'vidas' && Number(p.n) < 0) && dentro(e, 'mk_mostrar_numero', 'mk_var') && icones(e, 'Sad').length > 0),
      testar: 'Tens uma ideia? Vamos testar! Pisa o tapete (pin 1) três vezes.',
      regras: [
        P.evento('inicio', 'Quantas vidas tens quando o jogo começa? Onde se diz isso, logo ao ligar?'),
        P.regra('sem_vidas_inicio', a => !!a.evento('inicio') && !blocos(a.evento('inicio'), 'mk_var_definir').some(p => p.var === 'vidas'), [
          'O jogo começou… e com quantas vidas?',
          'No «no arranque», usa «definir … para» com a variável vidas.',
          'Põe «definir vidas para 3» no «no arranque».',
        ], 'Três vidas. Cuidado com a lava!'),
        P.evento('pino:', 'Pisar o tapete fecha o circuito. Que bloco dá por isso?'),
        P.regra('ganha_vidas', a => pinos(a).some(e => blocos(e, 'mk_var_mudar').some(p => p.var === 'vidas' && Number(p.n) > 0)), [
          ['surpreendida', 'Pisas a lava e ganhas vidas? Que jogo tão simpático!'],
          'Para tirar, muda-se com um número negativo.',
          'Usa «mudar vidas em -1».',
        ], 'Isso, a lava tira vidas!'),
        P.bloco('pino:', 'mk_var_mudar', 'Pisaste o tapete… e as vidas, diminuem?'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'Quantas vidas tens? Mostra a variável, não um número fixo.'),
        P.regra('sem_fim', a => pinos(a).length > 0 && !pinos(a).some(e => icones(e, 'Sad').length > 0), [
          ['curiosa', 'E quando as vidas chegam a zero? O jogo nem avisa?'],
          'Usa «se … então» com a pergunta «vidas = 0».',
          'Dentro do pino: se vidas = 0, então mostrar ícone triste.',
        ], 'Fim de jogo… até à próxima!'),
      ],
      sucesso: 'Tapete-armadilha pronto! Uma variável que desce, uma comparação que decide: já é um jogo a sério.',
      extensao: 'E se o botão A recomeçasse o jogo com 3 vidas?',
      gambiarra: {
        xml: '<xml><block type="mk_iniciar" x="40" y="40"><statement name="DO"><block type="mk_var_definir"><field name="VAR">vidas</field><value name="V"><shadow type="mk_num"><field name="NUM">3</field></shadow></value></block></statement></block><block type="mk_pino_tocado" x="40" y="200"><statement name="DO"><block type="mk_var_mudar"><field name="VAR">vidas</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_var"><field name="VAR">vidas</field></block></value></block></next></block></statement></block></xml>',
        pedido: 'No meu tapete, quanto mais pisas, mais vidas tens: 4, 5, 6! Isto não é um jogo, é uma festa. Que gambiarra fiz?',
      },
    },
  };

  const CRONOMETRO = {
    titulo: 'Cronómetro da corrida',
    missao: 'Dois portões de alumínio na pista: o micro:bit mede quanto tempo o carrinho demora.',
    passos: ['Pin 0 (partida): definir medida para «tempo de execução (ms)».', 'Pin 1 (chegada): mostrar número «tempo de execução − medida».', 'Experimenta: toca no pin 0, espera, toca no pin 1.'],
    material: 'micro:bit, 4 crocodilos, alumínio, um carrinho e uma rampa',
    novos: ['mk_tempo', 'th_definir_medida', 'th_var_medida', 'th_conta_menos'],
    caixa: ['th_pino_p0', 'mk_pino_tocado', 'mk_mostrar_numero'],
    teste: 'pino:P1',
    ok: r => {
      let t0 = null;
      for (let i = 0; i < r.length; i++) {
        const e = r[i];
        if (e.dir !== 'in') continue;
        if (e.v === 'pino:P0') { t0 = e.t; continue; }
        if (e.v === 'pino:P1' && t0 !== null) {
          const gap = e.t - t0;
          for (let j = i + 1; j < r.length && r[j].dir === 'out'; j++) {
            if (r[j].v.startsWith('numero:') && Math.abs(Number(r[j].v.slice(7)) - gap) <= 120 && gap > 0) return true;
          }
        }
      }
      return false;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Qual é o carrinho mais rápido da sala? Vamos fazer um cronómetro de corrida com dois portões!'],
      parecePronto: a => !!a.evento('pino:P0') && blocos(a.evento('pino:P0'), 'mk_var_definir').some(p => p.var === 'medida' && (p.usa || []).some(u => u.tipo === 'mk_tempo')) &&
        dentro(a.evento('pino:P1'), 'mk_mostrar_numero', 'mk_conta'),
      testar: 'Tens uma ideia? Vamos testar! Partida no pin 0, chegada no pin 1.',
      regras: [
        P.evento('pino:P0', 'O carrinho passa primeiro no portão da partida. Que pino é esse?'),
        P.bloco('pino:P0', 'mk_var_definir', 'Na partida, o micro:bit tem de se lembrar da hora. Onde é que ele guarda um número?'),
        P.regra('sem_hora', a => blocos(a.evento('pino:P0'), 'mk_var_definir').length > 0 && !blocos(a.evento('pino:P0'), 'mk_var_definir').some(p => (p.usa || []).some(u => u.tipo === 'mk_tempo')), [
          'Guardas um número na partida… mas qual? Tem de ser a hora certa!',
          'Há um bloco cor-de-rosa que diz há quanto tempo o programa começou.',
          'Encaixa «tempo de execução (ms)» no «definir medida para».',
        ], 'Partida marcada!'),
        P.evento('pino:P1', 'E na chegada? O carrinho passa no outro portão.', 'Já tens a chegada!'),
        P.valorEm('pino:P1', 'mk_mostrar_numero', 'mk_conta', 'Na chegada, quanto tempo passou desde a partida? Isso é uma conta…'),
        P.regra('conta_sem_medida', a => blocos(a.evento('pino:P1'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_conta')) && !blocos(a.evento('pino:P1'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_var') && (p.usa || []).some(u => u.tipo === 'mk_tempo')), [
          ['a_pensar', 'A conta é «agora menos a partida». Tens as duas coisas na conta?'],
          'Na conta: à esquerda o tempo de agora, à direita a medida da partida.',
          'Faz «tempo de execução (ms) − medida».',
        ], 'Cronómetro certinho!'),
      ],
      sucesso: 'Cronómetro pronto! Hora da chegada menos hora da partida: é assim que os cronómetros a sério funcionam.',
      extensao: 'O número vem em milésimos de segundo. E se dividisses por 1000 para ver segundos?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><field name="P">P0</field><statement name="DO"><block type="mk_var_definir"><field name="VAR">medida</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_tempo"></block></value></block></statement></block><block type="mk_pino_tocado" x="40" y="200"><field name="P">P1</field><statement name="DO"><block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow><block type="mk_tempo"></block></value></block></statement></block></xml>',
        pedido: 'O meu cronómetro diz que o carrinho demorou séculos! Acho que me esqueci de uma conta. Encontras?',
      },
    },
  };

  const INVENTA = {
    titulo: 'Inventa',
    missao: 'Agora é contigo: pega num brinquedo velho e dá-lhe um truque novo.',
    passos: ['Tens botões, pinos, gestos, som, servo, luzes e variáveis.', 'Desenha primeiro: o que sente o brinquedo? O que faz ele?'],
    material: 'um brinquedo velho e o que tiveres',
    novos: [],
    caixa: ['mk_botao', 'mk_pino_tocado', 'mk_logo', 'mk_gesto', 'mk_som_alto', 'mk_sempre', 'mk_icone', 'mk_som', 'mk_tom', 'mk_servo', 'mk_digital_1', 'mk_digital_0', 'mk_pausa', 'mk_repetir', 'mk_se_entao', 'mk_var_mudar', 'mk_mostrar_numero'],
    livre: true,
    ok: () => false,
    tutor: {
      boasVindas: ['inventar', 'Abre um brinquedo, vê o que ele tem lá dentro e inventa-lhe um truque novo. Se precisares de mim, estou aqui.'],
      parecePronto: () => false,
      testar: '',
      regras: [],
      sucesso: '',
      extensao: '',
    },
  };

  F.registarMissao({
    id: 'toy-hacking',
    titulo: 'Toy hacking',
    tema: 'Gambiarra e brinquedos',
    descricao: 'Abre um brinquedo, percebe como funciona e reinventa-o com o micro:bit.',
    cor: '#d400d4',
    xml: XML,
    niveis: [
      { nome: 'Nível 1 · Abrir e perceber', desafios: [BOTAO_SECRETO, PELUCHE_RI, DORME, FAROIS, SIRENE, ABRACO] },
      { nome: 'Nível 2 · Reinventar', desafios: [BRACO, CANCELA, ASSUSTADO, AMBULANCIA, EQUILIBRIO, PISCA] },
      { nome: 'Nível 3 · Inventar', desafios: [CONTA_ABRACOS, COFRE, ROLETA, TAPETE, CRONOMETRO, INVENTA] },
    ],
  });
})();
