import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceDot } from 'recharts';
import { VelocityDataPoint } from '../types';

interface VelocityChartProps {
  data: VelocityDataPoint[];
}

export const VelocityChart: React.FC<VelocityChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full animate-fade-in bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Velocity (T-90 to NOW)</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
            formatter={(value: number, name: string, props: any) => {
               if (props.payload.anchor) return [value, `Risk (Anchor: ${props.payload.anchor})`];
               return [value, "Risk Score"];
            }}
          />
          <Line type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#0a0a0f', strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
