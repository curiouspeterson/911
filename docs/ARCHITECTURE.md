## Database Schema (Supabase/PostgreSQL)

This schema is designed to support the full feature set, including real-time chat and detailed auditing.

*   **`employees`**
    *   `id` (UUID, Primary Key, references `auth.users.id`)
    *   `full_name` (TEXT, not null)
    *   `role` (ENUM: 'dispatcher', 'supervisor', 'admin', not null)
    *   `assigned_pattern` (ENUM: '4x10', '3x12_1x4')
    *   `default_shift_preference_id` (INTEGER, Foreign Key to `shifts.id`, nullable)
    *   `created_at` (TIMESTAMPTZ, default: `now()`)
    *   `is_active` (BOOLEAN, default: `true`)

*   **`shifts`**
    *   `id` (SERIAL, Primary Key)
    *   `name` (TEXT, not null, unique)
    *   `start_time` (TIME, not null)
    *   `end_time` (TIME, not null)
    *   `duration_hours` (INTEGER, not null)

*   **`staffing_requirements`**
    *   `id` (SERIAL, Primary Key)
    *   `period_name` (TEXT, not null)
    *   `start_time` (TIME, not null)
    *   `end_time` (TIME, not null)
    *   `min_employees` (INTEGER, not null, default: 0)
    *   `min_supervisors` (INTEGER, not null, default: 0)

*   **`schedules`**
    *   `id` (SERIAL, Primary Key)
    *   `start_date` (DATE, not null)
    *   `end_date` (DATE, not null)
    *   `status` (ENUM: 'draft', 'published', 'archived', 'failed', not null, default: 'draft')
    *   `created_at` (TIMESTAMPTZ, default: `now()`)
    *   `published_at` (TIMESTAMPTZ, nullable)

*   **`assigned_shifts`**
    *   `id` (SERIAL, Primary Key)
    *   `employee_id` (UUID, Foreign Key to `employees.id`)
    *   `shift_id` (INTEGER, Foreign Key to `shifts.id`)
    *   `schedule_id` (INTEGER, Foreign Key to `schedules.id`)
    *   `shift_date` (DATE, not null)
    *   `is_overtime` (BOOLEAN, default: `false`)

*   **`time_off_requests`**
    *   `id` (SERIAL, Primary Key)
    *   `employee_id` (UUID, Foreign Key to `employees.id`)
    *   `request_type` (ENUM: 'vacation', 'sick', 'personal', 'training', not null)
    *   `start_datetime` (TIMESTAMPTZ, not null)
    *   `end_datetime` (TIMESTAMPTZ, not null)
    *   `status` (ENUM: 'pending', 'approved', 'denied', not null, default: 'pending')
    *   `reviewed_by` (UUID, Foreign Key to `employees.id`, nullable)
    *   `created_at` (TIMESTAMPTZ, default: `now()`)

*   **`shift_swaps`**
    *   `id` (SERIAL, Primary Key)
    *   `requester_id` (UUID, Foreign Key to `employees.id`)
    *   `requester_shift_id` (INTEGER, Foreign Key to `assigned_shifts.id`)
    *   `responder_id` (UUID, Foreign Key to `employees.id`)
    *   `responder_shift_id` (INTEGER, Foreign Key to `assigned_shifts.id`)
    *   `status` (ENUM: 'pending', 'accepted', 'rejected', 'approved', 'denied', not null, default: 'pending')
    *   `approved_by` (UUID, Foreign Key to `employees.id`, nullable)
    *   `created_at` (TIMESTAMPTZ, default: `now()`)

*   **`chat_messages`**
    *   `id` (BIGSERIAL, Primary Key)
    *   `sender_id` (UUID, Foreign Key to `employees.id`)
    *   `recipient_id` (UUID, Foreign Key to `employees.id`, nullable)
    *   `group_id` (INTEGER, Foreign Key to `chat_groups.id`, nullable)
    *   `content` (TEXT, not null)
    *   `created_at` (TIMESTAMPTZ, default: `now()`)

*   **`chat_groups`**
    *   `id` (SERIAL, Primary Key)
    *   `name` (TEXT, not null)
    *   `description` (TEXT)
    *   `is_public` (BOOLEAN, default: `true`)

*   **`chat_group_members`**
    *   `group_id` (INTEGER, Foreign Key to `chat_groups.id`)
    *   `employee_id` (UUID, Foreign Key to `employees.id`)
    *   PRIMARY KEY (`group_id`, `employee_id`)

*   **`audit_logs`**
    *   `id` (BIGSERIAL, Primary Key)
    *   `actor_id` (UUID, Foreign Key to `employees.id`)
    *   `action` (TEXT, not null)  -- e.g., "user.create", "schedule.publish"
    *   `target_id` (TEXT) -- e.g., the ID of the user created or schedule published
    *   `details` (JSONB) -- For storing additional context
    *   `created_at` (TIMESTAMPTZ, default: `now()`)

*   **`notifications`**
    *   `id` (BIGSERIAL, Primary Key)
    *   `recipient_id` (UUID, Foreign Key to `employees.id`)
    *   `type` (ENUM: 'email', 'sms', 'in_app', not null)
    *   `content` (TEXT, not null)
    *   `status` (ENUM: 'pending', 'sent', 'failed', 'read', not null, default: 'pending')
    *   `created_at` (TIMESTAMPTZ, default: `now()`)

## Supabase RLS Policies

*   **Employees:** Users can read their own employee record. Supervisors and Admins can read all records.
*   **Schedules:** Dispatchers can only read `assigned_shifts` linked to their `employee_id`. Supervisors and Admins can read all.
*   **Time-Off Requests:** Users can create and view their own requests. Supervisors can view all requests for their team. Admins can view all.
*   **Chat:** Users can only read messages where they are the sender or recipient, or if they are a member of the `group_id`.
*   **Audit Logs:** Only Admins can read the `audit_logs` table.

## API Endpoint Map

*   **/api/auth/**
    *   `POST /signup`
    *   `POST /login`
*   **/api/schedules/**
    *   `GET /` (for Supervisors/Admins to see all schedules)
    *   `POST /` (for Supervisors/Admins to create a new schedule block)
    *   `GET /:id` (get a specific schedule)
    *   `PUT /:id/publish` (publish a draft schedule)
    *   `GET /user/:userId` (get a user's assigned shifts)
*   **/api/admin/**
    *   `GET /users`
    *   `POST /users`
    *   `PUT /users/:id`
    *   `DELETE /users/:id`
    *   `GET /settings`
    *   `PUT /settings`
    *   `GET /audit-logs`
*   **/api/chat/**
    *   `GET /conversations`
    *   `GET /conversations/:id/messages`
    *   `POST /messages`
*   **/api/time-off/**
    *   `GET /requests`
    *   `POST /requests`
    *   `PUT /requests/:id/status`
*   **/api/reports/**
    *   `GET /staffing`
    *   `GET /overtime`
