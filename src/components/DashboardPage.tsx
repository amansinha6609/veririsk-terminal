import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  Search, Activity, Loader2, ShieldAlert, BarChart3, 
  History, Globe, Zap, Database, Terminal as TerminalIcon 
} from 'lucide-react';

interface DashboardProps { onSelectReport: (report: any) => void; }

export const DashboardPage: React.FC<DashboardProps> = ({ onSelectReport }) => {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullSummary, setFullSummary] = useState("");
  const [history, setHistory] = useState<string[]>(["Tesla", "Alphabet Inc.", "SpiceJet"]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setFullSummary("");
    let accumulatedText = "";
    let capturedScore = 44;
    let buffer = "";
    let capturedMetrics = undefined;
    let capturedChartData = undefined;

    try {
      const token = await getToken();
      const response = await fetch("http://localhost:8008/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ company_name: query }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.replace(/^data:\s*/, "").trim();
          if (!cleanLine) continue;
          try {
            const data = JSON.parse(cleanLine);
            if (data.text) {
              accumulatedText += data.text;
              setFullSummary(prev => prev + data.text);
            }
            if (data.overall_risk) capturedScore = data.overall_risk;
            if (data.metrics) capturedMetrics = data.metrics;
            if (data.chartData) capturedChartData = data.chartData;
          } catch (e) {}
        }
      }
      
      if (!history.includes(query)) setHistory([query, ...history].slice(0, 5));
      onSelectReport({
        company_name: query,
        overall_risk: capturedScore,
        summary: accumulatedText,
        metrics: capturedMetrics,
        chartData: capturedChartData
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#020202] text-slate-300 font-sans overflow-hidden">
      
      {/* --- SIDEBAR: SEARCH HISTORY --- */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-white text-xl italic">VERIRISK</span>
        </div>

        <nav className="flex flex-col gap-1">
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Recent Audits</div>
          {history.map((item, i) => (
            <button key={i} onClick={() => setQuery(item)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-white">
              <History size={14} /> {item}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 pt-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-mono">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> ENGINE_v3.1_ONLINE
            </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* TOP SEARCH BAR */}
        <header className="h-20 border-b border-white/5 flex items-center px-10 bg-[#020202]/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search entity database..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <div className="flex gap-4 ml-auto">
             <div className="flex flex-col items-end justify-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Market Status</span>
                <span className="text-xs text-white font-bold uppercase">Open // NASDAQ</span>
             </div>
          </div>
        </header>

        {/* WORKSPACE */}
        <section className="p-10 max-w-5xl mx-auto w-full">
          {!loading ? (
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 mb-8">
                    <h1 className="text-4xl font-light text-white mb-2">Welcome, <span className="font-bold text-blue-500">Forensic Lead</span></h1>
                    <p className="text-slate-500 text-sm">Initiate an entity sweep to begin risk triangulation.</p>
                </div>

                {/* KPI CARDS */}
                {[
                  { label: "Liquidity Mesh", icon: <Database size={20}/>, color: "text-blue-500" },
                  { label: "Global Presence", icon: <Globe size={20}/>, color: "text-purple-500" },
                  { label: "Neural Audit", icon: <Zap size={20}/>, color: "text-amber-500" }
                ].map((kpi, i) => (
                  <div key={i} className="col-span-4 bg-[#080808] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group">
                    <div className={`${kpi.color} mb-4 bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl`}>{kpi.icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
                    <div className="text-lg font-bold text-white tracking-tight italic uppercase">Active_Scan</div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TerminalIcon size={20} className="text-blue-500" />
                        <h2 className="text-xl font-bold text-white tracking-tight uppercase">Live Forensic Stream: {query}</h2>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono rounded-full flex items-center gap-2">
                        <Loader2 className="animate-spin" size={12}/> CAPTURING_DATA
                    </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-2xl">
                    <div className="font-mono text-sm leading-relaxed text-slate-400 whitespace-pre-wrap h-96 overflow-y-auto scrollbar-hide">
                        {fullSummary || "Initializing neural handshake with financial nodes..."}
                    </div>
                </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};