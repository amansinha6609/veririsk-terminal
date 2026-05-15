import React, { useState } from 'react';
import { 
  Search, Loader2, Database, Globe, Zap, History, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps { onSelectReport: (report: any) => void; }

export const DashboardPage: React.FC<DashboardProps> = ({ onSelectReport }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fullSummary, setFullSummary] = useState("");
  const [history, setHistory] = useState([
    { name: "Tesla, Inc.", status: "High Risk", statusColor: "text-red-500 border-red-500/20 bg-red-500/10" },
    { name: "Alphabet Inc.", status: "Cleared", statusColor: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10" },
    { name: "SpiceJet", status: "Critical", statusColor: "text-red-500 border-red-500/20 bg-red-500/10" }
  ]);

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
      // Bypassing auth logic since clerk is throwing errors
      const response = await fetch("http://localhost:8008/api/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <div className="flex flex-col h-full text-slate-300 font-sans relative">
      
      {/* MARKET TICKER TOP BAR */}
      <div className="h-8 border-b border-slate-800/50 bg-[#0B1120] overflow-hidden flex items-center absolute top-0 left-0 right-0 z-10">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="whitespace-nowrap flex items-center gap-12 text-[10px] uppercase font-mono tracking-widest text-slate-500"
        >
          <span>NASDAQ: <span className="text-[#10B981]">OPEN</span></span>
          <span>Risk Index: <span className="text-[#3B82F6]">14.2</span></span>
          <span>Global Volatility: <span className="text-red-500">ELEVATED</span></span>
          <span>VIX: 18.4</span>
          <span>SPY: 512.30</span>
          <span>TSLA: 175.22</span>
          <span>AAPL: 169.30</span>
          <span>NVDA: 880.08</span>
          <span>NASDAQ: <span className="text-[#10B981]">OPEN</span></span>
          <span>Risk Index: <span className="text-[#3B82F6]">14.2</span></span>
          <span>Global Volatility: <span className="text-red-500">ELEVATED</span></span>
          <span>VIX: 18.4</span>
          <span>SPY: 512.30</span>
        </motion.div>
      </div>

      {/* WORKSPACE */}
      <div className="p-10 max-w-5xl mx-auto w-full flex-1 flex flex-col pt-24">
        {!loading ? (
          <div className="flex flex-col items-center h-full mt-10">
              <div className="text-center mb-12">
                  <h1 className="text-5xl font-black text-white mb-4 tracking-tighter italic">Command <span className="text-[#3B82F6]">Center</span></h1>
                  <p className="text-slate-400">Initiate global entity search for precision intelligence triangulation.</p>
              </div>

              <div className="w-full max-w-2xl relative mb-16">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search entity database or enter ticker..."
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-2xl py-6 pl-16 pr-6 text-lg focus:outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/50 transition-all shadow-2xl text-white placeholder-slate-600"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400">
                    ENTER ↵
                  </kbd>
                </div>
              </div>

              {/* RECENT QUERIES */}
              <div className="w-full max-w-3xl mb-12">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <History size={16} className="text-[#3B82F6]" /> Recent Queries
                    </h3>
                    <button className="text-[10px] text-slate-500 hover:text-slate-300 uppercase tracking-widest font-bold">View All</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(item.name)}
                      className="bg-[#0B1120] border border-slate-800/80 p-5 rounded-2xl hover:border-slate-600 transition-all group flex flex-col text-left"
                    >
                      <div className="flex items-center justify-between w-full mb-4">
                         <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded border ${item.statusColor}`}>
                            {item.status}
                         </span>
                         <ChevronRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="font-bold text-white text-lg truncate w-full">{item.name}</div>
                    </button>
                  ))}
                 </div>
              </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 w-full max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <Zap size={24} className="text-[#3B82F6] animate-pulse" />
                      <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neural Triangulation: {query}</h2>
                  </div>
                  <div className="px-4 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-[10px] font-mono rounded-full flex items-center gap-2 uppercase tracking-widest">
                      <Loader2 className="animate-spin" size={14}/> Processing Handshake
                  </div>
              </div>

              <div className="bg-[#0B1120] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                  {/* Decorative Scanline */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] h-[10px] animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="font-mono text-sm leading-relaxed text-slate-400 whitespace-pre-wrap h-96 overflow-y-auto scrollbar-hide relative z-10">
                      {fullSummary || "Initializing neural handshake with financial nodes...\nEstablishing secure connection to EDGAR...\nAnalyzing liquidity markers..."}
                  </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};
