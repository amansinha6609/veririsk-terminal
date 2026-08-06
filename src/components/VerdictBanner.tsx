import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface VerdictBannerProps {
  verdict: string;
  score: number;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ verdict, score }) => {
  const getStyle = () => {
    if (score < 30) return { bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20', text: 'text-[#10B981]', icon: <CheckCircle className="text-[#10B981]" size={24} />, badge: 'LOW RISK' };
    if (score < 55) return { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500', icon: <Info className="text-amber-500" size={24} />, badge: 'MODERATE RISK' };
    if (score < 75) return { bg: 'bg-orange-500/10', border: 'border-orange-500/20', text: 'text-orange-500', icon: <AlertTriangle className="text-orange-500" size={24} />, badge: 'HIGH RISK' };
    return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-500', icon: <AlertTriangle className="text-red-500" size={24} />, badge: 'CRITICAL RISK' };
  };

  const style = getStyle();

  return (
    <div className={`w-full p-6 border rounded-2xl flex items-start gap-4 animate-fade-in ${style.bg} ${style.border}`}>
      <div className="mt-1">{style.icon}</div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
           <h3 className={`text-sm font-bold uppercase tracking-widest ${style.text}`}>Final Verdict</h3>
           <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${style.border} ${style.text}`}>{style.badge}</span>
        </div>
        <p className="text-slate-300 font-mono text-sm leading-relaxed">{verdict}</p>
      </div>
    </div>
  );
};
