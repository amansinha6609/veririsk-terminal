import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
      
        <AnimatePresence mode="wait">
          {selectedReport ? (
            /* VIEWING A SPECIFIC AUDIT */
            <motion.div
              key="reportView"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <ReportView
                report={selectedReport}
                onBack={() => setSelectedReport(null)}
              />
            </motion.div>
          ) : (
            /* THE MAIN SEARCH COMMAND CENTER */
            <motion.div
              key="dashboardPage"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <DashboardPage
                onSelectReport={(report: ForensicReport) => setSelectedReport(report)}
              />
            </motion.div>
          )}
        </AnimatePresence>
    </main>
  );
}