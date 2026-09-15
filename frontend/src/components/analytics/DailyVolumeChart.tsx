// FILE: src/components/analytics/DailyVolumeChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';

export interface DailyVolumeChartProps {
  data: { date: string; count: number }[];
}

export const DailyVolumeChart: React.FC<DailyVolumeChartProps> = ({ data }) => {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-white tracking-tight">Daily Outreach Volume</h4>
          <p className="text-xs text-zinc-500">Emails dispatched over the last 14 days</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717A', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717A', fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#0c0c0c] border border-white/10 text-white p-2.5 rounded-lg text-xs shadow-lg">
                      <div className="font-semibold text-zinc-200">{label}</div>
                      <div className="text-emerald-400 font-mono mt-0.5">
                        {payload[0].value} emails sent
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
