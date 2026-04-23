import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { 
  Landmark, Search, Layers, Calendar, 
  Loader2, Plus, Eye, Settings2 
} from 'lucide-react';

const OrganizationRegistry = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'groups'));
        const groupsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGroups(groupsData);
      } catch (error) {
        console.error("Registry Access Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // Helper to format Firestore timestamps
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredGroups = groups.filter(g => 
    g.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.groupAcronym?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700 text-left">
      
      {/* SUPERADMIN HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-blue-500/30">
               System Authority
             </span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
            <Landmark className="text-blue-500" size={36} /> Global Registry
          </h1>
        </div>

        <div className="flex gap-4">
          <div className="relative group w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filter Groups..." 
              className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:border-blue-500/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
          >
            <Search size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Execute Search</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* DEPLOY NEW ENTITY CARD */}
        <button 
          onClick={() => navigate('/superadmin/registry/new')}
          className="w-full min-h-[350px] border-2 border-dashed border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center space-y-4 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer group outline-none"
        >
            <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
              <Plus className="text-slate-500 group-hover:text-blue-500" size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-400">
              Deploy New Organization
            </p>
        </button>

        {/* ORGANIZATION CARDS */}
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all flex flex-col relative overflow-hidden text-left">
            
            <div className="flex items-start gap-6 mb-8">
              {/* CONSISTENT LOGO SIZE */}
              <div className="w-20 h-20 min-w-[5rem] bg-slate-950 rounded-3xl border border-white/10 p-4 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={group.logoUrl} 
                  alt={group.groupAcronym} 
                  className="w-full h-full object-contain filter drop-shadow-md" 
                />
              </div>
              <div className="pt-2 text-left">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">{group.groupAcronym}</span>
                <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tighter line-clamp-2">{group.groupName}</h3>
              </div>
            </div>

            {/* ALIGNED INFO SECTION */}
            <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/5">
              
              {/* Classification Column */}
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-2 h-3">
                  <Layers size={12} className="text-slate-600 shrink-0" />
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">
                    Classification
                  </p>
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-tight leading-none ml-4">
                  {group.groupType || 'Organization'}
                </p>
              </div>

              {/* Commissioned Column */}
              <div className="flex flex-col items-start space-y-2">
                <div className="flex items-center gap-2 h-3">
                  <Calendar size={12} className="text-slate-600 shrink-0" />
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none">
                    Commissioned
                  </p>
                </div>
                
                {/* Added ml-5 to align it more towards the right or ml-1 for a tiny nudge */}
                <p className="text-sm font-bold text-slate-300 leading-none ml-5">
                  {formatDate(group.groupCreated)}
                </p>
              </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => navigate(`/superadmin/registry/view/${group.id}`)}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white text-white hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Eye size={16} /> View Intel
              </button>

              <button 
                onClick={() => navigate(`/superadmin/registry/configure/${group.id}`)}
                className="px-6 border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all flex items-center justify-center active:scale-95"
                title="Configure Registry"
              >
                <Settings2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Synchronizing Registry...</p>
  </div>
);

export default OrganizationRegistry;