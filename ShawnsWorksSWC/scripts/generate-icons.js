import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 120, 128, 144, 152, 167, 180, 192, 384, 512];
const inputSvg = path.join(__dirname, '../client/public/icons/icon.svg');
const outputDir = path.join(__dirname, '../client/public/icons');

async function generateIcons() {
  console.log('Generating PNG icons from SVG...');
  
  const svgBuffer = fs.readFileSync(inputSvg);
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`Created: icon-${size}x${size}.png`);
  }
  
  // Also create favicon.png at 32x32 and 16x16
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, '../favicon.png'));
  console.log('Created: favicon.png');
  
  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
