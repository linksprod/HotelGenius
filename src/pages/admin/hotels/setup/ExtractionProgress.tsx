import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SetupSessionStatus } from '@/types/aiSetup';

interface Step {
  id: string;
  label: string;
  description: string;
  statusWhen: SetupSessionStatus[];
  doneWhen: SetupSessionStatus[];
}

const STEPS: Step[] = [
  {
    id: 'read',
    label: 'Reading documents',
    description: 'Parsing uploaded files and extracting raw text',
    statusWhen: ['uploading'],
    doneWhen: ['extracting', 'reviewing', 'committing', 'done'],
  },
  {
    id: 'extract',
    label: 'AI analysis in progress',
    description: 'GPT-4o is structuring your hotel content',
    statusWhen: ['extracting'],
    doneWhen: ['reviewing', 'committing', 'done'],
  },
  {
    id: 'structure',
    label: 'Mapping to sections',
    description: 'Organising content into rooms, restaurants, spa & more',
    statusWhen: ['extracting'],
    doneWhen: ['reviewing', 'committing', 'done'],
  },
  {
    id: 'review',
    label: 'Ready for review',
    description: 'AI extraction complete — review the results below',
    statusWhen: ['reviewing'],
    doneWhen: ['committing', 'done'],
  },
];

function getStepState(
  step: Step,
  status: SetupSessionStatus
): 'pending' | 'active' | 'done' | 'error' {
  if (status === 'error') return 'error';
  if (step.doneWhen.includes(status)) return 'done';
  if (step.statusWhen.includes(status)) return 'active';
  return 'pending';
}

interface ExtractionProgressProps {
  status: SetupSessionStatus;
  progress: number;
  onAbort?: () => void;
}

const ExtractionProgress: React.FC<ExtractionProgressProps> = ({
  status,
  progress,
  onAbort,
}) => {
  const isActive = ['uploading', 'extracting'].includes(status);

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              isActive ? 'bg-primary/10' : status === 'reviewing' ? 'bg-emerald-500/10' : 'bg-muted'
            )}
          >
            {isActive ? (
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            ) : status === 'reviewing' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : status === 'error' ? (
              <XCircle className="h-5 w-5 text-rose-500" />
            ) : (
              <Clock className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {isActive ? 'AI Processing...' : status === 'reviewing' ? 'Extraction Complete' : status === 'error' ? 'Extraction Failed' : 'Waiting'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isActive ? 'This usually takes 15–30 seconds' : status === 'reviewing' ? 'Review and accept the content below' : ''}
            </p>
          </div>
        </div>

        {/* Abort button */}
        {isActive && onAbort && (
          <button
            onClick={onAbort}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">Progress</span>
          <span className="text-xs font-bold text-foreground">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              status === 'error' ? 'bg-rose-500' : 'bg-primary'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const state = getStepState(step, status);
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3"
            >
              {/* Step indicator */}
              <div className="mt-0.5 shrink-0">
                {state === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : state === 'active' ? (
                  <div className="flex h-4 w-4 items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                ) : state === 'error' ? (
                  <XCircle className="h-4 w-4 text-rose-500" />
                ) : (
                  <div className="flex h-4 w-4 items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-border" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div>
                <p
                  className={cn(
                    'text-sm font-medium leading-none',
                    state === 'done'
                      ? 'text-foreground'
                      : state === 'active'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </p>
                {(state === 'active' || state === 'done') && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtractionProgress;
