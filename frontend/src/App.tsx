import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { PipelineStepper } from './components/PipelineStepper';
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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

  const fetchHistory = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`);
        if (isMounted) setHistory(res.data);
      } catch (err) {
        if (isMounted) console.error("History fetch failed", err);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state?.logs]);

  useEffect(() => {
    if (taskId && loading) {
      const wsUrl = API_BASE.replace(/^http/, 'ws');
      const socket = new WebSocket(`${wsUrl}/ws/${taskId}`);
      ws.current = socket;

      socket.onopen = () => console.log("WebSocket Connected");

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'status_update') {
          const newState = message.data.meta;
          
          if (newState.current_stage !== state?.current_stage) {
            tacticalAudio.playChirp();
          }

          setState(newState);
          
          if (newState.current_stage === 'completed') {
            setLoading(false);
            tacticalAudio.playSuccess();
            fetchHistory();
            socket.close();
          }
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error", err);
        setLoading(false);
      };

      socket.onclose = () => console.log("WebSocket Disconnected");

      return () => socket.close();
    }
  }, [taskId, loading, fetchHistory]);

  useEffect(() => {
    if (state?.final_output?.content) {
      const fullContent = state.final_output.content;
      
      // Start streaming only if we have full content and haven't started yet
      // We check this via a ref or just by clearing it when the state is null.
      // The easiest way is to let the effect run once when final_output.content changes.
      setStreamedContent("");
      let currentIndex = 0;
      
      const timer = setInterval(() => {
        currentIndex += 10;
        setStreamedContent(fullContent.slice(0, currentIndex));
        if (currentIndex >= fullContent.length) {
          clearInterval(timer);
        }
      }, 10);
      
      return () => clearInterval(timer);
    }
  }, [state?.final_output?.content]);

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

  const downloadPDF = () => window.print();
  const currentStage = state?.current_stage || "parser";

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
      <Navbar onHistoryClick={() => setIsHistoryOpen(true)} />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 relative z-10 space-y-12">
        
        {/* Hero Section */}
        <section className="text-center space-y-6 print:hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-wider shadow-sm">
            <Brain size={14} />
            Multi-Agent Synthesis
          </div>
          <h1 className="text-6xl xl:text-7xl font-black font-heading leading-[1] tracking-tighter text-foreground mb-4">
            The <span className="shimmer-text italic">Video Script</span> Engine.
          </h1>
          <p className="text-lg text-text-dim max-w-2xl mx-auto font-medium">
            An autonomous orchestration layer that synchronizes multiple specialized LLM agents into a high-retention video script writing pipeline.
          </p>
        </section>

        {/* Command Input Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 print:hidden relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <TerminalIcon size={20} className="text-primary" />
              <h3 className="text-base font-bold text-foreground">Command Input</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video topic, platform, and target duration..."
              className="w-full bg-background border border-border rounded-xl p-5 min-h-[140px] focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-base text-foreground placeholder:text-text-muted"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Write a 60-second Instagram Reel about the new Antigravity 2.0 release.",
                "A 10-minute YouTube deep dive into Claude 4.6 and its capabilities.",
                "Create a fast-paced TikTok script explaining quantum computing to beginners.",
                "A cinematic 5-minute YouTube video about the history of microservices."
              ].map((example, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 text-xs font-medium bg-surface-hover border border-border rounded-lg hover:border-primary/50 transition-colors text-text-dim hover:text-foreground flex items-start gap-2"
                >
                  <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
                  <span>{example}</span>
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !prompt}
              className="w-full btn-primary py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              Ignite Synthesis
            </button>
          </form>
          </div>
        </div>

        {/* Live Stepper */}
        {(loading || state) && (
          <div className="glass-panel p-8 rounded-2xl print:hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold text-foreground">Pipeline Status</h2>
              <div className="px-3 py-1 bg-primary/5 rounded-full text-xs font-semibold text-primary border border-primary/10">v2.0.4-LUMINA</div>
            </div>
            <PipelineStepper currentStage={currentStage} isProcessing={loading} />
          </div>
        )}

        {/* Viewer Area */}
        <AnimatePresence mode="wait">
          {state?.final_output && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex justify-end print:hidden">
                <button 
                  onClick={downloadPDF} 
                  className="flex items-center gap-2 px-6 py-2.5 bg-surface border border-border hover:bg-surface-hover hover:border-primary/30 rounded-lg transition-all text-sm font-bold text-foreground shadow-sm"
                >
                    <Download size={16} className="text-primary" />
                    Export PDF
                </button>
              </div>

              <div id="print-area" ref={contentRef} className="space-y-8 print:p-0 print:m-0">
                {/* Radar Chart Section */}
                <div className="glass-panel p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                   <div className="flex justify-center">
                      <RadarChart data={state.evaluation_results || {}} />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-lg font-bold text-foreground mb-4">Evaluation Metrics</h3>
                      {state.evaluation_results && Object.entries(state.evaluation_results).map(([key, value]) => (
                         <div key={key} className="bg-surface border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
                            <span className="text-sm font-semibold capitalize text-text-dim">{key.replace('_', ' ')}</span>
                            <span className="text-lg font-bold text-primary">{value}</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Final Output Content */}
                <div className="glass-panel rounded-2xl overflow-hidden shadow-sm relative">
                  <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-rose-500" />
                  <div className="p-8 md:p-12">
                    <div className="flex items-center gap-2 px-3 py-1 bg-success-dim border border-success/20 rounded-full text-success text-xs font-bold mb-8 w-fit">
                      <CheckCircle2 size={14} />
                      Synthesis Verified
                    </div>

                    <article className="prose prose-slate max-w-none prose-lg">
                       <div className="whitespace-pre-wrap text-text-dim text-lg leading-relaxed first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                         {streamedContent}
                         {streamedContent.length < (state?.final_output?.content?.length || 0) && (
                           <motion.span 
                             animate={{ opacity: [1, 0] }}
                             transition={{ repeat: Infinity, duration: 0.5 }}
                             className="inline-block w-2 h-6 bg-primary ml-1 translate-y-1"
                           />
                         )}
                       </div>
                    </article>

                    <div className="mt-16 pt-8 border-t border-border flex justify-between items-center text-xs font-medium text-text-muted">
                      <div>Content Agent System // Task-{taskId?.slice(0, 8)}</div>
                      <div>{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <footer className="border-t border-border mt-12 bg-surface print:hidden">
         <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
               <Zap size={16} className="text-primary" />
               <span className="text-sm font-bold text-foreground">Content Agent System</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-text-dim">
               <span className="flex items-center gap-2"><Activity size={14} className="text-primary"/> 84ms</span>
               <span className="flex items-center gap-2"><Server size={14} className="text-blue-500"/> 6 Active</span>
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
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[380px] bg-surface border-l border-border z-[101] flex flex-col shadow-xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-surface">
                 <div className="flex items-center gap-2 text-foreground">
                    <HistoryIcon size={18} />
                    <h3 className="font-bold">Intelligence Archive</h3>
                 </div>
                 <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-background rounded-md text-text-muted transition-colors">
                    <X size={18} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                      className="w-full text-left p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-all group shadow-sm"
                    >
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                             <Clock size={14} />
                             {new Date(item.created_at).toLocaleDateString()}
                          </div>
                          <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <p className="text-sm font-semibold text-foreground line-clamp-2 leading-relaxed">
                          {item.prompt}
                       </p>
                    </button>
                 )) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-muted text-center p-6">
                       <HistoryIcon size={40} className="mb-3 opacity-20" />
                       <p className="text-sm font-medium">Archive Empty</p>
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
