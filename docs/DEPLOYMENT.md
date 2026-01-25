# Guia de Deployment e Geração de Binários - Seedfy

Este documento contém todas as instruções necessárias para gerar versões do aplicativo para testes (distribuição interna) e para publicação oficial nas lojas (Google Play Store e Apple App Store).

## 🛠 Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas e configuradas:

1.  **EAS CLI** (Expo Application Services CLI):
    ```bash
    npm install -g eas-cli
    ```

2.  **Login na Expo**:
    Certifique-se de estar logado na sua conta Expo onde o projeto está configurado.
    ```bash
    eas login
    ```

## � Acesso Remoto via Expo Go (Tunnel)

Se você quiser que alguém teste o aplicativo imediatamente sem precisar gerar um arquivo APK/IPA, você pode usar o recurso de "Tunnel" do Expo. Isso permite que qualquer pessoa com o aplicativo **Expo Go** instalado no celular acesse sua versão de desenvolvimento local, mesmo estando em outra rede Wi-Fi/4G.

1.  **Inicie o projeto com a flag `--tunnel`:**
    ```bash
    npx expo start --tunnel
    ```

2.  **Compartilhe o QR Code ou Link:**
    *   O terminal exibirá um QR Code.
    *   Envie a foto desse QR Code para a pessoa.
    *   Ela deve abrir a câmera (iOS) ou o app Expo Go (Android) e escanear.

**Nota:** O computador onde o comando está rodando precisa permanecer ligado e com o processo rodando para que o aplicativo funcione no celular da outra pessoa.

## �📱 Fase de Desenvolvimento (Testes Internos)

Para compartilhar o aplicativo com outras pessoas (QA, stakeholders, testadores) sem passar pelas lojas, utilizamos os perfis de build `preview` ou `development`.

### Android (Gerar APK)

A maneira mais fácil de testar no Android é gerar um arquivo `.apk` que pode ser instalado diretamente no dispositivo.

**Comando:**
```bash
eas build -p android --profile preview
```

*   **O que acontece:** O EAS irá gerar um arquivo `.apk`.
*   **Como instalar:** Ao final do processo, você receberá um link de download. Baixe o arquivo e envie para os testadores. Eles podem instalar abrindo o arquivo no celular Android.

### iOS (Simulador ou Dispositivo)

Para iOS, a distribuição fora da loja é mais restrita.

**Opção 1: Build para Simulador**
Se você quiser testar no simulador do iOS no seu Mac:
```bash
eas build -p ios --profile preview
```
*Nota: É necessário configurar o perfil `preview` no `eas.json` para suportar simulador se ainda não estiver (adicionando `"ios": { "simulator": true }`).*

**Opção 2: Dispositivos Registrados (Ad-hoc)**
Para instalar em dispositivos físicos iPhone/iPad sem usar a App Store, os dispositivos precisam estar registrados na conta de desenvolvedor da Apple.
```bash
eas build -p ios --profile development
```
*Isso gera uma versão de desenvolvimento que requer que o dispositivo esteja provisionado.*

---

## 🚀 Publicação nas Stores (Produção)

Quando o aplicativo estiver pronto para ser lançado para o público geral.

### 1. Configuração de Credenciais

Antes do primeiro build de produção, você precisará configurar as credenciais (chaves de assinatura, certificados). O EAS facilita isso gerenciando tudo na nuvem.

**Android (Google Play Store):**
Você precisará de uma conta de desenvolvedor Google Play e um arquivo de chave de serviço (Service Account) configurado se quiser submeter automaticamente.

**iOS (Apple App Store):**
Você precisará de uma conta de desenvolvedor Apple (paga).

### 2. Gerar Builds de Produção

**Android (App Bundle - AAB):**
O formato exigido pela Google Play é o `.aab`.

```bash
eas build -p android --profile production
```

**iOS (Arquivo IPA):**
O formato para envio para a App Store Connect.

```bash
eas build -p ios --profile production
```

### 3. Submissão para as Lojas

Você pode fazer o upload manual dos arquivos gerados acima nos portais das lojas, ou usar o EAS Submit para enviar automaticamente.

**Enviar para Google Play Store:**
```bash
eas submit -p android --latest
```

**Enviar para Apple App Store:**
```bash
eas submit -p ios --latest
```

---

## 🔄 Atualizações Over-the-Air (OTA)

O projeto está configurado para suportar atualizações via EAS Update. Isso permite corrigir bugs pequenos e atualizar o JS/Assets sem precisar gerar um novo binário e passar pela revisão das lojas.

**Publicar uma atualização:**
```bash
eas update --branch production --message "Descrição da atualização"
```

---

## 📄 Resumo dos Comandos

| Objetivo | Plataforma | Comando | Resultado |
| :--- | :--- | :--- | :--- |
| **Testar (Fácil)** | Android | `eas build -p android --profile preview` | Arquivo `.apk` (Instalação direta) |
| **Testar (Dev)** | iOS/Android | `eas build --profile development` | Build de desenvolvimento |
| **Produção** | Android | `eas build -p android --profile production` | Arquivo `.aab` (Para Google Play) |
| **Produção** | iOS | `eas build -p ios --profile production` | Arquivo `.ipa` (Para App Store) |
