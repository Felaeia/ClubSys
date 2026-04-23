import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../api/firebaseConfig';
import { 
  ChevronLeft, Save, ShieldCheck, 
  Trash2, Image as ImageIcon, Loader2, Upload, AlertTriangle, Coins,
  Layers, Palette
} from 'lucide-react';

const ConfigureOrganization = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [newFiles, setNewFiles] = useState({ logo: null, currency: null });
  
  const [formData, setFormData] = useState({
    groupName: '',
    groupAcronym: '',
    description: '',
    groupType: 'Organization', 
    logoUrl: '',
    currencyName: '',
    currencyLogoUrl: '',
    theme: { primaryColor: '#3b82f6', secondaryColor: '#64748b' }
  });

  useEffect(() => {
    const fetchOrg = async () => {
      if (!groupId) return;
      try {
        const docRef = doc(db, 'groups', groupId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({
            ...prev,
            ...data,
            theme: data.theme || prev.theme
          }));
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrg();
  }, [groupId]);

  const uploadImage = async (file, path) => {
    if (!file) return null;
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newLogoUrl = await uploadImage(newFiles.logo, 'group_logos');
      const newCurrencyUrl = await uploadImage(newFiles.currency, 'currency_logos');

      const updatedData = {
        ...formData,
        logoUrl: newLogoUrl || formData.logoUrl,
        currencyLogoUrl: newCurrencyUrl || formData.currencyLogoUrl,
      };

      await updateDoc(doc(db, 'groups', groupId), updatedData);
      alert("Registry Updated Successfully");
      navigate(`/superadmin/registry/view/${groupId}`);
    } catch (error) {
      console.error("Update Error:", error);
      alert("Update Failed: Check network connection.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteInput.trim().toUpperCase() !== formData.groupAcronym.trim().toUpperCase()) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'groups', groupId));
      alert("Record Purged from Registry");
      navigate('/superadmin/registry');
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Critical: Purge sequence failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-white text-center font-black uppercase animate-pulse">Accessing encrypted records...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Registry</span>
        </button>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Authority Verified</span>
        </div>
      </div>

      <header>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          Configure <span style={{ color: formData.theme.primaryColor }}>{formData.groupAcronym}</span>
        </h1>
      </header>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          {/* SEAL CONFIGURATION */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} /> Organization Seal
            </p>
            <div className="aspect-square bg-slate-950 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden p-8 relative group shadow-inner">
              <img src={newFiles.logo ? URL.createObjectURL(newFiles.logo) : formData.logoUrl} alt="logo" className="w-full h-full object-contain z-10" />
              <label htmlFor="logo-upload" className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20">
                <Upload size={24} className="mb-2 text-blue-400" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Upload New Seal</span>
              </label>
              <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setNewFiles({...newFiles, logo: e.target.files[0]})} />
            </div>
          </div>

          {/* CURRENCY CONFIGURATION */}
          <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2.5rem] space-y-4">
            <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-widest flex items-center gap-2">
              <Coins size={14} /> Currency Emblem
            </p>
            <div className="aspect-square bg-slate-950 rounded-3xl border border-emerald-500/10 flex items-center justify-center overflow-hidden p-10 relative group">
              <img src={newFiles.currency ? URL.createObjectURL(newFiles.currency) : formData.currencyLogoUrl} alt="currency" className="w-full h-full object-contain z-10" />
              <label htmlFor="currency-upload" className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20">
                <Upload size={24} className="mb-2 text-emerald-400" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Replace Emblem</span>
              </label>
              <input id="currency-upload" type="file" className="hidden" accept="image/*" onChange={(e) => setNewFiles({...newFiles, currency: e.target.files[0]})} />
            </div>
            <input 
              type="text" 
              placeholder="Currency Name"
              className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white text-xs font-bold uppercase tracking-tight"
              value={formData.currencyName} 
              onChange={(e) => setFormData({...formData, currencyName: e.target.value})}
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6 backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="groupName" className="text-[10px] font-black text-slate-500 uppercase ml-1">Official Designation</label>
                <input id="groupName" type="text" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all"
                  value={formData.groupName} onChange={(e) => setFormData({...formData, groupName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label htmlFor="groupAcronym" className="text-[10px] font-black text-slate-500 uppercase ml-1">Entity groupAcronym</label>
                <input id="groupAcronym" type="text" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white uppercase outline-none focus:border-blue-500/50 transition-all"
                  value={formData.groupAcronym} onChange={(e) => setFormData({...formData, groupAcronym: e.target.value})} />
              </div>

              {/* REGISTRY CLASSIFICATION */}
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="groupType" className="text-[10px] font-black text-slate-500 uppercase ml-1 flex items-center gap-2">
                  <Layers size={12} className="text-blue-400" /> Registry Classification
                </label>
                <div className="relative">
                  <select 
                    id="groupType" 
                    value={formData.groupType} 
                    className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                    onChange={(e) => setFormData({...formData, groupType: e.target.value})}
                  >
                    <option value="Organization">Organization</option>
                    <option value="Club">Club</option>
                    <option value="House">House</option>
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <ChevronLeft size={16} className="-rotate-90" />
                  </div>
                </div>
              </div>

              {/* VISUAL IDENTITY PROFILE (Updated with Hex Display) */}
              <div className="md:col-span-2 bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Palette size={14} className="text-purple-500" /> Visual Identity Profile
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {/* Primary Color Picker */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="primaryColor" className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Primary Accent</label>
                        <span className="text-[9px] font-mono font-bold text-blue-400 uppercase">{formData.theme.primaryColor}</span>
                    </div>
                    <input 
                      id="primaryColor"
                      type="color" 
                      className="w-full h-14 bg-[#020617] cursor-pointer rounded-2xl border border-white/10 p-1 hover:border-white/20 transition-all"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData({
                        ...formData, 
                        theme: { ...formData.theme, primaryColor: e.target.value }
                      })}
                    />
                  </div>
                  {/* Secondary Color Picker */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <label htmlFor="secondaryColor" className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Secondary Accent</label>
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">{formData.theme.secondaryColor}</span>
                    </div>
                    <input 
                      id="secondaryColor"
                      type="color" 
                      className="w-full h-14 bg-[#020617] cursor-pointer rounded-2xl border border-white/10 p-1 hover:border-white/20 transition-all"
                      value={formData.theme.secondaryColor}
                      onChange={(e) => setFormData({
                        ...formData, 
                        theme: { ...formData.theme, secondaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label htmlFor="description" className="text-[10px] font-black text-slate-500 uppercase ml-1">Mission Briefing / Description</label>
                <textarea id="description" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white min-h-[120px] outline-none focus:border-blue-500/50 transition-all"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-900/20">
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Synchronizing...' : 'Commit Changes'}
              </button>
              
              <button 
                type="button" 
                onClick={() => setShowDeleteConfirm(true)} 
                className="px-6 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* DECOMMISSIONING PROTOCOL */}
          {showDeleteConfirm && (
            <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle size={24} />
                <h3 className="font-black uppercase tracking-tighter text-xl">Decommissioning Protocol</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                You are about to purge <span className="text-white font-bold">{formData.groupName}</span>. This action is irreversible.
              </p>
              <div className="space-y-3">
                <label htmlFor="confirm-purge" className="text-[9px] font-black text-red-500/50 uppercase tracking-[0.2em]">
                  Type <span className="text-red-500 underline">{formData.groupAcronym}</span> to authorize
                </label>
                <div className="flex gap-3">
                  <input 
                    id="confirm-purge"
                    type="text" 
                    className="flex-1 bg-[#020617] border border-red-500/20 rounded-xl py-3 px-6 text-white focus:border-red-500 outline-none"
                    placeholder="Enter group acronym..."
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteInput.trim().toUpperCase() !== formData.groupAcronym.trim().toUpperCase() || saving}
                    className="px-8 bg-red-600 hover:bg-red-500 disabled:opacity-20 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                  >
                    Confirm Purge
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ConfigureOrganization;