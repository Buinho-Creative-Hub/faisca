/* Missão «Reparar» — reparação e sustentabilidade.
 *
 * Perceber um circuito para o arranjar, em vez de deitar fora. Liga ao trabalho do Buinho em
 * repairability (Rural Eco-Clubs, repair cafés). Nível 1: diagnosticar (detetive dos circuitos);
 * nível 2: substituir uma peça avariada (interruptor novo para uma lanterna).
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const { icones, tem, soltoCom } = F.ajudasTutor;
  const { causou } = F.verif;

  const temSinalSom = ev => tem(ev, 'mk_tom') || tem(ev, 'mk_som');
  const pinos = a => a.eventosDe('pino:');
  const digitais = ev => ev ? ev.plano.filter(p => p.tipo === 'mk_digital') : [];

  const DETETIVE =
// ---------------------------------------------------------- 1 · Detetive dos circuitos
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
        boasVindas: ['boas_vindas', '{ola} Caso novo! Há brinquedos que não funcionam e ninguém sabe porquê. Vamos fazer um detetive de circuitos para descobrir onde a eletricidade se perde?'],
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
    };

  const LANTERNA =
{
      titulo: 'Lanterna remendada',
      missao: 'O interruptor da lanterna partiu-se. Faz um novo com o micro:bit: A acende, B apaga.',
      passos: [
        'LED com crocodilos: perna comprida no pin 2, perna curta no GND.',
        'No botão A: «gravação digital pin P2 para 1». No botão B: «para 0».',
        'Experimenta: carrega em A e depois em B.',
      ],
      material: 'micro:bit, um LED (ou a lâmpada da lanterna), 2 crocodilos',
      novos: ['mk_botao', 'mk_botao_B', 'mk_digital_1', 'mk_digital_0'],
      teste: 'botao:A',
      // comportamento: o A deixa a luz ACESA (último valor 1) e o B deixa-a APAGADA (último valor 0), no mesmo pino
      ok: r => {
        const fica = v => s => { const d = s.filter(x => x.startsWith('digital:')); return d.length > 0 && d[d.length - 1].endsWith(':' + v); };
        const pinoDe = (ent, v) => {
          let p = null;
          causou(r, s => { const d = s.filter(x => x.startsWith('digital:')); if (d.length && d[d.length - 1].endsWith(':' + v)) { p = d[d.length - 1].split(':')[1]; return true; } return false; }, x => x === ent);
          return p;
        };
        return causou(r, fica(1), v => v === 'botao:A') && causou(r, fica(0), v => v === 'botao:B') &&
          pinoDe('botao:A', 1) === pinoDe('botao:B', 0);
      },
      tutor: {
        boasVindas: ['boas_vindas', 'Esta lanterna não acende: o interruptor partiu-se. Deitar fora? Nada disso! Vamos fazer-lhe um interruptor novo.'],
        parecePronto: a => digitais(a.evento('botao:A')).some(p => p.v === 1) && digitais(a.evento('botao:B')).some(p => p.v === 0),
        testar: 'Tens uma ideia? Vamos testar! Carrega em A e depois em B.',
        regras: [
          {
            id: 'sem_botoes',
            ativa: a => !a.evento('botao:A') && !a.evento('botao:B'),
            pistas: [
              ['curiosa', 'Um interruptor tem duas posições: ligado e desligado. O que é que no micro:bit pode fazer de interruptor?'],
              ['dica', 'Os botões A e B! Procura o bloco cor-de-rosa «no botão premido».'],
              ['dica', 'Arrasta dois «no botão premido»: um com A e outro com B.'],
            ],
            corrigido: 'Boa, já tens botões à escuta!',
          },
          {
            id: 'trocados',
            ativa: a => digitais(a.evento('botao:A')).some(p => p.v === 0) && digitais(a.evento('botao:B')).some(p => p.v === 1) &&
              !digitais(a.evento('botao:A')).some(p => p.v === 1),
            pistas: [
              ['surpreendida', 'Ui! Então o A apaga e o B acende? A missão pede ao contrário.'],
              ['dica', '«para 1» quer dizer ligado; «para 0» quer dizer desligado.'],
              ['dica', 'Põe o «para 1» no botão A e o «para 0» no botão B.'],
            ],
            corrigido: 'Agora sim, A acende e B apaga!',
          },
          {
            id: 'so_um_botao',
            ativa: a => !a.evento('botao:A') || !a.evento('botao:B'),
            pistas: [
              ['a_pensar', 'Um botão para acender… e para apagar, como fazes?'],
              ['dica', 'Precisas de dois blocos «no botão premido». No segundo, muda a letra.'],
              ['dica', 'Junta outro «no botão premido» e escolhe a letra que falta (A ou B).'],
            ],
            corrigido: 'Dois botões, um interruptor completo!',
          },
          {
            id: 'sinal_fora',
            ativa: a => !digitais(a.evento('botao:A')).length && !digitais(a.evento('botao:B')).length && soltoCom(a, 'mk_digital'),
            pistas: [
              ['a_pensar', 'Os blocos da luz estão cá fora. Quando é que eles vão correr?'],
              ['dica', 'Tudo o que fica fora de um bloco cor-de-rosa nunca corre.'],
              ['dica', 'Encaixa «para 1» dentro do botão A e «para 0» dentro do botão B.'],
            ],
            corrigido: 'Agora estão no sítio certo!',
          },
          {
            id: 'sem_acender',
            ativa: a => !digitais(a.evento('botao:A')).some(p => p.v === 1),
            pistas: [
              ['curiosa', 'Carregas no A… e a luz? Quem é que lhe manda acender?'],
              ['dica', 'Há um bloco vermelho-escuro que liga ou desliga um pino: «gravação digital».'],
              ['dica', 'Põe «gravação digital pin P2 para 1» dentro do botão A.'],
            ],
            corrigido: 'Luz! O A já acende.',
          },
          {
            id: 'a_pisca',
            ativa: a => { const d = digitais(a.evento('botao:A')); return d.length > 0 && d[d.length - 1].v === 0; },
            pistas: [
              ['a_pensar', 'O A acende… e logo a seguir apaga. Lê os blocos do A de cima para baixo.'],
              ['dica', 'No botão A, o último bloco de luz tem de deixar a luz ligada.'],
              ['dica', 'Tira o «para 0» do botão A: esse fica para o B.'],
            ],
            corrigido: 'Agora a luz fica acesa!',
          },
          {
            id: 'sem_apagar',
            ativa: a => !digitais(a.evento('botao:B')).some(p => p.v === 0),
            pistas: [
              ['curiosa', 'A luz acende. E agora, como é que se poupa a pilha?'],
              ['dica', 'O botão B também precisa de um «gravação digital», mas com outro número.'],
              ['dica', 'Põe «gravação digital pin P2 para 0» dentro do botão B.'],
            ],
            corrigido: 'Isso, o B já apaga!',
          },
          {
            id: 'pinos_diferentes',
            ativa: a => {
              const pa = digitais(a.evento('botao:A')).filter(p => p.v === 1).map(p => p.pino);
              const pb = digitais(a.evento('botao:B')).filter(p => p.v === 0).map(p => p.pino);
              return pa.length && pb.length && !pa.some(p => pb.includes(p));
            },
            pistas: [
              ['surpreendida', 'Acendes num pino e apagas noutro? A luz está ligada a qual?'],
              ['dica', 'O LED está no pin 2: os dois botões têm de mexer no mesmo pino.'],
              ['dica', 'Escolhe P2 nos dois blocos «gravação digital».'],
            ],
            corrigido: 'Mesmo pino, interruptor a sério!',
          },
        ],
        sucesso: 'Lanterna remendada! Em vez de deitar fora, percebeste o circuito e arranjaste outra maneira de o ligar. Isto é reparar.',
        extensao: 'E se a lanterna fizesse SOS quando carregas em A+B? Três piscas curtos, três longos, três curtos.',
        gambiarra: {
          xml: '<xml><block type="mk_botao" x="40" y="40"><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block><block type="mk_botao" x="40" y="200"><field name="B">B</field><statement name="DO"><block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block></statement></block></xml>',
          pedido: 'Remendei a minha lanterna… mas agora ela nunca apaga! Carrego no B e nada. Onde está a gambiarra?',
        },
      },
    };

  F.registarMissao({
    id: 'reparar',
    titulo: 'Reparar',
    tema: 'Reparação e sustentabilidade',
    descricao: 'Descobre onde um circuito está aberto e dá uma segunda vida a uma lanterna avariada.',
    cor: '#fa6415',
    niveis: [
      { nome: 'Nível 1 · Diagnosticar', desafios: [DETETIVE] },
      { nome: 'Nível 2 · Substituir a peça', desafios: [LANTERNA] },
    ],
  });
})();
