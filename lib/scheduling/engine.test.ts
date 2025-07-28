import { describe, it, expect, vi } from 'vitest';
import { generateSchedule } from './engine';
import type {
  SchedulableEmployee,
  SchedulableShift,
  StaffingRequirement,
  Schedule,
  ShiftAssignment,
} from '@/types/scheduling';

// A more realistic set of mock data for robust testing
const mockEmployees: SchedulableEmployee[] = [
  {
    id: 'emp1_emt_day',
    name: 'John Doe',
    role: 'dispatcher',
    assignedPattern: null,
    shiftPreferences: [],
    qualifications: ['EMT', 'Dispatcher'],
    // Available for the day shift
    availability: [
      {
        start: new Date('2025-01-01T08:00:00Z'),
        end: new Date('2025-01-01T16:00:00Z'),
      },
    ],
  },
  {
    id: 'emp2_dispatcher_day',
    name: 'Jane Smith',
    role: 'dispatcher',
    assignedPattern: null,
    shiftPreferences: [],
    qualifications: ['Dispatcher'],
    // Available for the day shift
    availability: [
      {
        start: new Date('2025-01-01T08:00:00Z'),
        end: new Date('2025-01-01T16:00:00Z'),
      },
    ],
  },
  {
    id: 'emp3_dispatcher_night',
    name: 'Jim Brown',
    role: 'dispatcher',
    assignedPattern: null,
    shiftPreferences: [],
    qualifications: ['Dispatcher'],
    // Available for the night shift
    availability: [
      {
        start: new Date('2025-01-01T16:00:00Z'),
        end: new Date('2025-01-02T00:00:00Z'),
      },
    ],
  },
  {
    id: 'emp4_unqualified',
    name: 'Sue White',
    role: 'dispatcher',
    assignedPattern: null,
    shiftPreferences: [],
    qualifications: ['Receptionist'], // Not qualified for any shifts
    availability: [
      {
        start: new Date('2025-01-01T08:00:00Z'),
        end: new Date('2025-01-01T16:00:00Z'),
      },
    ],
  },
];

const mockShifts: SchedulableShift[] = [
  {
    id: 1,
    name: 'Day Shift',
    startTime: new Date('2025-01-01T08:00:00Z'),
    endTime: new Date('2025-01-01T16:00:00Z'),
    requiredQualifications: ['Dispatcher'],
    durationHours: 8,
  },
  {
    id: 2,
    name: 'Night Shift',
    startTime: new Date('2025-01-01T16:00:00Z'),
    endTime: new Date('2025-01-02T00:00:00Z'),
    requiredQualifications: ['Dispatcher'],
    durationHours: 8,
  },
];

const mockRequirements: StaffingRequirement[] = [
  {
    id: 'req_day_dispatcher',
    periodName: 'Day Dispatcher',
    startTime: '08:00:00',
    endTime: '16:00:00',
    minStaff: 2, // Require 2 dispatchers during the day
    minEmployees: 2,
    minSupervisors: 0,
  },
  {
    id: 'req_night_dispatcher',
    periodName: 'Night Dispatcher',
    startTime: '16:00:00',
    endTime: '00:00:00',
    minStaff: 1,
    minEmployees: 1,
    minSupervisors: 0,
  },
];

describe('Scheduling Engine - generateSchedule', () => {
  const startDate = new Date('2025-01-01T00:00:00Z');
  const endDate = new Date('2025-01-02T00:00:00Z');

  it('should assign employees to meet minimum staffing requirements', () => {
    const schedule = generateSchedule(
      mockEmployees,
      mockShifts,
      mockRequirements,
      startDate,
      endDate
    );

    const dayShiftAssignments = schedule.assignments.filter(
      (a) => a.shiftId === 1
    );
    const nightShiftAssignments = schedule.assignments.filter(
      (a) => a.shiftId === 2
    );

    // This will fail because the current engine logic is flawed.
    expect(dayShiftAssignments.length).toBe(2);
    expect(nightShiftAssignments.length).toBe(1);
  });

  it('should only assign qualified employees', () => {
    const schedule = generateSchedule(
      mockEmployees,
      mockShifts,
      mockRequirements,
      startDate,
      endDate
    );

    const isUnqualifiedEmployeeAssigned = schedule.assignments.some(
      (a) => a.employeeId === 'emp4_unqualified'
    );

    // This test ensures the qualification check is effective.
    expect(isUnqualifiedEmployeeAssigned).toBe(false);
  });

  it('should only assign available employees', () => {
    const schedule = generateSchedule(
      mockEmployees,
      mockShifts,
      mockRequirements,
      startDate,
      endDate
    );

    const dayShiftAssignments = schedule.assignments.filter(
      (a) => a.shiftId === 1
    );
    const nightShiftAssignments = schedule.assignments.filter(
      (a) => a.shiftId === 2
    );

    const isNightEmployeeOnDayShift = dayShiftAssignments.some(
      (a) => a.employeeId === 'emp3_dispatcher_night'
    );
    const isDayEmployeeOnNightShift = nightShiftAssignments.some(
      (a) =>
        a.employeeId === 'emp1_emt_day' ||
        a.employeeId === 'emp2_dispatcher_day'
    );

    // These will fail if the availability logic is incorrect.
    expect(isNightEmployeeOnDayShift).toBe(false);
    expect(isDayEmployeeOnNightShift).toBe(false);
  });

  it('should create a schedule with the correct total number of assignments', () => {
    const schedule = generateSchedule(
      mockEmployees,
      mockShifts,
      mockRequirements,
      startDate,
      endDate
    );

    // Total assignments should be 2 for day + 1 for night = 3
    expect(schedule.assignments.length).toBe(3);
  });

  it('should identify staffing gaps when no qualified employees are available', () => {
    const noQualifiedEmployees = [
      mockEmployees.find((e) => e.id === 'emp4_unqualified')!,
    ];
    const schedule = generateSchedule(
      noQualifiedEmployees,
      mockShifts,
      mockRequirements,
      startDate,
      endDate
    );

    expect(schedule.assignments.length).toBe(0);
    // The gap logic needs to be implemented correctly for this to pass.
    expect(schedule.gaps).toBeDefined();
    expect(schedule.gaps.length).toBeGreaterThan(0);
    expect(schedule.gaps[0].requirementId).toBe('req_day_dispatcher');
  });
});
