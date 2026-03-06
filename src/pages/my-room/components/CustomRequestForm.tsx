import React, { useState } from 'react';
import { Room } from '@/hooks/useRoom';
import { requestService } from '@/features/rooms/controllers/roomService';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserInfo } from '../hooks/useUserInfo';
interface CustomRequestFormProps {
  room: Room | null;
  onRequestSuccess: () => void;
}
const CustomRequestForm = ({
  room,
  onRequestSuccess
}: CustomRequestFormProps) => {
  const [customRequest, setCustomRequest] = useState('');
  const {
    toast
  } = useToast();
  const {
    getUserInfo
  } = useUserInfo(room);
  const handleCustomRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRequest.trim() || !room) return;

    console.log('Submitting custom request:', { room, customRequest });

    try {
      const userInfo = getUserInfo();
      console.log('User info for request:', userInfo);

      const result = await requestService(room.id, 'custom', customRequest, undefined, undefined);
      console.log('Request service result:', result);
      setCustomRequest('');
      toast({
        title: "Custom Request Sent",
        description: "Your custom request has been submitted."
      });
      onRequestSuccess();
    } catch (error) {
      console.error("Error submitting custom request:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    }
  };
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-secondary mb-6">Custom Request</h2>
      <form onSubmit={handleCustomRequest} className="space-y-4">
        <div>
          <Input
            placeholder="Describe your request..."
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          type="submit"
          disabled={!customRequest.trim() || !room}
          className="w-full sm:w-auto"
        >
          Submit Request
        </Button>
      </form>
    </div>
  );
};
export default CustomRequestForm;