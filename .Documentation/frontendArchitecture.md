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