import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotelPath } from '@/hooks/useHotelPath';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  CalendarDays,
  Home,
  Users,
  DoorOpen,
  Clock,
  ArrowRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Guest, Room, Companion, GuestStatus } from './types';

interface GuestPageHeaderProps {
  guest: Guest;
  room: Room | null;
  companions: Companion[];
  status: GuestStatus;
}

const statusConfig: Record<NonNullable<GuestStatus>, {
  label: string;
  icon: React.ElementType;
  className: string;
}> = {
  'in-house': {
    label: 'IN-HOUSE',
    icon: Home,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  'arrivals': {
    label: 'ARRIVING TODAY',
    icon: ArrowRight,
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  'departures': {
    label: 'DEPARTING TODAY',
    icon: DoorOpen,
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  'upcoming': {
    label: 'UPCOMING',
    icon: CalendarDays,
    className: 'bg-muted text-muted-foreground border-border',
  },
  'past': {
    label: 'PAST GUEST',
    icon: Clock,
    className: 'bg-muted text-muted-foreground border-border',
  },
};

const GuestPageHeader: React.FC<GuestPageHeaderProps> = ({
  guest,
  room,
  companions,
  status,
}) => {
  const { guestId } = useParams<{ guestId: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();
  const config = status ? statusConfig[status] : null;
  const StatusIcon = config?.icon || CalendarDays;

  const formatStayDates = () => {
    if (!guest.check_in_date || !guest.check_out_date) return '—';
    const checkIn = format(new Date(guest.check_in_date), 'dd MMM');
    const checkOut = format(new Date(guest.check_out_date), 'dd MMM yyyy');
    const nights = differenceInDays(new Date(guest.check_out_date), new Date(guest.check_in_date));
    return `${checkIn} — ${checkOut} (${nights} night${nights !== 1 ? 's' : ''})`;
  };

  const getRoomInfo = () => {
    if (!guest.room_number) return 'Room #000';
    const roomType = room?.type || 'Standard Guest';
    return `Room #${guest.room_number} (${roomType})`;
  };

  const getOccupancy = () => {
    const adults = companions.filter(c => c.relation !== 'Child').length + 1;
    const children = companions.filter(c => c.relation === 'Child').length;
    const parts = [];
    parts.push(`${adults} Adult${adults > 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} Child${children > 1 ? 'ren' : ''}`);
    return parts.join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Back Link Row */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(resolvePath('/admin/guests'))}
          className="text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to guests
        </Button>

        {/* Status Badge */}
        {status ? (
          <Badge variant="outline" className={cn('font-semibold', config?.className)}>
            <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
            {config?.label}
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            NO STAY
          </Badge>
        )}
      </div>

      {/* Name and Subtitle */}
      <div>
        <h1 className="text-2xl font-bold">
          {guest.first_name} {guest.last_name}
        </h1>
        <p className="text-muted-foreground">360° Guest View</p>
      </div>

      {/* Context Bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {formatStayDates()}
        </span>
        <span className="flex items-center gap-1.5">
          <Home className="h-4 w-4" />
          {getRoomInfo()}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {getOccupancy()}
        </span>
      </div>
    </div>
  );
};

export default GuestPageHeader;
