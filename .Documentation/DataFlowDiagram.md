# ClubSys - Data Flow Diagram

This document illustrates the high-level data flow between the primary components of the ClubSys ecosystem: the User's browser (Frontend), the server (Backend API), the IoT hardware, and the database.

The diagram focuses on several key user stories to demonstrate the system's architecture in action.

```mermaid
graph TD
    subgraph External Systems
        U(👨 User);
        IOT[⚡️ IoT Device];
    end

    subgraph Frontend (Vue.js App in Browser)
        direction LR
        LP[Login Page];
        DB[Dashboard];
        OTB[Org Tree Builder];
        GOV[Governance Dashboard];
        ATT[Mobile Attendance Scanner];
        FIN[Budget Request Page];
    end

    subgraph Backend (.NET API Server)
        direction LR
        AUTH[Auth Controller];
        TREE[Org Tree Controller];
        PROP[Proposals Controller];
        VOTE[Votes Controller];
        ATT_API[Attendance Controller];
        FIN_API[Finance Controller];
        SR_HUB[📡 SignalR Hub];
    end

    subgraph Data Stores (MS SQL Server)
        direction LR
        UsersTbl[(Users)];
        TreeNodesTbl[(TreeNodes)];
        ProposalsTbl[(Proposals)];
        VotesTbl[(Votes)];
        AttendanceTbl[(AttendanceLogs)];
        BudgetTbl[(BudgetRequests)];
    end

    %% --- Flows ---

    %% 1. Authentication Flow
    U -- Credentials --> LP;
    LP -- POST /login --> AUTH;
    AUTH -- Reads Hash --> UsersTbl;
    AUTH -- Returns JWT --> LP;
    LP -- Stores JWT --> DB;

    %% 2. Org Tree Editing & Governance Flow
    U -- Navigates to --> OTB;
    OTB -- GET /tree --> TREE;
    TREE -- Reads Data --> TreeNodesTbl;
    TreeNodesTbl -- Returns Tree JSON --> TREE;
    TREE -- Sends Tree JSON --> OTB;
    OTB -- Displays Interactive Tree --> U;
    U -- Modifies Tree & Submits --> OTB;
    OTB -- POST /proposals (StructureChange) --> PROP;
    PROP -- Creates Proposal --> ProposalsTbl;
    PROP -- Pushes Notification --> SR_HUB;
    SR_HUB -- Notifies Other Heads --> GOV;
    U -- Sees Proposal & Votes --> GOV;
    GOV -- POST /proposals/{id}/vote --> VOTE;
    VOTE -- Creates Vote Record --> VotesTbl;
    VOTE -- Checks Majority & Updates --> ProposalsTbl;
    VOTE -- On Approval, Updates --> TreeNodesTbl;

    %% 3. IoT Attendance Flow
    U -- Scans QR Code --> ATT;
    ATT -- POST /attendance/scan (w/ JWT) --> ATT_API;
    ATT_API -- Validates User/Event --> UsersTbl;
    ATT_API -- Logs Scan --> AttendanceTbl;
    ATT_API -- Sends 'Green/Red' Signal --> SR_HUB;
    SR_HUB -- Pushes Command --> IOT;
    IOT -- Flashes LED / Beeps --> U;

    %% 4. Financial Request Flow
    U -- Submits Budget Request --> FIN;
    FIN -- POST /budget-requests --> FIN_API;
    FIN_API -- Creates Request (Pending Audit) --> BudgetTbl;
    %% Treasurer audits, then API updates status to Pending_Vote and creates a proposal.
    FIN_API -- Creates Proposal (BudgetRelease) --> PROP;
    %% The flow then merges with the Governance/Voting flow above.
    PROP --> SR_HUB;

```

### Key Data Flow Explanations

1.  **Authentication Flow:**
    *   The user provides credentials on the **Login Page**.
    *   The **Frontend** sends these to the **Backend's Auth Controller**.
    *   The backend validates against the `Users` table and, if successful, returns a JSON Web Token (JWT).
    *   This JWT is stored in the browser and sent with all subsequent requests to authenticate the user.

2.  **Org Tree Editing & Governance Flow (The "Dictator Problem" Solution):**
    *   A "Round Table" member loads the **Org Tree Builder**, which fetches the current structure from the `TreeNodes` table via the backend.
    *   When the user saves a change, the **Frontend** *does not* modify the tree directly. Instead, it creates a `Proposal` of type `StructureChange`.
    *   The **Backend** saves this proposal and uses **SignalR** to notify the other "Round Table" members in real-time.
    *   Other members vote via the **Governance Dashboard**. The backend records each `Vote`.
    *   Only after a 2/3 majority is confirmed does the backend update the `Proposals` status and apply the changes to the `TreeNodes` table, ensuring software-enforced democracy.

3.  **IoT Attendance Flow (The "Manual Attendance" Solution):**
    *   A student uses the mobile-friendly **Attendance Scanner** page to scan a QR code.
    *   The **Frontend** sends the user's JWT and the QR code data to the **Attendance Controller**.
    *   The **Backend** performs the critical validation: Is this user a member? Is the event active?
    *   It immediately logs the attendance attempt in the `AttendanceLogs` table.
    *   Concurrently, it sends a real-time command via the **SignalR Hub** to the specific **IoT Device** in the room, which provides instant physical feedback (green or red light).

4.  **Financial Request Flow:**
    *   A Committee Lead submits a request, which is saved with a status of `Pending_Audit`.
    *   After a Treasurer audits the request (a simple status update), the backend elevates it by creating a new `Proposal` of type `BudgetRelease`.
    *   This action hooks directly into the **Governance Flow (#2)**, requiring a "Round Table" vote to release the funds, ensuring oversight.
