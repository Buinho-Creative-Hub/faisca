/* Pacote Nico — Nico, o Podengo do Buinho Educativo (Messejana, Alentejo).
 *
 * O Nico é uma homenagem a um pequeno podengo que vivia na rua do Buinho, em Messejana.
 * Pequeno inventor alentejano: curioso, brincalhão, um bocadinho trapalhão, persistente.
 * Erra e aprende com os erros — e deixa a criança reparar as gambiarras dele.
 *
 * Mesmo motor da Gabi (js/). Aqui só há conteúdo: marca, mascote, mensagens e desafios.
 * Cada desafio traz a sua parte pedagógica em «tutor» (ver pacotes/gabi.js para o formato).
 * Escrita: frases curtas; nível 1 pergunta, nível 2 orienta, nível 3 diz o gesto;
 * nunca dar a solução inteira sozinho; tratar por «tu»; o Nico é «ele».
 *
 * Percursos previstos (por validar com os materiais do Buinho Educativo):
 *   programação e robótica · gambiarra e toy hacking · natureza e biodiversidade ·
 *   fabricação digital · reparação e sustentabilidade.
 * Este primeiro pacote: um desafio de programação (Acorda-o) e um de reparação (Detetive dos circuitos).
 *
 * Sprites: PROVISÓRIOS, recortados da prancha aprovada do estilo 4 (img/nico/_referencia-prancha-estilo4.png).
 * Substituir pelos 8 PNG finais em alta resolução, com os mesmos nomes de ficheiro.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const { icones, tem, soltoCom } = F.ajudasTutor;
  const { depois, causou } = F.verif;

  // sinal do detetive: um tom (ou um som) dentro do evento do pino
  const temSinalSom = ev => tem(ev, 'mk_tom') || tem(ev, 'mk_som');
  const pinos = a => a.eventosDe('pino:');

  // ------------------------------------------------------------ comuns
  const COMUNS = [
    {
      id: 'blocos_soltos',
      ativa: a => a.soltos.length > 0,
      pistas: [
        ['a_pensar', 'Tens blocos soltos na área cinzenta. Como é que eles sabem quando começar?'],
        ['dica', 'Os blocos que fazem coisas só correm dentro de um bloco cor-de-rosa.'],
        ['dica', 'Arrasta os blocos soltos para dentro da boca de um bloco cor-de-rosa.'],
      ],
      corrigido: 'Isso! Agora já sabem quando começar.',
    },
  ];

  const GERAIS = {
    convite: ['curiosa', 'Precisas de uma ajudinha? Carrega em «Ajuda» e eu vou farejar uma pista.'],
    calma: ['calma', 'Sem pressa… A mim também me sai tudo trocado à primeira. Aprender também é isto. Queres uma pista?'],
    semPistas: ['incentivar', 'Estás no bom caminho. Experimenta e vê o que acontece!'],
    vazio: ['curiosa', 'A área cinzenta está vazia. Que tal arrastar o primeiro bloco da coluna branca?'],
    testeFalhou: ['a_pensar', 'Hmm… ainda não é bem isso. Olha para o micro:bit: o que é que ele fez?'],
    gambiarraObrigada: ['celebrar', 'Boa! Afinal faltava só pôr o bloco no sítio certo. Já podemos inventar outra coisa!'],
    voltarPrograma: ['incentivar', 'De volta ao teu programa. Obrigado pela ajuda!'],
  };

  // ------------------------------------------------------------ desafios
  const DESAFIOS = [
    // ---------------------------------------------------------- 1 · Acorda-o (programação)
    {
      titulo: 'Acorda-o',
      missao: 'O micro:bit está a dormir a sesta. Faz com que sorria quando o agitas.',
      passos: ['Arrasta o bloco «em agitar».', 'Põe lá dentro «mostrar ícone» com a cara contente.', 'Experimenta: carrega em AGITAR.'],
      material: 'micro:bit',
      novos: ['mk_agitar', 'mk_icone'],
      teste: 'agitar',
      ok: r => depois(r, 'agitar', s => s.includes('icone:Happy')),
      tutor: {
        boasVindas: ['boas_vindas', 'Olá! Sou o Nico, o podengo do Buinho. Este micro:bit adormeceu… Vamos acordá-lo? Quero vê-lo sorrir quando o agitas.'],
        parecePronto: a => icones(a.evento('agitar'), 'Happy').length > 0,
        testar: 'Tens uma ideia? Vamos testar! Carrega em AGITAR.',
        regras: [
          {
            id: 'sem_agitar',
            ativa: a => !a.evento('agitar'),
            pistas: [
              ['curiosa', 'Como é que o micro:bit vai dar por isso quando o agitas? Há um bloco que fica à escuta…'],
              ['dica', 'Procura na coluna branca um bloco cor-de-rosa que fale em agitar.'],
              ['dica', 'Arrasta «em agitar» para a área cinzenta.'],
            ],
            corrigido: 'Boa! Agora o micro:bit já está de orelhas no ar.',
          },
          {
            id: 'icone_fora',
            ativa: a => !!a.evento('agitar') && icones(a.evento('agitar')).length === 0 && soltoCom(a, 'mk_icone'),
            pistas: [
              ['a_pensar', 'O ícone está ali sozinho… quando é que ele vai aparecer?'],
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
              ['surpreendida', 'Ui! Que cara é essa? A missão pede um sorriso.'],
              ['dica', 'Carrega na setinha ao lado do desenho para escolher outro.'],
              ['dica', 'Escolhe a cara contente na lista do ícone.'],
            ],
            corrigido: 'Agora sim, um sorriso!',
          },
        ],
        sucesso: 'Acordou! E bem-disposto. Fizeste o micro:bit sorrir.',
        extensao: 'E se ele fizesse uma cara diferente quando o agitas outra vez?',
        gambiarra: {
          xml: '<xml><block type="mk_agitar" x="40" y="40"></block><block type="mk_icone" x="320" y="70"><field name="I">Happy</field></block></xml>',
          pedido: 'Ups, fiz uma gambiarra… abano, abano e não acontece nada! Consegues descobrir o que me esqueci?',
        },
      },
    },

    // ---------------------------------------------------------- 2 · O Nico detetive dos circuitos (reparação)
    {
      titulo: 'Detetive dos circuitos',
      missao: 'Transforma o micro:bit num detetive: quando a eletricidade dá a volta toda, ele mostra ✔ e apita.',
      passos: [
        'Crocodilos no pin 1 e no GND: são as duas pontas do detetive.',
        'Dentro de «no pin P1 premido»: «mostrar ícone» ✔ e «tocar tom».',
        'Experimenta: toca no pin 1. Depois, envia para o micro:bit e vai à caça!',
      ],
      material: 'micro:bit, 2 crocodilos, coisas para testar',
      novos: ['mk_pino_tocado', 'mk_icone_sim', 'mk_tom'],
      teste: 'pino:P1',
      // comportamento: depois de o circuito fechar (pino), aparece o ✔ e ouve-se o sinal
      // («causou»: o sinal tem de vir do pino, não de outra entrada logo a seguir, como agitar)
      ok: r => causou(r, s => s.includes('icone:Yes') && s.some(x => x.startsWith('tom:') || x.startsWith('som:')), v => v.startsWith('pino:')),
      tutor: {
        boasVindas: ['boas_vindas', 'Caso novo! Há brinquedos que não funcionam e ninguém sabe porquê. Vamos fazer um detetive de circuitos para descobrir onde a eletricidade se perde?'],
        parecePronto: a => pinos(a).some(e => icones(e, 'Yes').length > 0 && temSinalSom(e)),
        testar: 'Tens uma ideia? Vamos testar! Toca no pin 1, como se fechasses o circuito.',
        regras: [
          {
            id: 'sem_pino',
            ativa: a => pinos(a).length === 0,
            pistas: [
              ['curiosa', 'Olha lá… será que a eletricidade consegue dar a volta toda? Como é que o micro:bit vai dar por isso?'],
              ['dica', 'Quando o circuito fecha, é como se carregasses num pino. Procura o bloco cor-de-rosa que fala em pin.'],
              ['dica', 'Arrasta «no pin P1 premido» para a área cinzenta.'],
            ],
            corrigido: 'Boa! O detetive já está de orelhas no ar.',
          },
          {
            id: 'sinal_fora',
            ativa: a => pinos(a).length > 0 && !pinos(a).some(e => icones(e).length || temSinalSom(e)) &&
              (soltoCom(a, 'mk_icone') || soltoCom(a, 'mk_tom')),
            pistas: [
              ['a_pensar', 'O sinal está cá fora, sozinho. Quando é que ele vai acontecer?'],
              ['dica', 'Tudo o que fica fora do bloco cor-de-rosa nunca corre.'],
              ['dica', 'Encaixa o ícone e o tom dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Agora estão no sítio certo!',
          },
          {
            id: 'sem_sinal',
            ativa: a => pinos(a).length > 0 && !pinos(a).some(e => icones(e).length || temSinalSom(e)),
            pistas: [
              ['curiosa', 'O circuito fechou… e como é que o detetive nos avisa?'],
              ['dica', 'Um detetive pode mostrar um desenho nas luzes e fazer um som.'],
              ['dica', 'Põe «mostrar ícone» com o ✔ e «tocar tom» dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Isso, agora o detetive já dá sinal!',
          },
          {
            id: 'sem_icone',
            ativa: a => pinos(a).some(temSinalSom) && !pinos(a).some(e => icones(e).length > 0),
            pistas: [
              ['curiosa', 'Já se ouve o apito! Mas com o barulho da sala… e se ele também mostrasse um sinal nas luzes?'],
              ['dica', 'Há um bloco azul que desenha nas luzes. Escolhe o desenho que quer dizer «sim».'],
              ['dica', 'Põe «mostrar ícone» com o ✔ dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Agora vê-se e ouve-se!',
          },
          {
            id: 'sem_visto',
            ativa: a => pinos(a).some(e => icones(e).length > 0) && !pinos(a).some(e => icones(e, 'Yes').length > 0),
            pistas: [
              ['surpreendida', 'Ui! Esse desenho quer dizer que o circuito está fechado?'],
              ['dica', 'Há um desenho que é mesmo um «sim»: um visto.'],
              ['dica', 'Na lista do ícone, escolhe o visto ✔.'],
            ],
            corrigido: 'Isso, um visto! Toda a gente percebe.',
          },
          {
            id: 'sem_som',
            ativa: a => pinos(a).some(e => icones(e, 'Yes').length > 0) && !pinos(a).some(temSinalSom),
            pistas: [
              ['a_pensar', 'Quando estás a olhar para os fios e não para o micro:bit, como sabes que o circuito fechou?'],
              ['dica', 'Um detetive que apita avisa mesmo de olhos ocupados. Procura um bloco laranja de música.'],
              ['dica', 'Põe «tocar tom» por baixo do ✔, dentro de «no pin P1 premido».'],
            ],
            corrigido: 'Agora ouve-se! Já podes olhar para os fios.',
          },
        ],
        sucesso: 'Temos detetive! Quando a eletricidade dá a volta toda, o circuito fecha e o micro:bit avisa. Agora o caso a sério: um brinquedo ou uma lanterna que não acende. Testa fio a fio: onde é que o circuito está aberto?',
        extensao: 'Testa coisas da sala e faz dois montes na mesa: as que deixam a eletricidade passar e as que não deixam. Surpresa: tu também conduzes!',
        gambiarra: {
          xml: '<xml><block type="mk_agitar" x="40" y="40"><statement name="DO"><block type="mk_icone"><field name="I">Yes</field><next><block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">523</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value></block></next></block></statement></block></xml>',
          pedido: 'Fiz o meu detetive… mas ele só apita quando abano a mesa! Fecho o circuito e nada. Encontras a minha gambiarra?',
        },
      },
    },

    // ---------------------------------------------------------- livre
    {
      titulo: 'Inventa',
      missao: 'Agora é contigo: inventa uma engenhoca para Messejana.',
      passos: ['Tens mais blocos: botões, logotipo, sons, pausas, «para sempre» e «se… então… senão».', 'Experimenta «se está escuro»: no ecrã, carrega em APAGAR A LUZ.'],
      material: 'o que tiveres',
      novos: ['mk_botao', 'mk_logo', 'mk_som', 'mk_pausa', 'mk_repetir', 'mk_sempre', 'mk_se', 'mk_escuro', 'mk_limpar'],
      livre: true,
      ok: () => false,
      tutor: {
        boasVindas: ['testar', 'Tens uma ideia? Vamos testar! Tens blocos novos para inventar. Se precisares de mim, estou aqui.'],
        parecePronto: () => false,
        testar: '',
        regras: [],
        sucesso: '',
        extensao: '',
      },
    },
  ];

  F.registarPacote({
    id: 'nico',
    titulo: 'Nico · Desafios do Buinho Educativo',
    hex: 'nico',
    marca: {
      nome: 'Nico',
      sub: 'desafios do Buinho Educativo',
      icone: '<img src="img/nico/01_boas_vindas.png" alt="" aria-hidden="true">',
    },
    mascote: {
      nome: 'Nico',
      descricao: 'Nico, o podengo do Buinho Educativo',
      artigo: 'o',
      pasta: 'img/nico/',
      sprites: {
        boas_vindas: '01_boas_vindas', curiosa: '02_curioso', a_pensar: '03_a_pensar', surpreendida: '04_surpreendido',
        dica: '05_a_dar_uma_dica', celebrar: '06_a_celebrar', incentivar: '06_a_celebrar',
        testar: '07_a_inventar', inventar: '07_a_inventar', calma: '08_trapalhao_calmo',
      },
    },
    comuns: COMUNS,
    gerais: GERAIS,
    desafios: DESAFIOS,
  });
})();
