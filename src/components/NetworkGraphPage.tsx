import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Share2, Download, Search, Maximize } from 'lucide-react';

export function NetworkGraphPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const gData = {
    nodes: [
      { id: "Tesla", group: 1, val: 20, color: "#3B82F6" },
      { id: "Elon Musk", group: 2, val: 10, color: "#10B981" },
      { id: "SpaceX", group: 1, val: 15, color: "#3B82F6" },
      { id: "Twitter", group: 1, val: 15, color: "#3B82F6" },
      { id: "SolarCity", group: 1, val: 10, color: "#3B82F6" },
      { id: "Panasonic", group: 3, val: 8, color: "#8b5cf6" },
      { id: "SEC", group: 4, val: 12, color: "#ef4444" },
      { id: "Gigafactory Texas", group: 5, val: 5, color: "#f59e0b" },
      { id: "Gigafactory Berlin", group: 5, val: 5, color: "#f59e0b" }
    ],
    links: [
      { source: "Elon Musk", target: "Tesla", value: 5 },
      { source: "Elon Musk", target: "SpaceX", value: 5 },
      { source: "Elon Musk", target: "Twitter", value: 5 },
      { source: "Tesla", target: "SolarCity", value: 3 },
      { source: "Tesla", target: "Panasonic", value: 2 },
      { source: "SEC", target: "Tesla", value: 4 },
      { source: "SEC", target: "Elon Musk", value: 4 },
      { source: "Tesla", target: "Gigafactory Texas", value: 2 },
      { source: "Tesla", target: "Gigafactory Berlin", value: 2 }
    ]
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] text-slate-300 font-sans">
      <header className="px-10 py-8 border-b border-slate-800/50 bg-[#0B1120] flex items-center justify-between z-10 relative">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic mb-1">Entity <span className="text-[#3B82F6]">Network</span></h2>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Visualizing corporate relationships and risk propagation.</p>
        </div>
        <div className="flex gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                    type="text"
                    placeholder="Find node..."
                    className="w-48 bg-[#020617] border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-[#3B82F6]/50 transition-colors"
                />
            </div>
            <button className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
              <Share2 size={16} />
            </button>
            <button className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
              <Download size={16} />
            </button>
            <button className="p-2 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
              <Maximize size={16} />
            </button>
        </div>
      </header>

      <div className="flex-1 relative" ref={containerRef}>
        {/* Background Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>

        <div className="absolute inset-0 z-10">
            {typeof window !== 'undefined' && dimensions.width > 0 && (
                <ForceGraph2D
                    width={dimensions.width}
                    height={dimensions.height}
                    graphData={gData}
                    nodeLabel="id"
                    nodeAutoColorBy="group"
                    nodeColor={node => node.color}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleSpeed={d => d.value * 0.001}
                    linkColor={() => '#334155'}
                    backgroundColor="#020617"
                />
            )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-10 left-10 z-20 bg-[#0B1120] border border-slate-800/50 p-4 rounded-xl shadow-2xl">
            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold">Node Typology</h4>
            <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div><span className="text-xs text-slate-400">Corporate Entity</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#10B981]"></div><span className="text-xs text-slate-400">Key Executive</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div><span className="text-xs text-slate-400">Regulatory Body</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div><span className="text-xs text-slate-400">Physical Asset</span></div>
            </div>
        </div>
      </div>
    </div>
  );
}
