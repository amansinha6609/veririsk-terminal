import React, { useEffect, useState } from 'react';
import { History, ChevronRight } from 'lucide-react';
import { StoredReport } from '../types';

interface ReportHistoryProps {
  onSelectReport: (companyName: string) => void;
  refreshTrigger?: number;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({ onSelectReport, refreshTrigger }) => {
  const [reports, setReports] = useState<StoredReport[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/v1/reports');
        if (res.ok) {
           const data = await res.json();
           setReports(data);
        }
      } catch (e) {
        console.error("Failed to fetch history");
      }
    };
    fetchReports();
  }, [refreshTrigger]);

  if (reports.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <History size={16} className="text-emerald-500" /> Recent Audits
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <button
            key={report.report_id}
            onClick={() => onSelectReport(report.company_name)}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 transition-all group text-left"
          >
            <div>
               <div className="font-bold text-white text-sm mb-1">{report.company_name}</div>
               <div className="text-[10px] font-mono text-slate-500">
                  {new Date(report.timestamp).toLocaleDateString()} • Score: {report.overall_risk}
               </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
