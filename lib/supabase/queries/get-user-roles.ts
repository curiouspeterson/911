'use server';

import { createServerClient } from '@/lib/supabase/server';
import { user_role } from '@/types/database.types';

export async function getUserRoles(): Promise<user_role[]> {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('employee_roles')
    .select('roles(role)')
    .eq('employee_id', user.id);

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data.map((item: any) => item.roles.role);
}
