import React, { useState, useEffect, useCallback } from 'react';
import { UserCog, Plus, RefreshCw, Search, Filter, Building2, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import StaffTable, { StaffMember } from './staff/StaffTable';
import CreateStaffDialog from './staff/CreateStaffDialog';
import DeleteStaffDialog from './staff/DeleteStaffDialog';
import EditRoleDialog from './staff/EditRoleDialog';
import { toast } from '@/hooks/use-toast';
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader';
import { useCurrentHotelId } from '@/hooks/useCurrentHotelId';
import { useUserRole } from '@/hooks/useUserRole';
import { format } from 'date-fns';

interface HotelAdmin {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  hotel_id: string;
  hotel_name: string;
}

interface HotelWithAdmins {
  hotel_id: string;
  hotel_name: string;
  admins: HotelAdmin[];
  isExpanded: boolean;
}

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
  const { isSuperAdmin } = useUserRole();

  // Hotel admins state
  const [hotelAdmins, setHotelAdmins] = useState<HotelWithAdmins[]>([]);
  const [isLoadingHotelAdmins, setIsLoadingHotelAdmins] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

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
      const guestsQuery = supabase
        .from('guests')
        .select('user_id, first_name, last_name, email')
        .in('user_id', userIds);

      const { data: guests } = await guestsQuery;

      // Fetch moderator service types
      const { data: modServices } = await supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from('moderator_services' as any)
        .select('user_id, service_type')
        .in('user_id', userIds);

      const guestMap = new Map(
        (guests || []).map((g) => [g.user_id, g])
      );

      const serviceMap = new Map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const fetchHotelAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    setIsLoadingHotelAdmins(true);
    try {
      // Fetch all hotels
      const { data: hotels, error: hotelsError } = await supabaseAdmin
        .from('hotels')
        .select('id, name')
        .order('name', { ascending: true });

      if (hotelsError) throw hotelsError;
      if (!hotels || hotels.length === 0) {
        setHotelAdmins([]);
        return;
      }

      // Fetch all admin roles across all hotels (both 'admin' and 'hotel_admin')
      const { data: adminRoles, error: rolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role, hotel_id, created_at')
        .in('role', ['admin', 'hotel_admin']);

      if (rolesError) throw rolesError;
      if (!adminRoles || adminRoles.length === 0) {
        setHotelAdmins(hotels.map((h) => ({
          hotel_id: h.id,
          hotel_name: h.name,
          admins: [],
          isExpanded: false,
        })));
        return;
      }

      // Fetch guest profiles for all admin user ids
      const adminUserIds = [...new Set(adminRoles.map((r) => r.user_id))];
      const { data: guests } = await supabaseAdmin
        .from('guests')
        .select('user_id, first_name, last_name, email')
        .in('user_id', adminUserIds);

      const guestMap = new Map((guests || []).map((g) => [g.user_id, g]));
      const hotelMap = new Map(hotels.map((h) => [h.id, h.name]));

      // Group admins by hotel
      const hotelAdminMap = new Map<string, HotelAdmin[]>();
      for (const role of adminRoles) {
        if (!role.hotel_id) continue;
        const guest = guestMap.get(role.user_id);
        const admin: HotelAdmin = {
          user_id: role.user_id,
          email: guest?.email || '',
          first_name: guest?.first_name || '',
          last_name: guest?.last_name || '',
          role: role.role,
          created_at: role.created_at || '',
          hotel_id: role.hotel_id,
          hotel_name: hotelMap.get(role.hotel_id) || 'Unknown Hotel',
        };
        const existing = hotelAdminMap.get(role.hotel_id) || [];
        existing.push(admin);
        hotelAdminMap.set(role.hotel_id, existing);
      }

      const result: HotelWithAdmins[] = hotels.map((h) => ({
        hotel_id: h.id,
        hotel_name: h.name,
        admins: hotelAdminMap.get(h.id) || [],
        isExpanded: true,
      }));

      setHotelAdmins(result);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load hotel admins',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHotelAdmins(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    fetchHotelAdmins();
  }, [fetchHotelAdmins]);

  const handleEditRole = (member: StaffMember) => {
    setStaffToEdit(member);
    setEditOpen(true);
  };

  const handleDelete = (member: StaffMember) => {
    setStaffToDelete(member);
    setDeleteOpen(true);
  };

  const toggleHotelExpand = (hotelId: string) => {
    setHotelAdmins((prev) =>
      prev.map((h) =>
        h.hotel_id === hotelId ? { ...h, isExpanded: !h.isExpanded } : h
      )
    );
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

  const filteredHotelAdmins = hotelAdmins
    .map((h) => ({
      ...h,
      admins: h.admins.filter((a) => {
        const q = adminSearch.toLowerCase();
        return (
          !q ||
          a.first_name.toLowerCase().includes(q) ||
          a.last_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          h.hotel_name.toLowerCase().includes(q)
        );
      }),
    }))
    .filter((h) => !adminSearch || h.admins.length > 0 || h.hotel_name.toLowerCase().includes(adminSearch.toLowerCase()));

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <AdminPageHeader
        title="Staff Management"
        description="Manage staff accounts and role assignments"
        icon={<UserCog className="h-5 w-5 text-primary" />}
        actions={
          <>
            <Button variant="outline" onClick={() => { fetchStaff(); fetchHotelAdmins(); }} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Staff
            </Button>
          </>
        }
      />

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

      {/* Hotel Admins Section — Super Admin only */}
      {isSuperAdmin && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Hotel Admins</h2>
              <Badge variant="secondary" className="text-xs">
                {hotelAdmins.reduce((acc, h) => acc + h.admins.length, 0)} admin{hotelAdmins.reduce((acc, h) => acc + h.admins.length, 0) !== 1 ? 's' : ''} · {hotelAdmins.length} hotel{hotelAdmins.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hotel or admin..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          {isLoadingHotelAdmins ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading hotel admins...
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHotelAdmins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Building2 className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">No hotels found</p>
                </div>
              ) : (
                filteredHotelAdmins.map((hotel) => (
                  <div key={hotel.hotel_id} className="rounded-lg border bg-card overflow-hidden">
                    {/* Hotel header */}
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => toggleHotelExpand(hotel.hotel_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{hotel.hotel_name}</span>
                          <span className="ml-3 text-xs text-muted-foreground">
                            {hotel.admins.length === 0
                              ? 'No admins'
                              : `${hotel.admins.length} admin${hotel.admins.length > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>
                      {hotel.admins.length > 0 && (
                        hotel.isExpanded
                          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* Admins list */}
                    {hotel.isExpanded && hotel.admins.length > 0 && (
                      <div className="border-t divide-y">
                        {hotel.admins.map((admin) => (
                          <div
                            key={admin.user_id}
                            className="flex items-center gap-4 px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors"
                          >
                            {/* Avatar initials */}
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-semibold">
                              {(admin.first_name?.[0] || admin.email?.[0] || '?').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {admin.first_name || admin.last_name
                                  ? `${admin.first_name} ${admin.last_name}`.trim()
                                  : '—'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                            </div>
                            <Badge variant="destructive" className="capitalize flex items-center gap-1 shrink-0">
                              <Shield className="h-3 w-3" />
                              {admin.role === 'hotel_admin' ? 'Hotel Admin' : admin.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                              {admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state for hotel */}
                    {hotel.isExpanded && hotel.admins.length === 0 && (
                      <div className="border-t px-4 py-4 text-center text-xs text-muted-foreground bg-muted/10">
                        No admins assigned to this hotel yet
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

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
