// @ts-nocheck
// =========================================================================
// CYBERSHIELD BROWSER SECURITY GUARDIAN - SERVICE WORKER (MANIFEST V3)
// Supports dynamic API switching: Localhost (http://localhost:5000/api/v1)
// and Cloud Deployment (e.g. https://api.cybershield.ai/api/v1)
// =========================================================================

const DEFAULT_LOCAL_API = 'http://localhost:5000/api/v1';
const DEFAULT_CLOUD_API = 'https://api.cybershield.ai/api/v1';

// Retrieve active API endpoint from chrome storage or default
async function getApiEndpoint(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      resolve(DEFAULT_LOCAL_API);
      return;
    }
    chrome.storage.local.get(['customApiUrl', 'useCloudApi'], (items) => {
      if (items.customApiUrl && items.customApiUrl.trim()) {
        resolve(items.customApiUrl.trim().replace(/\/+$/, ''));
      } else if (items.useCloudApi) {
        resolve(DEFAULT_CLOUD_API);
      } else {
        resolve(DEFAULT_LOCAL_API);
      }
    });
  });
}

// Perform analysis request against chosen endpoint with fallback
async function fetchBackendAnalysis(targetUrl: string) {
  const endpoint = await getApiEndpoint();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${endpoint}/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: targetUrl, source: 'extension' }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`[CyberShield] Primary API (${endpoint}) failed or timed out:`, error);
  }

  // Resilient heuristic client fallback if backend is momentarily unreachable
  return performOfflineAnalysis(targetUrl);
}

// Local offline heuristic fallback
function performOfflineAnalysis(targetUrl: string) {
  try {
    const parsed = new URL(targetUrl);
    const domain = parsed.hostname;
    let score = 5;
    const indicators: string[] = [];

    // IP address test
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      score += 45;
      indicators.push('Raw IPv4 host address navigation');
    }

    // Punycode
    if (domain.includes('xn--')) {
      score += 40;
      indicators.push('Internationalized Punycode homoglyph pattern');
    }

    // Abusive TLDs
    if (/\.(top|xyz|buzz|work|quest|click|fit|gq)$/i.test(domain)) {
      score += 25;
      indicators.push(`Elevated abuse TLD observed (${domain.split('.').pop()})`);
    }

    // Brand impersonation in subdomain or path
    const brands = ['paypal', 'metamask', 'binance', 'coinbase', 'apple', 'microsoft', 'google'];
    for (const b of brands) {
      if (domain.includes(b) && !domain.endsWith(`.${b}.com`) && domain !== `${b}.com`) {
        score += 40;
        indicators.push(`Suspicious brand impersonation pattern: ${b.toUpperCase()}`);
        break;
      }
    }

    // Non standard ports
    if (parsed.port && !['80', '443'].includes(parsed.port)) {
      score += 25;
      indicators.push(`Non-standard service port :${parsed.port}`);
    }

    score = Math.min(100, score);
    const riskLabel = score >= 70 ? 'High risk' : score >= 25 ? 'Suspicious' : 'Low observed risk';

    return {
      url: targetUrl,
      domain,
      score,
      riskLabel,
      indicators: indicators.length > 0 ? indicators : ['Autonomous local baseline check passed'],
      signals: indicators.map(ind => ({ description: ind, severity: score >= 70 ? 'high' : 'medium' })),
      explanation: `Offline heuristic evaluation: ${riskLabel} (${score}/100).`,
      timestamp: new Date().toISOString(),
      offlineMode: true
    };
  } catch {
    return null;
  }
}

// Listen for tab navigation updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
    
    // Fetch real analysis from backend
    const backendResult = await fetchBackendAnalysis(tab.url);
    
    if (backendResult) {
      const analysis = {
        url: backendResult.url || tab.url,
        domain: backendResult.domain || new URL(tab.url).hostname,
        risk: backendResult.riskLabel,
        score: backendResult.score,
        findings: backendResult.indicators || backendResult.signals || [],
        explanation: backendResult.explanation,
        timestamp: backendResult.timestamp || new Date().toISOString(),
        offlineMode: !!backendResult.offlineMode
      };
      
      // Save tab-specific analysis in local cache
      chrome.storage.local.set({ [`analysis_${tabId}`]: analysis });
      
      // Send real-time message to open popup
      chrome.runtime.sendMessage({ type: 'ANALYSIS_COMPLETE', tabId, analysis }).catch(() => {});
      
      // Update badge indicator
      let color = '#10B981'; // Green
      let text = '✓';
      
      if (analysis.risk === 'High risk' || analysis.score >= 70) {
        color = '#EF4444'; // Red
        text = '!';
      } else if (analysis.risk === 'Suspicious' || analysis.score >= 25) {
        color = '#F59E0B'; // Amber
        text = '?';
      }

      chrome.action.setBadgeBackgroundColor({ tabId, color });
      chrome.action.setBadgeText({ tabId, text });
      chrome.action.setBadgeTextColor({ tabId, color: '#FFFFFF' }).catch(() => {});
    }
  }
});

// Handle requests from popup or content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'GET_ANALYSIS') {
    const tabId = request.tabId;
    chrome.storage.local.get([`analysis_${tabId}`], (result) => {
      sendResponse(result[`analysis_${tabId}`] || null);
    });
    return true; // asynchronous response
  }

  if (request.type === 'FORCE_ANALYZE') {
    fetchBackendAnalysis(request.url).then((res) => {
      if (res && request.tabId) {
        const analysis = {
          url: res.url || request.url,
          domain: res.domain || new URL(request.url).hostname,
          risk: res.riskLabel,
          score: res.score,
          findings: res.indicators || res.signals || [],
          explanation: res.explanation,
          timestamp: res.timestamp || new Date().toISOString(),
          offlineMode: !!res.offlineMode
        };
        chrome.storage.local.set({ [`analysis_${request.tabId}`]: analysis });
        sendResponse(analysis);
      } else {
        sendResponse(null);
      }
    });
    return true;
  }
});
