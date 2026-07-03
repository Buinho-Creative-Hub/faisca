# Faísca · programa companheiro do micro:bit

O micro:bit precisa deste pequeno programa para falar com a Faísca por Bluetooth.
Ele trata do **LED** (ecrã + pino P0), do **servo** (P1) e do sensor de
**temperatura/humidade DHT11** (P2).

## Como instalar (5 minutos)

1. Abre [makecode.microbit.org](https://makecode.microbit.org) → **Novo projeto** (chama-lhe `faisca`).
2. **Extensões** (roda dentada → Extensions):
   - pesquisa **bluetooth** e adiciona a extensão oficial *Bluetooth*
     (o MakeCode avisa que remove a *radio* — aceita);
   - cola este URL e adiciona: `https://github.com/alankrantas/pxt-DHT11_DHT22`
     (é a biblioteca do DHT11/DHT22).
3. Roda dentada → **Project Settings** → ativa **No Pairing Required** (simplifica a ligação).
4. Muda o editor para **JavaScript** e cola o conteúdo de
   [`faisca-microbit.js`](faisca-microbit.js) por cima do que lá estiver.
5. **Download** para o micro:bit (arrastar o `.hex` para o disco MICROBIT).

## Ligações (pinos de crocodilo)

| Componente | Pino do micro:bit | Notas |
|---|---|---|
| LED externo (opcional) | **P0** + GND | com resistência de 220 Ω; o ecrã 5×5 também mostra |
| Servo (SG90) | sinal → **P1** · vermelho → 3V · castanho → GND | servos pequenos; para mais força usar alimentação externa com GND comum |
| DHT11 | DATA → **P2** · VCC → 3V · GND → GND | módulos de 3 pinos já trazem a resistência de pull-up |

## Na Faísca

Placa: **micro:bit (Bluetooth)** → **Ligar** → escolher "BBC micro:bit".
Os blocos *mover servo*, *temperatura °C (DHT11)* e *humidade % (DHT11)* passam a
falar com o hardware real. Sem DHT11 ligado, a Faísca fica com os últimos valores
recebidos (arranque: 21 °C / 50 %).

## Protocolo (para referência)

| Direção | Mensagem | Significado |
|---|---|---|
| Faísca → micro:bit | `L0` / `L1` | LED desliga/liga |
| Faísca → micro:bit | `S<0-180>` | ângulo do servo (P1) |
| Faísca → micro:bit | `T<texto>` | mostrar texto no ecrã |
| micro:bit → Faísca | `B0` / `B1` | botão A |
| micro:bit → Faísca | `L<0-1020>` | nível de luz (escala do A0) |
| micro:bit → Faísca | `T<n>` | temperatura °C (DHT11) |
| micro:bit → Faísca | `H<n>` | humidade % (DHT11) |

> ⚠️ Ainda **por validar com placa física** — testar na primeira sessão com
> hardware real e afinar aqui o que for preciso.
