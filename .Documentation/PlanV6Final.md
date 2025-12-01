# 📘 Project Specification: ClubSys (Master Plan)

**Project Title:** ClubSys
**Subtitle:** An IoT-Integrated Organizational Management & Visualization System with Multi-Level Governance.
**Developer:** Manuel M. Cando
**Tech Stack:** Vue.js (Frontend) + .NET Core (Backend) + ESP8266 (IoT).

---

## 1. Core Philosophy & Project Overview
ClubSys is a centralized web platform designed to digitize the chaotic management of school organizations by solving three specific critical problems:

1.  **The "Dictator" Problem:**
    * *Issue:* Presidents often act unilaterally without consulting their officers.
    * *Solution:* **Software-Enforced Democracy.** Critical actions require a 2/3 majority vote from the "Round Table" (Top 3 Heads).

2.  **The "Ghost Member" Problem:**
    * *Issue:* Presidents cannot manually vet hundreds of members, leading to inaccurate records.
    * *Solution:* **Distributed Vetting.** Committee Leads have autonomy to vet and approve their own members, distributing the workload.

3.  **The "Manual Attendance" Problem:**
    * *Issue:* Paper attendance sheets are slow, error-prone, and hard to digitize.
    * *Solution:* **Cyber-Physical Verification.** A "Scan-to-Verify" IoT system using a mobile app and a physical hardware checkpoint.

The system focuses on **Governance** (how decisions are made), **Visualization** (how structures are seen), and **Physical Validation** (how members interact with the campus).

---

## 2. User Hierarchy & Roles

| Role | Who are they? | Primary Responsibility & Key Capabilities |
| :--- | :--- | :--- |
| **School Admin** | Student Affairs / Faculty / Student Council Pres | **Overseer.** Approves new Orgs, performs Bulk Data Imports, audits financial logs, and can trigger the "End-of-Term" process. *Does not micromanage internal funds.* |
| **The "Round Table"** | President, VP-Internal, VP-External | **Governance.** They hold the **2/3 majority voting power** for structural changes, budget releases, and appointing Committee Leads. |
| **Executive Officers** | Treasurer, Secretary, PIO | **Operations.** High-ranking staff who manage specific tasks (Money, Minutes, Announcements). They cannot vote on major structural changes. |
| **Committee Lead** | Department Heads (e.g., Logistics, Creatives) | **Workforce & Middle Management.** Vets new applicants for their committee, proposes events, and manages **their specific allocated budget**. |
| **Student** | General Member / Applicant | **Participant.** Scans QR codes for attendance, views Org Trees, applies to committees, and joins events. |

---

## 3. Key Software Modules

### A. The "Round Table" Governance Engine
* **Goal:** Prevent unilateral decisions by enforcing a democratic process for critical actions.
* **Trigger:** When a Head attempts a "Protected Action" (e.g., Restructuring the Org Tree, Changing the Constitution, Deleting the Org).
* **Logic:** The system blocks immediate execution and sets the status to `PENDING_VOTE`.
* **Resolution:** The other two Heads receive a real-time alert. A **2/3 Majority Vote** is required to unlock and execute the change.

### B. Dynamic Org Tree Visualization
* **Goal:** A live, interactive chart that reflects the real hierarchy, not a static image.
* **Builder:** A drag-and-drop canvas (using **Vue Flow**) where Heads can visually structure their organization.
* **Image Handling:** An integrated **Cropper Tool** ensures all profile pictures are standardized to fit perfectly within the tree nodes.
* **Updates:** The public-facing organization tree only updates after a "Round Table" vote passes.

### C. Committee Vetting & Recruitment (The Autonomy Model)
* **Goal:** Allow Committee Leads to manage their own recruitment, distributing the workload.
* **Workflow:**
    1. A student applies to a specific committee (e.g., "Logistics").
    2. The **Committee Lead** (not the President) vets the applicant.
    3. The Lead clicks "Approve," and the student is automatically added as a "Leaf Node" under that committee's branch in the Org Tree.

### D. Dual-Path Event Proposals
* **Goal:** Provide autonomy for committees while maintaining oversight from the Heads.
* **Path 1 (Committee-Led):** Lead creates a proposal -> **Internal Filter (Round Table Vote)** -> **Final School Admin Approval**.
* **Path 2 (Head-Led):** President creates a proposal -> **Internal Consensus (VPs must agree)** -> **Final School Admin Approval**.

### E. Financial & Budget System (Autonomous Model)
* **Goal:** Enable internal financial control with scoped transparency.
* **The Wallet:** Funds exist as a digital value controlled by the Organization (from membership fees, etc.). The School Admin can audit logs but does not approve every transaction.
* **Scoped View:** The "Round Table" allocates a budget to a committee. The Committee Lead sees *only* their allocated budget, not the organization's total balance.
* **Flow:** A Lead requests a purchase linked to an approved event -> The Treasurer audits the request -> The "Round Table" votes to release the funds from the committee's allocation -> The Lead uploads receipts for liquidation.

### F. Admin "Strict" Bulk Import
* **Goal:** Ensure data integrity and efficiency for the School Admin.
* **Workflow:** Admin downloads a locked Excel template -> Fills it with user/org data -> Uploads the file.
* **Atomic Validation:** If even **one error** exists (e.g., a duplicate email), the **Entire Batch Fails**. The system rejects the file and identifies the specific row error, enforcing data discipline.

### G. Notification Hub (The Glue)
* **Tech:** SignalR for real-time UI updates and SMTP for email.
* **UI:** A bell icon in the navigation bar for in-app alerts.
* **The Nudge:** If a "Round Table" member fails to vote on a proposal within **24 hours**, the system automatically sends an email reminder to prevent stalling.

### H. The Document Vault
* **Goal:** A centralized repository for organization documents with clear permission levels.
* **Public:** Constitution, By-Laws (Viewable by all students and guests).
* **Private:** Meeting Minutes, Financial Reports (Viewable only by Officers - Heads + Executives).

### I. "End-of-Term" Turnover (Partial Reset)
* **Goal:** Streamline the transition between school years.
* **Trigger:** A School Admin clicks the "End School Year" button.
* **Archive:** The current Org Tree and officer list are saved as a PDF/image in the "History" tab for archival purposes.
* **The Partial Wipe:** Officer roles (Heads, Leads, Executives) are cleared and vacated. Critically, **general members remain intact**, ready for the new leadership to take over.

### J. Audit Trail (Low Priority)
* **Function:** A read-only log of all critical actions (`INSERT`, `UPDATE`, `DELETE`) on the platform, visible only to Admins and the "Round Table" for accountability.

### K. The Announcement Board (News Feed)

  * **Goal:** A centralized communication hub for Organization updates and School-wide news, replacing scattered social media posts.
  * **Visibility Logic:**
      * **Public Posts:** Visible to all students and guests (e.g., "Recruitment Week is Open\!").
      * **Members-Only:** Visible only to logged-in members of that specific org (e.g., "General Assembly Room Change").
  * **Priority System:** The PIO or Admin can mark a post as **"Pinned"** or **"High Priority"** to keep it at the top of the feed.
  * **Roles:**
      * **School Admin:** Posts appear on the Global Homepage.
      * **Org PIO/Head:** Posts appear on the Organization's Profile Page.

### L. Manual Attendance Override (IoT Fallback)
* **Goal:** Operational continuity during hardware or network failure.
* **Scenario:** The Wi-Fi drops, or the ESP8266 malfunctions during an event.
* **The Feature:** A "Manually Encode Attendee" button on the Committee Lead's dashboard.
* **Action:** The Lead manually inputs a Student ID to record attendance. This ensures the event data remains accurate even if the IoT layer fails.

### M. Report Generator (Exports)
* **Goal:** Data portability for administrative submissions.
* **Function:** A simple "Export to PDF/Excel" button for key data views.
* **Key Reports:**
    * **Financial Summary:** Income vs. Expenses (for the Treasurer).
    * **Attendance Sheet:** List of attendees for a specific Event (for the Secretary).
    * **Membership Roster:** Full list of active members (for the School Admin).
---

## 4. The IoT Integration: "The Smart Checkpoint"

**Strategy:** Passive Scanning (using the student's phone) + Active Feedback (a physical hardware box).

*   **The Workflow:**
    1.  **Trigger:** A student uses the **ClubSys App** to scan a printed QR Code on the wall of an event venue. The QR code contains the `Room_ID` and `Event_ID`.
    2.  **Cloud Verification:** The app sends the data to the .NET backend. The server verifies: *Is this user a valid member of the organization? Is there an active event at this location right now?*
    3.  **Hardware Feedback:** The server sends a signal via Wi-Fi (using SignalR) to a small hardware box in the room.
        *   **Valid:** The box flashes a **Green LED** and emits a single beep. Attendance is recorded.
        *   **Invalid:** The box flashes a **Red LED** and emits a long, aggressive buzz. Access is denied.

*   **Bill of Materials (BOM):**
    *   **Controller:** ESP8266 (NodeMCU) or ESP32.
    *   **Indicators:** Red LED, Green LED.
    *   **Audio:** Active Buzzer.
    *   **Power:** Standard USB Power Bank or wall adapter.

---

## 5. Technical Architecture & File Structure

### A. Tech Stack
*   **Frontend:** Vue.js (Vite)
*   **State Management:** Pinia (For User Session, Permissions, and Tree data)
*   **HTTP Client:** Axios
*   **Visualization:** Vue Flow (For the Org Tree), Vue-Advanced-Cropper
*   **Backend:** .NET Core Web API (C#)
*   **Real-Time:** SignalR (For dashboard updates, voting alerts, and IoT triggers)
*   **Database:** Microsoft SQL Server with Entity Framework Core  (ORM) & Stored Procedures
*   **Authentication:** JWT (JSON Web Tokens)
*   **Hardware:** ESP8266/ESP32 programmed in Arduino C++

### B. Backend (.NET API) File Structure (Needs More Architectural Planning by the Backend Dev)
```
ClubSys.API/
├── Controllers/           # API Endpoints (AuthController, GovernanceController, OrgTreeController, AnnouncementController)
├── Models/                # DB Entities (User, Organization, Vote, Event, Document)
├── Data/                  # DbContext & Migrations
├── Services/              # Business Logic (GovernanceService, OrgTreeService, NotificationService)
├── Hubs/                  # SignalR Hubs (DashboardHub, IoTFeedbackHub)
└── Program.cs
```

### C. Frontend (Vue.js) File Structure (Needs More Architectural Planning by the Frontend Dev)
```
src/
├── components/
│   ├── OrgTree/
│   │   ├── TreeNode.vue       # Visual Component for a member
│   │   └── OrgChart.vue       # The main Vue Flow canvas
│   ├── Dashboard/             # Widgets and panels
│   └── Shared/
│       └── ImageCropper.vue
│       └── NewsFeed.vue
├── views/
│   ├── Admin/               # School Admin Pages
│   ├── OrgHead/             # Round Table Dashboard for voting
│   ├── Committee/           # Lead's dashboard for vetting
│   └── public/              # Public-facing org tree view
├── stores/                  # Pinia State Management
│   ├── userStore.js         # Handles Auth, session, and permissions
│   └── orgStore.js          # Manages organization and tree data
└── services/                # Axios setup and API call definitions
```

### D. Data Security & Integrity Rules
1.  **Strict Import:** All bulk imports must use atomic transactions. No partial uploads are permitted.
2.  **Scoped Financials:** A `Committee_Lead` role can only view budgets where the `Committee_ID` matches their own. An `Org_Head` can view the budget for their entire `Org_ID`.

---

## 6. Key Differentiators (Why This Project Stands Out)

1.  **It Solves "The Dictator Problem":** Most systems give one admin total control. The "Round Table" feature introduces **software-enforced democracy**, a complex and impressive governance model.
2.  **It Bridges the Digital-Physical Gap:** It connects the digital recruitment and management process directly to a physical, real-world attendance system via economical IoT hardware.
3.  **It Demonstrates Resourcefulness:** It proves that a smart, interactive environment can be built using existing smartphones and less than $10 worth of hardware, avoiding expensive biometrics or proprietary scanners.