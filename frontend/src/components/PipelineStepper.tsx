import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, Loader2, Zap, Compass, PenTool, 
  Search, TrendingUp, Layout, BarChart3 
} from 'lucide-react';

const STAGES = [
  { id: 'parser', label: 'Parse', shortDesc: 'Directive Analysis', color: '#06B6D4', icon: Zap },
  { id: 'planner', label: 'Blueprint', shortDesc: 'Neural Architecting', color: '#3B82F6', icon: Compass },
  { id: 'writer', label: 'Generate', shortDesc: 'Core Synthesis', color: '#6366F1', icon: PenTool },
  { id: 'critic', label: 'Critique', shortDesc: 'Quality Audit', color: '#8B5CF6', icon: Search },
  { id: 'optimizer', label: 'Refine', shortDesc: 'Entropy Reduction', color: '#EC4899', icon: TrendingUp },
  { id: 'formatter', label: 'Style', shortDesc: 'Aesthetic Polishing', color: '#10B981', icon: Layout },
  { id: 'evaluator', label: 'Score', shortDesc: 'Final Validation', color: '#F59E0B', icon: BarChart3 },
];

interface PipelineStepperProps {
  currentStage: string;
  isProcessing: boolean;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ currentStage, isProcessing }) => {
  const currentIdx = STAGES.findIndex((s) => s.id === currentStage);
  const isCompleted = currentStage === 'completed';

  return (
    <div className="relative w-full py-12 px-2">
      {/* Background Track - Industrial look */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/5 -translate-y-1/2" />
      
      {/* Animated Flow Track */}
      <motion.div
        className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-primary via-blue-500 to-success origin-left -translate-y-1/2"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: isCompleted ? 1 : Math.max(0, currentIdx) / (STAGES.length - 1),
        }}
        transition={{ duration: 1, ease: "circOut" }}
        style={{ width: '100%' }}
      />

      <div className="flex justify-between items-center relative z-10 h-full">
        {STAGES.map((stage, idx) => {
          const isActive = stage.id === currentStage;
          const isDone = isCompleted || currentIdx > idx;
          const isPending = !isDone && !isActive;
          const Icon = stage.icon;

          // Alternating position for labels to prevent overlap
          const isLabelTop = idx % 2 === 0;

          return (
            <div key={stage.id} className="relative flex flex-col items-center flex-1">
              {/* Step Circle */}
              <motion.div
                className="relative z-20 group cursor-default"
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
              >
                {isActive && (
                  <motion.div
                    className="absolute -inset-4 rounded-full blur-xl opacity-30"
                    style={{ background: stage.color }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                  />
                )}

                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border-2 ${
                    isDone 
                      ? 'bg-primary border-primary shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                      : isActive 
                      ? 'bg-background border-primary shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                      : 'bg-background border-white/10'
                  }`}
                >
                  {isDone ? (
                    <Check size={18} className="text-white" strokeWidth={3} />
                  ) : isActive && isProcessing ? (
                    <Loader2 size={18} className="text-primary animate-spin" />
                  ) : (
                    <Icon 
                      size={18} 
                      className={isActive ? 'text-primary' : isPending ? 'text-white/20' : 'text-text-muted'} 
                    />
                  )}
                </div>

                {/* Step Index Indicator */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-surface border border-white/10 rounded-full flex items-center justify-center text-[8px] font-black text-text-muted">
                   {idx + 1}
                </div>
              </motion.div>

              {/* Dynamic Label - Alternating Positions */}
              <div 
                className={`absolute w-32 text-center transition-all duration-500 pointer-events-none ${
                  isLabelTop ? '-top-12' : 'top-16'
                } ${isActive ? 'opacity-100 scale-100' : isDone ? 'opacity-40 scale-95' : 'opacity-20 scale-90'}`}
              >
                <div className={`text-[11px] font-black uppercase tracking-[0.2em] mb-0.5 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {stage.label}
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[9px] font-bold text-primary/60 uppercase tracking-widest whitespace-nowrap"
                    >
                      {stage.shortDesc}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
