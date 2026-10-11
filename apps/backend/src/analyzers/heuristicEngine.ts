import { INormalizedUrl } from '../utils/urlNormalizer';
import { ISignal } from '../models/Analysis';

// High-abuse TLDs frequently seen in bulk phishing / spam campaigns
const HIGH_ABUSE_TLDS = new Set([
  'top', 'xyz', 'fit', 'work', 'click', 'cf', 'gq', 'ml', 'ga', 'tk',
  'tokyo', 'racing', 'download', 'stream', 'accountant', 'date', 'faith', 'cricket', 'party'
]);

// Trusted high-profile brands targeted for impersonation
const TARGETED_BRANDS = [
  'paypal', 'google', 'microsoft', 'apple', 'amazon', 'netflix', 'facebook',
  'instagram', 'chase', 'wellsfargo', 'bankofamerica', 'coinbase', 'binance',
  'metamask', 'ledger', 'trezor', 'twitter', 'discord', 'steam', 'github'
];

// Phishing keywords common in attack vectors
const PHISHING_KEYWORDS = [
  'login', 'signin', 'verify', 'verification', 'secure', 'account', 'banking',
  'billing', 'update', 'confirm', 'wallet', 'airdrop', 'claim', 'bonus',
  'support-desk', 'security-alert', 're-auth', 'restore', 'password-reset'
];

// Free dynamic DNS or ephemeral hosting providers often leveraged by short-lived malware
const EPHEMERAL_HOST_PATTERNS = [
  'duckdns.org', 'ngrok-free.app', 'loca.lt', 'serveo.net', 'pages.dev',
  'workers.dev', 'vercel.app', 'web.app', 'firebaseapp.com', 'glitch.me'
];

// Calculate Shannon entropy of a string (useful for detecting DGA / random tokens)
function calculateEntropy(str: string): number {
  if (!str) return 0;
  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export interface IHeuristicReport {
  score: number;
  riskLabel: 'Low observed risk' | 'Suspicious' | 'High risk' | 'Confirmed threat match';
  signals: ISignal[];
  indicators: string[];
  metrics: {
    urlLength: number;
    subdomainCount: number;
    entropy: number;
    hasIpHost: boolean;
    hasHighAbuseTld: boolean;
  };
}

export function analyzeUrlHeuristics(urlData: INormalizedUrl): IHeuristicReport {
  const signals: ISignal[] = [];
  const indicators: string[] = [];
  let score = 0;

  const { hostname, pathname, search, isIpAddress, isPunycode, tld, subdomains, port, protocol } = urlData;
  const fullUrl = urlData.normalized.toLowerCase();
  const hostLower = hostname.toLowerCase();

  // 1. IP address in Hostname
  if (isIpAddress) {
    score += 45;
    const desc = `Destination connects directly via raw IP address (${hostname}) instead of a verified domain name.`;
    signals.push({
      id: 'HEUR_IP_HOST',
      category: 'Network & Host',
      severity: 'high',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.95,
      confirmed: true
    });
    indicators.push(desc);
  }

  // 2. Non-standard HTTP/HTTPS Port
  if (port && !['80', '443'].includes(port)) {
    score += 25;
    const desc = `Non-standard network port detected: ${port}. Legitimate web portals rarely expose non-standard ports.`;
    signals.push({
      id: 'HEUR_NON_STD_PORT',
      category: 'Network & Port',
      severity: 'medium',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.85,
      confirmed: true
    });
    indicators.push(desc);
  }

  // 3. High-Abuse TLD
  if (HIGH_ABUSE_TLDS.has(tld.toLowerCase())) {
    score += 20;
    const desc = `Top-Level Domain (.${tld}) has a statistically high volume of disposable phishing domains.`;
    signals.push({
      id: 'HEUR_ABUSIVE_TLD',
      category: 'Domain Reputation',
      severity: 'medium',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.70,
      confirmed: false
    });
    indicators.push(desc);
  }

  // 4. Punycode / Homoglyph Lookalike
  if (isPunycode) {
    score += 40;
    const desc = `Internationalized Domain (Punycode: ${hostname}) detected. Often leveraged in visual homoglyph attacks.`;
    signals.push({
      id: 'HEUR_PUNYCODE_HOMOGLYPH',
      category: 'Deceptive Naming',
      severity: 'high',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.88,
      confirmed: true
    });
    indicators.push(desc);
  }

  // 5. Excessive Subdomain Nesting
  if (subdomains.length >= 3) {
    score += 15;
    const desc = `Excessive subdomain nesting (${subdomains.length} tiers). Often used to disguise true root authority.`;
    signals.push({
      id: 'HEUR_DEEP_SUBDOMAINS',
      category: 'URL Structure',
      severity: 'low',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.75,
      confirmed: false
    });
    indicators.push(desc);
  }

  // 6. Excessive URL Length
  const urlLen = urlData.normalized.length;
  if (urlLen > 180) {
    score += 15;
    const desc = `Unusually long URL length (${urlLen} characters) with complex obfuscated parameters.`;
    signals.push({
      id: 'HEUR_EXCESSIVE_LENGTH',
      category: 'URL Structure',
      severity: 'low',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.65,
      confirmed: false
    });
    indicators.push(desc);
  }

  // 7. Suspicious URL Encoding / Null Bytes
  if (fullUrl.includes('%00') || fullUrl.includes('%40') || fullUrl.includes('%2525') || fullUrl.includes('@')) {
    score += 35;
    const desc = 'Detected credential delimiters (@) or double-encoded null byte sequences in URL path.';
    signals.push({
      id: 'HEUR_DECEPTIVE_ENCODING',
      category: 'Payload Obfuscation',
      severity: 'high',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.92,
      confirmed: true
    });
    indicators.push(desc);
  }

  // 8. Brand Impersonation / Typosquatting
  let brandMatchFound = '';
  for (const brand of TARGETED_BRANDS) {
    // Check if brand is in subdomains or path, but NOT the legitimate apex domain
    const isApexBrand = hostLower === `${brand}.com` || hostLower === `www.${brand}.com`;
    if (!isApexBrand && (hostLower.includes(brand) || pathname.toLowerCase().includes(brand))) {
      brandMatchFound = brand;
      break;
    }
  }

  if (brandMatchFound) {
    score += 40;
    const desc = `Potential brand impersonation detected for "${brandMatchFound.toUpperCase()}". Root domain does not match official entity.`;
    signals.push({
      id: 'HEUR_BRAND_IMPERSONATION',
      category: 'Brand Protection',
      severity: 'high',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.85,
      confirmed: false
    });
    indicators.push(desc);
  }

  // 9. Phishing Keywords in Host or Path
  const matchedKeywords = PHISHING_KEYWORDS.filter(kw => hostLower.includes(kw) || pathname.toLowerCase().includes(kw));
  if (matchedKeywords.length > 0) {
    const points = Math.min(30, matchedKeywords.length * 15);
    score += points;
    const desc = `Contains sensitive authentication/security keywords: [${matchedKeywords.slice(0, 3).join(', ')}].`;
    signals.push({
      id: 'HEUR_PHISHING_KEYWORDS',
      category: 'Credential Phishing',
      severity: matchedKeywords.length >= 2 ? 'high' : 'medium',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.80,
      confirmed: false
    });
    indicators.push(desc);
  }

  // 10. Ephemeral or Cloud-Tunnel Host with Sensitive Keywords
  const isEphemeral = EPHEMERAL_HOST_PATTERNS.some(pat => hostLower.endsWith(pat));
  if (isEphemeral && matchedKeywords.length > 0) {
    score += 30;
    const desc = `Free cloud hosting/tunnel provider (${hostLower}) hosting authentication-sensitive portal. High phishing correlation.`;
    signals.push({
      id: 'HEUR_EPHEMERAL_PHISHING',
      category: 'Infrastructure Abuse',
      severity: 'high',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.90,
      confirmed: false
    });
    indicators.push(desc);
  }

  // 11. Unencrypted HTTP with Authentication/Sensitive terms
  if (protocol === 'http:' && (matchedKeywords.length > 0 || isIpAddress)) {
    score += 25;
    const desc = 'Unencrypted HTTP protocol transmitting sensitive identity/login contexts without TLS.';
    signals.push({
      id: 'HEUR_UNENCRYPTED_SENSITIVE',
      category: 'Transport Security',
      severity: 'medium',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.99,
      confirmed: true
    });
    indicators.push(desc);
  }

  // 12. Shannon Entropy of Path
  const pathEntropy = calculateEntropy(pathname + search);
  if (pathEntropy > 4.5 && pathname.length > 20) {
    score += 15;
    const desc = `High string randomness (entropy ${pathEntropy.toFixed(2)}) in URI path. Typical of automated exploit payloads.`;
    signals.push({
      id: 'HEUR_HIGH_ENTROPY_URI',
      category: 'Payload Obfuscation',
      severity: 'low',
      description: desc,
      source: 'Heuristic Engine',
      confidence: 0.70,
      confirmed: false
    });
    indicators.push(desc);
  }

  // Cap score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  // Determine Categorical Label
  let riskLabel: 'Low observed risk' | 'Suspicious' | 'High risk' | 'Confirmed threat match' = 'Low observed risk';
  if (finalScore >= 70) {
    riskLabel = 'High risk';
  } else if (finalScore >= 25) {
    riskLabel = 'Suspicious';
  }

  if (indicators.length === 0) {
    indicators.push('No recognized malicious patterns or obfuscation detected in heuristic inspection.');
  }

  return {
    score: finalScore,
    riskLabel,
    signals,
    indicators,
    metrics: {
      urlLength: urlLen,
      subdomainCount: subdomains.length,
      entropy: Number(pathEntropy.toFixed(2)),
      hasIpHost: isIpAddress,
      hasHighAbuseTld: HIGH_ABUSE_TLDS.has(tld.toLowerCase())
    }
  };
}
