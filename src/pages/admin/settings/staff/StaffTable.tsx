import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Shield, UserCog, Users } from 'lucide-react';
import { format } from 'date-fns';

export interface StaffMember {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  service_type?: string;
  created_at: string;
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
  housekeeping: 'Housekeeping',
  maintenance: 'Maintenance',
  security: 'Security',
  it_support: 'IT Support',
};

interface StaffTableProps {
  staff: StaffMember[];
  isLoading: boolean;
  onEditRole: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
}

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'moderator':
      return 'default';
    case 'staff':
      return 'secondary';
    default:
      return 'outline';
  }
};

const roleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-3 w-3 mr-1" />;
    case 'moderator':
      return <UserCog className="h-3 w-3 mr-1" />;
    default:
      return <Users className="h-3 w-3 mr-1" />;
  }
};

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  isLoading,
  onEditRole,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading staff members...
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Users className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">No staff members found</p>
        <p className="text-sm">Create a new staff account to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.user_id}>
              <TableCell className="font-medium">
                {member.first_name} {member.last_name}
              </TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={roleBadgeVariant(member.role) as any} className="capitalize flex items-center w-fit">
                    {roleIcon(member.role)}
                    {member.role}
                  </Badge>
                  {member.role === 'moderator' && member.service_type && (
                    <Badge variant="outline" className="text-xs">
                      {SERVICE_TYPE_LABELS[member.service_type] || member.service_type}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {member.created_at
                  ? format(new Date(member.created_at), 'MMM d, yyyy')
                  : '—'}
              </TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditRole(member)}>
                      Change Role
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(member)}
                    >
                      Delete Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffTable;
