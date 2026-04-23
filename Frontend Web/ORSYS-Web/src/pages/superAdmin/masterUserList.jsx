import React, { useState, useEffect } from 'react';
import { db } from '../../api/firebaseConfig';
import { collection, query, onSnapshot, where, getDocs } from 'firebase/firestore'; 
import { 
  Search, ShieldCheck, UserCircle, Loader2, 
  Settings2, Fingerprint, Activity, GraduationCap, Layers,
  ChevronLeft, ChevronRight, FileText 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminUserDetailEditor from './AdminUserDetailEditor';

const MasterUserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [filterYear, setFilterYear] = useState('All');
  const [filterTitle, setFilterTitle] = useState('All');
  const [filterRole, setFilterRole] = useState('All');
  const [filterGroup, setFilterGroup] = useState('All');

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
          groupLookup[doc.id] = doc.data().groupAcronym;
        });

        const membershipMap = {};
        mSnap.forEach(doc => {
          const data = doc.data();
          membershipMap[data.userId] = {
            groupAcronym: groupLookup[data.groupId] || "N/A",
            title: data.displayTitle || "Member",
            role: data.membershipRole || "user"
          };
        });

        const mergedUsers = userList.map(user => {
          const memberInfo = membershipMap[user.id] || {};
          return {
            ...user,
            photoURL: user.profilePictureUrl || user.photoURL || null, 
            groupAcronym: memberInfo.groupAcronym || "", 
            displayTitle: memberInfo.title || "",
            userRole: memberInfo.role || "",
            course: user.course || "N/A",
            yearLevel: user.yearLevel || "", 
            rank: user.rank || "Novice",
            aclcXp: user.aclcXp ? Number.parseInt(user.aclcXp, 10) : 0,
            isBiometricRegistered: user.isBiometricRegistered || false
          };
        }).sort((a, b) => {
          const lastA = a.lastName?.toLowerCase() || '';
          const lastB = b.lastName?.toLowerCase() || '';
          return lastA.localeCompare(lastB);
        });

        setUsers(mergedUsers);
      } catch (err) {
        console.error("Registry Sync Error:", err);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- DERIVED DATA ---
  const uniqueGroups = ['All', ...new Set(users.map(u => u.groupAcronym).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  // --- REFINED FILTER LOGIC ---
  const filteredUsers = users.filter(user => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = (
      user.firstName?.toLowerCase().includes(searchLow) ||
      user.lastName?.toLowerCase().includes(searchLow) ||
      user.studentId?.toLowerCase().includes(searchLow)
    );

    let filterDigit = null;
    if (filterYear !== 'All') {
      const match = /\d+/.exec(filterYear);
      filterDigit = match ? match[0] : null;
    }

    const matchesYear = filterYear === 'All' || 
      user.yearLevel?.toString().includes(filterDigit);

    const matchesTitle = filterTitle === 'All' || 
      user.displayTitle?.toLowerCase() === filterTitle.toLowerCase();

    const matchesRole = filterRole === 'All' || 
      user.userRole?.toLowerCase() === filterRole.toLowerCase();

    const matchesGroup = filterGroup === 'All' || 
      user.groupAcronym === filterGroup;

    return matchesSearch && matchesYear && matchesTitle && matchesRole && matchesGroup;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const tableColumn = ["ID", "Name", "Course/Year", "XP", "Title", "Role"];
      
      const tableRows = currentUsers.map(user => [
        user.studentId || "N/A",
        `${user.lastName || ''}, ${user.firstName || ''}`,
        `${user.course || ''} ${user.yearLevel || ''}`,
        user.aclcXp?.toLocaleString() || "0",
        user.displayTitle || "Member",
        user.userRole || "User"
      ]);

      doc.setFontSize(16);
      doc.text("ORSYS Personnel Registry", 14, 15);
      doc.setFontSize(10);
      doc.text(`Page: ${currentPage} | Date: ${new Date().toLocaleDateString()}`, 14, 22);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 28,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59] }, 
      });

      doc.save(`ORSYS_Registry_Page${currentPage}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Check console: autoTable dependency issue.");
    }
  };

  // --- CONDITIONAL RENDERING ---
  if (selectedUserId) {
    return (
      <AdminUserDetailEditor 
        userId={selectedUserId} 
        onBack={() => setSelectedUserId(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">ACCESSING REGISTRY...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <ShieldCheck className="text-blue-500" size={36} /> Personnel Registry
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
              {filteredUsers.length} Results
            </p>
            <button 
              onClick={exportToPDF} 
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
            >
              <FileText size={12} /> Export Visible ({currentUsers.length})
            </button>
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search Personnel..."
            className="bg-[#020617] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white w-full md:w-[350px] outline-none focus:border-blue-500/50"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white/5 border border-white/10 p-6 rounded-[2rem]">
        <select 
          className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs cursor-pointer focus:border-blue-500/50 outline-none" 
          value={filterGroup} 
          onChange={(e) => { setFilterGroup(e.target.value); setCurrentPage(1); }}
        >
          {uniqueGroups.map(group => (
            <option key={group} value={group}>{group === 'All' ? 'All Groups' : group}</option>
          ))}
        </select>

        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs cursor-pointer focus:border-blue-500/50 outline-none" value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setCurrentPage(1); }}>
          <option value="All">All Years</option>
          <option value="1st Year">1st Year</option>
          <option value="2nd Year">2nd Year</option>
          <option value="3rd Year">3rd Year</option>
          <option value="4th Year">4th Year</option>
        </select>

        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs cursor-pointer focus:border-blue-500/50 outline-none" value={filterTitle} onChange={(e) => { setFilterTitle(e.target.value); setCurrentPage(1); }}>
          <option value="All">All Titles</option>
          <option value="Chairman">Chairman</option>
          <option value="Leader">Leader</option>
        </select>

        <select className="bg-[#020617] text-white p-3 rounded-xl border border-white/10 text-xs cursor-pointer focus:border-blue-500/50 outline-none" value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}>
          <option value="All">All Roles</option>
          <option value="Officer">Officer</option>
          <option value="Member">Member</option>
        </select>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name & ID</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Year & Course</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">XP & Rank</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Designation</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Command</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt={`${user.firstName} profile`} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="text-slate-700" size={24} />
                          )}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg border ${user.isBiometricRegistered ? 'bg-emerald-500' : 'bg-slate-800'}`}>
                          <Fingerprint size={10} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase">{user.lastName}, <span className="text-blue-400">{user.firstName}</span></div>
                        <div className="text-[10px] text-slate-500 font-mono">{user.studentId || "NO ID"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-white font-black text-xs uppercase"><GraduationCap size={12} /> {user.course}</div>
                      <div className="text-[9px] text-blue-500 font-bold uppercase">{user.yearLevel || "N/A"}</div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1 text-amber-400 font-black text-xs"><Activity size={12} /> {user.aclcXp?.toLocaleString()}</div>
                      <div className="text-[8px] text-slate-400 uppercase font-black">{user.rank}</div>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <div className="inline-flex flex-col items-center px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
                      <span className="text-[8px] font-black text-blue-400 uppercase"><Layers size={10} className="inline mr-1" /> {user.groupAcronym || "NO GROUP"}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">{user.displayTitle}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <button 
                      onClick={() => setSelectedUserId(user.id)}
                      className="p-3 bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-blue-600 rounded-2xl transition-all cursor-pointer"
                    >
                      <Settings2 size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-20 text-center text-slate-500 uppercase font-black tracking-widest text-xs">
                  No personnel found in registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION SECTION */}
        <div className="p-6 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="p-2 border border-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"><ChevronLeft size={18} /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => paginate(num)} className={`h-8 w-8 rounded-lg text-[10px] font-black border cursor-pointer transition-all ${currentPage === num ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-slate-500'}`}>{num}</button>
            ))}
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 border border-white/10 text-slate-400 disabled:opacity-30 cursor-pointer"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterUserList;