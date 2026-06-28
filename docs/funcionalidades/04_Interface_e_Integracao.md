# Pilar 4: Interface, Integração e UX (A Cara do App)

## 1. Como a Lola lê o seu "Tempo Livre"?
Como combinamos no Pilar 2, a Lola não fará microgestão utópica tentando agendar seus estudos em blocos vazios. No entanto, ela precisa entender os seus "blocos ocupados" (escola, cursos, viagens) por dois motivos:
- Para calcular o horário de acordar.
- Para não sugerir absurdos na rotina noturna (ex: sugerir que você acorde mais cedo se você foi dormir às 03:00).
**Fonte de Verdade:** A integração usará puramente o **Google Calendar**. Tudo o que estiver lá é considerado "Ocupado". O espaço em branco é o seu "Tempo Livre", que servirá de base para a lista cronológica do Pilar 2.

## 2. Mapa de Páginas do Aplicativo
Atualmente, o app só possui a tela de Login e a tela de Chat. Para acomodar essas novas funcionalidades visuais e manter tudo organizado, precisaremos adicionar novas telas à aplicação React:

### 📄 Tela 1: O Chat (A Mente)
- Continua sendo a tela principal, onde acontece a rotina de Bom Dia / Boa Noite e onde você aprova os alarmes.

### 📄 Tela 2: O Dashboard (A Visão)
- Uma tela visual, sem chat, dividida em colunas.
- **Lista Cronológica:** Mostra as suas tarefas pendentes (integradas com o Google Tasks), divididas visualmente entre **Hard** (Vermelho/Urgente) e **Soft** (Azul/Flexível), sempre da mais iminente para a mais distante.
- **Alarmes Ativos:** Um card mostrando quais alarmes estão programados para amanhã (para você não precisar perguntar para ela).

### 📄 Tela 3: Configurações (As Engrenagens)
- Tela para você definir a "Grade Base" (os horários fixos de aula da semana).
- Opção de ajustar o tempo padrão de deslocamento (que definimos como 1 hora).
- *Toggle* (botão) para ativar/desativar as rotinas matinais e noturnas se você quiser tirar férias da IA.

## Status no Debate
🔄 **Em aberto.** Precisamos definir se o usuário prefere manter o app ultra-minimalista (tudo feito APENAS por chat) ou se a criação dessas telas visuais (Dashboard/Configurações) agrega valor real.
