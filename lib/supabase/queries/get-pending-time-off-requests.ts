import { createClient } from '@/lib/supabase/server';

export async function getPendingTimeOffRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('time_off_requests')
    .select('*, employee:profiles(full_name)')
    .eq('status', 'pending')
    .order('start_date', { ascending: true });

  // The shape of the data will be different due to the join
  // We may need to adjust the component test later to match this
  const formattedData = data?.map((req: any) => ({
    id: req.id,
    employee_name: req.employee.full_name,
    start_date: req.start_date,
    end_date: req.end_date,
    reason: req.reason,
  }));

  return { data: formattedData, error };
}
