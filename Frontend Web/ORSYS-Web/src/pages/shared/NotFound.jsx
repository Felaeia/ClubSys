import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Ghost } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Visual Element */}
        <div className="relative flex justify-center">
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
          <div className="relative bg-slate-900/50 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
            <Ghost size={80} className="text-blue-500 animate-bounce" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-8xl font-black text-white tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-bold text-slate-200">
            Lost in the Aether?
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto">
            The page you are looking for doesn't exist or has been moved to another dimension.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-semibold"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all font-bold"
          >
            <Home size={18} />
            Return to Base
          </button>
        </div>

        {/* Branding Footer */}
        <div className="pt-8">
          <p className="text-[10px] text-slate-600 uppercase font-black tracking-[0.2em]">
            Vantage | Student Management Ecosystem
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;