import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Check, Plus, Trash2, FolderHeart, Info, Upload } from 'lucide-react';
import api from '../../services/authService';

interface BrandKitWorkspaceProps {
  workspaceId: string;
  onSaveSuccess: (kitId: string) => void;
}

const BrandKitWorkspace: React.FC<BrandKitWorkspaceProps> = ({
  workspaceId,
  onSaveSuccess
}) => {
  const [brandName, setBrandName] = useState('My Brand');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#a855f7');
  const [writingStyle, setWritingStyle] = useState('Professional, authoritative, yet casual and accessible.');
  const [mission, setMission] = useState('Help creators automate multi-platform marketing assets effortlessly.');
  const [targetAudience, setTargetAudience] = useState('SaaS Founders, Content Creators, and Digital Marketers.');
  const [products, setProducts] = useState<Array<{ name: string; description: string; cta: string }>>([
    { name: 'ContentKit AI Pro', description: 'AI content repurposing engine', cta: 'Claim your 14-day free trial' }
  ]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdCta, setNewProdCta] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveDone, setSaveDone] = useState(false);

  // Load existing brand kit on boot
  useEffect(() => {
    const loadBrandKit = async () => {
      try {
        const response = await api.get(`/brandkit/default`);
        if (response.data) {
          setBrandName(response.data.brandName);
          setLogoUrl(response.data.logoUrl);
          setPrimaryColor(response.data.primaryColor);
          setSecondaryColor(response.data.secondaryColor);
          setWritingStyle(response.data.writingStyle);
          setMission(response.data.mission);
          setTargetAudience(response.data.targetAudience);
          setProducts(response.data.products || []);
        }
      } catch (err) {
        console.log('No brand kit found yet, using defaults.');
      }
    };
    loadBrandKit();
  }, [workspaceId]);

  const addProduct = () => {
    if (!newProdName || !newProdDesc) return;
    setProducts(prev => [...prev, { name: newProdName, description: newProdDesc, cta: newProdCta }]);
    setNewProdName('');
    setNewProdDesc('');
    setNewProdCta('');
  };

  const removeProduct = (idx: number) => {
    setProducts(prev => prev.filter((_, i) => i !== idx));
  };

  const saveBrandKit = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('/brandkit', {
        workspaceId,
        brandName,
        logoUrl,
        primaryColor,
        secondaryColor,
        writingStyle,
        mission,
        targetAudience,
        products
      });
      setSaveDone(true);
      onSaveSuccess(response.data._id);
      setTimeout(() => setSaveDone(false), 2000);
    } catch (err) {
      console.error(err);
      alert('Failed to save brand kit.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Brand Kit Identity</h2>
          <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Configure your brand style, color palettes, and offers to ground all generated copy.</p>
        </div>

        <button
          onClick={saveBrandKit}
          disabled={isSaving}
          className="flex items-center space-x-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          {saveDone ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'Saving...' : saveDone ? 'Saved Brand' : 'Save Brand Kit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Left Form: Identity and Tones */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Core Specifications</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Brand Logo URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://logo.url/logo.png"
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Brand Mission Statement</label>
              <textarea
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                rows={2}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Target Audience Avatar</label>
              <textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={2}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">Writing Style & Guidelines</label>
              <textarea
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Product Offerings Catalog */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Products & Offerings Catalog</h3>

            {/* List */}
            <div className="space-y-3">
              {products.map((prod, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-2xl flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{prod.name}</h4>
                    <p className="text-gray-500 mt-0.5">{prod.description}</p>
                    {prod.cta && <span className="text-[10px] font-semibold text-indigo-500 mt-1 block">CTA: {prod.cta}</span>}
                  </div>
                  <button onClick={() => removeProduct(idx)} className="text-gray-400 hover:text-red-500 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add product form */}
            <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/30 border border-gray-200 dark:border-zinc-800/80 rounded-2xl space-y-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Add Product / Offer</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Product name"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Primary CTA Link or text"
                  value={newProdCta}
                  onChange={(e) => setNewProdCta(e.target.value)}
                  className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Product description and core value proposition..."
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 rounded-xl p-3.5 text-xs focus:outline-none"
              />
              <button 
                onClick={addProduct} 
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Save Offer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Colors, Fonts & Memory Preview */}
        <div className="space-y-6">
          {/* Colors */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Color Palette & Fonts</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-semibold uppercase">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <span className="text-xs font-semibold uppercase">{secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Memory Indicator */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-3xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <FolderHeart className="h-5 w-5 text-indigo-500" />
              <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Training Status</h4>
            </div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed">
              When launching a campaign, the **RAG memory module** automatically extracts the saved brand voice elements, target audience guidelines, and CTAs to align the generated copy dynamically.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BrandKitWorkspace;
