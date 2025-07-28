// NOTE: This file is not a Server Action, but a server-side utility.
// It is designed to be called from server components or other server-side logic.

import { type SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Fetches the roles for a given user ID.
 * @param supabase The Supabase client instance.
 * @param userId The ID of the user to fetch roles for.
 * @returns A promise that resolves to an array of role names.
 */
async function fetchUserRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  // The result is an array of objects like [{ roles: { name: 'admin' } }]
  // We need to flatten it to ['admin']
  return data.map((item: any) => item.roles?.name).filter(Boolean) as string[];
}

/**
 * Fetches the roles for the currently authenticated user.
 * Creates its own Supabase client.
 * @returns A promise that resolves to an array of role names.
 */
export async function getCurrentUserRoles(): Promise<string[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  return fetchUserRoles(supabase, user.id);
}

/**
 * A higher-order function to check if the current user has one of the required roles.
 * @param requiredRoles An array of role names that are allowed.
 * @returns A promise that resolves to true if the user has at least one of the required roles, false otherwise.
 */
export async function userHasRole(requiredRoles: string[]): Promise<boolean> {
  const userRoles = await getCurrentUserRoles();
  return requiredRoles.some((role) => userRoles.includes(role));
}
