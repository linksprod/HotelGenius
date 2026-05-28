import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, SkipForward, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  getConfidenceLevel,
  getConfidenceLabel,
  getConfidenceBg,
  SECTION_ICONS,
  SECTION_LABELS,
  type SectionKey,
  type AIConfidence,
} from '@/types/aiSetup';

interface Field {
  label: string;
  value: string | string[] | null | number;
  multiline?: boolean;
}

interface SectionReviewCardProps {
  sectionKey: SectionKey;
  confidence: number;
  fields?: Field[];
  itemCount?: number;
  itemSummary?: string[];
  isCommitted: boolean;
  onCommit: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

const SectionReviewCard: React.FC<SectionReviewCardProps> = ({
  sectionKey,
  confidence,
  fields = [],
  itemCount,
  itemSummary = [],
  isCommitted,
  onCommit,
  onSkip,
  isLoading = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});

  const confidenceLevel: AIConfidence = getConfidenceLevel(confidence);
  const hasContent = confidence > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border bg-card/60 backdrop-blur overflow-hidden transition-all',
        isCommitted
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : confidence < 0.3
          ? 'border-rose-500/20 opacity-75'
          : 'border-border'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none"
        onClick={() => setIsExpanded((v) => !v)}
      >
        {/* Section icon + label */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-xl shrink-0">
          {SECTION_ICONS[sectionKey]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground">
              {SECTION_LABELS[sectionKey]}
            </span>

            {/* Confidence badge */}
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                getConfidenceBg(confidenceLevel)
              )}
            >
              {getConfidenceLabel(confidenceLevel)}
            </span>

            {/* Committed badge */}
            {isCommitted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Saved
              </span>
            )}
          </div>

          {/* Summary */}
          <p className="mt-0.5 text-xs text-muted-foreground">
            {!hasContent
              ? 'No data found in your documents'
              : itemCount !== undefined
              ? `${itemCount} item${itemCount !== 1 ? 's' : ''} extracted`
              : `${Math.round(confidence * 100)}% confidence`}
          </p>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border"
        >
          <div className="p-5 space-y-4">
            {/* Fields */}
            {fields.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Extracted Fields
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing((v) => !v);
                    }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit3 className="h-3 w-3" />
                    {isEditing ? 'Done editing' : 'Edit'}
                  </button>
                </div>

                <div className="space-y-2">
                  {fields.map((field) => {
                    const displayValue = Array.isArray(field.value)
                      ? field.value.join(', ')
                      : String(field.value ?? '—');
                    const editValue = editedFields[field.label] ?? displayValue;

                    return (
                      <div key={field.label} className="rounded-lg bg-muted/40 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          {field.label}
                        </p>
                        {isEditing ? (
                          field.multiline ? (
                            <Textarea
                              value={editValue}
                              onChange={(e) =>
                                setEditedFields((prev) => ({
                                  ...prev,
                                  [field.label]: e.target.value,
                                }))
                              }
                              className="text-sm min-h-[80px] resize-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <Input
                              value={editValue}
                              onChange={(e) =>
                                setEditedFields((prev) => ({
                                  ...prev,
                                  [field.label]: e.target.value,
                                }))
                              }
                              className="text-sm h-8"
                              onClick={(e) => e.stopPropagation()}
                            />
                          )
                        ) : (
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {displayValue}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Item list (rooms, restaurants, etc.) */}
            {itemSummary.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Items Found
                </p>
                <div className="flex flex-wrap gap-2">
                  {itemSummary.map((item, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs font-medium"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!hasContent && (
              <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-3">
                <p className="text-xs text-rose-500">
                  No {SECTION_LABELS[sectionKey].toLowerCase()} information was found in your documents.
                  You can add this manually from the admin panel after setup.
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              {!isCommitted && hasContent && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCommit();
                  }}
                  disabled={isLoading}
                  className="gap-1.5 text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Save to Hotel
                </Button>
              )}

              {!isCommitted && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip();
                  }}
                  disabled={isLoading}
                  className="gap-1.5 text-xs text-muted-foreground"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip for now
                </Button>
              )}

              {isCommitted && (
                <p className="text-xs text-emerald-500 font-medium">
                  ✓ Content saved to your hotel profile
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SectionReviewCard;
