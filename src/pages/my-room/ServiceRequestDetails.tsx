import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import { useServiceRequestDetail } from '@/hooks/useServiceRequestDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle2, XCircle, Clock, Loader2, FileText, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { ServiceRequest } from '@/features/rooms/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useHotelPath } from '@/hooks/useHotelPath';

const ServiceRequestDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resolvePath } = useHotelPath();

  // Use the dedicated hook for fetching single service request
  const {
    data: request,
    isLoading: isLoadingRequest,
    error: requestError,
    refetch: refetchRequest
  } = useServiceRequestDetail(id);

  // Use the general hook only for the cancel functionality
  const { cancelRequest } = useServiceRequests();

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Debug logs
  console.log('ServiceRequestDetails Debug:', {
    id,
    request,
    isLoadingRequest,
    requestError,
    hasRequest: !!request
  });

  const handleCancelRequest = async () => {
    if (!request) return;

    setIsUpdating(true);
    try {
      await cancelRequest(request.id);
      toast.success("Your request has been cancelled");
      setIsCancelDialogOpen(false);

      // Refetch the request to get updated data
      refetchRequest();
    } catch (error) {
      toast.error("Error cancelling the request");
      console.error("Error cancelling:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = () => {
    if (!request) return null;

    switch (request.status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'in_progress':
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (!request) return "";

    switch (request.status) {
      case 'completed': return "Completed";
      case 'in_progress': return "In Progress";
      case 'cancelled': return "Cancelled";
      default: return "Pending";
    }
  };

  const getStatusClass = () => {
    if (!request) return "";

    switch (request.status) {
      case 'completed': return "bg-green-100 text-green-800";
      case 'in_progress': return "bg-blue-100 text-blue-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTypeIcon = () => {
    return <FileText className="h-6 w-6" />;
  };

  const getTypeText = () => {
    return "Service Request";
  };

  // Check for missing ID first
  if (!id) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Request ID is missing</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate(resolvePath('/notifications'))}>
                Back to notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoadingRequest) {
    return (
      <Layout>
        <div className="container py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (requestError) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Error loading details: {requestError.message}
              </p>
              <div className="mt-4 text-center">
                <Button variant="outline" onClick={() => refetchRequest()}>
                  Retry
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate(resolvePath('/notifications'))}>
                Back to notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Unable to find the details of this request.</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate(resolvePath('/notifications'))}>
                Back to notifications
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  const isPending = request.status === 'pending';
  const isInProgress = request.status === 'in_progress';
  const isCompleted = request.status === 'completed';
  const isCancelled = request.status === 'cancelled';
  const creationDate = new Date(request.created_at);

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Your Request Details</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-full">
                  {getTypeIcon()}
                </div>
                <CardTitle>{getTypeText()}</CardTitle>
              </div>
              <Badge className={getStatusClass()}>{getStatusText()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {request.description && (
              <div className="text-gray-600">
                <p>{request.description}</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              Request created {formatDistanceToNow(creationDate, { addSuffix: true })}
            </div>

            <div className="pt-4">
              {isPending && (
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Request Pending</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Your request is being processed. Our team will handle it as soon as possible.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isInProgress && (
                <div className="rounded-md bg-blue-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Request In Progress</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Our team is currently handling your request.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Request Completed</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your request has been successfully processed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Request Cancelled</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>This request has been cancelled.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="pt-2 flex gap-3">
            <Button variant="outline" onClick={() => navigate(resolvePath('/my-room'))}>
              Back to My Room
            </Button>
            <Button variant="outline" onClick={() => navigate(resolvePath('/requests'))}>
              View All Requests
            </Button>

            {(isPending || isInProgress) && (
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                <Ban className="h-4 w-4" />
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cancel your request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this {getTypeText().toLowerCase()} request?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              No, keep my request
            </Button>
            <Button variant="destructive" onClick={handleCancelRequest} disabled={isUpdating}>
              {isUpdating ? 'Cancelling...' : 'Yes, cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ServiceRequestDetails;
