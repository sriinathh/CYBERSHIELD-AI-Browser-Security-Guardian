import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ToggleLeft, 
  ToggleRight, 
  Compass, 
  Sliders, 
  Check, 
  Plus, 
  Trash2
} from 'lucide-react';

export const BrowserProtection: React.FC = () => {
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  const [phishingBlocker, setPhishingBlocker] = useState(true);
  const [homoglyphDefense, setHomoglyphDefense] = useState(true);
  const [unencryptedWarn, setUnencryptedWarn] = useState(true);
  const [sensitivity, setSensitivity] = useState<'standard' | 'high' | 'paranoid'>('high');
  const [whitelist, setWhitelist] = useState<string[]>([
    'google.com',
    'github.com',
    'wikipedia.org',
    'stackoverflow.com'
  ]);
  const [newDomain, setNewDomain] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const addWhitelistDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!whitelist.includes(clean)) {
      setWhitelist([...whitelist, clean]);
      setNewDomain('');
    }
  };

  const removeWhitelistDomain = (dom: string) => {
    setWhitelist(whitelist.filter(d => d !== dom));
  };

  const handleSavePreferences = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            CHROME EXTENSION RUNTIME POLICY
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Real-Time Browser Protection Controls</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Configure how the CyberShield Manifest V3 browser extension and backend heuristic filters handle active tab navigations and anomalous hosts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            protectionEnabled ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400' : 'bg-red-950/20 border-red-500/40 text-red-400'
          }`}>
            {protectionEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            <div>
              <div className="text-xs uppercase font-mono font-bold">
                {protectionEnabled ? 'ACTIVE SHIELD ON' : 'PROTECTION PAUSED'}
              </div>
              <div className="text-[10px] text-slate-400">
                {protectionEnabled ? 'Blocking high-risk vectors' : 'Telemetry disabled'}
              </div>
            </div>
            <button
              onClick={() => setProtectionEnabled(!protectionEnabled)}
              className="ml-2 text-white hover:text-cyan-400 transition"
            >
              {protectionEnabled ? <ToggleRight className="w-8 h-8 text-emerald-400" /> : <ToggleLeft className="w-8 h-8 text-slate-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Protection Modules & Extension State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Toggles */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Active Interception Modules
          </h3>

          <div className="space-y-3">
            {/* Phishing */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Zero-Day Phishing Interceptor</div>
                <div className="text-[11px] text-slate-400">Analyzes brand keywords, lexical length, and suspicious TLDs.</div>
              </div>
              <button onClick={() => setPhishingBlocker(!phishingBlocker)}>
                {phishingBlocker ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            {/* Homoglyph */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Punycode & Homoglyph Detection</div>
                <div className="text-[11px] text-slate-400">Flags deceptive Cyrillic/Greek lookalike domain characters.</div>
              </div>
              <button onClick={() => setHomoglyphDefense(!homoglyphDefense)}>
                {homoglyphDefense ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>

            {/* Unencrypted */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Unencrypted Auth Warning</div>
                <div className="text-[11px] text-slate-400">Alerts when authentication pages submit without TLS encryption.</div>
              </div>
              <button onClick={() => setUnencryptedWarn(!unencryptedWarn)}>
                {unencryptedWarn ? <ToggleRight className="w-7 h-7 text-cyan-400" /> : <ToggleLeft className="w-7 h-7 text-slate-600" />}
              </button>
            </div>
          </div>

          {/* Sensitivity Tier */}
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Sensitivity Threshold</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard (>=80)' },
                { id: 'high', label: 'Aggressive (>=70)' },
                { id: 'paranoid', label: 'Zero-Trust (>=50)' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSensitivity(tier.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    sensitivity === tier.id 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm' 
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chrome Extension Status */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Manifest V3 Extension Status
            </h3>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="text-slate-400">Extension Engine:</span>
                <span className="text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Ready & Packaged
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="text-slate-400">Target Manifest:</span>
                <span className="text-slate-200 font-mono">Chrome Manifest V3</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="text-slate-400">Telemetry Channel:</span>
                <span className="text-cyan-400 font-mono">http://localhost:5000/api/v1/analysis</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Offline Fallback:</span>
                <span className="text-slate-200 font-mono">Local Heuristic Engine Active</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-[11px] text-cyan-200 leading-relaxed space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>🚀 Load Extension in Chrome / Edge (3 Steps):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300">
                <li>Open <span className="font-mono text-cyan-300">chrome://extensions/</span> (or <span className="font-mono text-cyan-300">edge://extensions/</span>)</li>
                <li>Turn ON <span className="font-semibold text-white">Developer mode</span> (top right toggle)</li>
                <li>Click <span className="font-semibold text-white">Load unpacked</span> and select folder: <span className="font-mono text-cyan-300 bg-slate-950/80 px-1 py-0.5 rounded">apps/extension/dist</span></li>
              </ol>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-cyan-900/40">
                ⚡ The popup provides a 1-click switcher between <span className="text-white font-mono">Localhost (port 5000)</span> and <span className="text-white font-mono">Cloud Deployed API</span> with offline heuristic fallback.
              </p>
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md transition flex items-center justify-center gap-2"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : null}
            <span>{savedSuccess ? 'Policy Saved Successfully' : 'Save Protection Policy'}</span>
          </button>
        </div>
      </div>

      {/* Domain Whitelist Manager */}
      <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Domain Allowlist / Bypass Rules</h3>
          <p className="text-xs text-slate-400">Domains explicitly trusted to bypass aggressive heuristic flags</p>
        </div>

        <form onSubmit={addWhitelistDomain} className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="Add trusted domain (e.g. company-portal.internal.net)..."
            className="flex-1 bg-slate-900 border border-slate-750 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Domain
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {whitelist.map((dom) => (
            <div
              key={dom}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-200"
            >
              <span>{dom}</span>
              <button
                onClick={() => removeWhitelistDomain(dom)}
                className="text-slate-500 hover:text-red-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
