# PRD — Desistir/Sair de um Desafio (e Jornada) no Seedfy

**ID:** PRD-APP-QUIT-CHALLENGE-01  
**Status:** Draft  
**Autor:** ChatGPT (Seedfy)  
**Data:** 2026-02-05

## 1. Contexto e problema
Hoje, ao entrar em um **Desafio** (e futuramente uma **Jornada**), o usuário não possui um caminho claro para **desistir/sair**. Isso gera:
- sensação de “aprisionamento” no desafio;
- poluição da lista de desafios ativos;
- queda de confiança no produto (“entrei sem querer e agora?”);
- impacto negativo na consistência (streak/ativos) por desafios que o usuário não quer mais acompanhar.

O banco já suporta status de participação (`active`, `quit`, `completed`) na tabela de participantes, mas a UX e o fluxo não existem no app.

## 2. Objetivos
- Permitir que o usuário **desista** de um desafio/jornada em andamento, com UX clara e segura.
- Garantir que o desafio **não apareça como ativo** após a desistência.
- Preservar histórico mínimo para relatórios pessoais (ex.: “participou e desistiu”), sem alterar banco.
- Evitar inconsistências em check-ins e métricas de progresso.

## 3. Não objetivos (por enquanto)
- Não implementar “pausar” desafio (somente desistir).
- Não criar moderação/backoffice para isso.
- Não permitir “apagar” check-ins passados (mantemos histórico).
- Não criar badges/recompensas relacionados a desistência.
- Não alterar schema de banco.

## 4. Definições
- **Desistir/Sair:** mudar o status do usuário no desafio de `active` para `quit`.
- **Reentrar:** o usuário pode voltar a participar do mesmo desafio (ver regras em 7.6).
- **Jornada:** no contexto deste PRD, “Jornada” é tratada como o mesmo artefato de participação (ou o mesmo padrão de status) até existir uma modelagem específica.

## 5. Personas / Usuários
- Usuário que entrou por curiosidade e não quer continuar.
- Usuário que escolheu o desafio errado (tema/duração).
- Usuário que perdeu o timing e quer “limpar” desafios ativos.

## 6. User stories
1. Como usuário, quero **sair** de um desafio para não vê-lo mais em “Ativos”.
2. Como usuário, quero uma **confirmação** antes de sair para evitar toque acidental.
3. Como usuário, quero entender o impacto: “isso não apaga seus check-ins já feitos”.
4. Como usuário, quero poder **reentrar** depois (se fizer sentido), sem corromper dados.

## 7. Requisitos funcionais

### 7.1 Onde o usuário pode desistir
- **Tela Detalhe do Desafio/Jornada**: botão “Desistir” (ou menu ⋮ → “Desistir do desafio”).
- **Tela de Desafios Ativos** (lista): action de overflow por item (opcional; recomendado para Web).

### 7.2 Fluxo de desistência (UX)
1) Usuário toca em **Desistir**  
2) Abrir modal/bottom-sheet de confirmação:
- Título: “Desistir deste desafio?”
- Texto: “Você pode entrar novamente depois. Seus check-ins já realizados não serão apagados.”
- Ações: **Cancelar** | **Desistir**
3) Confirmando:
- Atualizar status de participação para `quit`.
- Remover desafio das listas “Ativos”.
- Exibir toast/snackbar: “Você saiu do desafio.”

### 7.3 Efeitos pós-desistência (UI/estado)
- O desafio deve:
  - não aparecer em **Ativos**;
  - aparecer em uma seção “Encerrados”/“Histórico” (se existir) com status “Desistido”.
- O detalhe do desafio (se acessado via link profundo) deve mostrar:
  - estado “Você desistiu deste desafio.”
  - CTA: “Entrar novamente” (se permitido – ver 7.6).

### 7.4 Regras de check-in após desistir
- Não permitir check-in se status do participante != `active`.
- Se o usuário tentar acessar o check-in via deep link:
  - bloquear e exibir mensagem: “Você não está participando deste desafio.”

### 7.5 Regras de conclusão
- Se status `quit`, o desafio nunca deve ser contado como “concluído”.
- Se já estava `completed`, esconder o botão “Desistir” (não faz sentido).

### 7.6 Regras de reentrada (importante, sem DB change)
Como não vamos alterar banco, temos duas opções. **Escolha recomendada: Opção A**.

**Opção A (recomendada): Reentrar = voltar status para `active` e manter progresso/check-ins existentes**
- Ao reentrar:
  - status: `quit` → `active`
  - `joined_at`: mantém o valor original (ou opcionalmente atualizar para now; ver decisão abaixo).
  - check-ins anteriores permanecem.
- Prós: simples, sem duplicação.
- Contras: pode confundir se o usuário “voltar” muito tempo depois.

**Opção B: Reentrar = reset de progresso (sem apagar check-ins)**
- Atualiza status para `active` e zera `progress`.
- Não apaga check-ins, mas o cálculo de progresso precisa ignorar check-ins anteriores ao “novo joined_at” — isso exigiria regra adicional e pode virar gambiarra sem schema.
- **Não recomendado sem DB.**

**Decisão de produto (MVP):**
- Implementar **Opção A**.
- Manter `joined_at` como histórico (não alterar), para reduzir lógica.

### 7.7 Atividade de grupo (se aplicável)
Se o desafio estiver associado a grupo (ou existir feed de atividade do grupo), criar evento:
- `group_activity.type = "challenge_quit"`
- `message = "{Nome} saiu do desafio {Título}"`

> Só aplicar se houver `group_id` acessível no contexto do desafio/grupo.

### 7.8 Permissões e segurança (RLS)
- Apenas o próprio usuário pode alterar sua linha em `challenge_participants`.
- Servidor/DB deve validar:
  - `user_id == auth.uid()`
  - transição permitida:
    - `active` → `quit`
    - (reentrada) `quit` → `active`
  - bloquear qualquer atualização para `completed` via client (se hoje a conclusão é controlada por regra específica).

## 8. Requisitos não-funcionais
- Operação idempotente: chamar “desistir” duas vezes não deve quebrar (status já `quit`).
- UX responsiva: loading state no botão e desabilitar dupla ação.
- Suporte a offline: se o app usa fila offline, tratar conflito (status remoto != local).

## 9. Impactos e edge cases
- **Streak / dias ativos**: desistir não altera histórico; streak depende de check-ins do dia, não do status passado.
- **Progresso**: se progresso é calculado, deve respeitar `status`.
- **Usuário sem internet**: exibir erro “Não foi possível sair do desafio. Tente novamente.”

## 10. Contrato de dados (sem novas tabelas)
Usar tabela existente:
- `challenge_participants (challenge_id, user_id, status, joined_at, progress)`

Operações:
- **Desistir**: `update challenge_participants set status='quit' where challenge_id=? and user_id=?`
- **Reentrar**: `update challenge_participants set status='active' where challenge_id=? and user_id=?`

Check-in:
- antes de inserir em `daily_checkins`, verificar `challenge_participants.status == 'active'`.

## 11. Critérios de aceite (Gherkin)
1) **Desistir remove de ativos**
- Dado que estou participando de um desafio com status `active`
- Quando eu confirmo “Desistir”
- Então meu status vira `quit`
- E o desafio não aparece mais na lista “Ativos”

2) **Bloquear check-in após desistir**
- Dado que meu status no desafio é `quit`
- Quando eu tento fazer check-in
- Então o app bloqueia e informa que não estou participando

3) **Reentrar (MVP)**
- Dado que meu status no desafio é `quit`
- Quando eu toco em “Entrar novamente”
- Então meu status vira `active`
- E eu volto a ver o desafio em “Ativos”

4) **Concluído não permite desistência**
- Dado que um desafio está `completed`
- Então não existe ação “Desistir” para ele

## 12. Plano de implementação (alto nível)
### Fase 1 — RN + Web (core)
- Adicionar ação “Desistir” no detalhe do desafio.
- Modal de confirmação.
- Mutation update status.
- Filtrar listagens por status (`active` vs `quit/completed`).
- Guardrails no check-in.

### Fase 2 — Polimento
- Tela/Seção “Histórico” exibindo “Desistido”.
- Reentrada via CTA.
- Evento opcional em `group_activity`.

## 13. Checklist técnico (sem DB/backoffice)

### 13.1 Backend (Supabase)
- Confirmar policy RLS de update para `challenge_participants` (somente dono).
- Confirmar policy de insert em `daily_checkins` exige status `active` (se não existir, aplicar policy/trigger já existente; se não puder, validar no client e aceitar risco).

### 13.2 Mobile RN
- UI:
  - Detalhe do Desafio: menu ⋮ → “Desistir”
  - Modal bottom-sheet
  - Toast/snackbar
- State:
  - invalidar cache de queries (ativos, detalhe, perfil)
- Navegação:
  - após desistir, voltar para lista e refletir remoção.

### 13.3 WebApp (Next.js)
- UI:
  - Botão “Desistir” no detalhe
  - Modal confirm
- Data:
  - revalidate/refresh queries (server actions / react-query)
- Listas:
  - separar tabs: Ativos | Concluídos | Desistidos (opcional)

## 14. Questões em aberto (decisões rápidas)
- O app terá uma aba “Histórico” agora (inclui quit/completed) ou só remove dos ativos?
  - Recomendação: no mínimo, manter acesso via “Ver todos” e filtrar por status; “quit” aparece como tag.
- Reentrar: manter `joined_at` (recomendado) vs atualizar (menos histórico, mais coerente com recomeço).

---
