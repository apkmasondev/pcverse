import { materials } from '../materials';
import { useTexture, Instances, Instance } from '@react-three/drei';
import moboBackUrl from '../../../assets/mobo_back_photo.webp';
import moboTopUrl from '../../../assets/mobo_top.webp';
import moboChipsetUrl from '../../../assets/mobo_chipset.webp';
import moboIoUrl from '../../../assets/mobo_io.webp';
import cpuSocketUrl from '../../../assets/cpu_socket.webp';
import ssdTopUrl from '../../../assets/ssd_top.webp';
import cmosBatteryUrl from '../../../assets/cmos_battery.webp';
import m2HeatsinkUrl from '../../../assets/m2_heatsink.webp';

export const MotherboardGeometry = ({ rgbColor }: { rgbColor: string }) => {
  const backTexture = useTexture(moboBackUrl);
  const moboTopTexture = useTexture(moboTopUrl);
  const cpuSocketTexture = useTexture(cpuSocketUrl);
  const chipsetTexture = useTexture(moboChipsetUrl);
  const ssdTexture = useTexture(ssdTopUrl);
  const moboIoTexture = useTexture(moboIoUrl);
  const cmosBatteryTexture = useTexture(cmosBatteryUrl);
  const m2HeatsinkTexture = useTexture(m2HeatsinkUrl);

  return (
  <group>
    {/* Main PCB */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[3, 4, 0.06]} />
      <meshStandardMaterial color="#111214" roughness={0.9} />
    </mesh>
    
    {/* Motherboard Top Texture (Photorealistic Base) */}
    <mesh position={[0, 0, 0.031]}>
      <planeGeometry args={[3, 4]} />
      <meshStandardMaterial map={moboTopTexture} roughness={0.5} metalness={0.4} />
    </mesh>
    
    {/* Motherboard Backplate Texture */}
    <mesh position={[0, 0, -0.031]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[3, 4]} />
      <meshStandardMaterial map={backTexture} roughness={0.4} metalness={0.2} />
    </mesh>

    {/* CPU Socket Cover (Grey rectangle to hide the printed socket on texture) */}
    <mesh position={[0, 0.95, 0.04]}>
      <boxGeometry args={[1.3, 1.45, 0.02]} />
      <meshStandardMaterial color="#1f2023" roughness={0.9} />
    </mesh>

    {/* CPU Socket & Mounting Bracket */}
    <mesh position={[0, 0.95, 0.05]}>
      <boxGeometry args={[1.3, 1.45, 0.08]} />
      <meshStandardMaterial color="#222" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.95, 0.095]}>
      <planeGeometry args={[1.3, 1.45]} />
      <meshStandardMaterial map={cpuSocketTexture} metalness={0.8} roughness={0.2} />
    </mesh>

    {/* NVMe M.2 SSD */}
    <group position={[-0.3, 0.1, 0.05]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.22, 0.02]} />
        <primitive object={materials.blackPlastic} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.011]} rotation={[0, 0, -Math.PI / 2]}>
        <planeGeometry args={[0.2, 0.78]} />
        <meshStandardMaterial map={ssdTexture} roughness={0.5} />
      </mesh>
    </group>

    {/* VRM Capacitors (Silver cylinders near CPU) */}
    {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((x, i) => (
      <mesh key={`cap-top-${i}`} position={[x, 1.7, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
        <primitive object={materials.silverMetal} attach="material" />
      </mesh>
    ))}
    <Instances>
      <cylinderGeometry args={[0.04, 0.04, 0.1, 16]} />
      <primitive object={materials.silverMetal} attach="material" />
      {[1.2, 1.0, 0.8, 0.6, 0.4].map((y, i) => (
        <Instance key={`cap-left-${i}`} position={[-0.7, y, 0.1]} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </Instances>

    {/* VRM Heatsinks (Detailed with ribs/fins) */}
    <group position={[-1.2, 1.5, 0.15]}>
      {/* Base */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.5, 0.9, 0.2]} />
        <primitive object={materials.darkMetal} attach="material" />
      </mesh>
      {/* Fins */}
      <Instances>
          <boxGeometry args={[0.5, 0.05, 0.1]} />
          <primitive object={materials.darkMetal} attach="material" />
          {[-0.35, -0.2, -0.05, 0.1, 0.25, 0.4].map((fy, i) => (
            <Instance key={`vrm-left-fin-${i}`} position={[0, fy, 0.1]} />
          ))}
        </Instances>
    </group>
    
    <group position={[0, 1.85, 0.15]} rotation={[0, 0, -Math.PI / 2]}>
      {/* Base */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.5, 1.5, 0.2]} />
        <primitive object={materials.darkMetal} attach="material" />
      </mesh>
      {/* Fins */}
      <Instances>
          <boxGeometry args={[0.5, 0.05, 0.1]} />
          <primitive object={materials.darkMetal} attach="material" />
          {[-0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6].map((fy, i) => (
            <Instance key={`vrm-top-fin-${i}`} position={[0, fy, 0.1]} />
          ))}
        </Instances>
    </group>

    {/* RAM Slots with Clips */}
    {[0.8, 1.0, 1.2, 1.4].map((x, i) => (
      <group key={i} position={[x, 0.85, 0.08]}>
        {/* Base Block */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[0.1, 1.8, 0.11]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#111" : "#2a2a2a"} roughness={0.7} />
        </mesh>
        
        {/* Left/Right Walls to create the groove */}
        <mesh position={[-0.035, 0, 0.05]}>
          <boxGeometry args={[0.03, 1.8, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#111" : "#2a2a2a"} roughness={0.7} />
        </mesh>
        <mesh position={[0.035, 0, 0.05]}>
          <boxGeometry args={[0.03, 1.8, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#111" : "#2a2a2a"} roughness={0.7} />
        </mesh>

        {/* Groove floor (dark) */}
        <mesh position={[0, 0, 0.025]}>
          <boxGeometry args={[0.04, 1.8, 0.01]} />
          <meshStandardMaterial color="#020202" roughness={1} />
        </mesh>

        {/* The RAM Notch (wcięcie / klucz na środku) */}
        <mesh position={[0, -0.15, 0.05]}>
          <boxGeometry args={[0.04, 0.06, 0.05]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#111" : "#2a2a2a"} roughness={0.7} />
        </mesh>
        {/* Top clip */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[0.12, 0.15, 0.12]} />
          <meshStandardMaterial color="#b0b5b9" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Bottom clip */}
        <mesh position={[0, -0.95, 0]}>
          <boxGeometry args={[0.12, 0.15, 0.12]} />
          <meshStandardMaterial color="#b0b5b9" roughness={0.5} metalness={0.8} />
        </mesh>
      </group>
    ))}

    {/* 24-Pin ATX Power Connector */}
    <mesh position={[1.3, 0.5, 0.1]}>
      <boxGeometry args={[0.2, 0.8, 0.2]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
    </mesh>

    {/* 8-Pin EPS Power Connectors */}
    <mesh position={[-1.2, 1.9, 0.1]}>
      <boxGeometry args={[0.4, 0.15, 0.2]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
    </mesh>

    {/* POST Code Display (Diagnostic LED) */}
    <group position={[1.2, 1.8, 0.05]}>
      <mesh>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <primitive object={materials.blackPlastic} attach="material" />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.2, 0.1, 0.01]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
    </group>

    {/* PCIe Slots (Reinforced) */}
    {[-0.4, -1.8].map((y, i) => (
      <group key={`pcie-${i}`} position={[-0.1, y, 0.1]}>
        {/* Base Block */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[2.8, 0.15, 0.08]} />
          <meshStandardMaterial color={i === 0 ? "#b0b5b9" : "#111"} metalness={i === 0 ? 0.8 : 0} roughness={0.5} />
        </mesh>
        
        {/* Top/Bottom Walls to create the groove */}
        <mesh position={[0, 0.055, 0.04]}>
          <boxGeometry args={[2.8, 0.04, 0.04]} />
          <meshStandardMaterial color={i === 0 ? "#b0b5b9" : "#111"} metalness={i === 0 ? 0.8 : 0} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.055, 0.04]}>
          <boxGeometry args={[2.8, 0.04, 0.04]} />
          <meshStandardMaterial color={i === 0 ? "#b0b5b9" : "#111"} metalness={i === 0 ? 0.8 : 0} roughness={0.5} />
        </mesh>

        {/* Groove floor (dark) */}
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[2.8, 0.07, 0.01]} />
          <meshStandardMaterial color="#020202" roughness={1} />
        </mesh>
        
        {/* Inner Groove - Short Segment (Left side) */}
        <mesh position={[-1.2, 0, 0.061]}>
          <boxGeometry args={[0.3, 0.04, 0.01]} />
          <meshStandardMaterial color="#050505" roughness={1} />
        </mesh>

        {/* Inner Groove - Long Segment (Right side) */}
        <mesh position={[0.2, 0, 0.061]}>
          <boxGeometry args={[2.3, 0.04, 0.01]} />
          <meshStandardMaterial color="#050505" roughness={1} />
        </mesh>

        {/* PCIe slot clip */}
        <mesh position={[1.45, 0, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.12]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      </group>
    ))}

    {/* M.2 NVMe Armor / Heatsinks */}
    <group position={[-0.2, -0.4, 0.08]}>
      <mesh>
        <boxGeometry args={[1.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
    <group position={[-0.2, -1.4, 0.08]}>
      <mesh>
        <boxGeometry args={[1.8, 0.3, 0.1]} />
        <meshStandardMaterial color="#111" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Top face with AORUS texture */}
      <mesh position={[0, 0, 0.051]}>
        <planeGeometry args={[1.8, 0.3]} />
        <meshStandardMaterial map={m2HeatsinkTexture} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>

    {/* Bateria CMOS (CR2032) */}
    <group position={[-1.0, -0.9, 0.05]}>
      {/* Battery Holder / Socket */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 32]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      {/* The shiny CR2032 Battery */}
      <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
        <meshStandardMaterial color="#ffffff" map={cmosBatteryTexture} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Metal clip securing the battery */}
      <mesh position={[0, 0.1, 0.04]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.4} />
      </mesh>
    </group>

    {/* Audio Section with RGB Trace */}
    <mesh position={[-1.2, -1.5, 0.04]}>
      <boxGeometry args={[0.4, 0.8, 0.02]} />
      <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
    </mesh>
    <mesh position={[-0.95, -1.5, 0.04]}>
      <boxGeometry args={[0.02, 0.8, 0.01]} />
      <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
    {/* Audio Capacitors (Gold) */}
    {[-1.2, -1.4, -1.6].map((y, i) => (
      <mesh key={`audio-cap-${i}`} position={[-1.2, y, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.12, 16]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.3} />
      </mesh>
    ))}

    {/* SATA Ports */}
    <mesh position={[1.4, -1.5, 0.1]}>
      <boxGeometry args={[0.15, 0.6, 0.15]} />
      <primitive object={materials.blackPlastic} attach="material" />
    </mesh>

    {/* Chipset Heatsink (Massive with RGB Logo) */}
    <group position={[0.8, -1.2, 0.1]}>
      <mesh>
        <boxGeometry args={[1.0, 1.0, 0.15]} />
        <primitive object={materials.darkMetal} attach="material" />
      </mesh>
      {/* Chipset Texture */}
      <mesh position={[0, 0, 0.076]}>
        <planeGeometry args={[1.0, 1.0]} />
        <meshStandardMaterial map={chipsetTexture} roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Sci-fi grooves */}
      <mesh position={[-0.2, 0, 0.08]}>
        <boxGeometry args={[0.1, 1.0, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* RGB Accent */}
      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color={rgbColor} emissive={rgbColor} emissiveIntensity={1} />
      </mesh>
    </group>

    {/* Rear IO Shield Block */}
    <mesh position={[-1.4, 1.2, 0.2]}>
      <boxGeometry args={[0.2, 1.6, 0.45]} />
      <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
    </mesh>

    {/* IO Ports Area (moved from CaseGeometry to stay attached when exploded) */}
    <group position={[0, 0, 1.75]}>
      {/* Motherboard IO Panel Accent (Shifted to X = -1.53 to sit on the outside of the left panel) */}
      <mesh position={[-1.53, 1.2, -1.55]}>
        <boxGeometry args={[0.04, 1.4, 0.65]} />
        <meshStandardMaterial color="#888c94" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Motherboard IO Image Texture Plane */}
      <mesh position={[-1.551, 1.2, -1.55]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.65, 1.4]} />
        <meshStandardMaterial map={moboIoTexture} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Motherboard IO Ports - Professional High-End Layout */}
      {/* BIOS Flashback & Clear CMOS */}
      <mesh position={[-1.55, 1.75, -1.65]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>
      <mesh position={[-1.55, 1.75, -1.45]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.02, 16]} />
        <meshStandardMaterial color="#444" metalness={0.5} />
      </mesh>

      {/* Wi-Fi Antenna Connectors (Gold) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`wifi-${z}`} position={[-1.55, 1.6, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
        </mesh>
      ))}

      {/* USB 2.0 (Black) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`usb2-${z}`} position={[-1.55, 1.45, z]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <meshStandardMaterial color="#111" roughness={0.9} />
        </mesh>
      ))}

      {/* USB 3.2 Gen 1 (Blue) */}
      {[-1.65, -1.45].map(z => (
        <mesh key={`usb3-${z}`} position={[-1.55, 1.3, z]}>
          <boxGeometry args={[0.02, 0.04, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
        </mesh>
      ))}

      {/* 2.5G Ethernet & USB 3.2 Gen 2 (Red) */}
      <mesh position={[-1.55, 1.15, -1.65]}>
        <boxGeometry args={[0.02, 0.08, 0.12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.6} />
      </mesh>
      <mesh position={[-1.55, 1.15, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* USB-C & USB 3.2 Gen 2 (Red) */}
      <mesh position={[-1.55, 1.0, -1.65]}>
        <boxGeometry args={[0.02, 0.025, 0.08]} />
        <meshStandardMaterial color="#111" roughness={0.7} />
      </mesh>
      <mesh position={[-1.55, 1.0, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.1]} />
        <meshStandardMaterial color="#991b1b" roughness={0.6} />
      </mesh>

      {/* High-End Audio Stack (Gold Plated) */}
      {[-1.65, -1.55, -1.45].map((z, i) => (
        <mesh key={`audio-top-${i}`} position={[-1.55, 0.85, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {[-1.65, -1.55].map((z, i) => (
        <mesh key={`audio-bot-${i}`} position={[-1.55, 0.75, z]} rotation={[0, 0, Math.PI/2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
      {/* SPDIF Optical out */}
      <mesh position={[-1.55, 0.75, -1.45]}>
        <boxGeometry args={[0.02, 0.04, 0.04]} />
        <meshStandardMaterial color="#111" />
      </mesh>
    </group>
  </group>
  );
};

