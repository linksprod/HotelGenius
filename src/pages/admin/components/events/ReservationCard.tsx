
import React from 'react';
import { EventReservation } from '@/types/event';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Check, X, Eye, Phone, Calendar, User, Home, Mail, Users, Search } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ReservationCardProps {
  reservation: EventReservation;
  onViewDetails: (reservation: EventReservation) => void;
  onUpdateStatus: (reservationId: string, status: 'pending' | 'confirmed' | 'cancelled') => void;
  isUpdating: boolean;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  onViewDetails,
  onUpdateStatus,
  isUpdating
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed': return { label: 'Confirmed', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
      case 'cancelled': return { label: 'Cancelled', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
      case 'pending': return { label: 'Pending', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
      default: return { label: status, color: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border' };
    }
  };

  const status = getStatusConfig(reservation.status);

  return (
    <Card className="relative overflow-hidden border-border dark:border-white/5 bg-card dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl group transition-all hover:bg-secondary/50 dark:hover:bg-zinc-800/50">
      <div className={cn("absolute top-0 left-0 w-1 h-full", status.color.replace('text-', 'bg-'))} />
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-foreground font-black tracking-tighter uppercase text-sm">{reservation.guestName}</h3>
            <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase mt-0.5">Booking REF: {reservation.id.slice(0, 8)}</p>
          </div>
          <Badge className={cn("text-[9px] font-black uppercase tracking-tighter border shadow-none", status.bg, status.color, status.border)}>
            {status.label}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Calendar className="h-3 w-3 text-muted-foreground/60" />
              {format(new Date(reservation.date), 'MMM dd, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Users className="h-3 w-3 text-muted-foreground/60" />
              {reservation.guests} {reservation.guests > 1 ? 'Guests' : 'Guest'}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Home className="h-3 w-3 text-muted-foreground/60" />
              Room {reservation.roomNumber || 'TBD'}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <Mail className="h-3 w-3 text-muted-foreground/60" />
              <span className="truncate max-w-[80px]">Profile</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t border-border dark:border-white/5">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 h-8 rounded-lg bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 text-[10px] font-black uppercase tracking-widest transition-all"
            onClick={() => onViewDetails(reservation)}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Inspect
          </Button>
          
          {reservation.status === 'pending' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/20"
                onClick={() => onUpdateStatus(reservation.id, 'confirmed')}
                disabled={isUpdating}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Approve
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
                onClick={() => onUpdateStatus(reservation.id, 'cancelled')}
                disabled={isUpdating}
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Reject
              </Button>
            </>
          )}
          
          {reservation.status === 'confirmed' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 h-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/20"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Recall
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card dark:bg-zinc-900 border-border dark:border-white/10 text-foreground">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Confirm Cancellation</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground font-medium">
                    This will invalidate the guest's digital pass for this experience. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border-border dark:border-white/10 text-muted-foreground hover:text-foreground h-9">Back</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onUpdateStatus(reservation.id, 'cancelled')}
                    className="bg-rose-600 hover:bg-rose-500 text-white h-9"
                  >
                    Confirm Recall
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
