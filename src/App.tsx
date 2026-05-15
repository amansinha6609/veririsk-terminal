import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Component Imports
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { ReportView } from "./components/ReportView";
import { Sidebar } from "./components/Sidebar";
import { SettingsPage } from "./components/SettingsPage";
import { SecurityPage } from "./components/SecurityPage";
import { AccountActivityPage } from "./components/AccountActivityPage";
import { NetworkGraphPage } from "./components/NetworkGraphPage";
import { FinancialsModule } from "./components/FinancialsModule";
import { BenchmarkingPage } from "./components/BenchmarkingPage";

// Enhanced Forensic Interface to match our Z-Score Backend
export interface ForensicReport {
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
  const [activePage, setActivePage] = useState("overview");

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-emerald-500/30">
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="flex h-screen overflow-hidden">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />

          <div className="flex-1 overflow-y-auto relative bg-[#020617]">
            <AnimatePresence mode="wait">
              {activePage === "settings" ? (
                <motion.div
                  key="settingsPage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <SettingsPage onNavigateToSecurity={() => setActivePage('security')} />
                </motion.div>
              ) : activePage === "security" ? (
                <motion.div
                  key="securityPage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="pt-16 px-8"
                >
                  <SecurityPage />
                </motion.div>
              ) : activePage === "account_activity" ? (
                <motion.div
                  key="accountActivityPage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="pt-16 px-8"
                >
                  <AccountActivityPage />
                </motion.div>
              ) : activePage === "network_graph" ? (
                <motion.div
                  key="networkGraphPage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full"
                >
                  <NetworkGraphPage />
                </motion.div>
              ) : activePage === "financials" ? (
                <motion.div
                  key="financialsModule"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full"
                >
                  <FinancialsModule />
                </motion.div>
              ) : activePage === "compare" ? (
                <motion.div
                  key="benchmarkingPage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full"
                >
                  <BenchmarkingPage report={selectedReport} />
                </motion.div>
              ) : activePage === "overview" && selectedReport ? (
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
                /* THE MAIN SEARCH COMMAND CENTER OR PLACEHOLDERS */
                <motion.div
                  key="dashboardPage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full"
                >
                  {activePage === "overview" ? (
                    <DashboardPage
                      onSelectReport={(report: ForensicReport) => setSelectedReport(report)}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                      {activePage.replace('_', ' ').toUpperCase()} View Under Construction
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SignedIn>
    </main>
  );
}