/**
 * @fileoverview The core scheduling engine for the 911 dispatch application.
 * This file contains the primary logic for generating a valid, constraint-based schedule.
 * Updated 2025-02-07: Fixed type issues and improved error handling
 */

import type {
  SchedulableEmployee,
  SchedulableShift,
  StaffingRequirement,
  Schedule,
  ShiftAssignment,
  StaffingGap,
} from '@/types/scheduling';
import { eachDayOfInterval, isWithinInterval } from 'date-fns';

/**
 * Checks if an employee is available to work a given shift.
 * @param employee - The employee to check.
 * @param shift - The shift to check against.
 * @returns True if the employee is available, false otherwise.
 */
function isEmployeeAvailable(
  employee: SchedulableEmployee,
  shift: SchedulableShift
): boolean {
  return employee.availability.some(
    (interval: { start: Date; end: Date }) =>
      isWithinInterval(shift.startTime, interval) &&
      isWithinInterval(shift.endTime, interval)
  );
}

/**
 * Checks if an employee has the necessary qualifications for a shift.
 * @param employee - The employee to check.
 * @param shift - The shift with required qualifications.
 * @returns True if the employee is qualified, false otherwise.
 */
function isEmployeeQualified(
  employee: SchedulableEmployee,
  shift: SchedulableShift
): boolean {
  return shift.requiredQualifications.every((q: string) =>
    employee.qualifications.includes(q)
  );
}

/**
 * Converts a time string to a Date object for comparison
 * @param timeString - Time string in "HH:mm:ss" format
 * @param baseDate - Base date to use for the time
 * @returns Date object with the specified time
 */
function timeStringToDate(timeString: string, baseDate: Date): Date {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, seconds || 0);
  return date;
}

/**
 * The main scheduling algorithm.
 * This function generates a schedule based on employees, shifts, and staffing requirements.
 * It follows a requirement-driven approach to ensure all staffing needs are met first.
 */
export function generateSchedule(
  employees: SchedulableEmployee[],
  shifts: SchedulableShift[],
  requirements: StaffingRequirement[],
  startDate: Date,
  endDate: Date
): Schedule {
  const assignments: ShiftAssignment[] = [];
  const gaps: StaffingGap[] = [];
  const assignedEmployeeIds = new Set<string>();

  // Iterate over each requirement to ensure it's met
  for (const requirement of requirements) {
    // Find the shift that corresponds to this requirement
    const correspondingShift = shifts.find((shift) => {
      const reqStartTime = timeStringToDate(requirement.startTime, startDate);
      const reqEndTime = timeStringToDate(requirement.endTime, startDate);
      return (
        shift.startTime.getTime() === reqStartTime.getTime() &&
        shift.endTime.getTime() === reqEndTime.getTime()
      );
    });

    if (!correspondingShift) {
      // If no shift matches the requirement, we can't fulfill it. This might be a configuration error.
      gaps.push({
        requirementId: requirement.id,
        missingStaff: requirement.minStaff,
        details: `No matching shift found for requirement ${requirement.id}.`,
      });
      continue;
    }

    // Find all employees who are qualified and available for this shift
    const potentialCandidates = employees.filter(
      (employee) =>
        !assignedEmployeeIds.has(employee.id) && // Not already assigned to another shift in this pass
        isEmployeeQualified(employee, correspondingShift) &&
        isEmployeeAvailable(employee, correspondingShift)
    );

    const numToAssign = Math.min(
      potentialCandidates.length,
      requirement.minStaff
    );

    // Assign employees up to the minimum staff requirement
    for (let i = 0; i < numToAssign; i++) {
      const employeeToAssign = potentialCandidates[i];
      assignments.push({
        employeeId: employeeToAssign.id,
        shiftId: correspondingShift.id,
        date: startDate, // Use the start date for now
      });
      assignedEmployeeIds.add(employeeToAssign.id);
    }

    // If we couldn't meet the minimum, record a gap
    if (numToAssign < requirement.minStaff) {
      gaps.push({
        requirementId: requirement.id,
        missingStaff: requirement.minStaff - numToAssign,
        details: `Could only find ${numToAssign} of ${requirement.minStaff} required staff.`,
      });
    }
  }

  const schedule: Schedule = {
    startDate,
    endDate,
    assignments,
    gaps,
  };

  return schedule;
}
