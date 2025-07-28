'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { updateUserRole } from '@/app/actions/admin-actions';
import { useToast } from '@/components/ui/use-toast';

type User = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: {
    id: number | null;
    name: string;
  };
};

type Role = {
  id: number;
  name: string;
};

interface UserRolesTableProps {
  initialUsers: User[];
  allRoles: Role[];
}

export function UserRolesTable({
  initialUsers,
  allRoles,
}: UserRolesTableProps) {
  const [users, setUsers] = React.useState(initialUsers);
  const [pendingChanges, setPendingChanges] = React.useState<{
    [userId: string]: number;
  }>({});
  const [isSaving, setIsSaving] = React.useState<{ [userId: string]: boolean }>(
    {}
  );
  const { toast } = useToast();

  const handleRoleChange = (userId: string, newRoleId: string) => {
    setPendingChanges((prev) => ({
      ...prev,
      [userId]: parseInt(newRoleId, 10),
    }));
  };

  const handleSaveChanges = async (userId: string) => {
    const newRoleId = pendingChanges[userId];
    if (!newRoleId) return;

    setIsSaving((prev) => ({ ...prev, [userId]: true }));

    const { success, error } = await updateUserRole(userId, newRoleId);

    if (success) {
      // Update local state to reflect the change
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, role: allRoles.find((r) => r.id === newRoleId)! }
            : user
        )
      );
      // Remove the change from pending
      setPendingChanges((prev) => {
        const newPending = { ...prev };
        delete newPending[userId];
        return newPending;
      });
      toast({
        title: 'Success',
        description: 'User role updated successfully.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error || 'Failed to update user role.',
      });
    }

    setIsSaving((prev) => ({ ...prev, [userId]: false }));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.full_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Select
                defaultValue={user.role.id?.toString()}
                onValueChange={(newRoleId) =>
                  handleRoleChange(user.id, newRoleId)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {allRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell className="text-right">
              <Button
                onClick={() => handleSaveChanges(user.id)}
                disabled={!pendingChanges[user.id] || isSaving[user.id]}
                size="sm"
              >
                {isSaving[user.id] ? 'Saving...' : 'Save'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
