import { createClient } from '@/lib/supabase/server';

export async function getUserShifts(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assigned_shifts')
    .select('*, shift:shifts(*)')
    .eq('user_id', userId)
    .gte('date', new Date().toISOString()) // Only upcoming shifts
    .order('date', { ascending: true });

  return { data, error };
}
