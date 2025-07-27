# 1. User Personas & Roles

*   **Dispatcher:**
    *   **Core Responsibilities:** Manages emergency calls and dispatches appropriate units. Their work schedule is critical for ensuring personal well-being and professional performance.
    *   **Goals:** To have a predictable and fair schedule, easily request time off, and be able to swap shifts to handle personal appointments or emergencies. They need clear visibility into their upcoming shifts.
    *   **System Actions:** Can view their own schedule, submit time-off requests, initiate and respond to shift swap proposals, and participate in chat.

*   **Shift Supervisor:**
    *   **Core Responsibilities:** Manages a team of dispatchers, ensures adequate staffing coverage for all time periods, and handles day-to-day scheduling issues.
    *   **Goals:** To efficiently manage the schedule to meet all operational requirements, quickly identify and fill staffing gaps, approve/deny requests fairly, and communicate effectively with their team.
    *   **System Actions:** Can perform all Dispatcher actions. Additionally, they can view and manage schedules for all dispatchers, approve/deny time-off and shift swap requests, manually override schedules, and view reports.

*   **System Administrator:**
    *   **Core Responsibilities:** Manages the overall system configuration, user accounts, and ensures the integrity of the scheduling data and rules.
    *   **Goals:** To maintain a stable and secure system, manage user access effectively, and configure the application's core parameters to match the organization's policies.
    *   **System Actions:** Can perform all Supervisor actions. Additionally, they can manage user accounts (CRUD), configure system-level settings (staffing requirements, shift types, shift patterns), and view audit logs.

# 2. Core Features & Staged Rollout

This section breaks down the application's features into a logical, staged rollout plan.

*   **Stage 1: Foundation, Authentication & User Management**
    *   `[ ]` Implement a robust global error handling and logging strategy.
    *   `[ ]` Establish a secure database connection.
    *   `[ ]` User can sign up for a new account with an email and password.
    *   `[ ]` User can log in and log out.
    *   `[ ]` Implement role-based access control (RBAC) via Supabase RLS.
    *   `[ ]` Admin can create, view, update, and deactivate user accounts.
    *   `[ ]` Admin can assign roles (Dispatcher, Supervisor, Admin) to users.

*   **Stage 2: Core Scheduling & MVP Viewer**
    *   `[ ]` Admin can define and manage `shifts` (e.g., "Day 10hr", "Night 12hr").
    *   `[ ]` Admin can define and manage time-based `staffing_requirements`.
    *   `[ ]` Implement a seeding script to populate the database with initial shifts and requirements.
    *   `[ ]` Dispatcher can view their personal schedule on a calendar grid for a 4-month block.
    *   `[ ]` Supervisor can view the full schedule for all dispatchers.
    *   `[ ]` The schedule view visually highlights periods that do not meet minimum staffing or supervisor coverage requirements.

*   **Stage 3: Automated Schedule Generation**
    *   `[ ]` Develop the core scheduling algorithm as a background process.
    *   `[ ]` The algorithm must adhere to all hard constraints defined in the `PROJECT_SPECIFICATION.md`.
    *   `[ ]` The algorithm correctly handles employee shift patterns (4x10, 3x12+1x4).
    *   `[ ]` The algorithm correctly honors all approved time-off requests.
    *   `[ ]` The algorithm correctly handles shifts that span midnight, allocating coverage to both days.
    *   `[ ]` The algorithm maintains pattern continuity across schedule block transitions.
    *   `[ ]` Supervisor can trigger the generation of a new 4-month schedule.
    *   `[ ]` The generated schedule is saved with a `draft` status.
    *   `[ ]` Supervisor can review the draft and then `publish` it, making it visible to dispatchers.

*   **Stage 4: Time-Off, Shift Swaps & Overtime**
    *   `[ ]` Dispatcher can submit a time-off request for a specific date range and type (vacation, sick, etc.).
    *   `[ ]` Supervisor receives a notification for new time-off requests.
    *   `[ ]` Supervisor can approve or deny requests. The schedule is updated accordingly.
    *   `[ ]` Dispatcher can initiate a shift swap with another employee.
    *   `[ ]` The targeted employee can accept or reject the swap proposal.
    *   `[ ]` A supervisor must provide final approval for any accepted shift swap.
    *   `[ ]` The system identifies potential overtime shifts needed to fill critical coverage gaps.
    *   `[ ]` Supervisor can approve overtime for specific employees.

*   **Stage 5: Real-time Chat & Notifications**
    *   `[ ]` Implement a real-time chat backend (e.g., using Supabase Realtime or Ably).
    *   `[ ]` Users can engage in one-on-one private chats.
    *   `[ ]` Users can participate in pre-defined group chats (e.g., "All Dispatchers", "Supervisors").
    *   `[ ]` Admin can send broadcast announcements to all users.
    *   `[ ]` Implement a notification service for email and SMS.
    *   `[ ]` Users receive notifications for key events (shift changes, request approvals, new chat messages).

*   **Stage 6: Admin Dashboard & Reporting**
    *   `[ ]` Build a comprehensive admin dashboard for user and system management.
    *   `[ ]` Implement an audit trail to log all significant actions (e.g., schedule changes, user creation).
    *   `[ ]` Admin can view and search the audit trail.
    *   `[ ]` Supervisor can generate and view reports on staffing levels, overtime hours, and employee schedules.

# 3. Formalized Scheduling Logic & Constraints

This section provides a more detailed pseudocode representation of the core scheduling algorithm, incorporating the specified priorities.

```
FUNCTION generate_schedule(start_date, end_date, employees, time_off_requests, staffing_requirements):
  LET schedule = initialize_empty_schedule(start_date, end_date)
  LET priorities = [
    CRITICAL_STAFFING,
    SUPERVISOR_COVERAGE,
    APPROVED_TIME_OFF,
    PATTERN_ADHERENCE,
    // ... other priorities
  ]

  // 1. Honor Approved Time-Off (Hard Constraint)
  FOR each request in approved_time_off_requests:
    mark_employee_as_unavailable(schedule, request.employee_id, request.start_date, request.end_date)
  END FOR

  // 2. Iterate through days and attempt to schedule employees
  FOR each day from start_date to end_date:
    LET available_employees = get_employees_not_on_time_off(day)

    FOR each employee in available_employees:
      // 3. Adhere to Shift Patterns (Hard Constraint)
      IF NOT is_valid_day_for_pattern(employee, day, schedule):
        CONTINUE // Skip if this day violates their consecutive day pattern
      END IF

      // 4. Find a suitable shift
      LET candidate_shifts = find_shifts_for_employee(employee, day)

      // 5. Apply Soft Constraints/Preferences (e.g., default shift type)
      LET preferred_shift = select_shift_based_on_preferences(candidate_shifts, employee.preferences)

      IF preferred_shift:
         assign_shift(schedule, employee, day, preferred_shift)
      END IF
    END FOR
  END FOR

  // 6. Validate and Adjust for Coverage
  FOR each day from start_date to end_date:
    LET coverage_gaps = validate_coverage(day, schedule, staffing_requirements)
    IF has_gaps(coverage_gaps):
      // Attempt to fill gaps using available employees, potentially triggering overtime logic
      try_to_fill_gaps(schedule, day, coverage_gaps, available_employees)
    END IF
  END FOR

  RETURN schedule
END FUNCTION

FUNCTION validate_coverage(date, schedule, requirements):
  LET gaps = []
  FOR each period in requirements:
    LET assigned_personnel = find_employees_on_shift_during_period(schedule, date, period.start_time, period.end_time)
    LET num_employees = count(assigned_personnel)
    LET num_supervisors = count(filter(assigned_personnel, p => p.role == 'supervisor'))

    IF num_employees < period.min_employees:
      add_gap(gaps, date, period, "employee_shortage", period.min_employees - num_employees)
    END IF
    IF num_supervisors < period.min_supervisors:
      add_gap(gaps, date, period, "supervisor_shortage", period.min_supervisors - num_supervisors)
    END IF
  END FOR
  RETURN gaps
END FUNCTION
```

# 4. Error Handling & Logging Strategy

*   **Error Types:**
    *   **Validation Errors:** (e.g., invalid email, password too short, invalid date range). Handled by the API, returning a `400 Bad Request` with a clear message.
    *   **Authentication Errors:** (e.g., invalid credentials, missing token). Handled by auth middleware, returning a `401 Unauthorized`.
    *   **Authorization Errors:** (e.g., dispatcher trying to access admin route). Handled by RBAC middleware, returning a `403 Forbidden`.
    *   **Database Errors:** (e.g., connection failure, query timeout). Wrapped in a custom `DatabaseError` class and logged with `CRITICAL` level. Returns a generic `500 Internal Server Error` to the user.
    *   **Scheduling Algorithm Errors:** Any unhandled exception during schedule generation will be caught, logged with `ERROR` level, and the schedule status will be marked as `failed`.
*   **Logging:**
    *   **Service:** Use a cloud-based logging service like Logtail or Datadog.
    *   **Format:** JSON format including `timestamp`, `level`, `message`, `transactionId`, `userId`, `error_type`, and `stack_trace`.
    *   **Levels:**
        *   `INFO`: Routine events (e.g., user login, schedule published).
        *   `WARN`: Non-critical issues (e.g., failed notification to one user).
        *   `ERROR`: Action-blocking errors (e.g., payment failure, scheduling algorithm failure).
        *   `CRITICAL`: System-wide failures (e.g., database down).
*   **Alerting:**
    *   `CRITICAL` and `ERROR` level logs will trigger alerts to a dedicated channel in Slack and PagerDuty for immediate investigation.
