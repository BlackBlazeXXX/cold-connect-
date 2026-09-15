import React from 'react';

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 80,
  height = 28,
  color = '#10b981',
  className = '',
}) => {
  if (!data.length) return null;

  const max = Math.max(...data, 1);
  const min = 0;
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const pathD = `M${points.join(' L')}`;

  const areaD = `${pathD} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill={`url(#sparkline-grad-${color.replace('#', '')})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) / (data.length - 1) * width}
          cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
};