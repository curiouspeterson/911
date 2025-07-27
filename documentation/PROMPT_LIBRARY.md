# **Prompt Library for the 911 Dispatch Scheduler**

This document contains a curated set of high-quality prompts designed for generating code that is consistent with this project's architecture and best practices. Use these as templates for your own prompts.

## **1\. Component Generation**

### **Generic Component Prompt**

Use this for creating new, general-purpose React components.

Act as a senior software engineer specializing in Next.js 15, TypeScript, and Tailwind CSS. Your task is to create a new React component that adheres to our project's standards.

Component Name: \`\[ComponentName\]\`  
Props: \`\[PropsWithTypes\]\`  
Functionality:  
\- \[Describe the component's primary function\]  
\- \[Describe its appearance and behavior\]  
\- \[Mention any state it needs to manage\]

Constraints:  
\- Use shadcn/ui components where possible.  
\- If client-side interactivity is needed, use the \`"use client";\` directive.  
\- Ensure the component is fully accessible.

Generate the complete code for \`components/feature/\[component-name\].tsx\`.

### **Example: Schedule Calendar Grid**

Act as a senior software engineer specializing in Next.js 15, TypeScript, and Tailwind CSS. Your task is to create a new React component.

Component Name: \`ScheduleCalendarGrid\`  
Props: \`{ scheduleData: AssignedShift\[\], isLoading: boolean }\`  
Data Shape: Use the Supabase schema definitions from \`ARCHITECTURE.md\` for the \`AssignedShift\` type.  
Functionality: The component should render a monthly calendar grid. Each day cell should display the shift information for that day from \`scheduleData\`. If \`isLoading\` is true, display a loading spinner.

Generate the complete code for \`components/schedule/schedule-calendar-grid.tsx\`.

## **2\. Server Actions**

### **Generic Server Action Prompt**

Use this for creating new Server Actions to handle data mutations.

Act as a senior full-stack engineer specializing in Next.js Server Actions and Supabase. Your task is to create a new Server Action.

Action Name: \`\[ActionName\]\`  
File Location: \`app/actions/\[feature\]-actions.ts\`  
Input: \`\[InputParametersWithTypes\]\`  
Functionality:  
\- \[Describe the primary goal of the action, e.g., "Create a new time-off request"\]  
\- \[List the specific steps: 1\. Validate input, 2\. Get user session, 3\. Perform database operation, etc.\]  
\- \[Describe the success and error return values\]

Constraints:  
\- Use the \`"use server";\` directive.  
\- All input must be validated using a Zod schema.  
\- All database operations must be wrapped in a try/catch block.  
\- Use \`revalidatePath\` or \`revalidateTag\` on success to update the cache.  
\- Return a structured object, e.g., \`{ success: true, data: ... }\` or \`{ success: false, error: ... }\`.

### **Example: Create Time-Off Request**

Act as a senior full-stack engineer specializing in Next.js Server Actions and Supabase. Your task is to create a new Server Action.

Action Name: \`createTimeOffRequest\`  
File Location: \`app/actions/time-off-actions.ts\`  
Input: \`(requestData: { startDate: Date, endDate: Date, requestType: string })\`  
Functionality:  
\- The action should create a new record in the \`time\_off\_requests\` table.  
\- 1\. Define a Zod schema to validate \`requestData\`.  
\- 2\. Get the current authenticated user's ID from Supabase.  
\- 3\. Insert a new row into the \`time\_off\_requests\` table with the user's ID and the validated data.  
\- 4\. On success, revalidate the \`/dashboard\` path.  
\- 5\. Return a success object or an error object.

Constraints:  
\- Use the \`"use server";\` directive.  
\- All input must be validated using a Zod schema.  
\- All database operations must be wrapped in a try/catch block.  
\- Use \`revalidatePath('/dashboard')\` on success.  
\- Return a structured object.

## **3\. Database & Row Level Security (RLS)**

### **RLS Policy Generation Prompt**

Use this to generate secure RLS policies for a new table.

Act as a Supabase expert specializing in PostgreSQL and Row Level Security. Your task is to generate the SQL for a secure RLS policy for a given table.

Table Name: \`\[TableName\]\`  
Schema Reference: Use the schema defined in \`ARCHITECTURE.md\`.  
Requirements:  
\- \[List the specific access rules for each role: dispatcher, supervisor, admin\]  
\- \[Example: "Dispatchers can only SELECT their own records."\]  
\- \[Example: "Supervisors can SELECT all records."\]  
\- \[Example: "Only Admins can INSERT or UPDATE."\]

Generate the complete SQL to:  
1\. Enable RLS on the table.  
2\. Create all necessary policies for SELECT, INSERT, UPDATE, and DELETE based on the requirements.  
3\. Include \`DROP POLICY\` commands for easy rollback.

### **Example: RLS for time\_off\_requests**

Act as a Supabase expert specializing in PostgreSQL and Row Level Security. Your task is to generate the SQL for a secure RLS policy for the \`time\_off\_requests\` table.

Table Name: \`time\_off\_requests\`  
Schema Reference: Use the schema defined in \`ARCHITECTURE.md\`.  
Requirements:  
\- Dispatchers can create requests for themselves.  
\- Dispatchers can SELECT and UPDATE their own requests \*only if the status is 'pending'\*.  
\- Supervisors and Admins can SELECT all requests.  
\- Supervisors and Admins can UPDATE any request.  
\- No one should be able to DELETE requests directly.

Generate the complete SQL for these policies.

## **4\. Test-Driven Development (TDD)**

### **Test File Generation Prompt**

Use this to generate the initial (failing) test file for a new component or function.

Act as a QA engineer specializing in Test-Driven Development with Vitest and React Testing Library. I will provide you with a component's specification. Your task is to write a comprehensive, initially failing test file for it.

Component to Test: \`\[ComponentName\]\`  
Props: \`\[PropsWithTypes\]\`  
Functionality: \[Describe the component's functionality\]

Write a test file at \`\[path/to/component\].test.tsx\` that covers the following scenarios:  
1\. It renders correctly with mock data.  
2\. It displays a loading state when \`isLoading\` is true.  
3\. It handles empty or null data gracefully.  
4\. It responds correctly to user interactions (e.g., clicks, form input).  
5\. It is accessible (e.g., key elements are findable via \`screen.getByRole\`).  
