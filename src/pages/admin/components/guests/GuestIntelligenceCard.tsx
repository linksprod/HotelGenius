import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, MessageSquare, Trash2, Loader2, StickyNote, UserCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Guest } from './types';
import { useStaffNotes } from '@/hooks/admin/useStaffNotes';

interface GuestIntelligenceCardProps {
  guest: Guest;
}

/* ── Add Note Dialog ────────────────────────────────── */
interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string) => void;
  isPending: boolean;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ open, onClose, onAdd, isPending }) => {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onAdd(content.trim());
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-blue-500" />
            Add internal note
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1 mb-2">
          🔒 Visible only to staff — never to the guest.
        </p>
        <Textarea
          placeholder="Write a note for the team…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!content.trim() || isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ── Main Card ──────────────────────────────────────── */
const GuestIntelligenceCard: React.FC<GuestIntelligenceCardProps> = ({ guest }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { notes, isLoading, addNote, deleteNote } = useStaffNotes(guest.id);

  const handleAdd = (content: string) => {
    addNote.mutate(content, { onSuccess: () => setDialogOpen(false) });
  };

  return (
    <div className="space-y-8">
      {/* ── Staff Notes Card ── */}
      <Card className="overflow-hidden border border-border dark:border-none bg-card/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-sm dark:shadow-2xl rounded-[2rem]">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground dark:text-white tracking-tight">
                  Internal notes
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Visible only to staff
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs rounded-full bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-foreground"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          {/* Notes list */}
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="p-3 rounded-full bg-zinc-100 dark:bg-white/5">
                <StickyNote className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground italic">No notes available</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                First note
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="group relative flex gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 hover:border-blue-200 dark:hover:border-blue-500/20 transition-colors"
                >
                  {/* Avatar */}
                  <div className="shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-blue-500/15 flex items-center justify-center">
                      <UserCircle2 className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-foreground">
                        {note.author_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: enUS })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  {/* Delete button — visible on hover */}
                  <button
                    onClick={() => deleteNote.mutate(note.id)}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500"
                    title="Delete note"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <AddNoteDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAdd}
        isPending={addNote.isPending}
      />
    </div>
  );
};

export default GuestIntelligenceCard;
