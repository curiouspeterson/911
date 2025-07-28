import { createClient } from '@/lib/supabase/server';

export async function updateTimeOffRequestStatus(
  requestId: string,
  status: 'approved' | 'denied'
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('time_off_requests')
    .update({ status })
    .eq('id', requestId)
    .select();

  return { data, error };
}
