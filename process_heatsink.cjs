const sharp = require('sharp');

async function processHeatsink() {
  const inputPath = 'C:\\Users\\krzyc\\.gemini\\antigravity-ide\\brain\\0ad14dac-2af3-4e5c-9e45-1d522b2d6090\\media__1782162095328.png';
  const outputPath = 'src/assets/m2_heatsink.webp';

  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log('Successfully created m2_heatsink.webp');
  } catch (error) {
    console.error('Error processing heatsink image:', error);
  }
}

processHeatsink();
