import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'assets', 'images');
const PLACEHOLDER_SIZE = 176626; // Tamanho observado do placeholder
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 segundos

const ASSETS = [
  {
    name: 'icon.png',
    prompt: 'App icon for spiritual community app. Three stylized golden leaves intertwined to form a circle, representing a small group and shared spiritual growth. Minimalist, flat vector design, centered on dark charcoal background #2D3436. Elegant, symbolic, high quality.',
    size: 'square_hd',
  },
  {
    name: 'adaptive-icon.png',
    prompt: 'Three stylized golden leaves intertwined to form a circle, symbol of community and growth. Vector graphics, flat design, isolated on white background, high contrast, logo only, centered.',
    size: 'square',
  },
  {
    name: 'splash.png',
    prompt: 'Vertical mobile background for spiritual app. Deep charcoal background with faint, elegant golden ripples or interconnected network lines, symbolizing community influence and spiritual connection. Peaceful, serene, minimal, warm lighting.',
    size: 'portrait_16_9',
  },
  {
    name: 'feature-graphic.png',
    prompt: 'Marketing banner for spiritual community app. A glowing network of golden lights connecting to form a tree shape or network, representing individual spiritual habits building a community. Dark background, warm golden glow, inspiring, modern digital art, sense of unity.',
    size: 'landscape_16_9',
  }
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generate() {
  console.log('Starting community-focused asset generation with retry logic...');
  
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
  
  for (const asset of ASSETS) {
    console.log(`\nProcessing ${asset.name}...`);
    const promptEncoded = encodeURIComponent(asset.prompt);
    const url = `https://coreva-normal.trae.ai/api/ide/v1/text_to_image?prompt=${promptEncoded}&image_size=${asset.size}`;
    
    let attempt = 0;
    let success = false;

    while (attempt < MAX_RETRIES && !success) {
      attempt++;
      console.log(`  Attempt ${attempt}/${MAX_RETRIES}...`);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const size = buffer.length;
        
        console.log(`  Downloaded ${size} bytes`);

        // Se o tamanho for diferente do placeholder conhecido (com margem de erro) ou se for a primeira tentativa e quisermos forçar espera
        // Na verdade, vamos assumir que se o tamanho for muito próximo do placeholder, ainda é o placeholder.
        // Vamos dar uma margem de segurança de 100 bytes para variações do placeholder.
        const isPlaceholder = Math.abs(size - PLACEHOLDER_SIZE) < 1000;

        if (isPlaceholder) {
            console.log('  ⚠️ Detected placeholder image. Waiting for generation...');
            await sleep(RETRY_DELAY);
        } else {
            // Se o tamanho mudou significativamente, assumimos que é a imagem real
            fs.writeFileSync(path.join(ASSETS_DIR, asset.name), buffer);
            console.log(`✅ Generated ${asset.name} (${size} bytes)`);
            success = true;
        }

      } catch (error) {
        console.error(`  ❌ Error:`, error);
        await sleep(RETRY_DELAY);
      }
    }

    if (!success) {
        console.error(`❌ Failed to generate ${asset.name} after ${MAX_RETRIES} attempts.`);
    }
  }
  
  console.log('\nAsset generation process complete.');
}

generate();
