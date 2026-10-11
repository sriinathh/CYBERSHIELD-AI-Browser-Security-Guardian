import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  Sparkles, 
  Server, 
  Mail, 
  History, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export const DomainIntelligence: React.FC = () => {
  const [domainInput, setDomainInput] = useState('github.com');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDomainReport = async (dom?: string) => {
    const target = (dom || domainInput).trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!target) return;

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const data = await api.getDomainReport(target);
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Domain intelligence lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const sampleDomains = ['github.com', 'google.com', 'paypal.com', 'wikipedia.org'];

  React.useEffect(() => {
    fetchDomainReport('github.com');
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Globe className="w-4 h-4 text-cyan-400" />
          AUTHORITATIVE DOMAIN TELEMETRY & DNS RECON
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Domain Intelligence Center</h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Deep-dive reconnaissance investigating apex domain records, recursive DNS resolution, mail exchange servers, and historical reputation across CyberShield.
        </p>
      </div>

      {/* Query Bar */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDomainReport();
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="Enter root domain or hostname (e.g. cloudflare.com)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            disabled={loading || !domainInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Auditing...' : 'Investigate Domain'}
          </button>
        </form>

        <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
          <span className="font-mono text-[11px]">Quick Audits:</span>
          {sampleDomains.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDomainInput(d);
                fetchDomainReport(d);
              }}
              className="text-cyan-300 hover:underline font-mono"
            >
              {d}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300">
            {error}
          </div>
        )}
      </div>

      {/* Report Display */}
      {report && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Card */}
          <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/40 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">Audited Apex Domain</span>
                <h3 className="text-2xl font-bold text-white font-mono">{report.domain}</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                  Historical Scans: <strong className="text-white">{report.historicalCount || 0}</strong>
                </span>
                <span className={`text-xs px-3 py-1 rounded-full border font-mono font-bold ${
                  report.dnsLookup?.resolved
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-400 border-red-500/40'
                }`}>
                  {report.dnsLookup?.resolved ? 'DNS Active' : 'NXDOMAIN / Unresolved'}
                </span>
              </div>
            </div>

            {/* AI Domain Briefing */}
            {report.aiSummary && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-cyan-950/20 border border-cyan-800/30 space-y-1.5 text-xs">
                <span className="text-cyan-300 font-semibold font-mono flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> AI Domain Investigation Brief
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">{report.aiSummary}</p>
              </div>
            )}

            {/* Technical DNS Records Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* IPv4 A Records */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Authoritative IPv4 A Records ({report.dnsLookup?.ipAddresses?.length || 0})
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar font-mono text-xs">
                  {(!report.dnsLookup?.ipAddresses || report.dnsLookup.ipAddresses.length === 0) ? (
                    <span className="text-slate-500">No public A records returned.</span>
                  ) : (
                    report.dnsLookup.ipAddresses.map((ip: string, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-cyan-300">
                        {ip}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* MX Mail Exchange Records */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 uppercase font-mono flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  Mail Exchange (MX) Infrastructure ({report.dnsLookup?.mxRecords?.length || 0})
                </span>
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar font-mono text-xs">
                  {(!report.dnsLookup?.mxRecords || report.dnsLookup.mxRecords.length === 0) ? (
                    <span className="text-slate-500">No configured MX records. Domain may not accept mail.</span>
                  ) : (
                    report.dnsLookup.mxRecords.map((mx: string, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-indigo-300">
                        {mx}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Historical Observations */}
            {report.recentScans && report.recentScans.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300 font-mono uppercase">Past Telemetry Records on this Domain</span>
                <div className="space-y-1.5">
                  {report.recentScans.map((s: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-850 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 truncate max-w-md">{s.url}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.score >= 70 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        Score: {s.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
