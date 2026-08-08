import React from 'react';
import PropTypes from 'prop-types';

export const DataRow = ({ label, value, isFullWidth = false, isEditing = false, onChange }) => (
  <div className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}>
    <span className="block text-[10px] text-slate-500 font-black uppercase tracking-wider">{label}</span>
    {isEditing ? (
      <input 
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm text-white font-bold bg-blue-500/5 p-4 rounded-2xl border border-blue-500/30 outline-none focus:border-blue-500 transition-colors"
      />
    ) : (
      <div className="text-sm text-slate-200 font-bold bg-[#020617] p-4 rounded-2xl border border-white/5 truncate min-h-[54px] flex items-center">
        {value || <span className="text-slate-600 italic">---</span>}
      </div>
    )}
  </div>
);

DataRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  isFullWidth: PropTypes.bool,
  isEditing: PropTypes.bool,
  onChange: PropTypes.func
};

export const Badge = ({ label, color }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };
  return (
    <span className={`px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[color]}`}>
      {label}
    </span>
  );
};

Badge.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(['blue', 'purple', 'emerald']).isRequired
};

export const StatBox = ({ label, value, color }) => (
  <div className="bg-[#020617] p-5 rounded-[2rem] border border-white/5 text-center min-w-[140px]">
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

StatBox.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]).isRequired,
  color: PropTypes.string.isRequired
};