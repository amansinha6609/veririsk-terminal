import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SolvencyDataPoint } from '../types';

interface SolvencyChartProps {
  data: SolvencyDataPoint[];
}

export const SolvencyChart: React.FC<SolvencyChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full animate-fade-in bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">Solvency Trajectory (Trailing 4Q)</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="quarter" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="debt" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDebt)" />
          <Area type="monotone" dataKey="cash" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
