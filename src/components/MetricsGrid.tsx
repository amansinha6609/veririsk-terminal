import React from 'react';
import { Metrics } from '../types';

interface MetricsGridProps {
  metrics: Metrics;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  const getHealth = (label: string, value: number) => {
    switch(label) {
      case 'D/E': return value < 1.5 ? 'text-emerald-500' : (value > 3.0 ? 'text-red-500' : 'text-amber-500');
      case 'Current Ratio': return value > 1.5 ? 'text-emerald-500' : (value < 1.0 ? 'text-red-500' : 'text-amber-500');
      case 'Altman Z': return value > 2.99 ? 'text-emerald-500' : (value < 1.81 ? 'text-red-500' : 'text-amber-500');
      case 'Interest Cov': return value > 3.0 ? 'text-emerald-500' : (value < 1.5 ? 'text-red-500' : 'text-amber-500');
      default: return 'text-slate-300';
    }
  };

  const metricCards = [
    { label: 'D/E', value: metrics.debt_to_equity.toFixed(2), fullLabel: 'Debt to Equity' },
    { label: 'Current Ratio', value: metrics.current_ratio.toFixed(2), fullLabel: 'Current Ratio' },
    { label: 'Altman Z', value: metrics.altman_z_score.toFixed(2), fullLabel: 'Altman Z-Score' },
    { label: 'Interest Cov', value: metrics.interest_coverage.toFixed(2), fullLabel: 'Interest Coverage' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
      {metricCards.map((m, i) => (
        <div key={i} className="p-4 bg-[#020617] border border-[#1e293b] rounded-xl flex flex-col justify-between">
          <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-2" title={m.fullLabel}>{m.label}</div>
          <div className={`text-2xl font-mono font-black ${getHealth(m.label, parseFloat(m.value))}`}>{m.value}</div>
        </div>
      ))}
    </div>
  );
};
