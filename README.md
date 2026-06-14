# Faísca

**Editor de programação por blocos que liga a microcontroladores pelo browser.**
Estilo Scratch (engine [Blockly](https://developers.google.com/blockly)), para
escolas e maker. Liga a **Arduino** (Web Serial + Firmata) e **micro:bit**
(Web Bluetooth) sem instalar nada — ou corre no **simulador**.

Projeto aberto do [Buinho FabLab](https://buinho.eu) · Messejana, Alentejo.
→ `blocks.buinho.education`

## Fatia 1 (esta versão)
- Editor de blocos (renderer *zelos* = aspecto Scratch): snap magnético e
  compatibilidade de conectores por tipo (peças booleanas só em ranhuras de condição, etc.).
- Blocos de electrónica: LED, servo, esperar, repetir, para sempre, se/senão,
  botão, sensor de luz, comparações, monitor.
- Camada de **adaptador de hardware**: os mesmos blocos falam com Simulador,
  Arduino ou micro:bit. Trocar de placa não muda o programa.
- Interpretador no cliente + monitor série + “ver código” (Arduino equivalente).

Sem contas nem currículo ainda — é o *playground*. As lições (dados) e as
turmas/progresso são fatias seguintes (ver `strategy/modelo-faisca.md` no buinho-os).

## Como usar
Abre `index.html`. Escolhe a placa em cima, monta blocos, **▶ Correr**.
Arduino/micro:bit precisam de Chrome ou Edge (PC ou Android); o simulador corre
em qualquer browser. Para ligar a placas reais, ver `DEPLOY.md`.

---

# Faísca (EN)

**Block-based coding editor that talks to microcontrollers from the browser.**
Scratch-like (built on [Blockly](https://developers.google.com/blockly)), for
schools and makers. Connects to **Arduino** (Web Serial + Firmata) and **micro:bit**
(Web Bluetooth) with no install — or runs in the **simulator**.

Open project by [Buinho FabLab](https://buinho.eu), Messejana, Portugal.

Open `index.html`, pick a board, snap blocks, press Run. See `DEPLOY.md` to connect
real hardware. Slice 1 = the standalone playground; lessons and classrooms come next.

## Licença · License
[CC BY-SA 4.0](LICENSE). Usa, adapta e partilha — mantém a atribuição e a mesma licença.
