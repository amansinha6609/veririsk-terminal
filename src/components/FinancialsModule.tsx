import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FinancialsRepository, Report } from './FinancialsRepository';
import { FiscalReportDetail } from './FiscalReportDetail';

export const FinancialsModule: React.FC = () => {
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  return (
    <div className="h-full w-full bg-[#020617]">
      <AnimatePresence mode="wait">
        {!activeReport ? (
          <motion.div
            key="repository"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            <FinancialsRepository onSelectReport={setActiveReport} />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            <FiscalReportDetail report={activeReport} onBack={() => setActiveReport(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
