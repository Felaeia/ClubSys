import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../api/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, ShieldCheck, 
  Palette, Coins, Loader2, Layers, Eye, Zap, AlignLeft, AlertCircle
} from 'lucide-react';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // New state for validation errors
  const [files, setFiles] = useState({ logo: null, currency: null });
  const [previews, setPreviews] = useState({ logo: null, currency: null });
  const [formData, setFormData] = useState({
    groupName: '',
    groupAcronym: '',
    description: '',
    groupType: 'Organization',
    primaryColor: '#003366',
    secondaryColor: '#FFD700',
    currencyName: ''
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setError(''); // Clear error when user selects a file
      setFiles(prev => ({ ...prev, [type]: file }));
      setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  useEffect(() => {
    return () => {
      if (previews.logo) URL.revokeObjectURL(previews.logo);
      if (previews.currency) URL.revokeObjectURL(previews.currency);
    };
  }, [previews]);

  const uploadImage = async (file, path) => {
    if (!file) return "";
    const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // MANDATORY LOGO VALIDATION
    if (!files.logo) {
      setError("An official Organization Logo is required to initialize deployment.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uploadedLogoUrl = await uploadImage(files.logo, 'group_logos');
      const uploadedCurrencyUrl = await uploadImage(files.currency, 'currency_logos');

      await addDoc(collection(db, 'groups'), {
        ...formData,
        logoUrl: uploadedLogoUrl,
        currencyLogoUrl: uploadedCurrencyUrl,
        groupCreated: serverTimestamp(),
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        },
        stats: {
          totalMembersCount: 0,
          totalCurrencyCirculating: 0,
          totalItemsSold: 0,
          totalActivityPoints: 0
        }
      });
      navigate('/superadmin/registry');
    } catch (error) {
      console.error("Deployment Failed:", error);
      setError("Deployment failed. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Deploy New Entity</h1>
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">ORSYS Organization Registry</p>
        </div>
      </div>

      {/* ERROR MESSAGE ALERT */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CORE IDENTITY */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl space-y-6">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <ShieldCheck size={16} className="text-blue-500" /> Core Identity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="groupName" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Name</label>
              <input id="groupName" required placeholder="e.g. Computer Studies Organization" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, groupName: e.target.value})} />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="groupAcronym" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Acronym</label>
              <input id="groupAcronym" required placeholder="CSO" className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 uppercase"
                onChange={(e) => setFormData({...formData, groupAcronym: e.target.value})} />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="groupType" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Layers size={12} className="text-blue-400" /> Classification
              </label>
              <select id="groupType" value={formData.groupType} className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, groupType: e.target.value})}>
                <option value="Organization">Organization</option>
                <option value="Club">Club</option>
                <option value="House">House</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <AlignLeft size={12} className="text-blue-400" /> Description
              </label>
              <textarea 
                id="description" 
                required 
                placeholder="Briefly explain the mission and goals of this entity..." 
                className="w-full bg-[#020617] border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-blue-500/50 transition-all min-h-[120px] resize-none placeholder:text-slate-700"
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="logoUpload" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Eye size={12} className="text-blue-500" /> Organization Logo Asset <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <div className={`h-32 w-32 rounded-3xl bg-slate-900 border ${!files.logo && error ? 'border-red-500/50 animate-pulse' : 'border-white/10'} flex items-center justify-center overflow-hidden shrink-0`}>
                {previews.logo ? (
                  <img src={previews.logo} alt="Preview" className="w-full h-full object-contain p-2" />
                ) : (
                  <ShieldCheck className={!files.logo && error ? 'text-red-500/20' : 'text-slate-800'} size={32} />
                )}
              </div>
              <label htmlFor="logoUpload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed ${!files.logo && error ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-white/5'} rounded-3xl cursor-pointer hover:bg-white/10 transition-all`}>
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className={`${!files.logo && error ? 'text-red-500' : 'text-slate-500'} mb-2`} size={20} />
                  <p className={`text-[9px] uppercase font-black px-4 ${!files.logo && error ? 'text-red-500' : 'text-slate-500'}`}>
                    {files.logo ? files.logo.name : "Choose Official Seal"}
                  </p>
                </div>
                <input id="logoUpload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
              </label>
            </div>
          </div>
        </div>

        {/* ECONOMY & THEME */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Coins size={16} className="text-emerald-500" /> Tokenomics
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0">
                  {previews.currency ? (
                    <img src={previews.currency} alt="Coin" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Zap className="text-slate-800" size={20} />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <label htmlFor="currencyName" className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Currency Name</label>
                  <input id="currencyName" className="w-full bg-[#020617] border border-white/10 rounded-xl py-3 px-4 text-white text-sm outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="e.g. Bytecoin"
                    onChange={(e) => setFormData({...formData, currencyName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="currencyUpload" className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Upload</label>
                <input id="currencyUpload" type="file" accept="image/*" className="text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-black file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 cursor-pointer w-full"
                  onChange={(e) => handleFileChange(e, 'currency')} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-xl">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
              <Palette size={16} className="text-purple-500" /> Branding
            </h2>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label htmlFor="primaryColor" className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center block">Primary</label>
                <input id="primaryColor" type="color" value={formData.primaryColor} className="w-full h-12 bg-transparent rounded-xl cursor-pointer"
                  onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} />
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="secondaryColor" className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center block">Secondary</label>
                <input id="secondaryColor" type="color" value={formData.secondaryColor} className="w-full h-12 bg-transparent rounded-xl cursor-pointer"
                  onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/20">
          {loading ? <Loader2 className="animate-spin" /> : "Initialize Entity Deployment"}
        </button>
      </form>
    </div>
  );
};

export default CreateGroup;