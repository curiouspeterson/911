'use server';

import {
  getUserTimeOffRequests as dbGetUserTimeOffRequests,
  insertTimeOffRequest as dbInsertTimeOffRequest,
  getPendingTimeOffRequests as dbGetPendingTimeOffRequests,
  updateTimeOffRequestStatus as dbUpdateTimeOffRequestStatus,
  getUserShifts as dbGetUserShifts,
  getEligibleSwapEmployees as dbGetEligibleSwapEmployees,
  createSwapProposal as dbCreateSwapProposal,
  updateSwapProposalStatus as dbUpdateSwapProposalStatus,
} from '@/lib/supabase/queries';
import { createServerClient, createClient } from '@/lib/supabase/server';
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
      return { success: false, error: { message: 'Invalid data.' } };
    }

    const { shiftId, newUserId, newDate } = validatedFields.data;
    const supabase = await createClient();
    const { error } = await supabase
      .from('assigned_shifts')
      .update({ user_id: newUserId, shift_date: newDate })
      .eq('id', shiftId);

    if (error) return { success: false, error: { message: error.message } };
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

    if (error) return { success: false, error: { message: error.message } };
    revalidatePath('/schedule');
    return { success: true };
  }
);

// --- Time-Off Management ---

const TimeOffRequestSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
});

export const createTimeOffRequest = async (input: {
  startDate: Date;
  endDate: Date;
  reason?: string;
}) => {
  'use server';

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const validatedFields = TimeOffRequestSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Invalid data provided.',
    };
  }

  const { startDate, endDate, reason } = validatedFields.data;

  const { data, error } = await dbInsertTimeOffRequest({
    employee_id: user.id,
    start_date: startDate,
    end_date: endDate,
    reason: reason,
    status: 'pending',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/protected/profile'); // Or wherever the user's requests are displayed
  return { success: true, data };
};

export const getUserTimeOffRequests = async (supabaseClient?: any) => {
  'use server';

  const supabase = supabaseClient || (await createClient());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const { data, error } = await dbGetUserTimeOffRequests(user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
};

export const getPendingTimeOffRequests = withRoleCheck(
  ['supervisor', 'admin'],
  async () => {
    'use server';
    const { data, error } = await dbGetPendingTimeOffRequests();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
);

export const approveTimeOffRequest = withRoleCheck(
  ['supervisor', 'admin'],
  async (requestId: string) => {
    'use server';
    const { data, error } = await dbUpdateTimeOffRequestStatus(
      requestId,
      'approved'
    );
    if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath('/protected/supervisor/requests');
    return { success: true, data };
  }
);

export const denyTimeOffRequest = withRoleCheck(
  ['supervisor', 'admin'],
  async (requestId: string) => {
    'use server';
    const { data, error } = await dbUpdateTimeOffRequestStatus(
      requestId,
      'denied'
    );
    if (error) {
      return { success: false, error: error.message };
    }
    revalidatePath('/protected/supervisor/requests');
    return { success: true, data };
  }
);

// --- Swap Management ---

export const acceptSwap = async (proposalId: string) => {
  'use server';
  const { data, error } = await dbUpdateSwapProposalStatus(
    proposalId,
    'accepted'
  );
  if (error) {
    return { success: false, error: { message: error.message } };
  }
  revalidatePath('/protected/dashboard'); // Or wherever swap proposals are displayed
  return { success: true, data };
};

export const rejectSwap = async (proposalId: string) => {
  'use server';
  const { data, error } = await dbUpdateSwapProposalStatus(
    proposalId,
    'rejected'
  );
  if (error) {
    return { success: false, error: { message: error.message } };
  }
  revalidatePath('/protected/dashboard'); // Or wherever swap proposals are displayed
  return { success: true, data };
};

export const getUserShifts = async () => {
  'use server';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }
  const { data, error } = await dbGetUserShifts(user.id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
};

export const getEligibleSwapEmployees = async (shiftId: string) => {
  'use server';
  const { data, error } = await dbGetEligibleSwapEmployees(shiftId);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
};

export const proposeSwap = async (proposal: {
  fromShiftId: string;
  toEmployeeId: string;
}) => {
  'use server';
  const { data, error } = await dbCreateSwapProposal({
    from_shift_id: proposal.fromShiftId,
    to_employee_id: proposal.toEmployeeId,
    status: 'pending',
  });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, data };
};
