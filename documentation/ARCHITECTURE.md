# **911 Dispatch Scheduler: System Architecture**

|  |  |
| :---- | :---- |
| **Document Version:** | 2.0 |
| **Status:** | In Progress |
| **Last Updated:** | July 26, 2025 |

## **1\. High-Level Architecture Overview**

This application is architected as a modern, full-stack web application leveraging the **Next.js App Router** and a **Supabase** backend. The architecture prioritizes security, scalability, and real-time capabilities.

* **Frontend:** A server-first approach using **React Server Components (RSC)** for data fetching and rendering, with client-side interactivity ("use client") only where necessary. UI is built with **shadcn/ui** and **Tailwind CSS**.  
* **Backend Logic:** Data mutations (creates, updates, deletes) are handled exclusively through **Next.js Server Actions**. This provides a secure, type-safe RPC-style mechanism for client-server communication.  
* **Database:** A **PostgreSQL** database managed by Supabase, with a schema designed for the complex relationships of a scheduling system.  
* **Authentication & Authorization:** Handled by **Supabase Auth**, with fine-grained access control enforced by **PostgreSQL Row Level Security (RLS)** policies.  
* **Real-time Features:** Chat and live schedule updates are powered by **Supabase Realtime**.

## **2\. Detailed Database Schema (Supabase/PostgreSQL)**

This schema is designed to be the single source of truth for the application's data model.

### **Core User & Role Management**

* **profiles** (Extends auth.users)  
  * id (UUID, Primary Key, Foreign Key to auth.users.id)  
  * full\_name (TEXT, not null)  
  * avatar\_url (TEXT, nullable)  
  * updated\_at (TIMESTAMPTZ, default: now())  
  * assigned\_pattern (ENUM: '4x10', '3x12\_1x4', nullable)  
  * default\_shift\_preference\_id (INTEGER, Foreign Key to shifts.id, nullable)  
  * is\_active (BOOLEAN, default: true)  
* **roles**  
  * id (SERIAL, Primary Key)  
  * name (ENUM: 'dispatcher', 'supervisor', 'admin', not null, unique)  
* **user\_roles**  
  * user\_id (UUID, Foreign Key to profiles.id)  
  * role\_id (INTEGER, Foreign Key to roles.id)  
  * PRIMARY KEY (user\_id, role\_id)

### **Scheduling Core**

* **shifts** (Templates for assignable shifts)  
  * id (SERIAL, Primary Key)  
  * name (TEXT, not null, unique)  
  * start\_time (TIME, not null)  
  * end\_time (TIME, not null)  
  * duration\_hours (INTEGER, not null)  
* **staffing\_requirements**  
  * id (SERIAL, Primary Key)  
  * period\_name (TEXT, not null)  
  * start\_time (TIME, not null)  
  * end\_time (TIME, not null)  
  * min\_employees (INTEGER, not null, default: 0\)  
  * min\_supervisors (INTEGER, not null, default: 0\)  
* **schedules** (Represents a 4-month scheduling block)  
  * id (SERIAL, Primary Key)  
  * start\_date (DATE, not null)  
  * end\_date (DATE, not null)  
  * status (ENUM: 'draft', 'published', 'archived', 'failed', not null, default: 'draft')  
  * created\_at (TIMESTAMPTZ, default: now())  
  * published\_at (TIMESTAMPTZ, nullable)  
* **assigned\_shifts** (The main schedule ledger)  
  * id (SERIAL, Primary Key)  
  * user\_id (UUID, Foreign Key to profiles.id)  
  * shift\_id (INTEGER, Foreign Key to shifts.id)  
  * schedule\_id (INTEGER, Foreign Key to schedules.id)  
  * shift\_date (DATE, not null)  
  * is\_overtime (BOOLEAN, default: false)  
  * is\_manual\_override (BOOLEAN, default: false)

### **Employee Self-Service & Communication**

* **time\_off\_requests**  
  * id (SERIAL, Primary Key)  
  * user\_id (UUID, Foreign Key to profiles.id)  
  * request\_type (ENUM: 'vacation', 'sick', 'personal', 'training', not null)  
  * start\_datetime (TIMESTAMPTZ, not null)  
  * end\_datetime (TIMESTAMPTZ, not null)  
  * status (ENUM: 'pending', 'approved', 'denied', not null, default: 'pending')  
  * reviewed\_by (UUID, Foreign Key to profiles.id, nullable)  
  * created\_at (TIMESTAMPTZ, default: now())  
* **shift\_swaps**  
  * id (SERIAL, Primary Key)  
  * requester\_assigned\_shift\_id (INTEGER, Foreign Key to assigned\_shifts.id)  
  * responder\_assigned\_shift\_id (INTEGER, Foreign Key to assigned\_shifts.id)  
  * status (ENUM: 'pending', 'accepted', 'rejected', 'approved', 'denied', not null, default: 'pending')  
  * approved\_by (UUID, Foreign Key to profiles.id, nullable)  
  * created\_at (TIMESTAMPTZ, default: now())  
* **chat\_messages**  
  * id (BIGSERIAL, Primary Key)  
  * sender\_id (UUID, Foreign Key to profiles.id)  
  * content (TEXT, not null)  
  * created\_at (TIMESTAMPTZ, default: now())  
  * **Note:** Recipient/group logic will be handled by Supabase Realtime channels to simplify the schema.

### **System & Auditing**

* **audit\_logs**  
  * id (BIGSERIAL, Primary Key)  
  * actor\_id (UUID, Foreign Key to profiles.id, nullable)  
  * action (TEXT, not null) \-- e.g., "user.create", "schedule.publish"  
  * target\_id (TEXT) \-- e.g., the ID of the user created or schedule published  
  * details (JSONB) \-- For storing additional context  
  * created\_at (TIMESTAMPTZ, default: now())  
* **notifications**  
  * id (BIGSERIAL, Primary Key)  
  * recipient\_id (UUID, Foreign Key to profiles.id)  
  * content (TEXT, not null)  
  * status (ENUM: 'pending', 'sent', 'failed', 'read', not null, default: 'pending')  
  * created\_at (TIMESTAMPTZ, default: now())

## **3\. Supabase RLS Policies**

Row Level Security is a cornerstone of the application's security model. All tables will have RLS enabled with a restrictive default DENY policy.

* **profiles**:  
  * SELECT: Users can read their own profile. Supervisors/Admins can read all profiles.  
  * UPDATE: Users can update their own profile. Admins can update any profile.  
* **assigned\_shifts**:  
  * SELECT: Users can read assigned\_shifts where user\_id matches their own. Supervisors/Admins can read all.  
  * INSERT/UPDATE/DELETE: Only Supervisors/Admins.  
* **time\_off\_requests**:  
  * SELECT: Users can read their own requests. Supervisors/Admins can read all.  
  * INSERT: Any authenticated user can create a request for themselves.  
  * UPDATE: Only Supervisors/Admins can update status.  
* **audit\_logs**:  
  * SELECT: Only Admins.  
  * INSERT/UPDATE/DELETE: No one (records are inserted via database triggers or trusted service roles).

## **4\. API & Server Logic (Next.js Server Actions)**

The application will use Next.js Server Actions as the primary method for client-server communication, centralizing logic and ensuring type safety. This replaces a traditional REST API for most operations.

* **app/actions/auth-actions.ts**  
  * signUp(formData)  
  * signIn(formData)  
  * signOut()  
* **app/actions/schedule-actions.ts**  
  * generateSchedule(scheduleId) (Triggers the core algorithm)  
  * publishSchedule(scheduleId)  
  * updateAssignedShift(shiftId, newUserId, newDate)  
* **app/actions/user-actions.ts**  
  * updateUserProfile(userId, data)  
  * getScheduleForUser(userId, dateRange)  
* **app/actions/admin-actions.ts**  
  * createUser(userData)  
  * updateUserRole(userId, newRoleId)  
  * getAuditLogs(filters)  
* **app/actions/time-off-actions.ts**  
  * createTimeOffRequest(requestData)  
  * approveTimeOffRequest(requestId)  
  * denyTimeOffRequest(requestId)

**Note:** Data fetching will primarily be done directly within React Server Components using a server-side Supabase client, co-located with the UI that needs the data.