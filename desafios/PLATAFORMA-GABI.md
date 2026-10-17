# Plataforma Gabi — como está feita e como fazer outra versão

> **Actualização 17 Out 2026 (tarde) — motor + pacotes.** A plataforma deixou de ter a Gabi escrita no código.
> Mascote, marca, mensagens e desafios vivem num **pacote** (`pacotes/<id>.js`); o resto é motor comum.
> Há dois pacotes: **`gabi`** (o original, conteúdo igual) e **`nico`** (Nico, o Podengo do Buinho Educativo).
> `index.html` abre a Gabi; `index.html?p=nico` (ou `nico.html` / `Abrir Nico.bat`) abre o Nico.
> A receita da secção 6 passa a ser: **criar um pacote**, não copiar a pasta. Ver § 7.

> Documento de referência da **Faísca Desafios com a Gabi** (repo `faisca`, pasta `desafios/`).
> Serve para manter esta versão e para criar versões novas — por exemplo a versão do Buinho no Alentejo —
> sem recomeçar do zero. Escrito a 17 Out 2026, depois de testada com micro:bit V2 verdadeiro.

---

## 1. O que é, numa frase

Um editor de blocos **com o aspecto exacto do MakeCode**, reduzido ao essencial, onde crianças de ~10 anos sem
experiência fazem **desafios em sequência** (cada desafio desbloqueia blocos novos), testam num **micro:bit desenhado
no ecrã**, são acompanhadas por uma **tutora-mascote** (a Gabi, capivara da gambiarra) que dá pistas sem resolver por
elas, e no fim **gravam o programa no micro:bit verdadeiro por cabo USB** — tudo **sem internet**.

## 2. Princípios (o que não se negocia numa versão nova)

1. **Visual igual ao MakeCode.** As crianças e os professores reconhecem os blocos e passam depois para o MakeCode
   sem estranhar. Nunca o aspecto Scratch/zelos «parecido».
2. **Pouco de cada vez.** Cada desafio traz 1–3 blocos novos. A caixa de blocos é cumulativa.
3. **Validação por comportamento, não por presença de blocos.** O desafio fica feito quando o micro:bit *faz* o que
   se pede (vê-se no registo de acontecimentos), não quando o bloco certo está na área.
4. **A mascote ajuda, não resolve.** Pistas em 3 níveis, só sobe de nível quando a criança pede. Sozinha, a mascote
   só oferece o nível 1.
5. **Errar faz parte.** A mascote também erra («gambiarra da Gabi») e a criança repara.
6. **Offline e sem custos.** Abre com duplo clique, funciona sem internet, sem IA paga, sem contas.
7. **Motor pedagógico separado da interface.** As regras e mensagens são dados; a apresentação só mostra.

## 3. Mapa dos ficheiros

| Ficheiro | Papel | Mexe-se numa versão nova? |
|---|---|---|
| `index.html` | estrutura da página: topo, missão, micro:bit do ecrã, editor, Gabi, janelas | pouco (textos, marca) |
| `css/faisca.css` | aspecto (cores, letra Asap, balão da mascote, janelas) | cores/marca |
| `js/blocks.js` | **renderer `makecode`** (geometria medida no pxt), tema com as cores das categorias, definição dos blocos, listas de ícones/sons/notas | só para blocos novos |
| `js/sim.js` | micro:bit desenhado: LEDs, botões, logotipo, pinos, som (WebAudio), luz | raramente |
| `js/motor.js` | corre o programa de blocos no ecrã (acontecimentos, gerações, destaque do bloco a correr) e escreve o **registo** | só para blocos novos |
| `pacotes/<id>.js` | **o pacote**: marca, mascote (nome, artigo, sprites), mensagens gerais e a lista de desafios, cada um com o seu `tutor` (regras, pistas, sucesso, gambiarra) | **sim — é o conteúdo** |
| `js/pacote.js` | escolhe o pacote pelo `?p=` (lista `PACOTES`) | só para registar um pacote novo |
| `js/desafios.js` | base: blocos da caixa (`XML_CAIXA`), verificações (`depois`, `visiveis`, `algumPino`, `causou`), `caixa(n)`, `registarPacote` | só para blocos novos |
| `js/tutor-analise.js` | lê o espaço de blocos e devolve uma estrutura simples (eventos, sequências, blocos soltos); ajudas `icones/tem/soltoCom` | não |
| `js/tutor-motor.js` | decide *quando* falar (inactividade, teste falhado, calma, correcção, «agora experimenta») | não (afinar tempos) |
| `js/tutor-ui.js` | mostra a mensagem: sprite do pacote, balão, bolinhas do nível, recolher/abrir | não |
| `js/hex.js` | **blocos → MicroPython → .hex** (envio por USB) | só para blocos novos |
| `js/ble.js` | Bluetooth opcional (precisa do programa companheiro no micro:bit) | não |
| `js/app.js` | cola tudo: estado guardado no browser, caminho de desafios, festa, modo gambiarra, botão Enviar | pouco |
| `img/<id>/01…08.png` | os estados da mascote | **sim — nova mascote** |
| `vendor/` | Blockly 12.5.1, tradução PT, `microbit-fs.js`, `micropython-v2.js` (firmware) | não |
| `Abrir Faisca.bat` | abre no Chrome/Edge a partir da pasta | não |
| `estados.html?p=<id>` | montra dos estados, com exemplos tirados do pacote (para validar ilustrações) | não |
| `testes/testar.js` | testes automáticos de todos os pacotes (headless) | acrescentar os casos do pacote |
| `TESTES-GABI.md` | 13 cenários de teste da mascote | acrescentar os novos |

## 4. Como funciona por dentro

```
 criança arrasta blocos ─► Blockly (renderer makecode)
                             │  change (250 ms)
                             ├─► tutor-analise ─► tutor-motor ─► tutor-ui  (a mascote fala)
                             └─► motor.arrancar()
 botões do ecrã / micro:bit ─► motor.acontecimento('agitar'|'logo'|'botao:A'…)
                             └─► executa blocos ─► sim (+ micro:bit por BT) ─► REGISTO
 a cada 400 ms: desafio.ok(REGISTO) ? festa + desbloqueia : —
 botão Enviar ─► hex.js: blocos → main.py → dentro do MicroPython V2 → ficheiro .hex
```

### 4.1 Blocos com aspecto MakeCode (`blocks.js`)
- Renderer `makecode` = subclasse do zelos com as medidas tiradas do renderizador oficial do MakeCode (pxt):
  letra **Consolas 600, 12 pt (16 px)**, cantos, alturas de entradas, «pílulas» brancas para os menus de valor.
- Tema com as cores das categorias do MakeCode: entrada (rosa), básico (azul), ciclos (verde), lógica, música
  (laranja-avermelhado), pinos (vermelho-escuro).
- Blocos actuais: `mk_agitar`, `mk_logo`, `mk_botao` (A/B/A+B), `mk_pino_tocado` (P0/P1), `mk_sempre`,
  `mk_icone` (10 ícones), `mk_limpar`, `mk_pausa`, `mk_repetir`, `mk_se` (se/senão), `mk_escuro`, `mk_botao_premido`,
  `mk_som` (10 sons V2), `mk_tom` (notas Dó–Dó alto, batidas), `mk_digital` (P0/P1/P2), e os menus-sombra
  (`mk_num`, `mk_pausa_menu`, `mk_nota_menu`, `mk_batida_menu`, `mk_som_menu`, `mk_pino_menu`).

### 4.2 Motor e registo (`motor.js`)
- Cada `arrancar()` cria uma **geração**; mudar o programa mata a geração anterior (nada fica a correr às escondidas).
- Um acontecimento não se empilha se o mesmo bloco ainda está a correr (como no micro:bit).
- `mostrar ícone` espera só 20 ms (no MakeCode são 600): sem `pausa` os desenhos passam depressa demais — **é de
  propósito**, é o que o desafio 2 ensina.
- Tudo o que entra e sai vai para o **registo**: `in agitar`, `in botao:A`, `out icone:Happy`, `out som:giggle`,
  `out tom:262`, `out digital:P2:1`. As verificações dos desafios só lêem o registo.

### 4.3 Verificação dos desafios (`desafios.js`)
Ajudas prontas: `depois(registo, entrada, teste)` — houve esta saída até 8 s depois desta entrada?;
`visiveis(registo, entrada, ícone, minMs=120)` — quantas vezes o ícone ficou visível tempo suficiente para se ver;
`algumPino(registo, teste)`. Um desafio é um objecto:

```js
{ titulo: 'Acorda-o',
  missao: 'Faz o micro:bit sorrir quando o agitas.',
  passos: ['Arrasta o bloco «em agitar».', '…'],
  material: 'micro:bit',
  novos: ['mk_agitar', 'mk_icone'],           // entram na caixa a partir deste desafio
  teste: 'agitar',                             // botão que o micro:bit do ecrã destaca
  ok: r => depois(r, 'agitar', s => s.includes('icone:Happy')) }
```

### 4.4 A mascote — motor pedagógico
**Análise** (`tutor-analise.js`): transforma os blocos em `{eventos:[{chave, seq, plano}], soltos}` com ajudas
`evento('agitar')`, `eventosDe('pino:')`, `existe(tipo)`, `vazio()` e uma `assinatura` (muda quando o programa muda).

**Regras** (no pacote, em `tutor` de cada desafio — antes `gabi-regras.js`):
```js
{ boasVindas: ['boas_vindas', 'Olá! …'],
  parecePronto: a => …,               // o programa parece certo → «agora experimenta»
  testar: 'Parece-me bem! Mas só acredito vendo: carrega em AGITAR.',
  regras: [                            // pela ordem; a primeira activa é a que conta
    { id: 'sem_agitar',
      ativa: a => !a.evento('agitar'),
      pistas: [['curiosa', 'nível 1 — pergunta conceptual'],
               ['dica',    'nível 2 — orienta para onde procurar'],
               ['dica',    'nível 3 — diz o gesto concreto']],
      corrigido: 'Boa! Agora o micro:bit já está à escuta.' } ],
  sucesso: 'texto da festa', extensao: 'desafio extra se acabou depressa',
  gambiarra: { xml: '<programa com um erro>', pedido: 'Fiz uma gambiarra… ajudas-me?' } }
```
Mais as **regras comuns** (ex.: blocos soltos) e as **mensagens gerais** (convite, calma, vazio, teste falhado,
obrigada pela gambiarra).

**Quando fala** (`tutor-motor.js`):

| Situação | O que faz | Tempo |
|---|---|---|
| entra num desafio | boas-vindas | — |
| programa parece pronto e ninguém testou | «agora experimenta» (presença ≠ execução) | 7 s |
| teste sem sucesso com dificuldade reconhecida | pista **nível 1** (nunca mais alto sozinha) | 4 s após o teste |
| 3 testes seguidos sem sucesso | estado **calma** («a mim também não funcionou à primeira») | — |
| criança carrega em Ajuda | sobe um nível (1→2→3) na dificuldade activa | — |
| criança resolve sozinha depois de uma pista | **incentivo** específico (`corrigido`) | — |
| parada | convite discreto para pedir ajuda | 45 s |
| acabou depressa (1.ª vez) | festa + **extensão** | < 2 min |
| desafio já feito | botão «gambiarra da Gabi»: carrega um programa com um erro para a criança reparar | — |

Mensagens que a mascote decide sozinha têm pelo menos **15 s** entre si; não repete a mesma frase.

**Apresentação** (`tutor-ui.js`): um sprite por estado (`boas_vindas, curiosa, a_pensar, surpreendida, dica,
celebrar, incentivar, calma`), balão com cor por tipo, 3 bolinhas para o nível da pista. Em ecrã estreito começa
recolhida e mostra só um sinal; abre sozinha apenas quando a criança pediu ajuda.

### 4.5 Envio para o micro:bit (`hex.js`)
- Traduz os blocos para **MicroPython**: cada evento vira uma função; um ciclo `while True` vigia agitar
  (`accelerometer.was_gesture('shake')`), logotipo e pinos (por flanco), botões A/B **ao largar** e A+B quando os dois
  estão carregados (como no MakeCode), e corre o «para sempre».
- Se o P0 for usado como tecla, o som sai só pelo altifalante (`pin=None`) para não interferir.
- O `main.py` é metido dentro do **MicroPython oficial V2** com `@microbit/microbit-fs` (empacotado com esbuild em
  `vendor/microbit-fs.js`). O firmware vem em `vendor/micropython-v2.js` como `window.FAISCA_MICROPYTHON` porque em
  `file://` o `fetch` não funciona; só é carregado quando se carrega em Enviar.
- Janela: **Gravar** (Chrome/Edge: escolhe-se a pasta MICROBIT) ou **Descarregar ficheiro** e arrastar.
- **Só micro:bit V2.**

### 4.6 Bluetooth (opcional)
`ble.js` + programa companheiro (repo `microbit-desafios`). Faz o micro:bit verdadeiro mexer ao vivo e contar para os
desafios. Exige gravar o companheiro em cada placa antes. Em sala, o **.hex por USB é o caminho principal**.

## 5. Testes
- **Desafios:** script em headless Chromium carrega soluções por XML, dispara acontecimentos e confirma `ok()` dos 6.
- **Mascote:** `TESTES-GABI.md` (13 cenários, incluindo o diálogo do desafio 2 do guião).
- **.hex:** gera um programa com todos os blocos, valida a sintaxe do Python e confirma que o `main.py` lido de volta
  do .hex é igual. **Testado num micro:bit V2 verdadeiro (17 Out 2026).** Por testar com placa: piano de fruta
  (P0/P1 ao GND) e A+B.

## 6. Receita — fazer uma versão nova (ex.: Buinho no Alentejo)

1. **Criar um pacote** `pacotes/<id>.js` (copiar `pacotes/nico.js` como modelo) e juntar o `<id>` a `PACOTES`
   em `js/pacote.js`. Não se copia a pasta nem se mexe no motor.
2. **Mascote:** PNG com fundo transparente em `img/<id>/`, um por estado; mapear em `mascote.sprites`.
   Validar em `estados.html?p=<id>`. Ilustrações aprovadas pelo Carlos antes de entrar.
3. **Voz da mascote:** `gerais`, `comuns` e o `tutor` de cada desafio. Regras de escrita: frases curtas;
   nível 1 pergunta, nível 2 orienta, nível 3 diz o gesto; nunca dar a solução inteira sozinha; tratar por «tu»;
   a mascote também se engana; atenção ao género (`artigo`).
4. **Desafios:** título, missão, passos (≤ 3, para o micro:bit do ecrã caber), material, blocos novos, `ok`.
5. **Blocos novos** (se precisar — ex.: sensores): definir em `blocks.js` com a cor da categoria MakeCode certa,
   executar em `motor.js` (e escrever no registo), simular em `sim.js`, traduzir em `hex.js`, ler em
   `tutor-analise.js` se as regras precisarem do valor; juntar o XML da caixa em `xml` do pacote.
6. **Marca:** `marca` no pacote; cores num bloco `html[data-pacote="<id>"]` no fim de `css/faisca.css`.
7. **Testar:** casos do pacote em `testes/testar.js`, mascote pelos cenários, e **gravar um .hex num micro:bit verdadeiro**.
8. **Distribuir:** zip da pasta + um `.bat`/`.html` de entrada por pacote. Registar no `CATALOGO-APPS.md` do `buinho-os`.

### Ideias já levantadas para versões seguintes
- **Sentinela (citizen sensing):** blocos de som, luz e temperatura do micro:bit V2 (e, do kit de citizen sensing,
  humidade do solo, poeiras, distância); a mascote mede o lugar — mapa sensorial da escola, guardiã da horta,
  «onde respiramos pior», limite de barulho decidido pela turma. Registo de dados do micro:bit V2 para tabelas.
- **Toy hacking:** a mascote em peluche com o micro:bit dentro (abraço = interruptor de alumínio e esponja, festa no
  nariz = logotipo, abanar = tonta); brinquedos abertos e medidos com multímetro; o micro:bit «ouve» a sirene ou «vê»
  as luzes do brinquedo sem fios entre os dois (ligar motores exige relé/transístor).
- **Circuitos de massinha** como teclas (massa caseira com sal conduz melhor que a comprada).
- **Estufa gambiarra** (UFV): blocos de solo e relé.
- **Versão Alentejo — Nico, o Podengo do Buinho Educativo** (decisão de 17 Out 2026, registo em `buinho-os`
  `memory/sessoes/2026-10-17_nico-podengo-buinho-educativo.md`): mesma plataforma, conteúdo do Buinho Educativo
  (Messejana, STEAM, natureza, maker, reparação) — **não copiar mecanicamente os desafios da Gabi**. Os 8 estados do
  Nico mapeiam assim nos estados do motor: boas-vindas → `boas_vindas` · curioso → `curiosa` · a pensar → `a_pensar` ·
  surpreendido → `surpreendida` · a dar uma dica → `dica` · a celebrar → `celebrar` · a inventar → `incentivar`
  (ou novo estado para a extensão) · trapalhão/calmo → `calma` e pedido de gambiarra. Atenção ao género nos textos
  (o Nico é «ele»). Sprites finais: 8 PNG RGBA, estilo 4 minimalista aprovado; não usar os GIF/ZIP anteriores.

## 7. Motor + pacotes (desde 17 Out 2026)

**Um pacote** (`pacotes/<id>.js`) chama `Faisca.registarPacote({...})` com:

```js
{ id: 'nico', titulo: 'Nico · Desafios do Buinho Educativo', hex: 'nico',   // nome do .hex
  chave: '…',                         // opcional: chave do progresso no browser
  marca:   { nome, sub, icone },      // topo da página
  mascote: { nome, descricao, artigo: 'o'|'a', pasta: 'img/nico/',
             sprites: { boas_vindas, curiosa, a_pensar, surpreendida, dica, celebrar, incentivar, testar, calma } },
  comuns, gerais,                     // regras comuns e mensagens gerais (inclui voltarPrograma)
  xml: { … },                         // opcional: blocos novos para a caixa
  desafios: [ { titulo, missao, passos, material, novos, teste, ok, livre?,
                tutor: { boasVindas, parecePronto, testar, regras, sucesso, extensao, gambiarra } } ] }
```

- O desafio e as pistas ficam **no mesmo objecto** — deixam de estar emparelhados só pela ordem de dois ficheiros.
- Os estados do motor são fixos; cada pacote decide que ilustração mostra em cada um (podem repetir-se).
  Novo estado `testar` («agora experimenta»): Gabi → curiosa; Nico → a inventar.
- `F.verif.causou(registo, teste, entrada)`: a saída tem de ter sido **causada** por aquela entrada (até à entrada
  seguinte). Usado no detetive do Nico para que tocar no pino e logo a seguir agitar não conte como certo.
- A Gabi mantém a chave do progresso (`faisca.desafios.v1`) e o nome do .hex: nada muda para quem já a usa.

**Testes:** `NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/testar.js` — para cada pacote, a solução
certa passa e um programa errado não passa, ajuda em 3 níveis, gambiarra entra e sai, .hex gera-se; no Nico,
cada programa a meio caminho reconhece a dificuldade certa.

### Pacote Nico (protótipo, Fase 1)
- **Desafio 1 — Acorda-o** (programação, reaproveitado da Gabi com a voz do Nico).
- **Desafio 2 — Detetive dos circuitos** (reparação, novo): o micro:bit vira testador de continuidade
  (crocodilos no P1 e no GND; ✔ + apito quando o circuito fecha). Na sala: testar materiais e encontrar o fio
  partido num brinquedo ou lanterna avariada. 6 dificuldades reconhecidas (sem pino, sinal fora, sem sinal,
  sem ícone, ícone errado, sem som); gambiarra do Nico: o detetive está dentro de «em agitar».
- **Livre — Inventa** uma engenhoca para Messejana.
- Tema Buinho Educativo (creme, azul, laranja); blocos com as cores do MakeCode.
- **Sprites provisórios** recortados da prancha aprovada (estilo 4) — `img/nico/_referencia-prancha-estilo4.png`.
  A prancha ainda diz «Farrusco»: é o nome antigo. Faltam os 8 PNG finais em alta resolução (mesmos nomes).
- Por fazer: percursos de natureza/fabricação/gambiarra; desafios de bancada (sem micro:bit a validar)
  como tipo novo; animação discreta por camadas (Fase 3); teste com crianças e com micro:bit verdadeiro.
