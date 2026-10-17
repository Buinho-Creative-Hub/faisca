/* Faísca Desafios — escolha do pacote (mascote + desafios).
 *
 *   index.html            → pacote por defeito (Gabi)
 *   index.html?p=nico     → Nico, o Podengo do Buinho Educativo
 *
 * O pacote é um script em pacotes/<id>.js que chama Faisca.registarPacote({...}).
 * Carrega-se com document.write para continuar a funcionar em file:// (sem fetch nem módulos).
 * Para acrescentar um pacote: criar pacotes/<id>.js e juntar o id a PACOTES.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const PACOTES = ['gabi', 'nico'];
  const pedido = new URLSearchParams(location.search).get('p');
  F.PACOTE_ID = PACOTES.includes(pedido) ? pedido : PACOTES[0];
  document.documentElement.setAttribute('data-pacote', F.PACOTE_ID);
  F.carregarPacote = function () {
    document.write('<script src="pacotes/' + F.PACOTE_ID + '.js"><\/script>');
  };
})();
