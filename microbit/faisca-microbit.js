/**
 * Faísca — programa companheiro para BBC micro:bit (v2)
 * Fala o mini-protocolo de texto da Faísca pela UART Bluetooth.
 *
 * EXTENSÕES NECESSÁRIAS no MakeCode (ver README.md nesta pasta):
 *   1. Bluetooth   (oficial — substitui a extensão "radio")
 *   2. DHT11_DHT22 (alankrantas) — https://github.com/alankrantas/pxt-DHT11_DHT22
 *   3. sonar       (Microsoft)   — https://github.com/microsoft/pxt-sonar
 *   4. MakerBit LCD1602 — https://github.com/1010Technologies/pxt-makerbit-lcd1602
 *
 * LIGAÇÕES (P3+ requerem breakout board):
 *   LED externo → P0        servo → P1         DHT11 (DATA) → P2
 *   sonar TRIG → P8, ECHO → P12                PIR → P16
 *   LCD 16×2 I2C → SDA P20, SCL P19            buzzer → altifalante interno (v2)
 *   manípulo → P3 (opcional: pôr USAR_MANIPULO em true; desliga o ecrã 5×5)
 *
 * PROTOCOLO (uma linha por comando):
 *   Faísca → micro:bit:  L0/L1 (LED)  S<âng> (servo)  Z<freq>:<ms> (buzzer)
 *                        C1<txt>/C2<txt> (LCD linha 1/2)  C0 (limpar LCD)  T<txt> (ecrã)
 *   micro:bit → Faísca:  B0/B1 (botão A)  L<luz 0-1020>  T<temp °C>  H<hum %>
 *                        D<distância cm>  P<manípulo 0-100>  M<0/1 movimento>
 */

const USAR_MANIPULO = false  // true → lê o manípulo em P3 e desliga o ecrã 5×5 (partilham pinos)

bluetooth.startUartService()
if (USAR_MANIPULO) led.enable(false)
basic.showIcon(IconNames.SmallDiamond)

bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
})
bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.SmallDiamond)
})

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let cmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (cmd.charAt(0) == "L") {
        // LED: no ecrã e no pino P0 (para LED externo com resistência)
        if (cmd.charAt(1) == "1") {
            basic.showIcon(IconNames.Heart)
            pins.digitalWritePin(DigitalPin.P0, 1)
        } else {
            basic.clearScreen()
            pins.digitalWritePin(DigitalPin.P0, 0)
        }
    } else if (cmd.charAt(0) == "S") {
        // servo em P1 — a Faísca envia "S<ângulo 0-180>"
        pins.servoWritePin(AnalogPin.P1, parseInt(cmd.substr(1)))
    } else if (cmd.charAt(0) == "Z") {
        // buzzer: "Z<freq>:<ms>" — altifalante interno do v2 (ou pino de áudio)
        let par = cmd.substr(1).split(":")
        music.playTone(parseInt(par[0]), parseInt(par[1]))
    } else if (cmd.charAt(0) == "C") {
        // LCD 16×2 I2C: "C0" limpa, "C1<txt>" linha 1, "C2<txt>" linha 2
        if (cmd.charAt(1) == "0") {
            makerbit.clearLcd1602()
        } else if (cmd.charAt(1) == "1") {
            makerbit.showStringOnLcd1602(cmd.substr(2), 0, 16)
        } else {
            makerbit.showStringOnLcd1602(cmd.substr(2), 16, 16)
        }
    } else if (cmd.charAt(0) == "T") {
        basic.showString(cmd.substr(1))
    }
})

let tick = 0
basic.forever(function () {
    bluetooth.uartWriteLine("B" + (input.buttonIsPressed(Button.A) ? "1" : "0"))
    // lightLevel é 0-255; ×4 para casar com a escala 0-1023 do A0 (limiar 300 das lições)
    bluetooth.uartWriteLine("L" + input.lightLevel() * 4)
    bluetooth.uartWriteLine("D" + sonar.ping(DigitalPin.P8, DigitalPin.P12, PingUnit.Centimeters))
    bluetooth.uartWriteLine("M" + pins.digitalReadPin(DigitalPin.P16))
    if (USAR_MANIPULO) {
        bluetooth.uartWriteLine("P" + Math.round(pins.analogReadPin(AnalogPin.P3) / 10.23))
    }
    tick += 1
    if (tick >= 10) {
        // DHT11 só aguenta ~1 leitura/segundo; lemos a cada ~2,5 s
        tick = 0
        dht11_dht22.queryData(DHTtype.DHT11, DigitalPin.P2, true, false, false)
        if (dht11_dht22.readDataSuccessful()) {
            bluetooth.uartWriteLine("T" + Math.round(dht11_dht22.readData(dataType.temperature)))
            bluetooth.uartWriteLine("H" + Math.round(dht11_dht22.readData(dataType.humidity)))
        }
    }
    basic.pause(250)
})
