export type RiskLevel = 'Low observed risk' | 'Suspicious' | 'High risk' | 'Unknown or unavailable';

export interface AnalysisResult {
  url: string;
  domain?: string;
  score: number;
  risk: RiskLevel | string;
  indicators?: string[];
  findings?: string[];
  timestamp: number;
}

export function normalizeUrl(rawUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

export function analyzeLocalHeuristics(url: string): AnalysisResult {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    return { url, domain: '', score: 0, risk: 'Unknown or unavailable', indicators: ['Invalid URL'], timestamp: Date.now() };
  }

  const parsed = new URL(normalized);
  const domain = parsed.hostname;
  
  let score = 0;
  const indicators: string[] = [];

  // Check for IP address domain
  const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain);
  if (isIP) {
    score += 40;
    indicators.push('Uses IP address instead of domain name');
  }

  // Check for unusual ports
  if (parsed.port && !['80', '443'].includes(parsed.port)) {
    score += 20;
    indicators.push(`Unusual port: ${parsed.port}`);
  }

  // Suspicious encoding
  if (url.includes('%@') || url.includes('%00')) {
    score += 30;
    indicators.push('Suspicious URL encoding detected');
  }

  // URL length heuristics
  if (url.length > 200) {
    score += 10;
    indicators.push('Unusually long URL');
  }

  // Determine risk level based on score
  let risk: RiskLevel = 'Low observed risk';
  if (score >= 50) {
    risk = 'High risk';
  } else if (score >= 20) {
    risk = 'Suspicious';
  }

  return {
    url: normalized,
    domain,
    score,
    risk,
    indicators,
    timestamp: Date.now(),
  };
}
