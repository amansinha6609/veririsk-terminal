import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

// Component Imports
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { ReportView } from "./components/ReportView";

// Enhanced Forensic Interface to match our Z-Score Backend
interface ForensicReport {
  company_name: string;
  overall_risk: number;
  summary: string;
  metrics: {
    debt_to_equity: number;
    current_ratio: number;
    altman_z_score: number;
    interest_coverage: number;
  };
  chartData: {
    solvency: Array<{ quarter: string; debt: number; cash: number }>;
    velocity: Array<{ time: string; risk: number }>;
  };
}

export default function App() {
  const [selectedReport, setSelectedReport] = useState<ForensicReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Transition Effect: Simulates 'Neural Linking' when a report is selected
  useEffect(() => {
    if (selectedReport) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => setIsAnalyzing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [selectedReport]);

  return (
    <main className="min-h-screen bg-[#020202] text-slate-300 font-mono selection:bg-emerald-500/30">
      
      {/* 1. PUBLIC GATEWAY */}
      <SignedOut>
        <LandingPage />
      </SignedOut>

      {/* 2. INSTITUTIONAL TERMINAL */}
      <SignedIn>
        {/* Persistent Forensic Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xs font-bold tracking-[0.2em] text-white uppercase">
                Veririsk // Forensic Terminal v3.1
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest hidden md:inline">
                Status: Operational // Node-04
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {isAnalyzing ? (
            /* ANALYZER TRANSITION SCREEN */
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.3em] text-emerald-500">
                Triangulating Solvency Data...
              </p>
            </div>
          ) : selectedReport ? (
            /* ACTIVE AUDIT VIEW */
            <div className="animate-in slide-in-from-bottom-4 duration-700">
              <ReportView 
                report={selectedReport} 
                onBack={() => setSelectedReport(null)} 
              />
            </div>
          ) : (
            /* COMMAND CENTER (DASHBOARD) */
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <DashboardPage 
                onSelectReport={(report: ForensicReport) => setSelectedReport(report)} 
              />
            </div>
          )}
        </div>

        {/* Forensic Footer */}
        <footer className="fixed bottom-4 left-6 pointer-events-none">
          <p className="text-[9px] text-slate-600 uppercase tracking-tighter">
            System encrypted // End-to-end Audit Log active
          </p>
        </footer>
      </SignedIn>

    </main>
  );
}