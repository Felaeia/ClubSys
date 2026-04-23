import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { 
  ChevronLeft, Globe, Coins, 
  Users, ShoppingBag, Zap, Calendar, Palette, Settings2, Bookmark
} from 'lucide-react';

const ViewOrganization = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'groups', groupId));
        if (docSnap.exists()) setData(docSnap.data());
      } catch (e) { 
        console.error("Intelligence Retrieval Error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [groupId]);

  if (loading) return (
    <div className="p-20 text-center animate-pulse">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Accessing Encrypted Records...</p>
    </div>
  );
  
  if (!data) return (
    <div className="p-20 text-center">
      <p className="text-red-500 font-black uppercase">Entity Not Found in Registry</p>
    </div>
  );

  const themeStyle = {
    borderColor: data.theme?.primaryColor ? `${data.theme.primaryColor}33` : 'rgba(255,255,255,0.1)',
    primaryAccent: data.theme?.primaryColor || '#3b82f6',
    secondaryAccent: data.theme?.secondaryColor || '#64748b'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
        <ChevronLeft size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Return to Registry</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: IDENTITY & BRANDING */}
        <div className="space-y-6">
          <div 
            className="bg-white/5 border p-8 rounded-[3.5rem] text-center relative shadow-2xl backdrop-blur-md overflow-hidden"
            style={{ borderColor: themeStyle.borderColor }}
          >
            <button 
              onClick={() => navigate(`/superadmin/registry/configure/${groupId}`)}
              className="absolute top-6 right-6 w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-lg z-20"
              style={{ backgroundColor: themeStyle.primaryAccent }}
            >
              <Settings2 size={22} />
            </button>

            <div className="w-40 h-40 bg-slate-950 rounded-full border-4 border-white/5 mx-auto p-6 flex items-center justify-center relative overflow-hidden mb-6 shadow-2xl">
                <div className="absolute inset-0 opacity-10" style={{ backgroundColor: themeStyle.primaryAccent }}></div>
                <img src={data.logoUrl} alt="logo" className="w-full h-full object-contain relative z-10" />
            </div>

            <div className="space-y-2 relative z-10">
              <p style={{ color: themeStyle.primaryAccent }} className="text-[11px] font-black uppercase tracking-[0.3em]">
                {data.groupAcronym}
              </p>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                {data.groupName}
              </h1>

              {/* GROUP TYPE CLASSIFICATION BADGE */}
              <div className="flex justify-center mt-3">
                <div 
                  className="px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-lg"
                  style={{ 
                    borderColor: `${themeStyle.primaryAccent}44`,
                    backgroundColor: `${themeStyle.primaryAccent}11`
                  }}
                >
                  <Bookmark size={10} style={{ color: themeStyle.primaryAccent }} />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: themeStyle.primaryAccent }}>
                    {data.groupType || 'Organization'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5 mt-6">
                <Calendar size={12} className="text-slate-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Established: <span className="text-white">{data.groupCreated?.toDate().toLocaleDateString() || 'N/A'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} /> System Color Profile
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: themeStyle.primaryAccent }}></div>
                <p className="text-[9px] font-bold text-white uppercase tracking-tighter">Primary</p>
              </div>
              <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                <div className="w-8 h-8 rounded-lg shadow-lg" style={{ backgroundColor: themeStyle.secondaryAccent }}></div>
                <p className="text-[9px] font-bold text-white uppercase tracking-tighter">Secondary</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[3rem] flex flex-col items-center text-center gap-4 shadow-xl">
             <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center p-5 border-2 border-emerald-500/20 shadow-inner">
                {data.currencyLogoUrl ? (
                  <img src={data.currencyLogoUrl} alt="currency" className="w-full h-full object-contain" />
                ) : (
                  <Coins className="text-emerald-400" size={48} />
                )}
             </div>
             <div>
                <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest">Economic Unit</p>
                <p className="text-white font-black uppercase tracking-tight text-3xl">{data.currencyName || 'Credits'}</p>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MISSION & STATS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-6 backdrop-blur-xl">
            <section className="space-y-4">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Globe size={14} style={{ color: themeStyle.primaryAccent }} /> Mission Briefing
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg italic">
                "{data.description || "No system description provided."}"
              </p>
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                <Users size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Personnel Count</p>
                <p className="text-4xl font-black text-white">{data.stats?.totalMembersCount?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                <Coins size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Circulation</p>
                <p className="text-4xl font-black text-emerald-400">{data.stats?.totalCurrencyCirculating?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Market Items Sold</p>
                <p className="text-4xl font-black text-white">{data.stats?.totalItemsSold?.toLocaleString() || 0}</p>
              </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-lg transition-transform hover:scale-[1.02]">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                <Zap size={28} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Engagement Points</p>
                <p className="text-4xl font-black text-white">{data.stats?.totalActivityPoints?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOrganization;