import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToConvert = [
  'case_back.png',
  'case_bottom.png',
  'case_behind.png',
  'mobo_top.png'
];

const dir = path.join(__dirname, 'src', 'assets');

async function convert() {
  for (const file of filesToConvert) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace('.png', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      console.log(`Converting ${file}...`);
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Saved ${outputPath}`);
      // Remove original
      fs.unlinkSync(inputPath);
      console.log(`Deleted original ${file}`);
    } else {
      console.log(`Skipped ${file} (not found)`);
    }
  }
}

convert().catch(console.error);
