# PRD 01 — Challenges 2.0 (Jornadas) — Visão Geral

## 1. Contexto
A feature atual de **Challenges** no Seedfy é baseada em: criar um desafio (tipo + duração + grupo) e realizar **check-in diário**. Isso cria hábito, mas tende a ficar “rasa” porque o *tema* não se materializa em conteúdo/progressão além de uma barra.

**Challenges 2.0 — Jornadas** evolui o “tema” para uma **trilha narrativa leve**: uma Jornada é um plano em capítulos diários (Dia 1..N), onde o check-in vira **“Concluir o capítulo de hoje”**, com sentido diário e progressão clara.

---

## 2. Objetivos
### 2.1 Objetivos do produto
- Transformar “tema + check-in” em experiência guiada (conteúdo diário).
- Aumentar clareza de progresso: trilha, capítulos, marcos.
- Reforçar consistência com ritual diário (sem maratonas por padrão).
- Manter compatibilidade com **Challenges legados**.

### 2.2 Objetivos de experiência
- Em 10 segundos o usuário entende:
  - “Hoje tem um capítulo”
  - “Concluo e avanço”
  - “A trilha mostra o caminho e meu progresso”

---

## 3. Proposta de valor
- **Significado diário**: cada dia tem um foco e uma prática simples.
- **Progressão**: desbloqueio de capítulos e marcos (7/14/21…).
- **Revisitar**: conteúdo concluído permanece acessível (acervo da jornada).

---

## 4. Escopo (alto nível)
### 4.1 MVP (V1)
- Catálogo de **Jornadas** (listagem + detalhe)
- Criar Challenge selecionando uma Jornada
- Tela do Challenge com:
  - Aba **Hoje** (capítulo do dia + concluir)
  - Aba **Trilha** (capítulos com estados: concluído / disponível / bloqueado)
- Check-in diário com **reflexão opcional privada**
- Revisitar capítulos concluídos (read-only)

### 4.2 Fora do escopo do MVP (V2+)
- Feed do grupo, compartilhamento de reflexões, reações/comentários
- Janela de tolerância (ex.: concluir “ontem” em até 48h)
- Notificações e lembretes
- Conteúdo multimídia (áudio/vídeo) por capítulo
- Telemetria/métricas

---

## 5. Regras do core loop
### 5.1 Disponibilidade do capítulo
- 1 capítulo “disponível” por dia (política padrão).
- Check-in registra conclusão do capítulo do dia.

### 5.2 Anti-maratonas
- Não permite concluir capítulos futuros.
- Não permite concluir mais de um capítulo por dia (no MVP).

### 5.3 Progressão
- A trilha exibe capítulos 1..N com estados:
  - **Concluído**
  - **Disponível** (capítulo do dia)
  - **Bloqueado** (futuro)

---

## 6. Principais stakeholders / dependências
- **Mobile (React Native)**: novas telas/abas, estados e integrações com Supabase.
- **Conteúdo**: criação de jornadas e capítulos.
- **Backoffice**: CRUD + validação do conteúdo de jornadas (MVP pode começar seedado via SQL/JSON, mas o alvo é backoffice).

---

## 7. Dados (alto nível)
Reuso do schema existente:
- `public.challenges` (challenge instância)
- `public.daily_checkins` (check-ins)

Novas entidades para conteúdo:
- `journey_templates`
- `journey_chapter_templates`

Extensões:
- adicionar `journey_id` e `unlock_policy` em `challenges`
- adicionar colunas opcionais em `daily_checkins` para suportar Jornada (ex.: `day_index`, `reflection_text`, `visibility`)

> Observação: este PRD não fixa o desenho final do schema; ele define **o produto**. O detalhamento técnico e migrações ficam nos PRDs de Mobile/Backoffice.

---

## 8. Critérios de sucesso (qualitativos)
- Usuários entendem e usam “Hoje” e “Trilha” sem tutorial.
- Check-in deixa de ser “vazio” e passa a ser associado ao capítulo.
- A trilha gera sensação de avanço e conclusão.

---

## 9. Critérios de aceitação (MVP)
1. Usuário consegue ver catálogo de jornadas e iniciar uma.
2. Challenge é criado com `journey_id`, `start_date` e `duration_days`.
3. Aba **Hoje** mostra o capítulo correto do dia.
4. Usuário conclui o capítulo do dia e isso:
   - registra check-in
   - atualiza estados da trilha
5. Aba **Trilha** reflete estados corretos (concluído/disponível/bloqueado).
6. Usuário consegue revisitar capítulos concluídos.
7. Ao fim da duração, o challenge aparece como concluído e trilha segue acessível.

---

## 10. Riscos e mitigação
- **Conteúdo incompleto** (capítulos faltando): backoffice deve validar antes de publicar; no app, bloquear iniciação se faltarem capítulos.
- **Timezone/virada do dia**: usar timezone do usuário; opcional “janela de virada” (V2) para reduzir fricção.
- **Sobrecarga de escopo**: MVP sem social/compartilhamento.

---

## 11. Roadmap sugerido
- V1: Jornadas + Hoje/Trilha + check-in + reflexão privada
- V2: compartilhamento no grupo + feed + janela de tolerância
- V3: multimídia + notificações + personalização
