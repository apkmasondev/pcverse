import sys

content = """import React, { useMemo, useId } from 'react';
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
  const gradientId = useId().replace(/:/g, "");
  
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
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-2">
      <svg width={300} height={250} viewBox="0 0 300 250" className="overflow-visible">
        <defs>
          <radialGradient id={`glow-${gradientId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`poly-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
          </linearGradient>
          <filter id={`shadow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={color} floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Tło - Subtelny blask na środku */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS + 10} fill={`url(#glow-${gradientId})`} />

        {/* Siatka radaru (Tło) */}
        {gridLevels.map((level) => {
          const gridPath = angles.map(angle => getPointCoordinates(level * 100, angle).str).join(' L ');
          return (
            <path
              key={`grid-${level}`}
              d={`M ${gridPath} Z`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth={level === 1.0 ? "1.5" : "0.5"}
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
              strokeWidth="1"
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Dynamiczny wielokąt statystyk (Framer Motion) */}
        <motion.path
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ d: pathData, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          style={{ transformOrigin: `${CENTER_X}px ${CENTER_Y}px` }}
          fill={`url(#poly-${gradientId})`}
          stroke={color}
          strokeWidth="2"
          filter={`url(#shadow-${gradientId})`}
          className="backdrop-blur-md"
        />

        {/* Błyszczące punkty na wierzchołkach */}
        {pointsData.map((pt, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={3.5}
            fill="#ffffff"
            stroke={color}
            strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{ cx: pt.x, cy: pt.y, opacity: 1 }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        ))}

        {/* Kropka centralna */}
        <circle cx={CENTER_X} cy={CENTER_Y} r={2} fill="rgba(255,255,255,0.4)" />

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
              fill="rgba(255,255,255,0.8)"
              fontSize="11"
              fontWeight="500"
              className="font-sans uppercase tracking-widest"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,1)' }}
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
