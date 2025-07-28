'use server';

import { createClient } from '@/lib/supabase/server';
import { generateSchedule } from '@/lib/scheduling/engine';
import {
  SchedulableEmployee,
  SchedulableShift,
  StaffingRequirement,
} from '@/types/scheduling';
import { withRoleCheck } from '@/lib/actions/with-role-check';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- Data Fetching ---

async function getSchedulingData() {
  const supabase = await createClient();
  const { data: employees, error: empError } = await supabase
    .from('profiles')
    .select('*');
  const { data: shifts, error: shiftError } = await supabase
    .from('shifts')
    .select('*');
  const { data: requirements, error: reqError } = await supabase
    .from('staffing_requirements')
    .select('*');

  if (empError || shiftError || reqError) {
    console.error(
      'Error fetching scheduling data:',
      empError || shiftError || reqError
    );
    throw new Error('Failed to fetch necessary data for scheduling.');
  }

  const formattedEmployees: SchedulableEmployee[] = employees.map((e: any) => ({
    id: e.id,
    name: e.full_name,
    role: 'dispatcher', // Default role, can be enhanced later
    assignedPattern: e.assigned_pattern,
    shiftPreferences: [],
  }));

  return { employees: formattedEmployees, shifts, requirements };
}

// --- Schedule Generation ---

export const generateScheduleAction = withRoleCheck(
  ['supervisor', 'admin'],
  async (startDate: Date, endDate: Date) => {
    const supabase = await createClient();
    try {
      const { employees, shifts, requirements } = await getSchedulingData();
      const newSchedule = generateSchedule(
        employees,
        shifts,
        requirements,
        startDate,
        endDate
      );
      const { data: scheduleEntry, error: scheduleError } = await supabase
        .from('schedules')
        .insert({ start_date: startDate, end_date: endDate, status: 'draft' })
        .select()
        .single();
      if (scheduleError) throw scheduleError;

      const assignmentsToInsert = newSchedule.assignments.map((a) => ({
        user_id: a.employeeId,
        shift_id: a.shiftId,
        schedule_id: scheduleEntry.id,
        shift_date: a.date,
      }));
      const { error: assignmentError } = await supabase
        .from('assigned_shifts')
        .insert(assignmentsToInsert);
      if (assignmentError) throw assignmentError;

      revalidatePath('/schedule');
      return { success: true, data: { scheduleId: scheduleEntry.id } };
    } catch (error: any) {
      console.error('Error generating schedule:', error);
      return { success: false, error: error.message };
    }
  }
);

// --- Shift Management (CRUD) ---

const ShiftUpdateSchema = z.object({
  shiftId: z.number().int(),
  newUserId: z.string().uuid(),
  newDate: z.string().datetime(),
});

export const updateAssignedShift = withRoleCheck(
  ['supervisor', 'admin'],
  async (formData: FormData) => {
    const validatedFields = ShiftUpdateSchema.safeParse(
      Object.fromEntries(formData.entries())
    );
    if (!validatedFields.success) {
      return { success: false, error: 'Invalid data.' };
    }

    const { shiftId, newUserId, newDate } = validatedFields.data;
    const supabase = await createClient();
    const { error } = await supabase
      .from('assigned_shifts')
      .update({ user_id: newUserId, shift_date: newDate })
      .eq('id', shiftId);

    if (error) return { success: false, error: error.message };
    revalidatePath('/schedule');
    return { success: true };
  }
);

export const createAssignedShift = withRoleCheck(
  ['supervisor', 'admin'],
  async (formData: FormData) => {
    // ... implementation for creating a new shift
    revalidatePath('/schedule');
    return { success: true };
  }
);

export const deleteAssignedShift = withRoleCheck(
  ['supervisor', 'admin'],
  async (shiftId: number) => {
    const supabase = await createClient();
    const { error } = await supabase
      .from('assigned_shifts')
      .delete()
      .eq('id', shiftId);

    if (error) return { success: false, error: error.message };
    revalidatePath('/schedule');
    return { success: true };
  }
);
