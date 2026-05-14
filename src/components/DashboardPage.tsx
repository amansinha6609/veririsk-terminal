import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { 
  Search, Activity, Loader2, ShieldAlert, BarChart3, 
  History, Globe, Zap, Database, Terminal as TerminalIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps { onSelectReport: (report: any) => void; }

export const DashboardPage: React.FC<DashboardProps> = ({ onSelectReport }) => {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullSummary, setFullSummary] = useState("");
  const [history, setHistory] = useState<string[]>(["Tesla", "Alphabet Inc.", "SpiceJet"]);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q) return;
    if (searchQuery) setQuery(searchQuery);
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
        body: JSON.stringify({ company_name: q }),
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
      
      if (!history.includes(q)) setHistory([q, ...history].slice(0, 5));
      onSelectReport({
        company_name: q,
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
            <button key={i} onClick={() => handleSearch(item)} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-white">
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
      <main className="flex-1 flex flex-col overflow-y-auto relative">
        
        {/* MARKET TICKER TOP BAR */}
        <div className="h-8 border-b border-white/5 bg-[#050505] overflow-hidden flex items-center">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-12 text-[10px] uppercase font-mono tracking-widest text-slate-500"
          >
            <span>NASDAQ: <span className="text-emerald-500">OPEN</span></span>
            <span>Risk Index: <span className="text-blue-500">14.2</span></span>
            <span>Global Volatility: <span className="text-red-500">ELEVATED</span></span>
            <span>VIX: 18.4</span>
            <span>SPY: 512.30</span>
            <span>TSLA: 175.22</span>
            <span>AAPL: 169.30</span>
            <span>NVDA: 880.08</span>
            <span>NASDAQ: <span className="text-emerald-500">OPEN</span></span>
            <span>Risk Index: <span className="text-blue-500">14.2</span></span>
            <span>Global Volatility: <span className="text-red-500">ELEVATED</span></span>
            <span>VIX: 18.4</span>
            <span>SPY: 512.30</span>
          </motion.div>
        </div>

        {/* WORKSPACE */}
        <section className="p-10 max-w-5xl mx-auto w-full flex-1 flex flex-col">
          {!loading ? (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-light text-white mb-4">Bloomberg <span className="font-bold text-blue-500">Terminal</span></h1>
                    <p className="text-slate-500 text-sm">Enter entity name or ticker to begin neural triangulation.</p>
                </div>

                <div className="w-full max-w-3xl relative mb-16">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={24} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search entity database..."
                    className="w-full bg-[#050505] border border-white/10 rounded-full py-5 pl-16 pr-6 text-lg focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-2xl"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-500">
                      ENTER ↵
                    </kbd>
                  </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                {/* KPI CARDS */}
                {[
                  { label: "Liquidity Mesh", icon: <Database size={20}/>, color: "text-blue-500" },
                  { label: "Global Presence", icon: <Globe size={20}/>, color: "text-purple-500" },
                  { label: "Neural Audit", icon: <Zap size={20}/>, color: "text-amber-500" }
                ].map((kpi, i) => (
                  <div key={i} className="bg-[#080808] border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group w-full">
                    <div className={`${kpi.color} mb-4 bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl`}>{kpi.icon}</div>
                    <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
                    <div className="text-lg font-bold text-white tracking-tight italic uppercase">Active_Scan</div>
                  </div>
                ))}
                </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
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