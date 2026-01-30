# PRD 02 — Challenges 2.0 (Jornadas) — Especificação Mobile (React Native)

## 1. Objetivo
Implementar no app React Native a experiência de **Jornadas**: catálogo, criação de challenge via jornada e consumo diário (Hoje/Trilha), com check-in e reflexão privada.

---

## 2. Fluxos (Mobile)
### 2.1 Catálogo → Detalhe → Iniciar
1) Usuário abre **Challenges** (ou seção equivalente)
2) Acessa **Jornadas** (CTA “Iniciar Jornada” / “Explorar Jornadas”)
3) Seleciona Jornada → abre **Detalhe da Jornada**
4) Escolhe duração (se aplicável) e grupo
5) Confirma → Challenge criado → navega para **Challenge Journey Screen**

### 2.2 Loop diário
- Em **Hoje**, o usuário lê o capítulo do dia, registra reflexão (opcional) e toca **Concluir capítulo**.
- Após concluir, UI muda para “Concluído hoje ✅” e a trilha marca o capítulo como concluído.

### 2.3 Revisitar
- Em **Trilha**, tocar em capítulo concluído abre o conteúdo read-only, incluindo reflexão salva.

---

## 3. Telas e navegação
### 3.1 `JourneysCatalogScreen`
**Componentes**
- Search (opcional MVP)
- Chips de tags (opcional MVP)
- List (FlatList) de cards
  - `cover_image_url`, `title`, `description_short`, `durations_supported`

**Estados**
- loading / error / empty
- pull-to-refresh

### 3.2 `JourneyDetailScreen`
**Conteúdo**
- Capa + descrição longa
- Duração:
  - se `durations_supported.length > 1`: seletor (SegmentedControl)
  - se fixa: exibir duração
- Seletor de grupo (reuso do seletor existente)
- CTA: “Iniciar Jornada”

**Validações no client**
- Sem grupo selecionado: desabilitar CTA
- Sem duração válida: desabilitar CTA

### 3.3 `ChallengeJourneyScreen`
Tabs:
- `TodayTab`
- `TrailTab`

#### 3.3.1 `TodayTab`
**UI**
- Header: “Dia X de N”
- Título do capítulo
- Blocos:
  - narrative
  - focus
  - practice
  - reflection_prompt
  - (opcional) prayer / verse_reference
- Input de reflexão (TextInput multiline, opcional)
- CTA:
  - primário: “Concluir capítulo de hoje”
  - concluído: “Concluído hoje ✅” (disabled)

**Estados**
- loading capítulo
- capítulo inexistente (erro de conteúdo) → fallback “Conteúdo indisponível”
- check-in em andamento → loading
- erro ao concluir → toast + retry

#### 3.3.2 `TrailTab`
**UI**
- Lista 1..N (SectionList ou FlatList)
- Item de capítulo:
  - day_index, title
  - estado visual (completed/available/locked)
  - marcos (ex.: Dia 7/14/21) com badge
- Clique:
  - completed/available: abrir `ChapterViewerModal`
  - locked: tooltip “Disponível em DD/MM”

### 3.4 `ChapterViewerModal` (ou Screen)
- Exibir conteúdo do capítulo read-only
- Se concluído: exibir reflexão salva (privada)

---

## 4. Regras e cálculo (client)
### 4.1 Cálculo do `day_index`
- Base: `challenge.start_date` + timezone do usuário
- `day_index = floor((today - start_date) em dias) + 1`
- Clamp 1..duration_days
- Se `day_index > duration_days`: estado “Jornada concluída”

> Recomendação: preferir que o backend devolva o `day_index` já calculado (V2). No MVP, pode calcular no client, desde que `start_date` seja um `date`/`timestamptz` consistente.

---

## 5. Integração Supabase (contratos)
O schema atual (fornecido) contém:
- `public.challenges`
- `public.daily_checkins`
- `public.challenge_participants`

### 5.1 Novas tabelas (conteúdo)
- `journey_templates`
- `journey_chapter_templates`

### 5.2 Extensões em `challenges`
Adicionar colunas:
- `journey_id uuid` (FK)
- `unlock_policy text` (default `strict_daily`)
- Reusar `duration_days`, `start_date`, `status`

### 5.3 Extensões em `daily_checkins`
Adicionar colunas:
- `day_index int` (nullable; recomendado para jornadas)
- `reflection_text text` (nullable)
- `visibility text` (default 'private') — group apenas V2

**Chave única**
- Hoje existe PK `(challenge_id, user_id, date_key)`; manter.
- Para jornada, `date_key` = data local do check-in.
- `day_index` é redundante para facilitar trilha.

---

## 6. Queries (MVP)
### 6.1 Listar jornadas ativas
- `select * from journey_templates where is_active = true order by created_at desc`

### 6.2 Capítulo do dia
- Com `day_index` calculado:
- `select * from journey_chapter_templates where journey_id = :journey_id and day_index = :day_index limit 1`

### 6.3 Trilha (capítulos)
- `select day_index, title from journey_chapter_templates where journey_id = :journey_id and day_index <= :duration_days order by day_index asc`

### 6.4 Check-ins do usuário (para trilha)
- `select date_key, day_index from daily_checkins where challenge_id = :challenge_id and user_id = auth.uid()`

### 6.5 Concluir capítulo (upsert)
- Inserir em `daily_checkins`:
  - `challenge_id, user_id, date_key, completed_at, day_index, reflection_text, visibility`
- Se tentativa duplicada no mesmo `date_key`, tratar como idempotente (OK).

---

## 7. Estados de UI e edge cases
- **Sem capítulo** para day_index: bloquear CTA e mostrar aviso; registrar erro (sem telemetria ainda).
- **Virada do dia**: ao abrir app, recalcular day_index; se mudou, atualizar Today/Trail.
- **Offline**:
  - leitura: permitir cache do capítulo do dia e trilha (AsyncStorage/MMKV)
  - check-in: no MVP, exigir online; V2 pode enfileirar.
- **Conflitos de timezone**: usar timezone do dispositivo, mas ideal salvar timezone no perfil e padronizar.

---

## 8. Componentização (RN)
- `JourneyCard`
- `JourneyHeader`
- `DurationSelector`
- `GroupSelector` (reuso)
- `ChapterContentBlock` (render de narrative/focus/practice)
- `ChapterListItem` (Trail)
- `PrimaryCTAButton`

---

## 9. Segurança (RLS) — impacto no mobile
- Usuário só pode:
  - ver templates ativos (select)
  - criar challenge em grupo que participa
  - inserir seu próprio check-in
  - ler seus check-ins

> Políticas detalhadas no PRD de backoffice + migração.

---

## 10. Critérios de aceitação (Mobile)
1) Catálogo e detalhe carregam e exibem jornadas.
2) Usuário inicia jornada e cria challenge corretamente.
3) Hoje mostra capítulo do dia e permite concluir uma vez/dia.
4) Trilha mostra estados corretos e atualiza após check-in.
5) Revisitar capítulo concluído exibe reflexão salva.
