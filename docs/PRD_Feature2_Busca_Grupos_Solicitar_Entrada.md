# Seedfy — PRD (Feature 2): Buscar grupos e solicitar entrada (com aprovação in-app) — MVP

**Status:** Draft para revisão  
**Owner do PRD:** Produto (Thiago)  
**Plataforma:** App (React Native/Expo) + Supabase  
**Notificações:** **Sem Push** no MVP (apenas pendências in-app)  
**Dependência:** Requer grupos e membership (tabela `groups` e `group_members`) já existentes.

---

## 1) Contexto e problema

Usuários não conseguem descobrir grupos existentes dentro do Seedfy nem solicitar entrada de forma nativa. Como consequência:
- a entrada em grupos depende de convites/link e do “conhecer alguém”;
- não existe governança clara para aprovação/recusa quando o grupo precisa ser controlado;
- owners não têm um fluxo consistente para gerenciar pedidos.

---

## 2) Objetivo

Habilitar um fluxo simples de **descoberta + solicitação**:
- Usuário encontra grupos **descobríveis** via busca.
- Usuário cria uma **solicitação de entrada**.
- **Owner** aprova ou nega a solicitação **dentro do app**.
- Ao aprovar: o usuário vira membro do grupo.

> Sem push no MVP: todas as ações aparecem em uma área de **pendências** (in-app) com refresh.

---

## 3) Escopo do MVP

### 3.1 Inclui
1. Tela “**Explorar grupos**” com **busca por nome** (texto).
2. Exibir somente grupos **descobríveis** (campo no grupo) com política de entrada via solicitação.
3. Ação “**Solicitar entrada**” no card/detalhe do grupo.
4. Usuário visualiza o **status** da sua solicitação (pendente/aprovada/negada/cancelada).
5. Owner visualiza solicitações pendentes do seu grupo e **Aprova/Nega**.
6. Ao aprovar: criar/ativar membership em `group_members` e atualizar status do request.
7. Prevenção de duplicidade: impedir múltiplas solicitações pendentes para o mesmo grupo/usuário.
8. Na **criação do grupo no app**, o owner configura:
   - `discoverable` (on/off)
   - `join_policy` (`request_to_join` | `invite_only`)
9. O owner pode **editar** `discoverable` e `join_policy` posteriormente no app (tela “Editar grupo”).

### 3.2 Não inclui (cortes explícitos)
- Push Notifications.
- Recomendação/ranking de grupos.
- Filtros avançados (tags/categorias, geolocalização, igreja, etc.).
- Mensagem anexada à solicitação (v1.1).
- Moderação avançada (moderators e múltiplos aprovadores).
- Catálogo público completo: só grupos marcados como “descobríveis”.
- Regras de privacidade complexas de conteúdo (feed/membros) para não-membros (MVP pode esconder tudo além do resumo).
- Backoffice para configurar `discoverable`/`join_policy` (fora do MVP).

---

## 4) Conceitos e definições

### 4.1 Grupo “descobrível”
Grupo que pode aparecer na busca. Controlado por campo no banco e configurável pelo owner no app.

### 4.2 Política de entrada (MVP)
No MVP, a Feature 2 opera para grupos com política:
- **request_to_join** (entrada via solicitação + aprovação do owner)

**Decisão MVP (para reduzir fricção):**
- O Explore lista apenas grupos com `discoverable=true` **e** `join_policy='request_to_join'`.
- Grupos `invite_only` não aparecem na busca no MVP.

---

## 5) Personas e permissões

### Personas
- **Usuário (requester):** busca grupos e solicita entrada.
- **Owner:** aprova/nega solicitações do próprio grupo; configura privacidade/entrada do grupo.

### Permissões (MVP)
- Criar solicitação: usuário autenticado, somente para grupos `discoverable=true` e `join_policy=request_to_join`.
- Ler solicitações:
  - requester lê apenas as próprias solicitações.
  - owner lê solicitações do(s) grupo(s) onde é owner.
- Resolver solicitação (aprovar/negar): apenas owner.
- Criar/editar `discoverable` e `join_policy`: apenas owner do grupo.
- Listar grupos exploráveis: apenas grupos `discoverable=true` e `join_policy=request_to_join`.

---

## 6) Jornadas e UX (telas)

### 6.1 Tela “Explorar grupos”
**Entrada:** Área “Grupos” → botão/aba “Explorar”

**Conteúdo**
- Search bar (texto)
- Lista paginada de grupos descobríveis
- Cada card mostra:
  - nome do grupo
  - (opcional) descrição curta
  - (opcional) contagem de membros (se for seguro expor)
  - CTA conforme estado do usuário:
    - “Solicitar entrada” (sem request e não-membro)
    - “Solicitação enviada” (request pendente)
    - “Abrir grupo” (se já for membro)
    - “Negado” (se último request negado; opcional exibir por X dias)

**Estados**
- Loading
- Empty (“Nenhum grupo encontrado”)
- Error (retry)
- Pull-to-refresh

### 6.2 Detalhe público mínimo do grupo (preview)
**Opcional no MVP** (pode ser só card + action).  
Se existir:
- Nome, descrição e owner
- Sem feed e sem lista de membros para não-membros.

### 6.3 Área “Minhas solicitações” (status do requester)
**Entrada:** “Grupos” → seção “Solicitações” (ou Inbox geral, se já existir)

- Lista de solicitações do usuário com status:
  - pending / approved / denied / canceled
- Ação “Cancelar solicitação” (somente enquanto pending) — opcional.

### 6.4 Gestão de solicitações (Owner)
**Entrada recomendada no MVP:** Dentro do **Detalhe do Grupo → Aba Membros → seção “Solicitações pendentes”**

- Lista de requests pendentes
- Ações: **Aprovar** / **Negar**
- Ao resolver: remove da lista de pendentes e exibe feedback.

### 6.5 Criar grupo (App) — configuração de privacidade/entrada
**Entrada:** fluxo atual de “Criar grupo”.

Adicionar seção **Privacidade e Entrada**:
- Toggle: **Aparecer na busca** → `discoverable`
- Radio/Select: **Como as pessoas entram?**
  - “Solicitar para entrar (aprovação do owner)” → `request_to_join`
  - “Somente por convite” → `invite_only`

**Comportamento**
- `discoverable=false` → não aparece no Explore.
- `discoverable=true` + `request_to_join` → aparece no Explore e aceita requests.
- `discoverable=true` + `invite_only` → não aparece no Explore no MVP (por decisão de escopo).

### 6.6 Editar grupo (Owner) — atualizar discoverable/join_policy
**Entrada:** Grupo → Configurações/Editar grupo

Owner pode alterar:
- `discoverable`
- `join_policy`

**Regras**
- Mudanças aplicam imediatamente à visibilidade no Explore e ao fluxo de entrada.
- Se mudar para `discoverable=false`: bloqueia novas solicitações; requests existentes continuam visíveis ao owner e ao requester (decisão MVP).

---

## 7) Regras de negócio (detalhadas)

1. Um usuário só pode ter **1 solicitação pendente** por grupo.
2. Um usuário que já é membro não pode solicitar entrada.
3. Owner não precisa solicitar entrada no próprio grupo.
4. Aprovar solicitação:
   - cria/ativa membership
   - marca request como `approved`
5. Negar solicitação:
   - marca request como `denied`
   - não cria membership
6. Cancelar solicitação (opcional):
   - requester pode mudar `pending -> canceled`
7. Idempotência:
   - aprovar duas vezes não deve criar membership duplicada (upsert/unique em `group_members`).

---

## 8) Modelo de dados (Supabase)

### 8.1 Ajustes em `groups`
Adicionar campos:
- `discoverable` boolean default false
- `join_policy` text/enum: `request_to_join | invite_only`

> MVP: a tela “Explorar” filtra por `discoverable=true` AND `join_policy='request_to_join'`.

**Regras de escrita**
- Na criação do grupo (app): setar campos conforme seleção do owner.
- Na edição do grupo (app): apenas owner pode atualizar.

### 8.2 Nova tabela: `group_join_requests`
**Campos**
- `id` (uuid, PK)
- `group_id` (uuid, FK `groups`, index)
- `requester_user_id` (uuid, FK `users`, index)
- `status` (text/enum): `pending | approved | denied | canceled`
- `created_at` (timestamptz)
- `resolved_at` (timestamptz, null)
- `resolved_by_user_id` (uuid, null) — owner que resolveu

**Constraints / índices**
- Index: `(group_id, status)`
- Index: `(requester_user_id, status)`
- Unique parcial: `(group_id, requester_user_id)` **onde** `status = 'pending'`

### 8.3 Existente: `group_members`
Requisitos mínimos:
- Unique `(group_id, user_id)` (para idempotência)

---

## 9) Operações necessárias (contratos)

### 9.1 Buscar grupos descobríveis (usuário)
- Entrada: `query` (string)
- Filtro: `discoverable=true` AND `join_policy='request_to_join'`
- Busca: por `name`
- Saída (mínima): `group_id`, `name`, `description_short`, `owner_id` (e opcional `member_count`)

### 9.2 Criar solicitação (usuário)
- Entrada: `group_id`
- Pré-condições:
  - grupo é discoverable e request_to_join
  - usuário não é membro
  - não há request `pending` existente
- Saída: request criado (`pending`)

### 9.3 Listar minhas solicitações (usuário)
- Filtro: `requester_user_id = auth.uid()`
- Ordenação: `created_at desc`

### 9.4 Cancelar solicitação (opcional)
- Entrada: `request_id`
- Pré-condições:
  - pertence ao usuário
  - status = `pending`
- Saída: status `canceled`

### 9.5 Listar solicitações pendentes do grupo (owner)
- Entrada: `group_id`
- Pré-condições:
  - caller é owner do grupo
- Filtro: `status = pending`

### 9.6 Resolver solicitação (owner)
- Entrada: `request_id`, ação `approve|deny`
- Pré-condições:
  - request pertence a grupo onde caller é owner
  - status atual = `pending`

**Requisito crítico:** “Aprovar solicitação” deve ser **atômico** (transação/RPC):
1) validar permissões/estado  
2) inserir/ativar membership (upsert)  
3) atualizar request (`approved`, `resolved_at`, `resolved_by_user_id`)  

---

## 10) Segurança (RLS) — requisitos

### 10.1 `groups`
- **SELECT (explore):** permitir leitura de campos públicos mínimos quando `discoverable=true` e `join_policy=request_to_join`.
- **UPDATE (editar grupo):** permitir atualização de `discoverable` e `join_policy` apenas ao **owner** do grupo.
- Evitar expor dados sensíveis: selecionar colunas explicitamente no client.

### 10.2 `group_join_requests`
- **SELECT**
  - requester: onde `requester_user_id = auth.uid()`
  - owner: requests do grupo onde ele é owner
- **INSERT**
  - requester pode inserir somente se:
    - grupo é discoverable + request_to_join
    - e ele não é membro
- **UPDATE**
  - requester pode `pending -> canceled` apenas nos próprios requests (se habilitar cancel)
  - owner pode `pending -> approved|denied` em requests do seu grupo

### 10.3 `group_members`
- Inserção via aprovação deve respeitar RLS e ser realizada pelo mecanismo atômico (RPC) com validação de owner.

---

## 11) Backoffice
Fora do MVP. `discoverable` e `join_policy` são configurados e editados pelo owner no app.

---

## 12) Critérios de aceite

1. Usuário vê a tela “Explorar grupos” e consegue buscar por nome.
2. Só aparecem grupos `discoverable=true` e `join_policy=request_to_join`.
3. Usuário solicita entrada e vê status “Solicitação enviada”.
4. O sistema bloqueia solicitação se:
   - usuário já é membro
   - já existe request pendente
5. Owner vê solicitações pendentes no detalhe do grupo e aprova/nega.
6. Aprovar adiciona o usuário ao grupo e muda status do request para `approved`.
7. Negar muda status para `denied` sem adicionar membro.
8. RLS impede que terceiros:
   - vejam requests de outros
   - aprovem/negem sem serem owner
9. UI cobre loading/empty/error + refresh.

---

## 13) Edge cases

- Usuário solicita e depois entra por convite: aprovação deve ser idempotente (membership única).
- Owner resolve request já resolvido: erro “Solicitação não está pendente”.
- Grupo muda para `discoverable=false`: bloqueia novas solicitações; requests existentes continuam visíveis ao owner e ao requester (decisão MVP).
- Solicitação duplicada por concorrência: constraint bloqueia.

---

## 14) QA — testes manuais

1. Buscar grupos com termo que retorna resultados (ok).
2. Grupo não discoverable não aparece.
3. Criar solicitação (ok).
4. Criar solicitação duplicada pendente (bloqueia).
5. Owner aprova → membership criado e request approved.
6. Owner nega → request denied.
7. Requester vê status atualizado.
8. Usuário não-owner não consegue listar requests do grupo (RLS).
9. Usuário não-owner não consegue resolver request (RLS).

---

## 15) Entregáveis

### App
- Tela “Explorar grupos” (busca + lista)
- CTA “Solicitar entrada” com estados de status
- Tela/Seção “Minhas solicitações” (status)
- Seção no grupo para owner: “Solicitações pendentes” com aprovar/negar
- Criação de grupo: controles `discoverable` e `join_policy`
- Edição de grupo (owner): atualizar `discoverable` e `join_policy`
- Estados: loading/empty/error + refresh

### Supabase
- Campos `discoverable` e `join_policy` em `groups`
- Tabela `group_join_requests` + índices/constraints
- RLS policies
- Operação atômica para “aprovar solicitação” (transação/RPC)

---
