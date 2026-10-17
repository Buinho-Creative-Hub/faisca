// Casos de teste da missão «Toy hacking» (um por desafio com validação, pela ordem).
const { xml, E, seq, solto, b, v, cmp, aleatorio, lerD, conta, icone, som, tom, pausa, digital, numero, definir, mudar, servo, repetir, se, seEntao } = require('../lib');

const espera = ms => ({ esperar: ms });
const ok = {
  botao: xml(E.pino('P1', seq(som('hello')))),
  peluche: xml(E.logo(seq(som('giggle'), icone('Happy')))),
  dorme: xml(E.gesto('face down', seq(icone('Asleep'))), E.gesto('face up', seq(icone('Happy')))),
  farois: xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 0)))),
  sirene: xml(E.botao('A', seq(repetir(4, tom(440, 0.5), tom(330, 0.5))))),
  abraco: xml(E.pino('P0', seq(icone('Heart'), pausa(200), icone('SmallHeart'), pausa(200)))),
  braco: xml(E.botao('A', seq(repetir(3, servo('P0', 0), pausa(500), servo('P0', 180), pausa(500))))),
  cancela: xml(E.botao('A', seq(servo('P0', 90))), E.botao('B', seq(servo('P0', 0)))),
  assustado: xml(E.somalto(seq(icone('Surprised'), servo('P0', 180), pausa(500), servo('P0', 0)))),
  ambulancia: xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [digital('P2', 1)], [digital('P2', 0)])))),
  equilibrio: xml(E.gesto('left', seq(servo('P0', 0))), E.gesto('right', seq(servo('P0', 180)))),
  pisca: xml(E.botao('B', seq(repetir(4, digital('P2', 1), pausa(200), digital('P2', 0), pausa(200))))),
  contador: xml(E.inicio(seq(definir('contador', 0))), E.pino('P0', seq(mudar('contador', 1), numero(v('contador'))))),
  cofre: xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), tom(523, 0.5))))),
  roleta: xml(E.agitar(seq(servo('P0', aleatorio(0, 180))))),
  tapete: xml(E.inicio(seq(definir('vidas', 3))), E.pino('P1', seq(mudar('vidas', -1), numero(v('vidas')), seEntao(cmp(v('vidas'), '==', 0), icone('Sad'))))),
  cronometro: xml(E.pino('P0', seq(definir('medida', b('mk_tempo')))), E.pino('P1', seq(numero(conta(b('mk_tempo'), '-', v('medida')))))),
};

module.exports = {
  missao: 'toy-hacking',
  casos: [
    // ---------------- Nível 1
    {
      ok: ok.botao,
      errado: [xml(E.agitar(seq(som('hello')))), xml(E.pino('P1', seq(icone('Happy'))))],
      fazer: ['pino:P1', 'agitar'], espera: 900,
      regras: [
        [xml(E.agitar(seq(som('giggle')))), 'sem_pino_'],
        [xml(E.pino('P1', ''), solto(som('giggle'))), 'som_fora'],
        [xml(E.pino('P1', seq(icone('Happy')))), 'sem_mk_som_pino_'],
        [ok.botao, null],
      ],
    },
    {
      ok: ok.peluche,
      errado: [xml(E.logo(seq(som('sad'), icone('Happy')))), xml(E.logo(seq(som('giggle'))))],
      fazer: ['logo'], espera: 1000,
      regras: [
        [xml(E.agitar(seq(som('giggle')))), 'sem_logo'],
        [xml(E.logo(seq(icone('Happy')))), 'sem_mk_som_logo'],
        [xml(E.logo(seq(som('sad'), icone('Happy')))), 'som_errado'],
        [xml(E.logo(seq(som('giggle')))), 'sem_mk_icone_logo'],
        [xml(E.logo(seq(som('giggle'), icone('Sad')))), 'cara_errada'],
        [ok.peluche, null],
      ],
    },
    {
      ok: ok.dorme,
      errado: [xml(E.gesto('face down', seq(icone('Happy'))), E.gesto('face up', seq(icone('Asleep')))), xml(E.gesto('face down', seq(icone('Asleep'))))],
      fazer: ['gesto:face down', 'gesto:face up'],
      regras: [
        [xml(E.agitar(seq(icone('Asleep')))), 'sem_gesto_face_down'],
        [xml(E.gesto('face down', '')), 'sem_mk_icone_gesto_face_down'],
        [xml(E.gesto('face down', seq(icone('Happy')))), 'nao_dorme'],
        [xml(E.gesto('face down', seq(icone('Asleep')))), 'sem_gesto_face_up'],
        [xml(E.gesto('face down', seq(icone('Asleep'))), E.gesto('face up', '')), 'nao_acorda'],
        [ok.dorme, null],
      ],
    },
    {
      ok: ok.farois,
      errado: [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P0', 0)))), xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 1))))],
      fazer: ['botao:A', 'botao:B'],
      regras: [
        [xml(E.botao('B', seq(digital('P2', 0)))), 'sem_botao_A'],
        [xml(E.botao('A', '')), 'sem_mk_digital_botao_A'],
        [xml(E.botao('A', seq(digital('P2', 0)))), 'a_apaga'],
        [xml(E.botao('A', seq(digital('P2', 1)))), 'sem_botao_B'],
        [xml(E.botao('A', seq(digital('P2', 1))), E.botao('B', seq(digital('P2', 1)))), 'b_nao_apaga'],
        [ok.farois, null],
      ],
    },
    {
      ok: ok.sirene,
      errado: [xml(E.botao('A', seq(repetir(4, tom(440, 0.5), tom(440, 0.5))))), xml(E.botao('A', seq(tom(440, 0.5), tom(330, 0.5))))],
      fazer: ['botao:A'], espera: 2600,
      regras: [
        [xml(E.logo(seq(tom()))), 'sem_botao_A'],
        [xml(E.botao('A', seq(tom(440), tom(330)))), 'sem_mk_repetir_botao_A'],
        [xml(E.botao('A', seq(repetir(4)))), 'notas_fora'],
        [xml(E.botao('A', seq(repetir(4, tom(440, 0.5), tom(440, 0.5))))), 'mesma_nota'],
        [ok.sirene, null],
      ],
    },
    {
      ok: ok.abraco,
      errado: [xml(E.pino('P0', seq(icone('Heart'), icone('SmallHeart')))), xml(E.pino('P0', seq(icone('Heart'))))],
      fazer: ['pino:P0'], espera: 900,
      regras: [
        [xml(E.agitar(seq(icone('Heart')))), 'sem_pino_'],
        [xml(E.pino('P0', seq(icone('Heart')))), 'sem_coracoes'],
        [xml(E.pino('P0', seq(icone('Heart'), icone('SmallHeart')))), 'sem_pausa'],
        [ok.abraco, null],
      ],
    },
    // ---------------- Nível 2
    {
      ok: ok.braco,
      errado: [xml(E.botao('A', seq(repetir(3, servo('P0', 0), servo('P0', 180))))), xml(E.botao('A', seq(servo('P0', 180))))],
      fazer: ['botao:A'], espera: 3400,
      regras: [
        [xml(E.logo(seq(servo('P0', 0)))), 'sem_botao_A'],
        [xml(E.botao('A', seq(icone('Happy')))), 'sem_mk_servo_botao_A'],
        [xml(E.botao('A', seq(servo('P0', 90)))), 'um_lado_so'],
        [xml(E.botao('A', seq(repetir(3, servo('P0', 0), servo('P0', 180))))), 'sem_pausa'],
        [xml(E.botao('A', seq(servo('P0', 0), pausa(500), servo('P0', 180), pausa(500)))), 'sem_repetir'],
        [ok.braco, null],
      ],
    },
    {
      ok: ok.cancela,
      errado: [xml(E.botao('A', seq(servo('P0', 90))), E.botao('B', seq(servo('P0', 90)))), xml(E.botao('A', seq(servo('P0', 30))), E.botao('B', seq(servo('P0', 0))))],
      fazer: ['botao:A', 'botao:B'],
      regras: [
        [xml(E.botao('B', seq(servo('P0', 0)))), 'sem_botao_A'],
        [xml(E.botao('A', '')), 'sem_mk_servo_botao_A'],
        [xml(E.botao('A', seq(servo('P0', 90)))), 'sem_botao_B'],
        [xml(E.botao('A', seq(servo('P0', 90))), E.botao('B', '')), 'sem_mk_servo_botao_B'],
        [xml(E.botao('A', seq(servo('P0', 90))), E.botao('B', seq(servo('P0', 90)))), 'nao_fecha'],
        [xml(E.botao('A', seq(servo('P0', 30))), E.botao('B', seq(servo('P0', 0)))), 'nao_abre'],
        [ok.cancela, null],
      ],
    },
    {
      ok: ok.assustado,
      errado: [xml(E.botao('A', seq(icone('Surprised'), servo('P0', 180)))), xml(E.somalto(seq(icone('Surprised'))))],
      fazer: ['somalto', 'botao:A'], espera: 900,
      regras: [
        [xml(E.botao('A', seq(icone('Surprised')))), 'sem_somalto'],
        [xml(E.somalto(seq(servo('P0', 180)))), 'sem_mk_icone_somalto'],
        [xml(E.somalto(seq(icone('Happy'), servo('P0', 180)))), 'cara_errada'],
        [xml(E.somalto(seq(icone('Surprised')))), 'sem_mk_servo_somalto'],
        [ok.assustado, null],
      ],
    },
    {
      ok: ok.ambulancia,
      errado: [
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [digital('P2', 1)], [digital('P2', 1)])))),
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '<', 128), [digital('P2', 1)], [digital('P2', 0)])))),
      ],
      fazer: [{ som: 220 }, espera(300), { som: 10 }, espera(300)],
      regras: [
        [xml(E.botao('A', seq(digital('P2', 1)))), 'sem_sempre'],
        [xml(E.sempre(seq(digital('P2', 1)))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_mk_comparar_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_luz'), '>', 128), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_mk_som_nivel_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Happy')], [])))), 'sem_luz'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '<', 128), [digital('P2', 1)], [digital('P2', 0)])))), 'ao_contrario'],
        [ok.ambulancia, null],
      ],
    },
    {
      ok: ok.equilibrio,
      errado: [xml(E.gesto('left', seq(servo('P0', 180))), E.gesto('right', seq(servo('P0', 180)))), xml(E.gesto('left', seq(servo('P0', 0))))],
      fazer: ['gesto:left', 'gesto:right'],
      regras: [
        [xml(E.agitar(seq(servo('P0', 0)))), 'sem_gesto_left'],
        [xml(E.gesto('left', seq(icone('Happy')))), 'sem_mk_servo_gesto_left'],
        [xml(E.gesto('left', seq(servo('P0', 0)))), 'sem_gesto_right'],
        [xml(E.gesto('left', seq(servo('P0', 0))), E.gesto('right', '')), 'sem_mk_servo_gesto_right'],
        [xml(E.gesto('left', seq(servo('P0', 180))), E.gesto('right', seq(servo('P0', 180)))), 'mesmo_lado'],
        [ok.equilibrio, null],
      ],
    },
    {
      ok: ok.pisca,
      errado: [
        xml(E.botao('B', seq(repetir(4, digital('P2', 1), pausa(200), digital('P2', 1), pausa(200))))),
        xml(E.botao('B', seq(repetir(4, digital('P2', 1), digital('P2', 0))))),
      ],
      fazer: ['botao:B'], espera: 2000,
      regras: [
        [xml(E.botao('A', seq(digital('P2', 1)))), 'sem_botao_B'],
        [xml(E.botao('B', seq(digital('P2', 1), pausa(200), digital('P2', 0)))), 'sem_mk_repetir_botao_B'],
        [xml(E.botao('B', seq(repetir(4, digital('P2', 1), pausa(200))))), 'nunca_apaga'],
        [xml(E.botao('B', seq(repetir(4, digital('P2', 1), digital('P2', 0))))), 'sem_pausas'],
        [ok.pisca, null],
      ],
    },
    // ---------------- Nível 3
    {
      ok: ok.contador,
      errado: [
        xml(E.pino('P0', seq(definir('contador', 1), numero(v('contador'))))),
        xml(E.pino('P0', seq(mudar('contador', 1), numero(1)))),
      ],
      fazer: ['pino:P0', espera(250), 'pino:P0', espera(250), 'pino:P0'], espera: 700,
      regras: [
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_pino_'],
        [xml(E.pino('P0', seq(definir('contador', 1), numero(v('contador'))))), 'poe_sempre_1'],
        [xml(E.pino('P0', seq(numero(v('contador'))))), 'sem_mk_var_mudar_pino_'],
        [xml(E.pino('P0', seq(mudar('contador', 1)))), 'sem_mk_mostrar_numero_pino_'],
        [xml(E.pino('P0', seq(mudar('contador', 1), numero(1)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [ok.contador, null],
      ],
    },
    {
      ok: ok.cofre,
      errado: [
        xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1)), tom(523, 0.5)))),
        xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 0), tom(523, 0.5))))),
      ],
      fazer: [{ 'digital:P0': 1 }, espera(700), { 'digital:P0': 0 }, espera(900)],
      regras: [
        [xml(E.botao('A', seq(tom()))), 'sem_sempre'],
        [xml(E.sempre(seq(tom()))), 'sem_se'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_luz'), '==', 1), tom())))), 'sem_leitura'],
        [xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), icone('No'))))), 'sem_alarme'],
        [xml(E.sempre(seq(seEntao(cmp(lerD('P0'), '==', 1), tom()), tom()))), 'sempre_a_tocar'],
        [ok.cofre, null],
      ],
    },
    {
      ok: ok.roleta,
      errado: [xml(E.agitar(seq(servo('P0', 90)))), xml(E.agitar(seq(servo('P0', aleatorio(0, 10)))))],
      fazer: ['agitar', espera(200), 'agitar', espera(200), 'agitar', espera(200), 'agitar'],
      regras: [
        [xml(E.botao('A', seq(servo('P0', 90)))), 'sem_agitar'],
        [xml(E.agitar(seq(icone('Happy')))), 'sem_mk_servo_agitar'],
        [xml(E.agitar(seq(servo('P0', 90)))), 'sem_mk_aleatorio_em_mk_servo'],
        [xml(E.agitar(seq(servo('P0', aleatorio(0, 10))))), 'acaso_pequeno'],
        [ok.roleta, null],
      ],
    },
    {
      ok: ok.tapete,
      errado: [
        xml(E.inicio(seq(definir('vidas', 3))), E.pino('P1', seq(mudar('vidas', 1), numero(v('vidas'))))),
        xml(E.inicio(seq(definir('vidas', 3))), E.pino('P1', seq(mudar('vidas', -1), numero(v('vidas'))))),
      ],
      fazer: ['pino:P1', espera(300), 'pino:P1', espera(300), 'pino:P1'], espera: 800,
      regras: [
        [xml(E.pino('P1', seq(mudar('vidas', -1)))), 'sem_inicio'],
        [xml(E.inicio(''), E.pino('P1', seq(mudar('vidas', -1)))), 'sem_vidas_inicio'],
        [xml(E.inicio(seq(definir('vidas', 3)))), 'sem_pino_'],
        [xml(E.inicio(seq(definir('vidas', 3))), E.pino('P1', seq(mudar('vidas', 1)))), 'ganha_vidas'],
        [xml(E.inicio(seq(definir('vidas', 3))), E.pino('P1', seq(mudar('vidas', -1), numero(3)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [xml(E.inicio(seq(definir('vidas', 3))), E.pino('P1', seq(mudar('vidas', -1), numero(v('vidas'))))), 'sem_fim'],
        [ok.tapete, null],
      ],
    },
    {
      ok: ok.cronometro,
      errado: [
        xml(E.pino('P0', seq(definir('medida', b('mk_tempo')))), E.pino('P1', seq(numero(b('mk_tempo'))))),
        xml(E.pino('P0', seq(definir('medida', b('mk_tempo')))), E.pino('P1', seq(numero(v('medida'))))),
      ],
      fazer: ['pino:P0', espera(800), 'pino:P1'], espera: 600,
      regras: [
        [xml(E.pino('P1', seq(numero(b('mk_tempo'))))), 'sem_pino_P0'],
        [xml(E.pino('P0', seq(icone('Happy')))), 'sem_mk_var_definir_pino_P0'],
        [xml(E.pino('P0', seq(definir('medida', 0)))), 'sem_hora'],
        [xml(E.pino('P0', seq(definir('medida', b('mk_tempo'))))), 'sem_pino_P1'],
        [xml(E.pino('P0', seq(definir('medida', b('mk_tempo')))), E.pino('P1', seq(numero(b('mk_tempo'))))), 'sem_mk_conta_em_mk_mostrar_numero'],
        [xml(E.pino('P0', seq(definir('medida', b('mk_tempo')))), E.pino('P1', seq(numero(conta(b('mk_tempo'), '-', 1))))), 'conta_sem_medida'],
        [ok.cronometro, null],
      ],
    },
  ],
};
