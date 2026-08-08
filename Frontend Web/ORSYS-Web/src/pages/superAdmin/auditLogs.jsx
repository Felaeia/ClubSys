import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { db, rtdb } from '../../api/firebaseConfig';
import { 
  collection, query, orderBy, onSnapshot, limit 
} from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { 
  Search, Calendar, ShieldCheck, 
  Terminal, Loader2, User, Cpu, Database, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

/**
 * FIXED: Explicitly assigning Icon to a capitalized constant 'Component'
 * to satisfy strict ESLint 'no-unused-vars' rules.
 */
const TabButton = ({ id, label, icon: Icon, activeTab, setActiveTab }) => {
  const Component = Icon;

  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
        : 'bg-white/5 text-slate-500 hover:bg-white/10'
      }`}
    >
      <Component size={14} />
      <span>{label}</span>
    </button>
  );
};

TabButton.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState('audit');
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemOnline, setSystemOnline] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  useEffect(() => {
    const collectionMap = {
      audit: 'auditLogs',
      general: 'logs',
      system: 'system_logs'
    };

    const logsRef = collection(db, collectionMap[activeTab]);
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(100));

    // Subscription for Logs
    const unsubscribeLogs = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const sortedData = logsData.toSorted((a, b) => {
        const nameA = (a.performedBy || a.userName || 'System').toLowerCase();
        const nameB = (b.performedBy || b.userName || 'System').toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setLogs(sortedData);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    // Subscription for System Status
    const statusRef = ref(rtdb, 'system_status/isOnline');
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      setSystemOnline(snapshot.val() || false);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeStatus();
    };
  }, [activeTab]);

  /**
   * Action handler for tab switching.
   * Resets local UI states to avoid "set-state-in-effect" cascading renders.
   */
  const handleTabChange = (id) => {
    if (id !== activeTab) {
      setLoading(true);
      setLogs([]);
      setCurrentPage(1);
      setActiveTab(id);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString('en-PH', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const filteredLogs = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return logs.filter(log => {
      const operator = (log.performedBy || log.userName || 'System').toLowerCase();
      return operator.includes(s) || log.id.toLowerCase().includes(s);
    });
  }, [logs, searchTerm]);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-7xl mx-auto space-y-6 pb-20"
    >
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
            <Terminal className="text-blue-500" /> Orsys <span className="text-blue-600">Records</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
             <div className={`h-2 w-2 rounded-full animate-pulse ${systemOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
               {activeTab.replace('_', ' ')} • Alphabetical Mode
             </p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="FILTER BY OPERATOR OR ID..."
            className="bg-slate-900 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold text-white focus:border-blue-500 outline-none w-full lg:w-80 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-[2rem] border border-white/10 w-fit">
        <TabButton id="audit" label="Audit Logs" icon={ShieldCheck} activeTab={activeTab} setActiveTab={handleTabChange} />
        <TabButton id="general" label="General Logs" icon={Database} activeTab={activeTab} setActiveTab={handleTabChange} />
        <TabButton id="system" label="System Logs" icon={Cpu} activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      <section className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator (A-Z)</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action Payload</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Reference</th>
                <th className="p-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Secure Vault...</p>
                  </td>
                </tr>
              ) : currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-blue-400">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{log.performedBy || log.userName || "System"}</p>
                        <p className="text-[9px] font-black text-blue-500/60 uppercase">{log.performedByRole || log.device || "Auto-Task"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col">
                      <p className="text-xs font-bold text-white uppercase tracking-tight">
                        {log.actionType || log.type || log.action || "EVENT_TRIGGER"}
                      </p>
                      <p className="text-[10px] text-slate-500 italic mt-0.5 max-w-sm line-clamp-1">
                        {log.reason || log.details?.previousStatus || "No description provided."}
                      </p>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                      {log.id.substring(0, 10)}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-500">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold">{formatTime(log.timestamp)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="p-6 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Showing {indexOfFirstLog + 1} - {Math.min(indexOfLastLog, filteredLogs.length)}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                      currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-white/10'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white disabled:opacity-20 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </MotionDiv>
  );
};

export default AuditLogs;