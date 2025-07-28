'use server';

import { createClient } from '@/lib/supabase/server';

export type StaffingRequirement = {
  id: number;
  period_name: string;
  start_time: string; // "HH:mm:ss"
  end_time: string; // "HH:mm:ss"
  min_employees: number;
  min_supervisors: number;
};

/**
 * Fetches all staffing requirements from the database.
 * @returns A promise that resolves to an array of staffing requirements.
 */
export async function getStaffingRequirements(): Promise<{
  data?: StaffingRequirement[];
  error?: string;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('staffing_requirements')
    .select('*');

  if (error) {
    console.error('Error fetching staffing requirements:', error);
    return { error: error.message };
  }

  return { data };
}
