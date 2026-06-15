import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Compass, PenTool, 
  TrendingUp, BarChart3,
  Cpu, ShieldCheck, Microscope
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

const AGENTS = [
  {
    name: "Producer",
    role: "Video Strategist",
    icon: <Zap size={32} />,
    color: "from-cyan-400 to-blue-500",
    description: "The visionary. The Producer breaks down the core topic, platform constraints, and target duration to set the strategic direction for the video.",
    capability: "Platform Targeting & Concept Extraction",
    focus: "Strategic Alignment"
  },
  {
    name: "Director",
    role: "Timeline Architect",
    icon: <Compass size={32} />,
    color: "from-blue-500 to-indigo-600",
    description: "The timeline architect. The Director designs the pacing and structure, mapping out the critical hook, B-roll sequences, and calls to action.",
    capability: "Pacing & Scene Blocking",
    focus: "Viewer Retention"
  },
  {
    name: "Screenwriter",
    role: "Core Generator",
    icon: <PenTool size={32} />,
    color: "from-indigo-500 to-purple-600",
    description: "The creative engine. The Screenwriter generates the dual-column script, providing exact visual cues and engaging audio dialogue or voice-overs.",
    capability: "Visual Cueing & Dialogue Synthesis",
    focus: "Creative Execution"
  },
  {
    name: "Auditor",
    role: "Quality Gatekeeper",
    icon: <ShieldCheck size={32} />,
    color: "from-purple-500 to-pink-600",
    description: "The retention critic. The Auditor ruthlessly reviews the script for weak hooks, pacing lulls, and unengaging visuals, flagging any risks to watch time.",
    capability: "Hook Analysis & Retention Auditing",
    focus: "Engagement Integrity"
  },
  {
    name: "Optimizer",
    role: "Script Polisher",
    icon: <TrendingUp size={32} />,
    color: "from-pink-500 to-rose-600",
    description: "The dynamic editor. The Optimizer refines the script based on the audit, tightening dialogue, enhancing visual impact, and perfecting the final hook.",
    capability: "Pacing Enhancement & Hook Polishing",
    focus: "Maximum Impact"
  },
  {
    name: "Analytics Engine",
    role: "Metric Analyst",
    icon: <BarChart3 size={32} />,
    color: "from-rose-500 to-orange-600",
    description: "The final evaluator. The Analytics Engine scores the completed script against core YouTube/TikTok metrics like visual engagement and hook strength.",
    capability: "Statistical Evaluation & Retention Prediction",
    focus: "Algorithm Optimization"
  }
];

const AgentsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground bg-grid relative selection:bg-primary/30 overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 radial-glow pointer-events-none opacity-50" />
      
      {/* Navigation */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-40 pb-32 relative z-10">
        <header className="max-w-3xl mb-24 space-y-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
              <Cpu size={12} />
              Cognitive Architecture
           </div>
           <h1 className="text-6xl xl:text-7xl font-black font-heading leading-[1] tracking-tighter">
             Meet the <br/> <span className="shimmer-text italic">Production Team</span>.
           </h1>
           <p className="text-xl text-text-dim font-medium leading-relaxed">
             The Content Agent System is not a single model. It is a synchronized orchestra of six specialized agents, each fine-tuned for a specific phase of the high-retention video production lifecycle.
           </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {AGENTS.map((agent, i) => (
            <motion.div 
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="gradient-border bg-surface/50 backdrop-blur-xl p-10 flex flex-col group hover:translate-y-[-8px] transition-all duration-500"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${agent.color} p-4 flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform duration-500`}>
                {agent.icon}
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex flex-col">
                  <h3 className="text-2xl font-black font-heading tracking-tight">{agent.name}</h3>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">{agent.role}</span>
                </div>
                <p className="text-sm text-text-dim leading-relaxed font-medium">
                  {agent.description}
                </p>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Primary Capability</span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                       <Microscope size={12} className="text-primary" />
                       {agent.capability}
                    </span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">Strategic Focus</span>
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                       <ShieldCheck size={12} className="text-primary" />
                       {agent.focus}
                    </span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-16 border-t border-border mt-20 flex flex-col md:flex-row items-center justify-between gap-12 opacity-40">
         <div className="flex items-center gap-4">
            <Zap size={20} fill="currentColor" className="text-primary" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">CONTENT AGENT SYSTEM © 2026</span>
         </div>
      </footer>
    </div>
  );
};

export default AgentsPage;
