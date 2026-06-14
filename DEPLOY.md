# Deploy & hardware

## 1. Alojar (site estático)
A Faísca é HTML/JS puro — serve-se como site estático. No Webtuga: subdomínio
`blocks.buinho.education` → pasta com o `index.html`. Sem backend nesta fatia.

**DNS:** `blocks.buinho.education` é um domínio próprio (TLD .education). Apontar
no registrar desse domínio (CNAME/A) para o alojamento (Webtuga ou Render). Isto é
fora do painel do buinho.pt/.eu.

**Vendoring do Blockly (recomendado para produção):** o `index.html` carrega o
Blockly do cdnjs por conveniência. Para não depender do CDN, descarregar
`blockly.min.js` (v12.3.1) para `vendor/blockly.min.js` e trocar o `<script src=…>`
para o caminho local. A biblioteca é Apache-2.0.

## 2. Arduino (Web Serial + Firmata)
1. No Arduino IDE: **Ficheiro → Exemplos → Firmata → StandardFirmata** → Carregar.
2. Na Faísca, escolher **Arduino (USB)** → **Ligar** → escolher a porta.
3. Browser: Chrome/Edge (PC) ou Chrome (Android) — Web Serial não existe no iOS/Safari.

> ⚠️ O adaptador Arduino (escrita digital, servo, leitura de pinos via Firmata)
> está implementado mas **ainda não foi validado com placa física**. Baud 57600
> (default do StandardFirmata). Confirmar na 1ª ligação real e afinar se preciso.

## 3. micro:bit (Web Bluetooth)
A micro:bit precisa de um pequeno programa que fale o mini-protocolo de texto da
Faísca pela UART. Exemplo em MakeCode (JavaScript), a publicar no repo como `.hex`:

```javascript
bluetooth.startUartService()
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let cmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (cmd.charAt(0) == "L") basic.showIcon(cmd.charAt(1) == "1" ? IconNames.Yes : IconNames.No)
    // 'S<ang>' servo, 'T<txt>' mostrar texto — acrescentar conforme as lições
})
basic.forever(function () {
    bluetooth.uartWriteLine("B" + (input.buttonIsPressed(Button.A) ? 1 : 0))
    bluetooth.uartWriteLine("L" + input.lightLevel())
})
```
Na Faísca: **micro:bit (Bluetooth)** → **Ligar** → emparelhar “BBC micro:bit”.

> ⚠️ Adaptador micro:bit implementado mas **por validar** com placa. Requer o
> serviço Bluetooth UART activo (no MakeCode: Extensions → Bluetooth; emparelhamento
> “No pairing required” simplifica os testes).

## 4. Próximas fatias (ver strategy/modelo-faisca.md)
2) lições-como-dados (Magalhães) · 3) contas/turmas/progresso (Flask+SQLite) ·
4) gamificação + integração no Educativo.
