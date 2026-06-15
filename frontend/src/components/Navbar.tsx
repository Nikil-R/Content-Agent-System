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
    <nav className="fixed top-0 inset-x-0 h-20 bg-surface border-b border-border z-50 print:hidden shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Zap className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight font-heading leading-none text-foreground">Content Agent</span>
            <span className="text-[10px] font-semibold text-text-muted tracking-wider uppercase">Multi-Agent Suite</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-8 text-sm font-medium text-text-dim">
          <Link 
            to="/" 
            className={`transition-colors ${location.pathname === '/' ? 'text-primary' : 'hover:text-primary'}`}
          >
            Command
          </Link>
          <Link 
            to="/architecture" 
            className={`transition-colors ${location.pathname === '/architecture' ? 'text-primary' : 'hover:text-primary'}`}
          >
            Architecture
          </Link>
          <Link 
            to="/agents" 
            className={`transition-colors ${location.pathname === '/agents' ? 'text-primary' : 'hover:text-primary'}`}
          >
            Agents
          </Link>
          
          {onHistoryClick && (
            <button onClick={onHistoryClick} className="flex items-center gap-2 hover:text-primary transition-colors">
              <HistoryIcon size={16} />
              History
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-full border border-border shadow-sm">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-text-dim font-medium">System Active</span>
          </div>
        </div>
      </div>
    </nav>
  );
};
