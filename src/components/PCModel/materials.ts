import { MeshStandardMaterial } from 'three';

export const materials = {
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
};
