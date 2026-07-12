import React, { useState } from 'react';
import { CreditCard, Key, Shield, Check, Plus, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

interface BillingAndSettingsProps {
  credits: number;
  addCredits: (amount: number) => void;
  onUpgradePlan: (plan: string) => void;
  currentPlan: string;
}

const BillingAndSettings: React.FC<BillingAndSettingsProps> = ({
  credits,
  addCredits,
  onUpgradePlan,
  currentPlan
}) => {
  const [apiKeys, setApiKeys] = useState<Array<{ name: string; prefix: string; created: string }>>([
    { name: 'Live Webhook API', prefix: 'ck_live_a12B...cd89', created: '2026-07-01' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState('');

  const createApiKey = () => {
    if (!newKeyName.trim()) return;
    const prefix = `ck_live_${Math.random().toString(36).substr(2, 6)}...${Math.random().toString(36).substr(2, 4)}`;
    setApiKeys(prev => [...prev, { name: newKeyName, prefix, created: new Date().toISOString().split('T')[0] }]);
    setNewKeyName('');
  };

  const deleteKey = (idx: number) => {
    setApiKeys(prev => prev.filter((_, i) => i !== idx));
  };

  const triggerCheckout = (planName: string) => {
    setCheckoutPlan(planName);
    setShowCheckout(true);
  };

  const completeStripePurchase = () => {
    onUpgradePlan(checkoutPlan);
    addCredits(10000); // Give 10,000 top up credits
    setShowCheckout(false);
  };

  const auditLogs = [
    { action: 'PROJECT_CREATE', user: 'admin@contentkit.com', date: '2026-07-11 21:50', ip: '192.168.1.1' },
    { action: 'BRANDKIT_UPDATE', user: 'admin@contentkit.com', date: '2026-07-11 18:22', ip: '192.168.1.1' },
    { action: 'API_KEY_ROTATE', user: 'admin@contentkit.com', date: '2026-07-10 14:02', ip: '192.168.1.5' }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Billing & Settings</h2>
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Configure subscription plans, API keys, SSO, and audit logs.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        
        {/* Left column: Plans and Billing */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-indigo-500" />
                <span>Subscription Plans</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide px-2.5 py-0.5 bg-indigo-50 dark:bg-zinc-800 rounded-md">
                Active Plan: {currentPlan}
              </span>
            </div>

            {/* Grid of Plans */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Starter', price: '$29/mo', credits: '10,000', desc: 'Perfect for individual creators' },
                { name: 'Pro', price: '$99/mo', credits: '50,000', desc: 'Ideal for growing marketing teams' }
              ].map((plan) => (
                <div 
                  key={plan.name}
                  className={`p-5 rounded-2xl border transition-all ${
                    currentPlan.toUpperCase() === plan.name.toUpperCase()
                      ? 'border-indigo-500 bg-indigo-500/5'
                      : 'border-gray-200 dark:border-zinc-850 hover:border-indigo-500/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-extrabold">{plan.name}</h4>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{plan.price}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">{plan.desc}</p>
                  <span className="text-[10px] font-bold text-gray-500 block mb-4">✨ Includes {plan.credits} credits / mo</span>

                  <button
                    onClick={() => triggerCheckout(plan.name)}
                    disabled={currentPlan.toUpperCase() === plan.name.toUpperCase()}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 dark:disabled:bg-zinc-800 disabled:text-gray-400 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    {currentPlan.toUpperCase() === plan.name.toUpperCase() ? 'Active plan' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>

            {/* Credit top up */}
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">Need more generation credits?</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Current balance: {credits.toLocaleString()} credits</p>
              </div>
              <button 
                onClick={() => addCredits(5000)}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
              >
                + 5,000 credits ($15)
              </button>
            </div>
          </div>

          {/* Dev API Keys */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <Key className="h-4 w-4 text-indigo-500" />
              <span>Developer API Keys</span>
            </h3>

            {/* List keys */}
            <div className="space-y-3">
              {apiKeys.map((k, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 rounded-2xl text-xs font-semibold">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{k.name}</h4>
                    <span className="text-[10px] font-mono text-gray-400 mt-0.5 block">{k.prefix}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px]">
                    <span className="text-gray-400">Created: {k.created}</span>
                    <button onClick={() => deleteKey(idx)} className="text-red-500 hover:underline">Revoke</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Key Form */}
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Key name (e.g., Vercel Integration)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1 text-xs bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none"
              />
              <button 
                onClick={createApiKey}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Audit logs and SSO */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Workspace Security</h3>
            </div>
            
            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/30 rounded-2xl">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide block mb-1">SOC 2 Readiness</span>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-normal">
                Continuous compliance monitoring, automated log auditing, and Workspace SSO are enabled by default for all business contracts.
              </p>
            </div>

            {/* Audit Logs list */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Security Event Log</span>
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 rounded-2xl text-[10px]">
                  <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 mb-0.5">
                    <span>{log.action}</span>
                    <span className="text-gray-400 font-medium">{log.date}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{log.user}</span>
                    <span>{log.ip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Stripe Checkout overlay simulation */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center animate-fade-in z-10">
            <div className="h-12 w-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-black tracking-tight mb-1">Stripe Checkout</h3>
            <p className="text-xs text-gray-400 mb-6">Upgrade your workspace to ContentKit {checkoutPlan}</p>

            {/* Mock Credit Card Inputs */}
            <div className="w-full space-y-3 text-left mb-6">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Card number</label>
                <div className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono select-none">
                  4242  4242  4242  4242
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Expires</label>
                  <div className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono select-none">
                    12 / 29
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">CVC</label>
                  <div className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono select-none">
                    ***
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex space-x-3">
              <button 
                onClick={() => setShowCheckout(false)} 
                className="flex-1 py-2.5 border border-gray-200 dark:border-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={completeStripePurchase} 
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BillingAndSettings;
