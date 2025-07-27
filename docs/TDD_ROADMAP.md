# TDD Roadmap - Comprehensive Plan

This document provides the definitive, step-by-step Test-Driven Development plan for the entire application. It is aligned with the `spec.md` and `architecture.md` documents.

## Stage 0: Foundation & Error Handling

*   **1. API Health Check:**
    *   **Test:** `GET /api/health` returns a `200 OK` with `{ status: 'ok' }`.
*   **2. Global Error Handler:**
    *   **Test:** A mock route that throws a generic `Error` is caught by the global error handler and returns a structured `500` JSON response.
*   **3. Database Connection:**
    *   **Test:** A test attempts to query the database with invalid credentials and asserts that a custom `DatabaseConnectionError` is thrown.

## Stage 1: Authentication & User Management (Admin)

*   **1. User Signup:**
    *   **Test:** `POST /api/auth/signup` with valid data creates a new user in `auth.users` and a corresponding entry in the `public.employees` table. Returns `201`.
    *   **Test:** `POST /api/auth/signup` with an existing email returns a `409 Conflict` error.
*   **2. User Login:**
    *   **Test:** `POST /api/auth/login` with correct credentials returns a `200 OK` with a valid JWT.
    *   **Test:** `POST /api/auth/login` with incorrect credentials returns a `401 Unauthorized`.
*   **3. Admin User Management (CRUD):**
    *   **Test:** Authenticated as Admin, `GET /api/admin/users` returns a list of all users.
    *   **Test:** Authenticated as Admin, `POST /api/admin/users` creates a new user.
    *   **Test:** Authenticated as Dispatcher, `GET /api/admin/users` returns a `403 Forbidden`.

## Stage 2: Core Scheduling & MVP Viewer

*   **1. Seeding Initial Data:**
    *   **Test:** A `seed` script correctly populates the `shifts` and `staffing_requirements` tables with the data defined in `PROJECT_SPECIFICATION.md`.
*   **2. Schedule Viewing (Dispatcher):**
    *   **Test:** Authenticated as a Dispatcher, `GET /api/schedules/user/:userId` returns only the shifts assigned to that user.
*   **3. Schedule Viewing (Supervisor):**
    *   **Test:** Authenticated as a Supervisor, `GET /api/schedules/:id` returns the full schedule details, including all assigned shifts.
*   **4. Coverage Gap Highlighting (UI):**
    *   **Test:** A React component test using mock data with a known staffing gap correctly applies a `highlight-error` CSS class to the corresponding calendar cell.

## Stage 3: Automated Schedule Generation

*   **1. Algorithm - Honors Time Off:**
    *   **Test:** Given an employee with an approved time-off request for a specific day, the scheduling algorithm does not assign them any shift on that day.
*   **2. Algorithm - Enforces Shift Patterns:**
    *   **Test (4x10):** An employee with the '4x10' pattern is scheduled for exactly four 10-hour shifts on consecutive days, followed by three days off.
    *   **Test (3x12+1x4):** An employee with the '3x12_1x4' pattern is scheduled for three 12-hour shifts and one 4-hour shift on consecutive days.
*   **3. Algorithm - Meets Staffing Requirements:**
    *   **Test:** After running the algorithm, a validation function checks the generated schedule and asserts that for every time period on every day, the number of assigned employees and supervisors meets or exceeds the minimum requirements.
*   **4. Algorithm - Handles Midnight-Spanning Shifts:**
    *   **Test:** A shift from 19:00 to 05:00 is correctly counted towards the staffing levels for both the starting day and the following day.
*   **5. Schedule Generation Flow:**
    *   **Test:** A Supervisor can trigger a `POST /api/schedules` request, which creates a new schedule with `draft` status and initiates the generation algorithm as a background job.
    *   **Test:** A Supervisor can `PUT /api/schedules/:id/publish`, changing the status to `published` and triggering notifications.

## Stage 4: Time-Off, Shift Swaps & Overtime

*   **1. Time-Off Request Workflow:**
    *   **Test:** A Dispatcher can `POST /api/time-off/requests`. The request is created with `pending` status.
    *   **Test:** A Supervisor can `PUT /api/time-off/requests/:id/status` to `approved` or `denied`.
*   **2. Shift Swap Workflow:**
    *   **Test:** A Dispatcher can `POST /api/shift-swaps` to initiate a swap.
    *   **Test:** The targeted Dispatcher can update the swap status to `accepted`.
    *   **Test:** A Supervisor can update the swap status to `approved`.

## Stage 5: Real-time Chat & Notifications

*   **1. Private Chat:**
    *   **Test:** User A sends a message to User B via a WebSocket event. User B's client receives the message in real-time.
*   **2. Group Chat:**
    *   **Test:** A message sent to a group chat ID is received by all members of that group.
*   **3. Notifications:**
    *   **Test:** When a schedule is published, a notification is created in the `notifications` table for each affected user, and an email sending job is queued.

## Stage 6: Admin Dashboard & Reporting

*   **1. Audit Trail:**
    *   **Test:** When an Admin creates a new user, a corresponding record is created in the `audit_logs` table with the correct `actor_id` and `action`.
*   **2. Reporting:**
    *   **Test:** `GET /api/reports/staffing` with a date range returns an accurate summary of scheduled hours vs. required hours.
