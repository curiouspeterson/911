# **Project Specification: 911 Dispatch Scheduler**

|  |  |
| :---- | :---- |
| **Document Version:** | 2.0 |
| **Status:** | In Progress |
| **Last Updated:** | July 26, 2025 |

## **1\. User Personas & Roles**

* **Dispatcher:**  
  * **Core Responsibilities:** Manages emergency calls and dispatches appropriate units. Their work schedule is critical for ensuring personal well-being and professional performance.  
  * **Goals:** To have a predictable and fair schedule, easily request time off, and be able to swap shifts to handle personal appointments or emergencies. They need clear visibility into their upcoming shifts.  
  * **System Actions:** Can view their own schedule, submit time-off requests, initiate and respond to shift swap proposals, and participate in chat.  
* **Shift Supervisor:**  
  * **Core Responsibilities:** Manages a team of dispatchers, ensures adequate staffing coverage for all time periods, and handles day-to-day scheduling issues.  
  * **Goals:** To efficiently manage the schedule to meet all operational requirements, quickly identify and fill staffing gaps, approve/deny requests fairly, and communicate effectively with their team.  
  * **System Actions:** Can perform all Dispatcher actions. Additionally, they can view and manage schedules for all dispatchers, approve/deny time-off and shift swap requests, manually override schedules, and view reports.  
* **System Administrator:**  
  * **Core Responsibilities:** Manages the overall system configuration, user accounts, and ensures the integrity of the scheduling data and rules.  
  * **Goals:** To maintain a stable and secure system, manage user access effectively, and configure the application's core parameters to match the organization's policies.  
  * **System Actions:** Can perform all Supervisor actions. Additionally, they can manage user accounts (CRUD), configure system-level settings (staffing requirements, shift types, shift patterns), and view audit logs.

## **2\. Core Features & Staged Rollout**

This section breaks down the application's features into a logical, staged rollout plan, reflecting the current project status.

**Status Legend:**

* \[x\] \= Complete  
* \[-\] \= In Progress / Partially Complete  
* \[ \] \= Pending

### **Stage 0: Critical Path De-risking**

* **Task 0: Algorithm Spike \- Scheduling Engine Proof-of-Concept**  
  * \[ \] A proof-of-concept script must validate that Google OR-Tools can generate a valid schedule based on a core subset of the project's constraints and dummy data.

### **Stage 1: Foundation, Database & RBAC**

* **Task 1: Project Setup & Configuration**  
  * \[x\] Next.js 15 project is initialized with Supabase integration.  
  * \[ \] Code quality tools (ESLint, Prettier, Husky) are configured.  
  * \[ \] A CI/CD pipeline is established.  
* **Task 4: Database Schema Implementation**  
  * \[ \] **Requirement:** The database must be structured to support all application features.  
  * **Acceptance Criteria:**  
    * A Supabase migration script is created and successfully run to establish all necessary tables: employees, roles, user\_roles, shifts, staffing\_requirements, schedules, assigned\_shifts, time\_off\_requests, shift\_swaps, audit\_logs, etc.  
    * Appropriate foreign key constraints and indexes are implemented.  
* **Task 3: Authentication & Role-Based Access Control (RBAC)**  
  * \[x\] **Requirement:** Users must be able to sign up, log in, and manage their sessions securely.  
  * \[ \] **Requirement:** System access must be restricted based on user roles.  
  * **Acceptance Criteria:**  
    * Given I am a new user, I can create an account, confirm my email, and log in.  
    * Given I am logged in as a 'dispatcher', when I attempt to access an /admin route, I am redirected or shown a 403 Forbidden error.  
    * A database trigger correctly assigns a default 'dispatcher' role to new users upon signup.  
  * **Technical Notes:** RBAC will be enforced using Supabase Row Level Security (RLS) policies and Next.js Middleware.

### **Stage 2: Core MVP Features**

* **Task 2: Centralized Error Handling System**  
  * \[ \] **Requirement:** The application must gracefully handle and log all errors.  
  * **Acceptance Criteria:**  
    * Server-side errors in React Server Components are caught by a root error.tsx boundary.  
    * Client-side errors are caught by a React Error Boundary, displaying a fallback UI without crashing the application.  
    * Critical errors are logged to an external service (e.g., Sentry) with structured data.  
* **Task 5: User Profile Management**  
  * \[ \] **Requirement:** Users must be able to view and manage their basic profile information.  
  * **Acceptance Criteria:**  
    * Given I am logged in, I can navigate to a profile page that displays my full name and email.  
    * I can edit my full name via a form, which is persisted to the database using a Server Action.  
* **Task 6: Read-Only Schedule Viewer**  
  * \[ \] **Requirement:** Users must be able to view schedules relevant to their role.  
  * **Acceptance Criteria:**  
    * Given I am a Dispatcher, my dashboard displays a calendar view of my personal, published schedule.  
    * Given I am a Supervisor, I can view a master schedule containing assignments for all dispatchers.  
    * Time periods on the master schedule that are understaffed are visually highlighted with an error indicator.

### **Stage 3 & Beyond: Enterprise Features**

* **Task 8: Automated Schedule Generation**  
  * \[ \] **Requirement:** Supervisors must be able to automatically generate a valid, multi-month schedule.  
  * **Acceptance Criteria:**  
    * A Supervisor can trigger a Server Action that initiates the scheduling algorithm.  
    * The generated schedule is saved as a 'draft' and adheres to all hard constraints (staffing levels, time-off, patterns).  
* **Task 10: Time-Off Management System**  
  * \[ \] **Requirement:** Employees need a full workflow for requesting and managing time off.  
  * **Acceptance Criteria:**  
    * A Dispatcher can submit a time-off request with a date range and type.  
    * A Supervisor can view, approve, or deny the request, triggering a notification to the employee.  
* **Task 11: Shift Swapping System**  
  * \[ \] **Requirement:** Employees need a workflow to trade shifts with supervisor oversight.  
  * **Acceptance Criteria:**  
    * A Dispatcher can propose a shift swap with an eligible colleague.  
    * The proposal requires acceptance from the colleague and final approval from a Supervisor.  
* **Task 12 & 13: Chat & Notifications**  
  * \[ \] **Requirement:** Users need real-time communication and notifications for important events.  
  * **Acceptance Criteria:**  
    * Users can send and receive messages in real-time via one-on-one and group chats.  
    * Users receive in-app and email notifications for events like schedule publication and request approvals.  
* **Task 14: Auditing and Reporting**  
  * \[ \] **Requirement:** Admins and Supervisors need access to system logs and performance reports.  
  * **Acceptance Criteria:**  
    * All significant state changes (e.g., manual schedule edits, user role changes) are recorded in an audit\_logs table.  
    * Supervisors can view reports on staffing compliance and overtime hours.

## **3\. Formalized Scheduling Logic & Constraints**

This section provides a pseudocode representation of the core scheduling algorithm, incorporating the specified priorities.

FUNCTION generate\_schedule(start\_date, end\_date, employees, time\_off\_requests, staffing\_requirements):  
  LET schedule \= initialize\_empty\_schedule(start\_date, end\_date)  
    
  // Priority 1 & 2: Honor Approved Time-Off & Employee Inactivity (Hard Constraints)  
  FOR each request in approved\_time\_off\_requests:  
    mark\_employee\_as\_unavailable(schedule, request.employee\_id, request.start\_date, request.end\_date)  
  END FOR

  // Priority 3: Iterate through days and attempt to schedule employees  
  FOR each day from start\_date to end\_date:  
    LET available\_employees \= get\_active\_employees\_not\_on\_time\_off(day)

    FOR each employee in available\_employees:  
      // Priority 4: Adhere to Shift Patterns (Hard Constraint)  
      IF NOT is\_valid\_day\_for\_pattern(employee, day, schedule):  
        CONTINUE // Skip if this day violates their consecutive day pattern or 40-hour limit  
      END IF

      // Find a suitable shift based on preferences (Soft Constraint)  
      LET candidate\_shifts \= find\_shifts\_for\_employee(employee, day)  
      LET preferred\_shift \= select\_shift\_based\_on\_preferences(candidate\_shifts, employee.preferences)

      IF preferred\_shift:  
         assign\_shift(schedule, employee, day, preferred\_shift)  
      END IF  
    END FOR  
  END FOR

  // Priority 5: Validate and Adjust for Critical Coverage (Hard Constraint)  
  FOR each day from start\_date to end\_date:  
    LET coverage\_gaps \= validate\_coverage(day, schedule, staffing\_requirements)  
    IF has\_gaps(coverage\_gaps):  
      // Attempt to fill gaps using available employees, potentially triggering overtime logic  
      try\_to\_fill\_gaps(schedule, day, coverage\_gaps, available\_employees)  
    END IF  
  END FOR

  RETURN schedule  
END FUNCTION

FUNCTION validate\_coverage(date, schedule, requirements):  
  LET gaps \= \[\]  
  FOR each period in requirements:  
    LET assigned\_personnel \= find\_employees\_on\_shift\_during\_period(schedule, date, period.start\_time, period.end\_time)  
    LET num\_employees \= count(assigned\_personnel)  
    LET num\_supervisors \= count(filter(assigned\_personnel, p \=\> p.role \== 'supervisor'))

    IF num\_employees \< period.min\_employees:  
      add\_gap(gaps, date, period, "employee\_shortage", period.min\_employees \- num\_employees)  
    END IF  
    IF num\_supervisors \< period.min\_supervisors:  
      add\_gap(gaps, date, period, "supervisor\_shortage", period.min\_supervisors \- num\_supervisors)  
    END IF  
  END FOR  
  RETURN gaps  
END FUNCTION  
