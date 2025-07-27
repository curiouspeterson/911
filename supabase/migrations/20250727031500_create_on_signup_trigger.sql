-- This script creates a trigger that fires after a new user is inserted into auth.users.
-- It creates a corresponding entry in public.employees and assigns a default role.

-- 1. Create the function to be called by the trigger.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id BIGINT;
BEGIN
  -- Get the ID for the default 'employee' role.
  SELECT id INTO default_role_id FROM public.roles WHERE role = 'employee';

  -- Insert a new employee profile.
  INSERT INTO public.employees (id, email)
  VALUES (NEW.id, NEW.email);

  -- Assign the default role to the new employee.
  INSERT INTO public.employee_roles (employee_id, role_id)
  VALUES (NEW.id, default_role_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
