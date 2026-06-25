import { MeshStandardMaterial } from 'three';
export const extrudeOpts01 = { depth: 0.1, bevelEnabled: false };
export const extrudeOpts005 = { depth: 0.05, bevelEnabled: false };
export const extrudeOptsIhs = { depth: 0.015, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005, bevelSegments: 2 };


export const caseFrameMaterial = new MeshStandardMaterial({ color: '#1a1c20', roughness: 0.3, metalness: 0.8 });
