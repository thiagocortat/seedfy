import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'assets', 'images');

// Cores
const COLORS = {
  background: '#2D3436', // Charcoal
  primary: '#D4AF37',    // Gold
  white: '#FFFFFF'
};

// Templates SVG
const SVGS = {
  icon: (width: number, height: number) => `
<svg width="${width}" height="${height}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${COLORS.background}"/>
  <g transform="translate(512, 512) scale(0.8)">
    <!-- Trindade de Folhas/Chamas - Representando Comunidade e Crescimento -->
    <path d="M0,-300 C165,-300 300,-165 300,0 C300,165 165,300 0,300 C-165,300 -300,165 -300,0 C-300,-165 -165,-300 0,-300 Z" fill="none" stroke="${COLORS.primary}" stroke-width="20" opacity="0.3"/>
    <path d="M0,-250 Q150,-250 150,0 Q150,250 0,250 Q-150,250 -150,0 Q-150,-250 0,-250 Z" fill="${COLORS.primary}"/>
    <path d="M0,-150 Q80,-150 80,0 Q80,150 0,150 Q-80,150 -80,0 Q-80,-150 0,-150 Z" fill="${COLORS.background}" opacity="0.5"/>
    <!-- Folha Superior -->
    <path d="M0,-200 C50,-200 100,-100 0,0 C-100,-100 -50,-200 0,-200" fill="${COLORS.primary}"/>
    <!-- Folha Direita Inferior -->
    <path d="M173,100 C198,143 123,198 0,0 C123,100 148,56 173,100" fill="${COLORS.primary}" transform="rotate(120)"/>
    <!-- Folha Esquerda Inferior -->
    <path d="M-173,100 C-198,143 -123,198 0,0 C-123,100 -148,56 -173,100" fill="${COLORS.primary}" transform="rotate(240)"/>
  </g>
</svg>`,

  adaptiveIcon: (width: number, height: number) => `
<svg width="${width}" height="${height}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo Transparente para Adaptive Icon -->
  <g transform="translate(512, 512) scale(0.8)">
    <path d="M0,-300 C165,-300 300,-165 300,0 C300,165 165,300 0,300 C-165,300 -300,165 -300,0 C-300,-165 -165,-300 0,-300 Z" fill="none" stroke="${COLORS.primary}" stroke-width="40"/>
    <!-- Trindade Simplificada -->
    <circle cx="0" cy="-150" r="100" fill="${COLORS.primary}"/>
    <circle cx="130" cy="75" r="100" fill="${COLORS.primary}"/>
    <circle cx="-130" cy="75" r="100" fill="${COLORS.primary}"/>
    <!-- Conexão Central -->
    <circle cx="0" cy="0" r="60" fill="${COLORS.primary}"/>
  </g>
</svg>`,

  splash: (width: number, height: number) => `
<svg width="${width}" height="${height}" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1920" fill="${COLORS.background}"/>
  <!-- Linhas de Conexão/Rede -->
  <g stroke="${COLORS.primary}" stroke-width="2" opacity="0.2" fill="none">
    <path d="M0,1920 Q540,960 1080,0"/>
    <path d="M1080,1920 Q540,960 0,0"/>
    <path d="M540,1920 L540,0"/>
    <circle cx="540" cy="960" r="300" stroke-width="4" opacity="0.3"/>
    <circle cx="540" cy="960" r="200" stroke-width="2" opacity="0.4"/>
    <circle cx="540" cy="960" r="100" stroke-width="1" opacity="0.5"/>
  </g>
  <!-- Logo Central -->
  <g transform="translate(540, 960) scale(0.5)">
     <path d="M0,-300 C165,-300 300,-165 300,0 C300,165 165,300 0,300 C-165,300 -300,165 -300,0 C-300,-165 -165,-300 0,-300 Z" fill="none" stroke="${COLORS.primary}" stroke-width="20"/>
     <circle cx="0" cy="-150" r="80" fill="${COLORS.primary}"/>
     <circle cx="130" cy="75" r="80" fill="${COLORS.primary}"/>
     <circle cx="-130" cy="75" r="80" fill="${COLORS.primary}"/>
  </g>
</svg>`,

  feature: (width: number, height: number) => `
<svg width="${width}" height="${height}" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="500" fill="${COLORS.background}"/>
  <!-- Rede de Luz -->
  <g fill="${COLORS.primary}" opacity="0.4">
    <circle cx="100" cy="100" r="4"/>
    <circle cx="200" cy="400" r="6"/>
    <circle cx="500" cy="250" r="8"/>
    <circle cx="800" cy="150" r="5"/>
    <circle cx="900" cy="350" r="7"/>
  </g>
  <!-- Linhas Conectando -->
  <g stroke="${COLORS.primary}" stroke-width="1" opacity="0.2">
    <line x1="100" y1="100" x2="500" y2="250"/>
    <line x1="200" y1="400" x2="500" y2="250"/>
    <line x1="800" y1="150" x2="500" y2="250"/>
    <line x1="900" y1="350" x2="500" y2="250"/>
  </g>
  <!-- Texto/Logo (Opcional, mantendo abstrato) -->
  <g transform="translate(512, 250) scale(1.5)">
     <path d="M0,-50 L40,20 L-40,20 Z" fill="${COLORS.primary}" opacity="0.8"/>
  </g>
</svg>`
};

async function generateSvg() {
  console.log('Generating SVG assets...');
  
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }

  // Generate Icon
  fs.writeFileSync(path.join(ASSETS_DIR, 'icon.svg'), SVGS.icon(1024, 1024));
  console.log('✅ Generated icon.svg');

  // Generate Adaptive Icon
  fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.svg'), SVGS.adaptiveIcon(1024, 1024));
  console.log('✅ Generated adaptive-icon.svg');

  // Generate Splash
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.svg'), SVGS.splash(1080, 1920));
  console.log('✅ Generated splash.svg');

  // Generate Feature Graphic
  fs.writeFileSync(path.join(ASSETS_DIR, 'feature-graphic.svg'), SVGS.feature(1024, 500));
  console.log('✅ Generated feature-graphic.svg');
  
  console.log('\nSVG Generation complete. Please convert these SVGs to PNG for final app build if needed.');
}

generateSvg();
