// Example Prisma queries for 911 scheduling application
// Last updated: 2025-02-07 - Created example queries

import { prisma } from '../prisma';
import type {
  Role,
  Shift,
  Schedule,
  TimeOffRequest,
  employees,
  employee_roles,
} from '../../lib/generated/prisma';

export class PrismaQueries {
  // User and Profile queries - using employees instead of profile
  static async getUserWithRoles(userId: string) {
    return await prisma.employees.findUnique({
      where: { id: userId },
      include: {
        employee_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  static async getAllUsersWithRoles() {
    return await prisma.employees.findMany({
      include: {
        employee_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  static async getUsersByRole(roleName: string) {
    return await prisma.employees.findMany({
      where: {
        employee_roles: {
          some: {
            roles: {
              role: roleName as any, // Type assertion for enum compatibility
            },
          },
        },
      },
      include: {
        employee_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  // Shift queries
  static async getAllShifts() {
    return await prisma.shift.findMany({
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  static async getShiftById(shiftId: number) {
    return await prisma.shift.findUnique({
      where: { id: shiftId },
    });
  }

  // Schedule queries
  static async getCurrentSchedule() {
    const now = new Date();
    return await prisma.schedule.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
        is_published: true,
      },
      include: {
        shifts: {
          include: {
            employees: true,
          },
        },
      },
    });
  }

  static async getScheduleById(scheduleId: number) {
    return await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        shifts: {
          include: {
            employees: true,
          },
        },
      },
    });
  }

  // Employee Shift queries - using shifts directly since there's no AssignedShift model
  static async getUserShifts(userId: string, startDate: Date, endDate: Date) {
    return await prisma.shift.findMany({
      where: {
        assigned_employee_id: userId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        schedules: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  static async getShiftsForDate(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.shift.findMany({
      where: {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        employees: true,
        schedules: true,
      },
      orderBy: [{ startTime: 'asc' }, { employees: { first_name: 'asc' } }],
    });
  }

  // Time Off Request queries
  static async getUserTimeOffRequests(userId: string) {
    return await prisma.timeOffRequest.findMany({
      where: {
        employee_id: userId,
      },
      orderBy: {
        start_time: 'desc',
      },
    });
  }

  static async getPendingTimeOffRequests() {
    return await prisma.timeOffRequest.findMany({
      where: {
        status: 'pending',
      },
      include: {
        employees: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Note: The following models don't exist in the current schema:
  // - staffingRequirement
  // - shiftSwap
  // - notification
  // - auditLog
  // These would need to be added to the schema if required
}
