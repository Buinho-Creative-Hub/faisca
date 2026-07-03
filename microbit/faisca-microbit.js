/**
 * Faísca — programa companheiro para BBC micro:bit (v2)
 * Fala o mini-protocolo de texto da Faísca pela UART Bluetooth.
 *
 * EXTENSÕES NECESSÁRIAS no MakeCode (ver README.md nesta pasta):
 *   1. Bluetooth  (oficial — substitui a extensão "radio")
 *   2. DHT11_DHT22 (alankrantas) — https://github.com/alankrantas/pxt-DHT11_DHT22
 *
 * LIGAÇÕES:
 *   LED externo → P0 (além do ecrã)     servo → P1     DHT11 (DATA) → P2
 *
 * PROTOCOLO (uma linha por comando):
 *   Faísca → micro:bit:  L0/L1 (LED)   S<ângulo> (servo)   T<texto> (mostrar)
 *   micro:bit → Faísca:  B0/B1 (botão A)   L<luz 0-1020>   T<temp °C>   H<hum %>
 */

bluetooth.startUartService()
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
    } else if (cmd.charAt(0) == "T") {
        basic.showString(cmd.substr(1))
    }
})

let tick = 0
basic.forever(function () {
    bluetooth.uartWriteLine("B" + (input.buttonIsPressed(Button.A) ? "1" : "0"))
    // lightLevel é 0-255; ×4 para casar com a escala 0-1023 do A0 (limiar 300 das lições)
    bluetooth.uartWriteLine("L" + input.lightLevel() * 4)
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
