O erro `ReferenceError: Property 'StyleSheet' doesn't exist` é causado por uma falha simples na importação do módulo `StyleSheet` no arquivo `src/features/auth/ForgotPasswordScreen.tsx`, embora ele esteja sendo utilizado no código.

**Plano de Correção:**

1.  **Corrigir Importação:** Editar o arquivo `src/features/auth/ForgotPasswordScreen.tsx` para incluir `StyleSheet` na importação do pacote `react-native`.
2.  **Verificação:** Confirmar se não há outros erros de importação semelhantes nos arquivos recentemente editados (`SignInScreen.tsx` e `SignUpScreen.tsx`).

Essa correção rápida resolverá o erro de execução ("Red Screen of Death") e permitirá que o aplicativo carregue normalmente.