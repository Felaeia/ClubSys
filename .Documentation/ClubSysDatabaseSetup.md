-- =============================================
-- Project: ClubSys
-- Description: Full Database Initialization Script (17 Tables)
-- Tech Stack: .NET Core / SQL Server
-- =============================================

-- 1. Setup Database
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'ClubSysDB')
BEGIN
    CREATE DATABASE ClubSysDB;
END
GO

USE ClubSysDB;
GO

-- =============================================
-- 2. Drop Tables (Clean Slate - Reverse Dependency Order)
-- =============================================
-- We drop tables if they exist so you can re-run this script safely during dev.
DROP TABLE IF EXISTS AuditLogs;
DROP TABLE IF EXISTS BudgetLineItems;
DROP TABLE IF EXISTS BudgetRequests;
DROP TABLE IF EXISTS AttendanceLogs;
DROP TABLE IF EXISTS IotDevices;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Votes;
DROP TABLE IF EXISTS Proposals;
DROP TABLE IF EXISTS ArchivedTrees;
DROP TABLE IF EXISTS TreeNodes;
DROP TABLE IF EXISTS Notifications;
DROP TABLE IF EXISTS Announcements;
DROP TABLE IF EXISTS OrgDocuments;
DROP TABLE IF EXISTS Committees;
DROP TABLE IF EXISTS OrgMemberships;
DROP TABLE IF EXISTS Organizations;
DROP TABLE IF EXISTS Users;
GO

-- =============================================
-- 3. Module A: Identity & Membership
-- =============================================

CREATE TABLE Users (
    UserID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StudentID NVARCHAR(50) NOT NULL UNIQUE,
    UserName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    GlobalRole NVARCHAR(20) NOT NULL CHECK (GlobalRole IN ('Admin', 'Student')),
    CreatedOn DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE Organizations (
    OrgID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Acronym NVARCHAR(20) NOT NULL,
    OrgType NVARCHAR(20) NOT NULL CHECK (OrgType IN ('Academic', 'Non-Academic')),
    TotalBalance DECIMAL(18, 2) DEFAULT 0.00, -- The Main Wallet
    IsActive BIT DEFAULT 1,
    CreatedOn DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE OrgMemberships (
    MembershipID INT PRIMARY KEY IDENTITY(1,1),
    UserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Pending_Vetting', 'Active', 'Rejected', 'Archived')),
    JoinedDate DATETIME2 DEFAULT GETDATE()
);

-- =============================================
-- 4. Module B: Organization Structure
-- =============================================

CREATE TABLE Committees (
    CommitteeID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    Name NVARCHAR(100) NOT NULL,
    AllocatedBudget DECIMAL(18, 2) DEFAULT 0.00 -- Scoped Wallet for Leads
);

CREATE TABLE TreeNodes (
    NodeID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    ParentNodeID INT FOREIGN KEY REFERENCES TreeNodes(NodeID), -- Self-Referencing for Hierarchy
    CommitteeID INT FOREIGN KEY REFERENCES Committees(CommitteeID), -- Nullable (Top heads don't have committees)
    AssignedUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID), -- Nullable (Vacant positions)
    PositionName NVARCHAR(100) NOT NULL, -- e.g., "VP Internal", "Logistics Member"
    Coordinates NVARCHAR(MAX) NULL -- JSON string for Vue Flow positions {x: 100, y: 200}
);

CREATE TABLE ArchivedTrees (
    ArchiveID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    SchoolYear NVARCHAR(20) NOT NULL, -- e.g., "2024-2025"
    TreeSnapshotJSON NVARCHAR(MAX) NOT NULL, -- Full JSON dump of the tree structure
    ArchivedAt DATETIME2 DEFAULT GETDATE()
);

-- =============================================
-- 5. Module C: Governance & History
-- =============================================

CREATE TABLE Proposals (
    ProposalID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    CreatedByUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    ProposalType NVARCHAR(50) NOT NULL CHECK (ProposalType IN ('StructureChange', 'BudgetRelease', 'EventApproval')),
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Pending_Vote', 'Approved', 'Rejected')),
    DataPayload NVARCHAR(MAX) NULL, -- JSON details of the proposal
    CreatedOn DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE Votes (
    VoteID INT PRIMARY KEY IDENTITY(1,1),
    ProposalID INT FOREIGN KEY REFERENCES Proposals(ProposalID) ON DELETE CASCADE,
    VoterUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    Verdict BIT NOT NULL, -- 1 = Approve, 0 = Reject
    VoteTime DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE AuditLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    ActorUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    ActionType NVARCHAR(50) NOT NULL, -- e.g., 'Create_Proposal', 'Manual_Attendance'
    TargetTable NVARCHAR(50) NOT NULL,
    Details NVARCHAR(MAX) NULL,
    Timestamp DATETIME2 DEFAULT GETDATE()
);

-- =============================================
-- 6. Module D: Operations & Communications
-- =============================================

CREATE TABLE Events (
    EventID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    ProposerUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    ApprovalStatus NVARCHAR(50) NOT NULL CHECK (ApprovalStatus IN ('Pending_Internal', 'Pending_Admin', 'Active', 'Rejected')),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Date DATETIME2 NOT NULL,
    Venue NVARCHAR(100) NOT NULL
);

CREATE TABLE IotDevices (
    DeviceID NVARCHAR(50) PRIMARY KEY, -- The Chip ID / Hardware Serial
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    RoomName NVARCHAR(100) NOT NULL,
    ApiSecretKey NVARCHAR(256) NOT NULL, -- Hashed Key for Security
    IsActive BIT DEFAULT 1
);

-- UPDATED TABLE: AttendanceLogs with Manual Override Support
CREATE TABLE AttendanceLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    EventID INT FOREIGN KEY REFERENCES Events(EventID),
    UserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID), -- The Student
    DeviceID NVARCHAR(50) FOREIGN KEY REFERENCES IotDevices(DeviceID) NULL, -- Nullable for Manual Entry
    ScanTime DATETIME2 DEFAULT GETDATE(),
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Success', 'Failed')),
    EntryMethod NVARCHAR(20) NOT NULL CHECK (EntryMethod IN ('IoT_Scan', 'Manual_Override')),
    EncodedByUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID) NULL -- Null if IoT Scan
);

CREATE TABLE OrgDocuments (
    DocumentID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID),
    UploaderUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(200) NOT NULL,
    FilePath NVARCHAR(MAX) NOT NULL,
    Visibility NVARCHAR(20) NOT NULL CHECK (Visibility IN ('Public', 'OfficersOnly', 'AdminOnly')),
    UploadedAt DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    RecipientUserID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(100) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    RelatedEntityID INT NULL, -- ID of the Event/Proposal
    IsRead BIT DEFAULT 0,
    CreatedOn DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE Announcements (
    AnnouncementID INT PRIMARY KEY IDENTITY(1,1),
    OrgID INT FOREIGN KEY REFERENCES Organizations(OrgID) NULL, -- NULL = School Admin Post
    AuthorID UNIQUEIDENTIFIER FOREIGN KEY REFERENCES Users(UserID),
    Title NVARCHAR(200) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    Priority NVARCHAR(20) DEFAULT 'Normal' CHECK (Priority IN ('Normal', 'High_Pinned')),
    Visibility NVARCHAR(20) DEFAULT 'Public' CHECK (Visibility IN ('Public', 'MembersOnly')),
    PostedAt DATETIME2 DEFAULT GETDATE()
);

-- =============================================
-- 7. Module E: Finance
-- =============================================

CREATE TABLE BudgetRequests (
    RequestID INT PRIMARY KEY IDENTITY(1,1),
    CommitteeID INT FOREIGN KEY REFERENCES Committees(CommitteeID),
    EventID INT FOREIGN KEY REFERENCES Events(EventID) NULL, -- Usually linked to an event
    AmountRequested DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(20) NOT NULL CHECK (Status IN ('Pending_Audit', 'Pending_Vote', 'Approved', 'Liquidated', 'Rejected')),
    CreatedOn DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
);

CREATE TABLE BudgetLineItems (
    LineItemID INT PRIMARY KEY IDENTITY(1,1),
    RequestID INT FOREIGN KEY REFERENCES BudgetRequests(RequestID) ON DELETE CASCADE,
    ItemName NVARCHAR(100) NOT NULL,
    EstimatedCost DECIMAL(18, 2) NOT NULL,
    ReceiptURL NVARCHAR(MAX) NULL -- For Liquidation
);

-- =============================================
-- End of Script
-- =============================================