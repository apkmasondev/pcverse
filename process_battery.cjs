const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const inputPath = 'C:\\Users\\krzyc\\.gemini\\antigravity-ide\\brain\\0ad14dac-2af3-4e5c-9e45-1d522b2d6090\\cr2032_battery_1782161801728.png';
  const outputPath = 'src/assets/cmos_battery.webp';

  try {
    const metadata = await sharp(inputPath).metadata();
    const size = Math.min(metadata.width, metadata.height);
    const radius = size / 2;

    const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius * 0.95}" fill="white" /></svg>`;

    await sharp(inputPath)
      .extract({
        left: Math.round((metadata.width - size) / 2),
        top: Math.round((metadata.height - size) / 2),
        width: size,
        height: size
      })
      .composite([{
        input: Buffer.from(circleSvg),
        blend: 'dest-in'
      }])
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log('Successfully created cmos_battery.webp');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();
