import React from 'react';
import { 
  ChevronLeft, Download, Share2, AlertTriangle, 
  CheckCircle2, Info, BarChart, ShieldCheck, Flag
} from 'lucide-react';
import {
  LineChart, Line, BarChart as RechartsBarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import html2pdf from 'html2pdf.js';

interface ReportViewProps {
  report: {
    company_name: string;
    overall_risk: number;
    summary: string;
    metrics?: {
      debt_to_equity: number;
      current_ratio: number;
      altman_z_score: number;
      interest_coverage: number;
    };
    chartData?: {
      solvency: Array<{ quarter: string; debt: number; cash: number }>;
      velocity: Array<{ time: string; risk: number }>;
    };
  };
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onBack }) => {
  // Logic to determine color based on risk score
  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-500 border-red-500/20 bg-red-500/5';
    if (score > 40) return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
    return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
  };

  const getGaugeColor = (score: number) => {
    if (score > 70) return 'from-red-600 to-orange-600';
    if (score > 40) return 'from-amber-500 to-orange-400';
    return 'from-emerald-600 to-teal-500';
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-sans pb-20">
      
      {/* --- SUB-NAVBAR --- */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-20 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Terminal
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                const element = document.getElementById('report-content');
                if (element) {
                  html2pdf().from(element).save(`${report.company_name}_Forensic_Audit.pdf`);
                }
              }}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
            >
              <Download size={18} className="text-slate-400" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5">
              <Share2 size={18} className="text-slate-400" />
            </button>
          </div>
        </div>
      </nav>

      <main id="report-content" className="max-w-5xl mx-auto px-8 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* --- HEADER: COMPANY IDENTITY --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-blue-500 font-mono mb-2">Forensic Entity Audit</div>
            <h1 className="text-6xl font-black text-white tracking-tighter italic uppercase">{report.company_name}</h1>
            <p className="text-slate-500 mt-2 font-mono text-xs uppercase tracking-widest">System Timestamp: {new Date().toLocaleDateString()} // UTC-4</p>
          </div>

          {/* DYNAMIC RISK GAUGE */}
          <div className={`p-6 rounded-3xl border ${getRiskColor(report.overall_risk)} flex flex-col items-center min-w-[200px]`}>
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-60 mb-1">Risk Index</span>
            <span className="text-6xl font-black tracking-tighter italic">{report.overall_risk}</span>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
               <div 
                className={`h-full bg-gradient-to-r ${getGaugeColor(report.overall_risk)}`} 
                style={{ width: `${report.overall_risk}%` }}
               />
            </div>
          </div>
        </div>

        {/* --- CORE ANALYSIS GRID --- */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: MAIN FORENSIC SUMMARY & CHARTS */}
          <div className="col-span-12 lg:col-span-8 space-y-8">

            {/* CHARTS ROW */}
            {report.chartData && (
              <div className="grid grid-cols-2 gap-6">
                {/* SOLVENCY HEATMAP */}
                <div className="bg-[#080808] border border-white/5 rounded-2xl p-6">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4 flex justify-between">
                    <span>Solvency Heatmap</span>
                    <span>[DEBT v CASH]</span>
                  </h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={report.chartData.solvency}>
                        <XAxis dataKey="quarter" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}B`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#000', borderColor: '#334155', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                          cursor={{ fill: '#ffffff05' }}
                        />
                        <Bar dataKey="debt" fill="transparent" stroke="#ef4444" strokeWidth={2} name="Total Debt" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="cash" fill="transparent" stroke="#10b981" strokeWidth={2} name="Cash Equiv" radius={[2, 2, 0, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* RISK VELOCITY */}
                <div className="bg-[#080808] border border-white/5 rounded-2xl p-6">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4 flex justify-between">
                    <span>Risk Velocity</span>
                    <span>[90D TRAILING]</span>
                  </h4>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={report.chartData.velocity}>
                        <XAxis dataKey="time" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#000', borderColor: '#334155', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '12px', fontFamily: 'monospace', color: '#3b82f6' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                        />
                        <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} dot={false} name="Risk Score" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#080808] border border-white/5 rounded-3xl p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                <BarChart size={200} />
              </div>
              <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                <Info size={20} className="text-blue-500" /> 
                Executive Summary
              </h3>
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-slate-400 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {report.summary}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: SYSTEM LOGS & STATUS */}
          <div className="col-span-12 lg:col-span-4 space-y-6">

            {/* RED FLAG TICKER */}
            {report.overall_risk > 60 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Flag size={18} className="text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.1em] text-red-500 mb-1">Active Red Flag</h4>
                  <p className="text-xs text-red-400/80 leading-relaxed font-mono">
                    System has detected critical insolvency markers. Review liquidity mesh immediately.
                  </p>
                </div>
              </div>
            )}
            
            {/* FINANCIAL HEALTH GRID */}
            {report.metrics && (
              <div className="bg-[#080808] border border-white/5 rounded-2xl p-6">
                 <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Financial Health Grid</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase text-slate-500 mb-1">Debt/Equity</div>
                      <div className="text-lg font-mono text-white">{report.metrics.debt_to_equity.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase text-slate-500 mb-1">Current Ratio</div>
                      <div className="text-lg font-mono text-white">{report.metrics.current_ratio.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase text-slate-500 mb-1">Altman Z-Score</div>
                      <div className="text-lg font-mono text-white">{report.metrics.altman_z_score.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] uppercase text-slate-500 mb-1">Interest Cov</div>
                      <div className="text-lg font-mono text-white">{report.metrics.interest_coverage.toFixed(2)}</div>
                    </div>
                 </div>
              </div>
            )}

            {/* Status Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Audit Status</h4>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Data Integrity</span>
                        <span className="text-[10px] font-mono text-slate-400">VERIFIED</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-2"><ShieldCheck size={14} className="text-blue-500" /> Solvency Mesh</span>
                        <span className="text-[10px] font-mono text-slate-400">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-2">
                            {report.overall_risk > 60 ? <AlertTriangle size={14} className="text-red-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
                            Insolvency Check
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {report.overall_risk > 60 ? 'Critical' : 'Nominal'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Note on Data Source */}
            <div className="p-6 rounded-2xl border border-white/5 bg-[#050505]">
                <p className="text-[10px] leading-relaxed text-slate-600 font-mono">
                    DISCLAIMER: This forensic report is generated via neural cross-referencing of publicly available financial filings. Intended for institutional educational purposes only.
                </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};