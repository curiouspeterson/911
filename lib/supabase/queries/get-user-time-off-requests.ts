import { createClient } from '@/lib/supabase/server';

export async function getUserTimeOffRequests(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('employee_id', userId)
    .order('start_date', { ascending: false });

  return { data, error };
}
