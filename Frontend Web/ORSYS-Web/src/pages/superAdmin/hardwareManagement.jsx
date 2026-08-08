import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Cpu, Fingerprint, Activity, UserPlus, Search, 
  RefreshCcw, Users, Layers, ChevronRight, Hash, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../../api/firebaseConfig';
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useHardwareSync } from '../../hooks/useHardwareSync';

const MotionDiv = motion.div;

const HardwareManagement = () => {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("pending"); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { 
    sensorStatus, isOnline, isSyncing, 
    targetStudent, startEnrollment 
  } = useHardwareSync();

  // Ref to track previous online status to prevent duplicate connection logs on re-renders
  const prevOnlineRef = useRef(isOnline);

  // --- AUDIT LOGGING FUNCTION (Memoized) ---
  const logSystemEvent = useCallback(async (action, details = {}) => {
    try {
      await addDoc(collection(firestore, "system_logs"), {
        module: "HARDWARE_HUB",
        action: action,
        details: details,
        performedBy: "Super Admin", 
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Failed to write audit log:", err);
    }
  }, []);

  // --- DATA SUBSCRIPTION ---
  useEffect(() => {
    const usersRef = collection(firestore, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // --- AUTOMATIC HARDWARE AUDIT (Enrollment Results) ---
  useEffect(() => {
    const studentName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : "Unknown";
    
    if (sensorStatus === 'Success!' || sensorStatus === 'Sync Complete') {
      logSystemEvent("BIOMETRIC_ENROLL_SUCCESS", {
        studentId: targetStudent?.studentId,
        studentName: studentName,
        status: sensorStatus
      });
    } else if (sensorStatus.toLowerCase().includes("error")) {
      logSystemEvent("BIOMETRIC_ENROLL_ERROR", {
        message: sensorStatus,
        target: targetStudent?.studentId || "unknown"
      });
    }
  }, [sensorStatus, targetStudent, logSystemEvent]);

  // --- HARDWARE CONNECTIVITY LOG ---
  useEffect(() => {
    if (isOnline !== prevOnlineRef.current) {
      if (isOnline) {
        logSystemEvent("HARDWARE_CONNECTED", { 
          device: "ESP32_NODE_01",
          info: "Handshake established with ESP32" 
        });
      } else {
        logSystemEvent("HARDWARE_DISCONNECTED", { 
          device: "ESP32_NODE_01",
          info: "Heartbeat lost or device powered off" 
        });
      }
      prevOnlineRef.current = isOnline;
    }
  }, [isOnline, logSystemEvent]);

  // --- STATS LOGIC ---
  const stats = useMemo(() => {
    const total = allUsers.length;
    const registeredCount = allUsers.filter(u => u.isBiometricRegistered).length;
    const pendingCount = total - registeredCount;
    return { total, registeredCount, pendingCount };
  }, [allUsers]);

  // --- PAGINATED FILTER & SORT LOGIC ---
  const { displayList, totalPages } = useMemo(() => {
    const queryStr = searchQuery.toLowerCase();
    const filtered = allUsers.filter(user => {
      const matchesSearch = 
        user?.firstName?.toLowerCase()?.includes(queryStr) ||
        user?.lastName?.toLowerCase()?.includes(queryStr) ||
        user?.studentId?.toLowerCase()?.includes(queryStr);
      const matchesView = viewMode === "pending" ? !user?.isBiometricRegistered : user?.isBiometricRegistered;
      return matchesSearch && matchesView;
    });

    const sorted = [...filtered].sort((a, b) => {
      const lastA = (a.lastName || "").toLowerCase();
      const lastB = (b.lastName || "").toLowerCase();
      const lastCompare = lastA.localeCompare(lastB);
      if (lastCompare !== 0) return lastCompare;
      return (a.firstName || "").toLowerCase().localeCompare((b.firstName || "").toLowerCase());
    });

    return { 
      displayList: sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      totalPages: Math.ceil(sorted.length / itemsPerPage) || 1 
    };
  }, [allUsers, searchQuery, viewMode, currentPage]);

  // --- HANDLERS ---
  const handleEnrollment = (user) => {
    const logAction = user.isBiometricRegistered ? "BIOMETRIC_EDIT_TRIGGERED" : "ENROLLMENT_TRIGGERED";
    
    logSystemEvent(logAction, {
      studentId: user.studentId,
      studentName: `${user.firstName} ${user.lastName}`,
      previousStatus: user.isBiometricRegistered ? "Registered" : "Pending"
    });
    
    startEnrollment(user);
  };

  const handleViewModeChange = (mode) => {
    if (mode !== viewMode) {
      logSystemEvent("VIEW_MODE_CHANGED", { mode: mode });
      setViewMode(mode);
      setCurrentPage(1);
    }
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto space-y-8 pb-10 px-4"
    >
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Cpu className="text-blue-500" size={32} /> Hardware <span className="text-blue-600">Hub</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Super Admin Control Center • CSO Infrastructure
            </p>
          </div>

          <div className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all duration-500 h-fit ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
            <Activity size={14} className={isOnline ? "animate-pulse" : ""} />
            {isOnline ? "ESP32 Node Online" : "Hardware Link Offline"}
          </div>
        </div>

        <button
          onClick={() => {
            logSystemEvent("NAVIGATED_TO_VERIFICATION");
            navigate('/profile-verification');
          }}
          className="group relative flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition-all shadow-lg shadow-emerald-600/20 active:scale-95 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          <div className="flex flex-col items-start relative z-10 text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Identity Check</span>
            <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              Profile Verification <ShieldCheck size={14} />
            </span>
          </div>
        </button>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Students", val: stats.total, color: "text-blue-500", icon: Layers, bg: "bg-blue-500/5" },
          { label: "Registered Biometrics", val: stats.registeredCount, color: "text-emerald-500", icon: Fingerprint, bg: "bg-emerald-500/5" },
          { label: "Pending Enrollment", val: stats.pendingCount, color: "text-orange-500", icon: UserPlus, bg: "bg-orange-500/5" },
        ].map((item) => (
          <div key={item.label} className={`border border-white/10 p-6 rounded-[2rem] flex items-center justify-between transition-transform hover:scale-[1.02] ${item.bg}`}>
            <div>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{item.label}</p>
              <h2 className={`text-4xl font-black mt-1 ${item.color}`}>{item.val}</h2>
            </div>
            <item.icon size={40} className="opacity-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative group flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="FIND BY NAME OR STUDENT ID..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 transition-all"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex bg-slate-900 border border-white/10 p-1.5 rounded-2xl w-full sm:w-auto">
              <button 
                onClick={() => handleViewModeChange("pending")}
                className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${viewMode === "pending" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <UserPlus size={14} /> Pending
              </button>
              <button 
                onClick={() => handleViewModeChange("registered")}
                className={`flex-1 sm:px-8 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 ${viewMode === "registered" ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Users size={14} /> Registered
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              {viewMode === "pending" ? <UserPlus size={20} className="text-blue-500" /> : <Users size={20} className="text-purple-500" />}
              {viewMode === "pending" ? "Awaiting Enrollment" : "Registered Database"}
            </h3>

            <div className="space-y-3 min-h-[400px]">
              <AnimatePresence mode="wait">
                {displayList.length > 0 ? (
                  <MotionDiv
                    key={`${viewMode}-${currentPage}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-3"
                  >
                    {displayList.map((user) => (
                      <UserRow 
                        key={user.id} 
                        user={user} 
                        actionLabel={viewMode === "pending" ? "Begin Scan" : "Update"} 
                        onAction={handleEnrollment} 
                        isOnline={isOnline} 
                        isSyncing={isSyncing} 
                        targetId={targetStudent?.id}
                        icon={viewMode === "registered" ? <RefreshCcw size={12}/> : <ChevronRight size={12}/>}
                      />
                    ))}
                  </MotionDiv>
                ) : (
                  <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                    <Search size={24} className="text-slate-700 mb-4" />
                    <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No matching records found</p>
                  </MotionDiv>
                )}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-6 pt-6 border-t border-white/5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-20 hover:text-white transition-colors"
                >
                  <ChevronRight className="rotate-180" size={18} />
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Page <span className="text-blue-500">{currentPage}</span> of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-20 hover:text-white transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>

        <aside className="h-fit lg:sticky lg:top-8">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50" />
            <div className={`mb-8 mx-auto w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-700 bg-white/5 ${sensorStatus === 'Success!' || sensorStatus === 'Sync Complete' ? 'border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-blue-500 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'}`}>
              <Fingerprint size={48} className={isSyncing ? "animate-pulse" : ""} />
            </div>
            
            <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">{sensorStatus}</h4>
            <div className="h-[40px] flex flex-col justify-center">
                {isSyncing && targetStudent ? (
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
                    Targeting: {targetStudent.firstName}
                  </p>
                ) : (
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">System Idle</p>
                )}
            </div>
          </div>
        </aside>
      </div>
    </MotionDiv>
  );
};

const UserRow = ({ user, actionLabel, onAction, isOnline, isSyncing, targetId, icon }) => (
  <MotionDiv layout className="flex items-center justify-between p-5 bg-slate-900/60 rounded-3xl border border-white/5 hover:border-blue-500/40 transition-all group">
    <div className="flex items-center gap-5">
      {/* STUDENT AVATAR / PROFILE PICTURE */}
      <div className="w-12 h-12 rounded-2xl bg-slate-800 overflow-hidden flex items-center justify-center border border-white/10 shrink-0 shadow-inner">
        {user?.profilePictureUrl ? (
          <img 
            src={user.profilePictureUrl} 
            alt={`${user.firstName} ${user.lastName}`} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
          />
        ) : (
          <span className="text-blue-500 font-black text-xs">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        )}
      </div>

      <div>
        <p className="text-white font-bold text-sm tracking-tight">{user?.firstName} {user?.lastName}</p>
        <div className="flex items-center gap-2">
          <Hash size={10} className="text-blue-500" />
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user?.studentId || "NO-ID"}</p>
        </div>
      </div>
    </div>
    <button 
      onClick={() => onAction(user)}
      className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${isOnline && !isSyncing ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/10' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
      disabled={!isOnline || isSyncing}
    >
      {isSyncing && targetId === user?.id ? <RefreshCcw size={12} className="animate-spin" /> : icon}
      {isSyncing && targetId === user?.id ? "Syncing..." : actionLabel}
    </button>
  </MotionDiv>
);

UserRow.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    studentId: PropTypes.string,
    profilePictureUrl: PropTypes.string,
    isBiometricRegistered: PropTypes.bool
  }).isRequired,
  actionLabel: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  isOnline: PropTypes.bool.isRequired,
  isSyncing: PropTypes.bool.isRequired,
  targetId: PropTypes.string,
  icon: PropTypes.node
};

export default HardwareManagement;