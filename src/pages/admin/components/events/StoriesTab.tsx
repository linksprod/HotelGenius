import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Search, Calendar } from 'lucide-react';
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStories } from '@/hooks/useStories';
import { Story } from '@/types/event';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { StoryForm } from '@/pages/admin/components/events/StoryForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const StoriesTab = () => {
  const { stories, loading: storiesLoading, createStory, updateStory, deleteStory } = useStories();
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);

  // Enhanced demo stories if empty
  const displayStories = stories.length === 0 ? [
    { id: 's-1', title: 'Night Life at Sky Bar', category: 'event', image: 'https://images.unsplash.com/photo-1514525253361-bee8a187449a?w=400&auto=format&fit=crop&q=60', is_active: true, created_at: new Date().toISOString() },
    { id: 's-2', title: 'Morning Zen Walk', category: 'event', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68733?w=400&auto=format&fit=crop&q=60', is_active: true, created_at: new Date().toISOString() },
    { id: 's-3', title: 'Weekend Special Mix', category: 'promotion', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=60', is_active: false, created_at: new Date().toISOString() },
  ] : stories;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tighter uppercase mb-1">Visual Stories</h2>
          <p className="text-muted-foreground text-xs font-medium">Publish immersive vertical stories to the guest mobile app.</p>
        </div>
        <Dialog open={isStoryDialogOpen} onOpenChange={setIsStoryDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingStory(null)} className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/20">
              <Plus className="h-4 w-4 mr-2" />
              Create Story
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-card dark:bg-zinc-900 border-border dark:border-white/10 text-foreground rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
                {editingStory ? 'Edit Story' : 'New Story'}
              </DialogTitle>
            </DialogHeader>
            <StoryForm 
              onSubmit={editingStory ? async (s) => await updateStory(editingStory.id, s) : createStory} 
              initialData={editingStory} 
              open={isStoryDialogOpen}
              onOpenChange={setIsStoryDialogOpen}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-2xl border border-border dark:border-white/5 bg-card dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 dark:bg-white/5">
            <TableRow className="border-border dark:border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4 px-6">Preview</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Story Title</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Published</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visibility</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-6">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {storiesLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-medium">
                  Loading stories...
                </TableCell>
              </TableRow>
            ) : displayStories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-medium">
                  No stories published yet.
                </TableCell>
              </TableRow>
            ) : (
              displayStories.map((story, idx) => (
                <motion.tr 
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-white/5 hover:bg-white/[0.02] group transition-colors"
                >
                  <TableCell className="py-4 px-6">
                    <div className="relative h-14 w-10 rounded-lg overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all shadow-lg">
                      <img src={story.image} alt={story.title} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground text-sm">{story.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-bold uppercase tracking-widest border-none px-0 bg-transparent shadow-none",
                      story.category === 'event' ? "text-purple-500" : "text-amber-500"
                    )}>
                      {story.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {format(new Date(story.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => updateStory(story.id, { is_active: !story.is_active })} 
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all shadow-none",
                        story.is_active 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      <div className={cn("h-1 w-1 rounded-full", story.is_active ? "bg-emerald-500" : "bg-muted-foreground")} />
                      {story.is_active ? 'Active' : 'Draft'}
                    </button>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setEditingStory(story); setIsStoryDialogOpen(true); }}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteStory(story.id)}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
