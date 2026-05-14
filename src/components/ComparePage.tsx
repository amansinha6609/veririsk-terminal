import React from 'react';
import { ChevronLeft, Scale, Zap, Trophy, ShieldAlert } from 'lucide-react';

export function ComparePage({ comparisonData, onBack }: any) {
  if (!comparisonData) return null;
  const [a, b] = comparisonData.entities;

  return (
    <div className="p-8 max-w-6xl mx-auto text-white min-h-screen bg-[#051121] pb-20">
      <button onClick={onBack} className="mb-12 flex items-center gap-2 text-gray-500 hover:text-white transition-all font-bold uppercase text-xs tracking-widest">
        <ChevronLeft size={16}/> Back to Dashboard
      </button>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 px-10">
        <div className="text-center md:text-right flex-1">
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{a}</h2>
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Primary Entity</span>
        </div>
        
        <div className="p-6 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-600/40 relative">
          <Scale size={40} className="text-white"/>
          <div className="absolute -inset-4 border border-blue-600/30 rounded-[40px] animate-pulse"></div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{b}</h2>
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Benchmark Subject</span>
        </div>
      </div>

      <div className="bg-[#0a192f] border border-white/10 p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
        <Zap className="absolute top-10 right-10 text-yellow-400 opacity-20" size={100} />
        <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.5em] mb-10">AI Risk Comparison Output</h3>
        <p className="text-gray-300 leading-[1.8] whitespace-pre-wrap text-xl font-serif italic">
          {comparisonData.comparison_text}
        </p>
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
        <ShieldAlert className="text-blue-500 shrink-0" size={24} />
        <p className="text-xs text-gray-500 leading-relaxed uppercase tracking-wider">
          Calculated comparison based on Q1 2026 data. All scores are subject to real-time volatility.
        </p>
      </div>
    </div>
  );
}