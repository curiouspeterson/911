/**
 * @fileoverview Core data structures and type definitions for the scheduling algorithm.
 * Updated 2025-02-07: Added missing types and fixed type mismatches
 */

// Represents a single employee available for scheduling.
export interface SchedulableEmployee {
  id: string; // UUID from profiles table
  name: string;
  role: 'dispatcher' | 'supervisor' | 'admin';
  assignedPattern: '4x10' | '3x12_1x4' | null; // Example patterns
  shiftPreferences: number[]; // Array of shift IDs
  qualifications: string[]; // Array of qualification names
  availability: Array<{
    start: Date;
    end: Date;
  }>;
}

// Represents a shift template that can be assigned.
export interface SchedulableShift {
  id: number;
  name: string;
  startTime: Date; // Includes date and time
  endTime: Date; // Includes date and time
  durationHours: number;
  requiredQualifications: string[]; // Array of required qualification names
}

// Represents a single, assigned shift in the final schedule.
export interface AssignedShift {
  employeeId: string;
  shiftId: number;
  date: Date;
}

// Represents a shift assignment in the scheduling engine
export interface ShiftAssignment {
  employeeId: string;
  shiftId: number;
  date: Date;
}

// Defines the staffing requirements for a specific period of the day.
export interface StaffingRequirement {
  id: string;
  periodName: string;
  startTime: string; // "HH:mm:ss"
  endTime: string; // "HH:mm:ss"
  minStaff: number; // Minimum staff required
  minEmployees: number;
  minSupervisors: number;
}

// Represents a staffing gap when requirements cannot be met
export interface StaffingGap {
  requirementId: string;
  missingStaff: number;
  details: string;
}

// The main schedule object that the algorithm will build.
export interface Schedule {
  startDate: Date;
  endDate: Date;
  assignments: AssignedShift[];
  gaps: StaffingGap[]; // Staffing gaps that couldn't be filled
}

// Internal state used by the algorithm to track an employee's status.
export interface EmployeeSchedulingState {
  weeklyHours: number;
  consecutiveDaysWorked: number;
  lastDayOff: Date | null;
  assignedShifts: { [date: string]: number }; // Key: "YYYY-MM-DD", Value: shiftId
}
