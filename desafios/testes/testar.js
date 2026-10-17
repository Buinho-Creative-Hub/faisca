/* Faísca Desafios — testes automáticos (Chromium sem janela).
 *
 *   node testes/testar.js            testa todos os pacotes (gabi, nico)
 *   node testes/testar.js nico       só um pacote
 *
 * Para cada desafio: carrega uma solução, dispara os acontecimentos como faria
 * a criança e confirma que a validação por comportamento (ok) dá verdadeiro.
 * Confirma também que um programa errado NÃO passa, que a mascote responde à
 * ajuda (3 níveis), que a gambiarra entra e sai, e que o .hex se gera.
 * Precisa do playwright-core (NODE_PATH) e do Chromium (PLAYWRIGHT_BROWSERS_PATH ou CHROMIUM).
 */
'use strict';
const path = require('path');
const { chromium } = require('playwright-core');

const RAIZ = path.resolve(__dirname, '..');
const url = p => 'file://' + path.join(RAIZ, 'index.html') + '?todos&p=' + p;

// blocos usados nas soluções
const tom = (f = 262) => `<block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">${f}</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value>`;
const icone = n => `<block type="mk_icone"><field name="I">${n}</field>`;
const pausa = ms => `<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`;
const digital = (p, v) => `<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">${p}</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
const seq = (...bs) => bs.reduceRight((acc, b) => b + (acc ? `<next>${acc}</next>` : '') + '</block>', '');
const ev = (tipo, campos, corpo) => `<block type="${tipo}" x="40" y="40">${campos || ''}<statement name="DO">${corpo}</statement></block>`;
const xml = (...bs) => '<xml>' + bs.join('') + '</xml>';

const CASOS = {
  gabi: [
    { ok: xml(ev('mk_agitar', '', seq(icone('Happy')))), errado: xml(ev('mk_agitar', '', seq(icone('Sad')))), fazer: ['agitar'] },
    {
      ok: xml(ev('mk_logo', '', `<block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO">${seq(icone('Heart'), pausa(200), icone('SmallHeart'), pausa(200))}</statement></block>`)),
      errado: xml(ev('mk_logo', '', `<block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value><statement name="DO">${seq(icone('Heart'), icone('SmallHeart'))}</statement></block>`)),
      fazer: ['logo'], espera: 2600,
    },
    {
      ok: xml(ev('mk_botao', '', seq(icone('Happy'))), ev('mk_botao', '<field name="B">B</field>', seq(icone('Sad'))).replace('y="40"', 'y="200"')),
      errado: xml(ev('mk_botao', '', seq(icone('Happy')))),
      fazer: ['botao:A', 'botao:B'],
    },
    {
      ok: xml(ev('mk_botao', '<field name="B">AB</field>', seq('<block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value>'))),
      errado: xml(ev('mk_botao', '<field name="B">AB</field>', seq(icone('Happy')))),
      fazer: ['botao:AB'],
    },
    { ok: xml(ev('mk_pino_tocado', '<field name="P">P1</field>', seq(tom()))), errado: xml(ev('mk_pino_tocado', '<field name="P">P1</field>', seq(icone('Happy')))), fazer: ['pino:P1'] },
    {
      ok: xml(ev('mk_pino_tocado', '<field name="P">P1</field>', seq(digital('P2', 1), tom(), digital('P2', 0)))),
      errado: xml(ev('mk_pino_tocado', '<field name="P">P1</field>', seq(digital('P2', 1), tom(), digital('P2', 1)))),
      fazer: ['pino:P1'], espera: 1800,
    },
  ],
  nico: [
    { ok: xml(ev('mk_agitar', '', seq(icone('Happy')))), errado: xml(ev('mk_agitar', '', seq(icone('Asleep')))), fazer: ['agitar'] },
    {
      ok: xml(ev('mk_pino_tocado', '<field name="P">P1</field>', seq(icone('Yes'), tom(523)))),
      // a gambiarra do Nico: certo por dentro, mas no bloco errado (agitar em vez do pino)
      errado: xml(ev('mk_agitar', '', seq(icone('Yes'), tom(523)))),
      fazer: ['pino:P1', 'agitar'], espera: 1800,
    },
  ],
};

async function testarPacote(browser, p) {
  const page = await browser.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(String(e)));
  await page.goto(url(p));
  await page.waitForFunction(() => window.Faisca && window.Faisca.app);
  const falhas = [];
  const info = await page.evaluate(() => ({ id: Faisca.PACOTE.id, n: Faisca.DESAFIOS.length, mascote: Faisca.PACOTE.mascote.nome, titulo: document.title }));
  if (info.id !== p) falhas.push(`pacote carregado é «${info.id}», esperava «${p}»`);

  const correr = async (i, x, fazer, espera = 1200) => {
    await page.evaluate(([i, x]) => {
      const A = Faisca.app;
      A.mudarDesafio(i);
      A.ws.clear();
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws);
    }, [i, x]);
    await page.waitForTimeout(500);            // 250 ms de espera do editor + arranque
    for (const k of fazer) { await page.evaluate(k => Faisca.app.entrada(k, 'ecra'), k); await page.waitForTimeout(150); }
    await page.waitForTimeout(espera);
    return page.evaluate(i => !!Faisca.DESAFIOS[i].ok(Faisca.app.registo()), i);
  };

  for (const [i, c] of CASOS[p].entries()) {
    if (!(await correr(i, c.ok, c.fazer, c.espera))) falhas.push(`desafio ${i + 1}: a solução certa não passou`);
    if (await correr(i, c.errado, c.fazer, c.espera)) falhas.push(`desafio ${i + 1}: um programa errado passou`);
  }
  if (CASOS[p].length !== info.n - 1) falhas.push(`há ${info.n - 1} desafios com validação e só ${CASOS[p].length} casos de teste`);

  // mascote: área vazia → ajuda; depois 3 níveis numa regra
  const m = await page.evaluate(() => {
    const A = Faisca.app; const out = [];
    A.mudarDesafio(0); A.ws.clear();
    A.tutor.programaMudou(Faisca.analisar(A.ws));
    A.tutor.pedirAjuda(); out.push(document.getElementById('tutorTexto').textContent);
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom('<xml><block type="mk_icone" x="300" y="40"><field name="I">Happy</field></block></xml>'), A.ws);
    A.tutor.programaMudou(Faisca.analisar(A.ws));
    for (let k = 0; k < 3; k++) { A.tutor.pedirAjuda(); out.push(document.getElementById('tutorTexto').textContent + ' |' + (document.getElementById('tutorNivel').getAttribute('aria-label') || '')); }
    return { out, nome: document.querySelector('.tutor-nome').textContent, img: document.getElementById('tutorImg').getAttribute('src') };
  });
  if (m.nome !== info.mascote) falhas.push(`balão mostra «${m.nome}»`);
  if (!m.img.startsWith('img/' + p + '/')) falhas.push(`sprite fora da pasta do pacote: ${m.img}`);
  if (new Set(m.out).size !== 4) falhas.push('a ajuda repetiu a mesma pista: ' + JSON.stringify(m.out));
  if (!/pista 3 de 3/.test(m.out[3])) falhas.push('não chegou ao nível 3 de pista');

  // regras do detetive dos circuitos: cada programa a meio caminho reconhece a dificuldade certa
  if (p === 'nico') {
    const pino = c => xml(ev('mk_pino_tocado', '<field name="P">P1</field>', c));
    const esperado = [
      [xml(), null],
      [xml(ev('mk_agitar', '', seq(icone('Yes')))), 'sem_pino'],
      [pino('') , 'sem_sinal'],
      [pino('').replace('</block></xml>', '</block>' + `<block type="mk_icone" x="300" y="300"><field name="I">Yes</field></block></xml>`), 'sinal_fora'],
      [pino(seq(tom())), 'sem_icone'],
      [pino(seq(icone('Happy'), tom())), 'sem_visto'],
      [pino(seq(icone('Yes'))), 'sem_som'],
      [pino(seq(icone('Yes'), tom())), null],
    ];
    const ids = await page.evaluate(casos => casos.map(([x]) => {
      const A = Faisca.app; A.mudarDesafio(1); A.ws.clear();
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws);
      A.tutor.programaMudou(Faisca.analisar(A.ws));
      return A.tutor.regraAtiva ? A.tutor.regraAtiva.id : null;
    }), esperado);
    esperado.forEach(([, id], k) => { if (ids[k] !== id && !(k === 0)) falhas.push(`detetive caso ${k}: regra «${ids[k]}», esperava «${id}»`); });
    const pronto = await page.evaluate(() => Faisca.TUTOR.DESAFIOS[1].parecePronto(Faisca.analisar(Faisca.app.ws)));
    if (!pronto) falhas.push('detetive: programa certo não parece pronto («agora experimenta»)');
  }

  // gambiarra: entra com o programa da mascote e volta ao da criança
  const g = await page.evaluate(() => {
    const A = Faisca.app; A.mudarDesafio(0);
    A.estado.feitos = Math.max(A.estado.feitos, 1);
    A.entrarGambiarra(); const dentro = A.ws.getAllBlocks(false).length;
    A.sairGambiarra(true); return { dentro, texto: document.getElementById('tutorTexto').textContent };
  });
  if (!g.dentro) falhas.push('a gambiarra não carregou programa');

  // .hex
  await page.evaluate(x => { const A = Faisca.app; A.ws.clear(); Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(x), A.ws); }, CASOS[p][CASOS[p].length - 1].ok);
  const hex = await page.evaluate(async () => { try { const h = await Faisca.gerarHex(Faisca.app.ws); return h.slice(0, 1) + ':' + h.length; } catch (e) { return 'ERRO ' + e.message; } });
  if (!hex.startsWith('::')) falhas.push('.hex: ' + hex);

  if (erros.length) falhas.push('erros na página: ' + erros.join(' / '));
  await page.close();
  return { p, info, falhas, mensagens: m.out, gambiarra: g.texto, hex };
}

(async () => {
  const pacotes = process.argv[2] ? [process.argv[2]] : Object.keys(CASOS);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--allow-file-access-from-files'] });
  let mal = 0;
  for (const p of pacotes) {
    const r = await testarPacote(browser, p);
    console.log(`\n== ${p} (${r.info.mascote}, ${r.info.n} desafios) — ${r.info.titulo}`);
    r.mensagens.forEach(t => console.log('   ajuda:', t));
    console.log('   gambiarra →', r.gambiarra, '| hex', r.hex);
    if (r.falhas.length) { mal++; r.falhas.forEach(f => console.log('   FALHA:', f)); } else console.log('   OK');
  }
  await browser.close();
  process.exit(mal ? 1 : 0);
})();
