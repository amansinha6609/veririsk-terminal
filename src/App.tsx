import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useState } from "react";

// Ensure these paths match your folder structure exactly!
import { LandingPage } from "./components/LandingPage";
import { DashboardPage } from "./components/DashboardPage";
import { ReportView } from "./components/ReportView";

// Types for our Forensic Report
interface ForensicReport {
  company_name: string;
  overall_risk: number;
  summary: string;
}

export default function App() {
  // This state tracks which report is currently being viewed
  const [selectedReport, setSelectedReport] = useState<ForensicReport | null>(null);

  return (
    <main className="min-h-screen bg-[#020202] text-slate-300">
      
      {/* 1. GATEWAY: If user is not logged in, show the high-stakes Landing Page */}
      <SignedOut>
        <LandingPage />
      </SignedOut>

      {/* 2. TERMINAL: If user is logged in, show either the Dashboard or a Specific Report */}
      <SignedIn>
        <div className="animate-in fade-in duration-500">
          {selectedReport ? (
            /* VIEWING A SPECIFIC AUDIT */
            <ReportView 
              report={selectedReport} 
              onBack={() => setSelectedReport(null)} 
            />
          ) : (
            /* THE MAIN SEARCH COMMAND CENTER */
            <DashboardPage 
              onSelectReport={(report: ForensicReport) => setSelectedReport(report)} 
            />
          )}
        </div>
      </SignedIn>

    </main>
  );
}