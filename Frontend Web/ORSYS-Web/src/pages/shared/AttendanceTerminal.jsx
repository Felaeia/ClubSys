import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import PropTypes from 'prop-types';
import { rtdb, firestore } from '../../api/firebaseConfig';
import { ref, onValue } from "firebase/database";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion'; 
import { 
  Fingerprint, UserCheck, Clock, ShieldCheck, 
  GraduationCap, Activity, LayoutGrid, Hash, ArrowLeft 
} from 'lucide-react';

const MotionDiv = motion.div;

const AttendanceTerminal = () => {
  const navigate = useNavigate(); // Hook for the back button
  const [scannedUser, setScannedUser] = useState(null);
  const [status, setStatus] = useState("Ready to Scan");
  const [lastId, setLastId] = useState(0);

  const handleMatch = async (id) => {
    setStatus("Processing...");
    try {
      const q = query(collection(firestore, "users"), where("biometricId", "==", id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size > 0) {
        const userData = querySnapshot.docs[0].data();
        setScannedUser(userData);
        setStatus("Identity Verified");

        await addDoc(collection(firestore, "attendance_logs"), {
          userId: querySnapshot.docs[0].id,
          studentName: `${userData.firstName} ${userData.lastName}`,
          timestamp: serverTimestamp(),
          method: "Biometric"
        });

        setTimeout(() => {
          setScannedUser(null);
          setStatus("Ready to Scan");
          setLastId(0);
        }, 5000);
      } else {
        setStatus("User Not Found");
        setTimeout(() => setStatus("Ready to Scan"), 3000);
      }
    } catch (error) {
      console.error("Lookup Error:", error);
      setStatus("System Error");
    }
  };

  useEffect(() => {
    const statusRef = ref(rtdb, 'system_status/lastMatchId');
    const unsubscribe = onValue(statusRef, (snapshot) => {
      const matchId = snapshot.val();
      const isNewMatch = matchId > 0 && matchId !== lastId;
      if (isNewMatch) {
        setLastId(matchId);
        handleMatch(matchId);
      }
    });
    return () => unsubscribe();
  }, [lastId]);

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      // Removed max-w-7xl and min-h-screen to let the Sidebar Layout control the space
      className="w-full space-y-8 pb-10"
    >
      {/* HEADER SECTION WITH BACK BUTTON */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} // Goes back to Hardware Hub
            className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <LayoutGrid className="text-blue-500" size={32} /> ORSYS <span className="text-blue-600">Terminal</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Live Profile Verification • Biometric Authentication
            </p>
          </div>
        </div>

        <div className="px-6 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 h-fit">
          <Activity size={14} className="animate-pulse" />
          Terminal System Active
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN DISPLAY AREA: USER PROFILE VIEW */}
        <section className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {scannedUser ? (
              <MotionDiv
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative"
              >
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                  <div className="relative">
                    {scannedUser.profilePictureUrl ? (
                      <img 
                        src={scannedUser.profilePictureUrl} 
                        alt="Profile" 
                        className="w-40 h-40 rounded-[2rem] object-cover border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20"
                      />
                    ) : (
                      <div className="w-40 h-40 bg-slate-800 rounded-[2rem] flex items-center justify-center text-5xl font-black text-blue-500 border border-white/10">
                        {scannedUser.firstName?.[0]}{scannedUser.lastName?.[0]}
                      </div>
                    )}
                    <div className="absolute -bottom-3 -right-3 bg-emerald-500 p-2 rounded-xl shadow-lg">
                      <ShieldCheck size={20} className="text-slate-950" />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em]">Verified Identity</span>
                      <h2 className="text-5xl font-black text-white uppercase tracking-tighter mt-1 leading-none">
                        {scannedUser.firstName}<br />
                        <span className="text-blue-600">{scannedUser.lastName}</span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                      <InfoCard icon={<GraduationCap size={16}/>} label="Academic Course" value={scannedUser.course} subValue={scannedUser.yearLevel} />
                      <InfoCard icon={<Hash size={16}/>} label="Student ID" value={scannedUser.studentId} />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <Clock className="text-emerald-500" size={20} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Check-In Timestamp</p>
                      <p className="text-white font-bold">{new Date().toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="px-8 py-3 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-500/20">
                    Attendance Logged Successfully
                  </div>
                </div>
              </MotionDiv>
            ) : (
              <MotionDiv
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
              >
                <div className="w-32 h-32 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center mb-8 relative">
                   <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                   <Fingerprint size={64} className="text-blue-500 opacity-50" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Awaiting Biometric Data</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Scan finger to view profile details</p>
              </MotionDiv>
            )}
          </AnimatePresence>
        </section>

        {/* SIDEBAR STATUS */}
        <aside className="space-y-6">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden text-center shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50" />
            <div className={`mb-6 mx-auto w-20 h-20 rounded-3xl flex items-center justify-center border-2 transition-all duration-700 bg-white/5 ${status === 'Identity Verified' ? 'border-emerald-500 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]'}`}>
              <UserCheck size={32} />
            </div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1">Current Status</p>
            <h4 className="text-white font-black text-xl uppercase tracking-tighter">{status}</h4>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6">
            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Device Telemetry</h5>
            <div className="space-y-4">
              <TelemetryRow label="Scanner Node" value="ESP32-WROOM" status="Active" />
              <TelemetryRow label="Firebase Sync" value="Realtime" status="Active" />
              <TelemetryRow label="Encryption" value="AES-256" status="Secure" />
            </div>
          </div>
        </aside>
      </div>
    </MotionDiv>
  );
};

// HELPER COMPONENTS (Keep these at bottom)
const InfoCard = ({ icon, label, value, subValue }) => (
  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
    <div className="flex items-center gap-2 mb-1">
      <span className="text-blue-500">{icon}</span>
      <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <p className="text-white font-bold text-sm uppercase">{value || "---"}</p>
    {subValue && <p className="text-blue-400 text-[10px] font-black uppercase tracking-tighter italic">{subValue}</p>}
  </div>
);

InfoCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  subValue: PropTypes.string
};

const TelemetryRow = ({ label, value, status }) => (
  <div className="flex justify-between items-center">
    <div>
      <p className="text-white text-[10px] font-bold">{label}</p>
      <p className="text-slate-500 text-[9px] uppercase">{value}</p>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span className="text-emerald-500 text-[9px] font-black uppercase tracking-widest">{status}</span>
    </div>
  </div>
);

TelemetryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired
};

export default AttendanceTerminal;