import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  Server
} from 'lucide-react';
import { api } from '../services/api';

export const ThreatIntelligence: React.FC = () => {
  const [providers, setProviders] = useState<any>(null);
  const [queryTarget, setQueryTarget] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const data = await api.getThreatProviders();
      setProviders(data);
    } catch (err: any) {
      console.error('Failed to load threat providers:', err);
    } finally {
      setLoadingProviders(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryTarget.trim()) return;

    setLookupLoading(true);
    setError('');
    setLookupResult(null);

    try {
      const res = await api.lookupThreatIntel(queryTarget.trim());
      setLookupResult(res);
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            GLOBAL THREAT INTELLIGENCE NETWORKS
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Threat Feeds & Provider Telemetry</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Live integration health, API connectivity indicators, and real-time blacklists from leading threat intelligence authorities.
          </p>
        </div>

        <button
          onClick={fetchProviders}
          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition self-start md:self-auto"
          title="Refresh Provider Health"
        >
          <RefreshCw className={`w-4 h-4 ${loadingProviders ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Provider Connectivity Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Google Safe Browsing */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Google Safe Browsing</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              providers?.safeBrowsing?.configured
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {providers?.safeBrowsing?.status || 'Active'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            API v4 Threat Matches index covering social engineering, malware binaries, and harmful web applications.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>Cache Strategy:</span>
            <span className="text-slate-300">2-Hour TTL / MongoDB</span>
          </div>
        </div>

        {/* VirusTotal */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">VirusTotal API v3</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              providers?.virusTotal?.configured
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {providers?.virusTotal?.status || 'Active'}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-engine consensus telemetry evaluating URL reputations across 70+ cybersecurity vendor databases.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>Threshold:</span>
            <span className="text-slate-300">&gt;= 3 Positives Flagged</span>
          </div>
        </div>

        {/* Native DNS Audit */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Recursive DNS Resolver</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              Active / Native
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Validates authoritative nameservers, IPv4 host mappings, and MX mail exchange infrastructure.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between font-mono">
            <span>NXDOMAIN Trap:</span>
            <span className="text-slate-300">Enabled</span>
          </div>
        </div>
      </div>

      {/* Direct Threat Intelligence Lookup */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            Query Threat Intelligence Cache & Providers
          </h3>
          <p className="text-xs text-slate-400">Perform direct ad-hoc queries against upstream threat providers for any domain or IP.</p>
        </div>

        <form onSubmit={handleLookup} className="flex gap-3">
          <input
            type="text"
            value={queryTarget}
            onChange={(e) => setQueryTarget(e.target.value)}
            placeholder="Enter target domain or URL (e.g. suspicious-portal.xyz)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            disabled={lookupLoading || !queryTarget.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
          >
            {lookupLoading ? 'Querying...' : 'Query Intel'}
          </button>
        </form>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Lookup Results */}
        {lookupResult && (
          <div className="p-5 rounded-xl bg-slate-900/70 border border-cyan-900/40 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-white">{lookupResult.target}</span>
              <span className={`text-xs font-mono px-2.5 py-1 rounded-full font-bold border ${
                lookupResult.confirmedThreat ? 'bg-red-500/20 text-red-400 border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}>
                {lookupResult.confirmedThreat ? 'CONFIRMED MALICIOUS THREAT' : 'NO THREAT LISTED IN FEED'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                <span className="font-semibold text-slate-300">Safe Browsing Feed:</span>
                <p className="text-slate-400">{lookupResult.safeBrowsing?.details}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                <span className="font-semibold text-slate-300">VirusTotal Telemetry:</span>
                <p className="text-slate-400">{lookupResult.virusTotal?.details}</p>
              </div>
            </div>

            {/* DNS Records */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 space-y-2 text-xs">
              <span className="font-semibold text-slate-300">DNS Resolution Records:</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500">A Records:</span> {lookupResult.dnsLookup?.ipAddresses?.join(', ') || 'None'}
                </div>
                <div>
                  <span className="text-slate-500">MX Records:</span> {lookupResult.dnsLookup?.mxRecords?.join(', ') || 'No MX records found'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
