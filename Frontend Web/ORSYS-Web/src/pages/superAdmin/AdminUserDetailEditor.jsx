import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types'; // Added for prop validation
import { db } from '../../api/firebaseConfig';
import { doc, collection, onSnapshot, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { 
  User, Layers, Shield, Fingerprint, Save, 
  ChevronLeft, AlertCircle, CheckCircle2, Loader2,
  IdCard, Activity, Database
} from 'lucide-react';

const AdminUserDetailEditor = ({ userId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [allGroups, setAllGroups] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) setUserData({ id: docSnap.id, ...docSnap.data() });
      setLoading(false);
    });

    const fetchGroups = async () => {
      const gSnap = await getDocs(collection(db, 'groups'));
      setAllGroups(gSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };

    const mQuery = query(collection(db, 'memberships'), where('userId', '==', userId));
    const unsubscribeMemberships = onSnapshot(mQuery, (mSnap) => {
      setMemberships(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    fetchGroups();
    return () => {
      unsubscribeUser();
      unsubscribeMemberships();
    };
  }, [userId]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, userData);
      setStatus({ type: 'success', msg: 'Personnel records updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
          <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Registry</span>
        </button>
        {status.msg && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${
            status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {status.msg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center backdrop-blur-xl">
            <div className="relative inline-block">
              <div className="h-32 w-32 rounded-[2.5rem] bg-slate-900 border-2 border-blue-500/30 overflow-hidden mx-auto">
                <img 
                  src={userData?.profilePictureUrl || userData?.photoURL || 'https://via.placeholder.com/150'} 
                  className="w-full h-full object-cover" 
                  alt="Profile"
                />
              </div>
              <div className={`absolute -bottom-2 -right-2 p-2 rounded-xl border-2 border-[#020617] ${userData?.isBiometricRegistered ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                <Fingerprint size={16} className="text-white" />
              </div>
            </div>
            <h2 className="mt-6 text-2xl font-black text-white uppercase tracking-tighter">
              {userData?.lastName}, {userData?.firstName}
            </h2>
            <p className="text-blue-400 text-xs font-mono font-bold">{userData?.studentId || 'NO STUDENT ID'}</p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Global Rank</p>
                <p className="text-sm font-bold text-amber-400 uppercase">{userData?.rank || 'Novice'}</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Total XP</p>
                <p className="text-sm font-bold text-white uppercase">{userData?.aclcXp?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Layers size={14} /> Active Memberships
            </h3>
            <div className="space-y-3">
              {memberships.map((m) => {
                const group = allGroups.find(g => g.id === m.groupId);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase">{group?.groupAcronym || 'Unknown'}</p>
                      <p className="text-[9px] text-slate-400 font-bold">{m.displayTitle}</p>
                    </div>
                    <span className="text-[8px] px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-black uppercase">{m.membershipRole}</span>
                  </div>
                );
              })}
              {memberships.length === 0 && <p className="text-[10px] text-slate-600 text-center py-4 italic">No memberships found.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdateUser} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
              <Database className="text-blue-500" size={24} />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Personnel Data Modification</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-[10px] font-black text-slate-500 uppercase ml-2">First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    id="firstName"
                    type="text" 
                    value={userData?.firstName || ''} 
                    onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-[10px] font-black text-slate-500 uppercase ml-2">Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    id="lastName"
                    type="text" 
                    value={userData?.lastName || ''} 
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="course" className="text-[10px] font-black text-slate-500 uppercase ml-2">Course / Program</label>
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    id="course"
                    type="text" 
                    value={userData?.course || ''} 
                    onChange={(e) => setUserData({...userData, course: e.target.value})}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="yearLevel" className="text-[10px] font-black text-slate-500 uppercase ml-2">Year Level</label>
                <select 
                  id="yearLevel"
                  value={userData?.yearLevel || ''} 
                  onChange={(e) => setUserData({...userData, yearLevel: e.target.value})}
                  className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="xpOverride" className="text-[10px] font-black text-slate-500 uppercase ml-2 text-amber-500">Administrative XP Override</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600/50" size={16} />
                  <input 
                    id="xpOverride"
                    type="number" 
                    value={userData?.aclcXp || 0} 
                    onChange={(e) => setUserData({...userData, aclcXp: Number.parseInt(e.target.value, 10)})}
                    className="w-full bg-amber-500/5 border border-amber-500/20 rounded-xl py-3 pl-12 pr-4 text-amber-400 text-sm focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="rank" className="text-[10px] font-black text-slate-500 uppercase ml-2">Assigned Rank</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    id="rank"
                    type="text" 
                    value={userData?.rank || ''} 
                    onChange={(e) => setUserData({...userData, rank: e.target.value})}
                    className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button 
                type="submit" 
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Commit Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Fixed S6774: Proper prop validation
AdminUserDetailEditor.propTypes = {
  userId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default AdminUserDetailEditor;