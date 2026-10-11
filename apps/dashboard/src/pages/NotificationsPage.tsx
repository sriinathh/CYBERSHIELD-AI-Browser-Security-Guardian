import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, RefreshCw, ShieldAlert, AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'threat':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'alert':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Bell className="w-4 h-4 text-cyan-400" />
            NOTIFICATION DISPATCH LOG
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Security Notifications Center</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Real-time critical threat advisories, browser extension interceptions, and system notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-750 hover:border-cyan-500/50 text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            filter === 'all' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            filter === 'unread' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#091122] border border-cyan-900/30 text-center text-xs text-slate-500">
            No notifications available in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition flex items-start gap-3.5 ${
                n.read
                  ? 'bg-slate-900/40 border-slate-850 text-slate-400'
                  : 'bg-cyan-950/20 border-cyan-900/50 text-slate-200 shadow-md'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 shrink-0">
                {getNotifIcon(n.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.timestamp || n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
