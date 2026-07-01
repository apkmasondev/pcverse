import { MathUtils, MeshStandardMaterial } from 'three';

import { useMemo, useEffect } from 'react';

import { materials } from '../materials';
import { useTexture, Instance } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import moboBackUrl from '../../../assets/mobo_back_photo.webp';
import moboTopUrl from '../../../assets/mobo_top.webp';
import moboChipsetUrl from '../../../assets/mobo_chipset.webp';
import moboIoUrl from '../../../assets/mobo_io.webp';
import cpuSocketUrl from '../../../assets/cpu_socket.webp';
import ssdTopUrl from '../../../assets/ssd_top.webp';
import cmosBatteryUrl from '../../../assets/cmos_battery.webp';
import m2HeatsinkUrl from '../../../assets/m2_heatsink.webp';

import { XMesh as Mesh, XInstances } from './XMesh';

export const MotherboardGeometry = ({ rgbColor, rgbEnabled }: { rgbColor: string, rgbEnabled?: boolean }) => {
  const backTexture = useTexture(moboBackUrl);
  const moboTopTexture = useTexture(moboTopUrl);
  const cpuSocketTexture = useTexture(cpuSocketUrl);
  const chipsetTexture = useTexture(moboChipsetUrl);
  const ssdTexture = useTexture(ssdTopUrl);
  const moboIoTexture = useTexture(moboIoUrl);
  const cmosBatteryTexture = useTexture(cmosBatteryUrl);
  const m2HeatsinkTexture = useTexture(m2HeatsinkUrl);

  const rgbMaterial = useMemo(() => {
    return new MeshStandardMaterial({ color: 0x000000, emissiveIntensity: 0, toneMapped: false });
  }, []);

  useEffect(() => {
    rgbMaterial.emissive.set(rgbColor);
  }, [rgbColor, rgbMaterial]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    rgbMaterial.emissiveIntensity = MathUtils.lerp(rgbMaterial.emissiveIntensity, rgbEnabled ? 3.0 : 0, dt * 5);
  });

  useEffect(() => {
    return () => {
      rgbMaterial.dispose();
    };
  }, [rgbMaterial]);

  const texturedMaterials = useMemo(() => ({
    texMat0: new MeshStandardMaterial({ map: moboTopTexture, roughness: 0.5, metalness: 0.4, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    texMat1: new MeshStandardMaterial({ map: backTexture, roughness: 0.4, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
    texMat2: new MeshStandardMaterial({ map: cpuSocketTexture, metalness: 0.8, roughness: 0.2 }),
    texMat3: new MeshStandardMaterial({ map: ssdTexture, roughness: 0.5 }),
    texMat4: new MeshStandardMaterial({ map: m2HeatsinkTexture, roughness: 0.4, metalness: 0.6 }),
    texMat5: new MeshStandardMaterial({ map: cmosBatteryTexture, metalness: 0.7, roughness: 0.3, color: "#ffffff" }),
    texMat6: new MeshStandardMaterial({ map: chipsetTexture, roughness: 0.3, metalness: 0.6 }),
    texMat7: new MeshStandardMaterial({ map: moboIoTexture, roughness: 0.6, metalness: 0.4, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 })
  }), [backTexture, chipsetTexture, cmosBatteryTexture, cpuSocketTexture, m2HeatsinkTexture, moboIoTexture, moboTopTexture, ssdTexture]);

  useEffect(() => {
    return () => {
      Object.values(texturedMaterials).forEach(mat => mat.dispose());
    };
  }, [texturedMaterials]);

  return (
    <group>
      {/* Main PCB */}
      <Mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 4, 0.06]} />
        <primitive object={materials.darkGrayPlastic} attach="material" />
      </Mesh>

      {/* Motherboard Top Texture (Photorealistic Base) */}
      <Mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[3, 4]} />
        <primitive object={texturedMaterials.texMat0} />
      </Mesh>

      {/* Motherboard Backplate Texture */}
      <Mesh position={[0, 0, -0.031]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3, 4]} />
        <primitive object={texturedMaterials.texMat1} />
      </Mesh>

      {/* CPU Socket Cover (Grey rectangle to hide the printed socket on texture) */}
      <Mesh position={[0, 0.95, 0.04]}>
        <boxGeometry args={[1.3, 1.45, 0.02]} />
        <primitive object={materials.mediumGrayPlastic} attach="material" />
      </Mesh>

      {/* CPU Socket & Mounting Bracket */}
      <Mesh position={[0, 0.95, 0.05]}>
        <boxGeometry args={[1.3, 1.45, 0.08]} />
        <primitive object={materials.darkCharcoal} attach="material" />
      </Mesh>
      <Mesh position={[0, 0.95, 0.095]}>
        <planeGeometry args={[1.3, 1.45]} />
        <primitive object={texturedMaterials.texMat2} />
      </Mesh>


      {/* VRM Capacitors (Silver cylinders near CPU) */}
      <XInstances>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <primitive object={materials.silverMetal} attach="material" />
        {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x, i) => (
          <Instance key={`cap-top-${i}`} position={[x, 1.6, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
        {[1.18, 0.98, 0.77, 0.56, 0.35].map((y, i) => (
          <Instance key={`cap-left-${i}`} position={[-0.7, y, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </XInstances>

      {/* VRM Heatsinks (Detailed with ribs/fins) */}
      <XInstances>
        <boxGeometry args={[0.5, 0.05, 0.1]} />
        <primitive object={materials.darkMetal} attach="material" />

        {/* Left Fins */}
        {[-0.35, -0.2, -0.05, 0.1, 0.25, 0.4].map((fy, i) => (
          <Instance key={`vrm-left-fin-${i}`} position={[-1.2, 1.5 + fy, 0.25]} />
        ))}

        {/* Top Fins */}
        {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((fy, i) => (
          <Instance key={`vrm-top-fin-${i}`} position={[fy, 1.85, 0.25]} rotation={[0, 0, -Math.PI / 2]} />
        ))}
      </XInstances>

      <group position={[-1.2, 1.5, 0.15]}>
        {/* Base */}
        <Mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[0.5, 0.9, 0.2]} />
          <primitive object={materials.darkMetal} attach="material" />
        </Mesh>
      </group>

      <group position={[0, 1.85, 0.15]} rotation={[0, 0, -Math.PI / 2]}>
        {/* Base */}
        <Mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[0.5, 1.5, 0.2]} />
          <primitive object={materials.darkMetal} attach="material" />
        </Mesh>
      </group>

      {/* RAM Slots with Clips */}
      {[0.8, 0.94, 1.08, 1.22].map((x, i) => (
        <group key={i} position={[x, 0.85, 0.08]}>
          {/* Base Block */}
          <Mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[0.1, 1.8, 0.11]} />
            {i % 2 === 0 ? <primitive object={materials.pcbBlack} attach="material" /> : <primitive object={materials.roughDarkMetal} attach="material" />}
          </Mesh>

          {/* Left/Right Walls to create the groove */}
          <Mesh position={[-0.035, 0, 0.05]}>
            <boxGeometry args={[0.03, 1.8, 0.05]} />
            {i % 2 === 0 ? <primitive object={materials.pcbBlack} attach="material" /> : <primitive object={materials.roughDarkMetal} attach="material" />}
          </Mesh>
          <Mesh position={[0.035, 0, 0.05]}>
            <boxGeometry args={[0.03, 1.8, 0.05]} />
            {i % 2 === 0 ? <primitive object={materials.pcbBlack} attach="material" /> : <primitive object={materials.roughDarkMetal} attach="material" />}
          </Mesh>

          {/* Groove floor (dark) */}
          <Mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[0.038, 1.78, 0.01]} />
            <primitive object={materials.deepBlack} attach="material" />
          </Mesh>

          {/* Złote styki wewnątrz slotu (Górna część) */}
          <Mesh position={[0, 0.39, 0.04]}>
            <boxGeometry args={[0.035, 1.02, 0.02]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>
          {/* Złote styki wewnątrz slotu (Dolna część) */}
          <Mesh position={[0, -0.54, 0.04]}>
            <boxGeometry args={[0.035, 0.72, 0.02]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>

          {/* The RAM Notch (wcięcie / klucz na środku) */}
          <Mesh position={[0, -0.15, 0.05]}>
            <boxGeometry args={[0.04, 0.06, 0.05]} />
            {i % 2 === 0 ? <primitive object={materials.pcbBlack} attach="material" /> : <primitive object={materials.roughDarkMetal} attach="material" />}
          </Mesh>
          {/* Top clip */}
          <Mesh position={[0, 0.95, 0]}>
            <boxGeometry args={[0.12, 0.15, 0.12]} />
            <primitive object={materials.chromeMetal} attach="material" />
          </Mesh>
          {/* Bottom clip */}
          <Mesh position={[0, -0.95, 0]}>
            <boxGeometry args={[0.12, 0.15, 0.12]} />
            <primitive object={materials.chromeMetal} attach="material" />
          </Mesh>
        </group>
      ))}

      {/* 24-Pin ATX Power Connector (Removed) */}

      {/* 8-Pin EPS Power Connectors (Removed due to Z-fighting and lack of visibility) */}

      {/* POST Code Display (Diagnostic LED) */}
      <group position={[1.37, 1.40, 0.05]}>
        <Mesh>
          <boxGeometry args={[0.15, 0.25, 0.1]} />
          <primitive object={materials.blackPlastic} attach="material" />
        </Mesh>
        <Mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[0.1, 0.18, 0.01]} />
          <primitive object={materials.redLED} attach="material" />
        </Mesh>
      </group>

      {/* PCIe Slots (Reinforced) */}
      {[-0.4, -1.8].map((y, i) => (
        <group key={`pcie-${i}`} position={[-0.05, y, 0.1]}>
          {/* Base Block */}
          <Mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[2.8, 0.15, 0.08]} />
            {i === 0 ? <primitive object={materials.chromeMetal} attach="material" /> : <primitive object={materials.pcbBlack} attach="material" />}
          </Mesh>

          {/* Top/Bottom Walls to create the groove */}
          <Mesh position={[0, 0.055, 0.04]}>
            <boxGeometry args={[2.8, 0.04, 0.04]} />
            {i === 0 ? <primitive object={materials.chromeMetal} attach="material" /> : <primitive object={materials.pcbBlack} attach="material" />}
          </Mesh>
          <Mesh position={[0, -0.055, 0.04]}>
            <boxGeometry args={[2.8, 0.04, 0.04]} />
            {i === 0 ? <primitive object={materials.chromeMetal} attach="material" /> : <primitive object={materials.pcbBlack} attach="material" />}
          </Mesh>

          {/* Groove floor (dark) */}
          <Mesh position={[0, 0, 0.025]}>
            <boxGeometry args={[2.78, 0.068, 0.01]} />
            <primitive object={materials.deepBlack} attach="material" />
          </Mesh>

          {/* Main PCIe Slot Body */}
          <Mesh position={[0.06, 0, 0]}>
            <boxGeometry args={[2.9, 0.14, 0.08]} />
            <primitive object={materials.blackPlastic} attach="material" />
          </Mesh>

          {/* PCIe slot Notch / Key Divider */}
          <Mesh position={[-1.0, 0, 0.04]}>
            <boxGeometry args={[0.06, 0.07, 0.04]} />
            <primitive object={materials.blackPlastic} attach="material" />
          </Mesh>

          {/* Gold Pins - Short Segment */}
          <Mesh position={[-1.19, 0, 0.04]}>
            <boxGeometry args={[0.3, 0.02, 0.01]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>

          {/* Gold Pins - Long Segment */}
          <Mesh position={[0.19, 0, 0.04]}>
            <boxGeometry args={[2.3, 0.02, 0.01]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>

          {/* PCIe slot clip */}
          <Mesh position={[1.45, 0, 0]}>
            <boxGeometry args={[0.1, 0.15, 0.12]} />
            <primitive object={materials.blackPlastic} attach="material" />
          </Mesh>
        </group>
      ))}

      {/* M.2 NVMe Armor / Heatsinks */}
      <group position={[-0.2, -1.4, 0.08]}>
        <Mesh>
          <boxGeometry args={[1.8, 0.3, 0.1]} />
          <primitive object={materials.darkShinyMetal} attach="material" />
        </Mesh>
        {/* Top face with AORUS texture */}
        <Mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[1.8, 0.3]} />
          <primitive object={texturedMaterials.texMat4} />
        </Mesh>
      </group>

      {/* Bateria CMOS (CR2032) */}
      <group position={[-1.0, -0.9, 0.05]}>
        {/* Battery Holder / Socket */}
        <Mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 32]} />
          <primitive object={materials.veryDarkGray} attach="material" />
        </Mesh>
        {/* The shiny CR2032 Battery */}
        <Mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
          <primitive object={texturedMaterials.texMat5} />
        </Mesh>
        {/* Metal clip securing the battery */}
        <Mesh position={[0, 0.1, 0.04]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <primitive object={materials.goldMetal} attach="material" />
        </Mesh>
      </group>

      {/* Audio Section with RGB Trace */}
      <Mesh position={[-1.2, -1.5, 0.04]}>
        <boxGeometry args={[0.4, 0.8, 0.02]} />
        <primitive object={materials.veryDarkGray} attach="material" />
      </Mesh>
      <Mesh position={[-0.95, -1.5, 0.04]}>
        <boxGeometry args={[0.02, 0.8, 0.01]} />
        <primitive object={rgbMaterial} attach="material" />
      </Mesh>
      {/* Audio Capacitors (Gold) */}
      {[-1.2, -1.4, -1.6].map((y, i) => (
        <Mesh key={`audio-cap-${i}`} position={[-1.2, y, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
          <primitive object={materials.goldMetal} attach="material" />
        </Mesh>
      ))}

      {/* SATA Ports */}
      <Mesh position={[1.4, -1.5, 0.1]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <primitive object={materials.blackPlastic} attach="material" />
      </Mesh>

      {/* Chipset Heatsink (Massive with RGB Logo) */}
      <group position={[0.8, -1.2, 0.1]}>
        <Mesh>
          <boxGeometry args={[1.0, 1.0, 0.15]} />
          <primitive object={materials.darkMetal} attach="material" />
        </Mesh>
        {/* Chipset Texture */}
        <Mesh position={[0, 0, 0.076]}>
          <planeGeometry args={[1.0, 1.0]} />
          <primitive object={texturedMaterials.texMat6} />
        </Mesh>
        {/* Sci-fi grooves */}
        <Mesh position={[-0.2, 0, 0.08]}>
          <boxGeometry args={[0.1, 1.0, 0.02]} />
          <primitive object={materials.blackPlastic} attach="material" />
        </Mesh>
        {/* RGB Accent - Hollow Square Outline */}
        <group position={[0, 0, 0.091]}>
          {/* Top */}
          <Mesh position={[0, 0.36, 0]}>
            <planeGeometry args={[0.8, 0.08]} />
            <primitive object={rgbMaterial} attach="material" />
          </Mesh>
          {/* Bottom */}
          <Mesh position={[0, -0.36, 0]}>
            <planeGeometry args={[0.8, 0.08]} />
            <primitive object={rgbMaterial} attach="material" />
          </Mesh>
          {/* Left */}
          <Mesh position={[-0.36, 0, 0]}>
            <planeGeometry args={[0.08, 0.64]} />
            <primitive object={rgbMaterial} attach="material" />
          </Mesh>
          {/* Right */}
          <Mesh position={[0.36, 0, 0]}>
            <planeGeometry args={[0.08, 0.64]} />
            <primitive object={rgbMaterial} attach="material" />
          </Mesh>
        </group>
      </group>

      {/* Rear IO Shield Block */}
      <Mesh position={[-1.4, 1.2, 0.255]}>
        <boxGeometry args={[0.2, 1.6, 0.45]} />
        <primitive object={materials.darkShinyMetal} attach="material" />
      </Mesh>

      {/* IO Ports Area (moved from CaseGeometry to stay attached when exploded) */}
      <group position={[0, 0, 1.75]}>
        {/* Motherboard IO Panel Accent (Shifted to X = -1.53 to sit on the outside of the left panel) */}
        <Mesh position={[-1.53, 1.2, -1.55]}>
          <boxGeometry args={[0.04, 1.4, 0.65]} />
          <primitive object={materials.steelMetal} attach="material" />
        </Mesh>
        {/* Motherboard IO Image Texture Plane */}
        <Mesh position={[-1.551, 1.2, -1.55]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.65, 1.4]} />
          <primitive object={texturedMaterials.texMat7} />
        </Mesh>
        {/* Motherboard IO Ports - Professional High-End Layout */}
        {/* BIOS Flashback & Clear CMOS */}
        <Mesh position={[-1.55, 1.75, -1.65]}>
          <boxGeometry args={[0.02, 0.06, 0.06]} />
          <primitive object={materials.veryDarkGray} attach="material" />
        </Mesh>
        <Mesh position={[-1.55, 1.75, -1.45]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
          <primitive object={materials.midGrayMetal} attach="material" />
        </Mesh>

        {/* Wi-Fi Antenna Connectors (Gold) */}
        {[-1.65, -1.45].map(z => (
          <Mesh key={`wifi-${z}`} position={[-1.55, 1.6, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>
        ))}

        {/* USB 2.0 (Black) */}
        {[-1.65, -1.45].map(z => (
          <Mesh key={`usb2-${z}`} position={[-1.55, 1.45, z]}>
            <boxGeometry args={[0.02, 0.04, 0.1]} />
            <primitive object={materials.veryDarkGray} attach="material" />
          </Mesh>
        ))}

        {/* USB 3.2 Gen 1 (Blue) */}
        {[-1.65, -1.45].map(z => (
          <Mesh key={`usb3-${z}`} position={[-1.55, 1.3, z]}>
            <boxGeometry args={[0.02, 0.04, 0.1]} />
            <primitive object={materials.bluePlastic} attach="material" />
          </Mesh>
        ))}

        {/* 2.5G Ethernet & USB 3.2 Gen 2 (Red) */}
        <Mesh position={[-1.55, 1.15, -1.65]}>
          <boxGeometry args={[0.02, 0.08, 0.12]} />
          <primitive object={materials.slateMetal} attach="material" />
        </Mesh>
        <Mesh position={[-1.55, 1.15, -1.45]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <primitive object={materials.darkRedPlastic} attach="material" />
        </Mesh>

        {/* USB-C & USB 3.2 Gen 2 (Red) */}
        <Mesh position={[-1.55, 1.0, -1.65]}>
          <boxGeometry args={[0.02, 0.025, 0.08]} />
          <primitive object={materials.darkCharcoal} attach="material" />
        </Mesh>
        <Mesh position={[-1.55, 1.0, -1.45]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <primitive object={materials.darkRedPlastic} attach="material" />
        </Mesh>

        {/* High-End Audio Stack (Gold Plated) */}
        {[-1.65, -1.55, -1.45].map((z, i) => (
          <Mesh key={`audio-top-${i}`} position={[-1.55, 0.85, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>
        ))}
        {[-1.65, -1.55].map((z, i) => (
          <Mesh key={`audio-bot-${i}`} position={[-1.55, 0.75, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
            <primitive object={materials.goldMetal} attach="material" />
          </Mesh>
        ))}
        {/* SPDIF Optical out */}
        <Mesh position={[-1.55, 0.75, -1.45]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <primitive object={materials.pcbBlack} attach="material" />
        </Mesh>
      </group>
    </group>
  );
};

