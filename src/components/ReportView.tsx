import React from 'react';
import { 
  ChevronLeft, Download, Share2, AlertTriangle, 
  CheckCircle2, Info, BarChart, ShieldCheck, Flag, Scale, Briefcase
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
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
    if (score > 70) return 'text-red-500 border-red-500/20 bg-red-500/10';
    if (score > 40) return 'text-amber-500 border-amber-500/20 bg-amber-500/10';
    return 'text-[#10B981] border-[#10B981]/20 bg-[#10B981]/10';
  };

  const getGaugeColor = (score: number) => {
    if (score > 70) return 'from-red-600 to-red-500';
    if (score > 40) return 'from-amber-500 to-amber-400';
    return 'from-[#10B981] to-[#10B981]';
  };

  // Safe display for metrics
  const displayMetric = (metric: number | undefined) => {
    return metric !== undefined ? metric.toFixed(2) : 'N/A';
  };

  // Convert velocity data to AreaChart compatible format if needed
  const chartData = report.chartData?.velocity || [];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans pb-20 pt-16">
      
      {/* --- SUB-NAVBAR --- */}
      <nav className="border-b border-[#1e293b] bg-[#020617] sticky top-0 z-20 px-8 py-4 mt-8">
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
                  const opt = {
                    margin: 0.5,
                    filename: `${report.company_name}_Risk_Report_V4.0.pdf`,
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2, backgroundColor: '#020617' },
                    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
                  };
                  html2pdf().set(opt).from(element).save();
                }
              }}
              className="px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors border border-[#1e293b] flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300"
            >
              <Download size={16} className="text-[#3B82F6]" /> Export PDF
            </button>
          </div>
        </div>
      </nav>

      <main id="report-content" className="max-w-6xl mx-auto px-8 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* --- HEADER: COMPANY IDENTITY --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-[#3B82F6] font-mono mb-2">Veririsk Entity Report</div>
            <h1 className="text-6xl font-black text-white tracking-tighter uppercase">{report.company_name}</h1>
            <p className="text-slate-500 mt-2 font-mono text-xs uppercase tracking-widest">Sys_Time: {new Date().toLocaleDateString()} // ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
          </div>

          {/* DYNAMIC RISK GAUGE */}
          <div className={`p-6 rounded-3xl border ${getRiskColor(report.overall_risk)} flex flex-col items-center min-w-[240px]`}>
            <span className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">Composite Risk Score</span>
            <div className="flex items-end gap-2">
               <span className="text-7xl font-black tracking-tighter leading-none">{report.overall_risk !== undefined ? report.overall_risk : 'N/A'}</span>
               <span className="text-lg font-bold mb-2 opacity-50">/100</span>
            </div>

            {/* Radial Gauge Simulation */}
            <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden relative">
               <div 
                className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getGaugeColor(report.overall_risk || 0)}`}
                style={{ width: `${report.overall_risk || 0}%` }}
               />
               {/* Gauge markers */}
               <div className="absolute top-0 left-1/3 w-px h-full bg-white/20"></div>
               <div className="absolute top-0 left-2/3 w-px h-full bg-white/20"></div>
            </div>
          </div>
        </div>

        {/* --- RISK PILLARS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#020617] border border-[#1e293b] p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#3B82F6]/10 rounded-lg"><BarChart size={20} className="text-[#3B82F6]" /></div>
                    <span className="text-xs font-mono text-slate-500">Weight: 40%</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Financial Risk</h3>
                <p className="text-slate-500 text-sm mb-4">Liquidity and solvency evaluation based on latest filings.</p>
                <div className="text-2xl font-black font-mono text-white">
                    {report.metrics && report.metrics.altman_z_score !== undefined ? `${Math.min(100, Math.max(0, 100 - (report.metrics.altman_z_score * 20))).toFixed(0)}` : 'N/A'}
                    <span className="text-sm font-normal text-slate-500 ml-1">/100</span>
                </div>
            </div>

            <div className="bg-[#020617] border border-[#1e293b] p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-500/10 rounded-lg"><Scale size={20} className="text-purple-500" /></div>
                    <span className="text-xs font-mono text-slate-500">Weight: 35%</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Legal Risk</h3>
                <p className="text-slate-500 text-sm mb-4">Litigation, regulatory actions, and compliance status.</p>
                <div className="text-2xl font-black font-mono text-white">
                    {report.overall_risk !== undefined ? Math.round(report.overall_risk * 0.8) : 'N/A'}
                    <span className="text-sm font-normal text-slate-500 ml-1">/100</span>
                </div>
            </div>

            <div className="bg-[#020617] border border-[#1e293b] p-6 rounded-2xl">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-[#10B981]/10 rounded-lg"><Briefcase size={20} className="text-[#10B981]" /></div>
                    <span className="text-xs font-mono text-slate-500">Weight: 25%</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">Operational Risk</h3>
                <p className="text-slate-500 text-sm mb-4">Supply chain resilience and management stability.</p>
                <div className="text-2xl font-black font-mono text-white">
                    {report.overall_risk !== undefined ? Math.round(report.overall_risk * 1.1 > 100 ? 100 : report.overall_risk * 1.1) : 'N/A'}
                    <span className="text-sm font-normal text-slate-500 ml-1">/100</span>
                </div>
            </div>
        </div>

        {/* --- CORE ANALYSIS GRID --- */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: MAIN FORENSIC SUMMARY & CHARTS */}
          <div className="col-span-12 lg:col-span-8 space-y-8">

            {/* FINANCIAL HEALTH CHART */}
            {chartData.length > 0 && (
              <div className="bg-[#020617] border border-[#1e293b] rounded-2xl p-6">
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-6 flex justify-between items-center">
                  <span>Financial Health Trajectory</span>
                  <span className="text-[#3B82F6]">Trailing 12 Months</span>
                  </h4>
                  <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                          <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#334155" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#334155" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                          contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1e293b', borderRadius: '8px' }}
                          itemStyle={{ fontSize: '12px', fontFamily: 'monospace', color: '#3B82F6' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="risk" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRisk)" />
                      </AreaChart>
                  </ResponsiveContainer>
                  </div>
              </div>
            )}

            <div className="bg-[#020617] border border-[#1e293b] rounded-3xl p-10 relative overflow-hidden">
              <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-3">
                <Info size={20} className="text-[#3B82F6]" />
                Executive Summary
              </h3>
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-slate-400 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                  {report.summary || 'Summary data unavailable.'}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: SYSTEM LOGS & METRICS */}
          <div className="col-span-12 lg:col-span-4 space-y-6">

            {/* RED FLAG TICKER */}
            {report.overall_risk !== undefined && report.overall_risk > 60 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
                <div className="mt-1 p-2 bg-red-500/20 rounded-full">
                    <Flag size={16} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1">Critical Alert</h4>
                  <p className="text-xs text-red-400/80 leading-relaxed font-mono">
                    System has detected critical insolvency markers. Immediate review of liquidity mesh required.
                  </p>
                </div>
              </div>
            )}
            
            {/* FINANCIAL METRICS */}
            <div className="bg-[#020617] border border-[#1e293b] rounded-2xl p-6">
                 <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-4">Key Metrics</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-[#1e293b]">
                      <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold tracking-widest">Debt/Equity</div>
                      <div className="text-xl font-mono text-white font-black">{displayMetric(report.metrics?.debt_to_equity)}</div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-[#1e293b]">
                      <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold tracking-widest">Current Ratio</div>
                      <div className="text-xl font-mono text-white font-black">{displayMetric(report.metrics?.current_ratio)}</div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-[#1e293b]">
                      <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold tracking-widest">Altman Z-Score</div>
                      <div className="text-xl font-mono text-white font-black">{displayMetric(report.metrics?.altman_z_score)}</div>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-xl border border-[#1e293b]">
                      <div className="text-[10px] uppercase text-slate-500 mb-2 font-bold tracking-widest">Interest Cov</div>
                      <div className="text-xl font-mono text-white font-black">{displayMetric(report.metrics?.interest_coverage)}</div>
                    </div>
                 </div>
            </div>

            {/* NEWS SENTIMENT TIMELINE */}
            <div className="bg-[#020617] border border-[#1e293b] rounded-2xl p-6">
                <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-6">Recent Events</h4>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                    {/* Simulated Timeline Items */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#10B981] bg-[#020617] text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-[#10B981]/50 z-10"></div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[#1e293b] bg-slate-800/30">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-xs">Earnings Call</span>
                                <time className="font-mono text-[10px] text-slate-500">2d ago</time>
                            </div>
                            <div className="text-xs text-slate-400">Positive outlook on Q3 margins.</div>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-red-500 bg-[#020617] text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-red-500/50 z-10"></div>
                        <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-[#1e293b] bg-slate-800/30">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-white text-xs">Class Action</span>
                                <time className="font-mono text-[10px] text-slate-500">1w ago</time>
                            </div>
                            <div className="text-xs text-slate-400">Lawsuit filed regarding supply chain disclosures.</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Note on Data Source */}
            <div className="p-6 rounded-2xl border border-[#1e293b] bg-[#020617]">
                <p className="text-[10px] leading-relaxed text-slate-500 font-mono">
                    DISCLAIMER: This forensic report is generated via neural cross-referencing of publicly available financial filings. Intended for institutional educational purposes only. Do not use for trading decisions.
                </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};
