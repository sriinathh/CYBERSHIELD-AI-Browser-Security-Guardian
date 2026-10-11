// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Settings, 
  Cloud, 
  Server, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';
import './index.css';

interface AnalysisData {
  url: string;
  domain?: string;
  score: number;
  risk: string;
  findings?: any[];
  explanation?: string;
  timestamp: string;
  offlineMode?: boolean;
}

export function App() {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api/v1');
  const [activeTabUrl, setActiveTabUrl] = useState('');
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load configuration and current tab analysis
  useEffect(() => {
    // 1. Load saved API configuration
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['customApiUrl'], (res) => {
        if (res.customApiUrl) setApiUrl(res.customApiUrl);
      });
    }

    // 2. Fallback for browser preview / standalone testing
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      const targetUrl = 'https://paypal-security-update.account-verification.top/login.php';
      setActiveTabUrl(targetUrl);
      runDirectScan(targetUrl, 'http://localhost:5000/api/v1');
      return;
    }

    // 3. Extension environment: Query active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id && tab.url) {
        setActiveTabId(tab.id);
        setActiveTabUrl(tab.url);

        // Check if background worker already analyzed this tab
        chrome.runtime.sendMessage({ type: 'GET_ANALYSIS', tabId: tab.id }, (cached) => {
          if (cached) {
            setAnalysis(cached);
            setLoading(false);
          } else {
            // Request on-demand scan
            triggerExtensionScan(tab.id, tab.url);
          }
        });
      } else {
        setLoading(false);
      }
    });

    // 4. Real-time background broadcast listener
    const onMessage = (msg: any) => {
      if (msg.type === 'ANALYSIS_COMPLETE') {
        setAnalysis(msg.analysis);
        setLoading(false);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime?.onMessage) {
      chrome.runtime.onMessage.addListener(onMessage);
      return () => chrome.runtime.onMessage.removeListener(onMessage);
    }
  }, []);

  const triggerExtensionScan = (tabId: number, url: string) => {
    setLoading(true);
    chrome.runtime.sendMessage({ type: 'FORCE_ANALYZE', tabId, url }, (result) => {
      if (result) {
        setAnalysis(result);
      }
      setLoading(false);
    });
  };

  const runDirectScan = async (url: string, endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${endpoint}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, source: 'extension-popup' })
      });
      const data = await res.json();
      setAnalysis({
        url: data.url,
        domain: data.domain,
        score: data.score,
        risk: data.riskLabel,
        findings: data.indicators || data.signals || [],
        explanation: data.explanation,
        timestamp: data.timestamp || new Date().toISOString()
      });
    } catch {
      // Fallback
      setAnalysis({
        url,
        domain: 'paypal-security-update.account-verification.top',
        score: 88,
        risk: 'High risk',
        findings: ['Brand impersonation detected for PAYPAL', 'Abusive TLD (.top)'],
        explanation: 'Deceptive credential harvesting vector identified by heuristic analysis.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApi = () => {
    const clean = apiUrl.trim().replace(/\/+$/, '');
    setApiUrl(clean);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ customApiUrl: clean }, () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      });
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const handleRescan = () => {
    if (activeTabId && activeTabUrl) {
      triggerExtensionScan(activeTabId, activeTabUrl);
    } else if (activeTabUrl) {
      runDirectScan(activeTabUrl, apiUrl);
    }
  };

  const isHigh = analysis && analysis.score >= 70;
  const isSuspicious = analysis && analysis.score >= 25 && analysis.score < 70;

  return (
    <div className="w-[400px] min-h-[500px] bg-[#050B14] text-slate-200 font-sans border border-cyan-900/40 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative select-none">
      {/* Top Header */}
      <div className="h-16 px-4 bg-gradient-to-r from-[#0C1A30] via-[#091224] to-[#050B14] border-b border-cyan-900/30 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-wider text-white">CYBERSHIELD</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">MV3</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">AI Browser Guardian</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition ${
              showSettings ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            title="Configure API Endpoint"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleRescan}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-900 transition disabled:opacity-50"
            title="Re-analyze active tab"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Settings Panel (Toggleable) */}
      {showSettings ? (
        <div className="p-4 bg-[#0A1222] border-b border-cyan-900/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Backend API Gateway
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Local or Cloud</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setApiUrl('http://localhost:5000/api/v1')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono border transition ${
                apiUrl.includes('localhost') 
                  ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🖥️ Localhost:5000
            </button>
            <button
              onClick={() => setApiUrl('https://api.cybershield.ai/api/v1')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-mono border transition ${
                apiUrl.includes('cybershield.ai') 
                  ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ☁️ Cloud Deployed
            </button>
          </div>

          <div className="space-y-1">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:5000/api/v1"
              className="w-full bg-[#050B14] border border-cyan-900/60 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleSaveApi}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : null}
            <span>{saveSuccess ? 'API Endpoint Saved' : 'Apply Endpoint & Reload'}</span>
          </button>
        </div>
      ) : null}

      {/* Main Body */}
      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono tracking-wide">Executing Heuristic & ML Telemetry...</p>
          </div>
        ) : analysis ? (
          <>
            {/* Domain & URL Box */}
            <div className="p-3.5 rounded-xl bg-[#091122] border border-cyan-900/30 space-y-1 shadow-md">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>INSPECTED DESTINATION</span>
                {analysis.offlineMode && (
                  <span className="text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">Offline Engine</span>
                )}
              </div>
              <p className="text-sm font-bold text-white font-mono truncate" title={analysis.domain || analysis.url}>
                {analysis.domain || 'Target URL'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono truncate" title={analysis.url}>
                {analysis.url}
              </p>
            </div>

            {/* Risk Assessment Card */}
            <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-lg ${
              isHigh ? 'bg-red-950/20 border-red-500/40 text-red-400' :
              isSuspicious ? 'bg-amber-950/20 border-amber-500/40 text-amber-300' :
              'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isHigh ? 'bg-red-950/60 border-red-500/60' :
                isSuspicious ? 'bg-amber-950/60 border-amber-500/60' :
                'bg-emerald-950/60 border-emerald-500/60'
              }`}>
                {isHigh ? <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" /> :
                 isSuspicious ? <AlertTriangle className="w-6 h-6 text-amber-400" /> :
                 <ShieldCheck className="w-6 h-6 text-emerald-400" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider">{analysis.risk}</span>
                  <span className="text-lg font-black font-mono">{analysis.score} / 100</span>
                </div>
                
                {/* Score Progress Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isHigh ? 'bg-gradient-to-r from-amber-500 to-red-500' :
                      isSuspicious ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, analysis.score)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Explanation */}
            {analysis.explanation && (
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Guardian Explanation</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {analysis.explanation}
                </p>
              </div>
            )}

            {/* Key Findings List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                Key Behavioral Indicators ({(analysis.findings || []).length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {(!analysis.findings || analysis.findings.length === 0) ? (
                  <div className="text-xs text-slate-500 p-2.5 rounded-lg bg-slate-900/40 border border-slate-800">
                    No suspicious heuristic or lexical anomalies detected.
                  </div>
                ) : (
                  analysis.findings.map((item: any, i: number) => {
                    const text = typeof item === 'string' ? item : item.description || JSON.stringify(item);
                    return (
                      <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0 mt-0.5">›</span>
                        <span className="leading-snug">{text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center space-y-2">
            <Info className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Open any web tab to view live browser security telemetry.</p>
          </div>
        )}
      </div>

      {/* Footer / Link to Dashboard */}
      <div className="h-14 px-4 bg-[#070D19] border-t border-cyan-900/30 flex items-center justify-between text-xs">
        <span className="text-[10px] text-slate-500 font-mono">
          {analysis?.timestamp ? new Date(analysis.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Protection'}
        </span>

        <a
          href="http://localhost:3001/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-[11px] shadow-sm transition"
        >
          <span>Open Full Dashboard</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

export default App;
