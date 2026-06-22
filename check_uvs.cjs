const THREE = require('three');

const shape = new THREE.Shape();
shape.moveTo(-1.9, -2.4);
shape.lineTo(1.9, -2.4);
shape.lineTo(1.9, 2.4);
shape.lineTo(-1.9, 2.4);
shape.lineTo(-1.9, -2.4);

const geo = new THREE.ShapeGeometry(shape);
const uvs = geo.attributes.uv.array;
let minU = Infinity, maxU = -Infinity;
let minV = Infinity, maxV = -Infinity;

for (let i = 0; i < uvs.length; i+=2) {
  if (uvs[i] < minU) minU = uvs[i];
  if (uvs[i] > maxU) maxU = uvs[i];
  if (uvs[i+1] < minV) minV = uvs[i+1];
  if (uvs[i+1] > maxV) maxV = uvs[i+1];
}

console.log(`U: ${minU} to ${maxU}`);
console.log(`V: ${minV} to ${maxV}`);
