import React from 'react';
import { Shield, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReportPageProps {
  reportData: {
    company_name: string;
    overall_risk: number; // This is the dynamic score
    summary: string;
    timestamp?: string;
  } | null;
  onBack: () => void;
}

export const ReportPage: React.FC<ReportPageProps> = ({ reportData, onBack }) => {
  if (!reportData) return null;

  // We use the score from reportData, fallback to 0 only if it's missing
  const riskScore = reportData.overall_risk;
  
  // Dynamic color logic based on the REAL score
  const getRiskColor = (score: number) => {
    if (score > 70) return 'text-red-500';
    if (score > 40) return 'text-yellow-500';
    return 'text-emerald-500';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <button onClick={onBack} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition-colors">
          ← Back to Terminal
        </button>

        {/* Header Card */}
        <div className="bg-[#0a0a0a] border border-[#1e293b] rounded-2xl p-8 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-sm font-mono text-blue-400 uppercase tracking-[0.2em] mb-2">Forensic Audit Result</h2>
              <h1 className="text-5xl font-bold tracking-tight">{reportData.company_name}</h1>
            </div>
            
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-2xl border border-[#1e293b]">
              <div className="text-center">
                <div className={`text-5xl font-black ${getRiskColor(riskScore)}`}>
                  {riskScore}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">Risk Index</div>
              </div>
              <div className="h-12 w-[1px] bg-white/10"></div>
              <Shield className={getRiskColor(riskScore)} size={40} />
            </div>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0a0a0a] border border-[#1e293b] rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <AlertCircle className="text-blue-400" size={20} />
                Executive Summary
              </h3>
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                {reportData.summary}
              </div>
            </div>
          </div>

          {/* Sidebar Status */}
          <div className="space-y-6">
            <div className="bg-[#0a0a0a] border border-[#1e293b] rounded-2xl p-6">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 tracking-widest">Audit Status</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Data Integrity</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Forensic Sync</span>
                  <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
              </div>
              <button className="w-full mt-8 bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                <Download size={18} />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};