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

  // Determine if we have dynamic Z-Score Data
  let healthScore = 84;
  let gaugeScoreText = "EXCELLENT";
  let gaugeColor = "#10B981"; // Default Emerald

  if (report.dynamicData && report.dynamicData.z_score !== undefined && report.dynamicData.z_score !== null) {
    healthScore = report.dynamicData.z_score;
    // Cap mapping for visual gauge if we want, but since Z-Score is typically 0-5, let's map it conceptually
    // Wait, the gauge currently uses percentages 0-100.
    // So let's map Z-Score to a 0-100 scale for gauge, or just show Z-Score directly.
    // Given the gauge expects 'value' and '100-value', if we pass Z-Score directly it'll look weird if it's "3.0" and "97".
    // Let's use a standard mapping: Z > 3 is great (100%), Z=1.8 is bad (0%).
    // Actually, I'll pass the exact Z-score to the text, and map the circle appropriately.
    if (healthScore > 2.99) {
      gaugeScoreText = "SAFE ZONE";
      gaugeColor = "#10B981";
    } else if (healthScore >= 1.81 && healthScore <= 2.99) {
      gaugeScoreText = "GREY ZONE (CAUTION)";
      gaugeColor = "#F59E0B";
    } else {
      gaugeScoreText = "DISTRESS ZONE (HIGH RISK)";
      gaugeColor = "#EF4444";
    }
  }

  // Calculate visual percentage for gauge
  const maxZ = 5;
  const clampedZ = Math.max(0, Math.min(healthScore, maxZ));
  const gaugePercent = (clampedZ / maxZ) * 100;

  const gaugeData = [
    { name: 'Score', value: report.dynamicData?.z_score !== null && report.dynamicData?.z_score !== undefined ? gaugePercent : healthScore },
    { name: 'Remaining', value: 100 - (report.dynamicData?.z_score !== null && report.dynamicData?.z_score !== undefined ? gaugePercent : healthScore) }
  ];
  const COLORS = [gaugeColor, '#1e293b'];

  const formatVal = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "N/A";
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const calculateVariance = (current: number | null | undefined, previous: number | null | undefined) => {
    if (current === null || current === undefined || previous === null || previous === undefined || previous === 0) return "N/A";
    const variance = ((current - previous) / previous) * 100;
    const sign = variance > 0 ? "+" : "";
    const color = variance > 0 ? "text-[#10B981]" : variance < 0 ? "text-[#EF4444]" : "text-slate-400";
    return <span className={`font-black ${color}`}>{sign}{variance.toFixed(1)}%</span>;
  };

  const getStatementRow = (label: string, defaultCurr: number, defaultPrev: number) => {
    let curr = defaultCurr;
    let prev = defaultPrev;
    if (report.dynamicData && report.dynamicData.statement && report.dynamicData.statement[label]) {
      curr = report.dynamicData.statement[label].current;
      prev = report.dynamicData.statement[label].previous;
    }
    return (
      <tr className="border-b border-[#1e293b] hover:bg-white/5 transition-colors">
        <td className="py-4">{label}</td>
        <td className="py-4 text-right text-white">{formatVal(curr)}</td>
        <td className="py-4 text-right">{formatVal(prev)}</td>
        <td className="py-4 text-right">{calculateVariance(curr, prev)}</td>
      </tr>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-md border-b border-[#1e293b] p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-[#1e293b]"
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
        <div className="bg-[#020617] border border-[#1e293b] rounded-2xl p-8 mb-8 shadow-xl">
          <h2 className="text-xl font-black text-white uppercase mb-4 border-b border-[#1e293b] pb-4">Executive Summary</h2>
          <p className="text-slate-400 leading-relaxed font-bold text-sm">
            The fiscal year 2023 demonstrated resilient operational performance despite macroeconomic headwinds. The organization maintained strong liquidity positions and successfully optimized its debt profile. Strategic capital allocation yielded a 14% improvement in EBITDA margins, while gross revenue expanded by 8% year-over-year. Key risk indicators remain well within acceptable thresholds, supported by proactive cost management initiatives and sustained market demand across core business segments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* FISCAL HEALTH INDEX */}
          <div className="bg-[#020617] border border-[#1e293b] rounded-2xl p-8 shadow-xl lg:col-span-1 flex flex-col items-center">
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
                <span className="text-5xl font-black text-white tracking-tighter" style={{ color: gaugeColor }}>
                  {report.dynamicData && report.dynamicData.z_score !== null && report.dynamicData.z_score !== undefined ? report.dynamicData.z_score : healthScore}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest mt-1 text-center" style={{ color: gaugeColor }}>
                  {gaugeScoreText}
                </span>
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
          <div className="bg-[#020617] border border-[#1e293b] rounded-2xl p-8 shadow-xl lg:col-span-2 overflow-x-auto">
             <h2 className="text-xl font-black text-white uppercase mb-6">Statement of Operations (Millions USD)</h2>
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="border-b border-[#1e293b]">
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Metric</th>
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Current</th>
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Previous</th>
                   <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Variance</th>
                 </tr>
               </thead>
               <tbody className="text-sm font-bold text-slate-300">
                 {getStatementRow("Total Revenue", 4250.0, 3935.0)}
                 {getStatementRow("Gross Profit", 1870.0, 1650.0)}
                 {getStatementRow("Operating Income", 920.0, 810.0)}
                 {getStatementRow("EBITDA", 1150.0, 1008.0)}
                 <tr className="hover:bg-white/5 transition-colors">
                   <td className="py-4 font-black text-white">Net Income</td>
                   <td className="py-4 text-right font-black text-white">{formatVal(report.dynamicData?.statement?.["Net Income"]?.current ?? 680.0)}</td>
                   <td className="py-4 text-right">{formatVal(report.dynamicData?.statement?.["Net Income"]?.previous ?? 590.0)}</td>
                   <td className="py-4 text-right">{calculateVariance(report.dynamicData?.statement?.["Net Income"]?.current ?? 680.0, report.dynamicData?.statement?.["Net Income"]?.previous ?? 590.0)}</td>
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
              <div key={i} className="bg-[#020617] border border-[#1e293b] p-4 rounded-xl flex flex-col items-center justify-center text-center hover:border-[#3B82F6]/30 transition-all cursor-pointer group">
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
