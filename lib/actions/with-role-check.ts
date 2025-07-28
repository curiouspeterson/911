'use server';

import { userHasRole } from '@/lib/supabase/queries/get-user-roles';

type ActionResponse = {
  success: boolean;
  error?: string;
  data?: any;
};

type ServerAction<T extends any[]> = (...args: T) => Promise<ActionResponse>;

/**
 * A higher-order function that wraps a Server Action to add a role-based access check.
 *
 * @param requiredRoles - An array of role names that are permitted to execute the action.
 * @param action - The Server Action function to protect.
 * @returns A new function that performs the role check before executing the original action.
 *
 * @example
 * const adminOnlyAction = withRoleCheck(['admin'], async (formData: FormData) => {
 *   // ... action logic
 *   return { success: true, data: 'Admin task complete!' };
 * });
 */
export async function withRoleCheck<T extends any[]>(
  requiredRoles: string[],
  action: ServerAction<T>
): Promise<ServerAction<T>> {
  return (async (...args: T): Promise<ActionResponse> => {
    const hasPermission = await userHasRole(requiredRoles);

    if (!hasPermission) {
      console.warn(
        `Unauthorized Server Action attempt. Required roles: [${requiredRoles.join(', ')}]`
      );
      return {
        success: false,
        error:
          'Unauthorized: You do not have permission to perform this action.',
      };
    }

    return action(...args);
  }) as ServerAction<T>;
}
