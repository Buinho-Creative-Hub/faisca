// Casos de teste da missão «Matemática» (um por desafio com validação, pela ordem).
const { xml, E, seq, b, v, conta, cmp, aleatorio, resto, icone, numero, acender, grafico, definir, mudar, repetir, se, seEntao, pausa } = require('../lib');

const vezes = (n, ...passos) => Array.from({ length: n }, () => passos).flat();
const esc = b('mk_escuro');   // condição qualquer (sem comparação)

// 1 · O número da sorte
const sorte = xml(E.botao('A', seq(numero(7))));
// 2 · Mais um, menos um
const aMais = E.botao('A', seq(mudar('contador', 1), numero(v('contador'))));
const contador = xml(aMais, E.botao('B', seq(mudar('contador', -1), numero(v('contador')))));
const contadorG = xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')))), E.botao('B', seq(mudar('contador', 1), numero(v('contador')))));
// 3 · Conta-passos
const passos = xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', seq(numero(v('passos')))));
const passosG = xml(E.agitar(seq(definir('passos', 1))), E.botao('A', seq(numero(v('passos')))));
const passosOutra = xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', seq(numero(v('contador')))));
// 4 · Contagem decrescente
const foguetao = (ini, passo, n, ic = true) => xml(E.botao('A', seq(ini !== null && definir('contador', ini),
  repetir(n, numero(v('contador')), mudar('contador', passo), pausa(200)), ic && icone('Surprised'))));
// 5 · Dado
const dado = xml(E.agitar(seq(numero(aleatorio(1, 6)))));
const dadoG = xml(E.agitar(seq(numero(aleatorio(1, 60)))));
// 6 · Placar
const pA = E.botao('A', seq(mudar('contador', 1)));
const placar = xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador')), pausa(500), numero(v('pontos')))));
const placarG = xml(pA, E.botao('B', seq(mudar('contador', 1))), E.botao('AB', seq(numero(v('contador')), pausa(500), numero(v('pontos')))));
// 7 · Tabuada do 3
const tabuada = xml(E.botao('A', seq(mudar('contador', 3), numero(v('contador')))));
const tabuadaG = xml(E.botao('A', seq(numero(v('contador')), mudar('contador', 3))));
// 8 · Dobra!
const ini1 = E.inicio(seq(definir('contador', 1)));
const aDobro = E.botao('A', seq(definir('contador', conta(v('contador'), '*', 2)), numero(v('contador'))));
const dobro = xml(ini1, aDobro);
// 9 · Par ou ímpar?
const parProg = (div, sim, nao) => xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')),
  se(cmp(resto(v('contador'), div), '==', 0), sim, nao))));
const par = parProg(2, [icone('Yes')], [icone('No')]);
// 10 · Diagonal
const diag = (n, y, comMudar = true) => xml(E.botao('A', seq(definir('contador', 0), repetir(n, acender(v('contador'), y), comMudar && mudar('contador', 1)))));
const diagonal = diag(5, v('contador'));
// 11 · Quiz da soma
const aQuiz = E.botao('A', seq(definir('contador', aleatorio(1, 5)), definir('pontos', aleatorio(1, 5)), numero(v('contador')), pausa(500), numero(v('pontos'))));
const quiz = xml(aQuiz, E.botao('B', seq(numero(conta(v('contador'), '+', v('pontos'))))));
const quizG = xml(aQuiz, E.botao('B', seq(numero(conta(v('contador'), '+', v('contador'))))));
const quizX = xml(aQuiz, E.botao('B', seq(numero(conta(v('contador'), '*', v('pontos'))))));
// 12 · Cara ou coroa
const moeda = cmp(aleatorio(1, 2), '==', 1);
const moedas = xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(moeda, mudar('contador', 1))), numero(v('contador')))));
const moedasG = xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(moeda), mudar('contador', 1)), numero(v('contador')))));
// 13 · Barra de progresso
const barra = xml(E.botao('A', seq(mudar('contador', 1), grafico(v('contador'), 10))));
const barraG = xml(E.botao('A', seq(mudar('contador', 1), grafico(1, 10))));
// 14 · Meta de passos
const meta = (op, n, sim, nao) => xml(E.agitar(seq(mudar('passos', 1), se(cmp(v('passos'), op, n), sim, nao))));
const metaOk = meta('>=', 5, [icone('Happy')], [numero(v('passos'))]);
// 15 · Cronómetro
const aCrono = E.botao('A', seq(definir('medida', b('mk_tempo'))));
const crono = xml(aCrono, E.botao('B', seq(numero(conta(conta(b('mk_tempo'), '-', v('medida')), '/', 1000)))));
const cronoG = xml(aCrono, E.botao('B', seq(numero(conta(conta(v('medida'), '-', b('mk_tempo')), '/', 1000)))));
// 16 · Potências de 2
const pot = (ini, corpo) => xml(E.botao('A', seq(definir('contador', ini), repetir(6, ...corpo))));
const dobra = definir('contador', conta(v('contador'), '*', 2));
const potencias = pot(1, [numero(v('contador')), dobra]);
// 17 · O maior dado
const dois = [definir('contador', aleatorio(1, 6)), definir('pontos', aleatorio(1, 6))];
const mostraDois = [numero(v('contador')), pausa(300), numero(v('pontos')), pausa(300)];
const maior = (c, sim, nao) => xml(E.botao('A', seq(...dois, ...mostraDois, se(c, sim, nao))));
const maiorOk = maior(cmp(v('contador'), '>', v('pontos')), [numero(v('contador'))], [numero(v('pontos'))]);
const maiorG = maior(cmp(v('contador'), '>', v('pontos')), [numero(v('pontos'))], [numero(v('contador'))]);
// 18 · Adivinha o número
const agSeg = E.agitar(seq(definir('medida', aleatorio(1, 5))));
const aPalp = E.botao('A', seq(mudar('contador', 1), numero(v('contador'))));
const adivinha = (c) => xml(agSeg, aPalp, E.botao('B', seq(se(c, [icone('Yes')], [icone('No')]))));
const adivinhaOk = adivinha(cmp(v('contador'), '==', v('medida')));

module.exports = {
  missao: 'matematica',
  casos: [
    { // 1 · O número da sorte
      ok: sorte, errado: [xml(E.botao('A', seq(numero(1)))), xml(E.agitar(seq(numero(7))))], fazer: ['botao:A'], espera: 500,
      regras: [
        [xml(E.agitar(seq(numero(7)))), 'sem_a'],
        [xml(E.botao('A', '')), 'sem_mostrar'],
        [xml(E.botao('A', seq(numero(3)))), 'numero_errado'],
        [sorte, null],
      ],
    },
    { // 2 · Mais um, menos um
      ok: contador,
      errado: [contadorG, xml(E.botao('A', seq(mudar('contador', 1), numero(1))), E.botao('B', seq(mudar('contador', -1), numero(0))))],
      fazer: ['botao:A', { esperar: 300 }, 'botao:A', { esperar: 300 }, 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(mudar('contador', -1)))), 'sem_a'],
        [xml(E.botao('A', '')), 'a_sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'a_sem_mostrar'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(5)))), 'mostra_sem_var'],
        [xml(aMais), 'sem_b'],
        [xml(aMais, E.botao('B', seq(numero(v('contador'))))), 'b_sem_mudar'],
        [contadorG, 'b_soma'],
        [contador, null],
      ],
    },
    { // 3 · Conta-passos
      ok: passos, errado: [passosG, passosOutra],
      fazer: [...vezes(3, 'agitar', { esperar: 200 }), 'botao:A'], espera: 600,
      regras: [
        [xml(E.botao('A', seq(numero(v('passos'))))), 'sem_agitar'],
        [passosG, 'agitar_sem_mudar'],
        [xml(E.agitar(seq(mudar('passos', 1)))), 'sem_a'],
        [xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', '')), 'a_sem_mostrar'],
        [xml(E.agitar(seq(mudar('passos', 1))), E.botao('A', seq(numero(3)))), 'mostra_sem_var'],
        [passosOutra, 'variaveis_diferentes'],
        [passos, null],
      ],
    },
    { // 4 · Contagem decrescente
      ok: foguetao(5, -1, 5), errado: [foguetao(5, 1, 5), foguetao(null, -1, 5), foguetao(5, -1, 4)], fazer: ['botao:A'], espera: 2600,
      regras: [
        [xml(E.agitar(seq(numero(5)))), 'sem_a'],
        [xml(E.botao('A', seq(numero(5)))), 'sem_comeco'],
        [xml(E.botao('A', seq(definir('contador', 5), numero(v('contador'))))), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('contador', 5), repetir(5, numero(v('contador')))))), 'sem_descer'],
        [foguetao(5, 1, 5), 'conta_sobe'],
        [foguetao(5, -1, 4), 'poucas_vezes'],
        [foguetao(5, -1, 5, false), 'sem_partida'],
        [foguetao(5, -1, 5), null],
      ],
    },
    { // 5 · Lança o dado
      ok: dado, errado: [dadoG, xml(E.agitar(seq(numero(6))))], fazer: vezes(6, 'agitar', { esperar: 250 }), espera: 400,
      regras: [
        [xml(E.botao('A', seq(numero(aleatorio(1, 6))))), 'sem_agitar'],
        [xml(E.agitar('')), 'sem_mostrar'],
        [xml(E.agitar(seq(numero(6)))), 'sem_acaso'],
        [dadoG, 'limites'],
        [dado, null],
      ],
    },
    { // 6 · Placar
      ok: placar, errado: [placarG, xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador')))))],
      fazer: ['botao:A', 'botao:A', 'botao:B', 'botao:AB'], espera: 1200,
      regras: [
        [xml(E.botao('B', seq(mudar('pontos', 1)))), 'sem_a'],
        [xml(E.botao('A', '')), 'a_sem_mudar'],
        [xml(pA), 'sem_b'],
        [xml(pA, E.botao('B', '')), 'b_sem_mudar'],
        [xml(pA, E.botao('B', seq(mudar('contador', 1)))), 'mesma_conta'],
        [xml(pA, E.botao('B', seq(mudar('pontos', 1)))), 'sem_ab'],
        [xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', '')), 'ab_sem_mostrar'],
        [xml(pA, E.botao('B', seq(mudar('pontos', 1))), E.botao('AB', seq(numero(v('contador'))))), 'so_uma_equipa'],
        [placar, null],
      ],
    },
    { // 7 · Tabuada do 3
      ok: tabuada, errado: [tabuadaG, xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 250 }, 'botao:A', { esperar: 250 }, 'botao:A'], espera: 500,
      regras: [
        [xml(E.agitar(seq(mudar('contador', 3)))), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador'))))), 'salto_errado'],
        [xml(E.botao('A', seq(mudar('contador', 3)))), 'sem_mostrar'],
        [xml(E.botao('A', seq(mudar('contador', 3), numero(3)))), 'mostra_sem_var'],
        [tabuadaG, 'mostra_antes'],
        [tabuada, null],
      ],
    },
    { // 8 · Dobra!
      ok: dobro, errado: [xml(aDobro), xml(ini1, E.botao('A', seq(mudar('contador', 2), numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 250 }, 'botao:A', { esperar: 250 }, 'botao:A'], espera: 500,
      regras: [
        [xml(aDobro), 'sem_inicio'],
        [xml(E.inicio(seq(definir('contador', 0))), aDobro), 'comeca_zero'],
        [xml(ini1), 'sem_a'],
        [xml(ini1, E.botao('A', seq(numero(v('contador'))))), 'a_sem_definir'],
        [xml(ini1, E.botao('A', seq(definir('contador', 2), numero(v('contador'))))), 'sem_conta'],
        [xml(ini1, E.botao('A', seq(definir('contador', conta(v('contador'), '+', 2)), numero(v('contador'))))), 'conta_errada'],
        [xml(ini1, E.botao('A', seq(definir('contador', conta(v('contador'), '*', 2))))), 'sem_mostrar'],
        [dobro, null],
      ],
    },
    { // 9 · Par ou ímpar?
      ok: par, errado: [parProg(2, [icone('No')], [icone('Yes')]), parProg(3, [icone('Yes')], [icone('No')])],
      fazer: vezes(4, 'botao:A', { esperar: 400 }), espera: 500,
      regras: [
        [xml(E.agitar(seq(mudar('contador', 1)))), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador'))))), 'sem_se'],
        [xml(E.botao('A', seq(mudar('contador', 1), numero(v('contador')), se(cmp(v('contador'), '==', 0), [icone('Yes')], [icone('No')])))), 'sem_resto'],
        [parProg(3, [icone('Yes')], [icone('No')]), 'divide_errado'],
        [parProg(2, [], []), 'sem_icones'],
        [parProg(2, [icone('No')], [icone('Yes')]), 'icones_trocados'],
        [par, null],
      ],
    },
    { // 10 · Diagonal de luzes
      ok: diagonal, errado: [diag(5, 0), diag(5, v('contador'), false)], fazer: ['botao:A'], espera: 600,
      regras: [
        [xml(E.agitar(seq(acender(v('contador'), v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(acender(v('contador'), v('contador'))))), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(5, mudar('contador', 1))))), 'sem_acender'],
        [xml(E.botao('A', seq(repetir(5, acender(2, 2))))), 'acender_fixo'],
        [diag(5, 0), 'so_uma_var'],
        [diag(5, v('contador'), false), 'sem_mudar'],
        [diag(4, v('contador')), 'poucas_vezes'],
        [diagonal, null],
      ],
    },
    { // 11 · Quiz da soma
      ok: quiz, errado: [quizG, quizX],
      fazer: vezes(3, 'botao:A', { esperar: 900 }, 'botao:B', { esperar: 1600 }), espera: 300,
      regras: [
        [xml(E.agitar(seq(numero(v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(numero(v('contador'))))), 'a_sem_acaso'],
        [xml(E.botao('A', seq(definir('contador', aleatorio(1, 5)), definir('pontos', aleatorio(1, 5))))), 'a_sem_mostrar'],
        [xml(aQuiz), 'sem_b'],
        [xml(aQuiz, E.botao('B', '')), 'b_sem_mostrar'],
        [xml(aQuiz, E.botao('B', seq(numero(v('contador'))))), 'b_sem_conta'],
        [quizG, 'conta_errada'],
        [quiz, null],
      ],
    },
    { // 12 · Cara ou coroa
      ok: moedas, errado: [moedasG, xml(E.botao('A', seq(repetir(10, seEntao(moeda, mudar('contador', 1))), numero(v('contador')))))],
      fazer: ['botao:A', { esperar: 1800 }, 'botao:A'], espera: 1800,
      regras: [
        [xml(E.agitar(seq(numero(v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(repetir(10, seEntao(moeda, mudar('contador', 1))), numero(v('contador'))))), 'sem_zero'],
        [xml(E.botao('A', seq(definir('contador', 0), seEntao(moeda, mudar('contador', 1)), numero(v('contador'))))), 'sem_repetir'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(10, mudar('contador', 1)), numero(v('contador'))))), 'sem_se'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(cmp(v('contador'), '==', 1), mudar('contador', 1))), numero(v('contador'))))), 'sem_acaso'],
        [moedasG, 'conta_sempre'],
        [xml(E.botao('A', seq(definir('contador', 0), repetir(10, seEntao(moeda, mudar('contador', 1)))))), 'sem_mostrar'],
        [moedas, null],
      ],
    },
    { // 13 · Barra de progresso
      ok: barra, errado: [barraG, xml(E.botao('A', seq(mudar('contador', 1), grafico(v('contador'), 255))))],
      fazer: vezes(4, 'botao:A', { esperar: 200 }), espera: 400,
      regras: [
        [xml(E.agitar(seq(mudar('contador', 1)))), 'sem_a'],
        [xml(E.botao('A', seq(grafico(v('contador'), 10)))), 'sem_mudar'],
        [xml(E.botao('A', seq(mudar('contador', 1)))), 'sem_grafico'],
        [barraG, 'grafico_fixo'],
        [xml(E.botao('A', seq(mudar('contador', 1), grafico(v('contador'), 255)))), 'maximo'],
        [barra, null],
      ],
    },
    { // 14 · Meta de passos
      ok: metaOk, errado: [meta('>=', 50, [icone('Happy')], [numero(v('passos'))]), meta('>', 5, [icone('Happy')], [numero(v('passos'))])],
      fazer: vezes(6, 'agitar', { esperar: 250 }), espera: 400,
      regras: [
        [xml(E.botao('A', seq(mudar('passos', 1)))), 'sem_agitar'],
        [xml(E.agitar(seq(se(cmp(v('passos'), '>=', 5), [icone('Happy')], [numero(v('passos'))])))), 'sem_mudar'],
        [xml(E.agitar(seq(mudar('passos', 1)))), 'sem_se'],
        [xml(E.agitar(seq(mudar('passos', 1), se(esc, [icone('Happy')], [numero(v('passos'))])))), 'sem_comparar'],
        [meta('>=', 50, [icone('Happy')], [numero(v('passos'))]), 'meta_errada'],
        [meta('>=', 5, [numero(v('passos'))], [icone('Happy')]), 'festa_trocada'],
        [metaOk, null],
      ],
    },
    { // 15 · Cronómetro
      ok: crono,
      errado: [cronoG, xml(aCrono, E.botao('B', seq(numero(conta(b('mk_tempo'), '-', v('medida')))))), xml(aCrono, E.botao('B', seq(numero(conta(b('mk_tempo'), '/', 1000)))))],
      fazer: [{ esperar: 1500 }, 'botao:A', { esperar: 2000 }, 'botao:B'], espera: 600,
      regras: [
        [xml(E.botao('B', seq(numero(v('medida'))))), 'sem_a'],
        [xml(E.botao('A', '')), 'a_sem_definir'],
        [xml(E.botao('A', seq(definir('medida', 0)))), 'sem_tempo_inicio'],
        [xml(aCrono), 'sem_b'],
        [xml(aCrono, E.botao('B', '')), 'b_sem_mostrar'],
        [xml(aCrono, E.botao('B', seq(numero(v('medida'))))), 'b_sem_tempo'],
        [cronoG, 'ordem'],
        [xml(aCrono, E.botao('B', seq(numero(conta(b('mk_tempo'), '-', v('medida')))))), 'sem_divisao'],
        [crono, null],
      ],
    },
    { // 16 · Potências de 2
      ok: potencias, errado: [pot(0, [numero(v('contador')), dobra]), pot(1, [numero(v('contador')), mudar('contador', 2)])],
      fazer: ['botao:A'], espera: 4500,
      regras: [
        [xml(E.agitar(seq(numero(v('contador'))))), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', 1), numero(v('contador'))))), 'sem_repetir'],
        [pot(0, [numero(v('contador')), dobra]), 'comeco'],
        [pot(1, [numero(v('contador'))]), 'sem_dobro'],
        [xml(E.botao('A', seq(definir('contador', 1), repetir(6, dobra), numero(v('contador'))))), 'mostra_fora'],
        [potencias, null],
      ],
    },
    { // 17 · O maior dado
      ok: maiorOk, errado: [maiorG, xml(E.botao('A', seq(...dois, ...mostraDois, numero(conta(v('contador'), '+', v('pontos'))))))],
      fazer: vezes(4, 'botao:A', { esperar: 1400 }), espera: 300,
      regras: [
        [xml(E.agitar(seq(...dois))), 'sem_a'],
        [xml(E.botao('A', seq(definir('contador', aleatorio(1, 6)), numero(v('contador'))))), 'dois_dados'],
        [xml(E.botao('A', seq(...dois))), 'mostra_dados'],
        [xml(E.botao('A', seq(...dois, ...mostraDois))), 'sem_se'],
        [maior(esc, [numero(v('contador'))], [numero(v('pontos'))]), 'sem_comparar'],
        [maiorG, 'trocado'],
        [maiorOk, null],
      ],
    },
    { // 18 · Adivinha o número
      ok: adivinhaOk, errado: [adivinha(cmp(v('contador'), '==', v('pontos'))), adivinha(cmp(v('contador'), '>', v('medida')))],
      fazer: ['agitar', { esperar: 200 }, ...vezes(5, 'botao:A', { esperar: 250 }, 'botao:B', { esperar: 250 })], espera: 300,
      regras: [
        [xml(aPalp, E.botao('B', seq(se(cmp(v('contador'), '==', v('medida')), [icone('Yes')], [icone('No')])))), 'sem_agitar'],
        [xml(E.agitar(seq(definir('medida', 3)))), 'sem_segredo'],
        [xml(agSeg), 'sem_a'],
        [xml(agSeg, E.botao('A', seq(numero(v('contador'))))), 'a_sem_mudar'],
        [xml(agSeg, aPalp), 'sem_b'],
        [xml(agSeg, aPalp, E.botao('B', '')), 'sem_se'],
        [adivinha(esc), 'sem_comparar'],
        [adivinha(cmp(v('contador'), '==', v('pontos'))), 'compara_errado'],
        [adivinhaOk, null],
      ],
    },
  ],
};
