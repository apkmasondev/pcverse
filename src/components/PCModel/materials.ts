import { MeshStandardMaterial, MeshPhysicalMaterial, MeshBasicMaterial } from 'three';

export const materials = {
  // Existing materials
  darkMetal: new MeshStandardMaterial({ color: '#151515', roughness: 0.6 }),
  goldMetal: new MeshStandardMaterial({ color: '#d4af37', metalness: 1, roughness: 0.3 }),
  blackPlastic: new MeshStandardMaterial({ color: '#0a0a0a', roughness: 0.9 }),
  chromeMetal: new MeshStandardMaterial({ color: '#b0b5b9', metalness: 0.8, roughness: 0.3 }),
  silverMetal: new MeshStandardMaterial({ color: 'silver', metalness: 0.9, roughness: 0.2 }),
  caseFrame: new MeshStandardMaterial({ color: '#2a2c30', metalness: 0.9, roughness: 0.2 }),
  grayMetal: new MeshStandardMaterial({ color: '#4a4d54', metalness: 0.85, roughness: 0.3 }),
  darkGrayMetal: new MeshStandardMaterial({ color: '#3a3d42', metalness: 0.8, roughness: 0.3 }),
  copper: new MeshStandardMaterial({ color: '#b87333', metalness: 0.8, roughness: 0.4 }),
  pcbGreen: new MeshStandardMaterial({ color: '#003300', roughness: 0.8 }),
  pcbBlack: new MeshStandardMaterial({ color: '#111111', roughness: 0.6 }),

  // Newly extracted materials (N8)
  darkGrayPlastic: new MeshStandardMaterial({ color: '#111214', roughness: 0.9 }),
  mediumGrayPlastic: new MeshStandardMaterial({ color: '#1f2023', roughness: 0.9 }),
  darkCharcoal: new MeshStandardMaterial({ color: '#222222', roughness: 0.8 }),
  deepBlack: new MeshStandardMaterial({ color: '#020202', roughness: 1 }),
  redLED: new MeshStandardMaterial({ color: '#ff0000', emissive: '#ff0000', emissiveIntensity: 2 }),
  darkShinyMetal: new MeshStandardMaterial({ color: '#111111', metalness: 0.7, roughness: 0.3 }),
  veryDarkGray: new MeshStandardMaterial({ color: '#0f0f0f', roughness: 0.9 }),
  steelMetal: new MeshStandardMaterial({ color: '#888c94', metalness: 0.8, roughness: 0.3 }),
  midGrayMetal: new MeshStandardMaterial({ color: '#444444', metalness: 0.5 }),
  bluePlastic: new MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.6 }),
  slateMetal: new MeshStandardMaterial({ color: '#1f2937', metalness: 0.6 }),
  darkRedPlastic: new MeshStandardMaterial({ color: '#991b1b', roughness: 0.6 }),
  roughDarkMetal: new MeshStandardMaterial({ color: '#2a2a2a', metalness: 0.6, roughness: 0.8 }),
  almostBlack: new MeshStandardMaterial({ color: '#050505', roughness: 0.8 }),
  lightSilver: new MeshStandardMaterial({ color: '#e5e7eb', metalness: 0.9, roughness: 0.3 }),
  ioShieldMetal: new MeshStandardMaterial({ color: '#e5e7eb', metalness: 0.9, roughness: 0.3 }),
  redCable: new MeshStandardMaterial({ color: '#e94560', roughness: 0.7 }),
  blackCable: new MeshStandardMaterial({ color: '#111', roughness: 0.7 }),
  
  // N9 Stage 4 Extracted
  cpuDarkCharcoal: new MeshStandardMaterial({ color: '#2a1f1a', roughness: 0.9 }),
  cpuSilverMetal: new MeshStandardMaterial({ color: '#a0a4a8', metalness: 0.9, roughness: 0.4 }),
  gpuDarkPlastic: new MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.4 }),
};

export const xrayMaterial = new MeshStandardMaterial({
  color: 0x111111,
  emissive: 0x00ffff,
  emissiveIntensity: 0.5,
  wireframe: true,
  transparent: true,
  opacity: 0.3
});

export const ghostMaterial = new MeshPhysicalMaterial({
  color: 0xffaa00, // Złoty (Premium Gold)
  emissive: 0xffaa00,
  emissiveIntensity: 0.5, // Delikatna emisja, nie wypalająca oczu
  transparent: true,
  opacity: 0.9,
  transmission: 0.8, // Szkło
  roughness: 0.4, // Zmatowione/Oszronione
  metalness: 0.2,
  depthWrite: false,
  depthTest: true,
  side: 2, // THREE.DoubleSide
  blending: 2, // THREE.AdditiveBlending
});

export const hitboxMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  colorWrite: false
});

export const blackBasicMaterial = new MeshBasicMaterial({ color: '#000000' });
