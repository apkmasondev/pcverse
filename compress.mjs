import sharp from "sharp";
async function processImage(fileIn, fileOut) {
  try {
    const info = await sharp(fileIn).webp({ quality: 80 }).toFile(fileOut);
    console.log(fileOut + ": " + info.width + "x" + info.height);
  } catch (e) {
    console.error("Error processing " + fileIn + ": " + e);
  }
}
processImage("C:/Users/krzyc/.gemini/antigravity-ide/brain/0ad14dac-2af3-4e5c-9e45-1d522b2d6090/media__1781908564912.jpg", "src/assets/psu_front.webp");
processImage("C:/Users/krzyc/.gemini/antigravity-ide/brain/0ad14dac-2af3-4e5c-9e45-1d522b2d6090/media__1781947969110.jpg", "src/assets/psu_back.webp");
processImage("C:/Users/krzyc/.gemini/antigravity-ide/brain/0ad14dac-2af3-4e5c-9e45-1d522b2d6090/media__1781948542376.jpg", "src/assets/aio_fan.webp");
processImage("C:/Users/krzyc/.gemini/antigravity-ide/brain/0ad14dac-2af3-4e5c-9e45-1d522b2d6090/media__1781949699450.png", "src/assets/heatsink.webp");
