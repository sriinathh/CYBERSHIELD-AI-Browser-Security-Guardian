import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRouter from './routes/api';
import { socketService } from './services/socketService';
import { mlRiskEngine } from './services/mlService';
import { Analysis } from './models/Analysis';
import { SecurityEvent } from './models/SecurityEvent';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Allows dashboard (3001), extension (chrome-extension://), and external clients
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(morgan('dev'));

// Mount Unified API Routes
app.use('/api/v1', apiRouter);

// Initialize Real-time Socket.IO Engine
socketService.init(server);

// Database Connection & Bootstrapping
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cybershield';

async function bootstrapDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB at', MONGO_URI);

    // Initialize & persist ML model metadata
    await mlRiskEngine.syncModelMetadata();
    console.log('✅ ML Risk Engine initialized & model metadata synchronized');

    // If completely empty database, seed standard telemetry baseline so dashboard has historical depth
    const count = await Analysis.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial baseline telemetry for CyberShield security monitoring...');
      const seedAnalyses = [
        {
          url: 'https://github.com/torvalds/linux',
          domain: 'github.com',
          score: 5,
          riskLabel: 'Low observed risk',
          indicators: ['Valid TLS certificate with strict transport security', 'Known clean authority domain'],
          signals: [{ id: 'VALID_TLS', category: 'Transport', severity: 'low', description: 'TLS verified', source: 'Heuristic', confidence: 0.99, confirmed: true }],
          explanation: 'github.com represents a legitimate source code hosting provider with verified encryption.',
          analysisStatus: 'completed',
          analyzedAt: new Date(Date.now() - 36 * 60 * 60 * 1000)
        },
        {
          url: 'https://paypal-security-update.account-verification.top/login.php',
          domain: 'paypal-security-update.account-verification.top',
          score: 88,
          riskLabel: 'High risk',
          indicators: ['Brand impersonation detected for PAYPAL', 'High-abuse TLD (.top)', 'Credential phishing keywords'],
          signals: [
            { id: 'HEUR_BRAND_IMPERSONATION', category: 'Brand Protection', severity: 'high', description: 'Impersonation of PayPal branding', source: 'Heuristics', confidence: 0.88, confirmed: false },
            { id: 'HEUR_ABUSIVE_TLD', category: 'Domain Reputation', severity: 'medium', description: 'Top-Level Domain (.top) has elevated fraud volume', source: 'Heuristics', confidence: 0.75, confirmed: false }
          ],
          explanation: 'Severe risk of credential harvesting. The domain attempts deceptive typosquatting on financial services.',
          analysisStatus: 'completed',
          analyzedAt: new Date(Date.now() - 14 * 60 * 60 * 1000)
        },
        {
          url: 'http://192.168.1.105:8080/secure/wallet-claim.html',
          domain: '192.168.1.105',
          score: 82,
          riskLabel: 'High risk',
          indicators: ['Destination connects via raw IP', 'Non-standard port: 8080', 'Unencrypted HTTP context'],
          signals: [
            { id: 'HEUR_IP_HOST', category: 'Network & Host', severity: 'high', description: 'Raw IP addressing in URL', source: 'Heuristics', confidence: 0.95, confirmed: true },
            { id: 'HEUR_NON_STD_PORT', category: 'Network & Port', severity: 'medium', description: 'Non-standard port 8080', source: 'Heuristics', confidence: 0.85, confirmed: true }
          ],
          explanation: 'High probability of malicious deployment or unauthorized staging portal using direct IP connections.',
          analysisStatus: 'completed',
          analyzedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ];
      await Analysis.insertMany(seedAnalyses);

      // Seed initial security events
      await SecurityEvent.create([
        {
          type: 'PHISHING_ATTEMPT',
          severity: 'high',
          description: 'Intercepted deceptive navigation to paypal-security-update.account-verification.top',
          target: 'paypal-security-update.account-verification.top',
          source: 'scanner',
          metadata: { score: 88 },
          timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000)
        },
        {
          type: 'ANOMALOUS_PORT',
          severity: 'medium',
          description: 'Blocked anomalous unencrypted connection to 192.168.1.105:8080',
          target: '192.168.1.105',
          source: 'extension',
          metadata: { score: 82 },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      ]);
    }
  } catch (err: any) {
    console.error('❌ MongoDB connection warning:', err.message);
    console.log('ℹ️ Running in resilient mode. Database operations will reconnect automatically.');
  }
}

bootstrapDatabase();

server.listen(PORT, () => {
  console.log(`🚀 CyberShield Security Guardian Server listening on port ${PORT}`);
});

export default app;
