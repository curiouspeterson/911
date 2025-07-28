/**
 * @fileoverview Proof-of-Concept for a TypeScript-native greedy scheduling algorithm.
 *
 * This script is intended to de-risk the core scheduling logic by validating
 * that a pure TypeScript approach can satisfy the most critical hard constraints
 * of the 911 dispatch scheduling problem.
 *
 * POC Scope:
 * - Focuses on a small, representative set of hard constraints.
 * - Ignores soft constraints (e.g., employee preferences).
 * - Uses in-memory mock data, not a database connection.
 * - The output is a console log of the generated schedule and any validation errors.
 */

// --- TYPE DEFINITIONS (Simulating database models) ---

type Role = 'dispatcher' | 'supervisor';
type ShiftPattern = '4x10'; // 4x 10-hour shifts, 3 days off

interface Employee {
  id: number;
  name: string;
  role: Role;
  pattern: ShiftPattern;
}

interface TimeOffRequest {
  employeeId: number;
  startDate: Date;
  endDate: Date;
}

interface Shift {
  id: number;
  name: string;
  startTime: { hours: number; minutes: number };
  endTime: { hours: number; minutes: number };
  durationHours: number;
}

interface StaffingRequirement {
  periodName: string;
  startTime: { hours: number; minutes: number };
  endTime: { hours: number; minutes: number };
  minEmployees: number;
  minSupervisors: number;
}

interface AssignedShift {
  employeeId: number;
  shiftId: number;
  date: Date;
}

interface Schedule {
  assignments: AssignedShift[];
}

interface EmployeeState {
  consecutiveDaysWorked: number;
  weeklyHours: number;
  // A map of date strings (YYYY-MM-DD) to boolean
  workDays: { [date: string]: boolean };
}

// --- MOCK DATA ---

const MOCK_EMPLOYEES: Employee[] = [
  { id: 1, name: 'Alice', role: 'dispatcher', pattern: '4x10' },
  { id: 2, name: 'Bob', role: 'dispatcher', pattern: '4x10' },
  { id: 3, name: 'Charlie', role: 'dispatcher', pattern: '4x10' },
  { id: 4, name: 'Diana', role: 'supervisor', pattern: '4x10' },
  { id: 5, name: 'Eve', role: 'dispatcher', pattern: '4x10' },
  { id: 6, name: 'Frank', role: 'dispatcher', pattern: '4x10' },
];

const MOCK_SHIFTS: Shift[] = [
  {
    id: 1,
    name: 'Day Shift',
    startTime: { hours: 7, minutes: 0 },
    endTime: { hours: 17, minutes: 0 },
    durationHours: 10,
  },
  {
    id: 2,
    name: 'Night Shift',
    startTime: { hours: 17, minutes: 0 },
    endTime: { hours: 3, minutes: 0 },
    durationHours: 10,
  },
];

const MOCK_STAFFING_REQUIREMENTS: StaffingRequirement[] = [
  {
    periodName: 'Day Coverage',
    startTime: { hours: 7, minutes: 0 },
    endTime: { hours: 17, minutes: 0 },
    minEmployees: 2,
    minSupervisors: 1,
  },
  {
    periodName: 'Night Coverage',
    startTime: { hours: 17, minutes: 0 },
    endTime: { hours: 3, minutes: 0 },
    minEmployees: 1,
    minSupervisors: 1,
  },
];

const MOCK_TIME_OFF: TimeOffRequest[] = [
  {
    employeeId: 1,
    startDate: new Date('2025-08-04'),
    endDate: new Date('2025-08-04'),
  },
];

// --- HELPER FUNCTIONS ---

/**
 * Utility to format a Date object into a 'YYYY-MM-DD' string.
 */
const toDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Gets the start of the week (Sunday) for a given date.
 */
const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

// --- CORE ALGORITHM ---

console.log('Starting Scheduling POC...');

// 1. Initialize data structures
const schedule: Schedule = { assignments: [] };
const employeeStates: { [id: number]: EmployeeState } = {};
MOCK_EMPLOYEES.forEach((e) => {
  employeeStates[e.id] = {
    consecutiveDaysWorked: 0,
    weeklyHours: 0,
    workDays: {},
  };
});

const startDate = new Date('2025-08-01');
const endDate = new Date('2025-08-14');

// 2. Block out time off
MOCK_TIME_OFF.forEach((req) => {
  for (
    let d = new Date(req.startDate);
    d <= req.endDate;
    d.setDate(d.getDate() + 1)
  ) {
    const dateStr = toDateString(d);
    // Mark as a "work" day to make them unavailable
    employeeStates[req.employeeId].workDays[dateStr] = true;
    console.log(
      `Marking Employee ${req.employeeId} as unavailable on ${dateStr} for Time Off.`
    );
  }
});

// 3. Main scheduling loop
for (
  let day = new Date(startDate);
  day <= endDate;
  day.setDate(day.getDate() + 1)
) {
  const dateStr = toDateString(day);
  console.log(`\n--- Scheduling for ${dateStr} ---`);

  // Reset weekly hours if it's the start of a new week (Sunday)
  if (day.getDay() === 0) {
    console.log(`New week detected. Resetting weekly hours for all employees.`);
    MOCK_EMPLOYEES.forEach((e) => (employeeStates[e.id].weeklyHours = 0));
  }

  for (const shift of MOCK_SHIFTS) {
    const requiredRoles: Role[] = [];
    const requirement = MOCK_STAFFING_REQUIREMENTS.find(
      (r) => r.startTime.hours === shift.startTime.hours
    );
    if (requirement) {
      for (let i = 0; i < requirement.minEmployees; i++)
        requiredRoles.push('dispatcher');
      for (let i = 0; i < requirement.minSupervisors; i++)
        requiredRoles.push('supervisor');
    }

    console.log(
      `Attempting to fill ${shift.name}. Need ${requirement?.minEmployees} dispatchers and ${requirement?.minSupervisors} supervisors.`
    );

    for (const requiredRole of requiredRoles) {
      const potentialCandidates = MOCK_EMPLOYEES.filter((e) => {
        const state = employeeStates[e.id];
        const worksToday = !!state.workDays[dateStr];
        const overHours = state.weeklyHours + shift.durationHours > 40;
        const tooManyConsecutiveDays = state.consecutiveDaysWorked >= 4;
        const incorrectRole = e.role !== requiredRole;

        return (
          !worksToday && !overHours && !tooManyConsecutiveDays && !incorrectRole
        );
      });

      if (potentialCandidates.length > 0) {
        const candidate = potentialCandidates[0]; // Simplest greedy choice
        const state = employeeStates[candidate.id];

        // Assign shift
        schedule.assignments.push({
          employeeId: candidate.id,
          shiftId: shift.id,
          date: new Date(day),
        });

        // Update state
        state.workDays[dateStr] = true;
        state.weeklyHours += shift.durationHours;
        state.consecutiveDaysWorked++;

        console.log(
          `  > Assigned ${candidate.name} (ID: ${candidate.id}) to ${shift.name}.`
        );
      } else {
        console.error(
          `  > FAILED to find an eligible candidate for ${requiredRole} on ${shift.name}.`
        );
      }
    }
  }

  // Reset consecutive days counter for employees who had a day off
  MOCK_EMPLOYEES.forEach((e) => {
    if (!employeeStates[e.id].workDays[dateStr]) {
      employeeStates[e.id].consecutiveDaysWorked = 0;
    }
  });
}

// 8. Final Validation
console.log('\n\n--- Final Schedule Validation ---');
const validationErrors: string[] = [];
for (
  let day = new Date(startDate);
  day <= endDate;
  day.setDate(day.getDate() + 1)
) {
  const dateStr = toDateString(day);
  for (const req of MOCK_STAFFING_REQUIREMENTS) {
    const assignmentsOnDayAndShift = schedule.assignments.filter((a) => {
      const shift = MOCK_SHIFTS.find((s) => s.id === a.shiftId);
      return (
        toDateString(a.date) === dateStr &&
        shift?.startTime.hours === req.startTime.hours
      );
    });

    const assignedEmployees = assignmentsOnDayAndShift.map((a) =>
      MOCK_EMPLOYEES.find((e) => e.id === a.employeeId)
    );
    const numEmployees = assignedEmployees.filter(
      (e) => e?.role === 'dispatcher'
    ).length;
    const numSupervisors = assignedEmployees.filter(
      (e) => e?.role === 'supervisor'
    ).length;

    if (numEmployees < req.minEmployees) {
      validationErrors.push(
        `[${dateStr}][${req.periodName}] Staffing GAP: Missing ${req.minEmployees - numEmployees} dispatcher(s).`
      );
    }
    if (numSupervisors < req.minSupervisors) {
      validationErrors.push(
        `[${dateStr}][${req.periodName}] Staffing GAP: Missing ${req.minSupervisors - numSupervisors} supervisor(s).`
      );
    }
  }
}

// 9. Log results
console.log('\n\n--- GENERATED SCHEDULE ---');
console.table(
  schedule.assignments.map((a) => ({
    Date: toDateString(a.date),
    Employee: MOCK_EMPLOYEES.find((e) => e.id === a.employeeId)?.name,
    Shift: MOCK_SHIFTS.find((s) => s.id === a.shiftId)?.name,
  }))
);

if (validationErrors.length > 0) {
  console.error('\n\n--- VALIDATION ERRORS ---');
  validationErrors.forEach((err) => console.error(err));
} else {
  console.log('\n\n--- VALIDATION PASSED ---');
  console.log('The generated schedule meets all staffing requirements.');
}

console.log('\nScheduling POC Finished.');
