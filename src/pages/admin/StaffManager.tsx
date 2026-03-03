import React, { useState, useEffect, useCallback } from 'react';
import { UserCog, Plus, RefreshCw, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import StaffTable, { StaffMember } from './staff/StaffTable';
import CreateStaffDialog from './staff/CreateStaffDialog';
import DeleteStaffDialog from './staff/DeleteStaffDialog';
import EditRoleDialog from './staff/EditRoleDialog';
import { toast } from '@/hooks/use-toast';

import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';

const StaffManager: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const { hotelId } = useCurrentHotelId();

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get all user_roles for the current hotel that are not 'user'
      let query = supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .neq('role', 'user');

      if (hotelId) {
        query = query.eq('hotel_id', hotelId);
      }

      const { data: roles, error: rolesError } = await query;

      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) {
        setStaff([]);
        return;
      }

      // Get guest profiles for these users
      const userIds = roles.map((r) => r.user_id);
      let guestsQuery = supabase
        .from('guests')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      if (hotelId) {
        guestsQuery = guestsQuery.eq('hotel_id', hotelId);
      }

      const { data: guests } = await guestsQuery;

      // Fetch moderator service types
      const { data: modServices } = await supabase
        .from('moderator_services' as any)
        .select('user_id, service_type')
        .in('user_id', userIds);

      const guestMap = new Map(
        (guests || []).map((g) => [g.user_id, g])
      );

      const serviceMap = new Map(
        ((modServices as any[]) || []).map((s: any) => [s.user_id, s.service_type])
      );

      const staffList: StaffMember[] = roles.map((r) => {
        const guest = guestMap.get(r.user_id);
        return {
          user_id: r.user_id,
          email: guest?.email || '',
          first_name: guest?.first_name || '',
          last_name: guest?.last_name || '',
          role: r.role,
          service_type: serviceMap.get(r.user_id) || undefined,
          created_at: r.created_at || '',
        };
      });

      setStaff(staffList);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load staff members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleEditRole = (member: StaffMember) => {
    setStaffToEdit(member);
    setEditOpen(true);
  };

  const handleDelete = (member: StaffMember) => {
    setStaffToDelete(member);
    setDeleteOpen(true);
  };

  const filtered = staff.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.first_name.toLowerCase().includes(q) ||
      m.last_name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div id="admin-ob-staff-header" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage staff accounts and role assignments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchStaff}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Staff
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="moderator">Moderator</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <StaffTable
        staff={filtered}
        isLoading={isLoading}
        onEditRole={handleEditRole}
        onDelete={handleDelete}
      />

      {/* Create Dialog */}
      <CreateStaffDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchStaff}
      />

      {/* Delete Dialog */}
      <DeleteStaffDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        member={staffToDelete}
        onSuccess={fetchStaff}
      />

      {/* Edit Role Dialog */}
      <EditRoleDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        member={staffToEdit}
        onSuccess={fetchStaff}
      />
    </div>
  );
};

export default StaffManager;
