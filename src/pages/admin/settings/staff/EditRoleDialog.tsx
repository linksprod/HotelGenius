import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Shield, UserCog, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuthContext';
import type { StaffMember } from './StaffTable';

interface EditRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: StaffMember | null;
  onSuccess: () => void;
}

const ROLES = [
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Full access to all features' },
  { value: 'moderator', label: 'Moderator', icon: UserCog, description: 'Dashboard, Chat & Services' },
  { value: 'staff', label: 'Staff', icon: Users, description: 'Dashboard & Restaurants' },
] as const;

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  open,
  onOpenChange,
  member,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSelf = user?.id === member?.user_id;

  React.useEffect(() => {
    if (member && open) {
      setSelectedRole(member.role);
      setSelectedServiceType(member.service_type || '');
    }
  }, [member, open]);

  const handleSubmit = async () => {
    if (!member || !selectedRole || (selectedRole === member.role && selectedServiceType === (member.service_type || ''))) return;
    if (selectedRole === 'moderator' && !selectedServiceType) {
      toast({ title: 'Error', description: 'Please select a service type for the moderator', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await supabase.functions.invoke('update-staff-role', {
        body: {
          user_id: member.user_id,
          new_role: selectedRole,
          ...(selectedRole === 'moderator' && selectedServiceType ? { service_type: selectedServiceType } : {}),
        },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast({
        title: 'Role Updated',
        description: `${member.first_name} ${member.last_name} is now ${selectedRole}.`,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)} />}
      <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
        <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            Update the role for <strong>{member?.first_name} {member?.last_name}</strong>.
            Current role: <strong className="capitalize">{member?.role}</strong>
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-3 py-4">
          {ROLES.map(({ value, label, icon: Icon, description }) => {
            const disabled = isSelf && value !== 'admin';
            return (
              <Label
                key={value}
                htmlFor={`role-${value}`}
                className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors
                  ${selectedRole === value ? 'border-primary bg-primary/5' : 'border-border'}
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/50'}`}
              >
                <RadioGroupItem value={value} id={`role-${value}`} disabled={disabled} />
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <span className="font-medium">{label}</span>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </Label>
            );
          })}
        </RadioGroup>

        {selectedRole === 'moderator' && (
          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={selectedServiceType} onValueChange={setSelectedServiceType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="it_support">IT Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isSelf && (
          <p className="text-xs text-muted-foreground">You cannot demote yourself.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedRole || selectedRole === member?.role}
          >
            {isSubmitting ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditRoleDialog;
