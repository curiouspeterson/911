// Test Prisma connection and basic functionality
// Last updated: 2025-02-07 - Updated to use introspected schema models

import { prisma } from '../prisma';

export async function testPrismaConnection() {
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Prisma connection successful');

    // Test a simple query - check if employees table exists
    const employeeCount = await prisma.employees.count();
    console.log(`✅ Found ${employeeCount} employees in database`);

    // Test role count
    const roleCount = await prisma.role.count();
    console.log(`✅ Found ${roleCount} roles in database`);

    // Test shift count
    const shiftCount = await prisma.shift.count();
    console.log(`✅ Found ${shiftCount} shifts in database`);

    // Test schedule count
    const scheduleCount = await prisma.schedule.count();
    console.log(`✅ Found ${scheduleCount} schedules in database`);

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
    await prisma.$disconnect();
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testPrismaConnection()
    .then((success) => {
      if (success) {
        console.log('🎉 All Prisma tests passed!');
        process.exit(0);
      } else {
        console.log('💥 Prisma tests failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}
