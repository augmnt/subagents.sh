'use client';

import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

export interface WeeklyDownloadData {
  week: number;
  downloads: number;
}

interface SparklineChartProps {
  data: WeeklyDownloadData[];
  height?: number;
}

export function SparklineChart({ data, height = 40 }: SparklineChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="downloads"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SparklineChartSkeleton({ height = 40 }: { height?: number }) {
  return (
    <div
      className="skeleton rounded"
      style={{ width: '100%', height }}
    />
  );
}
