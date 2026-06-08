import React from "react";
import { UserPlus, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useServiceModerators } from "@/hooks/useServiceModerators";
import { useToast } from "@/hooks/use-toast";

interface AssignToDropdownProps {
  requestId: string;
  serviceType: string;
  assignedToName?: string | null;
  onAssigned: () => void;
}

const AssignToDropdown = ({ requestId, serviceType, assignedToName, onAssigned }: AssignToDropdownProps) => {
  const { data: moderators = [], isLoading } = useServiceModerators(serviceType);
  const { toast } = useToast();

  const handleAssign = async (userId: string, name: string) => {
    // Fetch request details for notification message
    const { data: requestData } = await supabase
      .from("service_requests")
      .select("type, description, room_number, guest_name")
      .eq("id", requestId)
      .single();

    const { error } = await supabase
      .from("service_requests")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ assigned_to: userId, assigned_to_name: name } as any)
      .eq("id", requestId);

    if (error) {
      toast({ title: "Error", description: "Failed to assign request", variant: "destructive" });
      return;
    }

    // Create notification for the assigned staff member
    const reqType = serviceType || requestData?.type;
    const roomInfo = requestData?.room_number ? ` - Room ${requestData.room_number}` : "";
    const guestInfo = requestData?.guest_name ? ` from ${requestData.guest_name}` : "";
    const notifMessage = `${reqType}${roomInfo}${guestInfo}: ${requestData?.description || "No description"}`;

    await supabase.from("staff_notifications").insert({
      user_id: userId,
      type: "assignment",
      title: "New ticket assigned to you",
      message: notifMessage,
      reference_id: requestId,
      reference_type: "service_request",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    toast({ title: "Assigned", description: `Request assigned to ${name}` });
    onAssigned();
  };

  const handleUnassign = async () => {
    const { error } = await supabase
      .from("service_requests")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ assigned_to: null, assigned_to_name: null } as any)
      .eq("id", requestId);

    if (error) {
      toast({ title: "Error", description: "Failed to unassign request", variant: "destructive" });
      return;
    }

    toast({ title: "Unassigned", description: "Request has been unassigned" });
    onAssigned();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={assignedToName ? "default" : "outline"}
          size="sm"
          className="gap-1 whitespace-nowrap"
          style={assignedToName ? { backgroundColor: "#bde0a8", color: "#1f2937" } : undefined}
        >
          {assignedToName ? <User className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {assignedToName || "Assign"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border z-50 min-w-[160px]">
        {isLoading ? (
          <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
        ) : moderators.length === 0 ? (
          <DropdownMenuItem disabled>No moderators found</DropdownMenuItem>
        ) : (
          moderators.map((mod) => (
            <DropdownMenuItem key={mod.user_id} onClick={() => handleAssign(mod.user_id, mod.name)}>
              {mod.name}
            </DropdownMenuItem>
          ))
        )}
        {assignedToName && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUnassign} className="text-red-500">
              <X className="h-4 w-4 mr-1" />
              Unassign
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AssignToDropdown;
