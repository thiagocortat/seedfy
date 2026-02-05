# PRD — Perfil: Consistência (Dias Ativos/Streak) e Troféus (Desafios Concluídos)

**Projeto:** Seedfy (Mobile React Native + WebApp)  
**Data:** 2026-02-05  
**Status:** Draft para implementação (sem mudanças de banco / sem backoffice)

## 1. Contexto e problema
Hoje o Seedfy incentiva disciplina diária via **check-in de desafios**. Porém, o perfil do usuário não evidencia:
- consistência (dias ativos, sequência),
- conquistas já concluídas (histórico de desafios concluídos),
- “memórias” do progresso (galeria de troféus).

Isso reduz a percepção de evolução e diminui retenção por falta de feedback positivo contínuo.

## 2. Objetivo
Adicionar ao **Perfil** um bloco claro de progresso, composto por:
1) **Consistência**: dias ativos, streak atual e melhor streak.  
2) **Concluídos**: total de desafios concluídos e **galeria de troféus** (troféu = desafio concluído).

> **Sem alterações no banco de dados** e **sem implementação no backoffice**.

## 3. Não-objetivos (fora de escopo agora)
- Badges/insígnias (3.2 removido por enquanto)
- Configuração/administração de troféus no backoffice
- Rank, leaderboard, comparações entre usuários
- Novas tabelas, colunas, triggers ou jobs no Supabase

## 4. Público-alvo e casos de uso
- Usuários que já fazem check-in: visualizar disciplina e conquistas.
- Usuários novos: entender que existe “progressão” e ter um CTA para começar.

Casos de uso:
- “Quero saber minha sequência atual e melhor sequência”
- “Quero ver quantos dias fui ativo no Seedfy”
- “Quero rever desafios concluídos”
- “Quero abrir um troféu e ver detalhes do desafio”

## 5. Definições (fonte de verdade)
### 5.1. Dia ativo (Active Day)
Dia (no timezone do usuário) em que ele realizou **≥ 1 check-in** em qualquer desafio.

**Cálculo:** `count(distinct daily_checkins.date_key)` por usuário.

### 5.2. Streak (sequência)
- **Streak atual**: número de dias consecutivos até **hoje** (timezone do usuário) com ≥1 check-in/dia.
  - Se não houver check-in **hoje**, streak atual = 0 (MVP).
- **Melhor streak**: maior sequência histórica de dias consecutivos com check-in.

> Observação: `daily_checkins.date_key` já é `YYYY-MM-DD` (string). A implementação deve garantir que o `date_key` continue sendo gerado no timezone do usuário.

### 5.3. Desafio concluído
Um desafio é considerado **concluído** para um usuário quando:
- **Regra A (preferencial):** `challenge_participants.status = 'completed'`
- **Fallback (MVP seguro):** quantidade de `daily_checkins` do usuário para o desafio >= `challenges.duration_days` **e** data de check-in cobre dias distintos suficientes (usar distinct `date_key`).

### 5.4. Troféu
Troféu = uma instância de **desafio concluído**.  
Não há “entidade troféu” no banco; é uma representação derivada.

## 6. Experiência do usuário (alto nível)
No Perfil, adicionar duas seções:

### 6.1. Card “Consistência”
Exibir três KPIs:
- **Sequência atual** (streak_current)
- **Melhor sequência** (streak_best)
- **Dias ativos** (active_days_total)

Estados:
- **Zero check-ins:** mostrar mensagem + CTA “Começar um desafio”
- **Streak 0 mas já teve atividade:** mostrar “Faça um check-in hoje para retomar”

### 6.2. “Troféus” (Galeria) + Contador de concluídos
- Contador: “Desafios concluídos: X”
- Grid/galeria com os últimos N troféus (N=6 no Perfil)
- Ação “Ver todos” → lista completa de troféus
- Ao clicar em um troféu → tela/modal “Detalhe do troféu”

Conteúdo de cada card de troféu:
- Ícone do tipo (`challenges.type`)
- Título do desafio (`challenges.title`)
- “{duration_days} dias”
- Data de conclusão (ver 7.2)

## 7. Requisitos funcionais
### 7.1. Agregações de consistência
O sistema deve retornar:
- `active_days_total: number`
- `streak_current: number`
- `streak_best: number`

### 7.2. Lista de troféus (desafios concluídos)
O sistema deve retornar:
- `completed_total: number`
- `trophies: Array<{ challenge_id, title, type, duration_days, completed_at }>`

**completed_at (derivado):**
- Preferencial: `challenges.end_date` (se consistente com conclusão)
- Alternativa: maior `daily_checkins.completed_at` do usuário para o desafio (MAX)
- Alternativa 2: timestamp de mudança para status completed (não existe hoje → não usar)

### 7.3. Detalhe do troféu
Deve exibir:
- título, tipo, duração
- período (start_date → end_date)
- progresso final (ex.: 7/7)
- lista simples dos `date_key` concluídos (opcional, mas recomendado)

## 8. Requisitos não-funcionais
- **Sem mudanças de banco**
- **Performance:** as agregações devem ser feitas com o menor número de queries possível
- **Consistência cross-plataforma:** RN e Web devem compartilhar as mesmas regras
- **Timezone:** usar timezone do usuário (padrão: America/Sao_Paulo se não houver)
- **Segurança:** RLS deve impedir leitura de dados de outros usuários

## 9. Fonte de dados e queries (Supabase)
Tabelas relevantes:
- `daily_checkins (challenge_id, user_id, date_key, completed_at)`
- `challenge_participants (challenge_id, user_id, status, progress)`
- `challenges (id, type, title, duration_days, start_date, end_date, status)`

### 9.1. Active days total
```sql
select count(distinct date_key) as active_days_total
from public.daily_checkins
where user_id = :user_id;
```

### 9.2. Streaks (algoritmo no app/servidor)
Query base (datas distintas):
```sql
select distinct date_key
from public.daily_checkins
where user_id = :user_id
order by date_key desc;
```
Calcular streak_current e streak_best no client (MVP) para evitar funções no banco.

### 9.3. Completed challenges (preferencial por status)
```sql
select c.id as challenge_id, c.title, c.type, c.duration_days, c.start_date, c.end_date
from public.challenge_participants cp
join public.challenges c on c.id = cp.challenge_id
where cp.user_id = :user_id
  and cp.status = 'completed'
order by c.end_date desc nulls last;
```

### 9.4. Fallback: concluídos por check-ins
Quando não houver status confiável:
- Buscar desafios onde `count(distinct date_key) >= duration_days`.

```sql
select c.id as challenge_id, c.title, c.type, c.duration_days,
       max(dc.completed_at) as completed_at
from public.daily_checkins dc
join public.challenges c on c.id = dc.challenge_id
where dc.user_id = :user_id
group by c.id, c.title, c.type, c.duration_days
having count(distinct dc.date_key) >= c.duration_days
order by completed_at desc;
```

## 10. API/Service Contract (recomendado)
Criar um serviço (no app e no web) que entregue um DTO único:

```ts
type ProfileProgressDTO = {
  activeDaysTotal: number
  streakCurrent: number
  streakBest: number
  challengesCompletedTotal: number
  trophiesPreview: Array<{
    challengeId: string
    title: string
    type: 'reading'|'meditation'|'fasting'|'communion'|string
    durationDays: number
    completedAt: string // ISO
  }>
}
```

Obs: `trophiesPreview` limitado (ex.: 6) para o Perfil.

## 11. Plano de entrega (sem backoffice)
### Milestone 1 — Consistência
- queries + algoritmo streak
- card no Perfil
- empty states

### Milestone 2 — Concluídos + preview da galeria
- query concluídos (status) + fallback
- contador + grid preview + “Ver todos”

### Milestone 3 — Detalhe do troféu
- tela/modal detalhe
- carregar check-ins do desafio (opcional)

## 12. Critérios de aceite
1) Usuário com 0 check-ins: card mostra 0/0/0 e CTA para começar.
2) Usuário com check-ins esparsos: `activeDaysTotal` correto e `streakCurrent` = 0 se não fez hoje.
3) Usuário com check-in hoje e ontem: `streakCurrent` = 2.
4) `streakBest` reflete maior sequência histórica.
5) “Desafios concluídos” mostra total e lista ordenada por data de conclusão.
6) Troféu abre detalhe mostrando informações do desafio e (opcional) datas de check-in.

## 13. Riscos e mitigação
- **Inconsistência de status completed** → usar fallback por check-ins.
- **Timezone** → garantir `date_key` consistente no app no momento do check-in.
- **Performance** → limitar preview, paginar lista “Ver todos”.

## 14. Dependências
- RLS para `daily_checkins`, `challenge_participants`, `challenges` (leitura do próprio user).
- Mapeamento de ícones por `challenge.type` no client (assets).
