// Casos de teste da missão «Primeiros passos» (um por desafio com validação, pela ordem).
const { xml, E, seq, icone, pausa, tom, som, digital, repetir } = require('../lib');
module.exports = {
  missao: 'primeiros-passos',
  casos: [
    { ok: xml(E.agitar(seq(icone('Happy')))), errado: xml(E.agitar(seq(icone('Sad')))), fazer: ['agitar'] },
    {
      ok: xml(E.logo(seq(repetir(4, icone('Heart'), pausa(200), icone('SmallHeart'), pausa(200))))),
      errado: xml(E.logo(seq(repetir(4, icone('Heart'), icone('SmallHeart'))))),
      fazer: ['logo'], espera: 2600,
    },
    { ok: xml(E.botao('A', seq(icone('Happy'))), E.botao('B', seq(icone('Sad')))), errado: xml(E.botao('A', seq(icone('Happy')))), fazer: ['botao:A', 'botao:B'] },
    { ok: xml(E.botao('AB', seq(som('giggle')))), errado: xml(E.botao('AB', seq(icone('Happy')))), fazer: ['botao:AB'] },
    { ok: xml(E.pino('P1', seq(tom()))), errado: xml(E.pino('P1', seq(icone('Happy')))), fazer: ['pino:P1'] },
    {
      ok: xml(E.pino('P1', seq(digital('P2', 1), tom(), digital('P2', 0)))),
      errado: xml(E.pino('P1', seq(digital('P2', 1), tom(), digital('P2', 1)))),
      fazer: ['pino:P1'], espera: 1800,
    },
  ],
};
