import React, { useState, useEffect } from 'react';
import { db } from '../../api/firebaseConfig';
import { 
  collection, 
  query, 
  onSnapshot, 
  where, 
  doc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Trophy, 
  Target, 
  Zap, 
  Plus, 
  Flame,
  Loader2,
  Shield,
  X,
  Clock,
  Split,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div;

const GamificationEngine = () => {
  const [activeTab, setActiveTab] = useState('quests');
  const [houses, setHouses] = useState([]);
  const [quests, setQuests] = useState([]);
  const [config, setConfig] = useState({ multiplier: 1, eventName: 'Standard' });
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // NewQuest state
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    xpReward: 50,
    type: 'Technical',
    durationDays: 1,
    scansPerDay: 1,
    rewardProtocol: 'divided',
    timeWindows: {
      first: { start: '07:00', end: '09:00' },
      second: { start: '16:00', end: '18:00' }
    },
    targetType: 'House'
  });

  useEffect(() => {
    const configUnsub = onSnapshot(doc(db, 'system_configs', 'gamification'), (doc) => {
      if (doc.exists()) setConfig(doc.data());
    });

    const questQuery = query(collection(db, 'quests'), where('isActive', '==', true));
    const questUnsub = onSnapshot(questQuery, (snapshot) => {
      setQuests(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const houseQuery = query(collection(db, 'groups'), where('groupType', '==', 'House'));
    const houseUnsub = onSnapshot(houseQuery, (snapshot) => {
      const fetchedHouses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.groupName,
          xp: data.stats?.totalActivityPoints || 0,
          color: data.primaryColor || '#10b981',
          acronym: data.groupAcronym,
          logo: data.logoUrl || null 
        };
      });

      const rankedHouses = [...fetchedHouses].sort((a, b) => b.xp - a.xp);
      setHouses(rankedHouses);
      setLoading(false);
    });

    return () => {
      configUnsub();
      questUnsub();
      houseUnsub();
    };
  }, []);

  const handleCreateQuest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'quests'), {
        ...newQuest,
        isActive: true,
        globalCompletion: 0,
        createdAt: serverTimestamp(),
        validationSchema: {
          method: 'biometric',
          rewardProtocol: newQuest.rewardProtocol,
          daysRequired: Number(newQuest.durationDays),
          dailyQuota: Number(newQuest.scansPerDay),
          totalRequiredScans: Number(newQuest.durationDays) * Number(newQuest.scansPerDay),
          windows: newQuest.timeWindows
        }
      });
      setIsModalOpen(false);
      setNewQuest({ 
        title: '', 
        description: '', 
        xpReward: 50, 
        type: 'Technical',
        durationDays: 1,
        scansPerDay: 1,
        rewardProtocol: 'divided',
        timeWindows: {
          first: { start: '07:00', end: '09:00' },
          second: { start: '16:00', end: '18:00' }
        },
        targetType: 'House'
      });
    } catch (error) {
      console.error("Deployment Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Igniting Engine...</p>
    </div>
  );

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-10 px-4"
    >
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">System Live</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter italic">
            Gamification <span className="text-emerald-500/50 not-italic">Engine</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            Vantage Institutional Merit Ecosystem • {config.eventName}
          </p>
        </div>
        
        <div className="flex bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl">
          {['quests', 'leaderboard', 'rewards'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                  : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: QUESTS */}
        <section className="lg:col-span-8 space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Target size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Priority Objectives</h3>
                  <p className="text-slate-500 text-[9px] font-bold uppercase mt-1">Available House Challenges</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} strokeWidth={3} /> Create Quest
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode='popLayout'>
                {quests.map((quest) => (
                  <MotionDiv 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={quest.id} 
                    className="group p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] w-fit">
                          {quest.type}
                        </span>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md w-fit">
                          {quest.validationSchema?.rewardProtocol === 'divided' ? <Split size={8} className="text-amber-500" /> : <Lock size={8} className="text-rose-500" />}
                          <span className="text-[7px] font-black text-slate-400 uppercase">{quest.validationSchema?.rewardProtocol}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-mono font-bold text-sm">+{quest.xpReward}</p>
                        <p className="text-[8px] text-slate-500 font-black uppercase">Max XP</p>
                      </div>
                    </div>
                    
                    <h4 className="text-base font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{quest.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-6 line-clamp-2">{quest.description}</p>
                    
                    <div className="flex items-center justify-between text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2">
                       <span className="flex items-center gap-1"><Clock size={10} /> {quest.validationSchema?.daysRequired} Day Span</span>
                       <span>{quest.globalCompletion || 0}% Complete</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <MotionDiv 
                        initial={{ width: 0 }}
                        animate={{ width: `${quest.globalCompletion || 0}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </MotionDiv>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: LEADERBOARD */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
              <Trophy size={18} className="text-amber-500" /> House Rankings
            </h3>
            
            <div className="space-y-8">
              {houses.map((item, idx) => (
                <div key={item.id} className="group flex items-center gap-5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden border border-white/10 bg-slate-950 transition-transform group-hover:scale-110 duration-500">
                      {item.logo ? (
                        <img src={item.logo} alt={item.name} className="w-full h-full object-cover p-1 opacity-90" />
                      ) : (
                        <Shield size={22} style={{ color: item.color }} className="opacity-40" />
                      )}
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-slate-900 border border-white/10 rounded-lg flex items-center justify-center shadow-xl">
                        <span className="text-[10px] font-black text-white">{idx + 1}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col mb-2">
                      <span className="text-[13px] font-black text-white uppercase tracking-tight truncate">{item.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono font-bold text-emerald-400">{item.xp.toLocaleString()}</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Points</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                      <MotionDiv initial={{ width: 0 }} animate={{ width: `${Math.min((item.xp / 10000) * 100, 100)}%` }} className="h-full relative z-10" style={{ backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={20} fill="white" className="group-hover:animate-bounce" />
                <h3 className="font-black text-xs uppercase tracking-[0.2em]">Active Bonus</h3>
              </div>
              <h2 className="text-5xl font-black mb-2 tracking-tighter">{config.multiplier}x</h2>
              <p className="text-emerald-100/70 text-[9px] font-bold uppercase tracking-[0.2em]">Current XP Yield</p>
            </div>
            <Zap className="absolute -top-6 -right-6 w-40 h-40 text-white/10 rotate-12" />
          </div>
        </aside>
      </div>

      {/* QUEST CREATION MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
            />

            <MotionDiv
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 animate-pulse" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                    Deploy New <span className="text-emerald-500/50 not-italic">Objective</span>
                  </h2>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Configure Validation Protocol</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateQuest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="mission-title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mission Title</label>
                    <input 
                      id="mission-title"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-emerald-500/50"
                      placeholder="e.g. Daily Attendance"
                      value={newQuest.title}
                      onChange={(e) => setNewQuest({...newQuest, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="objective-type" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective Type</label>
                    <select 
                      id="objective-type"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none"
                      value={newQuest.type}
                      onChange={(e) => setNewQuest({...newQuest, type: e.target.value})}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Academic">Academic</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="xp-yield" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Max XP Yield</label>
                  <input 
                    id="xp-yield"
                    type="number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-emerald-400 font-mono font-bold focus:outline-none"
                    value={newQuest.xpReward}
                    onChange={(e) => setNewQuest({...newQuest, xpReward: Number(e.target.value)})}
                  />
                </div>

                {/* ATTENDANCE PROTOCOL */}
                <div className="space-y-4 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Biometric Protocol</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="duration-days" className="text-[9px] font-black text-slate-500 uppercase">Event Span (Days)</label>
                      <input 
                        id="duration-days"
                        type="number" 
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white text-xs"
                        value={newQuest.durationDays}
                        onChange={(e) => setNewQuest({...newQuest, durationDays: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="scans-per-day" className="text-[9px] font-black text-slate-500 uppercase">Daily Scans</label>
                      <select 
                        id="scans-per-day"
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2 text-white text-xs"
                        value={newQuest.scansPerDay}
                        onChange={(e) => setNewQuest({...newQuest, scansPerDay: e.target.value})}
                      >
                        <option value={1}>1 Scan (Entry)</option>
                        <option value={2}>2 Scans (Entry/Exit)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">1st Window</span>
                      <div className="flex gap-2">
                        <input aria-label="First window start" type="time" className="bg-slate-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-emerald-400" value={newQuest.timeWindows.first.start} onChange={(e) => setNewQuest({...newQuest, timeWindows: {...newQuest.timeWindows, first: {...newQuest.timeWindows.first, start: e.target.value}}})} />
                        <input aria-label="First window end" type="time" className="bg-slate-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-emerald-400" value={newQuest.timeWindows.first.end} onChange={(e) => setNewQuest({...newQuest, timeWindows: {...newQuest.timeWindows, first: {...newQuest.timeWindows.first, end: e.target.value}}})} />
                      </div>
                    </div>

                    {newQuest.scansPerDay == 2 && (
                      <div className="flex items-center justify-between gap-4 border-t border-white/5 pt-3">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">2nd Window</span>
                        <div className="flex gap-2">
                          <input aria-label="Second window start" type="time" className="bg-slate-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-emerald-400" value={newQuest.timeWindows.second.start} onChange={(e) => setNewQuest({...newQuest, timeWindows: {...newQuest.timeWindows, second: {...newQuest.timeWindows.second, start: e.target.value}}})} />
                          <input aria-label="Second window end" type="time" className="bg-slate-950 border border-white/5 rounded-lg px-2 py-1 text-[10px] text-emerald-400" value={newQuest.timeWindows.second.end} onChange={(e) => setNewQuest({...newQuest, timeWindows: {...newQuest.timeWindows, second: {...newQuest.timeWindows.second, end: e.target.value}}})} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* REWARD PROTOCOL TOGGLE */}
                <div className="space-y-4 p-6 bg-slate-950/50 border border-white/5 rounded-3xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Reward Protocol</span>
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5">
                      <button 
                        type="button"
                        onClick={() => setNewQuest({...newQuest, rewardProtocol: 'divided'})}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${newQuest.rewardProtocol === 'divided' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
                      >
                        Divided
                      </button>
                      <button 
                        type="button"
                        onClick={() => setNewQuest({...newQuest, rewardProtocol: 'strict'})}
                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${newQuest.rewardProtocol === 'strict' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}
                      >
                        Strict
                      </button>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
                    {newQuest.rewardProtocol === 'divided' 
                      ? "Points are calculated based on completion percentage. Every scan adds to the final yield." 
                      : "Strict Survival Script: Users must hit 100% attendance to receive any points."}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="mission-briefing" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Briefing</label>
                  <textarea 
                    id="mission-briefing"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none h-32 resize-none"
                    placeholder="Briefing details..."
                    value={newQuest.description}
                    onChange={(e) => setNewQuest({...newQuest, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all">Abort</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50">
                    {isSubmitting ? 'Deploying...' : 'Deploy Quest'}
                  </button>
                </div>
              </form>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </MotionDiv>
  );
};

export default GamificationEngine;