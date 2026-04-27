import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db, storage } from '../../api/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  User, 
  ShieldCheck, 
  Camera,
  Loader2,
  Edit3,
  Save,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

// Import sub-components from the new file
import { DataRow, Badge, StatBox } from './UserProfileComponents';

const MotionDiv = motion.div;

const UserProfile = () => {
  const { profile, loading, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const fileInputRef = useRef(null);

  const toggleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
      setFormData(null);
    } else {
      setFormData({ ...profile });
      setIsEditing(true);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', msg: 'Image must be under 2MB' });
      return;
    }

    setSaving(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        profilePictureUrl: downloadURL,
        hasProfilePic: true
      });

      setStatus({ type: 'success', msg: 'Profile picture updated!' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Upload failed: ' + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setIsEditing(false);
      setFormData(null);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Update failed: ' + err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    }
  };

  const renderValue = (value, fallback = "---") => {
    if (value === undefined || value === null || value === "") {
      return <span className="text-slate-600 italic">{fallback}</span>;
    }
    if (typeof value === 'object' && value.toDate) {
      return value.toDate().toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      });
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">
            Synchronizing Vanguard Systems...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdate} className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* HEADER CONTROLS */}
      <div className="flex justify-end items-center gap-4">
        {status.msg && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {status.msg}
          </motion.div>
        )}
        
        <button 
          type="button"
          onClick={toggleEdit}
          className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
            isEditing ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isEditing ? <><XCircle size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
        </button>

        {isEditing && (
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        )}
      </div>

      {/* IDENTITY & RANK CARD */}
      <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl relative">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="relative group">
            <div className="w-44 h-44 rounded-[2.5rem] border-4 border-blue-600/20 overflow-hidden bg-slate-900 shadow-2xl">
               <img 
                 src={profile?.hasProfilePic ? profile.profilePictureUrl : 'https://via.placeholder.com/150'} 
                 alt="Profile" 
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
               />
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()}
              disabled={saving}
              className="absolute -bottom-2 -right-2 p-4 bg-blue-600 rounded-2xl text-white shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            </button>
          </div>

          <div className="text-center md:text-left space-y-4 flex-1">
             <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
                  {renderValue(profile?.firstName)} {renderValue(profile?.lastName)}
                </h1>
                <p className="text-blue-400 font-bold text-sm mt-1 uppercase tracking-widest opacity-80">
                  {renderValue(profile?.course)} • {renderValue(profile?.yearLevel, "Year Pending")}
                </p>
             </div>
             <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge label={profile?.userRole || 'Member'} color="blue" />
                <Badge label={`HOUSE: ${profile?.houseId || 'NONE'}`} color="purple" />
             </div>
          </div>

          <div className="flex gap-4">
             <StatBox label="Vantage XP" value={renderValue(profile?.aclcXp, "0")} color="text-blue-500" />
             <StatBox label="Rank" value={`#${renderValue(profile?.rank, "N/A")}`} color="text-emerald-500" />
          </div>
        </div>
      </section>

      {/* SYSTEM DATA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionDiv className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <User size={18} className="text-blue-500" /> Identity Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <DataRow 
                label="First Name" 
                value={isEditing ? formData?.firstName : profile?.firstName} 
                isEditing={isEditing}
                onChange={(v) => setFormData({...formData, firstName: v})}
              />
              <DataRow 
                label="Last Name" 
                value={isEditing ? formData?.lastName : profile?.lastName} 
                isEditing={isEditing}
                onChange={(v) => setFormData({...formData, lastName: v})}
              />
              <DataRow 
                label="Middle Name" 
                value={isEditing ? formData?.middleName : profile?.middleName} 
                isEditing={isEditing}
                onChange={(v) => setFormData({...formData, middleName: v})}
              />
              <DataRow 
                label="Student ID" 
                value={isEditing ? formData?.studentId : profile?.studentId} 
                isEditing={isEditing}
                onChange={(v) => setFormData({...formData, studentId: v})}
              />
              <DataRow 
                label="Date of Birth" 
                value={isEditing ? formData?.dateOfBirth : renderValue(profile?.dateOfBirth)} 
                isEditing={isEditing}
                onChange={(v) => setFormData({...formData, dateOfBirth: v})}
              />
            </div>
          </div>
        </MotionDiv>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <ShieldCheck size={18} className="text-emerald-500" /> Hardware Sync
            </h3>
            <div className="space-y-6">
              <DataRow label="Biometric Status" value={profile?.isBiometricRegistered ? "🟢 ACTIVE" : "🔴 UNLINKED"} />
              <DataRow label="Biometric ID" value={renderValue(profile?.biometricId, "0000")} />
              
              <div className="pt-4 border-t border-white/5">
                <div className="p-4 bg-[#020617] rounded-2xl border border-white/5 text-center">
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Lifetime Points</p>
                  <p className="text-2xl font-black text-white">{renderValue(profile?.totalPointsEarned, "0")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default UserProfile;