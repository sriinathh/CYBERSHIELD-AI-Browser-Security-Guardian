import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Download, 
  RefreshCw, 
  Filter, 
  ExternalLink, 
  Eye, 
  X,
  Sparkles,
  Cpu,
  Radio
} from 'lucide-react';
import { api } from '../services/api';

export const ScanHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedScan, setSelectedScan] = useState<any>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getHistory({ search, risk: riskFilter, limit: 100 });
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [riskFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (score >= 25) return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <History className="w-4 h-4 text-cyan-400" />
            TELEMETRY ARCHIVE
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Historical Scan Repository</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Comprehensive log of all URLs evaluated across browser sessions with persistent storage in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getExportUrl('scans', 'csv')}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export Scans CSV
          </a>
          <button
            onClick={fetchHistory}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#091122] border border-cyan-900/30 flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by domain or URL pattern..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400 font-mono">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="all">All Classifications</option>
            <option value="Low observed risk">Low Observed Risk</option>
            <option value="Suspicious">Suspicious</option>
            <option value="High risk">High Risk</option>
            <option value="Confirmed threat match">Confirmed Threat Match</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Domain</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Primary Indicator</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No scan records found matching query parameters.
                  </td>
                </tr>
              ) : (
                history.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white truncate max-w-xs">{scan.domain}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-md font-mono">{scan.url}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${getScoreBadge(scan.score)}`}>
                        {scan.riskLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-200">
                      {scan.score} / 100
                    </td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-xs">
                      {scan.indicators?.[0] || 'Standard baseline'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[10px]">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="p-1.5 rounded-lg bg-slate-850 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800/40 transition"
                        title="View Full Telemetry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#091122] border border-cyan-900/50 rounded-2xl shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-cyan-400">Scan Detail Inspector</span>
                <h3 className="text-base font-bold text-white break-all">{selectedScan.domain}</h3>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono break-all text-slate-300">
              {selectedScan.url}
            </div>

            {/* Score & Label */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400">Classification:</span>
                <div className="text-sm font-bold text-white">{selectedScan.riskLabel}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Risk Score:</span>
                <div className="text-2xl font-bold font-mono text-cyan-400">{selectedScan.score} / 100</div>
              </div>
            </div>

            {/* AI Explanation */}
            {selectedScan.explanation && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-cyan-950/20 border border-cyan-800/30 space-y-1.5 text-xs">
                <span className="text-cyan-300 font-semibold font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Security Assessment
                </span>
                <p className="text-slate-300 leading-relaxed">{selectedScan.explanation}</p>
              </div>
            )}

            {/* Signals */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 font-mono uppercase">Detected Heuristic Signals</span>
              <div className="space-y-1.5">
                {(!selectedScan.signals || selectedScan.signals.length === 0) ? (
                  <p className="text-xs text-slate-500">No flags triggered.</p>
                ) : (
                  selectedScan.signals.map((sig: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 text-xs">
                      <div className="flex justify-between font-mono text-[10px] text-slate-400 mb-1">
                        <span className="uppercase font-bold text-cyan-400">{sig.id}</span>
                        <span>{sig.severity}</span>
                      </div>
                      <p className="text-slate-300">{sig.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
