# Seedfy — PRD (Feature 1): Convite de usuários existentes para um grupo (MVP)

**Status:** Draft para revisão  
**Owner do PRD:** Produto (Thiago)  
**Plataforma:** App (React Native/Expo) + Supabase  
**Busca de usuário:** **e-mail exato**  
**Observação:** Sem Telemetria/Métricas (serão definidas em PRD separado)

---

## 1) Contexto e problema

O crescimento de grupos hoje depende de fluxos indiretos (ex.: links) e não existe um mecanismo completo dentro do app para convidar usuários já cadastrados. Isso aumenta fricção, reduz governança e dificulta rastreabilidade (convites duplicados, pouca visibilidade de status e inconsistências de permissão).

---

## 2) Objetivo

Habilitar crescimento controlado e simples de grupos, permitindo que:

- **Owner** convide um usuário **já cadastrado** no Seedfy.
- O usuário convidado visualize e responda **dentro do app** (aceitar/recusar).
- O aceite seja **consistente e seguro** (RLS + operação atômica ao criar membership).

---

## 3) Escopo do MVP

### 3.1 Inclui
1. Enviar convite para usuário existente a partir do **Detalhe do Grupo**.
2. **Busca por e-mail exato** do usuário (sem autocomplete/varredura).
3. Tela “**Convites**” com lista de convites pendentes do usuário.
4. Responder convite: **Aceitar** / **Recusar**.
5. Ao aceitar: inserir/ativar membership no grupo.
6. Bloquear duplicidade: impedir convite pendente duplicado e convite para quem já é membro.

### 3.2 Não inclui (cortes explícitos)
- Push Notifications.
- Explorar grupos / solicitar entrada (Feature 2).
- Convite por contatos do telefone.
- Mensagem personalizada no convite (v1.1).
- Expiração automática de convite (v1.1).
- Moderators/roles avançados (v1.1).
- Revogar convite (opcional v1.1).

---

## 4) Personas e permissões

### Personas
- **Owner do grupo:** convida usuários.
- **Convidado:** recebe convite e decide.
- **Membro:** participa do grupo; não convida no MVP.

### Permissões (MVP)
- **Criar convite:** apenas **Owner** do grupo.
- **Ler convites recebidos:** apenas o **convidado**.
- **Aceitar/recusar:** apenas o **convidado**.
- (Opcional) Owner visualizar convites enviados do grupo: **fora do MVP**, a menos que necessário para suporte/UX.

---

## 5) Jornadas e UX (telas)

### 5.1 Fluxo do Owner — Enviar convite
**Entrada:** Grupo → Aba/Seção “Membros” → botão **Convidar**

**Passos**
1. Owner abre “Convidar”.
2. Campo “E-mail do usuário” + ação “Buscar”.
3. Se encontrado: mostrar cartão do usuário (nome + avatar) e botão “Enviar convite”.
4. Confirmar envio.
5. Feedback: “Convite enviado”.

**Mensagens e estados**
- Não encontrado: “Usuário não encontrado”
- Já é membro: “Usuário já faz parte do grupo”
- Convite pendente existe: “Convite já enviado”
- Sem permissão: “Você não tem permissão para convidar”
- Erro inesperado: “Não foi possível enviar o convite. Tente novamente.”

**Privacidade (MVP)**
- Busca por **e-mail exato** (case-insensitive).
- Retorno **0 ou 1** resultado.
- Não oferecer autocomplete por prefixo.

---

### 5.2 Fluxo do Convidado — Responder convite
**Entrada:** Área “Grupos” → **Convites**
- A entrada via lista de grupos exibirá um badge (contador) caso existam convites pendentes.

**Lista de convites pendentes**
- Exibir: nome do grupo, owner (nome), (opcional) descrição curta.
- Ações: **Aceitar** / **Recusar**.

**Ao aceitar**
- Convite: `accepted`
- Usuário vira membro do grupo
- (Opcional) Navegar para o detalhe do grupo

**Ao recusar**
- Convite: `declined`
- Sai da lista de pendentes

**Estados**
- Loading / Empty / Error + retry/pull-to-refresh

---

## 6) Regras de negócio

1. Apenas **owner** pode convidar.
2. Bloquear convite se:
   - usuário já é membro do grupo
   - já existe convite `pending` para o mesmo usuário no mesmo grupo
3. Aceite do convite deve ser **idempotente**:
   - se já for membro, tratar como sucesso e marcar convite como `accepted`.
4. Não implementar rate limit no MVP (previsto v1.1).

---

## 7) Modelo de dados (Supabase)

### 7.1 Nova tabela: `group_invitations`
**Campos**
- `id` (uuid, PK)
- `group_id` (uuid, FK `groups`, index)
- `inviter_user_id` (uuid, FK `users`)
- `invited_user_id` (uuid, FK `users`, index)
- `status` (text/enum): `pending | accepted | declined | revoked`
- `created_at` (timestamptz)
- `responded_at` (timestamptz, null)

**Constraints / índices**
- Index: `group_id`
- Index: `(invited_user_id, status)`
- Unique parcial: `(group_id, invited_user_id)` **onde** `status = 'pending'`
- (Recomendado) Unique `(group_id, user_id)` em `group_members` (se ainda não existir)

### 7.2 Tabela existente: `group_members`
Requisitos mínimos:
- `group_id`, `user_id`, `role` (`owner|member`), `created_at`

---

## 8) Operações necessárias (contratos)

### 8.1 Buscar usuário por e-mail (owner)
- Entrada: `email` (exato, case-insensitive)
- Saída: `{ id, display_name, avatar_url }` ou vazio
- Limite: máximo 1 resultado

### 8.2 Criar convite (owner)
- Entrada: `group_id`, `invited_user_id`
- Pré-condições:
  - caller é owner do grupo
  - usuário existe
  - não é membro
  - não há convite `pending` para o par
- Saída: convite criado com status `pending`

### 8.3 Listar convites pendentes (convidado)
- Filtro: `invited_user_id = auth.uid()` e `status = 'pending'`
- Ordenação: `created_at desc`

### 8.4 Responder convite (convidado)
- Entrada: `invite_id`, ação `accept|decline`
- Pré-condições:
  - convite pertence ao usuário
  - status = `pending`

**Requisito crítico:** “Aceitar convite” deve ser **atômico** (transação/RPC):
1) validar permissões/estado  
2) inserir/ativar membership (upsert)  
3) atualizar convite (`accepted`, `responded_at`)
4) Inserir registro na tabela `group_activity` informando a entrada do novo membro.  

---

## 9) Segurança (RLS) — requisitos

### 9.1 `group_invitations`
- **SELECT:** permitido se `invited_user_id = auth.uid()`
- **INSERT:** permitido somente se caller é owner do `group_id`
- **UPDATE:**
  - permitido somente se `invited_user_id = auth.uid()`
  - restringir transição: `pending -> accepted|declined`
- (Opcional v1.1) owner pode `pending -> revoked`

### 9.2 `users/profiles` (para busca)
- Expor apenas dados mínimos (ex.: `id`, `display_name`, `avatar_url`).
- A busca por e-mail deve ser exata e não permitir listagem ampla.

---

## 10) Critérios de aceite

1. Owner busca usuário por e-mail exato e envia convite com sucesso.
2. Owner é impedido de:
   - convidar membro já ativo
   - enviar convite duplicado `pending`
3. Convidado vê convite em “Convites”.
4. Convidado aceita → vira membro; convite fica `accepted`.
5. Convidado recusa → convite fica `declined` e sai da lista de pendentes.
6. RLS impede:
   - terceiros de lerem convites alheios
   - não-owners de criarem convites
   - usuário de responder convite que não é dele
7. UI cobre loading/empty/error e suporta refresh.

---

## 11) Edge cases

- E-mail inexistente → “Usuário não encontrado”
- Aceitar convite já respondido → “Convite não está pendente”
- Aceitar convite, mas já ser membro → tratar como sucesso e marcar `accepted`
- Concorrência: aceitar duas vezes → idempotente, sem duplicidade em `group_members`
- Owner removido do grupo → perde permissão de convidar automaticamente

---

## 12) QA — testes manuais

1. Owner envia convite (sucesso).
2. Owner tenta convidar membro ativo (bloqueio).
3. Owner tenta enviar convite duplicado pendente (bloqueio).
4. Convidado visualiza convite pendente.
5. Convidado aceita → membership criado.
6. Convidado recusa → convite declinado.
7. Usuário terceiro tenta ler convites de outro (RLS bloqueia).
8. Aceite repetido/concorrente não cria duplicidade.

---

## 13) Entregáveis

### App
- CTA “Convidar” no grupo (owner)
- Fluxo de busca por e-mail + envio
- Tela “Convites” (lista pendentes + aceitar/recusar)
- Estados e refresh

### Supabase
- Tabela `group_invitations`
- Índices/constraints (incluindo unique parcial para pending)
- Policies RLS
- Operação atômica para “aceitar convite” (transação/RPC)

---

## 14) Rollout

- Aplicar migração do banco (tabela + RLS) antes do release do app.
- Compatível com versões antigas: usuários que não atualizarem apenas não terão a funcionalidade.
- Feature flag opcional, se já existir no projeto.
