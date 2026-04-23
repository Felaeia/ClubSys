import React from "react";
import { useAuth } from "../../hooks/useAuth"; 

const SuperAdminDashboard = () => {
  const { profile, user } = useAuth(); 

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-3xl p-10 shadow-xl shadow-blue-200 dark:shadow-none text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold opacity-80 uppercase tracking-[0.2em] mb-3">
            Authorized System Administrator
          </h2>
          <h3 className="text-4xl font-black italic">
            Welcome back, {profile?.firstName || "Chief"}!
          </h3>
          <p className="mt-4 opacity-90 max-w-lg">
            System ID: <span className="font-mono font-bold bg-white/20 px-2 py-1 rounded">{profile?.studentId}</span>. 
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-black">Role</p>
          <p className="text-xl font-bold dark:text-white mt-1 uppercase text-blue-600">{profile?.userRole}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-black">Email</p>
          <p className="text-lg font-bold dark:text-white mt-1 truncate">{user?.email}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-black">Organization</p>
          <p className="text-xl font-bold dark:text-white mt-1">CSO Chairman</p>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;