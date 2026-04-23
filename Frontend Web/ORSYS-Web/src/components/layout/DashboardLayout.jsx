import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { logoutUser } from '../../api/services/auth.service';

// Capitalized for ESLint compliance
const MotionDiv = motion.div;

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      // Replace: true prevents back-button hijacking after logout
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-200 overflow-hidden">
      {/* SIDEBAR SECTION 
          The width is managed internally by the Sidebar component using isCollapsed 
      */}
      <Sidebar 
        handleLogout={handleLogout} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />

      {/* MAIN VIEWPORT 
          flex-1 ensures it takes up all remaining space 
      */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-[#020617]">
        
        {/* TOP NAVIGATION / BREADCRUMBS BAR */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              System Console <span className="text-slate-600 mx-2">|</span> 
              <span className="text-blue-400">{location.pathname.split('/')[1]}</span>
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Mandaue Node</p>
              <p className="text-[9px] text-slate-600 uppercase font-medium">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <section className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
          <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full"
              >
                {/* THE OUTLET: 
                    This is where AdminDashboard or SuperAdminDashboard 
                    renders based on your App.jsx routes.
                */}
                <Outlet />
              </MotionDiv>
            </AnimatePresence>
          </div>

          {/* Background Branding Watermark */}
          <div className="fixed bottom-10 right-10 pointer-events-none opacity-[0.02] select-none">
            <h2 className="text-9xl font-black italic">ORSYS</h2>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;