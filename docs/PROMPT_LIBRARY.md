# Prompt Library

## Next.js Component Prompt:
```
Act as a senior software engineer specializing in Next.js 14, TypeScript, and Tailwind CSS. Your task is to create a new React component.

Component Name: `ScheduleCalendarGrid`
Props: `{ scheduleData: AssignedShift, isLoading: boolean }`
Data Shape: Use the Supabase schema definitions from `architecture.md` for the `AssignedShift` type.
Functionality: The component should render a monthly calendar grid. Each day cell should display the shift information for that day from `scheduleData`. If `isLoading` is true, display a loading spinner.

Generate the complete code for `components/ScheduleCalendarGrid.tsx`.
```

## TDD Test Generation Prompt:
```
Act as a QA engineer specializing in Test-Driven Development with Jest and React Testing Library. I will provide you with a React component. Your task is to write a comprehensive unit test file for it.

Component to Test: `[Paste component code here]`

Write tests that cover the following scenarios:
1. It renders correctly with mock schedule data.
2. It displays the loading spinner when `isLoading` is true.
3. It correctly handles a day with no assigned shift.
```
