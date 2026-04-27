import React, { useState, useEffect } from 'react';
import { db } from '../../api/firebaseConfig';
import { 
  collection, query, onSnapshot, where, getDocs, 
  writeBatch, doc, increment, serverTimestamp 
} from 'firebase/firestore'; 
import { 
  Search, ShieldCheck, UserCircle, Loader2, 
  Settings2, Fingerprint, Activity,
  FileText, Star, X, Coins
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminUserDetailEditor from './AdminUserDetailEditor';
import { useAuth } from '../../hooks/useAuth'; 

const MasterUserList = () => {
  // Pulling profile (Firestore data) and user (Auth data) from your hook
  const { profile: currentProfile, user: firebaseUser } = useAuth(); 
  
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Unified Award States
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardTarget, setAwardTarget] = useState('bulk'); 
  const [targetUser, setTargetUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Award Values
  const [giveXP, setGiveXP] = useState(true);
  const [giveCurrency, setGiveCurrency] = useState(false);
  const [xpAmount, setXpAmount] = useState(5);
  const [currencyAmount, setCurrencyAmount] = useState(5);
  const [awardReason, setAwardReason] = useState('');

  // Filter States
  const [filterYear, setFilterYear] = useState('All');
  const [filterTitle, setFilterTitle] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterGroup, setFilterGroup] = useState('All');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      try {
        const [mSnap, gSnap] = await Promise.all([
          getDocs(query(collection(db, 'memberships'), where('status', '==', 'accepted'))),
          getDocs(collection(db, 'groups'))
        ]);
        
        const groupLookup = {};
        gSnap.forEach(doc => { 
          const data = doc.data();
          groupLookup[doc.id] = {
            groupId: doc.id,
            acronym: data.groupAcronym,
            currency: data.currencyName || "ByteCoins"
          }; 
        });

        const membershipMap = {};
        mSnap.forEach(doc => {
          const data = doc.data();
          const gInfo = groupLookup[data.groupId] || {};
          
          if (!membershipMap[data.userId]) {
            membershipMap[data.userId] = [];
          }

          membershipMap[data.userId].push({
            groupId: data.groupId,
            groupAcronym: gInfo.acronym || "N/A",
            currencyName: gInfo.currency || "ByteCoins",
            title: data.displayTitle || "Member",
            role: data.membershipRole || "user"
          });
        });

        const mergedUsers = userList.map(user => {
          const memberships = membershipMap[user.id] || [];
          const primary = memberships[0] || {}; 
          
          return {
            ...user,
            allMemberships: memberships, 
            photoURL: user.profilePictureUrl || user.photoURL || null, 
            groupAcronym: primary.groupAcronym || "", 
            displayTitle: primary.title || "",
            userRole: primary.role || "",
            course: user.course || "N/A",
            yearLevel: user.yearLevel || "", 
            rank: user.rank || "Novice",
            aclcXp: user.aclcXp ? Number.parseInt(user.aclcXp, 10) : 0,
            isBiometricRegistered: user.isBiometricRegistered || false
          };
        }).sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));

        setUsers(mergedUsers);
      } catch (err) {
        console.error("Registry Sync Error:", err);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const uniqueGroups = ['All', ...new Set(users.flatMap(u => u.allMemberships.map(m => m.groupAcronym)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  const filteredUsers = users.filter(user => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = (
      user.firstName?.toLowerCase().includes(searchLow) ||
      user.lastName?.toLowerCase().includes(searchLow) ||
      user.studentId?.toLowerCase().includes(searchLow)
    );
    
    const filterDigit = filterYear === 'All' ? '' : (/\d+/.exec(filterYear)?.[0] || '');
    const matchesYear = filterYear === 'All' || user?.yearLevel?.toString().includes(filterDigit);
    
    const matchesGroup = filterGroup === 'All' || user.allMemberships?.some(m => m.groupAcronym === filterGroup);
    const matchesTitle = filterTitle === 'All' || user.allMemberships?.some(m => m.title.toLowerCase() === filterTitle.toLowerCase());
    const matchesRole = filterRole === 'All' || user.allMemberships?.some(m => m.role.toLowerCase() === filterRole.toLowerCase());

    return matchesSearch && matchesYear && matchesTitle && matchesRole && matchesGroup;
  });

  const handleProcessAward = async () => {
    // 1. DYNAMIC AUTH GUARD
    if (!firebaseUser?.uid || !currentProfile) {
      alert("Unauthorized Access: System could not verify your administrative profile.");
      return;
    }

    if (!awardReason || awardReason.trim().length < 5) {
      alert("Please provide a descriptive reason (at least 5 characters).");
      return;
    }

    setIsProcessing(true);
    const batch = writeBatch(db);
    const targets = awardTarget === 'single' ? [targetUser] : filteredUsers;
    const timestamp = serverTimestamp();
    const auditLogRef = doc(collection(db, 'auditLogs'));
    
    // 2. RESOLVE ADMIN IDENTITY FROM FIRESTORE PROFILE
    const adminDetails = {
      uid: firebaseUser.uid,
      name: `${currentProfile.firstName} ${currentProfile.lastName}`.trim(),
      role: currentProfile.userRole === 'superAdmin' 
            ? 'Super Admin' 
            : (currentProfile.displayTitle || 'Authorized Officer')
    };

    targets.forEach((user) => {
      const userRef = doc(db, 'users', user.id);
      const notifRef = doc(collection(db, 'notifications'));
      const updatePayload = {};
      const msgParts = [];

      if (giveXP) {
        updatePayload.aclcXp = increment(Number(xpAmount));
        msgParts.push(`+${xpAmount} XP`);
      }

      if (giveCurrency && user?.allMemberships?.length > 0) {
        const targetMembership = filterGroup === 'All' 
          ? user.allMemberships[0]
          : user.allMemberships.find(m => m.groupAcronym === filterGroup);

        if (targetMembership) {
          updatePayload[`balances.${targetMembership.groupId}`] = increment(Number(currencyAmount));
          msgParts.push(`+${currencyAmount} ${targetMembership.currencyName}`);
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        batch.update(userRef, updatePayload);
        batch.set(notifRef, {
          userId: user.id,
          message: `${msgParts.join(' & ')} awarded by ${adminDetails.name} (${adminDetails.role}) - ${awardReason}`,
          type: 'reward',
          read: false,
          createdAt: timestamp,
          issuedBy: adminDetails.uid,
          issuedByName: adminDetails.name,
          issuedByRole: adminDetails.role
        });
      }
    });

    // 3. AUDIT LOGGING
    batch.set(auditLogRef, {
      actionType: awardTarget === 'bulk' ? 'BULK_AWARD' : 'SINGLE_AWARD',
      category: 'REWARD_SYSTEM',
      performedBy: adminDetails.name,
      performedByRole: adminDetails.role, 
      performedByUid: adminDetails.uid,
      reason: awardReason.trim(),
      targetsAffected: targets.length,
      xpValue: giveXP ? Number(xpAmount) : 0,
      currencyValue: giveCurrency ? Number(currencyAmount) : 0,
      timestamp: timestamp,
      filterContext: {
        group: filterGroup,
        year: filterYear
      }
    });

    try {
      await batch.commit();
      setShowAwardModal(false);
      setAwardReason('');
      alert(`Success! Transaction verified by ${adminDetails.name}.`);
    } catch (err) {
      console.error("Firebase Transaction Failure:", err);
      alert(err.code === 'permission-denied' ? "Action Denied: Insufficient Privileges." : `Failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTargetCurrencyName = () => {
    if (awardTarget === 'single' && targetUser) {
        return targetUser.allMemberships?.[0]?.currencyName || "ByteCoins";
    }
    if (filterGroup !== 'All') {
        const sampleUser = filteredUsers.find(u => u.allMemberships?.some(m => m.groupAcronym === filterGroup));
        const membership = sampleUser?.allMemberships?.find(m => m.groupAcronym === filterGroup);
        return membership?.currencyName || "ByteCoins";
    }
    return "Primary Org Currency";
  };

  const exportToPDF = () => {
    const docPdf = new jsPDF();
    const tableColumn = ["ID", "Name", "Course/Year", "XP", "Groups"];
    const tableRows = filteredUsers.map(user => [
      user.studentId || "N/A",
      `${user.lastName}, ${user.firstName}`,
      `${user.course} ${user.yearLevel}`,
      user.aclcXp?.toLocaleString(),
      user.allMemberships?.map(m => m.groupAcronym).join(', ') || ''
    ]);
    autoTable(docPdf, { head: [tableColumn], body: tableRows, theme: 'grid', headStyles: { fillColor: [30, 41, 59] } });
    docPdf.save(`ORSYS_Personnel_Registry.pdf`);
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (num) => { 
    setCurrentPage(num); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  if (selectedUserId) return <AdminUserDetailEditor userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;
  
  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">SYNCHRONIZING REGISTRY...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <ShieldCheck className="text-blue-500" size={36} /> Personnel Registry
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{filteredUsers.length} Members</p>
            <button onClick={exportToPDF} className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
              <FileText size={12} /> Export Registry
            </button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or ID..." 
            className="bg-[#020617] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white w-full md:w-[350px] outline-none focus:border-blue-500/50"
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4 ml-4">
            <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center text-[#020617]">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Global Award System</p>
              <p className="text-xs text-amber-200/60 font-bold">
                Targeting {filteredUsers.length} students {filterGroup === 'All' ? '' : `in ${filterGroup}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setAwardTarget('bulk'); setShowAwardModal(true); }} 
            className="px-8 py-3 bg-amber-500 text-[#020617] text-[10px] font-black uppercase rounded-2xl hover:scale-105 transition-all cursor-pointer"
          >
            Award Group
          </button>
        </div>
      )}

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs outline-none" value={filterGroup} onChange={(e) => {setFilterGroup(e.target.value); setCurrentPage(1);}}>
          {uniqueGroups.map(g => <option key={g} value={g}>{g === 'All' ? 'All Groups' : g}</option>)}
        </select>
        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs outline-none" value={filterYear} onChange={(e) => {setFilterYear(e.target.value); setCurrentPage(1);}}>
          <option value="All">All Years</option>
          {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs outline-none" value={filterTitle} onChange={(e) => {setFilterTitle(e.target.value); setCurrentPage(1);}}>
          <option value="All">All Titles</option>
          {['Chairman', 'Leader', 'Member'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs outline-none" value={filterRole} onChange={(e) => {setFilterRole(e.target.value); setCurrentPage(1);}}>
          <option value="All">All Roles</option>
          {['Officer', 'Member'].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Course/Year</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progression</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Affiliation</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] group transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-2xl bg-slate-900 border border-white/10 overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" alt="" /> : <UserCircle className="m-auto mt-3 text-slate-700" size={24} />}
                        <div className={`absolute bottom-0 right-0 p-1 rounded-tl-lg border-t border-l border-white/10 ${user.isBiometricRegistered ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                          <Fingerprint size={8} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase">{user.lastName}, <span className="text-blue-400">{user.firstName}</span></div>
                        <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{user.studentId || "NO ID"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-white font-black text-xs uppercase">{user.course}</div>
                      <div className="text-[9px] text-blue-500 font-bold uppercase">{user.yearLevel}</div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-amber-400 font-black text-xs">{user.aclcXp?.toLocaleString()} XP</div>
                      <div className="text-[8px] text-slate-400 uppercase font-black">{user.rank}</div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex flex-col items-center px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[8px] font-black text-blue-400 uppercase">
                        {user.allMemberships?.length > 1 ? `${user.allMemberships.length} GROUPS` : user.groupAcronym || "NO GROUP"}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">{user.displayTitle}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right space-x-2">
                    <button onClick={() => { setTargetUser(user); setAwardTarget('single'); setShowAwardModal(true); }} className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-black rounded-2xl transition-all cursor-pointer">
                      <Coins size={20} />
                    </button>
                    <button onClick={() => setSelectedUserId(user.id)} className="p-3 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 rounded-2xl transition-all cursor-pointer">
                      <Settings2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-20 text-center text-slate-500 uppercase font-black text-xs tracking-widest">No matching personnel found.</td></tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-6 border-t border-white/10">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => paginate(num)}
                className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${
                  currentPage === num 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 text-slate-500 hover:bg-white/10'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AWARD MODAL */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                {awardTarget === 'bulk' ? 'Bulk Dispatch' : 'Personal Award'}
              </h2>
              <button onClick={() => setShowAwardModal(false)} className="text-slate-500 hover:text-white transition-colors"><X /></button>
            </div>
            
            <div className="space-y-5">
              {/* XP INPUT */}
              <div className={`p-4 rounded-2xl border ${giveXP ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Activity size={16} className="text-blue-400" /><span className="text-[10px] font-black uppercase text-white">Experience Points</span></div>
                  <input type="checkbox" checked={giveXP} onChange={(e) => setGiveXP(e.target.checked)} className="w-5 h-5 accent-blue-500" />
                </div>
                <input type="number" disabled={!giveXP} value={xpAmount} onChange={(e) => setXpAmount(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-white font-bold disabled:opacity-20 outline-none" />
              </div>

              {/* CURRENCY INPUT */}
              <div className={`p-4 rounded-2xl border ${giveCurrency ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-white/10'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Coins size={16} className="text-emerald-400" /><span className="text-[10px] font-black uppercase text-white">{getTargetCurrencyName()}</span></div>
                  <input type="checkbox" checked={giveCurrency} onChange={(e) => setGiveCurrency(e.target.checked)} className="w-5 h-5 accent-emerald-500" />
                </div>
                <input type="number" disabled={!giveCurrency} value={currencyAmount} onChange={(e) => setCurrencyAmount(e.target.value)} className="w-full bg-[#020617] border border-white/10 rounded-xl p-3 text-white font-bold disabled:opacity-20 outline-none" />
                {giveCurrency && (
                  <p className="mt-2 text-[8px] text-emerald-400/60 font-black uppercase tracking-widest">
                    Target: {filterGroup === 'All' ? 'Primary Organization' : filterGroup} Balance
                  </p>
                )}
              </div>

              {/* REASON */}
              <div>
                <label htmlFor="award-reason" className="text-[10px] font-black text-slate-500 uppercase block mb-2">Reasoning</label>
                <textarea id="award-reason" placeholder="e.g. Active Participation in Pathfit..." value={awardReason} onChange={(e) => setAwardReason(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm h-24 outline-none resize-none focus:border-blue-500/50" />
              </div>

              <button onClick={handleProcessAward} disabled={isProcessing} className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all">
                {isProcessing ? <Loader2 className="animate-spin" /> : "Confirm Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterUserList;