import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  ShieldCheck, 
  Globe, 
  RefreshCw,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats(range);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [range]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            AGGREGATED TELEMETRY METRICS
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Threat Analytics & Longitudinal Posture</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real MongoDB aggregations calculating threat vectors, anomalous traffic distributions, and recurring malicious domains.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs self-start md:self-auto">
          {['24h', '7d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                range === r ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#091122] border border-cyan-900/30">
          <span className="text-[10px] uppercase font-mono text-slate-400">Total Scans Evaluated</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{stats?.totalAnalyzed || 0}</div>
          <div className="text-[11px] text-cyan-400 mt-1">Across all endpoints</div>
        </div>

        <div className="p-4 rounded-xl bg-[#091122] border border-red-900/30">
          <span className="text-[10px] uppercase font-mono text-red-400">Threat Flags (High/Crit)</span>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {(stats?.highRisk || 0) + (stats?.confirmedThreats || 0)}
          </div>
          <div className="text-[11px] text-red-400/80 mt-1">Direct interception events</div>
        </div>

        <div className="p-4 rounded-xl bg-[#091122] border border-amber-900/30">
          <span className="text-[10px] uppercase font-mono text-amber-400">Suspicious Warnings</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{stats?.suspicious || 0}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Heuristic anomaly flags</div>
        </div>

        <div className="p-4 rounded-xl bg-[#091122] border border-emerald-900/30">
          <span className="text-[10px] uppercase font-mono text-emerald-400">Unique Apex Domains</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{stats?.uniqueDomainsCount || 0}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">Distinct web authorities</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Longitudinal Trend Chart */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Threat vs Benign Distribution</h3>
            <p className="text-xs text-slate-400">Time-series breakdown across active telemetry window</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trends || []}>
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
                <Area type="monotone" dataKey="low" name="Safe URLs" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="high" name="Threats Intercepted" stroke="#EF4444" fill="#EF4444" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Flagged Domains */}
        <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Most Frequently Flagged Threat Domains</h3>
            <p className="text-xs text-slate-400">Domains triggering recurring high-severity heuristic & intel penalties</p>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {(!stats?.topFlaggedDomains || stats.topFlaggedDomains.length === 0) ? (
              <div className="text-xs text-slate-500 py-6 text-center">No high-risk domains recorded in this period.</div>
            ) : (
              stats.topFlaggedDomains.map((item: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <div className="font-semibold text-white">{item.domain}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.count} incident flags logged</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                      Avg Score: {item.avgScore}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
