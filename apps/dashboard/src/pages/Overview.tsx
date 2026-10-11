import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Globe, 
  Search, 
  Activity, 
  Sparkles, 
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import { api } from '../services/api';

interface OverviewProps {
  openCopilot: () => void;
}

export const Overview: React.FC<OverviewProps> = ({ openCopilot }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [incidentBrief, setIncidentBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [statsData, historyData, briefData] = await Promise.all([
        api.getStats(timeframe),
        api.getHistory({ limit: 5 }),
        api.getIncidentSummary()
      ]);
      setStats(statsData);
      setRecentScans(historyData);
      setIncidentBrief(briefData);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [timeframe]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Security Health Score */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 p-6 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              CYBERSHIELD ACTIVE DEFENSE ENGINE
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Real-Time Threat Telemetry Console</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Zero-trust heuristic inspection, calibrated machine learning risk probability, and upstream threat intelligence actively monitoring browser navigation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition"
            >
              <Search className="w-4 h-4" />
              Run New Scan
            </Link>
            <button
              onClick={openCopilot}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 font-medium text-xs transition"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Copilot Briefing
            </button>
            <button
              onClick={fetchOverviewData}
              className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Scanned */}
        <div className="p-4 rounded-xl bg-[#091122] border border-cyan-900/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Scanned</span>
            <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{stats?.totalAnalyzed ?? 0}</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-cyan-400" /> Across all client sessions
          </div>
        </div>

        {/* High Risk Intercepted */}
        <div className="p-4 rounded-xl bg-[#091122] border border-red-900/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-red-400 font-mono">{stats?.highRisk ?? 0}</div>
          <div className="mt-1 text-[11px] text-red-400/80">Immediate threat flags</div>
        </div>

        {/* Suspicious */}
        <div className="p-4 rounded-xl bg-[#091122] border border-amber-900/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Suspicious</span>
            <AlertTriangle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">{stats?.suspicious ?? 0}</div>
          <div className="mt-1 text-[11px] text-amber-400/80">Elevated heuristic scores</div>
        </div>

        {/* Confirmed Threats */}
        <div className="p-4 rounded-xl bg-[#091122] border border-red-950 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Confirmed Blacklists</span>
            <ShieldAlert className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{stats?.confirmedThreats ?? 0}</div>
          <div className="mt-1 text-[11px] text-rose-400/80">Verified threat intel hits</div>
        </div>

        {/* Safe / Low Risk */}
        <div className="p-4 rounded-xl bg-[#091122] border border-emerald-900/30 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Safe & Nominal</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats?.lowRisk ?? 0}</div>
          <div className="mt-1 text-[11px] text-emerald-400/80">Clean baseline navigations</div>
        </div>
      </div>

      {/* Main Charts & Incident Briefing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity & Trend Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Threat Interception vs Benign Traffic</h3>
              <p className="text-xs text-slate-400">Chronological telemetry trends derived from MongoDB</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              {['24h', '7d', '30d'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    timeframe === t ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends || []}>
                <defs>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="low" name="Safe / Low Risk" stroke="#10B981" fillOpacity={1} fill="url(#colorSafe)" />
                <Area type="monotone" dataKey="high" name="Threats Intercepted" stroke="#EF4444" fillOpacity={1} fill="url(#colorThreat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Incident Summary Briefing (1 col) */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Incident Rollup
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                Real-time
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-tight">
              {incidentBrief?.potentialImpact || 'Security posture baseline analysis'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              {incidentBrief?.summary || 'CyberShield telemetry engine is operating normally. All security events are actively triaged.'}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider font-mono">Defensive Directives</p>
            <div className="space-y-1">
              {(incidentBrief?.defensiveActions || ['Enforce zero-trust browsing', 'Monitor unencrypted logins']).slice(0, 3).map((act: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Telemetry Stream */}
      <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Recent Telemetry Ingestion</h3>
            <p className="text-xs text-slate-400">Live feed of scanned destinations and risk classifications</p>
          </div>
          <Link
            to="/history"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
          >
            Full History <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Target Domain</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Primary Finding</th>
                <th className="py-2.5 px-3 text-right">Scanned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentScans.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">No telemetry recorded yet. Run a scan to initiate monitoring.</td>
                </tr>
              ) : (
                recentScans.map((scan) => {
                  const isHigh = scan.score >= 70;
                  const isSuspicious = scan.score >= 25 && scan.score < 70;
                  const badgeColor = isHigh 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : isSuspicious 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

                  return (
                    <tr key={scan.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white truncate max-w-xs">{scan.domain}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-sm">{scan.url}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${badgeColor}`}>
                          {scan.riskLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        {scan.score} / 100
                      </td>
                      <td className="py-3 px-3 text-slate-300 truncate max-w-xs">
                        {scan.indicators?.[0] || 'Standard behavioral baseline'}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 font-mono text-[10px]">
                        {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
