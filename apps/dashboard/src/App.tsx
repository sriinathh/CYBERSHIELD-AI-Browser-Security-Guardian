import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { CopilotDrawer } from './components/CopilotDrawer';
import { AuthModal } from './pages/AuthModal';

// Pages
import { Overview } from './pages/Overview';
import { Scanner } from './pages/Scanner';
import { BrowserProtection } from './pages/BrowserProtection';
import { ThreatIntelligence } from './pages/ThreatIntelligence';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { SecurityEvents } from './pages/SecurityEvents';
import { ScanHistory } from './pages/ScanHistory';
import { DomainIntelligence } from './pages/DomainIntelligence';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { Integrations } from './pages/Integrations';
import { SettingsPage } from './pages/SettingsPage';
import { AccountSecurity } from './pages/AccountSecurity';

// Services
import { api } from './services/api';
import { getSocket } from './services/socket';

export const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Initial user check
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const me = await api.getMe();
      setUser(me);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Initial notifications fetch
  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data)) setNotifications(data);
    } catch {}
  };

  useEffect(() => {
    checkAuth();
    fetchNotifications();

    // Socket.IO real-time subscriptions
    const socket = getSocket();
    
    socket.on('connect', () => {
      setIsSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    socket.on('NEW_NOTIFICATION', (notif: any) => {
      setNotifications(prev => [notif, ...prev]);
    });

    socket.on('SECURITY_EVENT', (event: any) => {
      // Auto prepend alert
      setNotifications(prev => [
        {
          _id: `evt-${Date.now()}`,
          title: `Security Alert: ${event.type}`,
          message: event.description,
          type: 'alert',
          read: false,
          timestamp: new Date()
        },
        ...prev
      ]);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('NEW_NOTIFICATION');
      socket.off('SECURITY_EVENT');
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Router>
      <div className="min-h-screen bg-[#050B14] text-slate-300 flex">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          openCopilot={() => setCopilotOpen(true)}
          unreadCount={unreadCount}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-20'}`}>
          <TopNavbar
            user={user}
            onLogout={handleLogout}
            openAuthModal={() => setAuthModalOpen(true)}
            notifications={notifications}
            onMarkNotificationsRead={handleMarkNotificationsRead}
            isSocketConnected={isSocketConnected}
            openCopilot={() => setCopilotOpen(true)}
          />

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Overview openCopilot={() => setCopilotOpen(true)} />} />
              <Route path="/scanner" element={<Scanner openCopilot={() => setCopilotOpen(true)} />} />
              <Route path="/protection" element={<BrowserProtection />} />
              <Route path="/threat-intel" element={<ThreatIntelligence />} />
              <Route path="/risk-analysis" element={<RiskAnalysis />} />
              <Route path="/events" element={<SecurityEvents />} />
              <Route path="/history" element={<ScanHistory />} />
              <Route path="/domain" element={<DomainIntelligence />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/security" element={<AccountSecurity user={user} onLogout={handleLogout} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>

        {/* Global Floating Copilot Quick-Access Button */}
        <button
          onClick={() => setCopilotOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all transform hover:scale-105 group cursor-pointer"
          title="Open AI Security Copilot"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="tracking-wide">AI Security Copilot</span>
        </button>

        {/* Floating Copilot Drawer */}
        <CopilotDrawer
          isOpen={copilotOpen}
          onClose={() => setCopilotOpen(false)}
        />

        {/* Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={(u) => setUser(u)}
        />
      </div>
    </Router>
  );
};

export default App;
