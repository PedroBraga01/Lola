# Pilar 3: App Nativo Android (Wrapper)

## Visão Geral
Para romper a barreira do navegador e permitir que a Lola controle recursos do celular (como o Despertador), o site atual será empacotado em um Aplicativo Android nativo (APK).

## Arquitetura Tecnológica

### 1. O Híbrido (WebView)
- O aplicativo Android consistirá primariamente de um componente `WebView` configurado em tela cheia (Full Screen).
- A URL apontada será a do servidor de produção no Render (`https://lola-app.onrender.com`).
- Isso garante que qualquer mudança no visual ou na IA da Lola atualize no aplicativo de imediato, sem precisar de downloads na Play Store.

### 2. A Ponte JavaScript (JavaScript Interface)
- Uma interface nativa será criada para expor funções do Android para o código React (Frontend).
- Exemplo de função: `LolaNative.setAlarm(hour, minute, message)`.

### 3. Acionamento do Alarme Nativo
- Quando o usuário aprovar os alarmes (conforme Pilar 1), o frontend React chamará a função exposta na ponte.
- O código Java/Kotlin do aplicativo receberá o comando e criará a intenção `AlarmClock.ACTION_SET_ALARM`, inserindo os alarmes diretamente no relógio do usuário (ou utilizará o `AlarmManager` se tarefas invisíveis em background forem estritamente necessárias).

## Status no Debate
✅ **Tecnologia Validada.** A dependência para isso rodar bem é finalizarmos a inteligência (Pilares 1 e 2) antes de criarmos o APK.
