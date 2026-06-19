import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { ModuleStream } from './ModuleStream';
import { RiskGauge } from './RiskGauge';
import { MetricsGrid } from './MetricsGrid';
import { SolvencyChart } from './SolvencyChart';
import { VelocityChart } from './VelocityChart';
import { VerdictBanner } from './VerdictBanner';
import { ReportHistory } from './ReportHistory';
import { useAudit } from '../hooks/useAudit';
import { ModuleState } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    modules,
    overallRisk,
    metrics,
    chartData,
    verdict,
    isStreaming,
    error,
    initiateAudit
  } = useAudit();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSearch = async (companyName: string) => {
    await initiateAudit(companyName);
    setRefreshTrigger(prev => prev + 1);
  };

  const hasStarted = modules.size > 0;
  const isComplete = !isStreaming && hasStarted && !error;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] text-slate-300 font-sans relative overflow-y-auto terminal-scroll">
      
      {/* MARKET TICKER TOP BAR */}
      <div className="h-8 border-b border-slate-800 bg-[#0a0a0f] overflow-hidden flex items-center absolute top-0 left-0 right-0 z-10">
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
        </motion.div>
      </div>

      <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col pt-20 pb-20 gap-8">

        {/* HEADER & SEARCH */}
        <div className="flex flex-col items-center mb-8">
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
                VeriRisk <span className="text-emerald-500">Terminal</span>
            </h1>
            <p className="text-slate-400 mb-8 font-mono text-sm">Institutional Forensic Risk Intelligence Engine.</p>
            <SearchBar onSearch={handleSearch} disabled={isStreaming} />
            {error && (
               <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-mono text-center max-w-2xl">
                 {error}
               </div>
            )}
        </div>

        {/* MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

           <div className="col-span-1 lg:col-span-3 flex flex-col gap-8">
              {/* STREAMS */}
              <AnimatePresence>
                 {hasStarted && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                     className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                   >
                     {Array.from(modules.values()).map((mod: ModuleState) => (
                        <ModuleStream key={mod.id} module={mod} />
                     ))}
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* POST-STREAM RESULTS */}
              <AnimatePresence>
                 {isComplete && overallRisk !== null && metrics && chartData && verdict && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="flex flex-col gap-8">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                          <div className="scanline"></div>
                          <div className="relative z-10 flex flex-col items-center">
                             <RiskGauge score={overallRisk} />
                          </div>
                      </div>

                      <MetricsGrid metrics={metrics} />

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                         <SolvencyChart data={chartData.solvency} />
                         <VelocityChart data={chartData.velocity} />
                      </div>

                      <VerdictBanner verdict={verdict} score={overallRisk} />
                   </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* RIGHT SIDEBAR - HISTORY */}
           <div className="col-span-1">
               <ReportHistory onSelectReport={handleSearch} refreshTrigger={refreshTrigger} />
           </div>

        </div>
      </div>
    </div>
  );
};
