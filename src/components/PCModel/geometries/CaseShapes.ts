import * as THREE from 'three';

export const leftPanelShape = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(-1.95, -2.3);
  shape.lineTo(1.945, -2.3);
  shape.lineTo(1.945, 2.4);
  shape.lineTo(-1.95, 2.4);
  shape.lineTo(-1.95, -2.3);

  // Motherboard IO Cutout
  const ioHole = new THREE.Path();
  ioHole.moveTo(-1.55 - 0.35, 1.2 - 0.725);
  ioHole.lineTo(-1.55 + 0.35, 1.2 - 0.725);
  ioHole.lineTo(-1.55 + 0.35, 1.2 + 0.725);
  ioHole.lineTo(-1.55 - 0.35, 1.2 + 0.725);
  ioHole.lineTo(-1.55 - 0.35, 1.2 - 0.725);
  shape.holes.push(ioHole);

  // PSU Cutout
  const psuHole = new THREE.Path();
  psuHole.moveTo(-0.8 - 0.9, -2.3);
  psuHole.lineTo(-0.8 + 0.9, -2.3);
  psuHole.lineTo(-0.8 + 0.9, -1.92 + 0.5);
  psuHole.lineTo(-0.8 - 0.9, -1.92 + 0.5);
  psuHole.lineTo(-0.8 - 0.9, -2.3);
  shape.holes.push(psuHole);

  // GPU PCIe Brackets Cutout
  const pcieHole = new THREE.Path();
  pcieHole.moveTo(-1.15 - 0.6, -0.1 - 0.85); // Extended downwards
  pcieHole.lineTo(-1.15 + 0.6, -0.1 - 0.85); // Extended downwards
  pcieHole.lineTo(-1.15 + 0.6, -0.1 + 0.25);
  pcieHole.lineTo(-1.15 - 0.6, -0.1 + 0.25);
  pcieHole.lineTo(-1.15 - 0.6, -0.1 - 0.85); // Extended downwards
  shape.holes.push(pcieHole);

  // Side Exhaust Fans Hole (covers both fans)
  const fanHole = new THREE.Path();
  fanHole.moveTo(-1.0, 1.4 - 0.6);
  fanHole.lineTo(1.4, 1.4 - 0.6);
  fanHole.lineTo(1.4, 1.4 + 0.6);
  fanHole.lineTo(-1.0, 1.4 + 0.6);
  fanHole.lineTo(-1.0, 1.4 - 0.6);
  shape.holes.push(fanHole);

  return shape;
})();

export const backPanelShape = (() => {
  const shape = new THREE.Shape();
  // Outer boundary (Counter-clockwise)
  shape.moveTo(-1.97, -2.3);
  shape.lineTo(1.97, -2.3);
  shape.lineTo(1.97, 2.4);
  shape.lineTo(-1.97, 2.4);
  shape.lineTo(-1.97, -2.3);

  const addHole = (x1: number, y1: number, x2: number, y2: number) => {
    const hole = new THREE.Path();
    hole.moveTo(x1, y1);
    hole.lineTo(x1, y2);
    hole.lineTo(x2, y2);
    hole.lineTo(x2, y1);
    hole.lineTo(x1, y1);
    shape.holes.push(hole);
  };

  // CPU Backplate Mesh Cutout
  addHole(-1.15, 0.30, 0.25, 1.70);
  // PSU Cutout (Back panel)
  addHole(-0.73, -2.3, 0.73, -1.52);
  return shape;
})();

export const moboTrayShape = (() => {
  const shape = new THREE.Shape();
  shape.moveTo(-1.97, -2.3);
  shape.lineTo(1.97, -2.3);
  shape.lineTo(1.97, 2.4);
  shape.lineTo(-1.97, 2.4);
  shape.lineTo(-1.97, -2.3);

  const addHole = (x1: number, y1: number, x2: number, y2: number) => {
    const hole = new THREE.Path();
    hole.moveTo(x1, y1);
    hole.lineTo(x1, y2);
    hole.lineTo(x2, y2);
    hole.lineTo(x2, y1);
    hole.lineTo(x1, y1);
    shape.holes.push(hole);
  };

  // Real hole for CPU Cooler Backplate
  addHole(-1.15, 0.30, 0.25, 1.70);

  // Real hole for PSU Back panel (allows transparency from inside)
  addHole(-0.73, -2.3, 0.73, -1.52);

  // Real holes for side cable routing
  addHole(1.25, -1.3, 1.55, -0.7);
  addHole(1.25, -0.3, 1.55, 0.3);
  addHole(1.25, 0.7, 1.55, 1.3);

  // Real holes for top/bottom routing
  addHole(-1.1, 2.0, -0.5, 2.2);
  addHole(0.2, 2.0, 0.8, 2.2);

  return shape;
})();

export const frontPanelShape = (() => {
  const shape = new THREE.Shape();
  // Front Glass bounds
  shape.moveTo(-1.95, -2.42);
  shape.lineTo(1.95, -2.42);
  shape.lineTo(1.95, 2.42);
  shape.lineTo(-1.95, 2.42);
  shape.lineTo(-1.95, -2.42);

  // Pill-shaped Hole for Fans (Clockwise path)
  const hole = new THREE.Path();
  const x = 0.8;
  const y1 = -0.8;
  const y2 = 0.8;
  const radius = 0.62;

  hole.moveTo(x - radius, y2);
  hole.absarc(x, y2, radius, Math.PI, 0, true); // Top semicircle (CW)
  hole.lineTo(x + radius, y1);
  hole.absarc(x, y1, radius, Math.PI * 2, Math.PI, true); // Bottom semicircle (CW)
  hole.lineTo(x - radius, y2);
  shape.holes.push(hole);

  return shape;
})();

export const frontFrameShape = (() => {
  const shape = new THREE.Shape();
  const x = 0.8;
  const y1 = -0.8;
  const y2 = 0.8;
  const outerRadius = 0.65;
  const innerRadius = 0.59;

  // Outer edge (Counter-clockwise path)
  shape.moveTo(x - outerRadius, y1);
  shape.absarc(x, y1, outerRadius, Math.PI, Math.PI * 2, false); // Bottom semicircle (CCW)
  shape.lineTo(x + outerRadius, y2);
  shape.absarc(x, y2, outerRadius, 0, Math.PI, false); // Top semicircle (CCW)
  shape.lineTo(x - outerRadius, y1);

  // Inner hole (Clockwise path)
  const hole = new THREE.Path();
  hole.moveTo(x - innerRadius, y2);
  hole.absarc(x, y2, innerRadius, Math.PI, 0, true); // Top semicircle (CW)
  hole.lineTo(x + innerRadius, y1);
  hole.absarc(x, y1, innerRadius, Math.PI * 2, Math.PI, true); // Bottom semicircle (CW)
  hole.lineTo(x - innerRadius, y2);
  shape.holes.push(hole);

  return shape;
})();

export const frontMeshShape = (() => {
  const shape = new THREE.Shape();
  const x = 0.8;
  const y1 = -0.8;
  const y2 = 0.8;
  const radius = 0.6;

  // Outer edge (Counter-clockwise path)
  shape.moveTo(x - radius, y1);
  shape.absarc(x, y1, radius, Math.PI, Math.PI * 2, false); // Bottom semicircle (CCW)
  shape.lineTo(x + radius, y2);
  shape.absarc(x, y2, radius, 0, Math.PI, false); // Top semicircle (CCW)
  shape.lineTo(x - radius, y1);

  return shape;
})();

export const topFrameShape = (() => {
  const shape = new THREE.Shape();
  // Outer border 4.0 x 4.0
  shape.moveTo(-2.0, -2.0);
  shape.lineTo(2.0, -2.0);
  shape.lineTo(2.0, 2.0);
  shape.lineTo(-2.0, 2.0);
  shape.lineTo(-2.0, -2.0);

  // Hole for the mesh (0.2 width on each side)
  const hole = new THREE.Path();
  hole.moveTo(-1.8, -1.8);
  hole.lineTo(-1.8, 1.8);
  hole.lineTo(1.8, 1.8);
  hole.lineTo(1.8, -1.8);
  hole.lineTo(-1.8, -1.8);
  shape.holes.push(hole);

  return shape;
})();

export const bottomPanelShape = (() => {
  const shape = new THREE.Shape();
  // Local Y maps to -Z. Size 3.8 x 3.8.
  shape.moveTo(-1.97, -1.97);
  shape.lineTo(1.97, -1.97);
  shape.lineTo(1.97, 1.97);
  shape.lineTo(-1.97, 1.97);
  shape.lineTo(-1.97, -1.97);

  const addHole = (x1: number, y1: number, x2: number, y2: number) => {
    const hole = new THREE.Path();
    hole.moveTo(x1, y1);
    hole.lineTo(x1, y2);
    hole.lineTo(x2, y2);
    hole.lineTo(x2, y1);
    hole.lineTo(x1, y1);
    shape.holes.push(hole);
  };

  // PSU Bottom Ventilation Hole (centered at X=-1.2, local Y=0.8, size 1.4x1.4)
  addHole(-1.90, 0.1, -0.5, 1.5);

  return shape;
})();
