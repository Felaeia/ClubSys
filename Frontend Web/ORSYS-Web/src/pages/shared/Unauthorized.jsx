import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, Home } from 'lucide-react';
import { motion } from 'framer-motion';

// 1. Fix S6774/no-unused-vars by using a capitalized alias
const MotionDiv = motion.div;

const Unauthorized = () => {
  const navigate = useNavigate();

  // 2. Fix S6479 (Array index in keys) by generating stable IDs
  const systemBars = ['sb-1', 'sb-2', 'sb-3', 'sb-4'];

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 font-sans overflow-hidden relative">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />

      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center z-10"
      >
        <div className="relative flex justify-center mb-8">
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-3xl backdrop-blur-xl shadow-2xl relative">
            <ShieldAlert size={64} className="text-red-500" />
            <MotionDiv 
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 bg-red-500 text-[#020617] p-1.5 rounded-lg"
            >
              <Lock size={16} strokeWidth={3} />
            </MotionDiv>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">
            Access <span className="text-red-500">Denied</span>
          </h1>
          <div className="h-1 w-20 bg-red-500/50 mx-auto rounded-full" />
          
          <p className="text-slate-400 text-sm leading-relaxed max-w-[320px] mx-auto">
            Your current security clearance does not allow access to this sector. 
            Please contact a <span className="text-blue-400 font-bold">CSO Officer</span> if you believe this is an error.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-semibold"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Return to Previous
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all font-bold"
          >
            <Home size={18} />
            Go to Dashboard
          </button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.3em]">
            ORSYS Security Protocol v1.0
          </p>
          <div className="flex gap-1">
            {/* 3. Fix S7723 & S6479 by mapping over a constant array with unique keys */}
            {systemBars.map((barId) => (
              <div key={barId} className="h-1 w-4 bg-slate-800 rounded-full" />
            ))}
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default Unauthorized;
