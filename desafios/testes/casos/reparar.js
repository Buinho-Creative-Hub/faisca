// Casos de teste da missão «Reparar».
const { xml, E, seq, solto, icone, tom, digital } = require('../lib');
const okDetetive = xml(E.pino('P1', seq(icone('Yes'), tom(523))));
module.exports = {
  missao: 'reparar',
  casos: [
    {
      ok: okDetetive,
      // a gambiarra do Nico: certo por dentro, mas no bloco errado (agitar em vez do pino)
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
  ],
};
