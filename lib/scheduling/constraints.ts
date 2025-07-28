/**
 * @fileoverview A library of pure functions for checking scheduling constraints.
 */

import { EmployeeSchedulingState } from '@/types/scheduling';
import { isSameWeek } from 'date-fns';

/**
 * Checks if assigning a shift to an employee would violate their weekly hour limit.
 * @param state - The employee's current scheduling state.
 * @param shiftDuration - The duration of the shift in hours.
 * @returns True if the assignment would exceed 40 hours, false otherwise.
 */
export function hasExceededWeeklyHours(
  state: EmployeeSchedulingState,
  shiftDuration: number
): boolean {
  return state.weeklyHours + shiftDuration > 40;
}

/**
 * Checks if an employee can work on a given day based on their 4x10 pattern.
 * This is a simplified check for the POC. A full implementation would be more robust.
 * @param state - The employee's current scheduling state.
 * @returns True if assigning a shift would violate the 4-days-on pattern, false otherwise.
 */
export function isPatternAdherent(state: EmployeeSchedulingState): boolean {
  // This assumes a simple "no more than 4 days in a row" rule.
  return state.consecutiveDaysWorked < 4;
}

/**
 * Checks if an employee is already assigned a shift on a specific day.
 * @param state - The employee's current scheduling state.
 * @param date - The date to check.
 * @returns True if the employee is already working on that date, false otherwise.
 */
export function isAlreadyWorking(
  state: EmployeeSchedulingState,
  date: Date
): boolean {
  const dateString = date.toISOString().split('T')[0];
  return !!state.assignedShifts[dateString];
}

/**
 * Checks if an employee has had the required minimum time off between shifts.
 * (This is a placeholder for a more complex rule).
 * @param state - The employee's current scheduling state.
 * @param shiftStartTime - The start time of the potential new shift.
 * @returns True if the employee has had enough rest, false otherwise.
 */
export function hasSufficientRest(
  state: EmployeeSchedulingState,
  shiftStartTime: Date
): boolean {
  if (!state.lastDayOff) {
    return true; // No previous shift to compare against
  }
  // Example rule: Must have at least 8 hours between shifts.
  const hoursSinceLastShift =
    (shiftStartTime.getTime() - state.lastDayOff.getTime()) / (1000 * 60 * 60);
  return hoursSinceLastShift >= 8;
}
