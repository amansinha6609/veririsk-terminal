import React, { useEffect, useRef } from 'react';
import { ModuleState } from '../types';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface ModuleStreamProps {
  module: ModuleState;
}

export const ModuleStream: React.FC<ModuleStreamProps> = ({ module }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [module.text]);

  return (
    <div className={`flex flex-col h-64 border rounded-xl overflow-hidden transition-colors ${module.status === 'pending' ? 'border-slate-800 bg-slate-900/50 opacity-50' : 'border-slate-700 bg-[#0a0a0f]'}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{module.label}</span>
        {module.status === 'streaming' && <Loader2 className="animate-spin text-emerald-500" size={14} />}
        {module.status === 'complete' && (
           <div className="flex items-center gap-2">
               <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${module.score && module.score > 70 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                   SCORE: {module.score}
               </span>
               <CheckCircle2 className="text-emerald-500" size={14} />
           </div>
        )}
        {module.status === 'error' && <AlertCircle className="text-red-500" size={14} />}
      </div>
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto terminal-scroll font-mono text-xs text-slate-400 leading-relaxed whitespace-pre-wrap"
      >
        {module.status === 'pending' ? 'Waiting for stream...' : module.text}
      </div>
    </div>
  );
};
