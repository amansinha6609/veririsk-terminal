import React from 'react';
import { Activity, Download, Search, Filter, ShieldAlert, LogIn, FileText, Settings } from 'lucide-react';

export function AccountActivityPage() {
  const auditLogs = [
    { id: 'AL-9021', action: 'Report Export', resource: 'Tesla_Inc_Risk_Report.pdf', ip: '192.168.1.1', time: '10 mins ago', user: 'Alex Sterling', icon: FileText, color: 'text-blue-500' },
    { id: 'AL-9020', action: 'Entity Search', resource: 'Query: "Tesla, Inc."', ip: '192.168.1.1', time: '12 mins ago', user: 'Alex Sterling', icon: Search, color: 'text-purple-500' },
    { id: 'AL-9019', action: 'Login Success', resource: 'System Authentication', ip: '192.168.1.1', time: '2 hours ago', user: 'Alex Sterling', icon: LogIn, color: 'text-[#10B981]' },
    { id: 'AL-9018', action: 'Settings Modified', resource: '2FA Status: Enabled', ip: '10.0.0.45', time: '1 day ago', user: 'Alex Sterling', icon: Settings, color: 'text-amber-500' },
    { id: 'AL-9017', action: 'Failed Login', resource: 'Invalid Credentials', ip: '172.16.2.8', time: '3 days ago', user: 'Unknown', icon: ShieldAlert, color: 'text-red-500' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 text-slate-300 font-sans">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-white tracking-tighter italic mb-2">Audit <span className="text-[#3B82F6]">Log</span></h2>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">Immutable record of system interactions.</p>
      </header>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#0B1120] border border-slate-800/50 p-4 rounded-2xl">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                    type="text"
                    placeholder="Search logs (e.g. AL-9021)..."
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
                />
            </div>
            <button className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
                <Filter size={18} />
            </button>
         </div>
         <button className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            <Download size={16} /> Export CSV
         </button>
      </div>

      {/* Log Table */}
      <div className="bg-[#0B1120] border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-[#020617] border-b border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-bold font-mono">
                    <tr>
                        <th className="px-6 py-4">Event ID</th>
                        <th className="px-6 py-4">Action</th>
                        <th className="px-6 py-4">Resource / Detail</th>
                        <th className="px-6 py-4">IP Address</th>
                        <th className="px-6 py-4">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.id}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded bg-slate-800 ${log.color}`}>
                                        <log.icon size={14} />
                                    </div>
                                    <span className="font-bold text-white">{log.action}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-400">{log.resource}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.ip}</td>
                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.time}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
