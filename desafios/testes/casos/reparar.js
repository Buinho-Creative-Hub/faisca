// Casos de teste da missão «Reparar» (um por desafio com validação, pela ordem).
const { xml, E, seq, solto, b, v, cmp, conta, lerD, lerA, icone, tom, som, digital, numero, pausa, servo, registar, definir, mudar, se, seEntao, grafico } = require('../lib');

const okDetetive = xml(E.pino('P1', seq(icone('Yes'), tom(523))));

// ---- programas «gambiarra» (as mesmas que a missão carrega; geradas aqui e copiadas para missoes/reparar.js)
const G = {
  bip: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0), tom(523))))),
  condutividade: xml(E.sempre(seq(grafico(lerA('P1'), 255)))),
  condutor: xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('No')], [icone('Yes')])))),
  pilha: xml(E.botao('A', seq(numero(lerA('P0'))))),
  fios: xml(E.pino('P1', seq(numero(v('contador')), mudar('contador', 1)))),
  ficha: xml(E.botao('A', seq(registar('fio', 1)))),
  campainha: xml(E.logo(seq(som('hello'), icone('Surprised')))),
  escada: xml(E.botao('A', seq(digital('P2', 1), digital('P2', 0)))),
  candeeiro: xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)])))),
  servo: xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', seq(servo('P0', 180)))),
  porta: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(880))))),
  peluche: xml(E.agitar(seq(som('giggle'), icone('Happy')))),
  contador: xml(E.botao('A', seq(definir('contador', 1))), E.botao('B', seq(numero(v('contador'))))),
  poupar: xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))),
    E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '<', 3000), digital('P2', 0))))),
  calor: xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '<', 40), tom(880), icone('No'))))),
  registo: xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', 1))), E.botao('B', seq(mudar('pontos', 1), registar('reciclado', v('pontos'))))),
  brinquedo: xml(E.logo(seq(digital('P2', 1), som('happy'))), E.agitar(seq(servo('P0', 180)))),
};

// soluções
const S = {
  bip: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(523))))),
  condutividade: xml(E.sempre(seq(grafico(lerA('P1'), 1023)))),
  condutor: xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('Yes')], [icone('No')])))),
  pilha: xml(E.botao('A', seq(numero(lerA('P1'))))),
  fios: xml(E.pino('P1', seq(mudar('contador', 1), numero(v('contador'))))),
  ficha: xml(E.botao('A', seq(registar('fio', lerD('P0'))))),
  campainha: xml(E.pino('P1', seq(som('hello'), icone('Surprised')))),
  escada: xml(E.botao('A', seq(digital('P2', 1), pausa(2000), digital('P2', 0)))),
  candeeiro: xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))),
  servo: xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', seq(servo('P0', 0)))),
  porta: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0), tom(880))))),
  peluche: xml(E.logo(seq(som('giggle'), icone('Happy')))),
  contador: xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(numero(v('contador'))))),
  poupar: xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))),
    E.sempre(seq(seEntao(cmp(conta(b('mk_tempo'), '-', v('medida')), '>', 3000), digital('P2', 0))))),
  calor: xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '>', 40), tom(880), icone('No'))))),
  registo: xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', v('contador')))), E.botao('B', seq(mudar('pontos', 1), registar('reciclado', v('pontos'))))),
  brinquedo: xml(E.logo(seq(digital('P2', 1), som('happy'), servo('P0', 180)))),
};

const P0 = x => ({ 'digital:P0': x });
const A1 = x => ({ 'analogico:P1': x });

module.exports = {
  missao: 'reparar',
  G, S,
  casos: [
    // ================= Nível 1 · Diagnosticar
    {
      ok: okDetetive,
      // a gambiarra: certo por dentro, mas no bloco errado (agitar em vez do pino)
      errado: xml(E.agitar(seq(icone('Yes'), tom(523)))),
      fazer: ['pino:P1', 'agitar'], espera: 1800,
      regras: [
        [xml(E.agitar(seq(icone('Yes')))), 'sem_pino'],
        [xml(E.pino('P1', '')), 'sem_sinal'],
        [xml(E.pino('P1', ''), solto(icone('Yes'))), 'sinal_fora'],
        [xml(E.pino('P1', seq(tom()))), 'sem_icone'],
        [xml(E.pino('P1', seq(icone('Happy'), tom()))), 'sem_visto'],
        [xml(E.pino('P1', seq(icone('Yes')))), 'sem_som'],
        [okDetetive, null],
      ],
    },
    { // bip contínuo
      ok: S.bip,
      errado: [G.bip, xml(E.sempre(seq(tom(523)))), xml(E.inicio(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(523)))))],
      fazer: [P0(1), { esperar: 1200 }, P0(0)], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(tom(523)))), 'sem_sempre'],
        [xml(E.sempre(seq(tom(523)))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(b('mk_escuro'), tom(523))))), 'sem_leitura'],
        [xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1))))), 'sem_tom'],
        [G.bip, 'invertido'],
        [S.bip, null],
      ],
    },
    { // medidor de condutividade
      ok: S.condutividade,
      errado: [G.condutividade, xml(E.sempre(seq(grafico(b('mk_luz'), 1023)))), xml(E.inicio(seq(grafico(lerA('P1'), 1023))))],
      fazer: [A1(1023), { esperar: 400 }, A1(300)], espera: 600,
      regras: [
        [xml(E.botao('A', seq(grafico(lerA('P1'), 1023)))), 'sem_sempre'],
        [xml(E.sempre(seq(numero(lerA('P1'))))), 'sem_mk_grafico_sempre'],
        [xml(E.sempre(seq(grafico(0, 1023)))), 'sem_mk_ler_analogico_em_mk_grafico'],
        [G.condutividade, 'maximo_errado'],
        [S.condutividade, null],
      ],
    },
    { // condutor ou isolante
      ok: S.condutor,
      errado: [G.condutor, xml(E.botao('A', seq(seEntao(cmp(lerD('P0'), '==', 1), icone('Yes'))))), xml(E.botao('A', seq(icone('Yes'))))],
      fazer: [P0(1), 'botao:A', { esperar: 300 }, P0(0), 'botao:A'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(icone('Yes')))), 'sem_botao_A'],
        [xml(E.botao('A', seq(icone('Yes')))), 'sem_se'],
        [xml(E.botao('A', seq(se(b('mk_escuro'), [icone('Yes')], [icone('No')])))), 'sem_leitura'],
        [xml(E.botao('A', seq(se(cmp(lerD('P0'), '==', 1), [icone('Yes')], [])))), 'falta_nao'],
        [G.condutor, 'trocados'],
        [S.condutor, null],
      ],
    },
    { // pilha cansada
      ok: S.pilha,
      errado: [G.pilha, xml(E.botao('A', seq(numero(b('mk_luz'))))), xml(E.botao('A', seq(numero(930))))],
      fazer: [A1(930), 'botao:A', { esperar: 2000 }, A1(250), 'botao:A'], espera: 2000,
      regras: [
        [xml(E.botao('B', seq(numero(lerA('P1'))))), 'sem_botao_A'],
        [xml(E.botao('A', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_A'],
        [xml(E.botao('A', seq(numero(0)))), 'sem_mk_ler_analogico_em_mk_mostrar_numero'],
        [G.pilha, 'pino_errado'],
        [S.pilha, null],
      ],
    },
    { // procurar o fio partido
      ok: S.fios,
      errado: [G.fios, xml(E.pino('P1', seq(definir('contador', 1), numero(v('contador')))))],
      fazer: ['pino:P1', { esperar: 300 }, 'pino:P1', { esperar: 300 }, 'pino:P1'], espera: 600,
      regras: [
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_pino_'],
        [xml(E.pino('P1', seq(numero(v('contador'))))), 'sem_mk_var_mudar_pino_'],
        [xml(E.pino('P1', seq(mudar('contador', 1)))), 'sem_mk_mostrar_numero_pino_'],
        [xml(E.pino('P1', seq(mudar('contador', 1), numero(1)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [G.fios, 'ordem'],
        [S.fios, null],
      ],
    },
    { // ficha de diagnóstico
      ok: S.ficha,
      errado: [G.ficha, xml(E.botao('A', seq(numero(lerD('P0')))))],
      fazer: [P0(1), 'botao:A', { esperar: 200 }, P0(0), 'botao:A'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(registar('fio', lerD('P0'))))), 'sem_botao_A'],
        [xml(E.botao('A', seq(numero(lerD('P0'))))), 'sem_mk_registar_botao_A'],
        [G.ficha, 'sem_mk_ler_digital_em_mk_registar'],
        [S.ficha, null],
      ],
    },
    // ================= Nível 2 · Substituir a peça
    {
      ok: xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 0)))),
      // a gambiarra: o B também acende (a lanterna nunca apaga)
      errado: xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 1)))),
      fazer: ['botao:A', 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(digital('P2', 1)))), 'so_um_botao'],
        [xml(E.botao('A', seq(digital('P2', 0))), E.botao('B', seq(digital('P2', 1)))), 'trocados'],
        [xml(E.botao('A', ''), E.botao('B', '')), 'sem_acender'],
        [xml(E.botao('A', seq(digital('P2', 1), digital('P2', 0))), E.botao('B', seq(digital('P2', 0)))), 'a_pisca'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 1)))), 'sem_apagar'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P1', 0)))), 'pinos_diferentes'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 0)))), null],
      ],
    },
    { // campainha nova
      ok: S.campainha,
      errado: [G.campainha, xml(E.pino('P1', seq(icone('Surprised'))))],
      fazer: ['pino:P1', 'logo'], espera: 1500,
      regras: [
        [G.campainha, 'sem_pino_'],
        [xml(E.pino('P1', seq(icone('Surprised')))), 'sem_som'],
        [xml(E.pino('P1', seq(som('hello')))), 'sem_mk_icone_pino_'],
        [S.campainha, null],
      ],
    },
    { // luz de escada (temporizador)
      ok: S.escada,
      errado: [G.escada, xml(E.botao('A', seq(digital('P2', 1))))],
      fazer: ['botao:A'], espera: 2600,
      regras: [
        [xml(E.botao('B', seq(digital('P2', 1)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(pausa(2000), digital('P2', 0)))), 'sem_acender'],
        [xml(E.botao('A', seq(digital('P2', 1), pausa(2000)))), 'sem_apagar'],
        [G.escada, 'sem_pausa'],
        [xml(E.botao('A', seq(digital('P2', 1), pausa(200), digital('P2', 0)))), 'pausa_curta'],
        [S.escada, null],
      ],
    },
    { // candeeiro automático
      ok: S.candeeiro,
      errado: [G.candeeiro, xml(E.sempre(seq(digital('P2', 1))))],
      fazer: [{ luz: 10 }, { esperar: 500 }, { luz: 200 }], espera: 600,
      regras: [
        [xml(E.botao('A', seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_sempre'],
        [xml(E.sempre(seq(digital('P2', 1)))), 'sem_se'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [], [digital('P2', 0)])))), 'sem_acender'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [])))), 'sem_apagar'],
        [G.candeeiro, 'trocados'],
        [S.candeeiro, null],
      ],
    },
    { // servo no lugar do motor
      ok: S.servo,
      errado: [G.servo, xml(E.botao('A', seq(servo('P0', 180))))],
      fazer: ['botao:A', 'botao:B'], espera: 600,
      regras: [
        [xml(E.logo(seq(servo('P0', 180)))), 'sem_botoes'],
        [xml(E.botao('A', seq(servo('P0', 180)))), 'so_um_botao'],
        [xml(E.botao('A', ''), E.botao('B', seq(servo('P0', 0)))), 'sem_mk_servo_botao_A'],
        [xml(E.botao('A', seq(servo('P0', 180))), E.botao('B', '')), 'sem_mk_servo_botao_B'],
        [G.servo, 'angulos_iguais'],
        [S.servo, null],
      ],
    },
    { // alarme da porta
      ok: S.porta,
      errado: [G.porta, xml(E.sempre(seq(tom(880))))],
      fazer: [P0(1), { esperar: 900 }, P0(0)], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(tom(880)))), 'sem_sempre'],
        [xml(E.sempre(seq(tom(880)))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(b('mk_escuro'), tom(880))))), 'sem_leitura'],
        [xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0))))), 'sem_tom'],
        [G.porta, 'invertido'],
        [S.porta, null],
      ],
    },
    { // peluche com voz nova
      ok: S.peluche,
      errado: [G.peluche, xml(E.logo(seq(icone('Happy'))))],
      fazer: ['logo', 'agitar'], espera: 1500,
      regras: [
        [G.peluche, 'sem_logo'],
        [xml(E.logo(seq(icone('Happy')))), 'sem_som'],
        [xml(E.logo(seq(som('giggle')))), 'sem_mk_icone_logo'],
        [S.peluche, null],
      ],
    },
    // ================= Nível 3 · Melhorar e cuidar
    { // contador do Repair Café
      ok: S.contador,
      errado: [G.contador, xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(numero(3))))],
      fazer: ['botao:A', 'botao:A', 'botao:A', 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(numero(v('contador'))))), 'sem_botao_A'],
        [G.contador, 'usa_definir'],
        [xml(E.botao('A', seq(icone('Yes'))), E.botao('B', seq(numero(v('contador'))))), 'sem_mk_var_mudar_botao_A'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_botao_B'],
        [xml(E.botao('A', seq(mudar('contador', 1))), E.botao('B', seq(numero(3)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [S.contador, null],
      ],
    },
    { // poupar energia
      ok: S.poupar,
      errado: [G.poupar, xml(E.botao('A', seq(digital('P2', 1))))],
      fazer: ['botao:A'], espera: 3800,
      regras: [
        [xml(E.sempre(seq(digital('P2', 0)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo'))))), 'a_sem_acender'],
        [xml(E.botao('A', seq(digital('P2', 1)))), 'sem_guardar_tempo'],
        [xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo'))))), 'sem_sempre'],
        [xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(digital('P2', 0)))), 'sem_se'],
        [xml(E.botao('A', seq(digital('P2', 1), definir('medida', b('mk_tempo')))), E.sempre(seq(seEntao(cmp(b('mk_tempo'), '>', 3000), digital('P2', 0))))), 'sem_conta'],
        [G.poupar, 'sinal_trocado'],
        [S.poupar, null],
      ],
    },
    { // alarme de sobreaquecimento
      ok: S.calor,
      errado: [G.calor, xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '>', 40), icone('No')))))],
      fazer: [{ temperatura: 25 }, { esperar: 700 }, { temperatura: 45 }], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(tom(880)))), 'sem_sempre'],
        [xml(E.sempre(seq(tom(880)))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_luz'), '>', 40), tom(880))))), 'sem_temperatura'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_temperatura'), '>', 40), icone('No'))))), 'sem_mk_tom_sempre'],
        [G.calor, 'sinal_trocado'],
        [S.calor, null],
      ],
    },
    { // registo de reparações
      ok: S.registo,
      errado: [G.registo, xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', v('contador')))), E.botao('B', seq(registar('reparado', 1))))],
      fazer: ['botao:A', 'botao:A', 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(registar('reciclado', 1)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_mk_registar_botao_A'],
        [xml(E.botao('A', seq(registar('reparado', v('contador'))))), 'sem_mk_var_mudar_botao_A'],
        [G.registo, 'sem_mk_var_em_mk_registar'],
        [xml(E.botao('A', seq(mudar('contador', 1), registar('reparado', v('contador'))))), 'sem_botao_B'],
        [S.registo, null],
      ],
    },
    { // melhorar um brinquedo
      ok: S.brinquedo,
      errado: [G.brinquedo, xml(E.logo(seq(som('happy'))))],
      fazer: ['logo', 'agitar'], espera: 1200,
      regras: [
        [xml(E.botao('A', seq(som('happy')))), 'sem_logo'],
        [xml(E.logo(seq(som('happy'), servo('P0', 180)))), 'sem_luz'],
        [xml(E.logo(seq(digital('P2', 1), servo('P0', 180)))), 'sem_som'],
        [G.brinquedo, 'sem_mk_servo_logo'],
        [S.brinquedo, null],
      ],
    },
  ],
};
