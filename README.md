911 Dispatch Scheduler
A mission-critical, 24/7 scheduling application designed to manage the complex staffing requirements of a 911 dispatch center. This platform ensures optimal coverage, respects employee constraints, and provides a scalable, secure, and intuitive interface for schedulers and staff.

## Vision & Core Mission
The primary goal of this project is to eliminate scheduling conflicts, reduce administrative overhead, and ensure that 911 dispatch centers are never understaffed. By leveraging a powerful scheduling algorithm and a modern, real-time technology stack, this application aims to provide a robust solution that is both powerful for administrators and easy to use for employees.

## ✨ Core Features
The application is being developed in strategic stages, starting with a robust MVP and scaling to a full enterprise-grade solution.

### MVP (Minimum Viable Product)
- **Secure Authentication**: Role-based access control (RBAC) for employees, supervisors, and administrators using Supabase Auth.
- **Schedule Viewing**: An intuitive, read-only calendar interface for all users to view their assigned shifts.
- **User Profiles**: Basic user profile management.
- **Seeded Data**: The initial version will use pre-populated, realistic test data to demonstrate core scheduling logic.
- **Robust Error Handling**: A comprehensive error handling and logging system built from the ground up.

### Enterprise Features (Post-MVP)
- **Automated Schedule Generation**: A sophisticated algorithm that generates optimized 4-month schedules based on staffing requirements, employee patterns, and time-off requests.
- **Dynamic Schedule Management**: Full CRUD (Create, Read, Update, Delete) capabilities for administrators to manage schedules.
- **Shift Swapping & Bidding**: A system for employees to request shift swaps, subject to supervisor approval.
- **Time-Off Management**: A complete workflow for employees to request time off and for supervisors to approve or deny requests.
- **Real-time Notifications**: In-app and email notifications for shift changes, approvals, and important announcements.
- **Integrated Chat**: A real-time chat system for seamless communication within the dispatch center.
- **Comprehensive Auditing & Reporting**: Detailed logs and reporting on schedule changes, overtime, and staffing levels.

## ️ Technology Stack
This project is built with a focus on performance, security, and developer experience, using modern, best-in-class technologies.

| Category         | Technology                                    |
| :--------------- | :-------------------------------------------- |
| Framework        | Next.js 15+ (App Router)                      |
| Language         | TypeScript (Strict Mode)                      |
| Backend & DB     | Supabase (PostgreSQL, Auth with RLS, Storage, Realtime) |
| UI Components    | shadcn/ui & Radix UI                          |
| Styling          | Tailwind CSS                                  |
| Testing          | Vitest & React Testing Library                |
| Schema & Validation | Zod                                           |
| Deployment       | Vercel                                        |

## Project Structure
The codebase is organized following Next.js App Router conventions and a clean architecture approach to separate concerns.

```
. 
├── app/                  # Next.js App Router: pages, layouts, server actions
│   ├── (auth)/           # Authentication routes (login, logout)
│   ├── dashboard/        # Main application dashboard
│   ├── api/              # API routes
│   └── actions/          # Server Actions for data mutations
├── components/           # Shared React components (UI, forms, etc.)
│   └── ui/               # Unstyled components from shadcn/ui
├── lib/                  # Core logic, utilities, and third-party integrations
│   └── supabase/         # Supabase client, server, and query logic
├── documentation/        # Project planning and architecture documents
│   ├── ARCHITECTURE.md   # System architecture and data models
│   └── SPEC.md           # Detailed feature specifications
├── styles/               # Global CSS styles
├── types/                # TypeScript type definitions
├── .gemini               # AI coding assistant rules file
└── package.json
```

## Getting Started
Follow these steps to set up and run the project locally.

### Prerequisites
- Node.js (v20.x or later)
- pnpm (recommended package manager)
- Git
- A Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/911-scheduler.git
cd 911-scheduler
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root of the project by copying the example file:
```bash
cp .env.example .env.local
```
Log in to your Supabase account and navigate to your project's settings:
- **API Settings**: Find your Project URL and anon public key.
- **Database Settings**: Find your database connection string.

Update your `.env.local` file with these values:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY # Found in API settings
DATABASE_URL=YOUR_POSTGRES_CONNECTION_STRING # Found in Database settings
```

### 4. Set Up Supabase Database
Run the schema migrations located in the `supabase/migrations` directory to set up your database tables and RLS policies.
```bash
# This assumes you have the Supabase CLI installed and linked
supabase db push
```

### 5. Run the Development Server
```bash
pnpm dev
```
The application should now be running at `http://localhost:3000`.

## Running Tests
This project enforces a strict Test-Driven Development (TDD) workflow. All code requires comprehensive testing.

To run the full test suite:
```bash
pnpm test
```
To run tests in watch mode during development:
```bash
pnpm test:watch
```

## Contributing
Contributions are welcome! We adhere to a strict TDD and conventional commit process. Before contributing, please review the AI pairing rules defined in the `.gemini` file.

- Fork the repository.
- Create a new feature branch: `git checkout -b feature/your-feature-name`
- Write tests first: Create a `*.test.tsx` file that outlines the functionality.
- Write the code: Implement the feature to make the tests pass.
- Ensure all tests pass: `pnpm test`
- Submit a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.


