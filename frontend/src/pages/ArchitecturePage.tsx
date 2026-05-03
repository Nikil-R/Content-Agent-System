import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Cpu, 
  Network, Share2, Terminal,
  Workflow, ShieldCheck, Activity, Layers, Server
} from 'lucide-react';
import { Navbar } from '../components/Navbar';

const TECH_STACK = [
  { name: "FastAPI", role: "Orchestration Gateway", desc: "High-performance Python framework handling real-time routing and task submission.", icon: <Zap className="text-cyan-400" /> },
  { name: "Celery", role: "Async Distributed Task Queue", desc: "Manages the execution of specialized agent workflows across isolated workers.", icon: <Workflow className="text-blue-400" /> },
  { name: "Redis", role: "Message Broker & State Store", desc: "Ultra-fast in-memory data store for inter-agent communication and task state.", icon: <Share2 className="text-rose-400" /> },
  { name: "React 19", role: "Mission Control UI", desc: "State-of-the-art frontend utilizing Tailwind CSS v4 and Framer Motion for high-fidelity visualization.", icon: <Layers className="text-emerald-400" /> }
];

const ArchitecturePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground bg-grid relative selection:bg-primary/30 overflow-x-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 radial-glow pointer-events-none opacity-50" />
      
      {/* Navigation */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-40 pb-32 relative z-10">
        <header className="max-w-3xl mb-24 space-y-8">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
              <Network size={12} />
              Architecture & Protocol
           </div>
           <h1 className="text-6xl xl:text-7xl font-black font-heading leading-[1] tracking-tighter">
             The <span className="shimmer-text italic">Distributed Intelligence</span> Protocol.
           </h1>
           <p className="text-xl text-text-dim font-medium leading-relaxed">
             The Content Agent System is built on a distributed agentic framework that prioritizes asynchronous execution, state isolation, and collaborative synthesis.
           </p>
        </header>

        {/* Core Stack Grid */}
        <section className="mb-32">
          <div className="flex items-center justify-between mb-12">
             <h2 className="text-sm font-black uppercase tracking-[0.4em] text-text-muted">Foundational Infrastructure</h2>
             <div className="flex items-center gap-4 px-4 py-2 bg-surface rounded-xl border border-border">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-success">6 Nodes Active</span>
                </div>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {TECH_STACK.map((tech, i) => (
              <motion.div 
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-surface/40 border border-border rounded-3xl hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 bg-background border border-border rounded-xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  {tech.icon}
                </div>
                <h3 className="text-lg font-black font-heading mb-1">{tech.name}</h3>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4">{tech.role}</div>
                <p className="text-sm text-text-muted font-medium leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Worker Nodes Visual Grid */}
        <section className="mb-32">
           <h2 className="text-sm font-black uppercase tracking-[0.4em] text-text-muted mb-12">Distributed Worker Swarm</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((node) => (
                 <div key={node} className="bg-surface/30 border border-border p-6 rounded-2xl flex flex-col items-center gap-4 group hover:border-primary/30 transition-all">
                    <div className="relative">
                       <motion.div 
                          className="absolute -inset-2 bg-success/20 rounded-full blur-md"
                          animate={{ opacity: [0.1, 0.4, 0.1] }}
                          transition={{ repeat: Infinity, duration: 2 + node }}
                       />
                       <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center relative z-10">
                          <Server size={16} className="text-success" />
                       </div>
                    </div>
                    <div className="text-center">
                       <div className="text-[10px] font-black uppercase tracking-widest text-foreground">Node-0{node}</div>
                       <div className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Status: Ready</div>
                    </div>
                 </div>
              ))}
           </div>
        </section>

        {/* Data Flow Diagram Area */}
        <section className="mb-32">
           <div className="gradient-border bg-background p-16 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                 <Activity size={300} />
              </div>
              <div className="max-w-3xl relative z-10 space-y-12">
                 <div className="space-y-4">
                    <h2 className="text-4xl font-black font-heading tracking-tight">The "Shared State" Pipeline</h2>
                    <p className="text-lg text-text-dim font-medium leading-relaxed">
                      Unlike traditional linear scripts, the Content Agent System agents communicate via a centralized <strong>SharedState</strong> schema. This allows for non-destructive, additive intelligence gathering where each agent validates the previous one's output before contributing.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 gap-12">
                    <div className="flex gap-8 items-start">
                       <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                          <Terminal size={20} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-bold font-heading">1. Directive Ingestion</h4>
                          <p className="text-sm text-text-muted leading-relaxed">User prompts are validated by FastAPI and converted into a Task UUID. A blank <code>SharedState</code> object is initialized in Redis.</p>
                       </div>
                    </div>

                    <div className="flex gap-8 items-start">
                       <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 shrink-0">
                          <Cpu size={20} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-bold font-heading">2. Distributed Execution</h4>
                          <p className="text-sm text-text-muted leading-relaxed">Celery workers pull the task and route it through the 6 specialized agents. Each agent performs its cognitive function and updates the state in Redis.</p>
                       </div>
                    </div>

                    <div className="flex gap-8 items-start">
                       <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 shrink-0">
                          <ShieldCheck size={20} />
                       </div>
                       <div className="space-y-2">
                          <h4 className="text-xl font-bold font-heading">3. Metric Validation</h4>
                          <p className="text-sm text-text-muted leading-relaxed">The final Judge agent performs a statistical audit. Once metrics clear the threshold, the state is marked as <code>COMPLETED</code> and pushed to the UI via Webhooks.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* Architectural Trade-offs */}
        <section className="mb-32">
           <h2 className="text-sm font-black uppercase tracking-[0.4em] text-text-muted mb-12">Strategic Engineering Decisions</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                 <h4 className="text-lg font-black font-heading text-primary">Decoupled Execution</h4>
                 <p className="text-sm text-text-dim leading-relaxed">
                   <strong>Choice:</strong> Celery/Redis over simple FastAPI async tasks. <br/><br/>
                   <strong>Rationale:</strong> LLM synthesis is compute-heavy. Decoupling the execution layer ensures the web server remains responsive even when processing high-density assets.
                 </p>
              </div>
              <div className="space-y-4">
                 <h4 className="text-lg font-black font-heading text-blue-400">Additive State Machine</h4>
                 <p className="text-sm text-text-dim leading-relaxed">
                   <strong>Choice:</strong> Shared JSON state over linear variable passing. <br/><br/>
                   <strong>Rationale:</strong> Allows for non-destructive auditing. If the 'Refiner' agent fails, we still have the 'Scribe' output preserved in Redis for easy recovery.
                 </p>
              </div>
              <div className="space-y-4">
                 <h4 className="text-lg font-black font-heading text-emerald-400">Cognitive Specialization</h4>
                 <p className="text-sm text-text-dim leading-relaxed">
                   <strong>Choice:</strong> 6 specialized agents over 1 generic agent. <br/><br/>
                   <strong>Rationale:</strong> Higher prompt-to-output accuracy. By limiting each agent's scope (e.g., just grammar or just planning), we reduce hallucination rates.
                 </p>
              </div>
           </div>
        </section>

        {/* Why this matters */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl font-black font-heading tracking-tight leading-none">Engineering <br/> Excellence.</h2>
              <p className="text-xl text-text-dim font-medium leading-relaxed">
                This architecture was designed to simulate a high-performance R&D environment. By decoupling the UI from the execution layer, we ensure the system is resilient to network latency and capable of handling long-running cognitive tasks without blocking the main thread.
              </p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="p-8 bg-surface/50 border border-border rounded-3xl text-center space-y-2">
                 <div className="text-4xl font-black text-primary">0%</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">UI Blocking</div>
              </div>
              <div className="p-8 bg-surface/50 border border-border rounded-3xl text-center space-y-2">
                 <div className="text-4xl font-black text-blue-400">6</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cognitive Nodes</div>
              </div>
              <div className="p-8 bg-surface/50 border border-border rounded-3xl text-center space-y-2">
                 <div className="text-4xl font-black text-emerald-400">∞</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Scalability</div>
              </div>
              <div className="p-8 bg-surface/50 border border-border rounded-3xl text-center space-y-2">
                 <div className="text-4xl font-black text-rose-400">JSON</div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Unified State</div>
              </div>
           </div>
        </section>
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

export default ArchitecturePage;
