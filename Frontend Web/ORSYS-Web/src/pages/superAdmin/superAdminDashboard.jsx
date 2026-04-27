import React, { useState, useEffect } from 'react';
import { db } from '../../api/firebaseConfig';
import { 
  collection, query, onSnapshot, orderBy, limit 
} from 'firebase/firestore';
import { 
  Users, Activity, ShieldAlert, Database, 
  UserPlus, TrendingUp, Server, Settings,
  ArrowUpRight, Fingerprint, RefreshCcw,
  Zap, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;

const SuperAdminDashboard = () => {
  // Live Data States
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeToday: 0,
    pendingBio: 0,
    systemHealth: '100%'
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Live Audit Logs Listener
    const logsQuery = query(
      collection(db, 'auditLogs'), 
      orderBy('timestamp', 'desc'), 
      limit(6)
    );

    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentLogs(logs);
    });

    // 2. Real-time Aggregates Listener
    const usersQuery = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const allUsers = snapshot.docs.map(doc => doc.data());
      
      const total = allUsers.length;
      const noBio = allUsers.filter(u => !u.isBiometricRegistered).length;
      
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      const active = allUsers.filter(u => u.lastActive?.toMillis() > twentyFourHoursAgo).length;

      setStats(prev => ({
        ...prev,
        totalStudents: total,
        pendingBio: noBio,
        activeToday: active
      }));
      setLoading(false);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeUsers();
    };
  }, []);

  const systemStats = [
    { id: 'total-students', label: 'Total Registry', value: stats.totalStudents, icon: Users, color: 'text-blue-500', trend: 'Live' },
    { id: 'active-sessions', label: 'Active (24h)', value: stats.activeToday, icon: Activity, color: 'text-emerald-500', trend: 'Syncing' },
    { id: 'pending-bio', label: 'Incomplete Bio', value: stats.pendingBio, icon: Fingerprint, color: 'text-amber-500', trend: stats.pendingBio > 10 ? 'High' : 'Stable' },
    { id: 'system-health', label: 'Node Status', value: stats.systemHealth, icon: Server, color: 'text-purple-500', trend: 'Optimal' },
  ];

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#020617]">
        <RefreshCcw className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <MotionDiv 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-7xl mx-auto space-y-8 pb-10 px-4"
    >
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              VANTAGE <span className="text-blue-600">CORE</span>
            </h1>
            <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] font-black uppercase rounded animate-pulse">
              Live Feed
            </span>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            Root Access • Super Administrator Authorization Required
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            <Database size={14} /> Global Snapshot
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/40">
            <UserPlus size={14} /> Admin Provisioning
          </button>
        </div>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, idx) => (
          <MotionDiv 
            key={stat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-md relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-[#020617] border border-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                stat.trend === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
            <h2 className="text-4xl font-black text-white mt-1 tracking-tight">{stat.value}</h2>
            <div className="absolute -right-4 -bottom-4 text-white/[0.02] group-hover:text-white/[0.05] transition-colors">
              <stat.icon size={100} />
            </div>
          </MotionDiv>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LIVE AUDIT LOGS */}
        <section className="lg:col-span-2 bg-[#0f172a]/50 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
              <ShieldAlert size={18} className="text-red-500" /> Security Event Stream
            </h3>
            <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
              Full Ledger
            </button>
          </div>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {recentLogs.map((log) => (
                <MotionDiv 
                  key={log.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-2xl hover:border-blue-500/40 hover:bg-slate-900/80 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      {log.actionType?.includes('AWARD') ? <Zap size={18} /> : <TrendingUp size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">
                        {log.actionType || 'System Action'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">
                        {log.performedBy} <span className="text-slate-700 mx-1">•</span> 
                        <span className="text-blue-500/80">{log.reason || 'Routine Maintenance'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white font-black uppercase tracking-tighter">
                      {log.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[8px] text-slate-600 font-bold uppercase italic">
                      {log.category || 'General'}
                    </p>
                  </div>
                </MotionDiv>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* SIDEBAR ACTIONS */}
        <div className="space-y-8">
          <section className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Zap size={14} fill="currentColor" /> Rapid Deployment
              </h3>
              <p className="text-blue-100 text-xs mb-6 leading-relaxed font-medium">
                Execute a global system announcement or force biometrics hardware recalibration.
              </p>
              <div className="space-y-3">
                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-xl">
                  Push Global Notification
                </button>
                <button className="w-full py-3 bg-blue-900/30 border border-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900/50 transition-all">
                  Emergency Node Sync
                </button>
              </div>
            </div>
            <Activity className="absolute -top-4 -right-4 w-32 h-32 text-white/5 group-hover:text-white/10 transition-all" />
          </section>

          {/* SYSTEM SETTINGS CARD */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Settings size={18} className="text-slate-400" /> Infrastructure
            </h3>
            <div className="space-y-1">
              {[
                { id: 'iam', label: 'Identity & Access', icon: ShieldAlert },
                { id: 'cloud', label: 'Cloud Configuration', icon: Server },
                { id: 'security', label: 'Security Protocols', icon: Database },
              ].map((item) => (
                <button key={item.id} className="w-full flex items-center justify-between p-4 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-3"><item.icon size={14}/> {item.label}</span>
                  <ArrowUpRight size={14} />
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-white/5">
                <button className="w-full flex items-center justify-between p-4 text-red-500/80 hover:text-red-400 hover:bg-red-500/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-3"><AlertTriangle size={14}/> Maintenance Mode</span>
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-ping" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MotionDiv>
  );
};

export default SuperAdminDashboard;