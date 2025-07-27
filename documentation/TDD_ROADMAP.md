# **TDD Roadmap \- 911 Dispatch Scheduler**

This document provides the definitive, step-by-step Test-Driven Development plan for the entire application. It is aligned with the latest task-master.json project plan and reflects the current state of the codebase.

**Status Legend:**

* \[x\] \= Complete  
* \[-\] \= In Progress / Partially Complete  
* \[ \] \= Pending

## **Stage 0: Critical Path De-risking**

* **Task 0: Algorithm Spike \- Scheduling Engine Proof-of-Concept**  
  * \[ \] **Test:** The POC script executes without errors using dummy data.  
  * \[ \] **Test:** The output of the POC script is a valid schedule structure that can be manually verified.  
  * \[ \] **Test:** The generated schedule correctly adheres to the core constraints selected for the POC (e.g., minimum staffing, 40-hour work week).

## **Stage 1: Foundation & Setup Verification**

* **Task 1: Project Setup and Infrastructure Configuration**  
  * \[x\] **Test:** Next.js 15 project initializes and runs locally (pnpm dev).  
  * \[x\] **Test:** Supabase project is provisioned and environment variables are correctly loaded.  
  * \[ \] **Test:** ESLint, Prettier, and Husky pre-commit hooks are configured and prevent commits with linting errors.  
  * \[ \] **Test:** A CI/CD pipeline in GitHub Actions successfully builds and lints the project on a test commit.  
  * \[-\] **Test:** All core dependencies are installed and the application runs successfully in a Docker container.

## **Stage 2: Database & Role-Based Access Control (RBAC)**

* **Task 4: Database Schema Design and Implementation**  
  * \[ \] **Test:** A new Supabase migration script successfully creates the application-specific tables (employees, roles, shifts, staffing\_requirements, etc.).  
  * \[ \] **Test:** Foreign key constraints correctly prevent invalid data insertion (e.g., an assigned\_shift for a non-existent employee).  
  * \[ \] **Test:** Row Level Security (RLS) policies prevent a 'dispatcher' from reading another dispatcher's employees record.  
  * \[ \] **Test:** A seed script correctly populates the new tables with realistic test data.  
* **Task 3: Authentication and Role-Based Access Control (RBAC)**  
  * \[x\] **Test:** User can sign up, confirm email, and log in using the starter template's UI.  
  * \[ \] **Test:** A database trigger or server-side function correctly assigns a default 'dispatcher' role to a new user in the user\_roles table upon signup.  
  * \[ \] **Test:** A Next.js Middleware check correctly redirects a logged-in 'dispatcher' trying to access an /admin route.  
  * \[ \] **Test:** A Server Action protected by an admin-only role check returns a 403 Forbidden error when called by a user with a 'supervisor' role.

## **Stage 3: Core MVP Features**

* **Task 2: Implement Centralized Error Handling System**  
  * \[ \] **Test:** A mock Server Component that throws an Error is caught and renders the root error.tsx boundary.  
  * \[ \] **Test:** A client component wrapped in a React Error Boundary displays a fallback UI when it throws an error.  
  * \[ \] **Test:** A call to a failing Server Action from a form displays a user-friendly toast notification with the error message.  
* **Task 5: User Profile Management**  
  * \[ \] **Test:** An authenticated user can view their profile information fetched via a Server Action.  
  * \[ \] **Test:** A user can submit the "Edit Profile" form, and a Server Action successfully updates their information in the employees table.  
  * \[ \] **Test:** Submitting the form with invalid data (e.g., an empty name) displays a validation error using Zod.  
* **Task 6: Read-Only Schedule View Implementation**  
  * \[ \] **Test:** A ScheduleCalendar component correctly renders a grid of days for a given month.  
  * \[ \] **Test (Dispatcher):** Authenticated as a Dispatcher, the component fetches and displays only the shifts assigned to that user.  
  * \[ \] **Test (Supervisor):** Authenticated as a Supervisor, the component fetches and displays shifts for all users.  
  * \[ \] **Test (UI):** A React component test using mock data with a known staffing gap correctly applies a highlight-error CSS class to the corresponding calendar cell.

## **Stage 4: Automated Scheduling**

* **Task 8: Automated Schedule Generation Algorithm**  
  * \[ \] **Test (Hard Constraint \- Time Off):** Given an employee with an approved time-off request, the algorithm does not assign them any shift on that day.  
  * \[ \] **Test (Hard Constraint \- Patterns):** An employee with the '4x10' pattern is scheduled for exactly four 10-hour shifts on consecutive days.  
  * \[ \] **Test (Hard Constraint \- Staffing):** A validation function asserts that every time period in the generated schedule meets or exceeds the minimum employee and supervisor requirements.  
  * \[ \] **Test (Logic \- Midnight Span):** A shift from 19:00 to 05:00 is correctly counted towards staffing levels for both the start day and the following day.  
  * \[ \] **Test (Flow):** A Supervisor triggers a Server Action to generate a schedule, which creates a new schedule record with draft status and initiates the generation as a background job.

## **Stage 5: Interactive Features**

* **Task 9: Manual Schedule Management Interface**  
  * \[ \] **Test:** Dragging and dropping a shift in the UI calls a Server Action to update the assigned\_shifts table.  
  * \[ \] **Test:** The UI receives real-time updates via Supabase subscriptions when another admin makes a change.  
  * \[ \] **Test:** An audit log is created for every manual shift change.  
* **Task 10: Time-Off Management System**  
  * \[ \] **Test:** A Dispatcher can POST a time-off request via a Server Action, creating a record with pending status.  
  * \[ \] **Test:** A Supervisor can update the request status to approved, which is reflected in the database.  
  * \[ \] **Test:** The scheduling algorithm correctly ignores pending requests but is blocked by approved requests.  
* **Task 11: Shift Swapping System**  
  * \[ \] **Test:** A Dispatcher can initiate a swap, creating a shift\_swaps record.  
  * \[ \] **Test:** The targeted employee can accept the swap, updating its status.  
  * \[ \] **Test:** A Supervisor can provide final approval, which atomically swaps the employee\_id on the two assigned\_shifts records.

## **Stage 6: Enterprise Features**

* **Task 12: Integrated Chat System**  
  * \[ \] **Test:** User A sends a message via a Supabase Realtime channel. User B's client, subscribed to that channel, receives the message in real-time.  
  * \[ \] **Test:** A message sent to a group chat is received by all members of that group.  
* **Task 13: Real-time Notification System**  
  * \[ \] **Test:** When a schedule is published, a notification is created in the notifications table for each affected user.  
  * \[ \] **Test:** A database trigger queues an email to be sent when a new notification is inserted.  
* **Task 14: Auditing and Reporting System**  
  * \[ \] **Test:** When an Admin creates a new user, a corresponding record is created in the audit\_logs table.  
  * \[ \] **Test:** A Server Action for the staffing report returns an accurate summary of scheduled hours vs. required hours for a given date range.

## **Stage 7: Quality Assurance & Optimization**

* **Task 15: Performance Optimization and QA**  
  * \[ \] **Test:** Lighthouse performance score for the main schedule view is above 90\.  
  * \[ \] **Test:** Load testing simulation with 200 concurrent users shows an average API response time below 500ms.  
  * \[ \] **Test:** All interactive components are fully navigable and operable using only a keyboard.