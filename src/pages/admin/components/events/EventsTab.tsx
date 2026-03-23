
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, Star, StarOff } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types/event';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import EventForm from '@/pages/admin/components/events/EventForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MapPin, Search, Users, MapPin as MapPinIcon } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from "@/components/ui/input";

export const EventsTab = () => {
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced demo events if empty
  const displayEvents = events.length === 0 ? [
    { id: 'demo-1', title: 'Rooftop Jazz Night', category: 'event', location: 'Sky Bar', date: new Date().toISOString(), time: '08:00 PM', image: 'https://images.unsplash.com/photo-1514525253361-bee8a187449a?w=400&auto=format&fit=crop&q=60', is_featured: true },
    { id: 'demo-2', title: 'Sunset Yoga Session', category: 'event', location: 'Zen Garden', date: new Date().toISOString(), time: '06:30 PM', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68733?w=400&auto=format&fit=crop&q=60', is_featured: false },
    { id: 'demo-3', title: 'Champagne Brunch', category: 'promotion', location: 'Lumina Restaurant', date: new Date().toISOString(), time: '11:00 AM', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=60', is_featured: false },
  ] : events;

  const filteredEvents = (displayEvents as any[]).filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tighter uppercase mb-1">Event Directory</h2>
          <p className="text-muted-foreground text-xs font-medium">Manage active hotel experiences and community gatherings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Filter events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 h-10 pl-9 rounded-xl bg-card dark:bg-zinc-900/40 border-border dark:border-white/5 text-xs font-medium focus:ring-1 focus:ring-primary/50 transition-all shadow-none"
            />
          </div>
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEvent(null)} className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-card dark:bg-zinc-900 border-border dark:border-white/10 text-foreground rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tighter">
                  {editingEvent ? 'Customize Event' : 'New Experience'}
                </DialogTitle>
              </DialogHeader>
              <EventForm onSubmit={editingEvent ? async (e) => await updateEvent(editingEvent.id, e) : createEvent} initialData={editingEvent} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-border dark:border-white/5 bg-card dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 dark:bg-white/5">
            <TableRow className="border-border dark:border-white/5 hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4 px-6">Event Details</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Schedule</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Badge</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-6">Management</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventsLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground font-medium">
                  Gathering experiences...
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <p className="text-muted-foreground font-medium">No experiences match your criteria.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event, idx) => (
                <motion.tr 
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-white/5 hover:bg-white/[0.02] group transition-colors"
                >
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                        <img src={event.image} alt={event.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground leading-tight">{event.title}</span>
                        <span className="text-[10px] font-medium text-muted-foreground/60">ID: {event.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "text-[10px] font-bold uppercase tracking-widest border-none px-0 bg-transparent shadow-none",
                      event.category === 'event' ? "text-purple-500" : "text-amber-500"
                    )}>
                      {event.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{event.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {event.is_featured ? (
                      <Badge className="bg-purple-500/10 text-purple-500 border border-purple-500/20 text-[10px] font-extrabold uppercase tracking-tighter px-2">
                        Featured
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/60 text-[10px] font-bold tracking-widest uppercase italic">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-2 outline-none">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => updateEvent(event.id, { is_featured: !event.is_featured })}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all border border-transparent hover:border-amber-500/20"
                      >
                        <Star className={cn("h-4 w-4", event.is_featured && "fill-amber-500 text-amber-500")} />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => { setEditingEvent(event); setIsEventDialogOpen(true); }}
                        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteEvent(event.id)}
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
