-- Seed data for 911 project
-- Insert initial roles
INSERT INTO public.roles (name) VALUES 
  ('dispatcher'),
  ('supervisor'),
  ('manager'),
  ('admin')
ON CONFLICT (name) DO NOTHING;

-- Insert initial shifts
INSERT INTO public.shifts (name, start_time, end_time, duration_hours) VALUES 
  ('Day Shift', '08:00:00', '16:00:00', 8),
  ('Evening Shift', '16:00:00', '00:00:00', 8),
  ('Night Shift', '00:00:00', '08:00:00', 8),
  ('Part Time AM', '08:00:00', '12:00:00', 4),
  ('Part Time PM', '12:00:00', '16:00:00', 4)
ON CONFLICT DO NOTHING;

-- Insert initial staffing requirements
INSERT INTO public.staffing_requirements (period_name, start_time, end_time, min_employees, min_supervisors) VALUES 
  ('Morning Rush', '08:00:00', '12:00:00', 3, 1),
  ('Afternoon', '12:00:00', '16:00:00', 2, 1),
  ('Evening Rush', '16:00:00', '20:00:00', 3, 1),
  ('Night Shift', '20:00:00', '08:00:00', 2, 1)
ON CONFLICT DO NOTHING;

-- Create a test schedule
INSERT INTO public.schedules (start_date, end_date, status) VALUES 
  (CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 'draft')
ON CONFLICT DO NOTHING; 