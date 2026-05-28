
import React, { useState } from 'react';
import { Search, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import { useHighlightedRequest } from '@/hooks/useHighlightedRequest';
import AssignToDropdown from '@/components/admin/AssignToDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRequestsData } from '@/hooks/useRequestsData';
import { format } from 'date-fns';
import { updateRequestStatus } from '@/features/rooms/controllers/roomService';

type MaintenanceRequestsTabProps = {
  categoryIds: string[];
};

const MaintenanceRequestsTab = ({ categoryIds }: MaintenanceRequestsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { requests, isLoading, handleRefresh } = useRequestsData();
  const { highlightedId, highlightRef } = useHighlightedRequest();
  
  const maintenanceRequests = requests.filter(
    request => 
      (categoryIds.includes(request.category_id || '') || request.type === 'maintenance') &&
      (
        (request.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         request.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         request.type?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
  );
  
  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return '';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'Pending';
      
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    }
  };
  
  const handleStatusChange = async (requestId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateRequestStatus(requestId, newStatus);
      handleRefresh();
      
      toast({
        title: "Status Updated",
        description: `Request has been ${newStatus.replace('_', ' ')}.`
      });
    } catch (error) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Maintenance & Technical Requests</CardTitle>
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests by room, guest name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : maintenanceRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    ref={request.id === highlightedId ? highlightRef : undefined}
                    className={request.id === highlightedId ? 'animate-pulse bg-primary/10 ring-2 ring-primary/30' : ''}
                  >
                    <TableCell className="font-medium">{request.room_number || 'N/A'}</TableCell>
                    <TableCell>{request.guest_name || 'Anonymous'}</TableCell>
                    <TableCell>
                      {request.request_items 
                        ? request.request_items.name 
                        : request.description || 'No description provided'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.created_at), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`${getStatusBadgeColor(request.status)} border`} 
                        variant="outline"
                        style={request.status === 'cancelled' ? { backgroundColor: '#f4b5ac', color: '#8b3a34', borderColor: '#e8a39f' } : undefined}
                      >
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end flex-nowrap gap-1">
                        {request.status !== 'completed' && request.status !== 'cancelled' && (
                          <AssignToDropdown
                            requestId={request.id}
                            serviceType="maintenance"
                            assignedToName={(request as any).assigned_to_name}
                            onAssigned={handleRefresh}
                          />
                        )}
                        {request.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center text-blue-600 whitespace-nowrap"
                            onClick={() => handleStatusChange(request.id, 'in_progress')}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        )}
                        
                        {(request.status === 'pending' || request.status === 'in_progress') && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center text-green-600 whitespace-nowrap"
                              onClick={() => handleStatusChange(request.id, 'completed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center text-red-600 whitespace-nowrap"
                              onClick={() => handleStatusChange(request.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No maintenance or technical requests found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceRequestsTab;
