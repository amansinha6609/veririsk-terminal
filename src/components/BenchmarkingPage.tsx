import React from 'react';
import { ChevronLeft, Scale, Zap, Trophy, ShieldAlert } from 'lucide-react';

import { ForensicReport } from '../App';

export function BenchmarkingPage({ report, onBack }: { report: ForensicReport | null, onBack?: () => void }) {
  const targetEntity = report?.company_name || "Unknown Entity";
  const benchmarkSubject = "Industry Peers";

  const renderMetric = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return value.toFixed(2);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-white min-h-screen bg-[#020617] pb-20 pt-20">
      {onBack && (
        <button onClick={onBack} className="mb-12 flex items-center gap-2 text-gray-500 hover:text-white transition-all font-bold uppercase text-xs tracking-widest">
          <ChevronLeft size={16}/> Back to Dashboard
        </button>
      )}

      <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 px-10">
        <div className="text-center md:text-right flex-1">
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{targetEntity}</h2>
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Primary Entity</span>
        </div>

        <div className="p-6 bg-blue-600 rounded-[32px] shadow-2xl shadow-blue-600/40 relative">
          <Scale size={40} className="text-white"/>
          <div className="absolute -inset-4 border border-blue-600/30 rounded-[40px] animate-pulse"></div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-5xl font-black mb-2 tracking-tighter">{benchmarkSubject}</h2>
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Benchmark Subject</span>
        </div>
      </div>

      <div className="bg-[#020617] border border-[#1e293b] p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
        <Zap className="absolute top-10 right-10 text-yellow-400 opacity-20" size={100} />
        <h3 className="text-blue-400 font-black uppercase text-[10px] tracking-[0.5em] mb-10">Peer-to-Peer Matrix</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="bg-white/5 border border-[#1e293b] p-6 rounded-2xl">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Liquidity Ratio</h4>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-black">{report?.metrics ? renderMetric(report.metrics.current_ratio) : "Calculating..."}</span>
                <div className="text-[10px] text-blue-500 uppercase font-bold mt-1">Target</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-500">N/A</span>
                <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Peers</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-[#1e293b] p-6 rounded-2xl">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Altman Z-Score</h4>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-black">{report?.metrics ? renderMetric(report.metrics.altman_z_score) : "Calculating..."}</span>
                <div className="text-[10px] text-blue-500 uppercase font-bold mt-1">Target</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-500">N/A</span>
                <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Peers</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-[#1e293b] p-6 rounded-2xl">
            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Debt / Equity</h4>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-2xl font-black">{report?.metrics ? renderMetric(report.metrics.debt_to_equity) : "Calculating..."}</span>
                <div className="text-[10px] text-blue-500 uppercase font-bold mt-1">Target</div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-gray-500">N/A</span>
                <div className="text-[10px] text-gray-500 uppercase font-bold mt-1">Peers</div>
              </div>
            </div>
          </div>
        </div>
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