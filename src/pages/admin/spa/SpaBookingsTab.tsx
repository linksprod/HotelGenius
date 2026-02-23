
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Calendar, Clock, User, Phone, Mail, MapPin, FileText, Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSpaBookings } from '@/hooks/useSpaBookings';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { SpaBooking } from '@/features/spa/types';
import { useAdminNotifications } from '@/hooks/admin/useAdminNotifications';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useSpaServices } from '@/hooks/useSpaServices';

interface SpaService {
  id: string;
  name: string;
  facility_id: string | null;
}

interface SpaBookingsTabProps {
  onServiceSelected?: (id: string | null) => void;
}

export default function SpaBookingsTab({ onServiceSelected }: SpaBookingsTabProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const { hotelId, isSuperAdmin } = useCurrentHotelId();
  const { bookings, isLoading: isLoadingBookings, updateBookingStatus, refetch } = useSpaBookings();
  const { services, isLoading: isLoadingServices, error: servicesError } = useSpaServices();
  const { spaServiceCounts, markSectionSeen } = useAdminNotifications();

  useEffect(() => {
    if (servicesError) {
      console.error('Error loading spa services:', servicesError);
      toast.error('Error loading spa services');
    }
  }, [servicesError]);

  const getNewCount = (serviceId: string) => spaServiceCounts[serviceId] || 0;

  const getTotalCount = (serviceId: string) =>
    bookings.filter((b: SpaBooking) => b.service_id === serviceId).length;

  const handleSelectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    onServiceSelected?.(serviceId);
    markSectionSeen(`spa:${serviceId}`);
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  const filteredBookings = bookings.filter((booking: SpaBooking & { spa_services?: { name: string } }) => {
    if (booking.service_id !== selectedServiceId) return false;
    const matchesSearch =
      (booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room_number?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus({ id: bookingId, status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus({ id: bookingId, status: 'cancelled' });
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Error cancelling booking');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const renderBookingCard = (booking: SpaBooking & { spa_services?: { name: string } }) => {
    const bookingDate = new Date(booking.date);
    const formattedDate = format(bookingDate, 'EEEE, MMMM d, yyyy', { locale: enUS });

    return (
      <Card key={booking.id} className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg">{booking.guest_name}</CardTitle>
          </div>
          <Badge className={getStatusBadgeColor(booking.status)}>
            {getStatusText(booking.status)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{booking.time}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{booking.guest_name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">{booking.guest_email}</span>
              </div>
              {booking.guest_phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{booking.guest_phone}</span>
                </div>
              )}
              {booking.room_number && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Room {booking.room_number}</span>
                </div>
              )}
            </div>
          </div>

          {booking.special_requests && (
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Special requests</span>
              </div>
              <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <>
                <Label className="text-sm mr-2">Status:</Label>
                <Select
                  defaultValue={booking.status}
                  onValueChange={(value) => handleStatusChange(booking.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}

            {booking.status === 'pending' && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCancelBooking(booking.id)}
                className="ml-auto"
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Level 1: Services list
  if (!selectedServiceId) {
    return (
      <div className="p-4">
        {isLoadingBookings || isLoadingServices ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-8 px-4 border rounded-lg bg-gray-50 border-dashed">
            <RefreshCw className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No spa services found for this hotel.</p>
            <p className="text-xs text-muted-foreground mt-1">Please add services in the 'Services' tab first.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((service) => {
              const newCount = getNewCount(service.id);
              const totalCount = getTotalCount(service.id);
              return (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectService(service.id)}
                >
                  <CardContent className="flex items-center justify-between py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{service.name}</span>
                      {newCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {newCount}
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {totalCount} booking{totalCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Level 2: Bookings for selected service
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedServiceId(null);
              onServiceSelected?.(null);
              setSearchTerm('');
              setStatusFilter('all');
              setDateFilter('');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-2xl font-bold">{selectedService?.name}</h2>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          className="flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="search" className="text-sm">Search</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Name, email, room..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="status-filter" className="text-sm">Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date-filter" className="text-sm">Date</Label>
          <Input
            id="date-filter"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      {isLoadingBookings ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <div>
          {filteredBookings.map(renderBookingCard)}
        </div>
      )}
    </div>
  );
}
