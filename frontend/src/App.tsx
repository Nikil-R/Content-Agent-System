import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { PipelineStepper } from './components/PipelineStepper';
import { NeuralBackground } from './components/NeuralBackground';
import { RadarChart } from './components/RadarChart';
import { 
  Zap, Download, Loader2, Sparkles, 
  Terminal as TerminalIcon, CheckCircle2, Brain, 
  Layers, Workflow, Target, Activity, Server, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AgentsPage from './pages/AgentsPage';
import ArchitecturePage from './pages/ArchitecturePage';
import { tacticalAudio } from './utils/audio';
import { History as HistoryIcon, X, Clock, ArrowRight } from 'lucide-react';
import { Navbar } from './components/Navbar';

const API_BASE = "http://localhost:8000";

interface LogEntry {
  timestamp: string;
  agent: string;
  message: string;
  level: string;
}

interface SharedState {
  task_id: string;
  current_stage: string;
  logs: LogEntry[];
  outline?: {
    title: string;
    sections: Array<{ title: string; description: string; estimated_word_count: number }>;
  };
  final_output?: {
    content: string;
    format: string;
    metadata: Record<string, string>;
  };
  evaluation_results?: Record<string, number>;
}

interface HistoryItem {
  task_id: string;
  prompt: string;
  status: string;
  created_at: string;
}


const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [state, setState] = useState<SharedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  // Load History
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state?.logs]);

  // WebSocket Connection
  useEffect(() => {
    if (taskId && loading) {
      // Connect to WebSocket
      const socket = new WebSocket(`ws://localhost:8000/ws/${taskId}`);
      ws.current = socket;

      socket.onopen = () => {
        console.log("WebSocket Connected");
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'status_update') {
          const newState = message.data.meta;
          
          // Sound trigger on stage change
          if (newState.current_stage !== state?.current_stage) {
            tacticalAudio.playChirp();
          }

          setState(newState);
          
          if (newState.current_stage === 'completed') {
            setLoading(false);
            tacticalAudio.playSuccess();
            fetchHistory(); // Refresh history after completion
            socket.close();
          }
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error", err);
        setLoading(false);
      };

      socket.onclose = () => {
        console.log("WebSocket Disconnected");
      };

      return () => {
        socket.close();
      };
    }
  }, [taskId, loading, state?.current_stage]);

  // Scribe Streaming Effect
  useEffect(() => {
    if (state?.final_output?.content) {
      const fullContent = state.final_output.content;
      
      // Only start if not already started for this content
      if (streamedContent === "") {
        const timer = setInterval(() => {
          setStreamedContent((prev) => {
            const next = fullContent.slice(0, prev.length + 10);
            if (next.length >= fullContent.length) clearInterval(timer);
            return next;
          });
        }, 10);
        return () => clearInterval(timer);
      }
    }
  }, [state?.final_output?.content, streamedContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setTaskId(null);
    setState(null);
    setStreamedContent("");
    
    try {
      const res = await axios.post(`${API_BASE}/generate`, { prompt, format: 'markdown' });
      setTaskId(res.data.task_id);
    } catch (err) {
      console.error("Pipeline initiation failed", err);
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    window.print();
  };

  const currentStage = state?.current_stage || "parser";

  return (
    <div className="min-h-screen bg-background text-foreground bg-grid relative selection:bg-primary/30">
      <div className="print:hidden">
        <NeuralBackground />
        <div className="fixed inset-0 radial-glow pointer-events-none" />
      </div>

      {/* Navigation */}
      <Navbar onHistoryClick={() => setIsHistoryOpen(true)} />

      <main className="max-w-7xl mx-auto px-8 pt-32 pb-20 relative z-10">
        
        {/* Hero Section */}
        <section className="mb-12 space-y-12 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                <Brain size={12} />
                Autonomous Intellectual Asset Synthesis
              </div>
              <h1 className="text-6xl xl:text-7xl font-black font-heading leading-[1] tracking-tighter">
                The Future of <br/> <span className="shimmer-text italic">Agentic Output</span>.
              </h1>
              <p className="text-xl text-text-dim max-w-2xl font-medium leading-relaxed">
                Orion is an autonomous orchestration layer that synchronizes multiple specialized LLM agents into a high-density intelligence pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {[
                 { icon: <Target size={14} />, label: "Goal-Oriented", desc: "Precision directives" },
                 { icon: <Workflow size={14} />, label: "Pipeline-Driven", desc: "Sequential processing" },
                 { icon: <Layers size={14} />, label: "Multi-Agent", desc: "Collaborative swarms" },
                 { icon: <Zap size={14} />, label: "Neural Speed", desc: "Sub-second inference" }
               ].map((item, i) => (
                 <div key={i} className="p-6 bg-surface/50 border border-border rounded-2xl space-y-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">{item.icon}</div>
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-widest text-foreground">{item.label}</div>
                      <div className="text-[10px] text-text-muted font-bold">{item.desc}</div>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          <div className="gradient-border p-8 bg-surface/50 backdrop-blur-xl">
             <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                   <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Live Neural Orchestration</h2>
                   <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </div>
                <div className="px-4 py-1.5 bg-primary/10 rounded-full text-[10px] font-black text-primary border border-primary/20">v2.0.4-LUMINA</div>
             </div>
             <PipelineStepper currentStage={currentStage} isProcessing={loading} />
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-12">
          
          {/* Sidebar */}
          <aside className="space-y-12">
            
            {/* Command Card */}
            <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                 <Zap size={120} fill="currentColor" />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <TerminalIcon size={18} className="text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest">Neural Command</h3>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the intellectual asset to synthesize..."
                    className="w-full bg-background/50 border border-border rounded-2xl p-6 min-h-[180px] focus:border-primary outline-none transition-all resize-none text-base font-medium placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    disabled={loading || !prompt}
                    className="w-full btn-glow py-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={16} fill="currentColor" />}
                    Ignite Synthesis
                  </button>
                </form>
              </div>
            </div>

            {/* Neural Log Stream */}
            <div className="bg-[#010409] border border-border rounded-3xl overflow-hidden h-[360px] flex flex-col shadow-inner">
              <div className="px-6 py-4 bg-surface/30 border-b border-border flex items-center justify-between backdrop-blur-md">
                <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                   Stream_Output.raw
                </span>
              </div>
              <div ref={scrollRef} className="p-8 flex-1 overflow-y-auto font-mono text-[12px] text-text-muted leading-relaxed scrollbar-hide">
                {state?.logs?.map((log, i) => (
                  <div key={i} className="mb-3 border-l-2 border-primary/10 pl-4 py-1 hover:bg-white/[0.02] transition-colors">
                    <span className="text-primary/40 font-bold tracking-tighter">[{log.timestamp.split(' ')[1]}]</span> <br/>
                    <span className="text-foreground/80 font-black uppercase tracking-widest mr-2">{log.agent}:</span> 
                    <span className="text-text-dim">{log.message}</span>
                  </div>
                )) || (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                     <TerminalIcon size={48} className="mb-4" />
                     <p className="font-mono uppercase tracking-widest">Awaiting Link</p>
                  </div>
                )}
              </div>
            </div>

          </aside>

          {/* Viewer Area */}
          <div className="min-h-[800px] pb-40">
            <AnimatePresence mode="wait">
              {state?.final_output ? (
                <motion.div key="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="flex justify-end print:hidden">
                    <button 
                      onClick={downloadPDF} 
                      className="flex items-center gap-4 px-8 py-4 bg-primary text-white hover:brightness-110 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                    >
                        <Download size={18} />
                        Export Intel PDF
                    </button>
                  </div>

                  <div id="print-area" ref={contentRef} className="space-y-12 bg-background p-8 rounded-[4rem] print:p-0 print:m-0">
                    {/* Radar Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">
                       <div className="bg-surface border border-border p-10 rounded-3xl flex items-center justify-center">
                          <RadarChart data={state.evaluation_results || {}} />
                       </div>
                       <div className="space-y-4">
                          {state.evaluation_results && Object.entries(state.evaluation_results).map(([key, value]) => (
                             <div key={key} className="bg-surface border border-border p-5 rounded-2xl flex items-center justify-between">
                                <span className="text-[12px] font-black uppercase tracking-widest text-text-muted">{key.replace('_', ' ')}</span>
                                <span className="text-xl font-black font-heading text-primary">{value}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* Intelligence Asset Card */}
                    <div className="bg-surface border border-border rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] relative bg-background">
                      <div className="h-2 w-full bg-gradient-to-r from-primary via-blue-500 to-purple-600" />
                      <div className="p-16 md:p-24 lg:p-32">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
                          <div className="space-y-6">
                             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-success-dim border border-success/20 rounded-full text-success text-[10px] font-black uppercase tracking-widest">
                               <CheckCircle2 size={12} />
                               Intelligence Synthesis Verified
                             </div>
                             <h2 className="text-5xl md:text-6xl font-black font-heading tracking-tighter italic leading-[1.1] max-w-2xl">The Architect <br/> Intelligence Asset</h2>
                          </div>
                        </div>

                      <article className="prose prose-invert max-w-none prose-xl">
                         <div className="whitespace-pre-wrap text-text-dim/90 text-xl leading-[1.8] font-medium font-body first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left">
                           {streamedContent}
                           {streamedContent.length < (state?.final_output?.content?.length || 0) && (
                             <motion.span 
                               animate={{ opacity: [1, 0] }}
                               transition={{ repeat: Infinity, duration: 0.5 }}
                               className="inline-block w-2 h-8 bg-primary ml-1 translate-y-1"
                             />
                           )}
                         </div>
                      </article>

                      <div className="mt-32 pt-12 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">
                        <div>Orion Neural Engine // Asset-{taskId?.slice(0, 8)}</div>
                        <div>Generated {new Date().toLocaleDateString()} // Confidential</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-24 print:hidden">
                   
                   {/* Centered Empty State */}
                   <div className="flex flex-col items-center justify-center text-center pt-12">
                      <div className="relative mb-16 group">
                         <div className="absolute inset-0 bg-primary blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                         <div className="w-48 h-48 bg-surface rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border border-border relative z-10 hover:rotate-3 transition-transform">
                            <Sparkles size={80} className="text-primary" />
                         </div>
                      </div>
                      <div className="max-w-2xl space-y-8">
                         <h2 className="text-4xl md:text-5xl font-black font-heading uppercase italic tracking-tighter leading-none">Awaiting Neural Sequence.</h2>
                         <p className="text-text-dim text-xl font-medium leading-relaxed">
                            Input a directive to activate the Orion swarm. Our agents will collaboratively synthesize high-fidelity intellectual assets through multi-stage peer refinement.
                         </p>
                      </div>
                   </div>

                   {/* Protocol Overview */}
                   <div id="about" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {[
                        { title: "Agentic Swarms", icon: <Brain />, desc: "Multiple specialized agents work in sequence to ensure depth and factual integrity." },
                        { title: "Neural Synthesis", icon: <Zap />, desc: "Advanced semantic processing transforms complex briefs into structured narratives." },
                        { title: "Metric Validation", icon: <Target />, desc: "Every output is automatically graded against benchmarks for factual and tonal accuracy." }
                      ].map((box, i) => (
                        <div key={i} className="bg-surface/50 border border-border p-10 rounded-[2.5rem] space-y-6 hover:-translate-y-2 transition-transform">
                           <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                              {box.icon}
                           </div>
                           <h3 className="text-sm font-black uppercase tracking-widest leading-none">{box.title}</h3>
                           <p className="text-xs text-text-muted font-medium leading-relaxed">{box.desc}</p>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-8 py-16 border-t border-border mt-20 print:hidden">
         <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-4 opacity-40">
               <Zap size={20} fill="currentColor" className="text-primary" />
               <span className="text-xs font-black uppercase tracking-[0.3em]">ORION NEURAL ENGINE © 2026</span>
            </div>
            
            <div className="flex items-center gap-8 bg-surface/50 px-6 py-3 rounded-2xl border border-border">
               <div className="flex items-center gap-2">
                  <Activity size={14} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Latency: <span className="text-foreground">84ms</span></span>
               </div>
               <div className="w-[1px] h-4 bg-border" />
               <div className="flex items-center gap-2">
                  <Server size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Workers: <span className="text-foreground">6 Active</span></span>
               </div>
               <div className="w-[1px] h-4 bg-border" />
               <div className="flex items-center gap-2">
                  <Database size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">Broker: <span className="text-foreground">Redis-Secure</span></span>
               </div>
            </div>

            <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-text-muted">
               <span className="px-2 py-1 bg-success/10 text-success rounded border border-success/20">System Stable</span>
            </div>
         </div>
      </footer>
      {/* History Sidebar */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[400px] bg-surface border-l border-border z-[101] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-3">
                    <HistoryIcon className="text-primary" size={20} />
                    <h3 className="text-sm font-black uppercase tracking-widest">Intelligence Archive</h3>
                 </div>
                 <button onClick={() => setIsHistoryOpen(false)} className="hover:text-primary transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 scrollbar-hide">
                 {history.length > 0 ? history.map((item) => (
                    <button
                      key={item.task_id}
                      onClick={async () => {
                         setLoading(true);
                         const res = await axios.get(`${API_BASE}/status/${item.task_id}`);
                         setState(res.data.meta);
                         setStreamedContent(res.data.meta.final_output.content);
                         setTaskId(item.task_id);
                         setLoading(false);
                         setIsHistoryOpen(false);
                         tacticalAudio.playPulse();
                      }}
                      className="w-full text-left p-6 bg-background/50 border border-border rounded-2xl hover:border-primary/30 transition-all group"
                    >
                       <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-text-muted">
                             <Clock size={12} />
                             {new Date(item.created_at).toLocaleDateString()}
                          </div>
                          <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                       </div>
                       <p className="text-xs font-bold text-foreground line-clamp-2 mb-2 leading-relaxed">
                          {item.prompt}
                       </p>
                       <div className="text-[9px] font-black uppercase tracking-widest text-primary/60">ID: {item.task_id.slice(0, 8)}</div>
                    </button>
                 )) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                       <HistoryIcon size={48} className="mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest">Archive Empty</p>
                    </div>
                 )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
