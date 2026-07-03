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
A micro:bit precisa de um pequeno programa companheiro que fale o mini-protocolo
de texto da Faísca pela UART. O programa completo (LED, **servo**, **DHT11**,
**buzzer**, **ultrassons**, **PIR**, **LCD 16×2** e manípulo opcional) e as
instruções de instalação — incluindo as extensões MakeCode necessárias
(Bluetooth, DHT11_DHT22, sonar, MakerBit LCD1602) — estão em
[`microbit/`](microbit/README.md).

Na Faísca: **micro:bit (Bluetooth)** → **Ligar** → emparelhar “BBC micro:bit”.

> ⚠️ Adaptador micro:bit implementado mas **por validar** com placa. Requer o
> serviço Bluetooth UART activo e, no MakeCode, “No pairing required” simplifica
> os testes.

## 4. Próximas fatias (ver strategy/modelo-faisca.md)
2) lições-como-dados (Magalhães) · 3) contas/turmas/progresso (Flask+SQLite) ·
4) gamificação + integração no Educativo.
