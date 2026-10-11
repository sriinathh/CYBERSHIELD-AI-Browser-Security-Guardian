import React, { useState, useEffect } from 'react';
import { Settings, Save, Check, Shield, Bell, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState(true);
  const [realtimeAlerts, setRealtimeAlerts] = useState(true);
  const [threshold, setThreshold] = useState('70');
  const [theme, setTheme] = useState('cyber-dark');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Attempt to load settings
    api.getMe().then(user => {
      if (user?.settings) {
        if (user.settings.notifications !== undefined) setRealtimeAlerts(user.settings.notifications);
        if (user.settings.telemetry !== undefined) setTelemetry(user.settings.telemetry);
        if (user.settings.alertThreshold !== undefined) setThreshold(String(user.settings.alertThreshold));
      }
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      await api.updateSettings({
        notifications: realtimeAlerts,
        telemetry,
        alertThreshold: parseInt(threshold, 10),
        theme
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Settings className="w-4 h-4 text-cyan-400" />
          SYSTEM CONFIGURATION
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Platform Preferences & Alert Rules</h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Tune your threat detection sensitivity, automated notification dispatches, and cloud telemetry sync.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Detection & Threshold Rules */}
        <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" /> Detection & Interception Rules
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Browser Telemetry Ingestion</div>
                <div className="text-[11px] text-slate-400">Stream anonymized tab navigation URLs to CyberShield for real-time inspection.</div>
              </div>
              <button type="button" onClick={() => setTelemetry(!telemetry)}>
                {telemetry ? <ToggleRight className="w-8 h-8 text-cyan-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Critical Risk Push Notifications</div>
                <div className="text-[11px] text-slate-400">Dispatch desktop and browser badge alerts immediately when high threats occur.</div>
              </div>
              <button type="button" onClick={() => setRealtimeAlerts(!realtimeAlerts)}>
                {realtimeAlerts ? <ToggleRight className="w-8 h-8 text-cyan-400" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-white">Alert Trigger Threshold</div>
                <div className="text-[11px] text-slate-400">Minimum risk score required to dispatch an immediate security notification.</div>
              </div>
              <select
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="50">Moderate (&gt;= 50 pts)</option>
                <option value="70">Aggressive (&gt;= 70 pts)</option>
                <option value="85">Strict Threats Only (&gt;= 85 pts)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md transition flex items-center gap-2"
          >
            {success ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving Changes...' : success ? 'Preferences Updated!' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
