import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Download, 
  RefreshCw,
  Filter,
  Check,
  Radio
} from 'lucide-react';
import { api } from '../services/api';

export const SecurityEvents: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents({ severity: severityFilter, type: typeFilter });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [severityFilter, typeFilter]);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeEvent(id);
      setEvents(events.map(e => e._id === id ? { ...e, acknowledged: true } : e));
    } catch (err) {
      console.error('Failed to acknowledge event:', err);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Activity className="w-4 h-4 text-cyan-400" />
            INCIDENT AUDIT LOGS & EVENT STREAM
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Security Events & Threat Stream</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time chronological audit trail of all detected phishing attempts, anomalous port navigations, and malicious payload interceptions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={api.getExportUrl('events', 'csv')}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-750 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-medium transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </a>
          <button
            onClick={fetchEvents}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#091122] border border-cyan-900/30 flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter Severity:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg uppercase text-[11px] font-mono transition ${
                severityFilter === sev
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Target Asset</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No events matched the selected filter.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getSeverityBadge(evt.severity)}`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                      {evt.type}
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-300 truncate max-w-xs">
                      {evt.target}
                    </td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-md">
                      {evt.description}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {evt.source}
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px] text-slate-500">
                      {new Date(evt.timestamp || evt.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {evt.acknowledged ? (
                        <span className="text-[10px] text-emerald-400 font-mono inline-flex items-center gap-1">
                          <Check className="w-3 h-3" /> Reviewed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(evt._id)}
                          className="px-2 py-1 rounded-lg bg-slate-850 hover:bg-cyan-900/40 text-cyan-400 border border-cyan-800/40 text-[10px] font-mono transition"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
