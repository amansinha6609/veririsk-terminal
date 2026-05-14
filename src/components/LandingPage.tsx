import React from 'react';
import { ShieldAlert, ChevronRight, Activity, Database, Lock, Globe } from 'lucide-react';
import { SignInButton } from '@clerk/clerk-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-sans selection:bg-blue-500/30 overflow-hidden relative">
      
      {/* --- BACKGROUND ARCHITECTURE --- */}
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* --- NAVIGATION --- */}
      <nav className="flex justify-between items-center px-10 py-8 relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <span className="font-black tracking-tighter text-white text-2xl italic">VERIRISK</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-mono">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Node: SG-01</span>
            <span>Uptime: 99.9%</span>
          </div>
          <SignInButton mode="modal">
            <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              ACCESS TERMINAL
            </button>
          </SignInButton>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 pt-32 pb-20 px-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono tracking-widest uppercase mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
             Institutional Risk Audit Engine v3.1
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9] italic">
            EXPOSE THE <br />
            <span className="bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500 bg-clip-text text-transparent bg-[size:200%_auto] animate-gradient-x">INVISIBLE RISK.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-light mb-12 leading-relaxed">
            Forensic analysis meets neural processing. Triangulate insolvency, audit qualifications, and liquidity gaps in 2.4 seconds. 
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <SignInButton mode="modal">
                <button className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] active:scale-95">
                START AUDIT SWEEP <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </SignInButton>
            <button className="px-10 py-5 rounded-2xl font-bold border border-white/10 hover:bg-white/5 transition-all text-sm">
                VIEW DOCUMENTATION
            </button>
          </div>
        </div>
      </main>

      {/* --- FEATURE TERMINAL GRID --- */}
      <section className="px-10 pb-32 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {[
            { 
              title: "Solvency Mesh", 
              desc: "Deep-layer debt analysis across all reported balance sheet nodes.",
              icon: <Database className="text-blue-500" size={24} />
            },
            { 
              title: "Qualified Audit detection", 
              desc: "Real-time extraction of material uncertainties from auditor opinions.",
              icon: <Lock className="text-emerald-500" size={24} />
            },
            { 
              title: "Global Entity Index", 
              desc: "Instant access to 45M+ corporate profiles with historical risk scoring.",
              icon: <Globe className="text-purple-500" size={24} />
            }
          ].map((feature, i) => (
            <div key={i} className="bg-[#050505] p-12 hover:bg-[#080808] transition-colors group">
              <div className="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">{feature.icon}</div>
              <h3 className="text-white font-bold text-xl mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* --- LIVE SYSTEM STATUS BAR --- */}
        <div className="mt-20 max-w-4xl mx-auto bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex flex-wrap justify-center gap-12">
            <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Neural Handshake</span>
                <span className="text-sm text-blue-400 font-bold">STABLE</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10 pl-12">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Processing Latency</span>
                <span className="text-sm text-white font-bold">142ms</span>
            </div>
            <div className="flex flex-col items-center border-l border-white/10 pl-12">
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">Active Nodes</span>
                <span className="text-sm text-white font-bold">1,024</span>
            </div>
        </div>
      </section>

      {/* --- DECORATIVE GLOW --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
    </div>
  );
};