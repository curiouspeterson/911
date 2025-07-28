/**
 * @fileoverview Seeds the database with realistic test data.
 * This script is designed to be idempotent, meaning it can be run multiple times
 * without creating duplicate data. It first cleans up existing data and then repopulates.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';

// --- CONFIGURATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Supabase URL and service role key are required in .env.local'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const NUM_DISPATCHERS = 15;
const NUM_SUPERVISORS = 4;
const ADMIN_EMAIL = 'admin@example.com';
const USER_PASSWORD = 'password123';

/**
 * Deletes all existing data from the public tables in the correct order.
 */
async function cleanupData() {
  console.log('--- Cleaning up existing data ---');
  // Order is important to avoid foreign key violations
  await supabase.from('user_roles').delete().neq('role_id', 0);
  await supabase
    .from('profiles')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('shifts').delete().neq('id', 0);
  await supabase.from('staffing_requirements').delete().neq('id', 0);

  // Delete all users except the admin user
  const {
    data: { users },
    error,
  } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users for cleanup:', error);
    return;
  }
  for (const user of users) {
    if (user.email !== ADMIN_EMAIL) {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }
  console.log('Cleanup complete.');
}

/**
 * Seeds the shift templates and staffing requirements.
 */
async function seedShiftConfig() {
  console.log('--- Seeding shift and staffing configuration ---');
  const { data: shifts, error: shiftError } = await supabase
    .from('shifts')
    .insert([
      {
        name: 'Day Shift',
        start_time: '07:00:00',
        end_time: '17:00:00',
        duration_hours: 10,
      },
      {
        name: 'Night Shift',
        start_time: '17:00:00',
        end_time: '03:00:00',
        duration_hours: 10,
      },
      {
        name: 'Mid Shift',
        start_time: '12:00:00',
        end_time: '22:00:00',
        duration_hours: 10,
      },
    ])
    .select();

  if (shiftError) {
    console.error('Error seeding shifts:', shiftError);
    return;
  }
  console.log(`${shifts.length} shift templates created.`);

  const { data: reqs, error: reqError } = await supabase
    .from('staffing_requirements')
    .insert([
      {
        period_name: 'Day Coverage',
        start_time: '07:00:00',
        end_time: '17:00:00',
        min_employees: 8,
        min_supervisors: 2,
      },
      {
        period_name: 'Night Coverage',
        start_time: '17:00:00',
        end_time: '03:00:00',
        min_employees: 6,
        min_supervisors: 1,
      },
    ]);

  if (reqError) console.error('Error seeding staffing requirements:', reqError);
  else console.log('Staffing requirements created.');
}

/**
 * Creates users, their profiles, and assigns them roles.
 */
async function seedUsersAndRoles() {
  console.log('--- Seeding users and roles ---');
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, name');
  if (rolesError) {
    console.error('Could not fetch roles:', rolesError);
    return;
  }
  const roleMap: { [key: string]: number } = roles.reduce(
    (acc, role) => ({ ...acc, [role.name]: role.id }),
    {}
  );

  // Create Admin User
  await createUser(ADMIN_EMAIL, 'Admin User', roleMap.admin);

  // Create Supervisors
  for (let i = 0; i < NUM_SUPERVISORS; i++) {
    await createUser(
      faker.internet.email(),
      faker.person.fullName(),
      roleMap.supervisor
    );
  }

  // Create Dispatchers
  for (let i = 0; i < NUM_DISPATCHERS; i++) {
    await createUser(
      faker.internet.email(),
      faker.person.fullName(),
      roleMap.dispatcher
    );
  }
}

/**
 * Helper to create a user, their profile, and assign a role.
 */
async function createUser(email: string, fullName: string, roleId: number) {
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password: USER_PASSWORD,
      email_confirm: true, // Auto-confirm users for seeding
    });

  if (authError) {
    console.error(`Error creating user ${email}:`, authError.message);
    return;
  }

  const user = authData.user;
  if (!user) return;

  const { error: profileError } = await supabase.from('profiles').insert({
    id: user.id,
    full_name: fullName,
    avatar_url: faker.image.avatar(),
  });

  if (profileError) {
    console.error(`Error creating profile for ${email}:`, profileError);
  }

  const { error: roleError } = await supabase.from('user_roles').insert({
    user_id: user.id,
    role_id: roleId,
  });

  if (roleError) {
    console.error(`Error assigning role to ${email}:`, roleError);
  }

  console.log(`Successfully created user: ${email}`);
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  await cleanupData();
  await seedShiftConfig();
  await seedUsersAndRoles();
  console.log('--- Database seeding complete ---');
}

seedDatabase().catch(console.error);
