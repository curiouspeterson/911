/**
 * @fileoverview Proof-of-Concept for the scheduling engine.
 * This script simulates the output of a constraint solver to de-risk the data model
 * and downstream components without requiring a native OR-Tools dependency.
 */

import { Employee, Shift, Schedule } from '@/types/scheduling';

// --- 1. DUMMY DATA ---
// This data represents the input to the scheduling problem.

const employees: Employee[] = [
  {
    id: 'emp_01',
    name: 'Alice',
    qualifications: ['Paramedic', 'EMT'],
    isAvailable: true,
  },
  { id: 'emp_02', name: 'Bob', qualifications: ['EMT'], isAvailable: true },
  {
    id: 'emp_03',
    name: 'Charlie',
    qualifications: ['Supervisor', 'Paramedic'],
    isAvailable: true,
  },
  { id: 'emp_04', name: 'Diana', qualifications: ['EMT'], isAvailable: false }, // Not available
];

const shifts: Shift[] = [
  // Day 1
  {
    id: 'shift_01',
    startTime: new Date('2025-12-01T08:00:00'),
    endTime: new Date('2025-12-01T16:00:00'),
    requiredQualification: 'Paramedic',
  },
  {
    id: 'shift_02',
    startTime: new Date('2025-12-01T08:00:00'),
    endTime: new Date('2025-12-01T16:00:00'),
    requiredQualification: 'EMT',
  },
  {
    id: 'shift_03',
    startTime: new Date('2025-12-01T16:00:00'),
    endTime: new Date('2025-12-02T00:00:00'),
    requiredQualification: 'Paramedic',
  },
  {
    id: 'shift_04',
    startTime: new Date('2025-12-01T16:00:00'),
    endTime: new Date('2025-12-02T00:00:00'),
    requiredQualification: 'EMT',
  },
  // Day 2
  {
    id: 'shift_05',
    startTime: new Date('2025-12-02T08:00:00'),
    endTime: new Date('2025-12-02T16:00:00'),
    requiredQualification: 'Paramedic',
  },
  {
    id: 'shift_06',
    startTime: new Date('2025-12-02T08:00:00'),
    endTime: new Date('2025-12-02T16:00:00'),
    requiredQualification: 'EMT',
  },
  {
    id: 'shift_07',
    startTime: new Date('2025-12-02T16:00:00'),
    endTime: new Date('2025-12-03T00:00:00'),
    requiredQualification: 'Paramedic',
  },
  {
    id: 'shift_08',
    startTime: new Date('2025-12-02T16:00:00'),
    endTime: new Date('2025-12-03T00:00:00'),
    requiredQualification: 'EMT',
  },
];

const schedule: Schedule = {
  employees,
  shifts,
};

// --- 2. MOCK SOLVER ---
// This function simulates the behavior of a constraint solver.
// It takes the schedule input and returns a valid assignment of employees to shifts.

function solveScheduleMock(scheduleData: Schedule): {
  [shiftId: string]: string;
} {
  const assignments: { [shiftId: string]: string } = {};
  const assignedEmployees = new Set<string>();

  const availableEmployees = scheduleData.employees.filter(
    (e) => e.isAvailable
  );

  for (const shift of scheduleData.shifts) {
    // Find an employee who is qualified and not already assigned to an overlapping shift
    // (This mock is simplified and doesn't check for overlaps, just assigns one shift per employee for now)
    const suitableEmployee = availableEmployees.find(
      (emp) =>
        emp.qualifications.includes(shift.requiredQualification) &&
        !assignedEmployees.has(emp.id)
    );

    if (suitableEmployee) {
      assignments[shift.id] = suitableEmployee.id;
      // For this simple mock, assume one shift is enough to make an employee "busy"
      assignedEmployees.add(suitableEmployee.id);
    } else {
      assignments[shift.id] = 'unassigned';
    }
  }

  // A simple round-robin assignment for the rest
  let empIndex = 0;
  for (const shift of scheduleData.shifts) {
    if (assignments[shift.id] === 'unassigned') {
      let assigned = false;
      let attempts = 0;
      while (!assigned && attempts < availableEmployees.length) {
        const emp = availableEmployees[empIndex];
        if (emp.qualifications.includes(shift.requiredQualification)) {
          assignments[shift.id] = emp.id;
          assigned = true;
        }
        empIndex = (empIndex + 1) % availableEmployees.length;
        attempts++;
      }
    }
  }

  return assignments;
}

// --- 3. RUN and ANALYZE ---
function runPoc() {
  console.log('--- Starting Scheduling POC (Mock Solver) ---');
  console.log(
    'Employees:',
    schedule.employees.map((e) => e.name)
  );
  console.log('Shifts to schedule:', schedule.shifts.length);

  const assignments = solveScheduleMock(schedule);

  console.log('\n--- Scheduling Result ---');
  for (const shiftId in assignments) {
    const shift = schedule.shifts.find((s) => s.id === shiftId);
    const employee = schedule.employees.find(
      (e) => e.id === assignments[shiftId]
    );
    if (shift) {
      console.log(
        `Shift #${shift.id} (${shift.requiredQualification}) assigned to: ${employee ? employee.name : 'UNASSIGNED'}`
      );
    }
  }

  console.log('\n--- Scheduling POC Complete ---');
}

// Run the POC
runPoc();
