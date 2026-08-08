import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Users, 
  Fingerprint, 
  CalendarCheck, 
  Trophy, 
  Sword, 
  ShieldAlert, 
  Radio, 
  Cpu, 
  ScrollText, 
  Landmark, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  UserCircle,
  Megaphone 
} from 'lucide-react';

const Sidebar = ({ handleLogout, isCollapsed, setIsCollapsed }) => {
  const { profile } = useAuth();
  const role = profile?.userRole; // Usually 'admin' or 'superAdmin'

  // Define the menu based on the role to keep the UI clean
  const menuConfig = {
    admin: [
      { name: 'My Profile', path: '/admin/profile', icon: <UserCircle size={22} /> },
      { name: 'Dashboard', path: '/admin/adminDashboard', icon: <LayoutDashboard size={22} /> },
      { name: 'Attendance Hub', path: '/admin/attendance', icon: <CalendarCheck size={22} /> },
      { name: 'Biometrics', path: '/admin/biometrics', icon: <Fingerprint size={22} /> },
      { name: 'Members', path: '/admin/members', icon: <Users size={22} /> },
      { name: 'Merits & Gear', path: '/admin/merits', icon: <Trophy size={22} /> },
      { name: 'Quests', path: '/admin/quests', icon: <Sword size={22} /> },
    ],
    superAdmin: [
      { name: 'Admin Profile', path: '/superadmin/profile', icon: <UserCircle size={22} /> },
      { name: 'System Console', path: '/superadmin/superAdminDashboard', icon: <LayoutDashboard size={22} /> },
      { name: 'Broadcast Center', path: '/superadmin/broadcast', icon: <Megaphone size={22} /> },
      { name: 'Registry', path: '/superadmin/registry', icon: <Landmark size={22} /> },
      { name: 'Game Engine', path: '/superadmin/engine', icon: <Cpu size={22} /> },
      { name: 'Hardware Hub', path: '/superadmin/hardware', icon: <Radio size={22} /> },
      { name: 'Audit Logs', path: '/superadmin/audit', icon: <ScrollText size={22} /> },
      { name: 'User Control', path: '/superadmin/users', icon: <ShieldAlert size={22} /> },
    ]
  };

  const activeLinks = menuConfig[role] || [];

  return (
    <aside className="h-full bg-[#0f172a] border-r border-white/5 flex flex-col relative shadow-2xl transition-all duration-300">
      {/* Dynamic Toggle Button */}
      <button 
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 bg-blue-600 text-white rounded-full p-1 shadow-xl hover:bg-blue-500 z-50 transition-transform active:scale-95"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} /> }
      </button>

      {/* Identity Section */}
      <div className={`p-6 border-b border-white/5 flex items-center ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
        <img 
          src={profile?.profilePictureUrl || 'https://via.placeholder.com/150'} 
          className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
          alt="Profile"
        />
        {!isCollapsed && (
          <div className="flex flex-col min-w-0 overflow-hidden animate-in fade-in slide-in-from-left-2">
            <h2 className="text-sm font-bold text-white truncate">
              {profile?.firstName}
            </h2>
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
              {role }
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {activeLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            title={isCollapsed ? link.name : ""}
            className={({ isActive }) => 
              `flex items-center rounded-xl transition-all duration-200 group ${
                isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
              } ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="shrink-0">{link.icon}</span>
            {!isCollapsed && (
              <span className="text-xs font-semibold whitespace-nowrap overflow-hidden">
                {link.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Secure Logout Action */}
      <div className="p-4 border-t border-white/5">
        <button 
          type="button"
          onClick={handleLogout}
          className={`flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 ${
            isCollapsed ? 'p-3' : 'gap-3 py-3'
          } w-full text-[10px] font-black uppercase tracking-widest border border-red-500/10`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>End Session</span>}
        </button>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  handleLogout: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool.isRequired,
  setIsCollapsed: PropTypes.func.isRequired,
};

export default Sidebar;