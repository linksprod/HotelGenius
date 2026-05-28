import React from 'react';
import { Search, Layers, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { useHighlightedRequest } from '@/hooks/useHighlightedRequest';
import AssignToDropdown from '@/components/admin/AssignToDropdown';
import { format } from 'date-fns';
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
import { useRequestCategories } from '@/hooks/useRequestCategories';
import { useRequestsData } from '@/hooks/useRequestsData';

type HousekeepingRequestsTabProps = {
  requestsSearchTerm: string;
  setRequestsSearchTerm: (term: string) => void;
  handleUpdateRequestStatus: (requestId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => Promise<void>;
};

const HousekeepingRequestsTab = ({
  requestsSearchTerm,
  setRequestsSearchTerm,
  handleUpdateRequestStatus,
}: HousekeepingRequestsTabProps) => {
  const { categories } = useRequestCategories();
  const { requests, isLoading: isRequestsLoading, handleRefresh } = useRequestsData();
  const { highlightedId, highlightRef } = useHighlightedRequest();

  const housekeepingCategory = categories.find(cat => cat.name === 'Housekeeping');
  
  const housekeepingRequests = requests.filter(
    req => {
      const isHousekeeping = 
        req.category_id === housekeepingCategory?.id || 
        req.type?.toLowerCase() === 'housekeeping' ||
        (req.request_items && req.request_items.category_id === housekeepingCategory?.id);
      
      const matchesSearch = 
        !requestsSearchTerm || 
        req.description?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
        req.guest_name?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
        req.room_number?.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
        (req.request_items && req.request_items.name.toLowerCase().includes(requestsSearchTerm.toLowerCase()));
      
      return isHousekeeping && matchesSearch;
    }
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return '';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Housekeeping Requests</CardTitle>
          <Button 
            onClick={handleRefresh}
            variant="outline"
          >
            <Layers className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={requestsSearchTerm}
              onChange={(e) => setRequestsSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {isRequestsLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : housekeepingRequests.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {housekeepingRequests.map((request) => (
                <TableRow
                  key={request.id}
                  ref={request.id === highlightedId ? highlightRef : undefined}
                  className={request.id === highlightedId ? 'animate-pulse bg-primary/10 ring-2 ring-primary/30' : ''}
                >
                  <TableCell className="font-medium">{request.room_number || '-'}</TableCell>
                  <TableCell>{request.guest_name || '-'}</TableCell>
                  <TableCell>
                    {request.request_items?.name || request.type}
                    {request.description && (
                      <p className="text-xs text-muted-foreground mt-1">{request.description}</p>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(request.status)}`}
                      style={request.status === 'cancelled' ? { backgroundColor: '#f4b5ac', color: '#8b3a34' } : undefined}
                    >
                      {request.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-nowrap">
                      {request.status !== 'completed' && request.status !== 'cancelled' && (
                        <AssignToDropdown
                          requestId={request.id}
                          serviceType="housekeeping"
                          assignedToName={(request as any).assigned_to_name}
                          onAssigned={handleRefresh}
                        />
                      )}
                      {request.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateRequestStatus(request.id, 'in_progress')}
                          className="gap-2"
                        >
                          <PlayCircle className="h-4 w-4" />
                          Start
                        </Button>
                      )}
                      
                      {(request.status === 'pending' || request.status === 'in_progress') && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateRequestStatus(request.id, 'completed')}
                            className="gap-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Complete
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateRequestStatus(request.id, 'cancelled')}
                            className="gap-2 text-red-500"
                          >
                            <XCircle className="h-4 w-4" />
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
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No housekeeping requests found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HousekeepingRequestsTab;
