# **Project Specification: 911 Dispatch Scheduler**

|  |  |
| :---- | :---- |
| **Document Version:** | 3.0 |
| **Status:** | In Progress |
| **Last Updated:** | July 26, 2025 |

## **1\. Executive Summary**

This document outlines the complete functional and non-functional requirements for the **911 Dispatch Scheduler**, a mission-critical web application designed to automate and manage the complex 24/7 scheduling needs of a 911 dispatch center. The system will ensure continuous, compliant coverage while managing intricate staffing rules, employee shift patterns, and time-off requests, thereby improving operational efficiency and employee satisfaction.

## **2\. User Personas & Roles**

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

## **3\. Core Features & Staged Rollout**

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
  * **Acceptance Criteria:** A Supabase migration script is created and run to establish all necessary tables (employees, roles, shifts, etc.) with appropriate constraints and indexes.  
* **Task 3: Authentication & Role-Based Access Control (RBAC)**  
  * \[x\] **Requirement:** Users must be able to sign up, log in, and manage sessions securely.  
  * \[ \] **Requirement:** System access must be restricted based on user roles.  
  * **Acceptance Criteria:** A database trigger correctly assigns a default 'dispatcher' role to new users upon signup. RBAC is enforced via RLS and Middleware.

### **Stage 2: Core MVP Features**

* **Task 2: Centralized Error Handling System**  
  * \[ \] **Requirement:** The application must gracefully handle and log all errors.  
  * **Acceptance Criteria:** Server and client-side errors are caught by appropriate boundaries and logged to an external service.  
* **Task 5: User Profile Management**  
  * \[ \] **Requirement:** Users must be able to view and manage their basic profile information.  
  * **Acceptance Criteria:** A logged-in user can view and edit their full name, which is persisted via a Server Action.  
* **Task 6: Read-Only Schedule Viewer**  
  * \[ \] **Requirement:** Users must be able to view schedules relevant to their role.  
  * **Acceptance Criteria:** Dispatchers can view their personal schedule. Supervisors can view a master schedule with visual indicators for any understaffed periods.

### **Stage 3 & Beyond: Enterprise Features**

* **Task 8: Automated Schedule Generation**  
  * \[ \] **Requirement:** Supervisors must be able to automatically generate a valid, multi-month schedule.  
* **Task 10: Time-Off Management System**  
  * \[ \] **Requirement:** Employees need a full workflow for requesting and managing time off.  
* **Task 11: Shift Swapping System**  
  * \[ \] **Requirement:** Employees need a workflow to trade shifts with supervisor oversight.  
* **Task 12 & 13: Chat & Notifications**  
  * \[ \] **Requirement:** Users need real-time communication and notifications for important events.  
* **Task 14: Auditing and Reporting**  
  * \[ \] **Requirement:** Admins and Supervisors need access to system logs and performance reports.

## **4\. Detailed Requirements & Constraints**

### **4.1. Staffing Requirements (Time-Based)**

The system must maintain minimum staffing levels across four distinct time periods. These are **hard constraints**.

| Time Period | Hours | Minimum Staff | Supervisor Required |
| :---- | :---- | :---- | :---- |
| Morning | 5:00 AM – 9:00 AM | 6 employees | 1 supervisor |
| Daytime | 9:00 AM – 9:00 PM | 8 employees | 1 supervisor |
| Evening | 9:00 PM – 1:00 AM | 7 employees | 1 supervisor |
| Night | 1:00 AM – 5:00 AM | 6 employees | 1 supervisor |

### **4.2. Employee Shift Patterns**

All employees must follow one of two patterns. This is a **hard constraint**.

* **Pattern A:** Four consecutive 10-hour shifts per week.  
* **Pattern B:** Three consecutive 12-hour shifts \+ one 4-hour shift, on consecutive days.

### **4.3. Available Shift Types**

The system will be pre-configured with the following assignable shifts:

* **Early:** 5-9am (4hr), 5am-3pm (10hr), 5am-5pm (12hr)  
* **Day:** 9am-1pm (4hr), 9am-7pm (10hr), 9am-9pm (12hr)  
* **Swing:** 1-5pm (4hr), 3pm-1am (10hr), 3pm-3am (12hr)  
* **Graveyard:** 1-5am (4hr), 7pm-5am (10hr), 5pm-5am (12hr)

### **4.4. Scheduling Priorities (In Order of Importance)**

1. **Critical Staffing (Hard):** Ensure minimum staffing and supervisor levels for each time period.  
2. **Approved Time-Off (Hard):** Honor all approved time-off requests.  
3. **40-Hour Limit (Hard):** Do not schedule employees over 40 hours/week without manual override.  
4. **Pattern Adherence (Hard):** Schedule according to assigned employee patterns (consecutive days).  
5. **Employee Preferences (Soft):** Consider default shift types and preferences.  
6. **Fairness (Soft):** Distribute shifts and overtime equitably.  
7. **Pending Time-Off (Soft):** Accommodate pending requests when possible.  
8. **Optimization (Soft):** Minimize overtime and maximize schedule efficiency.

### **4.5. Formalized Scheduling Logic**

The core scheduling algorithm will follow this prioritized logic:

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

## **5\. Non-Functional Requirements**

| ID | Category | Requirement |
| :---- | :---- | :---- |
| **NFR-1** | **Performance** | \- Page loads for interactive views must be \< 2 seconds. \<br\>- Server Action responses must be \< 500ms. \<br\>- Automated schedule generation should complete in under 5 minutes. |
| **NFR-2** | **Security** | \- All data access must be protected by Supabase RLS. \<br\>- All user input must be validated with Zod. \<br\>- The application must be protected against common web vulnerabilities (XSS, CSRF). |
| **NFR-3** | **Scalability** | \- The system must support at least 200 concurrent users without performance degradation. \<br\>- The database schema must be designed to scale to support 500+ employees. |
| **NFR-4** | **Usability** | \- The UI must be intuitive, responsive, and accessible (WCAG 2.1 AA compliant). |
| **NFR-5** | **Reliability** | \- The application must have a target uptime of 99.9%. |

## **6\. Related Documents**

* [ARCHITECTURE.md](https://www.google.com/search?q=ARCHITECTURE.md) \- System design, database schema, and technology choices.  
* [TDD\_ROADMAP.md](https://www.google.com/search?q=TDD_ROADMAP.md) \- Detailed, step-by-step testing and implementation plan.  
* [PROMPT\_LIBRARY.md](https://www.google.com/search?q=PROMPT_LIBRARY.md) \- Templates for AI-assisted code generation.


# Project Specification: DispatchScheduler Pro

_Last Updated: December 2024_  
_Document Version: 1.0_

## Executive Summary

DispatchScheduler Pro is a comprehensive 24/7 scheduling management application designed specifically for 911 dispatch centers. The system must ensure continuous coverage while managing complex staffing requirements, employee shift patterns, and time-off requests.

## Core Requirements

### 1. Staffing Requirements (Time-Based)

The system must maintain minimum staffing levels across four distinct time periods:

| Time Period | Hours             | Minimum Staff | Supervisor Required |
| ----------- | ----------------- | ------------- | ------------------- |
| Morning     | 5:00 AM – 9:00 AM | 6 employees   | 1 supervisor        |
| Daytime     | 9:00 AM – 9:00 PM | 8 employees   | 1 supervisor        |
| Evening     | 9:00 PM – 1:00 AM | 7 employees   | 1 supervisor        |
| Night       | 1:00 AM – 5:00 AM | 6 employees   | 1 supervisor        |

**Critical Note:** Staffing requirements are based on TIME PERIODS, not individual shifts. Multiple shifts may contribute to meeting a single time period's requirements.

### 2. Employee Shift Patterns

All employees must follow one of two patterns:

#### Pattern A: Four Consecutive 10-Hour Shifts

- Exactly 4 shifts per work cycle
- Each shift is 10 hours
- All shifts must be consecutive days
- Total: 40 hours per cycle

#### Pattern B: Three 12-Hour + One 4-Hour Shifts

- Exactly 3 shifts of 12 hours each
- Exactly 1 shift of 4 hours
- All shifts must be consecutive days
- The 4-hour shift should be temporally closest to the 12-hour shifts
- Total: 40 hours per cycle

### 3. Available Shift Types

The system offers shifts across four categories:

#### Early Shift Options

- **4-hour:** 5:00 AM – 9:00 AM
- **10-hour:** 5:00 AM – 3:00 PM
- **12-hour:** 5:00 AM – 5:00 PM

#### Day Shift Options

- **4-hour:** 9:00 AM – 1:00 PM
- **10-hour:** 9:00 AM – 7:00 PM
- **12-hour:** 9:00 AM – 9:00 PM

#### Swing Shift Options

- **4-hour:** 1:00 PM – 5:00 PM
- **10-hour:** 3:00 PM – 1:00 AM
- **12-hour:** 3:00 PM – 3:00 AM

#### Graveyard Shift Options

- **4-hour:** 1:00 AM – 5:00 AM
- **10-hour:** 7:00 PM – 5:00 AM
- **12-hour:** 5:00 PM – 5:00 AM

### 4. Scheduling Constraints

#### Time Constraints

- **Weekly Hour Limit:** 40 hours maximum without managerial approval
- **Schedule Duration:** 4-month blocks with consistent weekly patterns
- **Shift Consistency:** Employees work the same shift type on scheduled days

#### Time-Off Integration

- **Approved Requests:** Must be honored (hard constraint)
- **Pending Requests:** Accommodate when possible, override if necessary for staffing
- **Request Types:** Vacation, sick leave, personal time, training, etc.

#### Pattern Adherence

- Employees must work consecutive days according to their assigned pattern
- Shift types should remain consistent within a work cycle
- Pattern assignments can be changed but require administrative approval

### 5. Scheduling Priorities (In Order)

1. **Critical Staffing:** Ensure minimum staffing levels for each time period
2. **Supervisor Coverage:** Guarantee at least one supervisor per time period
3. **Approved Time-Off:** Honor all approved time-off requests
4. **Pattern Adherence:** Schedule according to assigned employee patterns
5. **Employee Preferences:** Consider default shift types and preferences
6. **Fairness:** Distribute shifts and overtime equitably
7. **Pending Time-Off:** Accommodate pending requests when possible
8. **Optimization:** Minimize overtime and maximize schedule efficiency

### 6. Complex Scheduling Scenarios

#### Midnight-Spanning Shifts

- Some shifts cross midnight (e.g., 7:00 PM – 5:00 AM)
- These shifts contribute to staffing requirements for multiple days
- System must properly allocate coverage across date boundaries

#### Schedule Block Transitions

- 4-month blocks may have shifts spanning the transition
- System must handle continuity between schedule periods
- Employee patterns must be maintained across transitions

#### Overtime Management

- Overtime requires managerial approval
- System should minimize overtime while meeting staffing requirements
- Emergency overtime may be necessary for critical coverage gaps

## Data Requirements

### Employee Data

- Personal information (name, contact, employee ID)
- Position and supervisor status
- Assigned shift pattern (A or B)
- Default shift type preferences
- Hire date and employment status

### Schedule Data

- 4-month schedule blocks with defined start/end dates
- Individual shift assignments per employee per day
- Overtime approval tracking
- Schedule publication and revision history

### Time-Off Data

- Request submission and approval workflow
- Request types and duration tracking
- Conflict resolution and override capabilities
- Integration with schedule generation

### Staffing Configuration

- Time period definitions and requirements
- Minimum staffing levels and supervisor requirements
- Shift type definitions and availability
- Business rules and constraint configuration

## Success Criteria

### Primary Objectives

- ✅ 100% compliance with minimum staffing requirements
- ✅ 100% supervisor coverage for all time periods
- ✅ 100% honor rate for approved time-off requests
- ✅ Zero scheduling conflicts or double-bookings

### Secondary Objectives

- ⭐ Maximize employee satisfaction through preference accommodation
- ⭐ Minimize overtime costs while maintaining coverage
- ⭐ Achieve equitable shift distribution across all employees
- ⭐ Maintain high schedule stability and predictability

### Performance Requirements

- Schedule generation: < 30 seconds for 4-month period
- Real-time conflict detection: < 1 second response
- Schedule updates: < 5 seconds for individual changes
- Mobile responsiveness: All features accessible on mobile devices

## Constraints and Limitations

### Hard Constraints (Cannot be violated)

- Minimum staffing levels must be met
- Supervisor presence required in each time period
- Approved time-off requests must be honored
- Weekly hour limits without approval
- Employee pattern adherence

### Soft Constraints (Preferred but can be overridden)

- Pending time-off accommodation
- Employee shift type preferences
- Equitable shift distribution
- Overtime minimization

### System Limitations

- Schedule complexity may require manual intervention for edge cases
- Extreme staffing shortages may necessitate emergency protocols
- System assumes accurate employee availability data
- Performance may degrade with very large employee counts (>500)

## Related Documents

- [Technical Architecture](TECHNICAL_ARCHITECTURE.md) - System design and technology choices
- [Database Design](DATABASE_DESIGN.md) - Data model and relationships
- [Business Logic](BUSINESS_LOGIC.md) - Detailed algorithms and rules
- [Development Roadmap](DEVELOPMENT_ROADMAP.md) - Implementation timeline
