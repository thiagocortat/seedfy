Vou transformar a tela de Conteúdo em uma experiência rica e funcional, implementando um player de mídia real e populando o banco com dados de demonstração de alta qualidade.

**Como não consigo fazer upload de arquivos físicos diretamente para o seu Storage do Supabase (limitação técnica da IA), utilizarei links públicos de alta performance (CDNs) que simulam perfeitamente o comportamento real.**

### Fase 1: Conteúdo "Real" (Data Seeding)
Vou criar um script SQL para limpar os dados de teste atuais e inserir conteúdos com links reais funcionais:
- **Vídeos:** Clips inspiradores (formato MP4) sobre natureza e comunidade.
- **Áudio:** Faixas de meditação/fundo musical (formato MP3).
- **Imagens:** Capas de alta resolução do Unsplash para cada item.
- **Categorias:** Organização correta por tipos (`video`, `music`, `podcast`).

### Fase 2: Implementação do Player de Mídia (`expo-av`)
A biblioteca `expo-av` já está instalada, mas não utilizada. Vou implementá-la:
- **Componente `MediaPlayer`:** Um modal ou componente que se sobrepõe para tocar o conteúdo.
- **Suporte a Vídeo:** Player com controles (play/pause, fullscreen).
- **Suporte a Áudio:** Player com barra de progresso e controles.
- **Gerenciamento de Estado:** Parar a mídia ao fechar ou mudar de aba.

### Fase 3: Integração na `ContentScreen`
- **Interatividade:** Substituir o `Linking.openURL` (que abre o navegador) pela abertura do nosso novo Player interno.
- **Feedback Visual:** Indicadores de "Tocando agora" ou ícones de tipo de mídia (Play para vídeo, Fone para áudio).

**Resultado Final:** Ao clicar em um item na aba "Content", o vídeo ou áudio tocará *dentro* do aplicativo, com capas bonitas e títulos realistas.