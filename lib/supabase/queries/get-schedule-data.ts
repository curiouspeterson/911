'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserRoles } from './get-user-roles';

export type ScheduleEvent = {
  id: number;
  title: string; // e.g., "Alice - Day Shift"
  start: Date;
  end: Date;
  allDay?: boolean;
  resourceId?: string; // e.g., user.id
  isOvertime: boolean;
};

type ScheduleFilters = {
  userId: string | null;
  roleId: number | null;
};

/**
 * Fetches schedule data for a given date range, respecting the user's role and applying filters.
 * Dispatchers see only their own schedule.
 * Supervisors and Admins see everyone's schedule, which can be filtered.
 *
 * @param startDate - The start of the date range.
 * @param endDate - The end of the date range.
 * @param filters - An optional object containing userId and/or roleId to filter by.
 * @returns A promise that resolves to an array of schedule events.
 */
export async function getScheduleData(
  startDate: Date,
  endDate: Date,
  filters?: ScheduleFilters
): Promise<{ data?: ScheduleEvent[]; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const userRoles = await getCurrentUserRoles();
  const isSupervisorOrAdmin =
    userRoles.includes('supervisor') || userRoles.includes('admin');

  let query = supabase
    .from('assigned_shifts')
    .select(
      `
      id,
      shift_date,
      is_overtime,
      user: profiles (id, full_name),
      shift: shifts (name, start_time, end_time)
    `
    )
    .gte('shift_date', startDate.toISOString())
    .lte('shift_date', endDate.toISOString());

  // Dispatchers can only see their own schedule
  if (!isSupervisorOrAdmin) {
    query = query.eq('user_id', user.id);
  } else {
    // Supervisors/Admins can filter
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    // Note: Role filtering would require a separate query or different approach
    // since we removed the nested joins for performance
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching schedule data:', error);
    return { error: error.message };
  }

  // Format the data into a structure that calendar components can easily consume
  const events: ScheduleEvent[] = data.map((item: any) => {
    const shiftDate = item.shift_date;
    const startTimeParts = item.shift.start_time.split(':');
    const endTimeParts = item.shift.end_time.split(':');

    const startDateTime = new Date(shiftDate);
    startDateTime.setUTCHours(
      parseInt(startTimeParts[0]),
      parseInt(startTimeParts[1]),
      parseInt(startTimeParts[2])
    );

    const endDateTime = new Date(shiftDate);
    endDateTime.setUTCHours(
      parseInt(endTimeParts[0]),
      parseInt(endTimeParts[1]),
      parseInt(endTimeParts[2])
    );

    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    return {
      id: item.id,
      title: `${item.user.full_name} - ${item.shift.name}`,
      start: startDateTime,
      end: endDateTime,
      resourceId: item.user.id,
      isOvertime: item.is_overtime,
    };
  });

  return { data: events };
}
