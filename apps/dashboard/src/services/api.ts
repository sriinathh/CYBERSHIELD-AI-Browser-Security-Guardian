const API_BASE = 'http://localhost:5000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body.error) errorMsg = body.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload: { name: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  updateSettings: (settings: any) =>
    request('/auth/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  deleteAccount: () =>
    request('/auth/account', { method: 'DELETE' }),

  // Stats & Analytics
  getStats: (range = '7d') => request(`/stats?range=${range}`),

  // Core Analysis & History
  runAnalysis: (url: string, source = 'scanner') =>
    request('/analysis', { method: 'POST', body: JSON.stringify({ url, source }) }),
  getHistory: (params: { limit?: number; risk?: string; domain?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.risk && params.risk !== 'all') q.set('risk', params.risk);
    if (params.domain) q.set('domain', params.domain);
    if (params.search) q.set('search', params.search);
    return request(`/history?${q.toString()}`);
  },

  // Security Events
  getEvents: (params: { severity?: string; type?: string; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.severity && params.severity !== 'all') q.set('severity', params.severity);
    if (params.type && params.type !== 'all') q.set('type', params.type);
    if (params.limit) q.set('limit', String(params.limit));
    return request(`/events?${q.toString()}`);
  },
  acknowledgeEvent: (id: string) =>
    request(`/events/${id}/acknowledge`, { method: 'POST' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationsRead: () =>
    request('/notifications/read-all', { method: 'POST' }),

  // Threat Intel & Domain
  getThreatProviders: () => request('/threat-intel/providers'),
  lookupThreatIntel: (target: string) =>
    request('/threat-intel/lookup', { method: 'POST', body: JSON.stringify({ target }) }),
  getDomainReport: (domain: string) => request(`/domain/${encodeURIComponent(domain)}`),

  // Machine Learning
  getMLMetrics: () => request('/ml/metrics'),
  predictML: (url: string) =>
    request('/ml/predict', { method: 'POST', body: JSON.stringify({ url }) }),

  // Copilot & Incidents
  sendCopilotMessage: (message: string, history: Array<{ role: string; content: string }>) =>
    request('/copilot/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  getIncidentSummary: () => request('/incidents/summary'),

  // Admin Sessions
  getSessions: () => request('/admin/sessions'),

  // Export URLs
  getExportUrl: (type: 'scans' | 'events', format: 'csv' | 'json') =>
    `${API_BASE}/reports/export?type=${type}&format=${format}`
};
