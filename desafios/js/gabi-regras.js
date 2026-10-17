/* Gabi — regras e mensagens de cada desafio.
 *
 * Cada regra descreve uma dificuldade que se reconhece no programa:
 *   id         nome curto
 *   ativa(a)   true quando a dificuldade está presente (a = análise do programa)
 *   pistas     três níveis: [estado do sprite, texto]
 *                1 pista conceptual · 2 pista orientadora · 3 ajuda concreta
 *   corrigido  o que a Gabi diz quando a criança resolve sozinha
 * As regras são lidas pela ordem: a primeira activa é a que conta.
 * O sucesso NÃO é decidido aqui: é o comportamento do programa (desafios.js).
 *
 * Estados do sprite: boas_vindas, curiosa, a_pensar, surpreendida, dica, celebrar, incentivar, calma
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  // ------------------------------------------------------------ ajudas
  const icones = (ev, nome) => ev ? ev.plano.filter(p => p.tipo === 'mk_icone' && (!nome || p.icone === nome)) : [];
  const tem = (ev, tipo) => !!ev && ev.plano.some(p => p.tipo === tipo);
  const soltoCom = (a, tipo) => a.soltosPlano().some(p => p.tipo === tipo);

  // Regras comuns a todos os desafios (vêm depois das específicas)
  const COMUNS = [
    {
      id: 'blocos_soltos',
      ativa: a => a.soltos.length > 0,
      pistas: [
        ['a_pensar', 'Tens blocos soltos na área cinzenta. Será que eles sabem quando começar?'],
        ['dica', 'Os blocos que fazem coisas só correm se estiverem dentro de um bloco cor-de-rosa.'],
        ['dica', 'Arrasta os blocos soltos para dentro da boca de um bloco cor-de-rosa.'],
      ],
      corrigido: 'Isso! Agora esses blocos já sabem quando começar.',
    },
  ];

  const DESAFIOS = [
    // ---------------------------------------------------------- 1 · Acorda-o
    {
      boasVindas: ['boas_vindas', 'Olá! Sou a Gabi, a capivara da gambiarra. Vamos acordar este micro:bit? Quero vê-lo sorrir quando o agitas.'],
      parecePronto: a => icones(a.evento('agitar'), 'Happy').length > 0,
      testar: 'Parece-me bem! Mas só acredito vendo: carrega em AGITAR.',
      regras: [
        {
          id: 'sem_agitar',
          ativa: a => !a.evento('agitar'),
          pistas: [
            ['curiosa', 'Como é que o micro:bit vai saber que o agitaste? Há um bloco que fica à escuta…'],
            ['dica', 'Procura na coluna branca um bloco cor-de-rosa que fale em agitar.'],
            ['dica', 'Arrasta «em agitar» para a área cinzenta.'],
          ],
          corrigido: 'Boa! Agora o micro:bit já está à escuta.',
        },
        {
          id: 'icone_fora',
          ativa: a => !!a.evento('agitar') && icones(a.evento('agitar')).length === 0 && soltoCom(a, 'mk_icone'),
          pistas: [
            ['a_pensar', 'O ícone está sozinho… quando é que ele vai aparecer?'],
            ['dica', 'O «mostrar ícone» tem de ficar dentro do «em agitar», como uma peça de puzzle.'],
            ['dica', 'Encaixa «mostrar ícone» na boca do bloco «em agitar».'],
          ],
          corrigido: 'Encaixou! Já fazem equipa.',
        },
        {
          id: 'sem_icone',
          ativa: a => !!a.evento('agitar') && icones(a.evento('agitar')).length === 0,
          pistas: [
            ['curiosa', 'O micro:bit já sente que o agitas. E depois, o que é que ele faz?'],
            ['dica', 'Há um bloco azul que desenha nas luzes do micro:bit.'],
            ['dica', 'Põe «mostrar ícone» dentro de «em agitar».'],
          ],
          corrigido: 'Isso, agora ele já tem alguma coisa para fazer!',
        },
        {
          id: 'icone_errado',
          ativa: a => icones(a.evento('agitar')).length > 0 && icones(a.evento('agitar'), 'Happy').length === 0,
          pistas: [
            ['surpreendida', 'Que cara é essa? A missão pede um sorriso.'],
            ['dica', 'Carrega na setinha ao lado do desenho para escolher outro.'],
            ['dica', 'Escolhe a cara contente na lista do ícone.'],
          ],
          corrigido: 'Agora sim, um sorriso!',
        },
      ],
      sucesso: 'Acordou! Fizeste o micro:bit sorrir.',
      extensao: 'E se ele fizesse uma cara diferente quando o agitas outra vez?',
      gambiarra: {
        xml: '<xml><block type="mk_agitar" x="40" y="40"></block><block type="mk_icone" x="320" y="70"><field name="I">Happy</field></block></xml>',
        pedido: 'Acho que fiz uma gambiarra… agito e não acontece nada! Consegues descobrir o que me esqueci?',
      },
    },

    // ---------------------------------------------------------- 2 · Coração a bater
    {
      boasVindas: ['boas_vindas', 'Agora quero um coração a bater! Quando tocares no logotipo, ele bate 4 vezes.'],
      parecePronto: a => {
        const ev = a.evento('logo');
        return icones(ev, 'Heart').length > 0 && icones(ev, 'SmallHeart').length > 0 && ev.plano.filter(p => p.tipo === 'mk_pausa').length >= 2;
      },
      testar: 'Parece-me bem! Mas só acredito vendo: toca no logotipo dourado.',
      regras: [
        {
          id: 'sem_logo',
          ativa: a => !a.evento('logo'),
          pistas: [
            ['curiosa', 'O coração deve bater quando tocas no logotipo. Quem é que fica à escuta do logotipo?'],
            ['dica', 'Procura o bloco cor-de-rosa que fala no logotipo.'],
            ['dica', 'Arrasta «ao logotipo pressionado» para a área cinzenta.'],
          ],
          corrigido: 'Boa, o logotipo já está à escuta!',
        },
        {
          id: 'fora_do_logo',
          ativa: a => !!a.evento('logo') && !tem(a.evento('logo'), 'mk_icone') && (soltoCom(a, 'mk_repetir') || soltoCom(a, 'mk_icone')),
          pistas: [
            ['a_pensar', 'Os corações estão fora do logotipo. Quando é que vão bater?'],
            ['dica', 'Tudo o que fica fora de um bloco cor-de-rosa nunca corre.'],
            ['dica', 'Arrasta o «repetir» (com os corações) para dentro de «ao logotipo pressionado».'],
          ],
          corrigido: 'Agora estão no sítio certo!',
        },
        {
          id: 'sem_coracoes',
          ativa: a => !!a.evento('logo') && (icones(a.evento('logo'), 'Heart').length === 0 || icones(a.evento('logo'), 'SmallHeart').length === 0),
          pistas: [
            ['curiosa', 'Para bater, o coração tem de mudar: grande… pequeno… grande…'],
            ['dica', 'Precisas de dois «mostrar ícone»: um com o coração e outro com o coração pequeno.'],
            ['dica', 'Põe o coração grande e depois o coração pequeno, um a seguir ao outro.'],
          ],
          corrigido: 'Já tens os dois corações!',
        },
        {
          id: 'sem_pausa',
          ativa: a => !!a.evento('logo') && a.evento('logo').plano.filter(p => p.tipo === 'mk_pausa').length === 0,
          pistas: [
            ['curiosa', 'Hmm… o coração está a mudar tão depressa! Será que conseguimos controlar o tempo?'],
            ['dica', 'Procura um bloco azul que nos deixe esperar um bocadinho entre os desenhos.'],
            ['dica', 'Experimenta colocar uma pausa de 200 ms depois de cada coração.'],
          ],
          corrigido: 'Isso! Com a pausa já se vê o coração.',
        },
        {
          id: 'uma_pausa',
          ativa: a => !!a.evento('logo') && a.evento('logo').plano.filter(p => p.tipo === 'mk_pausa').length === 1,
          pistas: [
            ['a_pensar', 'Já está quase a bater! Mas um dos corações aparece e desaparece num instante…'],
            ['dica', 'Cada desenho precisa do seu tempo de espera.'],
            ['dica', 'Põe outra pausa a seguir ao coração que não tem nenhuma.'],
          ],
          corrigido: 'Agora os dois corações têm tempo para aparecer.',
        },
        {
          id: 'sem_repetir',
          ativa: a => {
            const ev = a.evento('logo');
            return !!ev && !tem(ev, 'mk_repetir') && icones(ev, 'Heart').length < 4;
          },
          pistas: [
            ['curiosa', 'O coração bate uma vez… e depois? Quantas vezes queres que ele bata?'],
            ['dica', 'Há um bloco verde que repete coisas sem teres de as copiar.'],
            ['dica', 'Põe «repetir 4 vezes» dentro do logotipo e os corações e as pausas dentro do «repetir».'],
          ],
          corrigido: 'Isso, o verde faz o trabalho repetido por ti!',
        },
        {
          id: 'coracoes_fora_do_repetir',
          ativa: a => {
            const ev = a.evento('logo');
            return !!ev && tem(ev, 'mk_repetir') && icones(ev).some(p => p.dentroDe !== 'mk_repetir') && icones(ev).filter(p => p.dentroDe === 'mk_repetir').length < 2;
          },
          pistas: [
            ['a_pensar', 'O «repetir» está lá, mas o que é que ele está a repetir?'],
            ['dica', 'O «repetir» só repete o que está dentro da boca dele.'],
            ['dica', 'Mete os corações e as pausas dentro do «repetir».'],
          ],
          corrigido: 'Agora o «repetir» tem o que repetir!',
        },
        {
          id: 'poucas_vezes',
          ativa: a => {
            const r = (a.evento('logo') || { plano: [] }).plano.find(p => p.tipo === 'mk_repetir');
            return !!r && r.n < 4;
          },
          pistas: [
            ['a_pensar', 'Conta as batidas… quantas são?'],
            ['dica', 'O número no bloco verde diz quantas vezes ele repete.'],
            ['dica', 'Muda o número do «repetir» para 4.'],
          ],
          corrigido: 'Quatro batidas, certinho!',
        },
      ],
      sucesso: 'Boa! Agora já consigo ver o coração a bater. Descobriste como controlar o tempo!',
      extensao: 'E se fizéssemos o coração bater cada vez mais depressa?',
      gambiarra: {
        xml: '<xml><block type="mk_logo" x="40" y="40"><statement name="DO"><block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO"><block type="mk_icone"><field name="I">Heart</field><next><block type="mk_icone"><field name="I">SmallHeart</field></block></next></block></statement></block></statement></block></xml>',
        pedido: 'Acho que fiz uma gambiarra… mas não está a funcionar! O coração não bate. Consegues descobrir o que me esqueci de fazer?',
      },
    },

    // ---------------------------------------------------------- 3 · Sim ou não?
    {
      boasVindas: ['boas_vindas', 'Vamos dar respostas ao micro:bit: botão A diz que sim, botão B diz que não.'],
      parecePronto: a => icones(a.evento('botao:A'), 'Happy').length > 0 && icones(a.evento('botao:B'), 'Sad').length > 0,
      testar: 'Parece-me bem! Experimenta carregar no A e depois no B.',
      regras: [
        {
          id: 'botoes_repetidos',
          ativa: a => a.eventosDe('botao:A').length > 1 && !a.evento('botao:B'),
          pistas: [
            ['surpreendida', 'Tens dois botões A! E o B, fica sem nada?'],
            ['dica', 'Cada bloco de botão tem uma letra que se pode mudar.'],
            ['dica', 'Carrega na setinha do segundo botão e escolhe B.'],
          ],
          corrigido: 'Agora cada botão tem a sua letra.',
        },
        {
          id: 'sem_botao_A',
          ativa: a => !a.evento('botao:A'),
          pistas: [
            ['curiosa', 'Quem é que fica à escuta do botão A?'],
            ['dica', 'Procura o bloco cor-de-rosa «no botão A premido».'],
            ['dica', 'Arrasta «no botão A premido» e põe lá dentro a cara contente.'],
          ],
          corrigido: 'O botão A já está à escuta!',
        },
        {
          id: 'sem_botao_B',
          ativa: a => !a.evento('botao:B'),
          pistas: [
            ['curiosa', 'O A já responde. E quando carregas no B?'],
            ['dica', 'Usa outro bloco de botão e muda a letra.'],
            ['dica', 'Arrasta mais um «no botão premido», escolhe B e põe lá a cara triste.'],
          ],
          corrigido: 'Agora os dois botões respondem!',
        },
        {
          id: 'caras_trocadas',
          ativa: a => icones(a.evento('botao:A'), 'Happy').length === 0 || icones(a.evento('botao:B'), 'Sad').length === 0,
          pistas: [
            ['a_pensar', 'Olha bem para as caras: o A diz que sim e o B diz que não?'],
            ['dica', 'Muda o desenho com a setinha do «mostrar ícone».'],
            ['dica', 'No A põe a cara contente, no B a cara triste.'],
          ],
          corrigido: 'Caras certas nos botões certos!',
        },
      ],
      sucesso: 'Sim e não! O micro:bit já responde às tuas perguntas.',
      extensao: 'Consegues fazer uma pergunta a um colega e o micro:bit responde?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_icone"><field name="I">Happy</field></block></statement></block><block type="mk_botao" x="40" y="180"><statement name="DO"><block type="mk_icone"><field name="I">Sad</field></block></statement></block></xml>',
        pedido: 'Fiz uma gambiarra: carrego no B e não acontece nada! Consegues descobrir porquê?',
      },
    },

    // ---------------------------------------------------------- 4 · Faz barulho
    {
      boasVindas: ['boas_vindas', 'Hora do barulho! Carrega nos dois botões ao mesmo tempo e o micro:bit ri-se.'],
      parecePronto: a => tem(a.evento('botao:AB'), 'mk_som'),
      testar: 'Parece-me bem! Carrega em A+B para ouvir.',
      regras: [
        {
          id: 'sem_AB',
          ativa: a => !a.evento('botao:AB'),
          pistas: [
            ['curiosa', 'Os dois botões juntos… há um bloco que fica à escuta disso?'],
            ['dica', 'É o bloco do botão com a letra «A+B».'],
            ['dica', 'Arrasta «no botão A+B premido» para a área cinzenta.'],
          ],
          corrigido: 'O A+B já está à escuta!',
        },
        {
          id: 'som_noutro_sitio',
          ativa: a => !tem(a.evento('botao:AB'), 'mk_som') && a.existe('mk_som'),
          pistas: [
            ['a_pensar', 'O som está noutro sítio… quando é que ele vai tocar?'],
            ['dica', 'O som tem de ficar dentro do bloco A+B.'],
            ['dica', 'Arrasta «tocar som» para dentro de «no botão A+B premido».'],
          ],
          corrigido: 'Agora o som está no sítio certo!',
        },
        {
          id: 'sem_som',
          ativa: a => !tem(a.evento('botao:AB'), 'mk_som'),
          pistas: [
            ['curiosa', 'O A+B já está à escuta. E o que é que se ouve?'],
            ['dica', 'Procura um bloco vermelho de música.'],
            ['dica', 'Põe «tocar som» dentro do A+B.'],
          ],
          corrigido: 'Já tem som!',
        },
      ],
      sucesso: 'Ahahah! O micro:bit riu-se. Fizeste barulho!',
      extensao: 'Experimenta outro som. Qual é o mais engraçado?',
      gambiarra: {
        xml: '<xml><block type="mk_botao" x="40" y="40"><field name="B">AB</field></block><block type="mk_som" x="340" y="90"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value></block></xml>',
        pedido: 'A minha gambiarra está muda! Carrego em A+B e nada. Ajudas-me?',
      },
    },

    // ---------------------------------------------------------- 5 · Piano de fruta
    {
      boasVindas: ['boas_vindas', 'Gambiarra a sério: vamos fazer uma banana tocar música!'],
      parecePronto: a => a.eventosDe('pino:').some(e => tem(e, 'mk_tom')),
      testar: 'Parece-me bem! Toca no pin 1 (ou na banana, segurando o GND).',
      regras: [
        {
          id: 'sem_pino',
          ativa: a => a.eventosDe('pino:').length === 0,
          pistas: [
            ['curiosa', 'Como é que o micro:bit sabe que tocaste na banana?'],
            ['dica', 'Há um bloco cor-de-rosa que fica à escuta de um pin.'],
            ['dica', 'Arrasta «no pin P1 premido» para a área cinzenta.'],
          ],
          corrigido: 'O pin já está à escuta!',
        },
        {
          id: 'sem_tom',
          ativa: a => !a.eventosDe('pino:').some(e => tem(e, 'mk_tom')),
          pistas: [
            ['curiosa', 'Já sente o toque. E que nota é que toca?'],
            ['dica', 'Usa o bloco vermelho que toca uma nota.'],
            ['dica', 'Põe «tocar tom» dentro de «no pin P1 premido».'],
          ],
          corrigido: 'Já toca!',
        },
      ],
      sucesso: 'Uma banana musical! Isto é que é gambiarra.',
      extensao: 'Liga outra fruta ao pin 0 e faz um piano de duas notas!',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"></block><block type="mk_tom" x="340" y="90"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value></block></xml>',
        pedido: 'A minha banana está calada! Fiz alguma gambiarra mal feita?',
      },
    },

    // ---------------------------------------------------------- 6 · Luz de fora
    {
      boasVindas: ['boas_vindas', 'Último desafio: uma luz de verdade, fora do micro:bit, que acende com a música.'],
      parecePronto: a => a.eventosDe('pino:').some(e => e.plano.some(p => p.tipo === 'mk_digital' && p.v === 1) && e.plano.some(p => p.tipo === 'mk_digital' && p.v === 0) && tem(e, 'mk_tom')),
      testar: 'Parece-me bem! Toca no pin 1 e olha para o LED.',
      regras: [
        {
          id: 'sem_digital',
          ativa: a => !a.eventosDe('pino:').some(e => tem(e, 'mk_digital')),
          pistas: [
            ['curiosa', 'Como é que o micro:bit manda energia para o LED?'],
            ['dica', 'Há um bloco vermelho-escuro dos pinos que liga e desliga.'],
            ['dica', 'Põe «gravação digital pin P2 para 1» antes da nota.'],
          ],
          corrigido: 'Já mandas energia para o LED!',
        },
        {
          id: 'nunca_apaga',
          ativa: a => a.eventosDe('pino:').some(e => e.plano.some(p => p.tipo === 'mk_digital' && p.v === 1)) && !a.eventosDe('pino:').some(e => e.plano.some(p => p.tipo === 'mk_digital' && p.v === 0)),
          pistas: [
            ['surpreendida', 'O LED acende… e fica aceso para sempre!'],
            ['dica', 'Para desligar, o mesmo bloco usa outro número.'],
            ['dica', 'Põe «gravação digital pin P2 para 0» depois da nota.'],
          ],
          corrigido: 'Agora acende e apaga!',
        },
        {
          id: 'ordem_trocada',
          ativa: a => a.eventosDe('pino:').some(e => {
            const i1 = e.plano.findIndex(p => p.tipo === 'mk_digital' && p.v === 1);
            const i0 = e.plano.findIndex(p => p.tipo === 'mk_digital' && p.v === 0);
            return i1 >= 0 && i0 >= 0 && i0 < i1;
          }),
          pistas: [
            ['a_pensar', 'Primeiro apagas e só depois acendes? Lê os blocos de cima para baixo.'],
            ['dica', 'A ordem conta: acender, tocar, apagar.'],
            ['dica', 'Troca: o «para 1» em cima da nota e o «para 0» por baixo.'],
          ],
          corrigido: 'Ordem certinha!',
        },
      ],
      sucesso: 'Luz e música! Fizeste o teu primeiro circuito com o micro:bit.',
      extensao: 'E se a luz piscasse três vezes enquanto toca?',
      gambiarra: {
        xml: '<xml><block type="mk_pino_tocado" x="40" y="40"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value><next><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></next></block></next></block></statement></block></xml>',
        pedido: 'O meu LED nunca se apaga! Acho que fiz uma gambiarra… Encontras o erro?',
      },
    },

    // ---------------------------------------------------------- livre
    {
      boasVindas: ['celebrar', 'Agora tens todos os blocos. Inventa o teu brinquedo! Se precisares de mim, estou aqui.'],
      parecePronto: () => false,
      testar: '',
      regras: [],
      sucesso: '',
      extensao: '',
    },
  ];

  // Mensagens que não dependem do desafio
  const GERAIS = {
    convite: ['curiosa', 'Precisas de uma ajudinha? Carrega em «Ajuda».'],
    calma: ['calma', 'Respira fundo… Não funcionou à primeira? A mim também não. Queres uma pista?'],
    semPistas: ['incentivar', 'Estás no bom caminho. Experimenta e vê o que acontece!'],
    vazio: ['curiosa', 'A área cinzenta está vazia. Que tal arrastar o primeiro bloco da coluna branca?'],
    testeFalhou: ['a_pensar', 'Hmm… ainda não é bem isso. Olha para o micro:bit: o que é que ele fez?'],
    gambiarraObrigada: ['celebrar', 'Obrigada! Reparaste a minha gambiarra. És mesmo maker!'],
  };

  F.GABI = { DESAFIOS, COMUNS, GERAIS };
})();
