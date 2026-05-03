import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Zap, History as HistoryIcon } from 'lucide-react';

interface NavbarProps {
  onHistoryClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onHistoryClick }) => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 inset-x-0 h-20 glass-panel border-b border-border z-50 print:hidden">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity relative group">
          <div className="relative">
            <motion.div 
              className="absolute -inset-2 bg-primary/20 rounded-full blur-lg"
              animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 relative z-10">
              <Zap className="text-white" size={20} fill="currentColor" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight font-heading leading-none">CONTENT AGENT</span>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Multi-Agent Suite</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-text-dim">
          <Link 
            to="/" 
            className={`transition-colors ${location.pathname === '/' ? 'text-primary tracking-[0.2em]' : 'hover:text-primary'}`}
          >
            Command
          </Link>
          <Link 
            to="/architecture" 
            className={`transition-colors ${location.pathname === '/architecture' ? 'text-primary tracking-[0.2em]' : 'hover:text-primary'}`}
          >
            System Protocol
          </Link>
          <Link 
            to="/agents" 
            className={`transition-colors ${location.pathname === '/agents' ? 'text-primary tracking-[0.2em]' : 'hover:text-primary'}`}
          >
            Agent Dossier
          </Link>
          
          {onHistoryClick && (
            <button onClick={onHistoryClick} className="flex items-center gap-2 hover:text-primary transition-colors">
              <HistoryIcon size={14} />
              History
            </button>
          )}

          <div className="flex items-center gap-3 px-4 py-2 bg-surface rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success whitespace-nowrap">Core Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
