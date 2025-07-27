-- SEED DATA
-- This script will be run by Supabase when the database is created.

-- Insert Roles
INSERT INTO public.roles (role) VALUES ('employee'), ('supervisor'), ('admin');

-- Note: Seeding employees and other data is more complex as it requires
-- creating corresponding auth.users entries first. This is best handled
- by a custom script or manually in the Supabase dashboard for now.
--
-- Example of how you would do it if you could get the user ID:
--
-- -- 1. Create a user in auth.users (e.g., via Supabase UI or API)
-- --    Let's say the new user's ID is '8d55-....'
--
-- -- 2. Insert into public.employees
-- INSERT INTO public.employees (id, first_name, last_name, email)
-- VALUES ('8d55-....', 'John', 'Doe', 'john.doe@example.com');
--
-- -- 3. Assign a role
-- INSERT INTO public.employee_roles (employee_id, role_id)
-- VALUES ('8d55-....', (SELECT id FROM public.roles WHERE role = 'employee'));

-- For now, we will only seed the roles table.
