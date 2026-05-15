import React, { useRef } from 'react';
import { ArrowLeft, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Report } from './FinancialsRepository';
import html2pdf from 'html2pdf.js';

interface FiscalReportDetailProps {
  report: Report;
  onBack: () => void;
}

export const FiscalReportDetail: React.FC<FiscalReportDetailProps> = ({ report, onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = () => {
    if (!reportRef.current) return;
    const opt = {
      margin: 10,
      filename: `${report.title.replace(/\s+/g, '_')}_Report.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(reportRef.current).save();
  };

  const healthScore = 84;
  const gaugeData = [
    { name: 'Score', value: healthScore },
    { name: 'Remaining', value: 100 - healthScore }
  ];
  const COLORS = ['#10B981', '#1e293b']; // Emerald for score, slate for remaining

  return (
    <div className="h-full overflow-y-auto bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-md border-b border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
          >
            <ArrowLeft size={24} className="text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{report.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{report.date}</span>
              <span className="flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 px-2 py-0.5 rounded uppercase tracking-widest text-[10px] font-bold">
                <ShieldCheck size={12} /> Verified Status
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-[#3B82F6]/20"
        >
          <Download size={18} /> Export PDF
        </button>
      </div>

      <div className="p-8 max-w-6xl mx-auto" ref={reportRef}>

        {/* EXECUTIVE SUMMARY */}
        <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-8 mb-8 shadow-xl">
          <h2 className="text-xl font-black text-white uppercase mb-4 border-b border-white/5 pb-4">Executive Summary</h2>
          <p className="text-slate-400 leading-relaxed font-bold text-sm">
            The fiscal year 2023 demonstrated resilient operational performance despite macroeconomic headwinds. The organization maintained strong liquidity positions and successfully optimized its debt profile. Strategic capital allocation yielded a 14% improvement in EBITDA margins, while gross revenue expanded by 8% year-over-year. Key risk indicators remain well within acceptable thresholds, supported by proactive cost management initiatives and sustained market demand across core business segments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* FISCAL HEALTH INDEX */}
          <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-8 shadow-xl lg:col-span-1 flex flex-col items-center">
            <h2 className="text-xl font-black text-white uppercase mb-6 w-full text-left">Fiscal Health Index</h2>

            <div className="relative w-48 h-48 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-8">
                <span className="text-5xl font-black text-white tracking-tighter">{healthScore}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Excellent</span>
              </div>
            </div>

            <div className="w-full space-y-6">
              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  <span>Liquidity Ratio</span>
                  <span className="text-white">2.4</span>
                </div>
                <div className="w-full bg-[#1e293b] rounded-full h-2">
                  <div className="bg-[#3B82F6] h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  <span>Debt-to-Equity</span>
                  <span className="text-white">0.45</span>
                </div>
                <div className="w-full bg-[#1e293b] rounded-full h-2">
                  <div className="bg-[#10B981] h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* STATEMENT OF OPERATIONS */}
          <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-8 shadow-xl lg:col-span-2 overflow-x-auto">
             <h2 className="text-xl font-black text-white uppercase mb-6">Statement of Operations (Millions USD)</h2>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-white/5">
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Metric</th>
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">FY 2023</th>
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">FY 2022</th>
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Variance</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-bold text-slate-300">
                 <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                   <td className="py-4">Total Revenue</td>
                   <td className="py-4 text-right text-white">4,250.0</td>
                   <td className="py-4 text-right">3,935.0</td>
                   <td className="py-4 text-right text-[#10B981]">+8.0%</td>
                 </tr>
                 <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                   <td className="py-4">Gross Profit</td>
                   <td className="py-4 text-right text-white">1,870.0</td>
                   <td className="py-4 text-right">1,650.0</td>
                   <td className="py-4 text-right text-[#10B981]">+13.3%</td>
                 </tr>
                 <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                   <td className="py-4">Operating Income</td>
                   <td className="py-4 text-right text-white">920.0</td>
                   <td className="py-4 text-right">810.0</td>
                   <td className="py-4 text-right text-[#10B981]">+13.5%</td>
                 </tr>
                 <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                   <td className="py-4">EBITDA</td>
                   <td className="py-4 text-right text-white">1,150.0</td>
                   <td className="py-4 text-right">1,008.0</td>
                   <td className="py-4 text-right text-[#10B981]">+14.0%</td>
                 </tr>
                 <tr className="hover:bg-white/5 transition-colors">
                   <td className="py-4 font-black text-white">Net Income</td>
                   <td className="py-4 text-right font-black text-[#10B981]">680.0</td>
                   <td className="py-4 text-right">590.0</td>
                   <td className="py-4 text-right font-black text-[#10B981]">+15.2%</td>
                 </tr>
               </tbody>
             </table>
          </div>

        </div>

        {/* ATTACHED DOCUMENTS FOOTER */}
        <div>
          <h2 className="text-xl font-black text-white uppercase mb-6">Attached Source Documents</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Auditor's Report", size: "1.2 MB" },
              { title: "Balance Sheet", size: "0.8 MB" },
              { title: "Cash Flow", size: "0.9 MB" },
              { title: "Risk Disclosure", size: "2.1 MB" }
            ].map((doc, i) => (
              <div key={i} className="bg-[#0B1120] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
                <FileText size={32} className="text-slate-500 mb-3 group-hover:text-[#3B82F6] transition-colors" />
                <h3 className="text-sm font-bold text-white mb-1">{doc.title}</h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{doc.size} • PDF</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
