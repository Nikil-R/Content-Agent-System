import React from 'react';
import { motion } from 'framer-motion';

interface RadarChartProps {
  data: Record<string, number>;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data }) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const size = 300;
  const center = size / 2;
  const radius = size * 0.4;
  const angleStep = (Math.PI * 2) / keys.length;

  // Calculate coordinates for a point
  const getPoint = (value: number, index: number, maxRadius: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 10) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate paths
  const axisPoints = keys.map((_, i) => getPoint(10, i, radius));
  const dataPoints = values.map((val, i) => getPoint(val, i, radius));
  
  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const gridLevels = [2.5, 5, 7.5, 10];

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Grid Background */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(level / 10) * radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {axisPoints.map((p, i) => (
          <g key={i}>
            <line
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
            {/* Labels */}
            <text
              x={getPoint(12, i, radius).x}
              y={getPoint(12, i, radius).y}
              fill="rgba(255,255,255,0.4)"
              fontSize="9"
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="middle"
              className="uppercase tracking-widest font-heading"
            >
              {keys[i].replace('_', ' ')}
            </text>
          </g>
        ))}

        {/* Data Area */}
        <motion.path
          d={polygonPath}
          fill="rgba(6, 182, 212, 0.2)"
          stroke="#06B6D4"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Data Points */}
        {dataPoints.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#06B6D4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
};
