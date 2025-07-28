'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

// Define the schema for profile updates
const ProfileSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters long.'),
  // Add other fields from the 'profiles' table here as needed
});

type ActionResponse = {
  success: boolean;
  error?: {
    message: string;
    fields?: Record<string, string>;
  };
  data?: any;
};

/**
 * Updates the profile for the currently authenticated user.
 * @param formData - The form data containing the user's profile information.
 * @returns A promise that resolves to an ActionResponse object.
 */
export async function updateUserProfile(
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: { message: 'Not authenticated' } };
  }

  const validatedFields = ProfileSchema.safeParse({
    full_name: formData.get('full_name'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: {
        message: 'Invalid form data.',
        fields: Object.fromEntries(
          Object.entries(validatedFields.error.flatten().fieldErrors).map(
            ([key, value]) => [
              key,
              Array.isArray(value) ? value.join(', ') : value || '',
            ]
          )
        ),
      },
    };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: validatedFields.data.full_name,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error: { message: error.message } };
  }

  // Revalidate the profile page to show the updated data
  revalidatePath('/protected/profile');

  return { success: true };
}
