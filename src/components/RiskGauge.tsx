import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RiskGaugeProps {
  score: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s < 30) return '#10B981'; // green
    if (s < 55) return '#F59E0B'; // yellow
    if (s < 75) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const color = getColor(score);
  const strokeDasharray = `${(displayScore / 100) * 283} 283`;

  return (
    <div className="relative flex flex-col items-center justify-center w-48 h-48 mx-auto animate-fade-in">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-slate-800"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
        />
        <motion.circle
          strokeWidth="8"
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r="45"
          cx="50"
          cy="50"
          initial={{ strokeDasharray: "0 283" }}
          animate={{ strokeDasharray }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Risk Score</span>
        <span className="text-5xl font-mono font-black" style={{ color }}>{displayScore}</span>
      </div>
    </div>
  );
};
