import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User';
import { Session } from '../models/Session';
import { Analysis } from '../models/Analysis';
import { SecurityEvent } from '../models/SecurityEvent';
import { Notification } from '../models/Notification';
import { MLModelMeta } from '../models/MLModelMeta';
import { orchestrateAnalysis } from '../services/analysisOrchestrator';
import { threatIntelService } from '../providers/threatIntelService';
import { mlRiskEngine } from '../services/mlService';
import { aiSecurityService } from '../services/aiService';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-development-key';

// Middleware to verify JWT
export const requireAuth = (req: any, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

// Optional auth middleware (attaches userId if token provided)
export const optionalAuth = (req: any, _res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
    } catch {
      // Ignore
    }
  }
  next();
};

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const providers = threatIntelService.getProviderStatus();
  const aiStatus = aiSecurityService.getStatus();

  res.json({
    status: 'ok',
    timestamp: new Date(),
    service: 'CyberShield Unified Security API',
    version: '1.2.0',
    database: dbStatus,
    threatIntelligence: providers,
    aiService: aiStatus,
    mlEngine: {
      version: mlRiskEngine.getModelVersion(),
      status: 'active'
    }
  });
});

// ==========================================
// 2. AUTHENTICATION & USER MANAGEMENT
// ==========================================
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      preferences: {
        notifications: true,
        dataSharing: true,
        twoFactor: false,
        theme: 'cyberpunk',
        apiKey: `sk_live_cyber_${Math.random().toString(36).substring(2, 12)}${Date.now().toString(36)}`
      }
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await new Session({
      userId: user._id,
      userName: user.name,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      status: 'Active'
    }).save();

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Account registration failed due to an internal error' });
  }
});

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

    await new Session({
      userId: user._id,
      userName: user.name,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      status: 'Active'
    }).save();

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed due to an internal server error' });
  }
});

router.get('/auth/me', requireAuth, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

router.put('/auth/settings', requireAuth, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, email, notifications, dataSharing, twoFactor, theme, apiKey } = req.body;
    if (name) user.name = name.trim();
    if (email) user.email = email.trim().toLowerCase();

    user.preferences = {
      notifications: notifications ?? user.preferences?.notifications ?? true,
      dataSharing: dataSharing ?? user.preferences?.dataSharing ?? true,
      twoFactor: twoFactor ?? user.preferences?.twoFactor ?? false,
      theme: theme ?? user.preferences?.theme ?? 'cyberpunk',
      apiKey: apiKey ?? user.preferences?.apiKey ?? 'sk_live_cyber_00000000'
    };

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      preferences: user.preferences
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

router.post('/auth/change-password', requireAuth, async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Current password does not match' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.delete('/auth/account', requireAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;
    await Promise.all([
      User.findByIdAndDelete(userId),
      Analysis.deleteMany({ user: userId }),
      SecurityEvent.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      Session.deleteMany({ userId })
    ]);
    res.json({ message: 'Account and associated data deleted securely.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Account deletion failed' });
  }
});

// ==========================================
// 3. CORE ANALYSIS & SCANNING
// ==========================================
router.post('/analysis', optionalAuth, async (req: any, res: Response) => {
  try {
    const { url, source = 'scanner' } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'A target URL is required for analysis' });
    }

    const userId = req.user?.userId;
    const result = await orchestrateAnalysis({ url, userId, source });
    res.json(result);
  } catch (err: any) {
    console.error('Analysis execution error:', err.message);
    res.status(400).json({ error: err.message || 'Analysis could not be completed' });
  }
});

// Scan History
router.get('/history', optionalAuth, async (req: any, res: Response) => {
  try {
    const { limit = 50, risk, domain, search } = req.query;
    const query: any = {};

    if (req.user?.userId) {
      // If authenticated, show user scans or public scans
      query.$or = [{ user: req.user.userId }, { user: null }];
    }

    if (risk && risk !== 'all') {
      query.riskLabel = risk;
    }

    if (domain) {
      query.domain = { $regex: domain, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { domain: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Analysis.find(query)
      .sort({ analyzedAt: -1 })
      .limit(Number(limit))
      .lean();

    const mapped = items.map(item => ({
      id: item._id,
      url: item.url,
      domain: item.domain,
      score: item.score,
      riskLabel: item.riskLabel,
      indicators: item.indicators || [],
      signals: item.signals || [],
      explanation: item.explanation,
      providerResults: item.providerResults,
      mlPrediction: item.mlPrediction,
      timestamp: item.analyzedAt || item.createdAt
    }));

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve scan history' });
  }
});

// ==========================================
// 4. SECURITY EVENTS & AUDIT LOGS
// ==========================================
router.get('/events', optionalAuth, async (req: any, res: Response) => {
  try {
    const { severity, type, limit = 50 } = req.query;
    const query: any = {};

    if (severity && severity !== 'all') query.severity = severity;
    if (type && type !== 'all') query.type = type;

    const events = await SecurityEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .lean();

    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve security events' });
  }
});

router.post('/events/:id/acknowledge', requireAuth, async (req: Request, res: Response) => {
  try {
    const event = await SecurityEvent.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true },
      { new: true }
    );
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// ==========================================
// 5. NOTIFICATIONS
// ==========================================
router.get('/notifications', optionalAuth, async (req: any, res: Response) => {
  try {
    const query: any = {};
    if (req.user?.userId) {
      query.$or = [{ user: req.user.userId }, { user: null }];
    }

    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .limit(30)
      .lean();

    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.post('/notifications/read-all', optionalAuth, async (_req: any, res: Response) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// ==========================================
// 6. DYNAMIC DASHBOARD ANALYTICS
// ==========================================
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { range = '7d' } = req.query;
    
    // Calculate time threshold based on filter
    const now = new Date();
    let days = 7;
    if (range === '24h') days = 1;
    else if (range === '30d') days = 30;
    
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      totalAnalyzed,
      highRisk,
      suspicious,
      lowRisk,
      confirmedThreats,
      uniqueDomainsResult,
      topFlaggedDomains,
      recentTrendAgg
    ] = await Promise.all([
      Analysis.countDocuments(),
      Analysis.countDocuments({ riskLabel: 'High risk' }),
      Analysis.countDocuments({ riskLabel: 'Suspicious' }),
      Analysis.countDocuments({ riskLabel: 'Low observed risk' }),
      Analysis.countDocuments({ riskLabel: 'Confirmed threat match' }),
      Analysis.distinct('domain'),
      Analysis.aggregate([
        { $match: { riskLabel: { $in: ['High risk', 'Confirmed threat match', 'Suspicious'] } } },
        { $group: { _id: '$domain', count: { $sum: 1 }, avgScore: { $avg: '$score' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Analysis.aggregate([
        { $match: { analyzedAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$analyzedAt' } },
            total: { $sum: 1 },
            threats: {
              $sum: {
                $cond: [{ $in: ['$riskLabel', ['High risk', 'Confirmed threat match']] }, 1, 0]
              }
            },
            safe: {
              $sum: {
                $cond: [{ $eq: ['$riskLabel', 'Low observed risk'] }, 1, 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    // Format trends into array
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const trends = recentTrendAgg.map(item => {
      const d = new Date(item._id);
      return {
        name: dayNames[d.getDay()] || item._id,
        date: item._id,
        low: item.safe || 0,
        high: item.threats || 0,
        total: item.total || 0
      };
    });

    res.json({
      totalAnalyzed,
      uniqueDomainsCount: uniqueDomainsResult.length,
      highRisk,
      suspicious,
      lowRisk,
      confirmedThreats,
      topFlaggedDomains: topFlaggedDomains.map(d => ({ domain: d._id, count: d.count, avgScore: Math.round(d.avgScore) })),
      trends: trends.length > 0 ? trends : [
        { name: 'Mon', low: lowRisk, high: highRisk, total: totalAnalyzed }
      ],
      timeframe: range
    });
  } catch (err: any) {
    console.error('Stats aggregation error:', err);
    res.status(500).json({ error: 'Failed to aggregate dynamic dashboard metrics' });
  }
});

// ==========================================
// 7. THREAT INTELLIGENCE & DOMAIN ADAPTERS
// ==========================================
router.get('/threat-intel/providers', (_req: Request, res: Response) => {
  res.json(threatIntelService.getProviderStatus());
});

router.post('/threat-intel/lookup', async (req: Request, res: Response) => {
  try {
    const { target } = req.body;
    if (!target) return res.status(400).json({ error: 'Target domain or URL is required' });

    let domain = target;
    try {
      domain = new URL(target.startsWith('http') ? target : `https://${target}`).hostname;
    } catch {}

    const report = await threatIntelService.queryIntelligence(target, domain);
    res.json({ target, domain, ...report });
  } catch (err: any) {
    res.status(500).json({ error: 'Threat intelligence query failed' });
  }
});

// Domain Intelligence Report
router.get('/domain/:domain', async (req: Request, res: Response) => {
  try {
    const domainParam = Array.isArray(req.params.domain) ? req.params.domain[0] : req.params.domain;
    const domain = String(domainParam || '').toLowerCase();
    const dnsLookup = await threatIntelService.auditDomainDns(domain);
    const historicalScans = await Analysis.find({ domain }).sort({ analyzedAt: -1 }).limit(10).lean();

    const domainData = {
      domain,
      dnsLookup,
      historicalCount: historicalScans.length,
      recentScans: historicalScans.map(s => ({
        url: s.url,
        score: s.score,
        riskLabel: s.riskLabel,
        analyzedAt: s.analyzedAt
      }))
    };

    const aiSummary = await aiSecurityService.generateDomainInvestigation(domainData);

    res.json({
      ...domainData,
      aiSummary
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Domain intelligence report failed' });
  }
});

// ==========================================
// 8. MACHINE LEARNING RISK PREDICTION
// ==========================================
router.post('/ml/predict', (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required for ML prediction' });

    const prediction = mlRiskEngine.predict(url);
    res.json(prediction);
  } catch (err: any) {
    res.status(500).json({ error: 'ML inference failed' });
  }
});

router.get('/ml/metrics', async (_req: Request, res: Response) => {
  try {
    let meta = await MLModelMeta.findOne({ version: mlRiskEngine.getModelVersion() });
    if (!meta) {
      meta = await mlRiskEngine.syncModelMetadata();
    }
    res.json(meta);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve ML evaluation metrics' });
  }
});

// ==========================================
// 9. AI SECURITY COPILOT & INCIDENT BRIEFING
// ==========================================
router.post('/copilot/chat', optionalAuth, async (req: any, res: Response) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message content is required' });

    // Fetch user context for grounding
    const recentScans = await Analysis.find().sort({ analyzedAt: -1 }).limit(5).lean();
    const recentEvents = await SecurityEvent.find().sort({ timestamp: -1 }).limit(5).lean();

    const reply = await aiSecurityService.handleCopilotChat(
      message,
      history,
      { recentScans, recentEvents }
    );

    res.json({ reply, timestamp: new Date() });
  } catch (err: any) {
    res.status(500).json({ error: 'Copilot conversation failed' });
  }
});

router.get('/incidents/summary', async (_req: Request, res: Response) => {
  try {
    const recentEvents = await SecurityEvent.find().sort({ timestamp: -1 }).limit(20).lean();
    const summary = await aiSecurityService.generateIncidentSummary(recentEvents);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate incident briefing' });
  }
});

// ==========================================
// 10. REPORT EXPORT (CSV / JSON)
// ==========================================
router.get('/reports/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json', type = 'scans' } = req.query;

    if (type === 'events') {
      const events = await SecurityEvent.find().sort({ timestamp: -1 }).limit(500).lean();
      if (format === 'csv') {
        let csv = 'Timestamp,Type,Severity,Target,Description\n';
        events.forEach(e => {
          csv += `"${e.timestamp}","${e.type}","${e.severity}","${e.target}","${(e.description || '').replace(/"/g, '""')}"\n`;
        });
        res.header('Content-Type', 'text/csv');
        res.attachment('cybershield_security_events.csv');
        return res.send(csv);
      }
      return res.json(events);
    }

    const scans = await Analysis.find().sort({ analyzedAt: -1 }).limit(500).lean();
    if (format === 'csv') {
      let csv = 'AnalyzedAt,Domain,Score,RiskLabel,URL\n';
      scans.forEach(s => {
        csv += `"${s.analyzedAt}","${s.domain}",${s.score},"${s.riskLabel}","${(s.url || '').replace(/"/g, '""')}"\n`;
      });
      res.header('Content-Type', 'text/csv');
      res.attachment('cybershield_scans.csv');
      return res.send(csv);
    }
    return res.json(scans);
  } catch (err: any) {
    res.status(500).json({ error: 'Report generation failed' });
  }
});

// Admin Sessions
router.get('/admin/sessions', async (_req: Request, res: Response) => {
  try {
    const sessions = await Session.find().sort({ loginTime: -1 }).limit(50);
    res.json(sessions.map(s => ({
      id: s._id,
      user: s.userName,
      ip: s.ipAddress,
      status: s.status,
      loginTime: s.loginTime
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

export default router;
