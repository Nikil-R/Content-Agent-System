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
      {/* Background Track */}
      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-border -translate-y-1/2" />
      
      {/* Animated Flow Track */}
      <motion.div
        className="absolute top-1/2 left-0 h-[3px] bg-primary origin-left -translate-y-1/2 rounded-full"
        initial={{ scaleX: 0 }}
        animate={{
          scaleX: isCompleted ? 1 : Math.max(0, currentIdx) / (STAGES.length - 1),
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
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
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 bg-surface ${
                  isDone 
                    ? 'border-primary text-primary' 
                    : isActive 
                    ? 'border-primary text-primary shadow-sm scale-110' 
                    : 'border-border text-text-muted'
                }`}
              >
                {isDone ? (
                  <Check size={16} strokeWidth={3} />
                ) : isActive && isProcessing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Icon size={16} />
                )}
              </div>

              {/* Dynamic Label - Alternating Positions */}
              <div 
                className={`absolute w-32 text-center transition-all duration-300 ${
                  isLabelTop ? '-top-10' : 'top-14'
                } ${isActive ? 'opacity-100 font-bold' : isDone ? 'opacity-80' : 'opacity-50'}`}
              >
                <div className={`text-xs ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {stage.label}
                </div>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] text-text-dim mt-0.5"
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
