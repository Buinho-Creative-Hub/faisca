/* Tutor (mascote) — leitura do programa. Transforma o espaço de blocos numa estrutura simples
 * que as regras pedagógicas conseguem interrogar, sem conhecerem o Blockly.
 * Não tem interface: pode ser testado sozinho.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  const EVENTOS = {
    mk_agitar: () => 'agitar',
    mk_logo: () => 'logo',
    mk_botao: b => 'botao:' + b.getFieldValue('B'),
    mk_pino_tocado: b => 'pino:' + b.getFieldValue('P'),
    mk_sempre: () => 'sempre',
  };

  function valor(b, nome) {
    const v = b.getInputTargetBlock(nome);
    if (!v) return null;
    if (v.type === 'mk_num') return Number(v.getFieldValue('NUM'));
    return v.getFieldValue('V');
  }

  // Descreve um bloco de instrução (sem os filhos)
  function descrever(b) {
    const d = { tipo: b.type, id: b.id };
    switch (b.type) {
      case 'mk_icone': d.icone = b.getFieldValue('I'); break;
      case 'mk_pausa': d.ms = Number(valor(b, 'MS')); break;
      case 'mk_repetir': d.n = Number(valor(b, 'N')); break;
      case 'mk_som': d.som = valor(b, 'S'); break;
      case 'mk_tom': d.freq = Number(valor(b, 'F')); break;
      case 'mk_digital': d.pino = valor(b, 'P'); d.v = Number(valor(b, 'V')) ? 1 : 0; break;
    }
    return d;
  }

  // Sequência de instruções a partir de um bloco, com os corpos aninhados
  function sequencia(b) {
    const out = [];
    for (; b; b = b.getNextBlock()) {
      if (!b.isEnabled()) continue;
      const d = descrever(b);
      if (b.type === 'mk_repetir') d.corpo = sequencia(b.getInputTargetBlock('DO'));
      if (b.type === 'mk_se') { d.sim = sequencia(b.getInputTargetBlock('SIM')); d.nao = sequencia(b.getInputTargetBlock('NAO')); }
      out.push(d);
    }
    return out;
  }

  // Lista plana (com profundidade e o bloco que a contém)
  function achatar(seq, dentroDe = null, prof = 0, acc = []) {
    for (const d of seq) {
      acc.push(Object.assign({ dentroDe, prof }, d));
      if (d.corpo) achatar(d.corpo, d.tipo, prof + 1, acc);
      if (d.sim) achatar(d.sim, d.tipo, prof + 1, acc);
      if (d.nao) achatar(d.nao, d.tipo, prof + 1, acc);
    }
    return acc;
  }

  function analisar(ws) {
    const eventos = [];
    const soltos = [];
    for (const top of ws.getTopBlocks(true)) {
      if (top.isShadow()) continue;
      const ev = EVENTOS[top.type];
      if (ev) {
        const seq = sequencia(top.getInputTargetBlock('DO'));
        eventos.push({ chave: ev(top), id: top.id, seq, plano: achatar(seq) });
      } else if (top.previousConnection || top.outputConnection) {
        soltos.push({ tipo: top.type, id: top.id, plano: achatar(sequencia(top)) });
      }
    }
    const a = {
      eventos,
      soltos,
      // ajudas para as regras
      evento(chave) { return eventos.find(e => e.chave === chave) || null; },
      eventosDe(prefixo) { return eventos.filter(e => e.chave.startsWith(prefixo)); },
      todos() { return eventos.flatMap(e => e.plano.map(p => Object.assign({ evento: e.chave }, p))); },
      soltosPlano() { return soltos.flatMap(s => s.plano); },
      existe(tipo) { return this.todos().some(p => p.tipo === tipo) || this.soltosPlano().some(p => p.tipo === tipo); },
      vazio() { return eventos.length === 0 && soltos.length === 0; },
      assinatura: '',
    };
    a.assinatura = JSON.stringify([eventos.map(e => [e.chave, e.plano.map(p => [p.tipo, p.icone, p.ms, p.n, p.som, p.freq, p.pino, p.v, p.prof])]), soltos.map(s => s.plano.map(p => p.tipo))]);
    return a;
  }

  F.analisar = analisar;

  // Ajudas para as regras dos pacotes (lêem um evento da análise)
  F.ajudasTutor = {
    icones: (ev, nome) => ev ? ev.plano.filter(p => p.tipo === 'mk_icone' && (!nome || p.icone === nome)) : [],
    tem: (ev, tipo) => !!ev && ev.plano.some(p => p.tipo === tipo),
    soltoCom: (a, tipo) => a.soltosPlano().some(p => p.tipo === tipo),
  };
})();
