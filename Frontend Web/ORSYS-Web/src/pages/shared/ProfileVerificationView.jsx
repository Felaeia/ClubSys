import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { rtdb, firestore } from '../../api/firebaseConfig';
import { ref, onValue } from "firebase/database";
// Added addDoc and serverTimestamp
import { 
  collection, query, where, onSnapshot, doc, 
  getDoc, getDocs, addDoc, serverTimestamp 
} from "firebase/firestore";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ShieldCheck, BadgeCheck, 
  MapPin, GraduationCap, Mail, IdCard, Award, Users, Trophy
} from 'lucide-react';

const ProfileVerificationView = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lastId, setLastId] = useState(0);
  const [affiliations, setAffiliations] = useState([]);

  // NEW: Helper to save logs to Firestore
  const saveLogToFirestore = useCallback(async (type, details) => {
    try {
      await addDoc(collection(firestore, "logs"), {
        type: type, // e.g., "SCAN_SUCCESS", "SCAN_NOT_FOUND"
        biometricId: details.biometricId,
        userName: details.userName || "Unknown",
        userId: details.userId || null,
        timestamp: serverTimestamp(),
        device: "Web Terminal"
      });
      console.log(`📡 Log persisted to Firestore: ${type}`);
    } catch (error) {
      console.error("❌ Failed to save log to Firestore:", error);
    }
  }, []);

  const getGroupName = useCallback(async (groupId) => {
    try {
      const groupDoc = await getDoc(doc(firestore, "groups", groupId));
      return groupDoc.exists() ? groupDoc.data().groupName : "Unknown Organization";
    } catch (error) {
      console.error("❌ Error fetching group name:", error);
      return "Unknown Organization";
    }
  }, []);

  const fetchAffiliations = useCallback((userId) => {
    const membershipsRef = collection(firestore, "memberships");
    const q = query(membershipsRef, where("userId", "==", userId), where("status", "==", "accepted"));

    return onSnapshot(q, async (snapshot) => {
      const membershipData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const enriched = await Promise.all(
        membershipData.map(async (member) => ({
          ...member,
          groupName: await getGroupName(member.groupId)
        }))
      );
      setAffiliations(enriched);
    });
  }, [getGroupName]);

  const fetchUserProfile = useCallback(async (biometricId) => {
    try {
      const q = query(collection(firestore, "users"), where("biometricId", "==", biometricId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.size > 0) {
        const userData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
        
        // Log Success
        saveLogToFirestore("SCAN_SUCCESS", {
          biometricId,
          userId: userData.id,
          userName: `${userData.firstName} ${userData.lastName}`
        });

        setUser(userData);
        return userData.id;
      }
      
      // Log Not Found
      saveLogToFirestore("SCAN_NOT_FOUND", { biometricId });
      
      setUser(null);
      setAffiliations([]);
      return null;
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
      return null;
    }
  }, [saveLogToFirestore]);

  useEffect(() => {
    const statusRef = ref(rtdb, 'system_status/lastMatchId');
    let unsubscribeAffiliations = null;

    const unsubscribeRTDB = onValue(statusRef, async (snapshot) => {
      const matchId = snapshot.val();
      
      if (matchId > 0 && matchId !== lastId) {
        console.log(`🧬 New Scan Detected! Match ID: ${matchId}`);
        setLastId(matchId);
        
        const userId = await fetchUserProfile(matchId);
        if (userId) {
          if (unsubscribeAffiliations) unsubscribeAffiliations();
          unsubscribeAffiliations = fetchAffiliations(userId);
        }
      }
    });

    return () => {
      unsubscribeRTDB();
      if (unsubscribeAffiliations) unsubscribeAffiliations();
    };
  }, [lastId, fetchUserProfile, fetchAffiliations]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={18} /> Back to Hub
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${user ? 'bg-emerald-500' : 'bg-blue-500'}`} />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {user ? 'Profile Active' : 'System Ready'}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {user ? (
          <motion.div key="profile-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            <div className="relative overflow-hidden bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl p-8 md:p-12">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
                <div className="relative group shrink-0">
                  <div className="w-64 h-64 md:w-80 md:h-80 rounded-[3rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-slate-800">
                    <img src={user.profilePictureUrl || "/default-avatar.png"} className="w-full h-full object-cover" alt="User Profile" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-tighter flex items-center gap-2 shadow-xl">
                    <BadgeCheck size={16} /> Verified Student
                  </div>
                </div>
                <div className="flex-1 space-y-8 w-full min-w-0">
                  <div className="text-center lg:text-left">
                    <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight mb-2">
                      {user.firstName}<br /><span className="text-blue-600">{user.lastName}</span>
                    </h2>
                    <p className="text-slate-500 font-mono text-sm">ID: {user.studentId}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileDetail icon={<GraduationCap size={20} />} label="Department" value={user.course || user.department} />
                    <ProfileDetail icon={<IdCard size={20} />} label="Year Level" value={`${user.yearLevel} `} />
                    <ProfileDetail icon={<Mail size={20} />} label="Email Address" value={user.email} isEmail />
                    <ProfileDetail icon={<MapPin size={20} />} label="Campus Branch" value="Mandaue City" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-[3rem] p-8 space-y-6">
              <h3 className="text-white font-black text-xl uppercase tracking-widest flex items-center gap-3">
                <Users className="text-blue-500" /> Active Affiliations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {affiliations.length > 0 ? (
                  affiliations.map((item) => (
                    <div key={item.id} className="bg-slate-950/50 border border-white/5 p-6 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Award size={24} />
                        </div>
                        <div>
                          <p className="text-blue-500 text-[9px] font-black uppercase tracking-widest">{item.displayTitle || "Member"}</p>
                          <h4 className="text-white font-bold text-base uppercase">{item.groupName}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-500 text-[9px] font-black uppercase mb-1">Points</p>
                        <div className="flex items-center justify-end gap-2 text-emerald-500 font-black text-xl">
                          <Trophy size={16} /> {item.totalPointsGained || 0}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 text-xs uppercase tracking-widest col-span-2 text-center py-10">No affiliations found</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <div className="p-8 bg-slate-900 rounded-full border border-white/10 mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
              <ShieldCheck size={64} className="text-blue-500/50" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Waiting for Scan</h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileDetail = ({ icon, label, value, isEmail }) => (
  <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 group hover:bg-white/10 transition-all min-w-0">
    <div className="p-3 bg-slate-950 rounded-2xl text-blue-500 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
      <p className={`text-white font-bold text-lg leading-tight ${isEmail ? 'lowercase break-all' : ''}`}>
        {value || 'N/A'}
      </p>
    </div>
  </div>
);

ProfileDetail.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isEmail: PropTypes.bool
};

export default ProfileVerificationView;