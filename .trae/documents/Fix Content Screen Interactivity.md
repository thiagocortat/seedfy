O problema na tela de Conteúdo ocorre por dois motivos principais:

1.  **Clique não funciona:** O componente `Card` está sendo renderizado sem nenhum wrapper de toque (`TouchableOpacity` ou `Pressable`), o que impede qualquer interação.
2.  **Imagens de Placeholder:** O código já está preparado para exibir imagens (`item.coverUrl`), mas os dados atuais no banco (seed) utilizam URLs do `placehold.co`. Isso é esperado em ambiente de desenvolvimento, mas confirmarei se a lógica de renderização está correta.

### Plano de Implementação

1.  **Habilitar Interação (Clique):**
    *   Modificar `src/screens/ContentScreen.tsx`.
    *   Envolver o componente `Card` com um `TouchableOpacity`.
    *   Implementar a ação `onPress` para abrir o link de mídia (`item.mediaUrl`) usando o módulo `Linking` do React Native.

2.  **Verificação de Imagens:**
    *   A lógica atual `<Image source={{ uri: item.coverUrl }} ... />` está correta. As imagens aparecem como "placeholders" porque os dados inseridos no banco (`supabase_seed.sql`) são URLs de teste (`https://placehold.co/...`). Não alterarei os dados do banco, pois isso requer re-executar seeds, mas garantirei que a UI trate corretamente URLs válidas.

**Arquivos Afetados:**
*   `src/screens/ContentScreen.tsx`
