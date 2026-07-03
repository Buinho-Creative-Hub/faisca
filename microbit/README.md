# Faísca · programa companheiro do micro:bit

O micro:bit precisa deste pequeno programa para falar com a Faísca por Bluetooth.
Trata do **LED** (ecrã + P0), **servo** (P1), **DHT11** (P2), **buzzer** (altifalante
interno), **ultrassons HC-SR04** (P8/P12), **PIR** (P16), **LCD 16×2 I2C** (P19/P20)
e, opcionalmente, um **manípulo** (P3).

## Como instalar (5 minutos)

1. Abre [makecode.microbit.org](https://makecode.microbit.org) → **Novo projeto** (chama-lhe `faisca`).
2. **Extensões** (roda dentada → Extensions) — adiciona estas quatro:
   - pesquisa **bluetooth** → extensão oficial *Bluetooth*
     (o MakeCode avisa que remove a *radio* — aceita);
   - cola `https://github.com/alankrantas/pxt-DHT11_DHT22` (sensor DHT11/DHT22);
   - cola `https://github.com/microsoft/pxt-sonar` (ultrassons HC-SR04);
   - cola `https://github.com/1010Technologies/pxt-makerbit-lcd1602` (LCD 16×2 I2C).
3. Roda dentada → **Project Settings** → ativa **No Pairing Required** (simplifica a ligação).
4. Muda o editor para **JavaScript** e cola o conteúdo de
   [`faisca-microbit.js`](faisca-microbit.js) por cima do que lá estiver.
5. **Download** para o micro:bit (arrastar o `.hex` para o disco MICROBIT).

## Ligações

Com crocodilos só se chega a P0/P1/P2; do P3 para cima é preciso uma
*breakout board* (Kitronik, ElecFreaks, ~15 €). Não é obrigatório ligar tudo —
sem um componente, a Faísca simplesmente não recebe esses valores.

| Componente | Pinos | Notas |
|---|---|---|
| LED externo (opcional) | **P0** + GND | resistência de 220 Ω; o ecrã 5×5 também mostra |
| Servo (SG90) | sinal → **P1** · 3V · GND | para mais força, alimentação externa com GND comum |
| DHT11 | DATA → **P2** · 3V · GND | módulos de 3 pinos já têm pull-up |
| Buzzer | — | usa o altifalante interno do micro:bit **v2** |
| Ultrassons HC-SR04 | TRIG → **P8** · ECHO → **P12** · 3V · GND | pedir o modelo de 3,3 V (ou RCWL-1601) |
| PIR (movimento) | OUT → **P16** · 3V · GND | HC-SR501 mini de 3,3 V |
| LCD 16×2 (I2C) | SDA → **P20** · SCL → **P19** · GND · VCC | maioria dos módulos I2C quer 5 V — confirmar versão 3,3 V |
| Manípulo (pot 10 kΩ) | cursor → **P3** · 3V · GND | pôr `USAR_MANIPULO = true` no topo do programa (desliga o ecrã 5×5, partilham pinos) |

## Na Faísca

Placa: **micro:bit (Bluetooth)** → **Ligar** → escolher "BBC micro:bit".
Blocos com hardware real: *mover servo*, *tocar nota*, *LCD (escrever/mostrar/limpar)*,
*temperatura/humidade (DHT11)*, *distância (ultrassons)*, *manípulo*, *movimento (PIR)*.
Sem o sensor ligado, a Faísca fica com os últimos valores recebidos.

## Protocolo (para referência)

| Direção | Mensagem | Significado |
|---|---|---|
| Faísca → micro:bit | `L0` / `L1` | LED desliga/liga |
| Faísca → micro:bit | `S<0-180>` | ângulo do servo (P1) |
| Faísca → micro:bit | `Z<freq>:<ms>` | tocar nota no buzzer |
| Faísca → micro:bit | `C1<texto>` / `C2<texto>` / `C0` | LCD linha 1 / linha 2 / limpar |
| Faísca → micro:bit | `T<texto>` | mostrar texto no ecrã 5×5 |
| micro:bit → Faísca | `B0` / `B1` | botão A |
| micro:bit → Faísca | `L<0-1020>` | nível de luz (escala do A0) |
| micro:bit → Faísca | `T<n>` / `H<n>` | temperatura °C / humidade % (DHT11) |
| micro:bit → Faísca | `D<n>` | distância em cm (ultrassons) |
| micro:bit → Faísca | `P<0-100>` | manípulo |
| micro:bit → Faísca | `M0` / `M1` | movimento (PIR) |

> ⚠️ Ainda **por validar com placa física** — testar na primeira sessão com
> hardware real e afinar aqui o que for preciso (em particular os nomes exatos
> das funções das extensões LCD/sonar, que podem variar com a versão).
