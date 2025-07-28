# **Algorithm Spike: POC Analysis & Recommendation**

| | |
| :--- | :--- |
| **Document Version:** | 1.0 |
| **Status:** | Complete |
| **Date:** | July 26, 2025 |

## **1. Overview**

A proof-of-concept (POC) script was developed (`lib/scheduling/poc.ts`) to validate the feasibility of using a pure, dependency-free TypeScript algorithm to handle the core scheduling logic. The script was tested against a set of mock data representing 6 employees, 2 shifts, and a 14-day scheduling period.

The primary goal was to de-risk the technical approach by confirming that the most critical **hard constraints** could be correctly modeled and enforced without relying on external libraries like Google OR-Tools.

## **2. Execution Results & Analysis**

The POC script was executed using `ts-node`. The script ran to completion and produced a schedule, but with significant and expected validation failures.

### **What Worked (Successes)**

The POC successfully demonstrated that the core logic for individual employee constraints can be effectively implemented in TypeScript:

*   **Time-Off Requests:** The algorithm correctly identified and respected approved time-off, ensuring no employee was scheduled on their requested day off.
*   **40-Hour Work Week:** The logic to track and limit weekly hours, including resetting the count at the start of a new week, functioned as expected.
*   **4x10 Shift Pattern:** The constraint limiting employees to a maximum of 4 consecutive work days was enforced correctly.

### **What Didn't Work (Failures)**

The POC failed to produce a valid schedule that met all staffing requirements.

*   **Staffing Gaps:** The final validation reported numerous `Staffing GAP` errors, primarily an inability to assign a supervisor to the "Night Coverage" shift.
*   **Root Cause:** This failure was caused by the intentionally simplistic "greedy" logic. The algorithm assigned the single available supervisor to the first shift of the day (Day Shift), leaving no supervisors available for subsequent shifts. This highlights the limitations of a naive approach and proves the need for a more sophisticated assignment strategy.

## **3. Conclusion & Recommendation**

**The Proof-of-Concept is considered a success.**

It has successfully achieved its primary objective: to prove that a TypeScript-native approach is technically viable for building the scheduling engine. The failures were not only expected but provided valuable insight into the requirements for the production algorithm.

### **Recommendation: Proceed**

It is strongly recommended to **proceed with developing the full scheduling algorithm in TypeScript**. The project is not blocked, and the path forward is clear.

The full implementation (Task 8) must evolve beyond the POC's naive greedy approach and incorporate more sophisticated strategies, such as:

1.  **Requirement-First Approach:** Iterate through required slots (e.g., "we need 1 supervisor for the night shift") rather than iterating through employees.
2.  **Candidate Scoring:** Develop a scoring system to evaluate all eligible candidates for a given shift, allowing the algorithm to make more optimal choices (e.g., prioritizing a candidate who is not the only person who can fill a different, hard-to-fill shift later).
3.  **Multi-Pass Logic:** Implement a multi-pass system where an initial pass assigns critical roles (like supervisors) first, followed by subsequent passes to fill remaining roles.

This completes the algorithm spike. The technical direction is validated, and the project can move forward with confidence.