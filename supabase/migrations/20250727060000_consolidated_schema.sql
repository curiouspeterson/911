-- Create ENUM types
CREATE TYPE public.time_off_request_type AS ENUM ('vacation', 'sick', 'personal', 'training');
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE public.swap_status AS ENUM ('pending', 'accepted', 'rejected', 'approved', 'denied');
CREATE TYPE public.notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

-- Create Tables
CREATE TABLE public.roles (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name TEXT, avatar_url TEXT, updated_at TIMESTAMPTZ DEFAULT NOW(), is_active BOOLEAN DEFAULT TRUE, assigned_pattern TEXT, default_shift_preference_id INTEGER);
CREATE TABLE public.user_roles (user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, role_id INTEGER NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE, PRIMARY KEY (user_id, role_id));
CREATE TABLE public.shifts (id SERIAL PRIMARY KEY, name TEXT NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL, duration_hours INTEGER NOT NULL);
CREATE TABLE public.staffing_requirements (id SERIAL PRIMARY KEY, period_name TEXT NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL, min_employees INTEGER NOT NULL DEFAULT 0, min_supervisors INTEGER NOT NULL DEFAULT 0);
CREATE TABLE public.schedules (id SERIAL PRIMARY KEY, start_date DATE NOT NULL, end_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'draft', created_at TIMESTAMPTZ DEFAULT NOW(), published_at TIMESTAMPTZ);
CREATE TABLE public.assigned_shifts (id SERIAL PRIMARY KEY, user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, shift_id INTEGER NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE, schedule_id INTEGER NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE, shift_date DATE NOT NULL, is_overtime BOOLEAN DEFAULT FALSE, is_manual_override BOOLEAN DEFAULT FALSE);
CREATE TABLE public.time_off_requests (id SERIAL PRIMARY KEY, user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, request_type time_off_request_type NOT NULL, start_datetime TIMESTAMPTZ NOT NULL, end_datetime TIMESTAMPTZ NOT NULL, status request_status NOT NULL DEFAULT 'pending', reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.shift_swaps (id SERIAL PRIMARY KEY, requester_assigned_shift_id INTEGER NOT NULL REFERENCES public.assigned_shifts(id) ON DELETE CASCADE, responder_assigned_shift_id INTEGER REFERENCES public.assigned_shifts(id) ON DELETE CASCADE, status swap_status NOT NULL DEFAULT 'pending', approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.chat_messages (id BIGSERIAL PRIMARY KEY, sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.notifications (id BIGSERIAL PRIMARY KEY, recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, content TEXT NOT NULL, status notification_status NOT NULL DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.audit_logs (id BIGSERIAL PRIMARY KEY, actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, action TEXT NOT NULL, target_id TEXT, details JSONB, created_at TIMESTAMPTZ DEFAULT NOW());

-- Add Foreign Key
ALTER TABLE public.profiles ADD CONSTRAINT fk_default_shift_preference FOREIGN KEY (default_shift_preference_id) REFERENCES public.shifts(id);

-- Create Functions & Triggers
CREATE OR REPLACE FUNCTION public.user_has_role(user_id UUID, role_name TEXT) RETURNS BOOLEAN AS 'BEGIN RETURN EXISTS (SELECT 1 FROM public.user_roles ur JOIN public.roles r ON ur.role_id = r.id WHERE ur.user_id = user_id AND r.name = role_name); END;' LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS 'DECLARE default_role_id INTEGER; BEGIN SELECT id INTO default_role_id FROM public.roles WHERE name = ''dispatcher''; INSERT INTO public.profiles (id, full_name, avatar_url) VALUES (NEW.id, NEW.raw_user_meta_data->>''full_name'', NEW.raw_user_meta_data->>''avatar_url''); INSERT INTO public.user_roles (user_id, role_id) VALUES (NEW.id, default_role_id); RETURN NEW; END;' LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- ... (add all other RLS policies here)
