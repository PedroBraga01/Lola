# Pilar 1: Rotinas e Alarmes Inteligentes

## Visão Geral
A Lola atuará proativamente no gerenciamento dos horários de acordar e na definição de lembretes, baseando-se na grade escolar do usuário.

## Regras de Negócio (Definidas)

### 1. Alarmes Cíclicos (Grade Escolar)
- A base de horários de acordar será gerada a partir da **grade de horários fixa** (ex: toda terça-feira acorda no mesmo horário).
- A Lola não precisará ser programada toda segunda à noite; os alarmes são cíclicos.

### 2. O "Combo" de Despertar
- Para os alarmes de **Acordar**, o sistema configurará múltiplos alarmes de **10 em 10 minutos**, começando com **1 hora de antecedência** até o horário limite de levantar de fato.
- Para os alarmes de **Tarefas/Lembretes**, o sistema configurará apenas **1 alarme pontual**.

### 3. A Matemática do "Acordar de Fato"
- **Para a Escola:** A Lola sempre assumirá **1 hora de deslocamento/preparação**. Ex: Se a aula começa às 07:00, o "acordar de fato" (horário limite) é 06:00, e a bateria de alarmes (combo) começa às 05:00.
- **Para Eventos Extraordinários:** O tempo de deslocamento é variável. A Lola tem a obrigação de perguntar proativamente ao usuário (durante a rotina noturna) quanto tempo ele leva até o local, para então calcular de trás para frente a bateria de alarmes do dia seguinte.

### 4. Autoridade e Aprovação (Human-in-the-Loop)
- **Nenhum alarme é criado ou desativado sem a aprovação explícita do usuário.**
- A Lola propõe os horários, e o usuário aprova.

### 5. Gestão de Feriados e Exceções
- A Lola **não deve** desativar alarmes rotineiros de forma autônoma apenas por identificar um feriado na agenda.
- Exceções (viagens, feriados que emendam) devem ser comunicadas manualmente pelo usuário para que a Lola, mediante consulta, remova os alarmes específicos daquele período.

## Pontos Ainda em Debate (Pilar 1)
- **Cancelamento em Cadeia:** Como cancelar os alarmes remanescentes se o usuário acordar logo no primeiro toque?
- **Estilo de Comunicação:** A rotina matinal/noturna será um resumo em bloco único de texto ou uma entrevista interativa?
- **Entrada de Dados:** Qual será o método utilizado para enviar a grade escolar original para a IA?

## Status no Debate
🔄 **Avançado.** Regras matemáticas de cálculo definidas, aguardando resolução dos pontos de interface em aberto.
