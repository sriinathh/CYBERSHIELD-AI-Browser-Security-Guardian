import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Settings, 
  Lock, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface TopNavbarProps {
  user: any;
  onLogout: () => void;
  openAuthModal: () => void;
  notifications: any[];
  onMarkNotificationsRead: () => void;
  isSocketConnected: boolean;
  openCopilot: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  onLogout,
  openAuthModal,
  notifications,
  onMarkNotificationsRead,
  isSocketConnected,
  openCopilot
}) => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Derive title from route
  const pathMap: Record<string, string> = {
    '/': 'Security Overview',
    '/scanner': 'AI Website Scanner',
    '/protection': 'Browser Protection Engine',
    '/threat-intel': 'Threat Intelligence Feeds',
    '/risk-analysis': 'Risk Analysis & Scoring Engine',
    '/events': 'Security Events & Anomaly Stream',
    '/history': 'Scan Telemetry History',
    '/domain': 'Domain Intelligence & DNS Audit',
    '/analytics': 'Security Metrics & Analytics',
    '/notifications': 'Notification Center',
    '/integrations': 'Integrations & API Tokens',
    '/settings': 'Platform Settings',
    '/security': 'Account Security & Sessions',
  };

  const pageTitle = pathMap[location.pathname] || 'Dashboard';
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-[#070D19]/80 backdrop-blur-md border-b border-cyan-900/20 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wider font-mono text-cyan-400">CyberShield</span>
        <span className="text-slate-600">/</span>
        <h1 className="text-base font-semibold text-white tracking-wide">{pageTitle}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* System & Socket Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400'}`} />
          <span className="text-slate-300">{isSocketConnected ? 'Live Socket Stream' : 'Polling Sync'}</span>
        </div>

        {/* AI Security Copilot Trigger */}
        <button
          onClick={openCopilot}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.4)] transition hover:shadow-[0_0_16px_rgba(6,182,212,0.6)] cursor-pointer"
          title="Open AI Security Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
          <span className="hidden sm:inline">AI Security Copilot</span>
          <span className="sm:hidden">Copilot</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0A1120] border border-cyan-900/40 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={onMarkNotificationsRead}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="py-2 max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">No new security notifications</div>
                ) : (
                  notifications.slice(0, 6).map((notif: any, i) => (
                    <div 
                      key={notif._id || i}
                      className={`p-2.5 rounded-xl border text-xs transition ${
                        notif.read ? 'bg-slate-900/30 border-slate-800/40 text-slate-400' : 'bg-cyan-950/20 border-cyan-900/50 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white truncate">{notif.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(notif.timestamp || notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 border-t border-slate-800 text-center">
                <Link 
                  to="/notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
                >
                  View full notifications center <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Login */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium text-slate-200 max-w-[100px] truncate">{user.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0A1120] border border-cyan-900/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
                <div className="py-1 space-y-0.5">
                  <Link
                    to="/security"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Account Security</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-lg transition"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Preferences</span>
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium shadow-[0_0_12px_rgba(6,182,212,0.4)] transition"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
