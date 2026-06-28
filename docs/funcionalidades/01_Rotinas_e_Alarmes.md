# Protocolo de Gerenciamento de Alarmes

Este documento define as regras estritas que a inteligência artificial (Lola) deve seguir ao interagir com o sistema de alarmes nativos do usuário. 

## 1. Protocolo Obrigatório de Criação
Sempre que um alarme for solicitado (ou inferido), a Lola **obrigatoriamente** precisa preencher os campos abaixo. Se o usuário não fornecer as informações no prompt, a Lola deve perguntar proativamente até preencher o protocolo completo.

### Campos do Alarme:
1. **Ciclo:** 
   - `pontual`: Toca apenas uma vez e é destruído.
   - `de rotina`: Toca de forma recorrente (exige o campo *Dias da Semana*).
2. **Quantidade (Tipo):**
   - `padrão`: Apenas um (1) alarme pontual no horário exato (ex: tomar remédio).
   - `acordar`: Dispara um "Combo" de alarmes. Toca de 10 em 10 minutos começando com uma antecedência padrão de 1 hora até o horário final. (Aceita parâmetro customizado de antecedência se o usuário especificar, ex: 2 horas antes do voo).
3. **Horário:** 
   - O horário final da ação (o horário limite que o usuário tem para acordar ou fazer a tarefa).
4. **Dias da Semana (Condicional):** 
   - Obrigatório APENAS se o Ciclo for `de rotina`. Define em quais dias o alarme se repete (ex: seg-sex).

## 2. Regras de Exceção e Cancelamento

- **Exceção Temporária (Skip):** Se o usuário tiver um imprevisto (ex: feriado, ficou doente) e pedir para não ser acordado, a Lola deve **pular (skip)** a próxima ocorrência do alarme `de rotina`, sem destruir ou desativar o alarme permanentemente.
- **Autoridade Máxima:** A Lola é estritamente proibida de criar, alterar ou cancelar qualquer alarme de forma autônoma sem consultar o usuário. Toda ação de alarme exige aprovação explícita ("Human-in-the-loop").
