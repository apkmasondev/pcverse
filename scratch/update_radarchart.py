import sys

content = """import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface RadarStats {
  performance: number;
  thermals: number;
  acoustics: number;
  power: number;
  value: number;
}

interface RadarChartProps {
  stats?: RadarStats;
  color: string;
}

const AXIS_LABELS = ['Wydajność', 'Termika', 'Głośność', 'Pobór Mocy', 'Opłacalność'];
const NUM_AXES = 5;
const RADIUS = 85; 
const CENTER_X = 150;
const CENTER_Y = 120;

const getPointCoordinates = (value: number, angle: number) => {
  const r = (value / 100) * RADIUS;
  const x = CENTER_X + r * Math.sin(angle);
  const y = CENTER_Y - r * Math.cos(angle);
  return { x, y, str: `${x},${y}` };
};

export const RadarChart: React.FC<RadarChartProps> = ({ stats, color }) => {
  if (!stats) return null;

  const angles = useMemo(() => {
    return Array.from({ length: NUM_AXES }).map((_, i) => (Math.PI * 2 * i) / NUM_AXES);
  }, []);

  const statsArray = [
    stats.performance,
    stats.thermals,
    stats.acoustics,
    stats.power,
    stats.value,
  ];

  const pointsData = useMemo(() => {
    return statsArray.map((val, i) => getPointCoordinates(val, angles[i]));
  }, [statsArray, angles]);

  const pathData = useMemo(() => {
    return `M ${pointsData.map(p => p.str).join(' L ')} Z`;
  }, [pointsData]);

  // Siatka radaru (koncentryczne wielokąty)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-2">
      <svg width={300} height={250} viewBox="0 0 300 250" className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-visible">
        
        {/* Tło - Subtelny blask na środku */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill={`radial-gradient(circle, ${color}22 0%, transparent 70%)`} />

        {/* Siatka radaru (Tło) */}
        {gridLevels.map((level) => {
          const gridPath = angles.map(angle => getPointCoordinates(level * 100, angle).str).join(' L ');
          return (
            <path
              key={`grid-${level}`}
              d={`M ${gridPath} Z`}
              fill={level % 0.4 === 0 ? "rgba(255, 255, 255, 0.03)" : "none"}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
            />
          );
        })}

        {/* Osie promieniowe */}
        {angles.map((angle, i) => {
          const { x, y } = getPointCoordinates(100, angle);
          return (
            <line
              key={`axis-${i}`}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              strokeDasharray="3 4"
            />
          );
        })}

        {/* Dynamiczny wielokąt statystyk (Framer Motion) */}
        <motion.path
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ d: pathData, fill: color, stroke: color, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 12 }}
          style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
          fillOpacity={0.25}
          strokeWidth="2.5"
          className="backdrop-blur-sm"
        />

        {/* Błyszczące punkty na wierzchołkach */}
        {pointsData.map((pt, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={4}
            fill="#fff"
            stroke={color}
            strokeWidth={2}
            initial={{ opacity: 0 }}
            animate={{ cx: pt.x, cy: pt.y, opacity: 1 }}
            transition={{ type: "spring", stiffness: 50, damping: 12 }}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        ))}

        {/* Kropka centralna */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={3} fill="rgba(255,255,255,0.3)" />

        {/* Etykiety osi */}
        {angles.map((angle, i) => {
          // Odsunięcie etykiet od krawędzi wykresu
          const labelRadius = RADIUS + 25;
          const labelX = CENTER_X + labelRadius * Math.sin(angle);
          const labelY = CENTER_Y - labelRadius * Math.cos(angle);
          
          return (
            <text
              key={`label-${i}`}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.9)"
              fontSize="11"
              fontWeight="600"
              className="font-sans uppercase tracking-[0.1em]"
              style={{ textShadow: '0 4px 8px rgba(0,0,0,0.9)' }}
            >
              {AXIS_LABELS[i]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
"""

with open("src/components/InfoPanel/RadarChart.tsx", "w", encoding="utf-8") as f:
    f.write(content)
