'use server';

import { createClient } from '@/lib/supabase/server';
import { withRoleCheck } from '@/lib/actions/with-role-check';
import { revalidatePath } from 'next/cache';

/**
 * Fetches all users and their assigned roles.
 * Only accessible to admins.
 */
export const getUsersWithRoles = async () => {
  const hasPermission = await (
    await import('@/lib/supabase/queries/get-user-roles')
  ).userHasRole(['admin']);
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to perform this action.',
    };
  }

  const supabase = await createClient();

  const { data: users, error: usersError } = await supabase.from('profiles')
    .select(`
      id,
      full_name,
      email: users(email),
      roles: user_roles(roles(id, name))
    `);

  if (usersError) {
    console.error('Error fetching users with roles:', usersError);
    return { success: false, error: usersError.message };
  }

  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name');

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return { success: false, error: rolesError.message };
  }

  // The query returns a complex nested structure, so we flatten it for easier use on the client.
  const formattedUsers = users.map((user: any) => ({
    id: user.id,
    full_name: user.full_name,
    // @ts-ignore
    email: user.email?.email,
    // @ts-ignore
    role: user.roles[0]?.roles || { id: null, name: 'No Role' },
  }));

  return { success: true, data: { users: formattedUsers, roles } };
};

/**
 * Updates a user's role.
 * Only accessible to admins.
 */
export const updateUserRole = async (userId: string, newRoleId: number) => {
  const hasPermission = await (
    await import('@/lib/supabase/queries/get-user-roles')
  ).userHasRole(['admin']);
  if (!hasPermission) {
    return {
      success: false,
      error: 'Unauthorized: You do not have permission to perform this action.',
    };
  }

  const supabase = await createClient();

  // First, remove the user's existing role(s)
  const { error: deleteError } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (deleteError) {
    console.error('Error removing existing user role:', deleteError);
    return { success: false, error: deleteError.message };
  }

  // Then, add the new role
  const { error: insertError } = await supabase.from('user_roles').insert({
    user_id: userId,
    role_id: newRoleId,
  });

  if (insertError) {
    console.error('Error inserting new user role:', insertError);
    return { success: false, error: insertError.message };
  }

  // Revalidate the path to ensure the UI updates with the new role
  revalidatePath('/admin/users');

  return { success: true };
};
