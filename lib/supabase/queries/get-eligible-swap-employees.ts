import { createClient } from '@/lib/supabase/server';

export async function getEligibleSwapEmployees(shiftId: string) {
  const supabase = await createClient();
  // This is a complex query. For now, we will just return all employees.
  // A real implementation would check for qualifications, availability, etc.
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name');

  return { data, error };
}
