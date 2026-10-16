/* Faísca Desafios — motor que corre o programa de blocos.
 * O mesmo programa mexe no micro:bit do ecrã e, se estiver ligado, no verdadeiro.
 * Os acontecimentos (agitar, botões, logótipo, pinos) chegam dos dois lados.
 */
(function () {
  'use strict';
  const F = window.Faisca;

  class Parado extends Error {}
  const BATIDA_MS = 500;      // 120 bpm, como o MakeCode
  const ICONE_MS = 600;       // o mostrar ícone do MakeCode espera 600 ms

  class Motor {
    constructor(ws, saidas, registo) {
      this.ws = ws;
      this.saidas = saidas;       // lista de alvos: {icone, limpar, som, tom, digital, estaEscuro?}
      this.registo = registo;     // (tipo, dados) => void   — para verificar desafios
      this.geracao = 0;
      this.ocupado = new Set();
      this.handlers = {};
    }
    // ---------------------------------------------------------------- ciclo
    arrancar() {
      this.parar();
      const g = ++this.geracao;
      this.handlers = {};
      for (const top of this.ws.getTopBlocks(true)) {
        if (!top.isEnabled() || top.isInFlyout) continue;
        const corpo = top.getInputTargetBlock('DO');
        let chave = null;
        switch (top.type) {
          case 'mk_agitar': chave = 'agitar'; break;
          case 'mk_logo': chave = 'logo'; break;
          case 'mk_botao': chave = 'botao:' + top.getFieldValue('B'); break;
          case 'mk_pino_tocado': chave = 'pino:' + top.getFieldValue('P'); break;
          case 'mk_sempre': this.sempre(top, corpo, g); break;
        }
        if (chave) (this.handlers[chave] = this.handlers[chave] || []).push({ id: top.id, corpo });
      }
    }
    parar() {
      this.geracao++;
      this.ocupado.clear();
    }
    acontecimento(chave) {
      this.registo('in', chave);
      const lista = this.handlers[chave];
      if (!lista) return;
      const g = this.geracao;
      for (const h of lista) {
        if (this.ocupado.has(h.id)) continue;   // como no micro:bit: não empilha
        this.ocupado.add(h.id);
        this.correr(h.corpo, g, h.id).catch(() => {}).finally(() => this.ocupado.delete(h.id));
      }
    }
    async sempre(top, corpo, g) {
      try {
        for (;;) {
          await this.correr(corpo, g, top.id);
          await this.esperar(20, g);
        }
      } catch (e) { /* parado */ }
    }
    // ---------------------------------------------------------------- execução
    vivo(g) { if (g !== this.geracao) throw new Parado(); }
    esperar(ms, g) {
      return new Promise((res, rej) => setTimeout(() => (g === this.geracao ? res() : rej(new Parado())), ms));
    }
    destacar(id) { try { this.ws.highlightBlock(id); } catch (e) {} }
    async correr(bloco, g, idTopo) {
      for (let b = bloco; b; b = b.getNextBlock()) {
        this.vivo(g);
        if (!b.isEnabled()) continue;
        this.destacar(b.id);
        await this.executar(b, g);
      }
      if (idTopo) this.destacar(null);
    }
    valor(b, nome, defeito) {
      const v = b.getInputTargetBlock(nome);
      if (!v) return defeito;
      switch (v.type) {
        case 'mk_num': return Number(v.getFieldValue('NUM'));
        case 'mk_escuro': return this.estaEscuro();
        case 'mk_botao_premido': return !!this.saidas[0].botoes?.[v.getFieldValue('B')];
        default: return v.getFieldValue('V') ?? defeito;
      }
    }
    estaEscuro() {
      for (const s of this.saidas) if (s.estaEscuro && s.ligado !== false) return s.estaEscuro();
      return false;
    }
    emTodas(fn) { for (const s of this.saidas) if (s.ligado !== false) { try { fn(s); } catch (e) { console.warn(e); } } }
    async executar(b, g) {
      switch (b.type) {
        case 'mk_icone': {
          const nome = b.getFieldValue('I');
          this.emTodas(s => s.icone(nome));
          this.registo('out', 'icone:' + nome);
          await this.esperar(ICONE_MS, g);
          break;
        }
        case 'mk_limpar':
          this.emTodas(s => s.limpar());
          this.registo('out', 'limpar');
          break;
        case 'mk_pausa':
          await this.esperar(Math.max(0, Number(this.valor(b, 'MS', 100))), g);
          break;
        case 'mk_repetir': {
          const n = Math.max(0, Math.min(100, Math.round(Number(this.valor(b, 'N', 0)))));
          for (let i = 0; i < n; i++) {
            await this.correr(b.getInputTargetBlock('DO'), g);
            await this.esperar(0, g);
          }
          break;
        }
        case 'mk_se': {
          const ramo = this.valor(b, 'C', false) ? 'SIM' : 'NAO';
          await this.correr(b.getInputTargetBlock(ramo), g);
          break;
        }
        case 'mk_som': {
          const nome = this.valor(b, 'S', 'giggle');
          let ms = 600;
          this.emTodas(s => { const d = s.tocarSom(nome); if (typeof d === 'number' && s.principal) ms = d; });
          this.registo('out', 'som:' + nome);
          await this.esperar(ms, g);
          break;
        }
        case 'mk_tom': {
          const f = Number(this.valor(b, 'F', 262));
          const ms = Math.round(Number(this.valor(b, 'BAT', 1)) * BATIDA_MS);
          this.emTodas(s => s.tom(f, ms));
          this.registo('out', 'tom:' + f);
          await this.esperar(ms, g);
          break;
        }
        case 'mk_digital': {
          const p = this.valor(b, 'P', 'P2');
          const v = Number(this.valor(b, 'V', 0)) ? 1 : 0;
          this.emTodas(s => s.digital(p, v));
          this.registo('out', 'digital:' + p + ':' + v);
          break;
        }
      }
    }
  }

  F.Motor = Motor;
})();
