/**
 * @fileoverview The core scheduling engine.
 */

import {
  SchedulableEmployee,
  SchedulableShift,
  AssignedShift,
  Schedule,
  EmployeeSchedulingState,
  StaffingRequirement,
} from '@/types/scheduling';
import {
  hasExceededWeeklyHours,
  isPatternAdherent,
  isAlreadyWorking,
} from './constraints';
import { eachDayOfInterval, isSameDay } from 'date-fns';

/**
 * Validates the generated schedule against staffing requirements.
 * @param schedule - The generated schedule to validate.
 * @param requirements - A list of staffing requirements.
 * @returns An array of strings describing any coverage gaps.
 */
export function validateSchedule(
  schedule: Schedule,
  requirements: StaffingRequirement[]
): string[] {
  const gaps: string[] = [];
  const days = eachDayOfInterval({
    start: schedule.startDate,
    end: schedule.endDate,
  });

  for (const day of days) {
    const dateStr = day.toISOString().split('T')[0];
    const shiftsOnDay = schedule.assignments.filter((a) =>
      isSameDay(a.date, day)
    );

    for (const req of requirements) {
      const shiftsInPeriod = shiftsOnDay.filter((a) => {
        // This logic needs to be more robust to handle overnight shifts
        return true; // Placeholder
      });

      if (shiftsInPeriod.length < req.minEmployees) {
        gaps.push(
          `Gap on ${dateStr} for ${req.periodName}: Missing ${req.minEmployees - shiftsInPeriod.length} employees.`
        );
      }
    }
  }
  return gaps;
}

/**
 * Attempts to fill any gaps in the schedule.
 * @param schedule - The schedule with potential gaps.
 * @param employees - The list of all employees.
 * @param employeeStates - The current state of all employees.
 * @returns The updated schedule.
 */
export function fillGaps(
  schedule: Schedule,
  employees: SchedulableEmployee[],
  employeeStates: { [id: string]: EmployeeSchedulingState }
): Schedule {
  // This is a complex task. For the POC, we will just log the gaps.
  // A full implementation would try to assign overtime or adjust schedules.
  console.log('Gap filling logic would run here.');
  return schedule;
}

/**
 * The main scheduling algorithm.
 */
export function generateSchedule(
  employees: SchedulableEmployee[],
  shifts: SchedulableShift[],
  requirements: StaffingRequirement[],
  startDate: Date,
  endDate: Date
): Schedule {
  let schedule: Schedule = {
    startDate,
    endDate,
    assignments: [],
  };

  const employeeStates: { [id: string]: EmployeeSchedulingState } = {};
  for (const emp of employees) {
    employeeStates[emp.id] = {
      weeklyHours: 0,
      consecutiveDaysWorked: 0,
      lastDayOff: null,
      assignedShifts: {},
    };
  }

  const daysToSchedule = eachDayOfInterval({ start: startDate, end: endDate });

  for (const day of daysToSchedule) {
    const dateStr = day.toISOString().split('T')[0];

    for (const shift of shifts) {
      const requiredCount =
        requirements.find((r) => r.periodName === 'Day Coverage')
          ?.minEmployees || 0;
      let assignedCount = 0;

      for (const employee of employees) {
        if (assignedCount >= requiredCount) break;

        const state = employeeStates[employee.id];

        if (
          !isAlreadyWorking(state, day) &&
          isPatternAdherent(state) &&
          !hasExceededWeeklyHours(state, shift.durationHours)
        ) {
          const newAssignment = {
            employeeId: employee.id,
            shiftId: shift.id,
            date: day,
          };
          schedule.assignments.push(newAssignment);

          state.assignedShifts[dateStr] = shift.id;
          state.weeklyHours += shift.durationHours;
          state.consecutiveDaysWorked++;

          assignedCount++;
        }
      }
    }

    for (const emp of employees) {
      if (!employeeStates[emp.id].assignedShifts[dateStr]) {
        employeeStates[emp.id].consecutiveDaysWorked = 0;
        employeeStates[emp.id].lastDayOff = day;
      }
    }
  }

  // Final pass to fill gaps
  schedule = fillGaps(schedule, employees, employeeStates);

  return schedule;
}
