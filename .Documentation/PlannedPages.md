# Planned Frontend Pages for ClubSys

This document outlines the necessary pages and views for the Vue.js frontend, categorized by user role and module.

---

## 1. Public / Unauthenticated Users

*   **`/login` - Login Page:** The main entry point for all users to authenticate.
*   **`/register` - Registration Page:** For new students to create an account.
*   **`/orgs` - Public Organization Directory:** A searchable/filterable list of all active school organizations.
*   **`/orgs/{org_id}` - Public Organization Profile:**
    *   Displays the organization's public information (name, acronym, constitution).
    *   Shows a read-only view of the current official Org Tree.
    *   Lists public announcements and upcoming events for that org.
*   **`/events` - School-Wide Event Calendar:** A calendar view of all public events from all organizations.

---

## 2. Authenticated Student (General Members & Applicants)

*   **`/dashboard` - Student Dashboard:**
    *   Personalized landing page.
    *   "My Organizations" widget.
    *   Upcoming events for their orgs.
    *   A feed of relevant announcements (both global and from their orgs).
*   **`/profile` - My Profile:** View and edit personal information.
*   **`/applications` - My Applications:** View the status of their applications to various committees.
*   **`/mobile-scanner` - Event QR Scanner View:** A simplified mobile-first view whose primary purpose is to open the camera and scan an event QR code.

---

## 3. Committee Lead

*   **`/committee/dashboard` - Committee Dashboard:**
    *   Key stats for their committee.
    *   Links to manage members, budget, and events.
*   **`/committee/vetting` - Member Vetting Page:**
    *   Lists all pending applicants for their specific committee.
    *   Functionality to "Approve" or "Reject" applicants.
*   **`/committee/budget` - Committee Budget Management:**
    *   View their committee's `AllocatedBudget`.
    *   Form to submit a `BudgetRequest` with line items.
    *   Track the status of their requests (Pending Audit, Pending Vote, Approved).
*   **`/committee/events/propose` - Propose Event Page:** Form to create an event proposal.
*   **`/committee/events/{event_id}/attendance` - Manual Attendance Override:**
    *   Interface to manually input Student IDs to log attendance for an event they manage.
    *   Triggered if the IoT device fails.

---

## 4. Executive Officers (Treasurer, Secretary, PIO)

*   **`/org/finances/audit` - Treasurer's Audit Page:**
    *   View all `BudgetRequests` from all committees within the org.
    *   Audit requests before they go to a "Round Table" vote.
    *   View uploaded receipts for liquidation.
*   **`/org/documents` - Document Vault:**
    *   Upload and manage meeting minutes, financial reports, etc.
    *   Set visibility for each document (`OfficersOnly`, `Public`).
*   **`/org/announcements` - Announcement Hub:**
    *   Create, edit, and manage organization-specific announcements.
    *   Ability to "Pin" a post to the top of the org's profile page.
*   **`/org/reports` - Report Generator:**
    *   Generate and export key reports (Financial Summary, Attendance Sheets, Membership Roster).

---

## 5. The "Round Table" (President, VPs)

*   **`/governance/dashboard` - Governance Dashboard:**
    *   The central hub for all pending `Proposals`.
    *   Lists items awaiting their vote (Structure Changes, Budget Releases, Event Approvals).
*   **`/governance/vote/{proposal_id}` - Proposal Voting Page:**
    *   Detailed view of a single proposal (e.g., "Before" and "After" of an Org Tree change).
    *   Buttons to "Approve" or "Reject" the proposal.
*   **`/org/tree-builder` - Org Tree Builder:**
    *   The interactive Vue Flow canvas for designing the organizational structure.
    *   Drag-and-drop nodes, assign users to positions, link committees.
    *   Includes the integrated image cropper for profile pictures.
    *   Submitting a change here creates a `Proposal` for the "Round Table" to vote on.
*   **`/org/finances/overview` - Full Financial Overview:**
    *   View the organization's `TotalBalance`.
    *   Page to allocate budgets to different committees.

---

## 6. School Admin

*   **`/admin/dashboard` - Admin Dashboard:**
    *   High-level overview of the entire system.
    *   Queue of pending Organization approvals.
    *   Queue of pending Event proposals (final approval stage).
*   **`/admin/import` - Bulk Data Import Page:**
    *   Interface to download the locked Excel template.
    *   Upload and validate user/org data with strict, atomic validation.
*   **`/admin/audit-log` - System Audit Trail:**
    *   A read-only viewer for all critical actions recorded in the `AuditLogs` table.
*   **`/admin/end-of-term` - End-of-Term Turnover Page:**
    *   Contains the "End School Year" functionality to archive trees and reset officer roles.
*   **`/admin/announcements/new` - Global Announcement Page:**
    *   Form to create a school-wide announcement that appears on the public homepage and all user dashboards.
