import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { firestore } from '../../api/firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc
} from "firebase/firestore";
import { 
  Search, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  Clock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;

const BroadcastArchives = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Orders by creation date descending (Newest first)
    const q = query(collection(firestore, "announcements"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // Updated filter to include authorId
  const filteredHistory = history.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title?.toLowerCase().includes(searchLower) || 
      item.authorId?.toLowerCase().includes(searchLower)
    );
  });

  const deleteRecord = async (id) => {
    if (globalThis.confirm("Permanently remove this record from archives?")) {
      await deleteDoc(doc(firestore, "announcements", id));
    }
  };

  const handleReuse = (item) => {
    // Navigates back to the center with the specific state payload
    navigate('/superadmin/broadcast', { 
      state: { 
        reusingData: {
          title: item.title,
          content: item.content,
          priority: item.priority,
          targetAudience: item.targetAudience,
          targetGroupIds: item.targetGroupIds,
          targetGroupAcronyms: item.targetGroupAcronyms,
          targetCourses: item.targetCourses,
          targetYearLevels: item.targetYearLevels
        } 
      } 
    });
  };

  return (
    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-6 pb-10 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate('/superadmin/broadcast')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2">
            <ArrowLeft size={14}/> Return to Center
          </button>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <RotateCcw className="text-emerald-500" size={32} /> Transmission <span className="text-emerald-500">Vault</span>
          </h1>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH TITLE OR AUTHOR ID..." 
            className="bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white text-xs outline-none focus:border-emerald-500 w-full md:w-96 transition-all shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredHistory.map((item) => (
            <MotionDiv 
              layout 
              key={item.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-6 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">Archive Entry</span>
                    <span className="text-[7px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                       <User size={8}/> {item.authorId || 'ADMIN'}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight uppercase">{item.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReuse(item)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-900/20" title="Reuse Content">
                    <Edit3 size={16}/>
                  </button>
                  <button onClick={() => deleteRecord(item.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Delete Permanent">
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>

              <p className="text-slate-400 text-xs line-clamp-3 mb-6 leading-relaxed">
                {item.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={12}/>
                  <span className="text-[9px] font-bold uppercase tracking-tighter">
                    {item.createdAt?.toDate ? 
                        item.createdAt.toDate().toLocaleString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : "Processing..."}
                  </span>
                </div>
                <div className="flex gap-1">
                   <span className="text-[7px] bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase font-black tracking-widest">{item.priority}</span>
                   <span className="text-[7px] bg-white/5 text-slate-400 px-2 py-0.5 rounded uppercase font-black tracking-widest">{item.targetAudience}</span>
                </div>
              </div>
            </MotionDiv>
          ))}
        </AnimatePresence>
      </section>

      {filteredHistory.length === 0 && (
        <div className="text-center py-20 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No matching transmissions found in the vault</p>
        </div>
      )}
    </MotionDiv>
  );
};

export default BroadcastArchives;