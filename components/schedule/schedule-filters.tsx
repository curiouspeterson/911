'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type User = {
  id: string;
  full_name: string | null;
};

type Role = {
  id: number;
  name: string;
};

export type ScheduleFiltersState = {
  userId: string | null;
  roleId: number | null;
};

interface ScheduleFiltersProps {
  users: User[];
  roles: Role[];
  onFilterChange: (filters: ScheduleFiltersState) => void;
}

export function ScheduleFilters({
  users,
  roles,
  onFilterChange,
}: ScheduleFiltersProps) {
  const [filters, setFilters] = React.useState<ScheduleFiltersState>({
    userId: null,
    roleId: null,
  });

  const handleUserChange = (userId: string) => {
    const newFilters = { ...filters, userId: userId === 'all' ? null : userId };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRoleChange = (roleId: string) => {
    const newFilters = {
      ...filters,
      roleId: roleId === 'all' ? null : parseInt(roleId, 10),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { userId: null, roleId: null };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Select onValueChange={handleUserChange} value={filters.userId || 'all'}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by employee..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Employees</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        onValueChange={handleRoleChange}
        value={filters.roleId?.toString() || 'all'}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by role..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={clearFilters} variant="outline">
        Clear
      </Button>
    </div>
  );
}
