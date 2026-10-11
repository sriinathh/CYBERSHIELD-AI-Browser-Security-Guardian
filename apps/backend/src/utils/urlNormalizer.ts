import { URL } from 'url';

export interface INormalizedUrl {
  original: string;
  normalized: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  domain: string;
  subdomains: string[];
  tld: string;
  isIpAddress: boolean;
  isPunycode: boolean;
  isValid: boolean;
  error?: string;
}

// Private IPv4 ranges for SSRF prevention
const PRIVATE_IP_REGEX = /^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|0\.|::1|fe80:)/i;

export function normalizeAndValidateUrl(inputUrl: string): INormalizedUrl {
  const trimmed = inputUrl.trim();
  
  // Basic sanity check
  if (!trimmed) {
    return {
      original: inputUrl,
      normalized: '',
      protocol: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      domain: '',
      subdomains: [],
      tld: '',
      isIpAddress: false,
      isPunycode: false,
      isValid: false,
      error: 'URL cannot be empty'
    };
  }

  // Prepend https:// if protocol is omitted
  let formatted = trimmed;
  if (!/^https?:\/\//i.test(formatted)) {
    formatted = `https://${formatted}`;
  }

  try {
    const parsed = new URL(formatted);

    // Enforce HTTP / HTTPS only
    if (!['http:', 'https:'].includes(parsed.protocol.toLowerCase())) {
      return {
        original: inputUrl,
        normalized: '',
        protocol: parsed.protocol,
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        domain: '',
        subdomains: [],
        tld: '',
        isIpAddress: false,
        isPunycode: false,
        isValid: false,
        error: `Unsupported protocol: ${parsed.protocol}. Only http and https are permitted.`
      };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check if host is raw IP address
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':');

    // SSRF Check - ensure server does not fetch internal infrastructure
    if (isIpAddress && PRIVATE_IP_REGEX.test(hostname)) {
      return {
        original: inputUrl,
        normalized: '',
        protocol: parsed.protocol,
        hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        domain: hostname,
        subdomains: [],
        tld: '',
        isIpAddress: true,
        isPunycode: false,
        isValid: false,
        error: 'Target references a private, loopback, or link-local address. SSRF protection active.'
      };
    }

    if (hostname === 'localhost') {
      return {
        original: inputUrl,
        normalized: '',
        protocol: parsed.protocol,
        hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        domain: hostname,
        subdomains: [],
        tld: '',
        isIpAddress: false,
        isPunycode: false,
        isValid: false,
        error: 'Localhost destinations cannot be scanned for public threat telemetry.'
      };
    }

    const isPunycode = hostname.includes('xn--');

    // Parse subdomains and TLD
    const parts = hostname.split('.');
    const tld = parts.length > 1 ? parts[parts.length - 1] : '';
    const domain = parts.length >= 2 ? `${parts[parts.length - 2]}.${tld}` : hostname;
    const subdomains = parts.length > 2 ? parts.slice(0, parts.length - 2) : [];

    // Strip common marketing tracking tokens from search params for clean analysis
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    const cleanSearch = new URLSearchParams(parsed.search);
    trackingParams.forEach(p => cleanSearch.delete(p));
    const finalSearch = cleanSearch.toString() ? `?${cleanSearch.toString()}` : '';

    const normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname}${finalSearch}`;

    return {
      original: inputUrl,
      normalized,
      protocol: parsed.protocol,
      hostname,
      port: parsed.port,
      pathname: parsed.pathname,
      search: finalSearch,
      domain,
      subdomains,
      tld,
      isIpAddress,
      isPunycode,
      isValid: true
    };
  } catch (err: any) {
    return {
      original: inputUrl,
      normalized: '',
      protocol: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      domain: '',
      subdomains: [],
      tld: '',
      isIpAddress: false,
      isPunycode: false,
      isValid: false,
      error: `Malformed URL structure: ${err.message}`
    };
  }
}
