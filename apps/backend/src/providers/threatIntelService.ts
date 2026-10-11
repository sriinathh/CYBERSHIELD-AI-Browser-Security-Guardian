import dns from 'dns/promises';
import { ThreatCache } from '../models/ThreatCache';
import { ISignal } from '../models/Analysis';

export interface IProviderResult {
  provider: string;
  configured: boolean;
  status: 'clean' | 'malicious' | 'suspicious' | 'unconfigured' | 'error' | 'cached';
  details: string;
  positives?: number;
  total?: number;
  lastChecked: Date;
  error?: string;
}

export interface IThreatIntelligenceReport {
  safeBrowsing: IProviderResult;
  virusTotal: IProviderResult;
  dnsLookup: {
    resolved: boolean;
    ipAddresses: string[];
    mxRecords: string[];
    hasMx: boolean;
    error?: string;
  };
  confirmedThreat: boolean;
  signals: ISignal[];
}

export class ThreatIntelService {
  private safeBrowsingKey: string;
  private virusTotalKey: string;

  constructor() {
    this.safeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_KEY || '';
    this.virusTotalKey = process.env.VIRUSTOTAL_API_KEY || '';
  }

  public getProviderStatus() {
    return {
      safeBrowsing: {
        configured: Boolean(this.safeBrowsingKey),
        providerName: 'Google Safe Browsing v4',
        status: Boolean(this.safeBrowsingKey) ? 'active' : 'unconfigured_transparent_fallback',
        lastHealthCheck: new Date()
      },
      virusTotal: {
        configured: Boolean(this.virusTotalKey),
        providerName: 'VirusTotal API v3',
        status: Boolean(this.virusTotalKey) ? 'active' : 'unconfigured_transparent_fallback',
        lastHealthCheck: new Date()
      },
      dnsResolver: {
        configured: true,
        providerName: 'Native Recursive DNS Audit',
        status: 'active',
        lastHealthCheck: new Date()
      }
    };
  }

  // Real DNS audit using node's native dns promises
  public async auditDomainDns(domain: string): Promise<{ resolved: boolean; ipAddresses: string[]; mxRecords: string[]; hasMx: boolean; error?: string }> {
    try {
      const aRecords = await dns.resolve4(domain).catch(() => []);
      const mxRecords = await dns.resolveMx(domain).catch(() => []);

      return {
        resolved: aRecords.length > 0,
        ipAddresses: aRecords,
        mxRecords: mxRecords.map(mx => `${mx.exchange} (pri: ${mx.priority})`),
        hasMx: mxRecords.length > 0
      };
    } catch (err: any) {
      return {
        resolved: false,
        ipAddresses: [],
        mxRecords: [],
        hasMx: false,
        error: err.code || 'DNS resolution failed'
      };
    }
  }

  // Check Google Safe Browsing
  public async checkSafeBrowsing(url: string): Promise<IProviderResult> {
    if (!this.safeBrowsingKey) {
      return {
        provider: 'Google Safe Browsing',
        configured: false,
        status: 'unconfigured',
        details: 'Google Safe Browsing key not configured. External lookup skipped transparently.',
        lastChecked: new Date()
      };
    }

    try {
      // Check cache first
      const cacheHit = await ThreatCache.findOne({ normalizedKey: url, providerId: 'safebrowsing' });
      if (cacheHit && cacheHit.expiresAt > new Date()) {
        return {
          provider: 'Google Safe Browsing',
          configured: true,
          status: cacheHit.status as any,
          details: `Cached assessment: ${cacheHit.category || 'verified record'}`,
          lastChecked: cacheHit.checkedAt
        };
      }

      const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${this.safeBrowsingKey}`;
      const payload = {
        client: { clientId: 'cybershield', clientVersion: '1.0.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const isListed = Boolean(data.matches && data.matches.length > 0);
      const category = isListed ? data.matches[0].threatType : 'CLEAN';

      // Store in cache with 2-hour expiration
      const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await ThreatCache.findOneAndUpdate(
        { normalizedKey: url, providerId: 'safebrowsing' },
        { status: isListed ? 'malicious' : 'clean', category, checkedAt: new Date(), expiresAt },
        { upsert: true }
      );

      return {
        provider: 'Google Safe Browsing',
        configured: true,
        status: isListed ? 'malicious' : 'clean',
        details: isListed ? `Flagged as confirmed ${category}` : 'No known threats recorded in Safe Browsing index.',
        lastChecked: new Date()
      };
    } catch (error: any) {
      console.warn('Safe Browsing API check failed:', error.message);
      return {
        provider: 'Google Safe Browsing',
        configured: true,
        status: 'error',
        details: 'Service check encountered a network/timeout error.',
        error: error.message,
        lastChecked: new Date()
      };
    }
  }

  // Check VirusTotal
  public async checkVirusTotal(url: string): Promise<IProviderResult> {
    if (!this.virusTotalKey) {
      return {
        provider: 'VirusTotal',
        configured: false,
        status: 'unconfigured',
        details: 'VirusTotal API key not configured. External telemetry skipped transparently.',
        lastChecked: new Date()
      };
    }

    try {
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      const endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'x-apikey': this.virusTotalKey },
        signal: AbortSignal.timeout(6000)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            provider: 'VirusTotal',
            configured: true,
            status: 'clean',
            details: 'URL has not been submitted or flagged in VirusTotal repository.',
            positives: 0,
            total: 90,
            lastChecked: new Date()
          };
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const stats = data.data?.attributes?.last_analysis_stats || {};
      const maliciousCount = (stats.malicious || 0) + (stats.suspicious || 0);
      const totalCount = Object.values(stats).reduce((a: any, b: any) => a + b, 0) as number;

      const isThreat = maliciousCount >= 3;

      return {
        provider: 'VirusTotal',
        configured: true,
        status: isThreat ? 'malicious' : maliciousCount > 0 ? 'suspicious' : 'clean',
        details: `${maliciousCount} of ${totalCount} security vendors flagged this URL.`,
        positives: maliciousCount,
        total: totalCount,
        lastChecked: new Date()
      };
    } catch (error: any) {
      console.warn('VirusTotal API check failed:', error.message);
      return {
        provider: 'VirusTotal',
        configured: true,
        status: 'error',
        details: 'VirusTotal check timed out or quota exceeded.',
        error: error.message,
        lastChecked: new Date()
      };
    }
  }

  // Unified Threat Intelligence query
  public async queryIntelligence(url: string, domain: string): Promise<IThreatIntelligenceReport> {
    const [safeBrowsing, virusTotal, dnsLookup] = await Promise.all([
      this.checkSafeBrowsing(url),
      this.checkVirusTotal(url),
      this.auditDomainDns(domain)
    ]);

    const confirmedThreat = safeBrowsing.status === 'malicious' || virusTotal.status === 'malicious';
    const signals: ISignal[] = [];

    if (safeBrowsing.status === 'malicious') {
      signals.push({
        id: 'INTEL_SAFEBROWSING_CONFIRMED',
        category: 'Confirmed Threat Intel',
        severity: 'critical',
        description: safeBrowsing.details,
        source: 'Google Safe Browsing',
        confidence: 0.99,
        confirmed: true
      });
    }

    if (virusTotal.status === 'malicious' || (virusTotal.positives && virusTotal.positives >= 3)) {
      signals.push({
        id: 'INTEL_VIRUSTOTAL_CONFIRMED',
        category: 'Confirmed Threat Intel',
        severity: 'critical',
        description: virusTotal.details,
        source: 'VirusTotal',
        confidence: 0.95,
        confirmed: true
      });
    }

    if (!dnsLookup.resolved && !domain.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      signals.push({
        id: 'INTEL_NXDOMAIN_OR_UNRESOLVED',
        category: 'Domain Infrastructure',
        severity: 'medium',
        description: 'Domain has no active public DNS A records. May be an inactive, blocked, or ephemeral command-and-control endpoint.',
        source: 'Recursive DNS Resolver',
        confidence: 0.85,
        confirmed: true
      });
    }

    return {
      safeBrowsing,
      virusTotal,
      dnsLookup,
      confirmedThreat,
      signals
    };
  }
}

export const threatIntelService = new ThreatIntelService();
