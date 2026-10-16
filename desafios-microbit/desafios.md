# Desafios micro:bit

### @flyoutOnly true

## Olá! @showdialog

Vais dar vida a um micro:bit.

Em cada desafio aparecem **blocos novos**. Arrasta-os, experimenta no micro:bit do ecrã e, quando funcionar, passa o programa para o micro:bit verdadeiro.

## Desafio 1 · Acorda-o

**Faz o micro:bit sorrir quando o agitas.**

Arrasta ``||input:ao agitar||`` e põe lá dentro ``||basic:mostrar ícone||`` com a cara feliz.

Experimenta: no micro:bit do ecrã, carrega em **SHAKE**.

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Happy)
})
```

## Desafio 2 · Coração a bater

**Quando tocas no logótipo, o coração bate 4 vezes.**

O logótipo é o desenho dourado em cima do micro:bit. Usa ``||loops:repetir||`` com o coração grande, uma ``||basic:pausa||``, o coração pequeno e outra pausa.

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Happy)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    for (let index = 0; index < 4; index++) {
        basic.showIcon(IconNames.Heart)
        basic.pause(200)
        basic.showIcon(IconNames.SmallHeart)
        basic.pause(200)
    }
})
```

## Desafio 3 · Sim ou não?

**Botão A: cara feliz. Botão B: cara triste.**

Usa dois blocos ``||input:no botão||``. Muda a letra para **B** no segundo.

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Happy)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    for (let index = 0; index < 4; index++) {
        basic.showIcon(IconNames.Heart)
        basic.pause(200)
        basic.showIcon(IconNames.SmallHeart)
        basic.pause(200)
    }
})
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Sad)
})
```

## Desafio 4 · Faz barulho

**Carrega no A e no B ao mesmo tempo e o micro:bit ri-se.**

Usa ``||input:no botão A+B||`` com ``||music:tocar som||``. Escolhe o som que quiseres.

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Happy)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    for (let index = 0; index < 4; index++) {
        basic.showIcon(IconNames.Heart)
        basic.pause(200)
        basic.showIcon(IconNames.SmallHeart)
        basic.pause(200)
    }
})
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Sad)
})
input.onButtonPressed(Button.AB, function () {
    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.UntilDone)
})
```

## Desafio 5 · Piano de fruta

**Toca numa banana e o micro:bit toca uma nota.**

Liga um crocodilo do **P1** à banana (ou a papel de alumínio). Liga outro crocodilo ao **GND** e segura-o na mão.

Usa ``||input:quando o pin P1 é tocado||`` com ``||music:tocar tom||``.

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Happy)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    for (let index = 0; index < 4; index++) {
        basic.showIcon(IconNames.Heart)
        basic.pause(200)
        basic.showIcon(IconNames.SmallHeart)
        basic.pause(200)
    }
})
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Sad)
})
input.onButtonPressed(Button.AB, function () {
    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.UntilDone)
})
input.onPinPressed(TouchPin.P1, function () {
    music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
})
```

## Desafio 6 · Luz de fora

**Quando a banana toca, acende-se uma luz de fora.**

Liga um LED com crocodilos: a perna **comprida** ao **P2**, a perna **curta** ao **GND**.

Usa ``||pins:gravação digital||``: **1** acende antes da nota, **0** apaga depois.

```blocks
input.onGesture(Gesture.Shake, function () {
    basic.showIcon(IconNames.Happy)
})
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    for (let index = 0; index < 4; index++) {
        basic.showIcon(IconNames.Heart)
        basic.pause(200)
        basic.showIcon(IconNames.SmallHeart)
        basic.pause(200)
    }
})
input.onButtonPressed(Button.A, function () {
    basic.showIcon(IconNames.Happy)
})
input.onButtonPressed(Button.B, function () {
    basic.showIcon(IconNames.Sad)
})
input.onButtonPressed(Button.AB, function () {
    music.play(music.builtinPlayableSoundEffect(soundExpression.giggle), music.PlaybackMode.UntilDone)
})
input.onPinPressed(TouchPin.P1, function () {
    pins.digitalWritePin(DigitalPin.P2, 1)
    music.play(music.tonePlayable(262, music.beat(BeatFraction.Whole)), music.PlaybackMode.UntilDone)
    pins.digitalWritePin(DigitalPin.P2, 0)
})
```

## Conseguiste! @showdialog

Agora o micro:bit sorri, tem coração, responde, ri-se, toca piano e acende uma luz.

**Desafio livre:** muda os sons, as caras e as pausas. Inventa o teu próprio brinquedo!
