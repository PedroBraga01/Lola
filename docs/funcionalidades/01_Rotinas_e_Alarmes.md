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

### 3. Autoridade e Aprovação (Human-in-the-Loop)
- **Nenhum alarme é criado ou desativado sem a aprovação explícita do usuário.**
- A Lola propõe os horários, e o usuário aprova.

### 4. Gestão de Feriados e Exceções
- A Lola **não deve** desativar alarmes rotineiros de forma autônoma apenas por identificar um feriado na agenda.
- Exceções (viagens, feriados que emendam) devem ser comunicadas manualmente pelo usuário para que a Lola, mediante consulta, remova os alarmes específicos daquele período.

## Status no Debate
✅ **Regras Fechadas.** Aguardando implementação técnica.
