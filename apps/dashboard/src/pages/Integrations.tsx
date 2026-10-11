import React, { useState } from 'react';
import { Key, Copy, Check, RefreshCw, Eye, EyeOff, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';

export const Integrations: React.FC = () => {
  const [apiKey, setApiKey] = useState('cs_live_9d28a1c9e83f0b4d7e21a88b43');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://internal-soc.domain.org/webhooks/cybershield');
  const [webhookSaved, setWebhookSaved] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateKey = () => {
    const chars = '0123456789abcdef';
    let key = 'cs_live_';
    for (let i = 0; i < 28; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(key);
  };

  const codeSnippet = `curl -X POST http://localhost:5000/api/v1/analysis \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://suspicious-target.xyz/login", "source": "api"}'`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Key className="w-4 h-4 text-cyan-400" />
          API TOKENS & WEBHOOK INGESTION
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Developer Integrations & Webhooks</h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Integrate CyberShield's zero-trust analysis engine into your CI/CD pipelines, SOAR playbooks, or SIEM tools.
        </p>
      </div>

      {/* API Key Management */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Live Telemetry API Key</h3>
          <p className="text-xs text-slate-400">Use this secret key to authenticate programmatic requests from backend services.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 font-mono text-xs text-cyan-300">
            <span>{showKey ? apiKey : '••••••••••••••••••••••••••••••••••••••••'}</span>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-slate-400 hover:text-white transition ml-2"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={copyToClipboard}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-900 border border-slate-750 hover:border-cyan-500/50 text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Copy Key'}</span>
            </button>
            <button
              onClick={regenerateKey}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-300 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rotate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" /> Quickstart Curl Request
          </h3>
          <span className="text-[10px] font-mono text-slate-400">cURL / REST</span>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-850 text-xs text-cyan-300 font-mono overflow-x-auto">
          {codeSnippet}
        </pre>
      </div>

      {/* SIEM Webhook Dispatcher */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">SIEM / SOC Webhook Alerting</h3>
          <p className="text-xs text-slate-400">CyberShield will dispatch JSON payloads to this endpoint on every High or Critical incident.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            onClick={() => {
              setWebhookSaved(true);
              setTimeout(() => setWebhookSaved(false), 2500);
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shrink-0"
          >
            {webhookSaved ? 'Webhook Saved!' : 'Save Webhook'}
          </button>
        </div>
      </div>
    </div>
  );
};
