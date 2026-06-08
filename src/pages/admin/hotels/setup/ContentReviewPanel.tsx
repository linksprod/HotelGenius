import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, ChevronRight, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionReviewCard from './SectionReviewCard';
import type { AIExtractedContent, SectionKey } from '@/types/aiSetup';

interface ContentReviewPanelProps {
  draft: AIExtractedContent;
  committedSections: SectionKey[];
  onCommitSection: (key: SectionKey) => Promise<void>;
  onCommitAll: () => Promise<void>;
  onFinish: () => void;
  onUploadMore: () => void;
  isLoading: boolean;
}

const ContentReviewPanel: React.FC<ContentReviewPanelProps> = ({
  draft,
  committedSections,
  onCommitSection,
  onCommitAll,
  onFinish,
  onUploadMore,
  isLoading,
}) => {
  const [skippedSections, setSkippedSections] = useState<SectionKey[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  const skipSection = (key: SectionKey) => {
    setSkippedSections((prev) => [...prev, key]);
  };

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      await onCommitAll();
    } catch (err) {
      console.error('[ContentReviewPanel] Error saving on finish:', err);
    } finally {
      setIsFinishing(false);
      onFinish();
    }
  };

  // Overall stats
  const totalSections = 7;
  const highConfidenceSections = [
    draft.about?.confidence ?? 0,
    draft.rooms?.confidence ?? 0,
    draft.restaurants?.confidence ?? 0,
    draft.spa?.confidence ?? 0,
    draft.activities?.confidence ?? 0,
    draft.policies?.confidence ?? 0,
    draft.faqs?.confidence ?? 0,
  ].filter((c) => c >= 0.5).length;

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">AI Extraction Complete</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Found data in{' '}
              <span className="font-semibold text-foreground">{highConfidenceSections}</span> of{' '}
              {totalSections} sections. Review each section below, then save to your hotel.
            </p>
          </div>

          <Button
            size="sm"
            onClick={onCommitAll}
            disabled={isLoading}
            className="gap-1.5 shrink-0 text-xs"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Accept All & Save
          </Button>
        </div>

        {/* Progress indicators */}
        <div className="flex items-center gap-2 mt-4">
          {([
            { key: 'about', label: '🏨', score: draft.about?.confidence ?? 0 },
            { key: 'rooms', label: '🛏️', score: draft.rooms?.confidence ?? 0 },
            { key: 'restaurants', label: '🍽️', score: draft.restaurants?.confidence ?? 0 },
            { key: 'spa', label: '💆', score: draft.spa?.confidence ?? 0 },
            { key: 'activities', label: '🏊', score: draft.activities?.confidence ?? 0 },
            { key: 'policies', label: '📋', score: draft.policies?.confidence ?? 0 },
            { key: 'faqs', label: '❓', score: draft.faqs?.confidence ?? 0 },
          ] as { key: SectionKey; label: string; score: number }[]).map(({ key, label, score }) => {
            const committed = committedSections.includes(key);
            return (
              <div
                key={key}
                className="flex-1 flex flex-col items-center gap-1"
                title={`${key} — ${Math.round(score * 100)}%`}
              >
                <span className="text-sm">{label}</span>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      committed
                        ? 'bg-emerald-500'
                        : score >= 0.7
                        ? 'bg-primary'
                        : score >= 0.4
                        ? 'bg-amber-500'
                        : 'bg-rose-500/40'
                    }`}
                    style={{ width: `${Math.round(score * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Section cards */}
      <div className="space-y-3">
        {/* About */}
        <SectionReviewCard
          sectionKey="about"
          confidence={draft.about?.confidence ?? 0}
          fields={[
            { label: 'Hotel Name', value: draft.about?.name },
            { label: 'Tagline', value: draft.about?.tagline },
            { label: 'Description', value: draft.about?.description, multiline: true },
            { label: 'Address', value: draft.about?.address },
            { label: 'Phone', value: draft.about?.phone },
            { label: 'Email', value: draft.about?.email },
            { label: 'Check-in', value: draft.about?.checkIn },
            { label: 'Check-out', value: draft.about?.checkOut },
            { label: 'Star Rating', value: draft.about?.starRating },
          ].filter((f) => f.value !== null && f.value !== undefined && f.value !== '')}
          itemSummary={draft.about?.amenities?.slice(0, 8) ?? []}
          isCommitted={committedSections.includes('about')}
          onCommit={() => onCommitSection('about')}
          onSkip={() => skipSection('about')}
          isLoading={isLoading}
        />

        {/* Rooms */}
        <SectionReviewCard
          sectionKey="rooms"
          confidence={draft.rooms?.confidence ?? 0}
          itemCount={draft.rooms?.items?.length ?? 0}
          itemSummary={draft.rooms?.items?.map((r) => r.name) ?? []}
          isCommitted={committedSections.includes('rooms')}
          onCommit={() => onCommitSection('rooms')}
          onSkip={() => skipSection('rooms')}
          isLoading={isLoading}
        />

        {/* Restaurants */}
        <SectionReviewCard
          sectionKey="restaurants"
          confidence={draft.restaurants?.confidence ?? 0}
          itemCount={draft.restaurants?.items?.length ?? 0}
          itemSummary={
            draft.restaurants?.items?.map(
              (r) => `${r.name}${r.cuisine ? ` (${r.cuisine})` : ''}`
            ) ?? []
          }
          isCommitted={committedSections.includes('restaurants')}
          onCommit={() => onCommitSection('restaurants')}
          onSkip={() => skipSection('restaurants')}
          isLoading={isLoading}
        />

        {/* Spa */}
        <SectionReviewCard
          sectionKey="spa"
          confidence={draft.spa?.confidence ?? 0}
          fields={[
            { label: 'Description', value: draft.spa?.description, multiline: true },
            { label: 'Hours', value: draft.spa?.hours },
          ].filter((f) => f.value)}
          itemCount={draft.spa?.treatments?.length ?? 0}
          itemSummary={draft.spa?.treatments?.map((t) => t.name) ?? []}
          isCommitted={committedSections.includes('spa')}
          onCommit={() => onCommitSection('spa')}
          onSkip={() => skipSection('spa')}
          isLoading={isLoading}
        />

        {/* Activities */}
        <SectionReviewCard
          sectionKey="activities"
          confidence={draft.activities?.confidence ?? 0}
          itemCount={draft.activities?.items?.length ?? 0}
          itemSummary={draft.activities?.items?.map((a) => a.name) ?? []}
          isCommitted={committedSections.includes('activities')}
          onCommit={() => onCommitSection('activities')}
          onSkip={() => skipSection('activities')}
          isLoading={isLoading}
        />

        {/* Policies */}
        <SectionReviewCard
          sectionKey="policies"
          confidence={draft.policies?.confidence ?? 0}
          itemCount={draft.policies?.items?.length ?? 0}
          itemSummary={draft.policies?.items?.map((p) => p.title) ?? []}
          isCommitted={committedSections.includes('policies')}
          onCommit={() => onCommitSection('policies')}
          onSkip={() => skipSection('policies')}
          isLoading={isLoading}
        />

        {/* FAQs */}
        <SectionReviewCard
          sectionKey="faqs"
          confidence={draft.faqs?.confidence ?? 0}
          itemCount={draft.faqs?.items?.length ?? 0}
          itemSummary={draft.faqs?.items?.map((f) => f.question) ?? []}
          isCommitted={committedSections.includes('faqs')}
          onCommit={() => onCommitSection('faqs')}
          onSkip={() => skipSection('faqs')}
          isLoading={isLoading}
        />
      </div>

      {/* Footer buttons */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onUploadMore} disabled={isLoading || isFinishing} className="gap-2 text-muted-foreground">
          <Upload className="h-4 w-4" />
          Upload More Documents
        </Button>
        <Button onClick={handleFinish} disabled={isLoading || isFinishing} className="gap-2 min-w-[140px]">
          {isFinishing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              {committedSections.length > 0 ? 'Done' : 'Save & Finish'}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ContentReviewPanel;
