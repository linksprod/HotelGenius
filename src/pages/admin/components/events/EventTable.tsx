
import React from 'react';
import { Event } from '@/types/event';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, Users, Star, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface EventTableProps {
  events: Event[];
  selectedEventId: string | undefined;
  onSelectEvent: (eventId: string) => void;
  stories: { id: string; title: string; eventId?: string }[];
}

export const EventTable: React.FC<EventTableProps> = ({ 
  events, 
  selectedEventId, 
  onSelectEvent,
  stories = []
}) => {
  return (
    <div className="rounded-2xl border border-border dark:border-white/5 bg-card dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-2xl">
      <Table>
        <TableHeader className="bg-muted/50 dark:bg-white/5">
          <TableRow className="border-border dark:border-white/5 hover:bg-transparent">
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-4 px-6">Event Experience</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classification</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Location</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date & Time</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Visibility</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground pr-6">Management</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground font-medium italic">
                No active experiences available...
              </TableCell>
            </TableRow>
          ) : (
            events.map((event, idx) => (
              <TableRow 
                key={event.id} 
                className={cn(
                  "border-border dark:border-white/5 transition-all group cursor-pointer",
                  selectedEventId === event.id ? "bg-muted/50 dark:bg-white/[0.05] shadow-[inset_4px_0_0_0_#9333ea]" : "hover:bg-muted/30 dark:hover:bg-white/[0.02]"
                )}
                onClick={() => onSelectEvent(event.id)}
              >
                <TableCell className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden ring-1 ring-white/10 group-hover:ring-purple-500/50 transition-all">
                      <img src={event.image} alt={event.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground leading-tight">{event.title}</span>
                      <span className="text-[10px] font-medium text-muted-foreground/60">REF: {event.id.slice(0, 8)}</span>
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
                    {event.location || 'Universal'}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center text-xs font-bold text-foreground">
                      <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" />
                      {format(new Date(event.date), 'MMM dd, yyyy')}
                    </div>
                    {event.time && (
                      <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{event.time}</div>
                    )}
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
                  <div className="flex justify-end">
                    <Button 
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                        selectedEventId === event.id 
                          ? "bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-600/20" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {selectedEventId === event.id ? 'Viewing' : 'Inspect'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
