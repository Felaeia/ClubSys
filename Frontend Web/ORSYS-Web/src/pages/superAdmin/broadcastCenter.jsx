import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { firestore } from '../../api/firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  deleteDoc, 
  doc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  Megaphone, 
  Trash2, 
  Users,
  GraduationCap,
  Layers,
  Calendar,
  AlertCircle,
  Bell,
  Edit2,
  X,
  Clock,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const customSelectStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '0.75rem',
    fontSize: '10px',
    color: 'white',
    '&:hover': { borderColor: '#3b82f6' }
  }),
  menu: (base) => ({ ...base, backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#3b82f6' : 'transparent',
    color: 'white',
    fontSize: '10px'
  }),
  multiValue: (base) => ({ ...base, backgroundColor: '#3b82f6', borderRadius: '4px' }),
  multiValueLabel: (base) => ({ ...base, color: 'white' }),
  multiValueRemove: (base) => ({ ...base, color: 'white', '&:hover': { color: '#ef4444' } }),
  placeholder: (base) => ({ ...base, color: '#64748b' }),
  singleValue: (base) => ({ ...base, color: 'white' }),
};

const BroadcastCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [announcements, setAnnouncements] = useState([]);
  const [groups, setGroups] = useState([]); 
  const [isPosting, setIsPosting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // INITIALIZE STATE DIRECTLY: Prevents ESLint cascading render error
  const [newPost, setNewPost] = useState(location.state?.reusingData || {
    title: "",
    content: "",
    imageUrl: "",
    priority: "normal", 
    targetAudience: "all", 
    targetGroupIds: [],
    targetGroupAcronyms: [],
    targetCourses: ["all"],
    targetYearLevels: ["all"],
    expiryDate: "" 
  });

  const courseOptions = [
    { value: 'all', label: 'All Courses' },
    { value: 'BSCS', label: 'BSCS' },
    { value: 'BSIT', label: 'BSIT' },
    { value: 'WADT', label: 'WADT' },
  ];

  const yearOptions = [
    { value: 'all', label: 'All Years' },
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  const formatYearLevel = (levels) => {
    if (!levels || levels.includes('all')) return 'ANY';
    const suffixes = { '1': 'st', '2': 'nd', '3': 'rd', '4': 'th' };
    return levels.map(l => `${l}${suffixes[l] || 'th'}`).join(', ');
  };

  // Side Effect for UI adjustments when reusing data
  useEffect(() => {
    if (location.state?.reusingData) {
      globalThis.scrollTo({ top: 0, behavior: 'smooth' });
      // FIX: Changed window.history to globalThis.history to satisfy SonarLint
      globalThis.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const qAnnouncements = query(collection(firestore, "announcements"), orderBy("createdAt", "desc"));
    const unsubAnnouncements = onSnapshot(qAnnouncements, (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubGroups = onSnapshot(collection(firestore, "groups"), (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ 
        value: doc.id, 
        label: doc.data().groupAcronym || doc.id 
      })));
    });

    return () => { unsubAnnouncements(); unsubGroups(); };
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setNewPost({ 
      title: "", content: "", imageUrl: "", priority: "normal", 
      targetAudience: "all", targetGroupIds: [], targetGroupAcronyms: [],
      targetCourses: ["all"], targetYearLevels: ["all"],
      expiryDate: ""
    });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    
    setIsPosting(true);
    try {
      if (editingId) {
        await updateDoc(doc(firestore, "announcements", editingId), {
          ...newPost,
          lastEditedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(firestore, "announcements"), {
          ...newPost,
          createdAt: serverTimestamp(),
          authorId: "SUPER_ADMIN",
          status: "active"
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditClick = (msg) => {
    setEditingId(msg.id);
    setNewPost({
      title: msg.title,
      content: msg.content,
      imageUrl: msg.imageUrl || "",
      priority: msg.priority || "normal",
      targetAudience: msg.targetAudience || "all",
      targetGroupIds: msg.targetGroupIds || [],
      targetGroupAcronyms: msg.targetGroupAcronyms || [],
      targetCourses: msg.targetCourses || ["all"],
      targetYearLevels: msg.targetYearLevels || ["all"],
      expiryDate: msg.expiryDate || ""
    });
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteAnnouncement = async (id) => {
    if (globalThis.confirm("Delete this broadcast?")) {
      await deleteDoc(doc(firestore, "announcements", id));
    }
  };

  const checkIsExpired = (expiryStr) => {
    if (!expiryStr) return false;
    return new Date(expiryStr) < new Date();
  };

  const getTypeBadge = (priority, expiryDate) => {
    if (checkIsExpired(expiryDate)) {
      return (
        <span className="bg-slate-700 text-slate-400 text-[7px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
          <History size={8}/> Expired
        </span>
      );
    }

    switch(priority) {
      case 'urgent': return <span className="bg-red-500 text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><AlertCircle size={8}/> Urgent</span>;
      case 'event': return <span className="bg-amber-500 text-black text-[7px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><Calendar size={8}/> Event</span>;
      default: return <span className="bg-blue-500 text-white text-[7px] px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1"><Bell size={8}/> Normal</span>;
    }
  };

  const renderExpiryBadge = (expiryDate) => {
    if (!expiryDate) return null;
    const isExpired = checkIsExpired(expiryDate);
    const dateLabel = new Date(expiryDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    const badgeStyle = isExpired 
      ? "bg-red-500/10 text-red-400 border-red-500/20" 
      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

    return (
      <span className={`text-[7px] px-2 py-1 rounded border font-black flex items-center gap-1 ${badgeStyle}`}>
        <Clock size={8}/> {isExpired ? `EXPIRED: ${dateLabel}` : `EXP: ${dateLabel}`}
      </span>
    );
  };

  let buttonLabel = "Initiate Broadcast";
  if (isPosting) buttonLabel = "TRANSMITTING...";
  else if (editingId) buttonLabel = "Update Broadcast";

  return (
    <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Megaphone className="text-blue-600" size={32} /> Broadcast <span className="text-blue-500">Center</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Multi-Targeting Infrastructure</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/superadmin/broadcast-archives')} 
            className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-all shadow-lg shadow-emerald-900/10"
          >
            <History size={14}/> View Archives
          </button>

          {editingId && (
            <button 
              onClick={resetForm} 
              className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <X size={14}/> Cancel Edit
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1">
          <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl sticky top-8">
            <form onSubmit={handleBroadcast} className="space-y-4">
              <input placeholder="Headline" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs outline-none focus:border-blue-500 transition-colors" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
              <textarea placeholder="Content..." rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs resize-none outline-none focus:border-blue-500 transition-colors" value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} />

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest"><Clock size={12}/> Set Expiration</div>
                  <input 
                    type="datetime-local"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-[10px] outline-none focus:border-blue-500 color-scheme-dark"
                    value={newPost.expiryDate}
                    onChange={(e) => setNewPost({...newPost, expiryDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest"><Bell size={12}/> Broadcast Type</div>
                  <div className="grid grid-cols-3 gap-2">
                    {['normal', 'event', 'urgent'].map((type) => (
                      <button key={type} type="button" onClick={() => setNewPost({...newPost, priority: type})} className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-tighter border transition-all ${newPost.priority === type ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}>{type}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest"><Users size={12}/> Audience</div>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-[10px] outline-none" value={newPost.targetAudience} onChange={(e) => setNewPost({...newPost, targetAudience: e.target.value, targetGroupIds: [], targetGroupAcronyms: []})}>
                    <option value="all" className="bg-slate-900">Everyone</option>
                    <option value="group" className="bg-slate-900">Specific Groups</option>
                  </select>
                  {newPost.targetAudience === 'group' && (
                    <Select isMulti options={groups} value={groups.filter(g => newPost.targetGroupIds.includes(g.value))} styles={customSelectStyles} placeholder="Select Groups..." onChange={(selected) => setNewPost({...newPost, targetGroupIds: selected ? selected.map(s => s.value) : [], targetGroupAcronyms: selected ? selected.map(s => s.label) : [] })} />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest"><GraduationCap size={12}/> Academic Tracks</div>
                  <Select isMulti options={courseOptions} value={courseOptions.filter(o => newPost.targetCourses.includes(o.value))} styles={customSelectStyles} onChange={(selected) => setNewPost({...newPost, targetCourses: selected ? selected.map(s => s.value) : []})} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-black text-blue-400 uppercase tracking-widest"><Layers size={12}/> Year Levels</div>
                  <Select isMulti options={yearOptions} value={yearOptions.filter(o => newPost.targetYearLevels.includes(o.value))} styles={customSelectStyles} onChange={(selected) => setNewPost({...newPost, targetYearLevels: selected ? selected.map(s => s.value) : []})} />
                </div>
              </div>

              <MotionButton whileTap={{ scale: 0.95 }} disabled={isPosting} className={`w-full font-black py-4 rounded-xl text-[10px] uppercase tracking-widest transition-all mt-4 ${editingId ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'} text-white shadow-lg shadow-blue-900/10`}>
                {buttonLabel}
              </MotionButton>
            </form>
          </div>
        </section>

        <section className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {announcements.map((msg) => {
              const isExpired = checkIsExpired(msg.expiryDate);
              let borderColorClass = 'border-white/5';
              if (isExpired) borderColorClass = 'border-slate-800 opacity-60'; 
              else if (msg.priority === 'urgent') borderColorClass = 'border-red-500/30';
              else if (msg.priority === 'event') borderColorClass = 'border-amber-500/30';

              return (
                <MotionDiv layout key={msg.id} className={`bg-slate-900/60 border rounded-3xl p-6 transition-all ${borderColorClass}`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                          <h4 className="text-white font-bold text-sm uppercase tracking-tight">{msg.title}</h4>
                          {getTypeBadge(msg.priority, msg.expiryDate)}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">{msg.content}</p>
                      <div className="flex flex-wrap gap-2 pt-3">
                        <span className="text-[7px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 font-black">
                          {msg.targetAudience === 'all' ? 'GLOBAL' : `GROUPS: ${msg.targetGroupAcronyms?.join(', ')}`}
                        </span>
                        <span className="text-[7px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 font-black">
                          DEPT: {msg.targetCourses?.join(', ')}
                        </span>
                        <span className="text-[7px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20 font-black">
                          YEAR: {formatYearLevel(msg.targetYearLevels)}
                        </span>
                        {renderExpiryBadge(msg.expiryDate)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(msg)} className="text-slate-600 hover:text-emerald-500 transition-colors" title="Edit Broadcast"><Edit2 size={18} /></button>
                      <button onClick={() => deleteAnnouncement(msg.id)} className="text-slate-600 hover:text-red-500 transition-colors" title="Delete Broadcast"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </MotionDiv>
              );
            })}
          </AnimatePresence>
        </section>
      </div>
    </MotionDiv>
  );
};

export default BroadcastCenter;