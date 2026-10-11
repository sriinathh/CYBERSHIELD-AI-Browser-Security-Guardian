import React, { useState, useEffect } from 'react';
import { Lock, Key, ShieldCheck, Laptop, AlertOctagon, Check, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

interface AccountSecurityProps {
  user: any;
  onLogout: () => void;
}

export const AccountSecurity: React.FC<AccountSecurityProps> = ({ user, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    api.getSessions().then(data => {
      if (Array.isArray(data)) setSessions(data);
    }).catch(() => {
      // Default fallback session info
      setSessions([
        {
          id: 'sess-current',
          device: 'Windows 11 / Chrome 122',
          ip: '127.0.0.1 (Localhost)',
          lastActive: 'Active right now',
          current: true
        }
      ]);
    });
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    setPwdLoading(true);
    setPwdMsg({ type: '', text: '' });

    try {
      await api.changePassword({ currentPassword, newPassword });
      setPwdMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwdMsg({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      await api.deleteAccount();
      onLogout();
    } catch (err: any) {
      alert(err.message || 'Account deletion failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Lock className="w-4 h-4 text-cyan-400" />
          CREDENTIAL & SESSION GOVERNANCE
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Account Security & Access Control</h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          Manage password hygiene, multi-factor authentication, active login sessions, and account lifecycle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile & Password Update */}
        <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" /> Change Security Password
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Authenticated User:</span>
              <span className="font-semibold text-white">{user?.name || 'Administrator'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Email:</span>
              <span className="font-mono text-cyan-300">{user?.email || 'admin@cybershield.ai'}</span>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            {pwdMsg.text && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                pwdMsg.type === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/50' : 'bg-red-950/40 text-red-300 border border-red-900/50'
              }`}>
                <span>{pwdMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition disabled:opacity-50"
            >
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Active Sessions */}
        <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" /> Active Security Sessions
            </h3>
            <p className="text-xs text-slate-400">Authenticated tokens and connected browser extension instances.</p>

            <div className="space-y-2">
              {sessions.map((sess, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{sess.device || 'Chrome MV3 Extension'}</span>
                      {sess.current && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{sess.ip || '127.0.0.1'} • {sess.lastActive || 'Active'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-red-400 flex items-center gap-1.5 uppercase font-mono">
              <AlertOctagon className="w-3.5 h-3.5" /> Danger Zone
            </h4>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full py-2 rounded-xl bg-red-950/30 border border-red-900/60 hover:bg-red-900/40 text-red-300 text-xs font-medium transition"
            >
              Delete Account & Purge Data
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#0A1120] border border-red-900/60 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> Confirm Account Deletion
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action is <strong className="text-red-400">permanent and irreversible</strong>. All your scan history, settings, and generated telemetry keys will be permanently purged from MongoDB.
            </p>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1 font-mono">
                Type <strong className="text-white">DELETE</strong> to proceed:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-medium transition shadow-md"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
