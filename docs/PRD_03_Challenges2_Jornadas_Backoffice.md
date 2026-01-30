# PRD 03 — Challenges 2.0 (Jornadas) — Especificação Backoffice (Conteúdo)

## 1. Objetivo
Disponibilizar no backoffice a gestão de **Jornadas** e **Capítulos** (conteúdo diário), incluindo validações para garantir consistência (capítulos completos para durações suportadas) e publicação controlada.

---

## 2. Escopo do Backoffice
### 2.1 MVP
- CRUD de `JourneyTemplate` (Jornada)
- CRUD de `JourneyChapterTemplate` (Capítulos por dia_index)
- Publicação/Despublicação (`is_active`)
- Validações de integridade antes de ativar
- Preview do capítulo (render semelhante ao mobile)

### 2.2 V2+
- Importação em massa (CSV/JSON)
- Versionamento de jornadas
- Localização (PT/EN)
- Conteúdo multimídia (áudio/vídeo por capítulo)
- Workflow editorial (draft/review/published)

---

## 3. Requisitos funcionais

### 3.1 Listagem de Jornadas
- Tabela com:
  - capa (thumb), título, tags, durações suportadas, status (ativo/inativo), updated_at
- Filtros: ativo/inativo, tag, duração
- Ações rápidas: editar, duplicar, ativar/desativar

### 3.2 Criar/Editar Jornada (`journey_templates`)
**Campos**
- `title` (obrigatório)
- `description_short` (obrigatório)
- `description_long` (opcional)
- `cover_image_url` (opcional)
- `tags` (opcional)
- `durations_supported` (obrigatório; ex.: [7,14,21])
- `is_active` (default false)

**Regras**
- Não permitir ativar (`is_active=true`) se:
  - `durations_supported` vazio
  - não existirem capítulos suficientes para a maior duração suportada
  - houver duplicidade de `day_index` na mesma jornada

### 3.3 Gestão de capítulos (`journey_chapter_templates`)
- Listagem por jornada, ordenada por `day_index`
- Editor por capítulo com:
  - `day_index` (int, obrigatório, único por jornada)
  - `title` (obrigatório)
  - `narrative` (obrigatório)
  - `focus` (obrigatório)
  - `practice` (obrigatório)
  - `reflection_prompt` (obrigatório)
  - opcionais: `prayer`, `verse_reference`, `verse_text`

**Validações**
- `day_index` >= 1
- Limite superior conforme maior duração suportada (ex.: se a jornada suporta 21, exige 1..21)
- Bloquear publish se faltarem capítulos

### 3.4 Preview
- Render semelhante ao `TodayTab` do app:
  - título, narrative, focus, practice, prompt, oração/verso
- Alternar preview por dia (day_index)

---

## 4. Modelo de dados / migração (alinhado ao schema existente)

### 4.1 Tabelas novas
**journey_templates**
- id uuid pk
- title text
- description_short text
- description_long text
- cover_image_url text
- tags text[]
- durations_supported int[]
- is_active bool default false
- created_at timestamptz default now()
- updated_at timestamptz default now()

**journey_chapter_templates**
- id uuid pk
- journey_id uuid fk -> journey_templates.id
- day_index int
- title text
- narrative text
- focus text
- practice text
- reflection_prompt text
- prayer text null
- verse_reference text null
- verse_text text null
- created_at/updated_at
- unique (journey_id, day_index)

### 4.2 Extensões em `public.challenges` (existente)
Adicionar:
- `journey_id uuid null references journey_templates(id)`
- `unlock_policy text default 'strict_daily'`
- (opcional) `timezone text` para congelar o fuso do challenge (V2)

> Manter colunas existentes (`type`, `title`, `duration_days`, `start_date`, `status`) para compatibilidade.

### 4.3 Extensões em `public.daily_checkins` (existente)
Adicionar:
- `day_index int null`
- `reflection_text text null`
- `visibility text default 'private'`

---

## 5. Permissões e papéis (Backoffice)
### 5.1 Papéis sugeridos
- `admin`: CRUD + publish
- `editor`: CRUD, mas publish depende de admin (V2 workflow)
- `viewer`: somente leitura

### 5.2 RLS/Policies (alto nível)
- App mobile: somente `select` em journeys ativas.
- Backoffice: acesso total (via service role) OU via RLS com claim de role (preferível).

---

## 6. Requisitos não funcionais
- Editor com autosave (opcional)
- Prevenção de perda de dados (confirm ao sair)
- Auditoria básica (created_at/updated_at)
- Performance: paginação na listagem de jornadas/capítulos

---

## 7. Critérios de aceitação (Backoffice)
1) Admin cria uma jornada com durações suportadas.
2) Admin cria capítulos para todos os `day_index` necessários.
3) Sistema bloqueia ativação se faltar capítulo.
4) Ao ativar, jornada aparece no catálogo do app.
5) Preview exibe o conteúdo do capítulo com fidelidade ao mobile (layout aproximado).
