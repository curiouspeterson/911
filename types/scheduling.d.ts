/**
 * @fileoverview Core data structures and type definitions for the scheduling algorithm.
 */

// Represents a single employee available for scheduling.
export interface SchedulableEmployee {
  id: string; // UUID from profiles table
  name: string;
  role: 'dispatcher' | 'supervisor' | 'admin';
  assignedPattern: '4x10' | '3x12_1x4' | null; // Example patterns
  shiftPreferences: number[]; // Array of shift IDs
}

// Represents a shift template that can be assigned.
export interface SchedulableShift {
  id: number;
  name: string;
  startTime: Date; // Includes date and time
  endTime: Date; // Includes date and time
  durationHours: number;
}

// Represents a single, assigned shift in the final schedule.
export interface AssignedShift {
  employeeId: string;
  shiftId: number;
  date: Date;
}

// Defines the staffing requirements for a specific period of the day.
export interface StaffingRequirement {
  periodName: string;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  minEmployees: number;
  minSupervisors: number;
}

// The main schedule object that the algorithm will build.
export interface Schedule {
  startDate: Date;
  endDate: Date;
  assignments: AssignedShift[];
}

// Internal state used by the algorithm to track an employee's status.
export interface EmployeeSchedulingState {
  weeklyHours: number;
  consecutiveDaysWorked: number;
  lastDayOff: Date | null;
  assignedShifts: { [date: string]: number }; // Key: "YYYY-MM-DD", Value: shiftId
}
