import { Link, useLocation } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  Radio, 
  Cpu, 
  Activity, 
  History, 
  Globe, 
  BarChart3, 
  Bell, 
  Key, 
  Settings, 
  Lock, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openCopilot: () => void;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, openCopilot, unreadCount }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'AI Scanner', path: '/scanner', icon: Search, badge: 'Live' },
    { label: 'Browser Protection', path: '/protection', icon: ShieldAlert },
    { label: 'Threat Intel', path: '/threat-intel', icon: Radio },
    { label: 'Risk Analysis', path: '/risk-analysis', icon: Cpu },
    { label: 'Security Events', path: '/events', icon: Activity },
    { label: 'Scan History', path: '/history', icon: History },
    { label: 'Domain Intel', path: '/domain', icon: Globe },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell, count: unreadCount },
    { label: 'Integrations', path: '/integrations', icon: Key },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Account Security', path: '/security', icon: Lock },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-[#070D19]/95 backdrop-blur-xl border-r border-cyan-900/30 flex flex-col transition-all duration-300 z-40 ${isOpen ? 'w-64' : 'w-20'}`}>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-900/30 bg-gradient-to-r from-cyan-950/30 to-transparent">
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {isOpen && (
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-wider text-white">CYBERSHIELD</span>
              <span className="text-[10px] tracking-widest text-cyan-400 font-mono uppercase">AI Guardian</span>
            </div>
          )}
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-slate-800/60 transition"
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent text-cyan-300 border-l-2 border-cyan-400 shadow-[inset_0_0_12px_rgba(6,182,212,0.15)]' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'text-slate-400 group-hover:text-cyan-300'}`} />
              {isOpen && <span className="truncate">{item.label}</span>}

              {/* Badges */}
              {isOpen && item.badge && (
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {item.badge}
                </span>
              )}
              {isOpen && item.count !== undefined && item.count > 0 && (
                <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Floating Copilot CTA button */}
      <div className="p-3 border-t border-cyan-900/30">
        <button
          onClick={openCopilot}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs shadow-[0_0_15px_rgba(99,102,241,0.4)] transition hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] ${!isOpen ? 'px-2' : ''}`}
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse shrink-0" />
          {isOpen && <span>AI Security Copilot</span>}
        </button>
      </div>
    </aside>
  );
};
