import sharp from "sharp";
async function processImage(fileIn, fileOut) {
  try {
    const info = await sharp(fileIn).webp({ quality: 80 }).toFile(fileOut);
    console.log(fileOut + ": " + info.width + "x" + info.height);
  } catch (e) {
    console.error("Error processing " + fileIn + ": " + e);
  }
}
processImage("C:/Users/krzyc/.gemini/antigravity-ide/brain/0ad14dac-2af3-4e5c-9e45-1d522b2d6090/media__1781907923829.png", "src/assets/gpu_io.webp");
