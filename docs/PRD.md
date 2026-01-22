# Product Requirements Document (PRD) - Seedfy

**Versão:** 1.0
**Data:** 22 de Janeiro de 2026
**Projeto:** Seedfy (Antigo MyGlory)

---

## 1. Visão Geral do Produto

### 1.1 Objetivos e Propósito
O **Seedfy** é uma plataforma móvel projetada para promover o crescimento espiritual comunitário. O objetivo principal é conectar pessoas através de "pequenos grupos" (células) e igrejas locais, facilitando a criação e o acompanhamento de desafios espirituais diários (leitura bíblica, jejum, meditação). O app visa transformar hábitos espirituais solitários em experiências coletivas e engajadoras.

### 1.2 Público-Alvo e Personas
*   **Membros de Igrejas:** Pessoas que buscam consistência em sua vida devocional e querem se sentir parte de uma comunidade.
*   **Líderes de Pequenos Grupos:** Responsáveis por engajar e acompanhar o desenvolvimento espiritual de seus liderados.
*   **Jovens Cristãos:** Usuários habituados a tecnologia que buscam ferramentas modernas para praticar sua fé.

### 1.3 Benefícios e Diferencial Competitivo
*   **Foco Comunitário:** Diferente de apps de bíblia tradicionais, o Seedfy é centrado na interação em grupo.
*   **Gamificação Leve:** Sistema de progresso e desafios compartilhados para incentivar a constância.
*   **Integração Local:** Conexão direta com a igreja local do usuário para atualizações e eventos.
*   **Conteúdo Multimídia:** Player integrado para consumo de devocionais em vídeo e áudio sem sair do app.

---

## 2. Requisitos Funcionais

### 2.1 Gestão de Identidade e Perfil
*   **Cadastro/Login:** Autenticação via E-mail/Senha (Supabase Auth).
*   **Onboarding:** Fluxo inicial para capturar Nome, Interesses e Igreja do usuário.
*   **Perfil:** Edição de foto, nome e igreja vinculada. Auto-recuperação de perfil em caso de inconsistência de dados.

### 2.2 Grupos (Células)
*   **Criação de Grupos:** Usuários podem criar grupos privados. O criador torna-se automaticamente o "Owner".
*   **Listagem:** Visualização dos grupos aos quais o usuário pertence.
*   **Atividade Recente:** Feed de atividades do grupo (novos membros, novos desafios).

### 2.3 Desafios Espirituais (Core Feature)
*   **Criação de Desafios:**
    *   Tipos suportados: Leitura (`reading`), Meditação (`meditation`), Jejum (`fasting`), Comunhão (`communion`).
    *   Duração configurável: 3, 7, 14 ou 21 dias.
    *   Vínculo obrigatório a um grupo existente.
*   **Participação:** Inscrição automática do criador; outros membros do grupo podem entrar (`join`).
*   **Check-in Diário:**
    *   Registro de progresso diário único por usuário/desafio.
    *   Validação para impedir múltiplos check-ins no mesmo dia.
    *   Feedback visual de progresso (barra de progresso).

### 2.4 Conteúdo e Mídia
*   **Biblioteca de Conteúdo:** Listagem de Podcasts, Vídeos e Músicas.
*   **Player Imersivo:**
    *   Reprodução de vídeo em tela cheia com controles nativos.
    *   Reprodução de áudio com capa do álbum, seek bar, play/pause e background audio.
    *   Parada automática de reprodução ao fechar o player.
*   **Destaques:** Seção "Featured for You" na Home com acesso rápido ao player.

### 2.5 Integração com Igreja
*   **Vínculo:** Seleção de igreja no perfil.
*   **Feed de Atualizações:** Notícias dinâmicas baseadas na igreja selecionada.
*   **Ações Rápidas:** Botões funcionais para Doação ("Give") e Eventos (Links externos).

---

## 3. Requisitos Não-Funcionais

### 3.1 Desempenho
*   **Tempo de Resposta:** Carregamento de telas e ações de banco de dados < 2 segundos.
*   **Reprodução de Mídia:** Streaming sem travamentos em conexões 4G/Wi-Fi estáveis.
*   **Otimista:** Atualizações de estado local (UI) devem ser imediatas, sincronizando com o servidor em segundo plano.

### 3.2 Segurança
*   **RLS (Row Level Security):** Todas as tabelas do banco de dados devem ter políticas estritas de acesso (apenas usuários autenticados podem ler/escrever seus próprios dados ou dados de seus grupos).
*   **Storage:** Buckets de mídia públicos para leitura, mas restritos para escrita (apenas admin/backend).

### 3.3 Compatibilidade
*   **Plataformas:** iOS e Android (via Expo/React Native).
*   **Modo Offline:** O app deve suportar navegação básica sem internet, sincronizando dados quando a conexão retornar (suporte básico via React Query/Zustand persist).

---

## 4. Design e Experiência do Usuário

### 4.1 Diretrizes de UI/UX
*   **Estilo:** Minimalista, limpo, focado em conteúdo.
*   **Navegação:**
    *   **Tab Bar (Inferior):** Home, Groups, Content, Church, Profile.
    *   **Modais:** Usados para criação de itens (Desafios, Grupos) e Player de Mídia.
*   **Feedback:** Uso consistente de Loaders, Toasts de erro/sucesso e Alertas de confirmação.

### 4.2 Fluxos Principais
1.  **Novo Desafio:** Home -> Aba Challenges -> Create Challenge -> Selecionar Tipo -> Configurar Detalhes -> Selecionar Grupo -> Confirmar.
2.  **Consumir Conteúdo:** Home (Featured) ou Aba Library -> Clicar no Card -> Player Modal Abre (Auto-play) -> Fechar Player (Auto-stop).
3.  **Check-in:** Home -> Card do Desafio Ativo -> Detalhes do Desafio -> Botão "Check-in".

---

## 5. Cronograma e Marcos

| Fase | Descrição | Estimativa | Status |
| :--- | :--- | :--- | :--- |
| **Fase 1** | Setup, Autenticação e Onboarding | Semana 1-2 | ✅ Concluído |
| **Fase 2** | Core: Grupos e Desafios (CRUD) | Semana 3-4 | ✅ Concluído |
| **Fase 3** | Conteúdo Multimídia e Player | Semana 5 | ✅ Concluído |
| **Fase 4** | Integração com Igreja e Feed | Semana 6 | ✅ Concluído |
| **Fase 5** | Refinamento, Testes e Polimento | Semana 7 | 🔄 Em andamento |
| **Lançamento** | Deploy nas Lojas (Beta) | Semana 8 | Pendente |

---

## 6. Métricas de Sucesso (KPIs)

1.  **Retenção D1/D7/D30:** Porcentagem de usuários que retornam ao app.
2.  **Taxa de Conclusão de Desafios:** % de usuários que iniciam e terminam um desafio de 7+ dias.
3.  **Engajamento Diário:** Média de check-ins por usuário ativo diário (DAU).
4.  **Consumo de Mídia:** Tempo médio gasto no PlayerScreen.

---

## 7. Considerações Técnicas

### 7.1 Arquitetura
*   **Frontend:** React Native com Expo (TypeScript).
*   **Gerenciamento de Estado:** Zustand (Stores globais para User, Auth, Challenge, Group, Content).
*   **Backend/BaaS:** Supabase (PostgreSQL, Auth, Storage, Edge Functions se necessário).
*   **Navegação:** React Navigation (Native Stack + Bottom Tabs).

### 7.2 Modelo de Dados (Resumo)
*   `users`: Perfis estendidos.
*   `groups` / `group_members`: Estrutura de comunidade.
*   `challenges` / `challenge_participants`: Lógica de gamificação.
*   `daily_checkins`: Registro granular de progresso.
*   `content_items`: Catálogo de mídia.
*   `churches`: Entidades de congregação.

---

## 8. Riscos e Mitigação

| Risco | Impacto | Mitigação |
| :--- | :--- | :--- |
| **Custos de Storage/Bandwidth** | Alto (se escalar rápido) | Usar compressão de mídia; Implementar cache local agressivo; Monitorar cotas do Supabase. |
| **Engajamento Baixo** | Médio | Implementar Push Notifications para lembretes de check-in (já iniciado); Criar badges/conquistas visuais. |
| **Conteúdo Ilegal/Impróprio** | Alto (se houver UGC) | Por enquanto, apenas admins podem postar conteúdo na Library. Moderação futura necessária para chat de grupos. |
| **Bugs de Sincronização** | Médio | Implementar tratamento de erros robusto e "Retry" automático em falhas de rede; UI Otimista. |
