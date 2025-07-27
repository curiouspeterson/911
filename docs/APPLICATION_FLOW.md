
flowchart TD
    subgraph "User Authentication"
        A1(Start) --> A2{User Authenticated?};
        A2 -- No --> A3[Login Page];
        A2 -- No --> A4[Signup Page];
        A3 -- Credentials --> A5((API: /auth/login));
        A4 -- New User Info --> A6((API: /auth/signup));
        A5 -- Success --> A7{Role?};
        A6 -- Success --> A3;
        A5 -- Failure --> A3;
    end

    subgraph "Dispatcher Journey"
        D1(Dispatcher Dashboard)
        D1 --> D2[View My Schedule];
        D1 --> D3[Request Time Off];
        D1 --> D4[Propose Shift Swap];
        D1 --> D5[Open Chat];
    end

    subgraph "Supervisor Journey"
        S1(Supervisor Dashboard)
        S1 --> S2[View Master Schedule];
        S2 --> S3[Identify Coverage Gaps];
        S1 --> S4[Manage Time-Off Requests];
        S1 --> S5[Manage Shift Swaps];
        S1 --> S6[Generate New Schedule];
        S1 --> S7[Publish Draft Schedule];
        S1 --> S8[View Reports];
    end

    subgraph "Admin Journey"
        AD1(Admin Dashboard)
        AD1 --> AD2[Manage Users];
        AD1 --> AD3[Manage System Settings];
        AD1 --> AD4[View Audit Logs];
        AD1 --> AD5[Send Broadcasts];
    end

    subgraph "Backend Systems"
        B1(Schedule Generation Job)
        B1 --> B2[Fetch Constraints];
        B2 --> B3[Run Scheduling Algorithm];
        B3 --> B4[Save Draft to DB];
        B4 --> B5[Notify Supervisor];

        B6(Notification Service)
        B6 --> B7[Send Email];
        B6 --> B8[Send SMS];
    end

    A7 -- Dispatcher --> D1;
    A7 -- Supervisor --> S1;
    A7 -- Admin --> AD1;

    S6 --> B1;
    S7 --> B6;
