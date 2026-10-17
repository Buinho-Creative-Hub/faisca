// Casos de teste da missão «Citizen sensing» (um por desafio com validação, pela ordem).
const { xml, E, seq, solto, b, v, num, conta, cmp, lerA, icone, limpar, pausa, tom, digital, numero, grafico, definir, mudar, registar, se, seEntao } = require('../lib');

// soluções
const ok = {
  luz: xml(E.botao('A', seq(numero(b('mk_luz'))))),
  temp: xml(E.botao('B', seq(numero(b('mk_temperatura'))))),
  som: xml(E.logo(seq(numero(b('mk_som_nivel'))))),
  grafLuz: xml(E.sempre(seq(grafico(b('mk_luz'), 255)))),
  grafSom: xml(E.sempre(seq(grafico(b('mk_som_nivel'), 255)))),
  termo: xml(E.sempre(seq(numero(b('mk_temperatura')), pausa(1000)))),
  semaforo: xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))),
  presenca: xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 0)])))),
  quente: xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Surprised')], [limpar()])))),
  contador: xml(E.somalto(seq(mudar('contador', 1), numero(v('contador'))))),
  limite: xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', v('medida')), [icone('Sad')], [icone('Happy')])))),
  mapa: xml(E.botao('A', seq(registar('luz', b('mk_luz')))), E.botao('B', seq(registar('som', b('mk_som_nivel'))))),
  estacao: xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel')), registar('temperatura', b('mk_temperatura')), pausa(1000)))),
  recorde: xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), definir('recorde', b('mk_som_nivel'))))), E.botao('A', seq(numero(v('recorde'))))),
  media: xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(conta(v('medida'), '/', v('contador')))))),
  porta: xml(E.botao('A', seq(registar('porta', b('mk_temperatura')))), E.botao('B', seq(registar('patio', b('mk_temperatura'))))),
  horta: xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '<', 300), tom())))),
  silencio: xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(conta(b('mk_tempo'), '-', v('medida')), '/', 1000))))),
};

const somAltoBaixo = [{ som: 230 }, { esperar: 400 }, { som: 10 }, { esperar: 400 }];

module.exports = {
  missao: 'citizen-sensing',
  casos: [
    // ============ Nível 1
    {
      ok: ok.luz,
      errado: [xml(E.botao('A', seq(numero(150)))), xml(E.botao('A', seq(numero(b('mk_temperatura')))))],
      fazer: [{ luz: 200 }, 'botao:A'],
      regras: [
        [xml(E.agitar(seq(numero(b('mk_luz'))))), 'sem_botao_A'],
        [xml(E.botao('A', ''), solto(numero(b('mk_luz')))), 'fora_botao_A'],
        [xml(E.botao('A', seq(icone('Happy')))), 'sem_mk_mostrar_numero_botao_A'],
        [xml(E.botao('A', seq(numero(5)))), 'sem_mk_luz_em_mk_mostrar_numero'],
        [ok.luz, null],
      ],
    },
    {
      ok: ok.temp,
      errado: [xml(E.botao('B', seq(numero(b('mk_luz'))))), xml(E.botao('A', seq(numero(b('mk_temperatura')))))],
      fazer: [{ temperatura: 30 }, 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_temperatura'))))), 'sem_botao_B'],
        [xml(E.botao('B', ''), solto(numero(b('mk_temperatura')))), 'fora_botao_B'],
        [xml(E.botao('B', seq(numero(b('mk_luz'))))), 'sem_mk_temperatura_em_mk_mostrar_numero'],
        [ok.temp, null],
      ],
    },
    {
      ok: ok.som,
      errado: [xml(E.logo(seq(numero(b('mk_temperatura'))))), xml(E.logo(seq(numero(0))))],
      fazer: [{ som: 180 }, 'logo'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_som_nivel'))))), 'sem_logo'],
        [xml(E.logo(seq(icone('Happy')))), 'sem_mk_mostrar_numero_logo'],
        [xml(E.logo(seq(numero(b('mk_luz'))))), 'sem_mk_som_nivel_em_mk_mostrar_numero'],
        [ok.som, null],
      ],
    },
    {
      ok: ok.grafLuz,
      errado: [xml(E.botao('A', seq(grafico(b('mk_luz'), 255)))), xml(E.sempre(seq(grafico(b('mk_som_nivel'), 255))))],
      fazer: [{ luz: 255 }, { esperar: 400 }, { luz: 0 }, { esperar: 400 }],
      regras: [
        [xml(E.botao('A', seq(grafico(b('mk_luz'), 255)))), 'sem_sempre'],
        [xml(E.sempre(seq(numero(b('mk_luz'))))), 'sem_mk_grafico_sempre'],
        [xml(E.sempre(seq(grafico(100, 255)))), 'sem_mk_luz_em_mk_grafico'],
        [xml(E.sempre(seq(grafico(b('mk_luz'), 100)))), 'max_errado'],
        [ok.grafLuz, null],
      ],
    },
    {
      ok: ok.grafSom,
      errado: [xml(E.sempre(seq(grafico(b('mk_som_nivel'), 25)))), xml(E.sempre(seq(grafico(b('mk_luz'), 255))))],
      fazer: [{ som: 255 }, { esperar: 400 }, { som: 20 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(grafico(b('mk_luz'), 255)))), 'sem_mk_som_nivel_em_mk_grafico'],
        [xml(E.sempre(seq(grafico(b('mk_som_nivel'), 25)))), 'max_errado'],
        [xml(E.sempre(seq(icone('Happy')))), 'sem_mk_grafico_sempre'],
        [ok.grafSom, null],
      ],
    },
    {
      ok: ok.termo,
      errado: [xml(E.inicio(seq(numero(b('mk_temperatura'))))), xml(E.sempre(seq(numero(b('mk_luz')), pausa(1000))))],
      fazer: [{ temperatura: 30 }, { esperar: 3000 }, { temperatura: 12 }, { esperar: 3000 }],
      regras: [
        [xml(E.inicio(seq(numero(b('mk_temperatura'))))), 'sem_sempre'],
        [xml(E.sempre(seq(numero(b('mk_luz')), pausa(1000)))), 'sem_mk_temperatura_em_mk_mostrar_numero'],
        [xml(E.sempre(seq(numero(b('mk_temperatura'))))), 'sem_mk_pausa_sempre'],
        [ok.termo, null],
      ],
    },
    // ============ Nível 2
    {
      ok: ok.semaforo,
      errado: [
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '<', 128), [icone('Sad')], [icone('Happy')])))),
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 0), [icone('Sad')], [icone('Happy')])))),
      ],
      fazer: somAltoBaixo,
      regras: [
        [xml(E.sempre(seq(icone('Sad')))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Sad')], [icone('Happy')])))), 'sem_mk_comparar_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_luz'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_som_nivel_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 0), [icone('Sad')], [icone('Happy')])))), 'limite_zero'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [], [])))), 'sem_mk_icone_sempre'],
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Happy')], [icone('Sad')])))), 'cara_trocada'],
        [ok.semaforo, null],
      ],
    },
    {
      ok: ok.presenca,
      errado: [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 1)])))), xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)]))))],
      fazer: [{ luz: 10 }, { esperar: 400 }, { luz: 200 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(digital('P2', 1)))), 'sem_mk_se_sempre'],
        [xml(E.sempre(seq(se(cmp(num(1), '<', 2), [digital('P2', 1)], [digital('P2', 0)])))), 'sem_pergunta'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Asleep')], [])))), 'sem_ligar'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 0)], [digital('P2', 1)])))), 'trocado'],
        [xml(E.sempre(seq(se(b('mk_escuro'), [digital('P2', 1)], [digital('P2', 1)])))), 'nunca_apaga'],
        [ok.presenca, null],
      ],
    },
    {
      ok: ok.quente,
      errado: [
        xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Surprised')], [])))),
        xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 0), [icone('Surprised')], [limpar()])))),
      ],
      fazer: [{ temperatura: 32 }, { esperar: 400 }, { temperatura: 15 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(se(b('mk_escuro'), [icone('Surprised')], [limpar()])))), 'sem_mk_comparar_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_luz'), '>', 25), [icone('Surprised')], [limpar()])))), 'sem_mk_temperatura_em_mk_se'],
        [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 0), [icone('Surprised')], [limpar()])))), 'limite_zero'],
        [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Sad')], [limpar()])))), 'sem_aviso'],
        [xml(E.sempre(seq(se(cmp(b('mk_temperatura'), '>', 25), [icone('Surprised')], [])))), 'nao_limpa'],
        [ok.quente, null],
      ],
    },
    {
      ok: ok.contador,
      errado: [xml(E.somalto(seq(definir('contador', 1), numero(v('contador'))))), xml(E.somalto(seq(numero(5))))],
      fazer: ['somalto', { esperar: 500 }, 'somalto', { esperar: 500 }, 'somalto'],
      regras: [
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_somalto'],
        [xml(E.somalto(seq(definir('contador', 1), numero(v('contador'))))), 'definir_em_vez_de_mudar'],
        [xml(E.somalto(seq(numero(v('contador'))))), 'sem_mk_var_mudar_somalto'],
        [xml(E.somalto(seq(mudar('contador', 1)))), 'sem_mk_mostrar_numero_somalto'],
        [xml(E.somalto(seq(mudar('contador', 1), numero(1)))), 'sem_mk_var_em_mk_mostrar_numero'],
        [ok.contador, null],
      ],
    },
    {
      ok: ok.limite,
      errado: [
        xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 0), [icone('Sad')], [icone('Happy')])))),
        xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))),
      ],
      fazer: [{ som: 240 }, { esperar: 400 }, { som: 5 }, { esperar: 400 }],
      regras: [
        [xml(E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_inicio'],
        [xml(E.inicio(''), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_var_definir_inicio'],
        [xml(E.inicio(seq(definir('medida', 0))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', v('medida')), [icone('Sad')], [icone('Happy')])))), 'limite_zero'],
        [xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', 128), [icone('Sad')], [icone('Happy')])))), 'sem_mk_var_em_mk_se'],
        [xml(E.inicio(seq(definir('medida', 100))), E.sempre(seq(se(cmp(b('mk_som_nivel'), '>', v('medida')), [icone('Happy')], [icone('Sad')])))), 'cara_trocada'],
        [ok.limite, null],
      ],
    },
    {
      ok: ok.mapa,
      errado: [xml(E.botao('A', seq(registar('luz', b('mk_luz')))), E.botao('B', seq(registar('som', b('mk_luz'))))), xml(E.botao('A', seq(numero(b('mk_luz')))), E.botao('B', seq(numero(b('mk_som_nivel')))))],
      fazer: [{ luz: 80 }, 'botao:A', { som: 190 }, 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_luz'))))), 'sem_mk_registar_botao_A'],
        [xml(E.botao('A', seq(registar('luz', 0)))), 'sem_mk_luz_em_mk_registar'],
        [xml(E.botao('A', seq(registar('luz', b('mk_luz'))))), 'sem_botao_B'],
        [xml(E.botao('A', seq(registar('luz', b('mk_luz')))), E.botao('B', seq(registar('som', b('mk_luz'))))), 'sem_som_no_B'],
        [ok.mapa, null],
      ],
    },
    // ============ Nível 3
    {
      ok: ok.estacao,
      errado: [
        xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_luz')), registar('temperatura', b('mk_luz')), pausa(1000)))),
        xml(E.botao('A', seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel')), registar('temperatura', b('mk_temperatura'))))),
      ],
      fazer: [{ luz: 90 }, { esperar: 1300 }, { som: 170 }, { esperar: 1300 }, { temperatura: 27 }, { esperar: 1300 }],
      regras: [
        [xml(E.sempre(seq(numero(b('mk_luz'))))), 'sem_mk_registar_sempre'],
        [xml(E.sempre(seq(registar('som', b('mk_som_nivel'))))), 'falta_luz'],
        [xml(E.sempre(seq(registar('luz', b('mk_luz'))))), 'falta_som'],
        [xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel'))))), 'falta_temperatura'],
        [xml(E.sempre(seq(registar('luz', b('mk_luz')), registar('som', b('mk_som_nivel')), registar('temperatura', b('mk_temperatura'))))), 'sem_mk_pausa_sempre'],
        [ok.estacao, null],
      ],
    },
    {
      ok: ok.recorde,
      errado: [
        xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '<', v('recorde')), definir('recorde', b('mk_som_nivel'))))), E.botao('A', seq(numero(v('recorde'))))),
        xml(E.botao('A', seq(numero(b('mk_som_nivel'))))),
        xml(E.botao('A', seq(numero(255)))),
      ],
      fazer: [{ som: 120 }, { esperar: 300 }, { som: 210 }, { esperar: 300 }, { som: 40 }, { esperar: 300 }, 'botao:A'],
      regras: [
        [xml(E.sempre(seq(definir('recorde', b('mk_som_nivel'))))), 'sem_mk_se_entao_sempre'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', 100), definir('recorde', b('mk_som_nivel')))))), 'compara_com_recorde'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '<', v('recorde')), definir('recorde', b('mk_som_nivel')))))), 'comparacao_trocada'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), icone('Happy'))))), 'sem_mk_var_definir_sempre'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), definir('recorde', 100))))), 'sem_mk_som_nivel_em_mk_var_definir'],
        [xml(E.sempre(seq(seEntao(cmp(b('mk_som_nivel'), '>', v('recorde')), definir('recorde', b('mk_som_nivel')))))), 'sem_botao_A'],
        [ok.recorde, null],
      ],
    },
    {
      ok: ok.media,
      errado: [
        xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(v('medida'))))),
        xml(E.botao('A', seq(numero(b('mk_luz'))))),
      ],
      fazer: [{ luz: 100 }, 'botao:B', { luz: 200 }, 'botao:B', { luz: 60 }, 'botao:B', { esperar: 300 }, 'botao:A'],
      regras: [
        [xml(E.botao('B', seq(numero(b('mk_luz'))))), 'sem_mk_var_mudar_botao_B'],
        [xml(E.botao('B', seq(mudar('medida', 1)))), 'sem_somar_luz'],
        [xml(E.botao('B', seq(mudar('medida', 1), mudar('medida', b('mk_luz'))))), 'mesma_variavel'],
        [xml(E.botao('B', seq(mudar('medida', b('mk_luz'))))), 'sem_contar'],
        [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(v('medida'))))), 'sem_mk_conta_em_mk_mostrar_numero'],
        [xml(E.botao('B', seq(mudar('contador', 1), mudar('medida', b('mk_luz')))), E.botao('A', seq(numero(conta(v('medida'), '+', v('contador')))))), 'nao_divide'],
        [ok.media, null],
      ],
    },
    {
      ok: ok.porta,
      errado: [
        xml(E.botao('A', seq(registar('luz', b('mk_temperatura')))), E.botao('B', seq(registar('luz', b('mk_temperatura'))))),
        xml(E.botao('A', seq(registar('porta', b('mk_temperatura')))), E.botao('B', seq(registar('patio', b('mk_luz'))))),
      ],
      fazer: [{ temperatura: 18 }, 'botao:A', { temperatura: 26 }, 'botao:B'],
      regras: [
        [xml(E.botao('A', seq(numero(b('mk_temperatura'))))), 'sem_mk_registar_botao_A'],
        [xml(E.botao('A', seq(registar('porta', b('mk_luz'))))), 'sem_temp_A'],
        [xml(E.botao('A', seq(registar('porta', b('mk_temperatura'))))), 'sem_botao_B'],
        [xml(E.botao('A', seq(registar('porta', b('mk_temperatura')))), E.botao('B', seq(registar('patio', b('mk_som_nivel'))))), 'sem_temp_B'],
        [xml(E.botao('A', seq(registar('luz', b('mk_temperatura')))), E.botao('B', seq(registar('luz', b('mk_temperatura'))))), 'mesmo_nome'],
        [ok.porta, null],
      ],
    },
    {
      ok: ok.horta,
      errado: [
        xml(E.sempre(seq(grafico(lerA('P1'), 255), seEntao(cmp(lerA('P1'), '<', 300), tom())))),
        xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '>', 300), tom())))),
      ],
      fazer: [{ 'analogico:P1': 900 }, { esperar: 800 }, { 'analogico:P1': 100 }, { esperar: 1500 }],
      regras: [
        [xml(E.sempre(seq(numero(lerA('P1'))))), 'sem_mk_grafico_sempre'],
        [xml(E.sempre(seq(grafico(b('mk_luz'), 1023)))), 'sem_mk_ler_analogico_em_mk_grafico'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 255)))), 'max_errado'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 1023)))), 'sem_mk_se_entao_sempre'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '>', 300), tom())))), 'sede_trocada'],
        [xml(E.sempre(seq(grafico(lerA('P1'), 1023), seEntao(cmp(lerA('P1'), '<', 300), icone('Sad'))))), 'sem_mk_tom_sempre'],
        [ok.horta, null],
      ],
    },
    {
      ok: ok.silencio,
      errado: [
        xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(b('mk_tempo'), '-', v('medida')))))),
        xml(E.somalto(seq(numero(conta(b('mk_tempo'), '/', 1000))))),
        xml(E.somalto(seq(numero(2)))),
      ],
      fazer: [{ esperar: 1500 }, 'botao:A', { esperar: 2600 }, 'somalto'],
      espera: 1500,
      regras: [
        [xml(E.somalto(seq(numero(b('mk_tempo'))))), 'sem_botao_A'],
        [xml(E.botao('A', seq(definir('medida', 0)))), 'sem_mk_tempo_em_mk_var_definir'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo'))))), 'sem_somalto'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(b('mk_tempo'), '/', 1000))))), 'sem_subtrair'],
        [xml(E.botao('A', seq(definir('medida', b('mk_tempo')))), E.somalto(seq(numero(conta(b('mk_tempo'), '-', v('medida')))))), 'sem_segundos'],
        [ok.silencio, null],
      ],
    },
  ],
};
