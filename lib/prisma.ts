// Prisma client utility for 911 scheduling application
// Last updated: 2025-02-07 - Created Prisma client singleton

import { PrismaClient } from '../lib/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
