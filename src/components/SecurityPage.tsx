import React from 'react';
import { ShieldCheck, Lock, key, Eye, RefreshCw, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export function SecurityPage() {
  const securityLogs = [
    { id: 1, event: "Gemini 3.1 Handshake", status: "Verified", time: "2 mins ago" },
    { id: 2, event: "End-to-End Encryption", status: "Active", time: "System wide" },
    { id: 3, event: "Audit Trail Snapshot", status: "Stored", time: "14 May 2026" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight mb-2">Security Protocols</h2>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">System Integrity & Audit Control</p>
      </header>

      {/* 1. HEALTH MONITOR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "SSL Encryption", val: "AES-256", icon: Lock, color: "text-green-400" },
          { label: "API Latency", val: "142ms", icon: Activity, color: "text-blue-400" },
          { label: "Database", val: "Encrypted", icon: ShieldCheck, color: "text-purple-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a192f] border border-white/5 p-6 rounded-[32px] flex items-center gap-5">
            <div className={`p-4 bg-white/5 rounded-2xl ${stat.color}`}><stat.icon size={24} /></div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. ACCESS LOGS */}
      <div className="bg-[#0a192f] border border-white/5 rounded-[40px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold">Audit Trail</h3>
          <button className="text-blue-500 hover:text-blue-400 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <RefreshCw size={14} /> Rotate Keys
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {securityLogs.map((log) => (
            <div key={log.id} className="p-6 flex justify-between items-center hover:bg-white/[0.02] transition-all">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="font-bold text-sm">{log.event}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest">{log.status}</span>
                <span className="text-xs text-gray-600 font-mono">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. COMPLIANCE BANNER */}
      <div className="p-10 rounded-[40px] bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/20 flex items-center justify-between">
        <div>
          <h4 className="text-xl font-bold mb-2">ISO 27001 Preparedness</h4>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            All AI inferences and data retrievals are processed through a stateless architecture. No financial data is retained post-session.
          </p>
        </div>
        <ShieldCheck size={80} className="text-blue-500 opacity-20" />
      </div>
    </div>
  );
}