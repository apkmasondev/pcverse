import sizeOf from 'image-size';
const dims = sizeOf('src/assets/case_interior.webp');
console.log('Width: ' + dims.width + ', Height: ' + dims.height);
