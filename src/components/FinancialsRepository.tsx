import React, { useState } from 'react';
import { FileText, Lock, FileSpreadsheet, Download } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Report {
  id: string;
  title: string;
  type: 'PDF' | 'XLSX';
  size: string;
  date: string;
  category: 'Annual' | 'Quarterly' | 'Audit';
  locked?: boolean;
}

const mockReports: Report[] = [
  { id: '1', title: '2023 Annual Fiscal Report', type: 'PDF', size: '4.2 MB', date: '2024-02-15', category: 'Annual' },
  { id: '2', title: 'Q4 2023 Operations', type: 'XLSX', size: '1.1 MB', date: '2024-01-20', category: 'Quarterly' },
  { id: '3', title: 'Q3 2023 Operations', type: 'XLSX', size: '1.2 MB', date: '2023-10-15', category: 'Quarterly' },
  { id: '4', title: '2022 Annual Fiscal Report', type: 'PDF', size: '3.9 MB', date: '2023-02-12', category: 'Annual' },
  { id: '5', title: 'Internal Audit Review', type: 'PDF', size: '8.4 MB', date: '2024-03-01', category: 'Audit', locked: true },
];

interface FinancialsRepositoryProps {
  onSelectReport: (report: Report) => void;
}

export const FinancialsRepository: React.FC<FinancialsRepositoryProps> = ({ onSelectReport }) => {
  type TabType = 'All Reports' | 'Annual' | 'Quarterly' | 'Audit Statements';
  const [activeTab, setActiveTab] = useState<TabType>('All Reports');

  const filteredReports = mockReports.filter((report) => {
    if (activeTab === 'All Reports') return true;
    if (activeTab === 'Annual') return report.category === 'Annual';
    if (activeTab === 'Quarterly') return report.category === 'Quarterly';
    if (activeTab === 'Audit Statements') return report.category === 'Audit';
    return true;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-300 font-sans">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Disclosure Repository</h2>
        <p className="text-slate-500 font-bold mt-2">Access comprehensive financial disclosures and operational audits.</p>
      </div>

      <div className="flex gap-4 mb-8 border-b border-[#1e293b] pb-4">
        {(['All Reports', 'Annual', 'Quarterly', 'Audit Statements'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                : 'text-slate-500 hover:text-white border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <motion.button
            key={report.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !report.locked && onSelectReport(report)}
            disabled={report.locked}
            className={`text-left bg-[#020617] border border-[#1e293b] p-6 rounded-2xl relative overflow-hidden transition-all group ${
              report.locked ? 'opacity-80 cursor-not-allowed' : 'hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5'
            }`}
          >
            {report.locked && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest">
                <Lock size={12} /> Confidential
              </div>
            )}

            <div className="mb-6 flex items-start justify-between">
              <div className={`p-4 rounded-xl ${report.type === 'PDF' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                {report.type === 'PDF' ? <FileText size={28} /> : <FileSpreadsheet size={28} />}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>

            <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-6">
              <span className="uppercase tracking-wider">{report.type}</span>
              <span>•</span>
              <span>{report.size}</span>
              <span>•</span>
              <span>{report.date}</span>
            </div>

            {!report.locked && (
              <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                <Download size={16} /> View Details
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
