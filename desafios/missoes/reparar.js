/* Missão «Reparar» — reparação e sustentabilidade.
 *
 * Perceber um circuito para o arranjar, em vez de deitar fora. Liga ao trabalho do Buinho em
 * repairability (Repair Café, Rural Eco-Clubs, «Repairability as a social inclusion tool»).
 *   Nível 1 · Diagnosticar      — detetive, bip contínuo, condutividade, condutor/isolante, pilha, fio a fio, ficha
 *   Nível 2 · Substituir a peça — lanterna, campainha, luz de escada, candeeiro automático, servo, alarme, peluche
 *   Nível 3 · Melhorar e cuidar — contador do Repair Café, poupar energia, sobreaquecimento, registo, brinquedo, livre
 * Material real: micro:bit V2, crocodilos, LEDs, suporte de pilhas, alumínio, água/sal, servo SG90, objetos avariados.
 * Textos para qualquer mascote: {ola}, [o|a], ou { nico: '…', gabi: '…', _: '…' }.
 * As gambiarras (programas com um erro) são geradas em testes/casos/reparar.js (G) — mudar lá e copiar para aqui.
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
      caixa: ['mk_pino_tocado', 'mk_icone_sim', 'mk_tom'],   // a mesma caixa de antes (só o detetive antes dela)
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


  // ============================================================ ajudas desta missão
  const { blocos, dentro } = F.ajudasTutor;
  const { aposSensor, houve, numeros } = F.verif;
  const P = F.pistas;
  const ev1 = (a, chave) => a.evento(chave);
  const ses = ev => ev ? ev.plano.filter(p => p.tipo === 'mk_se' || p.tipo === 'mk_se_entao') : [];
  const usa = (p, tipo) => (p.usa || []).some(u => u.tipo === tipo);
  // valor de verdade de «leitor ⋄ número» quando o leitor vale x (null se não der para saber)
  function verdade(p, leitor, x) {
    const u = p.usa || [];
    const c = u.find(e => e.tipo === 'mk_comparar');
    const iL = u.findIndex(e => e.tipo === leitor), iN = u.findIndex(e => e.tipo === 'mk_num');
    if (!c || iL < 0 || iN < 0) return null;
    const n = u[iN].n, [A, B] = iL < iN ? [x, n] : [n, x];
    switch (c.op) { case '<': return A < B; case '>': return A > B; case '==': return A === B; case '<=': return A <= B; case '>=': return A >= B; case '!=': return A !== B; }
    return null;
  }
  // por cada vez que a entrada aconteceu: o estado do sensor nesse momento e as saídas até à entrada seguinte
  function porEstado(reg, sensor, entradaOk) {
    const out = [];
    let estado;
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in') continue;
      if (e.v.startsWith(sensor + ':')) estado = Number(e.v.split(':').pop());
      if (!entradaOk(e.v)) continue;
      const s = [];
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) s.push(reg[j].v);
      out.push({ estado, saidas: s });
    }
    return out;
  }
  const temTom = s => s.some(x => x.startsWith('tom:') || x.startsWith('som:'));
  const temIcone = s => s.some(x => x.startsWith('icone:'));
  // depois da entrada: liga (…:1) e só desliga (…:0) passado pelo menos minMs
  function acendeEApaga(reg, entrada, minMs) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      let t1 = null;
      for (let j = i + 1; j < reg.length && reg[j].dir === 'out'; j++) {
        const v = reg[j].v;
        if (/^digital:P\d:1$/.test(v) && t1 === null) t1 = reg[j].t;
        else if (/^digital:P\d:0$/.test(v) && t1 !== null) return reg[j].t - t1 >= minMs;
      }
    }
    return false;
  }
  const regraSempre = pergunta => P.evento('sempre', pergunta, 'Boa, agora repete sem parar!');
  const regraSemSe = (chave, pergunta) => P.regra('sem_se', a => !!ev1(a, chave) && ses(ev1(a, chave)).length === 0, [
    pergunta, 'Há um bloco verde-azulado que só faz uma coisa quando é verdade: «se … então».', 'Põe um «se … então» dentro de «' + P.nomeEvento(chave) + '».'], 'Isso! Agora o micro:bit decide.');

  // ============================================================ Nível 1 · Diagnosticar
  const BIP = {
    titulo: 'Bip contínuo',
    missao: 'Um testador que apita sem parar enquanto o circuito está fechado.',
    passos: ['Crocodilo no pin 0 e outro no 3V: são as pontas do testador.', '«para sempre»: se a leitura digital do pin 0 = 1, toca um tom.', 'Experimenta: no ecrã, fecha e abre o pin 0.'],
    material: 'micro:bit, 2 crocodilos, fios e peças para testar',
    novos: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_ler_digital', 'mk_tom'],
    caixa: [],
    teste: 'digital:P0',
    // fechado (1) → apita; aberto (0) → silêncio
    ok: r => aposSensor(r, 'digital:P0', v => v === 1, temTom) && aposSensor(r, 'digital:P0', v => v === 0, s => !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'O detetive só apita uma vez. Para seguir um fio comprido dava jeito um testador que apita enquanto o circuito estiver fechado!'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 1) === true && verdade(p, 'mk_ler_digital', 0) === false) && tem(ev1(a, 'sempre'), 'mk_tom'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0 no ecrã e depois abre-o.',
      regras: [
        regraSempre('O testador tem de estar sempre a vigiar o circuito. Que bloco repete sem parar?'),
        regraSemSe('sempre', 'Apitar sempre não serve para nada… como é que o micro:bit escolhe quando apitar?'),
        P.regra('sem_leitura', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_ler_digital')), [
          'Como é que o micro:bit sabe se o circuito está fechado?',
          'Há um bloco vermelho-escuro que lê um pino: dá 1 se está fechado e 0 se está aberto.',
          'Põe «leitura digital pin P0 = 1» no buraco do «se».'], 'Agora ele lê o circuito!'),
        P.bloco('sempre', 'mk_tom', 'O micro:bit já sabe quando o circuito fecha. E como é que te avisa?'),
        P.regra('invertido', a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 0) === true && verdade(p, 'mk_ler_digital', 1) === false), [
          ['surpreendida', 'Ui! Apita quando o circuito está aberto?'],
          '1 quer dizer fechado, 0 quer dizer aberto.',
          'Muda o número da comparação para 1.'], 'Agora apita no sítio certo!'),
      ],
      sucesso: 'Bip contínuo! Agora podes passar as pontas ao longo de um fio e ouvir onde a eletricidade deixa de passar.',
      extensao: 'E se, quando o circuito está aberto, aparecesse um ✗ no ecrã?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">523</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'O meu testador apita quando o fio está partido e cala-se quando está bom! Ajudas-me a descobrir porquê?' },
    },
  };

  const CONDUTIVIDADE = {
    titulo: 'Medidor de condutividade',
    missao: 'Mede quanta eletricidade passa e mostra-o num gráfico de barras.',
    passos: ['Crocodilo no pin 1 e outro no 3V; mete as pontas na água, depois em água com sal.', '«para sempre»: desenhar gráfico de barras da leitura analógica do pin 1 até 1023.', 'Experimenta: mexe no pin 1 (analógico) no ecrã.'],
    material: 'micro:bit, 2 crocodilos, 2 copos de água, sal, um lápis afiado nas duas pontas',
    novos: ['mk_ler_analogico', 'mk_grafico'],
    caixa: ['mk_sempre', 'mk_mostrar_numero'],
    teste: 'analogico:P1',
    ok: r => aposSensor(r, 'analogico:P1', v => v >= 900, s => s.some(x => /^grafico:(2[0-5])$/.test(x))) &&
      aposSensor(r, 'analogico:P1', v => v <= 400, s => s.some(x => /^grafico:([0-9]|1[0-2])$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Nem tudo deixa passar a eletricidade da mesma maneira. Água, água com sal, um lápis… Vamos medir quanto passa!'],
      parecePronto: a => blocos(ev1(a, 'sempre'), 'mk_grafico').some(p => p.max === 1023) && dentro(ev1(a, 'sempre'), 'mk_grafico', 'mk_ler_analogico'),
      testar: 'Tens uma ideia? Vamos testar! Sobe e desce o pin 1 (analógico) no ecrã.',
      regras: [
        regraSempre('A medida muda a toda a hora. Como é que o gráfico se mantém atualizado?'),
        P.bloco('sempre', 'mk_grafico', 'Um número sozinho é difícil de comparar. Que tal desenhar barras?'),
        P.valorEm('sempre', 'mk_grafico', 'mk_ler_analogico', 'O gráfico desenha o quê? Quem é que mede a eletricidade que passa?'),
        P.regra('maximo_errado', a => blocos(ev1(a, 'sempre'), 'mk_grafico').some(p => p.max !== 1023) && dentro(ev1(a, 'sempre'), 'mk_grafico', 'mk_ler_analogico'), [
          'O gráfico fica sempre cheio… até onde vai a leitura analógica?',
          'A leitura analógica vai de 0 a 1023.',
          'No gráfico, muda o «até» para 1023.'], 'Agora as barras sobem e descem!'),
      ],
      sucesso: 'Com sal passa muito mais eletricidade! Os metais e a água salgada são bons condutores; o plástico quase não deixa passar nada.',
      extensao: 'Experimenta com sumo de limão, com terra molhada e com terra seca. Qual conduz melhor?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_grafico\"><value name=\"V\"><block type=\"mk_ler_analogico\"><field name=\"P\">P1</field></block></value><value name=\"MAX\"><shadow type=\"mk_num\"><field name=\"NUM\">255</field></shadow></value></block></statement></block></xml>", pedido: 'O meu medidor está sempre no máximo, com água ou sem água! Que gambiarra fiz?' },
    },
  };

  const CONDUTOR = {
    titulo: 'Condutor ou isolante?',
    missao: 'Carrega no A para testar um objeto: ✔ se a eletricidade passa, ✗ se não passa.',
    passos: ['Pontas no pin 0 e no 3V; encosta-as a um objeto.', 'No botão A: se a leitura digital do pin 0 = 1, mostra ✔, senão mostra ✗.', 'Experimenta: fecha o pin 0 e carrega em A; abre-o e carrega outra vez.'],
    material: 'micro:bit, 2 crocodilos, colher, borracha, papel de alumínio, lápis, moeda',
    novos: ['mk_se_senao', 'mk_icone_nao'],
    caixa: ['mk_botao', 'mk_comparar', 'mk_ler_digital', 'mk_icone_sim'],
    teste: 'botao:A',
    ok: r => {
      const t = porEstado(r, 'digital:P0', v => v === 'botao:A');
      return t.some(e => e.estado === 1 && e.saidas.includes('icone:Yes')) && t.some(e => e.estado === 0 && e.saidas.includes('icone:No')) &&
        !t.some(e => (e.estado === 1 && e.saidas.includes('icone:No')) || (e.estado === 0 && e.saidas.includes('icone:Yes')));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Vamos separar as coisas em dois montes: as que deixam passar a eletricidade e as que não deixam.'],
      parecePronto: a => ses(ev1(a, 'botao:A')).some(p => p.tipo === 'mk_se' && usa(p, 'mk_ler_digital')) && blocos(ev1(a, 'botao:A'), 'mk_icone').some(p => p.icone === 'No') && blocos(ev1(a, 'botao:A'), 'mk_icone').some(p => p.icone === 'Yes'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0, carrega em A; abre, carrega outra vez.',
      regras: [
        P.evento('botao:A', 'Quando é que o micro:bit faz o teste?'),
        regraSemSe('botao:A', 'O resultado depende do objeto… como é que o micro:bit escolhe entre ✔ e ✗?'),
        P.regra('sem_leitura', a => ses(ev1(a, 'botao:A')).length > 0 && !ses(ev1(a, 'botao:A')).some(p => usa(p, 'mk_ler_digital')), [
          'O «se» pergunta o quê? Quem é que sabe se a eletricidade passa?',
          'A «leitura digital pin P0» dá 1 quando passa e 0 quando não passa.',
          'Põe «leitura digital pin P0 = 1» no buraco do «se».'], 'Agora pergunta ao circuito!'),
        P.regra('trocados', a => ses(ev1(a, 'botao:A')).some(p => {
          if (p.tipo !== 'mk_se') return false;
          const v1 = verdade(p, 'mk_ler_digital', 1);
          if (v1 === null) return false;
          const ramo = v1 ? p.sim : p.nao;
          return (ramo || []).some(x => x.icone === 'No');
        }), [['surpreendida', 'Ui! Passa eletricidade e aparece ✗?'], 'Lê o «se» em voz alta: «se passa… então…».', 'Troca os desenhos: ✔ em cima, ✗ em baixo.'], 'Agora sim!'),
        P.regra('falta_nao', a => !!ev1(a, 'botao:A') && !blocos(ev1(a, 'botao:A'), 'mk_icone').some(p => p.icone === 'No'), [
          'E quando a eletricidade não passa, o que aparece?',
          'O «senão» é para quando a resposta é não.',
          'Põe «mostrar ícone» ✗ dentro do «senão».'], 'Agora há resposta para os dois casos!'),
      ],
      sucesso: 'Já sabes separar condutores de isolantes! Os fios têm metal por dentro (condutor) e plástico por fora (isolante) — por isso não apanhas choque.',
      extensao: 'Faz uma tabela com 10 objetos da sala. Há algum que te tenha surpreendido?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_icone\"><field name=\"I\">No</field></block></statement><statement name=\"NAO\"><block type=\"mk_icone\"><field name=\"I\">Yes</field></block></statement></block></statement></block></xml>", pedido: 'O meu testador diz que a colher não deixa passar eletricidade e que a borracha deixa! Encontras a gambiarra?' },
    },
  };

  const PILHA = {
    titulo: 'Pilha cansada',
    missao: 'Mede uma pilha e mostra o número: uma pilha boa dá mais, uma cansada dá menos.',
    passos: ['Só pilhas pequenas (até 2 de 1,5 V)! O + no pin 1, o − no GND.', 'No botão A: mostrar número da leitura analógica do pin 1.', 'Experimenta: muda o pin 1 (analógico) no ecrã e carrega em A.'],
    material: 'micro:bit, 2 crocodilos, suporte com 1 ou 2 pilhas AA (novas e gastas)',
    novos: ['mk_mostrar_numero'],
    caixa: ['mk_botao', 'mk_ler_analogico', 'mk_icone_triste', 'mk_icone'],
    teste: 'botao:A',
    ok: r => {
      const t = porEstado(r, 'analogico:P1', v => v === 'botao:A').filter(e => e.estado !== undefined && e.saidas.includes('numero:' + e.estado));
      return new Set(t.map(e => e.estado)).size >= 2;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'Muitas vezes o brinquedo não está avariado: é só a pilha que está cansada. Vamos fazer um medidor de pilhas!'],
      parecePronto: a => dentro(ev1(a, 'botao:A'), 'mk_mostrar_numero', 'mk_ler_analogico') && blocos(ev1(a, 'botao:A'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_ler_analogico' && u.pino === 'P1')),
      testar: 'Tens uma ideia? Vamos testar! Muda o pin 1 e carrega em A.',
      regras: [
        P.evento('botao:A', 'Quando é que o micro:bit mede a pilha?'),
        P.bloco('botao:A', 'mk_mostrar_numero', 'Queremos ver quanto vale a pilha. Como é que o micro:bit mostra um número?'),
        P.valorEm('botao:A', 'mk_mostrar_numero', 'mk_ler_analogico', 'O número tem de vir da pilha. Quem é que mede quanta eletricidade chega ao pino?'),
        P.regra('pino_errado', a => blocos(ev1(a, 'botao:A'), 'mk_mostrar_numero').some(p => (p.usa || []).some(u => u.tipo === 'mk_ler_analogico' && u.pino !== 'P1')), [
          'A pilha está ligada a que pino?', 'O + da pilha está no pin 1.', 'Na leitura analógica, escolhe P1.'], 'Pino certo!'),
      ],
      sucesso: 'Medidor feito! Uma pilha nova dá perto de 900; se der menos de 600 já está cansada. Recarregável ou pilhão, nunca no lixo!',
      extensao: 'Junta um «se»: se o número for menor que 600, mostra a cara triste.',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_ler_analogico\"><field name=\"P\">P0</field></block></value></block></statement></block></xml>", pedido: 'O meu medidor diz sempre 0, mesmo com pilhas novas! O que é que eu liguei mal no programa?' },
    },
  };

  const FIOS = {
    titulo: 'Fio a fio',
    missao: 'Conta os troços de fio que já testaste: cada toque no pin 1 soma um.',
    passos: ['Divide o fio avariado em troços e testa um de cada vez.', 'No pin 1: muda contador em 1 e mostra o número do contador.', 'Experimenta: toca 3 vezes no pin 1.'],
    material: 'micro:bit, crocodilos, um cabo ou fio com uma parte partida',
    novos: ['mk_var_mudar', 'mk_var'],
    caixa: ['mk_pino_tocado', 'mk_mostrar_numero', 'mk_iniciar', 'mk_var_definir'],
    teste: 'pino:P1',
    ok: r => { const n = numeros(r).join(','); return /(^|,)1,2,3(,|$)/.test(n); },
    tutor: {
      boasVindas: ['boas_vindas', 'Um bom detetive não se perde: conta os troços que já testou. Vamos usar uma variável para contar!'],
      parecePronto: a => P.evs(a, 'pino:').some(e => {
        const i = e.plano.findIndex(p => p.tipo === 'mk_var_mudar'), j = e.plano.findIndex(p => p.tipo === 'mk_mostrar_numero' && (p.usa || []).some(u => u.tipo === 'mk_var'));
        return i >= 0 && j > i;
      }),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1 três vezes.',
      regras: [
        P.evento('pino:', 'Cada teste é um toque nas pontas. Que bloco fica à escuta desse toque?'),
        P.bloco('pino:', 'mk_var_mudar', 'Para contar, o número tem de crescer a cada toque. Como é que se soma 1?'),
        P.bloco('pino:', 'mk_mostrar_numero', 'O micro:bit já conta… mas como é que tu vês a conta?'),
        P.valorEm('pino:', 'mk_mostrar_numero', 'mk_var', 'O número que aparece é sempre o mesmo? Onde é que está guardada a conta?'),
        P.regra('ordem', a => P.evs(a, 'pino:').some(e => {
          const i = e.plano.findIndex(p => p.tipo === 'mk_var_mudar'), j = e.plano.findIndex(p => p.tipo === 'mk_mostrar_numero');
          return i >= 0 && j >= 0 && j < i;
        }), ['O número aparece sempre atrasado… o que acontece primeiro?', 'Os blocos correm de cima para baixo.', 'Põe o «mudar contador» por cima do «mostrar número».'], 'Agora a conta está em dia!'),
      ],
      sucesso: 'Conta certa! Testar troço a troço e tomar nota é o método dos reparadores: nunca testas o mesmo duas vezes.',
      extensao: 'E se o botão B pusesse o contador outra vez a 0, para começar outro fio?',
      gambiarra: { xml: "<xml><block type=\"mk_pino_tocado\" x=\"40\" y=\"160\"><field name=\"P\">P1</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value><next><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement></block></xml>", pedido: 'O meu contador anda sempre um atrás! Toquei 3 vezes e diz 2. Que gambiarra é esta?' },
    },
  };

  const FICHA = {
    titulo: 'Ficha de diagnóstico',
    missao: 'Guarda o resultado de cada teste numa tabela: 1 se passa, 0 se não passa.',
    passos: ['Pontas no pin 0 e no 3V.', 'No botão A: registar dados «fio» = leitura digital do pin 0.', 'Experimenta: fecha o pin 0 e carrega em A, abre e carrega outra vez.'],
    material: 'micro:bit V2, 2 crocodilos, peças para testar',
    novos: ['mk_registar'],
    caixa: ['mk_botao', 'mk_ler_digital', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => {
      const t = porEstado(r, 'digital:P0', v => v === 'botao:A');
      const certo = e => e.saidas.some(x => /^registo:[^:]*:/.test(x) && x.endsWith(':' + e.estado));
      return t.some(e => e.estado === 1 && certo(e)) && t.some(e => e.estado === 0 && certo(e));
    },
    tutor: {
      boasVindas: ['boas_vindas', 'No Repair Café cada objeto tem uma ficha. O micro:bit V2 pode guardar uma tabela com os teus testes!'],
      parecePronto: a => dentro(ev1(a, 'botao:A'), 'mk_registar', 'mk_ler_digital'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0, carrega em A; abre, carrega outra vez.',
      regras: [
        P.evento('botao:A', 'Quando é que o micro:bit guarda um resultado?'),
        P.bloco('botao:A', 'mk_registar', 'Mostrar o número é bom, mas desaparece. Como é que o micro:bit guarda para mais tarde?'),
        P.valorEm('botao:A', 'mk_registar', 'mk_ler_digital', 'O que fica na tabela tem de vir do teste. Quem é que sabe se passa ou não passa?'),
      ],
      sucesso: 'Ficha guardada! Liga o micro:bit ao computador e abre o ficheiro MY_DATA na pasta MICROBIT: lá está a tua tabela.',
      extensao: 'Regista também o número do troço (com a variável contador) para saberes onde está o fio partido.',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">fio</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block></xml>", pedido: 'A minha ficha diz sempre 1, mesmo quando o fio está partido! Ajudas-me?' },
    },
  };

  // ============================================================ Nível 2 · Substituir a peça
  const CAMPAINHA = {
    titulo: 'Campainha nova',
    missao: 'O botão da campainha partiu-se: faz um novo com papel de alumínio que toca e mostra um sinal.',
    passos: ['Dois quadrados de alumínio: um no pin 1, outro no GND. Carregar = juntar os dois.', 'No pin 1: tocar som e mostrar um ícone (para quem não ouve bem).', 'Experimenta: toca no pin 1.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, cartão, esponja',
    novos: ['mk_som'],
    caixa: ['mk_pino_tocado', 'mk_icone', 'mk_tom'],
    teste: 'pino:P1',
    ok: r => F.verif.causou(r, s => temTom(s) && temIcone(s), v => v.startsWith('pino:')),
    tutor: {
      boasVindas: ['boas_vindas', 'Esta campainha tinha o botão partido. Em vez de comprar outra, vamos fazer um botão novo com alumínio!'],
      parecePronto: a => P.evs(a, 'pino:').some(e => (tem(e, 'mk_som') || tem(e, 'mk_tom')) && tem(e, 'mk_icone')),
      testar: 'Tens uma ideia? Vamos testar! Toca no pin 1.',
      regras: [
        P.evento('pino:', 'O botão novo é feito de alumínio ligado ao pin 1. Que bloco fica à escuta desse pino?'),
        P.regra('sem_som', a => P.evs(a, 'pino:').length > 0 && !P.evs(a, 'pino:').some(e => tem(e, 'mk_som') || tem(e, 'mk_tom')), [
          'Uma campainha que não toca… o que lhe falta?', 'Há blocos laranja de música.', 'Põe «tocar som» dentro de «no pin P1 premido».'], 'Ding-dong!'),
        P.bloco('pino:', 'mk_icone', 'E quem não ouve bem? Como é que também vê que alguém tocou?'),
      ],
      sucesso: 'Campainha reparada — e ainda ficou melhor: agora também avisa com luzes! Reparar também é melhorar.',
      extensao: 'E se a campainha tocasse um som diferente quando o botão é carregado duas vezes seguidas?',
      gambiarra: { xml: "<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">hello</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Surprised</field></block></next></block></statement></block></xml>", pedido: 'Montei a minha campainha… mas ela só toca quando mexo no logotipo! Que gambiarra é esta?' },
    },
  };

  const ESCADA = {
    titulo: 'Luz de escada',
    missao: 'Como a luz da escada de um prédio: carregas no A, acende e apaga sozinha passados 2 segundos.',
    passos: ['LED: perna comprida no pin 2, perna curta no GND.', 'No botão A: pin P2 para 1, pausa 2000, pin P2 para 0.', 'Experimenta: carrega em A e espera.'],
    material: 'micro:bit, LED, 2 crocodilos',
    novos: ['mk_pausa'],
    caixa: ['mk_botao', 'mk_digital_1', 'mk_digital_0'],
    teste: 'botao:A',
    ok: r => acendeEApaga(r, 'botao:A', 1500),
    tutor: {
      boasVindas: ['boas_vindas', 'A luz da escada estava sempre acesa e gastava muita energia. Vamos fazer um interruptor com temporizador!'],
      parecePronto: a => {
        const p = (ev1(a, 'botao:A') || { plano: [] }).plano;
        const i1 = p.findIndex(x => x.tipo === 'mk_digital' && x.v === 1), i0 = p.findIndex((x, k) => k > i1 && x.tipo === 'mk_digital' && x.v === 0);
        return i1 >= 0 && i0 > i1 && p.some((x, k) => k > i1 && k < i0 && x.tipo === 'mk_pausa' && x.ms >= 1000);
      },
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e conta até 2.',
      regras: [
        P.evento('botao:A', 'Quem carrega no interruptor? Que bloco fica à escuta?'),
        P.regra('sem_acender', a => !blocos(ev1(a, 'botao:A'), 'mk_digital').some(p => p.v === 1), [
          'Carregas no A… e quem manda a luz acender?', 'O bloco vermelho-escuro «gravação digital» liga um pino.', 'Põe «gravação digital pin P2 para 1» no botão A.'], 'Luz!'),
        P.regra('sem_apagar', a => { const p = blocos(ev1(a, 'botao:A'), 'mk_digital'); const i = p.findIndex(x => x.v === 1); return !p.some((x, k) => k > i && x.v === 0); }, [
          'A luz acende… e fica acesa para sempre. O que falta no fim?', 'Depois de acender, é preciso desligar o pino.', 'Põe «gravação digital pin P2 para 0» no fim.'], 'Agora apaga!'),
        P.regra('sem_pausa', a => { const p = (ev1(a, 'botao:A') || { plano: [] }).plano; const i1 = p.findIndex(x => x.tipo === 'mk_digital' && x.v === 1); const i0 = p.findIndex((x, k) => k > i1 && x.tipo === 'mk_digital' && x.v === 0); return i1 >= 0 && i0 > i1 && !p.some((x, k) => k > i1 && k < i0 && x.tipo === 'mk_pausa'); }, [
          'Acende e apaga tão depressa que nem se vê! O que falta entre os dois?', 'Há um bloco azul para esperar.', 'Põe «pausa (ms)» entre o acender e o apagar.'], 'Agora dá tempo de subir a escada!'),
        P.regra('pausa_curta', a => { const p = (ev1(a, 'botao:A') || { plano: [] }).plano; return p.some(x => x.tipo === 'mk_pausa' && x.ms < 1000); }, [
          'Dá tempo de subir a escada?', '1000 ms são 1 segundo.', 'Escolhe 2000 na pausa.'], 'Tempo certo!'),
      ],
      sucesso: 'Luz de escada a funcionar! Assim a luz nunca fica esquecida acesa: poupa energia e pilhas.',
      extensao: 'E se o LED piscasse no último meio segundo, para avisar que vai apagar?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></next></block></statement></block></xml>", pedido: 'A minha luz de escada nem chega a acender… ou acende e apaga num piscar de olhos? Ajudas-me?' },
    },
  };

  const CANDEEIRO = {
    titulo: 'Candeeiro automático',
    missao: 'O interruptor do candeeiro avariou: agora é a luz da sala que manda — escuro acende, claro apaga.',
    passos: ['LED: perna comprida no pin 2, perna curta no GND.', '«para sempre»: se está escuro, pin P2 para 1; senão, pin P2 para 0.', 'Experimenta: baixa e sobe a luz no ecrã.'],
    material: 'micro:bit, LED, 2 crocodilos (o ecrã do micro:bit mede a luz)',
    novos: ['mk_se'],
    caixa: ['mk_sempre', 'mk_digital_1', 'mk_digital_0'],
    teste: 'luz',
    ok: r => aposSensor(r, 'luz', v => v < 40, s => s.some(x => /^digital:P\d:1$/.test(x))) && aposSensor(r, 'luz', v => v >= 40, s => s.some(x => /^digital:P\d:0$/.test(x))) &&
      !aposSensor(r, 'luz', v => v < 40, s => s.some(x => /^digital:P\d:0$/.test(x))),
    tutor: {
      boasVindas: ['boas_vindas', 'Este candeeiro tinha o interruptor partido. E se ele acendesse sozinho quando fica escuro?'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se' && usa(p, 'mk_escuro') && (p.sim || []).some(x => x.v === 1) && (p.nao || []).some(x => x.v === 0)),
      testar: 'Tens uma ideia? Vamos testar! Baixa a luz no ecrã até ao fim e depois sobe-a.',
      regras: [
        regraSempre('A luz da sala muda devagarinho. Como é que o candeeiro está sempre a vigiar?'),
        regraSemSe('sempre', 'O candeeiro tem de decidir: acender ou apagar? Que bloco decide?'),
        P.regra('trocados', a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se' && (p.sim || []).some(x => x.v === 0) && (p.nao || []).some(x => x.v === 1)), [
          ['surpreendida', 'Ui! Acende de dia e apaga de noite?'], 'Lê em voz alta: «se está escuro, então…».', 'Troca: «para 1» em cima, «para 0» no «senão».'], 'Agora está certo!'),
        P.regra('sem_acender', a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se') && !ses(ev1(a, 'sempre')).some(p => (p.sim || []).some(x => x.tipo === 'mk_digital' && x.v === 1)), [
          'Quando está escuro, o que deve acontecer à luz?', 'A parte de cima do «se» é para quando está escuro.', 'Põe «gravação digital pin P2 para 1» na parte de cima.'], 'Acende no escuro!'),
        P.regra('sem_apagar', a => ses(ev1(a, 'sempre')).some(p => p.tipo === 'mk_se') && !ses(ev1(a, 'sempre')).some(p => (p.nao || []).some(x => x.tipo === 'mk_digital' && x.v === 0)), [
          'E quando volta a ficar claro? A luz fica acesa a gastar?', 'O «senão» é para quando não está escuro.', 'Põe «gravação digital pin P2 para 0» no «senão».'], 'Agora poupa energia!'),
      ],
      sucesso: 'Candeeiro automático! Trocaste um interruptor partido por um sensor. As luzes das ruas funcionam assim.',
      extensao: 'Em vez de «está escuro», usa «nível de luz < 80» e descobre qual é o melhor número para a tua sala.',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se\"><value name=\"C\"><block type=\"mk_escuro\"></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement><statement name=\"NAO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'O meu candeeiro acende de dia e apaga de noite! Que gambiarra fiz?' },
    },
  };

  const SERVO = {
    titulo: 'Motor novo',
    missao: 'O motor da cancela do brinquedo avariou: põe um servo — A abre (180°), B fecha (0°).',
    passos: ['Servo: fio castanho no GND, vermelho no 3V, laranja no pin 0.', 'No A: escrever servo pin P0 para 180. No B: para 0.', 'Experimenta: A e depois B.'],
    material: 'micro:bit, servo SG90, 3 crocodilos, cartão e palitos para a cancela',
    novos: ['mk_servo'],
    caixa: ['mk_botao', 'mk_botao_B'],
    teste: 'botao:A',
    ok: r => {
      let pa = null, pb = null;
      F.verif.causou(r, s => s.some(x => { const m = x.match(/^servo:(P\d):(\d+)$/); if (m && Number(m[2]) >= 150) { pa = m[1]; return true; } return false; }), v => v === 'botao:A');
      F.verif.causou(r, s => s.some(x => { const m = x.match(/^servo:(P\d):(\d+)$/); if (m && Number(m[2]) <= 30) { pb = m[1]; return true; } return false; }), v => v === 'botao:B');
      return pa !== null && pa === pb;
    },
    tutor: {
      boasVindas: ['boas_vindas', 'A cancela deste brinquedo já não levanta: o motor queimou. Vamos dar-lhe um servo, um motor que sabe para onde rodar!'],
      parecePronto: a => blocos(ev1(a, 'botao:A'), 'mk_servo').some(p => p.angulo >= 150) && blocos(ev1(a, 'botao:B'), 'mk_servo').some(p => p.angulo <= 30),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e depois em B.',
      regras: [
        P.regra('sem_botoes', a => !ev1(a, 'botao:A') && !ev1(a, 'botao:B'), [
          'Abrir e fechar são duas ordens. O que é que no micro:bit pode dar duas ordens?', 'Os botões A e B!', 'Arrasta «no botão A premido» e «no botão B premido».'], 'Botões prontos!'),
        P.regra('so_um_botao', a => !ev1(a, 'botao:A') || !ev1(a, 'botao:B'), [
          'Abre… e para fechar?', 'Precisas dos dois botões.', 'Junta o «no botão premido» que falta (A ou B).'], 'Dois botões!'),
        P.bloco('botao:A', 'mk_servo', 'Carregas no A… quem é que roda a cancela?'),
        P.bloco('botao:B', 'mk_servo', 'E no B? A cancela também tem de voltar.'),
        P.regra('angulos_iguais', a => { const x = blocos(ev1(a, 'botao:A'), 'mk_servo')[0], y = blocos(ev1(a, 'botao:B'), 'mk_servo')[0]; return !!x && !!y && x.angulo === y.angulo; }, [
          ['surpreendida', 'A e B mandam o servo para o mesmo sítio?'], 'O ângulo diz para onde roda: 0 é um lado, 180 é o outro.', 'Põe 180 no A e 0 no B.'], 'Abre e fecha!'),
      ],
      sucesso: 'Cancela a funcionar! Um servo é um motor com «memória»: roda até ao ângulo que lhe pedes e fica lá.',
      extensao: 'E se a cancela abrisse devagar, de 30 em 30 graus, com pausas?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block></xml>", pedido: 'A minha cancela abre… mas nunca mais fecha! Carrego no B e nada. Encontras a gambiarra?' },
    },
  };

  const PORTA = {
    titulo: 'Alarme da porta',
    missao: 'Dois bocados de alumínio fecham o circuito quando a porta está fechada; se a porta abrir, o alarme toca.',
    passos: ['Alumínio na porta (pin 0) e no aro (3V): porta fechada = circuito fechado.', '«para sempre»: se a leitura digital do pin 0 = 0, toca um tom.', 'Experimenta: fecha o pin 0 (porta fechada) e depois abre-o.'],
    material: 'micro:bit, 2 crocodilos, papel de alumínio, fita-cola, uma caixa com tampa',
    novos: [],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_ler_digital', 'mk_tom'],
    teste: 'digital:P0',
    // fechada (1) → silêncio; aberta (0) → alarme
    ok: r => aposSensor(r, 'digital:P0', v => v === 0, temTom) && aposSensor(r, 'digital:P0', v => v === 1, s => !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'Agora ao contrário: o circuito fechado quer dizer que está tudo bem. Quando abre, há alarme!'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 0) === true && verdade(p, 'mk_ler_digital', 1) === false) && tem(ev1(a, 'sempre'), 'mk_tom'),
      testar: 'Tens uma ideia? Vamos testar! Fecha o pin 0 e depois abre-o.',
      regras: [
        regraSempre('Um alarme nunca dorme. Que bloco vigia sem parar?'),
        regraSemSe('sempre', 'O alarme só pode tocar às vezes. Como é que o micro:bit decide?'),
        P.regra('sem_leitura', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_ler_digital')), [
          'Como é que o micro:bit sabe se a porta está aberta?', 'A leitura digital do pin 0 diz 1 (fechado) ou 0 (aberto).', 'Põe «leitura digital pin P0 = 0» no buraco do «se».'], 'Agora vigia a porta!'),
        P.bloco('sempre', 'mk_tom', 'O micro:bit já sabe quando a porta abre. E como é que dá o alarme?'),
        P.regra('invertido', a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_ler_digital', 1) === true && verdade(p, 'mk_ler_digital', 0) === false), [
          ['surpreendida', 'Ui! O alarme toca com a porta fechada?'], 'Porta aberta = circuito aberto = 0.', 'Muda o número da comparação para 0.'], 'Alarme no sítio certo!'),
      ],
      sucesso: 'Alarme pronto! É o mesmo circuito do bip, mas ao contrário: aqui o perigo é o circuito abrir.',
      extensao: 'E se, em vez de um tom, tocasse três tons diferentes, como uma sirene?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">==</field><value name=\"A\"><block type=\"mk_ler_digital\"><field name=\"P\">P0</field></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">880</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'O meu alarme toca quando a porta está fechada e cala-se quando abro! Ajudas-me?' },
    },
  };

  const PELUCHE = {
    titulo: 'Peluche com voz nova',
    missao: 'A caixa de voz do peluche avariou: mete lá o micro:bit — festa no logotipo, ele ri-se e sorri.',
    passos: ['O micro:bit vai dentro do peluche; o logotipo fica junto à barriga.', '«ao logotipo pressionado»: tocar som e mostrar um ícone.', 'Experimenta: toca no logotipo.'],
    material: 'micro:bit V2 com pilhas, um peluche com a voz avariada',
    novos: [],
    caixa: ['mk_logo', 'mk_som', 'mk_icone', 'mk_agitar'],
    teste: 'logo',
    ok: r => F.verif.causou(r, s => temTom(s) && temIcone(s), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Este peluche era mudo desde que a caixa de voz avariou. Vamos dar-lhe uma voz nova!'],
      parecePronto: a => (tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')) && tem(ev1(a, 'logo'), 'mk_icone'),
      testar: 'Tens uma ideia? Vamos testar! Faz festa no logotipo.',
      regras: [
        P.evento('logo', 'A festa na barriga é um toque no logotipo dourado. Que bloco fica à escuta?'),
        P.regra('sem_som', a => !!ev1(a, 'logo') && !(tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')), [
          'Uma voz nova… que não se ouve?', 'Os blocos laranja de música fazem sons.', 'Põe «tocar som» dentro de «ao logotipo pressionado».'], 'Já tem voz!'),
        P.bloco('logo', 'mk_icone', 'E a cara do peluche? Como é que ele mostra que gostou?'),
      ],
      sucesso: 'O peluche voltou a falar! Muitos brinquedos vão para o lixo só por uma peça avariada.',
      extensao: 'E se ficasse tonto quando o abanas (em agitar), com outro som?',
      gambiarra: { xml: "<xml><block type=\"mk_agitar\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">giggle</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">Happy</field></block></next></block></statement></block></xml>", pedido: 'O meu peluche só se ri quando o abano com força, nunca com festinhas! Que gambiarra é esta?' },
    },
  };

  // ============================================================ Nível 3 · Melhorar e cuidar
  const CONTADOR = {
    titulo: 'Contador do Repair Café',
    missao: 'No Repair Café: cada objeto reparado é um toque no A; o B mostra quantos já se salvaram do lixo.',
    passos: ['No botão A: mudar contador em 1.', 'No botão B: mostrar número do contador.', 'Experimenta: A e B; depois A, A e B outra vez.'],
    material: 'micro:bit',
    novos: ['mk_iniciar', 'mk_var_definir'],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_mostrar_numero'],
    teste: 'botao:A',
    // a conta tem de crescer: depois de 1 objeto mostra 1, depois de 3 mostra 3
    ok: r => F.verif.causou(r, s => s.includes('numero:1'), v => v === 'botao:B') && F.verif.causou(r, s => s.includes('numero:3'), v => v === 'botao:B'),
    tutor: {
      boasVindas: ['boas_vindas', 'No Repair Café arranjam-se torradeiras, candeeiros, brinquedos… Vamos contar quantos objetos se salvam do lixo!'],
      parecePronto: a => tem(ev1(a, 'botao:A'), 'mk_var_mudar') && dentro(ev1(a, 'botao:B'), 'mk_mostrar_numero', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! A, A, A… e depois B.',
      regras: [
        P.evento('botao:A', 'Quando um objeto fica reparado, o que é que carregas?'),
        P.regra('usa_definir', a => tem(ev1(a, 'botao:A'), 'mk_var_definir') && !tem(ev1(a, 'botao:A'), 'mk_var_mudar'), [
          'Carregas três vezes e o contador fica sempre igual… porquê?', '«definir» guarda sempre o mesmo número; «mudar» soma.', 'No botão A, troca o «definir» por «mudar contador em 1».'], 'Agora soma!'),
        P.bloco('botao:A', 'mk_var_mudar', 'Para contar, o número tem de crescer. Como é que se soma 1?'),
        P.evento('botao:B', 'E para ver o total, que botão usas?'),
        P.bloco('botao:B', 'mk_mostrar_numero', 'O total está guardado. Como é que o micro:bit o mostra?'),
        P.valorEm('botao:B', 'mk_mostrar_numero', 'mk_var', 'Aparece sempre o mesmo número? Onde está guardada a conta?'),
      ],
      sucesso: 'Contador a funcionar! Cada objeto reparado é lixo a menos e dinheiro poupado.',
      extensao: 'Usa «no arranque» para pôr o contador a 0, e o logotipo para mostrar um coração por cada 10 objetos.',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_definir\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_mostrar_numero\"><value name=\"N\"><block type=\"mk_var\"><field name=\"VAR\">contador</field></block></value></block></statement></block></xml>", pedido: 'Reparámos três objetos mas o meu contador diz 1! Que gambiarra fiz?' },
    },
  };

  const POUPAR = {
    titulo: 'Poupar energia',
    missao: 'A luz acende no A e apaga sozinha passados 3 segundos — o micro:bit vai vendo o relógio.',
    passos: ['No A: P2 para 1 e definir medida para tempo de execução.', '«para sempre»: se tempo de execução − medida > 3000, P2 para 0.', 'Experimenta: carrega em A e espera.'],
    material: 'micro:bit, LED, 2 crocodilos',
    novos: ['mk_tempo', 'mk_conta', 'mk_comparar', 'mk_se_entao'],
    caixa: ['mk_botao', 'mk_digital_1', 'mk_digital_0', 'mk_sempre', 'mk_var_definir', 'mk_var'],
    teste: 'botao:A',
    ok: r => acendeEApaga(r, 'botao:A', 2000),
    tutor: {
      boasVindas: ['boas_vindas', 'A luz de escada usava uma pausa e o micro:bit ficava parado. Agora vamos fazer melhor: ele vai olhando para o relógio!'],
      parecePronto: a => tem(ev1(a, 'botao:A'), 'mk_digital') && dentro(ev1(a, 'botao:A'), 'mk_var_definir', 'mk_tempo') &&
        ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta') && usa(p, 'mk_tempo') && (p.usa || []).some(u => u.op === '>' || u.op === '>=')) && blocos(ev1(a, 'sempre'), 'mk_digital').some(p => p.v === 0),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A e conta até 3.',
      regras: [
        P.evento('botao:A', 'Quem acende a luz?'),
        P.regra('a_sem_acender', a => !blocos(ev1(a, 'botao:A'), 'mk_digital').some(p => p.v === 1), [
          'Carregas no A e a luz… nada?', 'O bloco vermelho-escuro «gravação digital» liga o pino.', 'Põe «gravação digital pin P2 para 1» no botão A.'], 'Luz!'),
        P.regra('sem_guardar_tempo', a => !dentro(ev1(a, 'botao:A'), 'mk_var_definir', 'mk_tempo'), [
          'Para saber quando passaram 3 segundos, de quando é que tens de te lembrar?', 'Guarda a hora em que acendeu: «definir medida para tempo de execução».', 'No A, junta «definir medida para» com «tempo de execução» lá dentro.'], 'Hora guardada!'),
        P.evento('sempre', 'Quem vai olhando para o relógio enquanto a luz está acesa?'),
        regraSemSe('sempre', 'A luz só pode apagar quando já passou o tempo. Que bloco decide?'),
        P.regra('sem_conta', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta')), [
          'Quanto tempo passou desde que acendeu? Como se calcula?', 'Tempo de agora − tempo guardado = tempo que passou.', 'No «se», compara «tempo de execução − medida» com 3000.'], 'Boa conta!'),
        P.regra('sinal_trocado', a => ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_conta') && (p.usa || []).some(u => u.op === '<' || u.op === '<=')), [
          ['surpreendida', 'Ui! Apaga logo, sem esperar?'], 'Queremos apagar quando o tempo que passou é MAIOR do que 3000.', 'Muda o «<» para «>».'], 'Agora espera!'),
        P.regra('sem_apagar', a => ses(ev1(a, 'sempre')).length > 0 && !blocos(ev1(a, 'sempre'), 'mk_digital').some(p => p.v === 0), [
          'O tempo passa… e quem apaga a luz?', 'Dentro do «se» é que se apaga.', 'Põe «gravação digital pin P2 para 0» dentro do «se».'], 'Apaga sozinha!'),
      ],
      sucesso: 'Poupança automática! Enquanto espera, o micro:bit está livre para fazer outras coisas — é assim que funcionam os temporizadores a sério.',
      extensao: 'E se o botão B desse mais 3 segundos de luz sem apagar?',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_var_definir\"><field name=\"VAR\">medida</field><value name=\"V\"><block type=\"mk_tempo\"></block></value></block></next></block></statement></block><block type=\"mk_sempre\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_conta\"><field name=\"OP\">-</field><value name=\"A\"><block type=\"mk_tempo\"></block></value><value name=\"B\"><block type=\"mk_var\"><field name=\"VAR\">medida</field></block></value></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">3000</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">0</field></shadow></value></block></statement></block></statement></block></xml>", pedido: 'A minha luz apaga logo, nem dá para ver! Onde está a gambiarra?' },
    },
  };

  const CALOR = {
    titulo: 'Alarme de sobreaquecimento',
    missao: 'Carregadores e ferros de soldar aquecem: se a temperatura passar de 40 °C, o micro:bit dá o alarme.',
    passos: ['«para sempre»: se temperatura > 40, então tocar tom e mostrar ✗.', 'O sensor de temperatura está dentro do micro:bit.', 'Experimenta: sobe a temperatura no ecrã.'],
    material: 'micro:bit (e, para testar a sério, a tua mão a aquecê-lo)',
    novos: ['mk_temperatura'],
    caixa: ['mk_sempre', 'mk_se_entao', 'mk_comparar', 'mk_tom', 'mk_icone_nao'],
    teste: 'temperatura',
    ok: r => aposSensor(r, 'temperatura', v => v > 40, s => temTom(s) && temIcone(s)) && aposSensor(r, 'temperatura', v => v <= 40, s => !temTom(s)),
    tutor: {
      boasVindas: ['boas_vindas', 'Um aparelho que aquece demais pode estragar-se… ou ser perigoso. Vamos fazer um vigilante do calor!'],
      parecePronto: a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_temperatura', 45) === true && verdade(p, 'mk_temperatura', 25) === false) && tem(ev1(a, 'sempre'), 'mk_tom'),
      testar: 'Tens uma ideia? Vamos testar! Sobe a temperatura acima de 40.',
      regras: [
        regraSempre('O vigilante tem de estar sempre atento. Que bloco repete sem parar?'),
        regraSemSe('sempre', 'O alarme só pode tocar quando está quente. Como é que o micro:bit decide?'),
        P.regra('sem_temperatura', a => ses(ev1(a, 'sempre')).length > 0 && !ses(ev1(a, 'sempre')).some(p => usa(p, 'mk_temperatura')), [
          'O «se» está a perguntar o quê? Quem mede o calor?', 'Há um bloco cor-de-rosa «temperatura (°C)».', 'Põe «temperatura (°C) > 40» no buraco do «se».'], 'Agora mede o calor!'),
        P.bloco('sempre', 'mk_tom', 'Um alarme silencioso não serve. Como é que avisa toda a gente?'),
        P.regra('sinal_trocado', a => ses(ev1(a, 'sempre')).some(p => verdade(p, 'mk_temperatura', 25) === true && verdade(p, 'mk_temperatura', 45) === false), [
          ['surpreendida', 'Ui! O alarme toca quando está fresco?'], '«>» quer dizer maior do que.', 'Usa «temperatura > 40».'], 'Alarme no sítio certo!'),
      ],
      sucesso: 'Vigilante do calor pronto! Muitas avarias começam com aquecimento: perceber isso cedo salva o aparelho.',
      extensao: 'Experimenta 28 °C e aquece o micro:bit com as mãos. Quanto tempo demora?',
      gambiarra: { xml: "<xml><block type=\"mk_sempre\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_se_entao\"><value name=\"C\"><block type=\"mk_comparar\"><field name=\"OP\">&lt;</field><value name=\"A\"><block type=\"mk_temperatura\"></block></value><value name=\"B\"><shadow type=\"mk_num\"><field name=\"NUM\">40</field></shadow></value></block></value><statement name=\"SIM\"><block type=\"mk_tom\"><value name=\"F\"><shadow type=\"mk_nota_menu\"><field name=\"V\">880</field></shadow></value><value name=\"BAT\"><shadow type=\"mk_batida_menu\"><field name=\"V\">1</field></shadow></value><next><block type=\"mk_icone\"><field name=\"I\">No</field></block></next></block></statement></block></statement></block></xml>", pedido: 'O meu alarme toca no frio e cala-se quando aquece! Ajudas-me?' },
    },
  };

  const REGISTO = {
    titulo: 'Registo de reparações',
    missao: 'A guarda «reparado» e B guarda «reciclado», cada um com a sua conta, numa tabela.',
    passos: ['No A: mudar contador em 1 e registar dados «reparado» = contador.', 'No B: mudar pontos em 1 e registar dados «reciclado» = pontos.', 'Experimenta: A, A, B.'],
    material: 'micro:bit V2',
    novos: [],
    caixa: ['mk_botao', 'mk_botao_B', 'mk_var_mudar', 'mk_var', 'mk_registar', 'mk_iniciar', 'mk_var_definir', 'mk_mostrar_numero'],
    teste: 'botao:A',
    ok: r => houve(r, /^registo:[^:]*repar[^:]*:2$/i) && houve(r, /^registo:[^:]*recicl[^:]*:1$/i),
    tutor: {
      boasVindas: ['boas_vindas', 'O que não tem arranjo vai para a reciclagem. Vamos guardar as duas contas numa tabela, para saber como correu o dia!'],
      parecePronto: a => tem(ev1(a, 'botao:A'), 'mk_var_mudar') && dentro(ev1(a, 'botao:A'), 'mk_registar', 'mk_var') && tem(ev1(a, 'botao:B'), 'mk_var_mudar') && dentro(ev1(a, 'botao:B'), 'mk_registar', 'mk_var'),
      testar: 'Tens uma ideia? Vamos testar! Carrega em A, A, B.',
      regras: [
        P.evento('botao:A', 'Um objeto foi reparado! Que botão carregas?'),
        P.bloco('botao:A', 'mk_registar', 'Queremos que fique escrito numa tabela. Que bloco guarda dados?'),
        P.bloco('botao:A', 'mk_var_mudar', 'A tabela tem de mostrar a conta a crescer. Quem soma 1?'),
        P.valorEm('botao:A', 'mk_registar', 'mk_var', 'Na tabela aparece sempre 1? Onde está a conta?'),
        P.evento('botao:B', 'E o que vai para a reciclagem? Que botão usas?'),
        P.bloco('botao:B', 'mk_registar', 'O B também tem de escrever na tabela.'),
      ],
      sucesso: 'Tabela do dia feita! Com estes números o Repair Café sabe quanto lixo evitou.',
      extensao: 'No logotipo, mostra a percentagem de objetos reparados (reparados × 100 ÷ total).',
      gambiarra: { xml: "<xml><block type=\"mk_botao\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">contador</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">reparado</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value></block></next></block></statement></block><block type=\"mk_botao\" x=\"40\" y=\"320\"><field name=\"B\">B</field><statement name=\"DO\"><block type=\"mk_var_mudar\"><field name=\"VAR\">pontos</field><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_registar\"><value name=\"NOME\"><shadow type=\"mk_texto\"><field name=\"TXT\">reciclado</field></shadow></value><value name=\"V\"><block type=\"mk_var\"><field name=\"VAR\">pontos</field></block></value></block></next></block></statement></block></xml>", pedido: 'Na minha tabela os reparados ficam sempre a 1! Que gambiarra é esta?' },
    },
  };

  const BRINQUEDO = {
    titulo: 'Brinquedo melhorado',
    missao: 'Repara e melhora um brinquedo: festa no logotipo e ele acende uma luz, faz um som e mexe o braço (servo).',
    passos: ['LED no pin 2, servo no pin 0.', '«ao logotipo pressionado»: P2 para 1, tocar som, servo P0 para 180.', 'Experimenta: toca no logotipo.'],
    material: 'micro:bit V2, LED, servo SG90, crocodilos, um brinquedo velho',
    novos: [],
    caixa: ['mk_logo', 'mk_digital_1', 'mk_som', 'mk_servo', 'mk_pausa', 'mk_icone', 'mk_agitar'],
    teste: 'logo',
    ok: r => F.verif.causou(r, s => s.some(x => /^digital:P\d:1$/.test(x)) && temTom(s) && s.some(x => x.startsWith('servo:')), v => v === 'logo'),
    tutor: {
      boasVindas: ['boas_vindas', 'Último desafio da missão: reparar não é só pôr a funcionar — também pode ser melhorar!'],
      parecePronto: a => blocos(ev1(a, 'logo'), 'mk_digital').some(p => p.v === 1) && (tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')) && tem(ev1(a, 'logo'), 'mk_servo'),
      testar: 'Tens uma ideia? Vamos testar! Toca no logotipo.',
      regras: [
        P.evento('logo', 'O brinquedo reage a festas. Que bloco fica à escuta do logotipo?'),
        P.regra('sem_luz', a => !!ev1(a, 'logo') && !blocos(ev1(a, 'logo'), 'mk_digital').some(p => p.v === 1), [
          'E a luz? O LED está no pin 2…', 'O bloco «gravação digital» liga o pino.', 'Põe «gravação digital pin P2 para 1» no logotipo.'], 'Luz acesa!'),
        P.regra('sem_som', a => !!ev1(a, 'logo') && !(tem(ev1(a, 'logo'), 'mk_som') || tem(ev1(a, 'logo'), 'mk_tom')), [
          'Já tem luz. E voz?', 'Os blocos laranja fazem sons.', 'Põe «tocar som» no logotipo.'], 'Já fala!'),
        P.bloco('logo', 'mk_servo', 'Luz e som… e o braço que mexe?'),
      ],
      sucesso: 'Brinquedo reparado e melhorado! Completaste a missão Reparar: diagnosticar, substituir, melhorar.',
      extensao: 'E se o braço voltasse a baixar depois de uma pausa, como quem diz adeus?',
      gambiarra: { xml: "<xml><block type=\"mk_logo\" x=\"40\" y=\"160\"><statement name=\"DO\"><block type=\"mk_digital\"><value name=\"P\"><shadow type=\"mk_pino_menu\"><field name=\"V\">P2</field></shadow></value><value name=\"V\"><shadow type=\"mk_num\"><field name=\"NUM\">1</field></shadow></value><next><block type=\"mk_som\"><value name=\"S\"><shadow type=\"mk_som_menu\"><field name=\"V\">happy</field></shadow></value></block></next></block></statement></block><block type=\"mk_agitar\" x=\"40\" y=\"320\"><statement name=\"DO\"><block type=\"mk_servo\"><field name=\"P\">P0</field><value name=\"A\"><shadow type=\"mk_num\"><field name=\"NUM\">180</field></shadow></value></block></statement></block></xml>", pedido: 'O meu brinquedo acende e fala, mas o braço só mexe quando o abano! Encontras a gambiarra?' },
    },
  };

  const INVENTA = {
    titulo: 'Inventa uma melhoria',
    missao: 'Escolhe um objeto da tua casa que podia ser melhor e inventa-lhe uma melhoria com o micro:bit.',
    passos: ['Tens os blocos da missão: sensores, luzes, sons, servo, contas e registos.', 'Desenha primeiro a ideia em papel.'],
    material: 'o que tiveres',
    novos: [],
    caixa: ['mk_botao', 'mk_logo', 'mk_sempre', 'mk_se_senao', 'mk_comparar', 'mk_ler_digital', 'mk_temperatura', 'mk_digital_1', 'mk_digital_0', 'mk_servo', 'mk_som', 'mk_icone', 'mk_pausa'],
    livre: true,
    ok: () => false,
    tutor: {
      boasVindas: ['testar', 'Tens uma ideia? Vamos testar! Inventa uma melhoria para um objeto. Se precisares de mim, estou aqui.'],
      parecePronto: () => false,
      testar: '',
      regras: [],
      sucesso: '',
      extensao: '',
    },
  };

  F.registarMissao({
    id: 'reparar',
    titulo: 'Reparar',
    tema: 'Reparação e sustentabilidade',
    descricao: 'Diagnostica circuitos avariados, substitui as peças que falham e melhora os objetos em vez de os deitar fora.',
    cor: '#fa6415',
    niveis: [
      { nome: 'Nível 1 · Diagnosticar', desafios: [DETETIVE, BIP, CONDUTIVIDADE, CONDUTOR, PILHA, FIOS, FICHA] },
      { nome: 'Nível 2 · Substituir a peça', desafios: [LANTERNA, CAMPAINHA, ESCADA, CANDEEIRO, SERVO, PORTA, PELUCHE] },
      { nome: 'Nível 3 · Melhorar e cuidar', desafios: [CONTADOR, POUPAR, CALOR, REGISTO, BRINQUEDO, INVENTA] },
    ],
  });
})();
