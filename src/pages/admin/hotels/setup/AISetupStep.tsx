import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Globe,
  PenLine,
  Sparkles,
  ChevronRight,
  SkipForward,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAIContentImport } from '@/hooks/useAIContentImport';
import DocumentUploader from './DocumentUploader';
import ExtractionProgress from './ExtractionProgress';
import ContentReviewPanel from './ContentReviewPanel';
import type { SectionKey } from '@/types/aiSetup';

// ─── Tab definitions ─────────────────────────────────────────────────────────

type TabId = 'upload' | 'website' | 'manual';

interface Tab {
  id: TabId;
  icon: React.ReactNode;
  label: string;
  description: string;
  badge?: string;
}

const TABS: Tab[] = [
  {
    id: 'upload',
    icon: <Upload className="h-4 w-4" />,
    label: 'Upload Documents',
    description: 'PDF brochures, menus, guides',
  },
  {
    id: 'website',
    icon: <Globe className="h-4 w-4" />,
    label: 'Website URL',
    description: 'Scan your hotel website',
    badge: 'Coming Soon',
  },
  {
    id: 'manual',
    icon: <PenLine className="h-4 w-4" />,
    label: 'Manual Entry',
    description: 'Skip AI — fill in yourself',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AISetupStepProps {
  hotelId: string;
  onFinish: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AISetupStep: React.FC<AISetupStepProps> = ({ hotelId, onFinish, onSkip, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('upload');
  const [phase, setPhase] = useState<'input' | 'processing' | 'review'>('input');

  const {
    files,
    addFiles,
    removeFile,
    status,
    progress,
    draft,
    isLoading,
    committedSections,
    runExtraction,
    commitSection,
    commitAll,
    reset,
  } = useAIContentImport(hotelId);

  // ── Trigger extraction ────────────────────────────────────────────────────

  const handleExtract = async () => {
    setPhase('processing');
    await runExtraction();
  };

  // Watch for extraction completing
  React.useEffect(() => {
    if (status === 'reviewing' && draft) {
      setPhase('review');
    }
    if (status === 'error') {
      setPhase('input');
    }
  }, [status, draft]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Step 4 — AI Content Import
            </h2>
            <p className="text-xs text-muted-foreground">
              Let AI read your documents and auto-fill your hotel profile
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">

          {/* Phase: Input */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Tabs */}
              <div className="flex gap-2 rounded-xl border border-border bg-muted/30 p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => tab.badge ? undefined : setActiveTab(tab.id)}
                    disabled={!!tab.badge}
                    className={cn(
                      'relative flex-1 flex flex-col items-center gap-0.5 rounded-lg px-3 py-2.5 text-center transition-all text-xs font-medium',
                      activeTab === tab.id
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                      tab.badge && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {tab.icon}
                    <span className="font-semibold">{tab.label}</span>
                    <span className="text-[10px] hidden sm:block">{tab.description}</span>
                    {tab.badge && (
                      <span className="absolute -top-1 -right-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-bold text-primary uppercase tracking-widest">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground/80">
                        Upload your hotel brochures, menus, room guides, or any other documents.
                        Our AI will read them and automatically fill in your hotel profile — rooms,
                        restaurants, spa, activities, and more. 
                        <br/><br/>
                        <span className="opacity-80 font-medium">
                          Note: For massive PDFs, the AI will prioritize scanning the first ~20 pages of dense text to maintain lightning-fast extraction speeds.
                        </span>
                      </p>
                    </div>
                  </div>

                  <DocumentUploader
                    files={files}
                    onFilesAdded={addFiles}
                    onFileRemoved={removeFile}
                    disabled={isLoading}
                  />
                </div>
              )}

              {activeTab === 'website' && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Website Scraper</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                      Enter your hotel website URL and we'll automatically crawl and extract all content.
                      Launching in the next update.
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    Coming in Phase 2
                  </span>
                </div>
              )}

              {activeTab === 'manual' && (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                    <PenLine className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Manual Entry</h3>
                    <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                      Skip the AI import and fill in your hotel content manually from the admin
                      dashboard after setup completes.
                    </p>
                  </div>
                  <Button onClick={onSkip} variant="outline" className="gap-2">
                    <SkipForward className="h-4 w-4" />
                    Skip to Dashboard
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Phase: Processing */}
          {phase === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <ExtractionProgress
                status={status}
                progress={progress}
                onAbort={() => {
                  reset();
                  setPhase('input');
                }}
              />
            </motion.div>
          )}

          {/* Phase: Review */}
          {phase === 'review' && draft && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              <ContentReviewPanel
                draft={draft}
                committedSections={committedSections}
                onCommitSection={(key: SectionKey) => commitSection(key)}
                onCommitAll={commitAll}
                onFinish={onFinish}
                onUploadMore={() => setPhase('input')}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      {phase === 'input' && (
        <div className="px-6 py-4 border-t flex items-center justify-between gap-3 bg-muted/30 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={isLoading}
              className="gap-1.5 text-muted-foreground text-sm"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </Button>

            {activeTab === 'upload' && (
              <Button
                type="button"
                onClick={handleExtract}
                disabled={files.length === 0 || isLoading}
                className="gap-1.5 min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Extract with AI
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AISetupStep;
