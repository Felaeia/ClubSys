import React, { useState, useEffect } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
/* eslint-enable no-unused-vars */
import { Lock, ShieldCheck, RefreshCw, ChevronLeft, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Firebase Imports
import { 
  getAuth, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  confirmPasswordReset,
  verifyPasswordResetCode
} from "firebase/auth";

const ChangePassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const auth = getAuth();
  
  // Detect if we are in "Recovery Mode" via email link
  const oobCode = searchParams.get("oobCode");

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Optional: Verify the reset code on mount if it exists
  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode).catch(() => {
        setStatus({ type: "error", message: "Invalid or expired recovery link." });
      });
    }
  }, [oobCode, auth]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      return setStatus({ type: "error", message: "Key mismatch: Passwords do not match." });
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      if (oobCode) {
        // SCENARIO A: RESET VIA EMAIL LINK
        await confirmPasswordReset(auth, oobCode, passwords.new);
        setStatus({ type: "success", message: "Credential restoration complete. Protocol synchronized." });
        setTimeout(() => navigate("/login"), 3000);
      } else {
        // SCENARIO B: AUTHENTICATED UPDATE
        const user = auth.currentUser;
        if (!user) throw new Error("No active operator detected. Please login.");

        // Firebase requires re-authentication for sensitive operations
        const credential = EmailAuthProvider.credential(user.email, passwords.current);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, passwords.new);

        setStatus({ type: "success", message: "Security keys rotated successfully." });
      }
      
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err) {
      console.error("Auth Protocol Fault:", err);
      let msg = "Authorization rejected.";
      if (err.code === "auth/wrong-password") msg = "Current security key is invalid.";
      if (err.code === "auth/weak-password") msg = "New key fails complexity requirements.";
      if (err.code === "auth/expired-action-code") msg = "Recovery link has expired.";
      
      setStatus({ type: "error", message: msg });
    } finally {
      setLoading(false);
    }
  };

  // Define which fields to show based on mode
  const fields = oobCode 
    ? [
        { id: "new", label: "New Security Key" },
        { id: "confirm", label: "Confirm New Key" }
      ]
    : [
        { id: "current", label: "Current Security Key" },
        { id: "new", label: "New Security Key" },
        { id: "confirm", label: "Confirm New Key" }
      ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans p-4">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-6 group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Return to Terminal
        </button>

        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl">
          <header className="mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20 text-white mb-4">
              <Lock size={24} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
              {oobCode ? "Recovery" : "Credential"} <span className="text-blue-600">Protocol</span>
            </h2>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1">
              Mode: {oobCode ? "External Restoration" : "Internal Sync"}
            </p>
          </header>

          <AnimatePresence mode="wait">
            {status.message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`flex items-center gap-3 p-4 rounded-2xl mb-6 text-xs font-bold border ${
                  status.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                    : "bg-red-500/10 border-red-500/20 text-red-400"
                }`}
              >
                {status.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p>{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleUpdate} className="space-y-5">
            {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {field.label}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type={showPasswords ? "text" : "password"}
                    required
                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                    placeholder="••••••••"
                    value={passwords[field.id]}
                    onChange={(e) => setPasswords({...passwords, [field.id]: e.target.value})}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                  >
                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ))}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : "Execute Protocol"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ChangePassword;