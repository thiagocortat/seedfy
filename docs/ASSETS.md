# Documentação de Assets Visuais - Seedfy

## Visão Geral
Este documento detalha os assets visuais gerados para a publicação do aplicativo Seedfy nas lojas (Google Play Store e Apple App Store) e para uso em materiais de marketing.

A identidade visual segue um estilo minimalista e moderno, utilizando tons de dourado (#D4AF37) para representar o crescimento espiritual ("seed") sobre um fundo escuro carvão (#2D3436), transmitindo elegância e seriedade.

## Estrutura de Arquivos
Os assets estão localizados no diretório `assets/images/`:

```
assets/images/
├── icon.png            # Ícone principal do aplicativo
├── adaptive-icon.png   # Ícone adaptativo para Android (foreground)
├── splash.png          # Tela de abertura (Splash Screen)
└── feature-graphic.png # Banner promocional para lojas
```

## Detalhes dos Assets

## Nota Importante: Geração via SVG
Devido a instabilidades na API de geração de imagem, os assets oficiais foram gerados como vetores **SVG** de alta fidelidade para garantir a qualidade visual e o alinhamento com a identidade da marca.

Os arquivos `.svg` estão disponíveis em `assets/images/`. Para o build final (especialmente para ícones do iOS e Android), recomenda-se converter estes SVGs para PNG.

### 1. Ícone do Aplicativo (`icon.svg`)
- **Resolução:** Vetorial (Base 1024x1024)
- **Uso:** Ícone principal.
- **Conceito:** Três folhas ou chamas estilizadas douradas entrelaçadas em círculo.
- **Simbolismo:** Representa o "pequeno grupo" (célula) e a trindade de crescimento: leitura, jejum e oração vividos em comunidade. A forma circular denota unidade e ciclo contínuo de discipulado.

### 2. Ícone Adaptativo Android (`adaptive-icon.svg`)
- **Resolução:** Vetorial (Base 1024x1024)
- **Design:** O símbolo da "Trindade de Crescimento" (as três folhas/chamas) isolado, pronto para adaptação em qualquer formato de dispositivo Android.

### 3. Splash Screen (`splash.svg`)
- **Resolução:** Vetorial (Base 1080x1920)
- **Conceito:** Redes de conexão orgânica.
- **Design:** Fundo escuro com linhas douradas sutis que se conectam como raízes ou galhos, sugerindo que o usuário está entrando em um ecossistema vivo de fé compartilhada. Transmite paz e acolhimento.

### 4. Feature Graphic (`feature-graphic.svg`)
- **Resolução:** Vetorial (Base 1024x500)
- **Conceito:** "Luz Compartilhada".
- **Design:** Uma composição abstrata de pontos de luz dourada se conectando para formar uma estrutura maior (como uma árvore ou constelação). Representa visualmente como hábitos espirituais individuais, quando compartilhados, constroem uma comunidade forte e luminosa.

## Como Atualizar
Para regenerar os assets SVG, utilize o script:

```bash
npx tsx scripts/generate-assets-svg.ts
```

## Configuração do Projeto
O arquivo `app.json` foi configurado para apontar para estes novos assets:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2D3436"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#2D3436"
      }
    },
    "web": {
      "favicon": "./assets/images/icon.png"
    }
  }
}
```
