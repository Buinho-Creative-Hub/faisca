/* Gabi — apresentação. Só mostra o que o motor decide (gabi-motor.js). */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const SPRITES = {
    boas_vindas: '01_boas_vindas', curiosa: '02_curiosa', a_pensar: '03_a_pensar', surpreendida: '04_surpreendida',
    dica: '05_a_dar_uma_dica', celebrar: '06_a_celebrar', incentivar: '07_a_incentivar', calma: '08_calma',
  };
  const CHAVE = 'faisca.gabi.recolhida';
  const sprite = estado => 'img/gabi/' + (SPRITES[estado] || SPRITES.curiosa) + '.png';

  class GabiUI {
    constructor() {
      this.root = document.getElementById('gabi');
      this.img = document.getElementById('gabiImg');
      this.avatar = document.getElementById('gabiAvatar');
      this.balao = document.getElementById('gabiBalao');
      this.texto = document.getElementById('gabiTexto');
      this.nivel = document.getElementById('gabiNivel');
      this.btnFechar = document.getElementById('gabiFechar');
      // pré-carregar os 8 estados para a troca ser instantânea
      Object.values(SPRITES).forEach(s => { const i = new Image(); i.src = 'img/gabi/' + s + '.png'; });
      let rec = null;
      try { rec = localStorage.getItem(CHAVE); } catch (e) {}
      this.recolher(rec === null ? window.innerWidth < 900 : rec === '1', false);
      this.avatar.addEventListener('click', () => this.recolher(!this.recolhida));
      this.btnFechar.addEventListener('click', () => this.recolher(true));
    }
    recolher(sim, guardar = true) {
      this.recolhida = sim;
      this.root.classList.toggle('recolhida', sim);
      this.avatar.setAttribute('aria-expanded', String(!sim));
      this.avatar.setAttribute('aria-label', sim ? 'Mostrar a Gabi' : 'Esconder a Gabi');
      if (!sim) this.avatar.removeAttribute('data-novo');
      if (guardar) { try { localStorage.setItem(CHAVE, sim ? '1' : '0'); } catch (e) {} }
      if (window.Blockly && F.app && F.app.ws) setTimeout(() => Blockly.svgResize(F.app.ws), 0);
    }
    mostrar(m) {
      this.img.src = sprite(m.estado);
      this.img.alt = 'Gabi ' + (m.estado || '').replace('_', ' ');
      this.texto.textContent = m.texto;
      this.balao.className = 'gabi-balao tipo-' + (m.tipo || 'info');
      if (m.tipo === 'pista' && m.nivel) {
        this.nivel.hidden = false;
        this.nivel.innerHTML = [1, 2, 3].map(i => `<span class="${i <= m.nivel ? 'on' : ''}"></span>`).join('');
        this.nivel.setAttribute('aria-label', `pista ${m.nivel} de 3`);
      } else {
        this.nivel.hidden = true;
      }
      // Se estiver recolhida, só abre quando a criança pediu ajuda; caso contrário fica um sinal discreto
      if (this.recolhida) {
        if (m.pedida || m.tipo === 'gambiarra') this.recolher(false, false);
        else this.avatar.setAttribute('data-novo', '');
      }
      this.avatar.classList.remove('salto'); void this.avatar.offsetWidth; this.avatar.classList.add('salto');
    }
  }

  F.GabiUI = GabiUI;
  F.gabiSprite = sprite;
})();
