import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserProfile from "./pages/shared/UserProfile"; 
import ChangePassword from "./pages/shared/ChangePassword";

// Shared Pages
import LoginPage from "./pages/shared/LoginPage";
import ForgotPassword from "./pages/shared/ForgotPassword";
import Unauthorized from "./pages/shared/Unauthorized";
import NotFound from "./pages/shared/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AttendanceHub from "./pages/admin/AttendanceHub";
import BiometricEnrollmentStation from "./pages/admin/BiometricEnrollmentStation";
import EventAndMeetingAttendance from "./pages/admin/EventAndMeetingAttendance";
import MemberDirectory from "./pages/admin/MemberDirectory";
import MeritAndInventory from "./pages/admin/MeritAndInventory";
import QuestManagement from "./pages/admin/QuestManagement";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superAdmin/SuperAdminDashboard";
import AuditLogs from "./pages/superAdmin/AuditLogs";
import BroadcastCenter from "./pages/superAdmin/BroadcastCenter";
import GamificationEngine from "./pages/superAdmin/GamificationEngine";
import HardwareManagement from "./pages/superAdmin/HardwareManagement";
import MasterUserList from "./pages/superAdmin/MasterUserList";
import OrganizationRegistry from "./pages/superAdmin/OrganizationRegistry";
import CreateGroup from './pages/superAdmin/CreateGroup';
import ConfigureOrganization from "./pages/superAdmin/ConfigureOrganization";
import ViewOrganization from "./pages/superAdmin/ViewOrganization";
import AdminUserDetailEditor from "./pages/superAdmin/AdminUserDetailEditor";
function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* --- PROTECTED CORE --- 
            Ensures the user is logged in before even looking at the layout
        */}
        <Route element={<ProtectedRoute />}>
          
          {/* DASHBOARD SHELL 
              Provides the Sidebar and the Scrollable Main Area
          */}
          <Route element={<DashboardLayout />}>

            {/* SHARED PROTECTED ROUTES 
                Added these so both roles can edit their profile/password
            */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'superAdmin']} />}>
              <Route path="/admin/profile" element={<UserProfile />} />
              <Route path="/admin/change-password" element={<ChangePassword />} />
              <Route path="/superadmin/profile" element={<UserProfile />} />
              <Route path="/superadmin/change-password" element={<ChangePassword />} />
            </Route>
            
            {/* ADMIN SECTOR
                Accessible by both 'admin' and 'superAdmin'
            */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'superAdmin']} />}>
              <Route path="/admin/adminDashboard" element={<AdminDashboard />} />
              <Route path="/admin/attendance" element={<AttendanceHub />} />
              <Route path="/admin/biometrics" element={<BiometricEnrollmentStation />} />
              <Route path="/admin/events" element={<EventAndMeetingAttendance />} />
              <Route path="/admin/members" element={<MemberDirectory />} />
              <Route path="/admin/merits" element={<MeritAndInventory />} />
              <Route path="/admin/quests" element={<QuestManagement />} />
            </Route>

            {/* SUPER ADMIN SECTOR
                Strictly for 'superAdmin' clearance only
            */}
            <Route element={<ProtectedRoute allowedRoles={['superAdmin']} />}>
              <Route path="/superadmin/superAdminDashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/audit" element={<AuditLogs />} />
              <Route path="/superadmin/broadcast" element={<BroadcastCenter />} />
              <Route path="/superadmin/engine" element={<GamificationEngine />} />
              <Route path="/superadmin/hardware" element={<HardwareManagement />} />
              <Route path="/superadmin/users" element={<MasterUserList />} />
              <Route path="/superadmin/registry" element={<OrganizationRegistry />} />
              <Route path="/superadmin/registry/new" element={<CreateGroup />} />
              <Route path="/superadmin/registry/configure/:groupId" element={<ConfigureOrganization />} />
              <Route path="/superadmin/registry/view/:groupId" element={<ViewOrganization />} />
              <Route path="/superadmin/users/edit/:userId" element={<AdminUserDetailEditor />} />
            </Route>

          </Route>
        </Route>

        {/* --- SYSTEM HELPERS --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;