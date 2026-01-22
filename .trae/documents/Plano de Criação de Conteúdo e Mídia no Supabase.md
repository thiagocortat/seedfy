Vou criar um ambiente de conteúdo rico e funcional para o **Seedfy**, utilizando o Storage do Supabase e melhorando a experiência de reprodução no app.

### **1. Configuração do Storage (Supabase)**
*   **Ação:** Criar buckets dedicados para organização: `media` (vídeos/áudios) e `covers` (imagens).
*   **Segurança:** Configurar políticas de acesso (RLS) para garantir que o conteúdo seja público para leitura (necessário para streaming no app), mas restrito para escrita.

### **2. Geração e Upload de Conteúdo Realista (Script Automatizado)**
Como não posso criar arquivos de vídeo/áudio do zero, criarei um script inteligente em Node.js (`scripts/seedContent.ts`) que:
1.  **Baixa** conteúdos de exemplo de alta qualidade da internet (vídeos curtos, áudios e imagens livres de direitos autorais).
2.  **Faz Upload** desses arquivos para o seu Storage no Supabase (atendendo ao seu pedido de usar o storage próprio).
3.  **Popula** a tabela `content_items` com os links *do seu Supabase*, títulos, descrições e categorias corretas (`video`, `podcast`, `music`).
*   *Conteúdo Previsto:*
    *   **Vídeo:** "Morning Devotional" (Vídeo curto inspirador).
    *   **Podcast:** "Weekly Wisdom" (Áudio de conversa).
    *   **Música:** "Worship Session" (Faixa de áudio).

### **3. Aprimoramento da Tela de Conteúdo (`ContentScreen`)**
Atualmente, o app apenas abre links externos. Vou transformar isso em uma experiência imersiva:
*   **Player de Vídeo Integrado:** Usar `expo-av` para reproduzir vídeos diretamente no card ou em um modal, sem sair do app.
*   **Player de Áudio:** Adicionar controles básicos de play/pause para itens de áudio.
*   **Design:** Melhorar os Cards para mostrar ícones de "Play" sobre a capa e indicar visualmente o tipo de mídia.

### **4. Execução**
1.  Aplicar SQL para buckets e policies.
2.  Rodar o script de seed para popular o storage e banco.
3.  Refatorar `ContentScreen.tsx` para consumir e reproduzir esse conteúdo.
