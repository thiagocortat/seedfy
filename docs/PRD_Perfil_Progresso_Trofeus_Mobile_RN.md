# PRD — Mobile (React Native) — Perfil: Consistência e Troféus

**Base:** PRD geral “Perfil: Consistência e Troféus” (sem DB/backoffice)  
**Plataforma:** React Native (Seedfy App)

## 1. Objetivo no Mobile
Entregar no Perfil:
- Card “Consistência” (dias ativos, streak atual, melhor streak)
- Seção “Troféus” (desafios concluídos) com preview + navegação para lista completa e detalhe

## 2. Escopo (Mobile)
### Inclui
- UI no Perfil (componentes novos)
- Serviços/queries Supabase para agregações
- Tela “Troféus” (lista completa)
- Tela/Modal “Detalhe do Troféu”

### Exclui
- Badges
- Backoffice
- Mudanças em banco (tabelas/colunas)

## 3. Navegação
- **Perfil** (já existe)
  - “Ver todos” em Troféus → **TrophiesScreen**
  - Clicar troféu → **TrophyDetailScreen** (push) ou modal

Rotas sugeridas:
- `Profile`
- `Trophies`
- `TrophyDetail/:challengeId`

## 4. Componentes UI (RN)
### 4.1. `ConsistencyCard`
Props:
- `activeDaysTotal`
- `streakCurrent`
- `streakBest`
- `isLoading`
- `onPressCTA?`

Layout:
- 3 colunas com números grandes + labels curtos
- estado vazio: texto + botão “Começar um desafio”

### 4.2. `TrophiesPreviewGrid`
Props:
- `items` (máx 6)
- `completedTotal`
- `onPressSeeAll`
- `onPressItem(challengeId)`

Card do troféu:
- ícone por `type`
- title (1-2 linhas)
- “{durationDays} dias”
- data curta (dd/mm/aaaa)

### 4.3. `TrophyDetail`
Conteúdo:
- Header: ícone + título
- Chips: tipo, duração
- Período: start → end
- Progresso final: `distinct_checkins/durationDays`
- Lista de `date_key` (opcional)

## 5. Data layer (Supabase)
### 5.1. Queries
Implementar no serviço `profileProgressService`:

1) `getActiveDaysTotal(userId)`
2) `getDistinctCheckinDates(userId)` → para streak
3) `getCompletedChallengesByStatus(userId)`  
4) `getCompletedChallengesFallback(userId)` (somente se 3 retornar vazio ou suspeito)
5) `getChallengeCheckins(userId, challengeId)` (para detalhe)

### 5.2. Cálculo streak (client)
Algoritmo:
- Recebe array `date_key` desc (YYYY-MM-DD)
- Converter para Date no timezone do usuário (usar biblioteca/utility já usada no app)
- `streakCurrent`:
  - se primeira data != hoje → 0
  - senão contar consecutivos (hoje, ontem, anteontem…)
- `streakBest`: varrer e encontrar maior sequência

## 6. Performance e UX
- Cache in-memory (React Query/SWR equivalente) para `ProfileProgressDTO` por 5 min
- Skeleton loading no Perfil
- “Ver todos” pagina (infinite scroll ou paginação por 20)

## 7. Estados e mensagens
- Sem check-ins: “Faça seu primeiro check-in e acompanhe sua constância.”
- Sem troféus: “Complete um desafio para ganhar seu primeiro troféu.”

## 8. Critérios de aceite (Mobile)
1) Perfil renderiza card Consistência com valores corretos e loading.
2) Preview de troféus mostra no máx 6 itens + contador total.
3) “Ver todos” lista completa ordenada por `completedAt` desc.
4) Detalhe abre e mostra info do desafio e check-ins.

## 9. Checklist implementável (RN)
- [ ] Criar service `profileProgressService.ts`
- [ ] Criar util `streakCalculator.ts`
- [ ] Criar `ConsistencyCard.tsx`
- [ ] Criar `TrophiesPreviewGrid.tsx`
- [ ] Integrar no `ProfileScreen.tsx`
- [ ] Criar `TrophiesScreen.tsx`
- [ ] Criar `TrophyDetailScreen.tsx`
- [ ] Garantir RLS/queries somente do próprio usuário
- [ ] Testes: datas (hoje/ontem), streak 0, streak > 0, melhor streak
