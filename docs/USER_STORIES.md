# User Stories

This document translates the features from `spec.md` into actionable user stories with detailed acceptance criteria.

## Stage 1: Foundation, Authentication & User Management

*   **Story:** User Signup
    *   **As a** potential user,
    *   **I want to** be able to create a new account using my name, email, and a password,
    *   **so that** I can access the system.
    *   **Acceptance Criteria:**
        *   Given I am on the signup page, when I enter my full name, a valid email, and a password that is at least 10 characters long, and I click "Sign Up", then my account is created and I am redirected to the login page.
        *   Given I am on the signup page, when I enter an email that already exists, I see an error message "Email already in use."
        *   Given I am on the signup page, when I enter a password less than 10 characters long, I see an error message "Password must be at least 10 characters."

*   **Story:** User Login
    *   **As a** registered user,
    *   **I want to** log in with my email and password,
    *   **so that** I can access my schedule and other features.
    *   **Acceptance Criteria:**
        *   Given I am on the login page, when I enter my correct credentials and click "Login", I am redirected to my dashboard.
        *   Given I am on the login page, when I enter incorrect credentials, I see an error message "Invalid email or password."

*   **Story:** Admin Manages User Accounts
    *   **As an** Admin,
    *   **I want to** create, view, update, and deactivate user accounts,
    *   **so that** I can manage system access.
    *   **Acceptance Criteria:**
        *   Given I am logged in as an Admin, I can navigate to a "User Management" page.
        *   From this page, I can see a list of all users with their name, email, and role.
        *   I can click "Add User" to open a form where I can enter a name, email, and select a role to create a new user.
        *   I can edit an existing user's name and role.
        *   I can deactivate a user, which prevents them from logging in but preserves their data.

## Stage 2: Core Scheduling & MVP Viewer

*   **Story:** Admin Manages Shifts
    *   **As an** Admin,
    *   **I want to** define and manage the available shift types,
    *   **so that** they can be used in the scheduling process.
    *   **Acceptance Criteria:**
        *   Given I am an Admin, I can access a "Shifts" configuration page.
        *   I can create a new shift by providing a name (e.g., "Day Shift 10hr"), a start time, and an end time.
        *   I can edit and delete existing shifts.

*   **Story:** Dispatcher Views Schedule
    *   **As a** Dispatcher,
    *   **I want to** view my personal schedule on a clear calendar grid,
    *   **so that** I know when I am scheduled to work.
    *   **Acceptance Criteria:**
        *   When I log in, I am presented with a calendar showing the current 4-month schedule block.
        *   Each day on the calendar clearly displays the details of my assigned shift (e.g., "Day Shift 10hr, 09:00-19:00").
        *   Days I have approved time off are clearly marked as such.

*   **Story:** Supervisor Views Full Schedule & Coverage
    *   **As a** Supervisor,
    *   **I want to** view the complete schedule for all dispatchers and see potential staffing gaps,
    *   **so that** I can ensure full coverage.
    *   **Acceptance Criteria:**
        *   I can access a master schedule view showing all employees and their assigned shifts.
        *   I can filter the view by employee, role, or date range.
        *   Any time period (as defined in `staffing_requirements`) that is understaffed is visually highlighted in red.
        *   Hovering over a highlighted gap shows details (e.g., "1 employee short," "Supervisor required").

## Stage 3: Automated Schedule Generation

*   **Story:** Supervisor Generates a Draft Schedule
    *   **As a** Supervisor,
    *   **I want to** trigger the automatic generation of a new schedule,
    *   **so that** I can efficiently create a schedule that meets all constraints.
    *   **Acceptance Criteria:**
        *   I can navigate to a "Schedule Generation" page.
        *   I can select a start and end date for the new schedule block.
        *   When I click "Generate", the system starts a background job and shows a progress indicator.
        *   Upon completion, a new schedule is created with a "Draft" status.

*   **Story:** Supervisor Publishes a Schedule
    *   **As a** Supervisor,
    *   **I want to** publish a draft schedule,
    *   **so that** it becomes the official schedule visible to all dispatchers.
    *   **Acceptance Criteria:**
        *   From the schedule view, I can select a draft schedule.
        *   I have an option to "Publish" the schedule.
        *   After publishing, all dispatchers receive a notification that the new schedule is available.

## Stage 4: Time-Off, Shift Swaps & Overtime

*   **Story:** Dispatcher Requests Time Off
    *   **As a** Dispatcher,
    *   **I want to** request time off,
    *   **so that** I can plan for vacations or personal days.
    *   **Acceptance Criteria:**
        *   I can access a "Time-Off Request" form.
        *   I can select a start date, end date, and type of leave (e.g., Vacation, Sick).
        *   After submitting, the request appears in my dashboard with a "Pending" status.

*   **Story:** Supervisor Manages Time-Off Requests
    *   **As a** Supervisor,
    *   **I want to** approve or deny time-off requests,
    *   **so that** I can manage staffing levels.
    *   **Acceptance Criteria:**
        *   I have a dashboard widget showing pending time-off requests.
        *   For each request, I can see the employee's name, requested dates, and any potential conflicts with coverage.
        *   I can approve or deny the request with an optional comment.
        *   The employee is notified of the decision.

*   **Story:** Dispatchers Swap Shifts
    *   **As a** Dispatcher,
    *   **I want to** propose a shift swap with a colleague,
    *   **so that** I can adjust my schedule for personal needs.
    *   **Acceptance Criteria:**
        *   From my schedule, I can select a shift and choose to "Propose Swap".
        *   I am shown a list of eligible colleagues to swap with.
        *   The colleague receives a notification with the swap details and can "Accept" or "Reject".
        *   If accepted, the swap is sent to a Supervisor for final approval.
        *   Both dispatchers are notified of the final outcome.

## Stage 5: Real-time Chat & Notifications

*   **Story:** Users Chat Privately
    *   **As a** User,
    *   **I want to** send a private message to another user,
    *   **so that** we can communicate directly.
    *   **Acceptance Criteria:**
        *   I can select a user from a directory and open a private chat window.
        *   Messages are delivered and displayed in real-time.

*   **Story:** Admin Sends Broadcasts
    *   **As an** Admin,
    *   **I want to** send a broadcast message to all users,
    *   **so that** I can share important announcements.
    *   **Acceptance Criteria:**
        *   I have an "Announcements" tool in my dashboard.
        *   I can type a message and send it to all users.
        *   All active users see the message immediately as a pop-up or banner.
        *   All users receive an email and/or SMS notification with the announcement.