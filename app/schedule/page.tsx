'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { DraggableScheduleCalendar } from '@/components/schedule/draggable-schedule-calendar';
import {
  ScheduleFilters,
  ScheduleFiltersState,
} from '@/components/schedule/schedule-filters';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type User = { id: string; full_name: string | null };
type Role = { id: number; name: string };

export default function SchedulePage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [filters, setFilters] = React.useState<ScheduleFiltersState>({
    userId: null,
    roleId: null,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSupervisor, setIsSupervisor] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();

    async function getInitialData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // Correctly fetch roles for the current user by joining user_roles and roles
          const { data: userRoles, error: rolesError } = await supabase
            .from('user_roles')
            .select('roles(name)')
            .eq('user_id', user.id);

          if (rolesError) throw rolesError;

          if (userRoles) {
            const roles = userRoles.map((r: any) => r.roles.name);
            if (roles.includes('supervisor') || roles.includes('admin')) {
              setIsSupervisor(true);
            }
          }
        }

        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name');
        if (usersError) throw usersError;

        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id, name');
        if (rolesError) throw rolesError;

        setUsers(usersData || []);
        setRoles(rolesData || []);
      } catch (error: any) {
        console.error('Error fetching initial data:', error);
        setError(`Could not load filter data: ${error.message}`);
      }
    }
    getInitialData();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Schedule</h1>
      </div>

      {isSupervisor && (
        <ScheduleFilters
          users={users}
          roles={roles}
          onFilterChange={setFilters}
        />
      )}

      <DraggableScheduleCalendar filters={filters} />
    </div>
  );
}
