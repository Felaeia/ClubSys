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