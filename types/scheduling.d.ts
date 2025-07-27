/**
 * @fileoverview Defines the data structures for the scheduling proof-of-concept.
 * These types are for the in-memory representation of the scheduling problem,
 * not necessarily the final database schema.
 */

/**
 * Represents a single employee with their qualifications and availability.
 */
export interface Employee {
  id: string;
  name: string;
  // e.g., ['EMT', 'Paramedic', 'Supervisor']
  qualifications: string[];
  // Could be expanded to include specific unavailability windows
  isAvailable: boolean;
}

/**
 * Represents a single work shift that needs to be filled.
 */
export interface Shift {
  id: string;
  // The start time of the shift
  startTime: Date;
  // The end time of the shift
  endTime: Date;
  // The qualification required for this shift, e.g., 'Paramedic'
  requiredQualification: string;
  // The employee assigned to this shift
  assignedEmployeeId?: string;
}

/**
 * Represents the entire schedule for a given period.
 */
export interface Schedule {
  // A list of all shifts to be scheduled
  shifts: Shift[];
  // A list of all employees available for the scheduling period
  employees: Employee[];
}
