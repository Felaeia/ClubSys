import React, { useState } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ChevronLeft, Loader2, AlertCircle, CheckCircle2, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Firebase Integration imports
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../api/firebaseConfig"; 

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  
  const navigate = useNavigate();

  const handleRecovery = async (e) => {
    e.preventDefault();
    
    // Basic format validation before hitting the server
    if (!email.includes("@")) {
      return setStatus({ type: "error", message: "Invalid email format detected." });
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // 1. CALL THE REAL RECOVERY PROTOCOL
      // This sends the actual reset link via Firebase
      await sendPasswordResetEmail(auth, email);
      
      // 2. TRIGGER SUCCESS STATE
      setSubmitted(true);
      setStatus({ 
        type: "success", 
        message: "Recovery link dispatched to authorized terminal." 
      });
    } catch (err) {
      console.error("Recovery Protocol Fault:", err);
      
      // 3. MAP ERROR CODES TO THE ORSYS STYLE
      let errorMessage = "Identification failed. Request rejected.";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "No operator found with this identity.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Identifier format rejected by core database.";
      } else if (err.code === "auth/too-many-requests") {
        errorMessage = "Security lock active. Too many attempts. Try again later.";
      }

      setStatus({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans p-4">
      {/* Background Visuals */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full z-10"
      >
        <button 
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-6 group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Access Portal
        </button>

        <div className="bg-white/5 border border-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 animate-pulse" />

          <header className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 text-blue-500 mb-6 shadow-inner">
              <Fingerprint size={32} className={loading ? "animate-pulse" : ""} />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              Recovery <span className="text-blue-600">Protocol</span>
            </h2>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2">
              Credential Restoration Sequence
            </p>
          </header>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-4"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-3xl mb-8">
                  <CheckCircle2 size={40} className="mx-auto mb-4" />
                  <h3 className="text-sm font-black uppercase tracking-widest mb-2">Transmission Sent</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    An encrypted recovery link has been dispatched to <br />
                    <span className="text-emerald-400 font-bold">{email}</span>. <br />
                    Check your terminal and follow the instructions.
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/login")}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  Return to Login
                </motion.button>
              </motion.div>
            ) : (
              <motion.form
                key="recovery-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRecovery}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label 
                    htmlFor="email-recovery" 
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 cursor-pointer"
                  >
                    Registered Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      id="email-recovery"
                      type="email"
                      required
                      placeholder="operator@orsys.core"
                      className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {status.type === "error" && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl text-[10px] font-bold flex items-center gap-3"
                  >
                    <AlertCircle size={16} />
                    <p>{status.message}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Initialize Recovery"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          <footer className="mt-10 text-center">
            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-[0.3em]">
              Security System v3.0.2 // ORSYS GLOBAL
            </p>
          </footer>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;