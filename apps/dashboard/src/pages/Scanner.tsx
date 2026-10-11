import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Globe, 
  Radio, 
  ExternalLink,
  ArrowRight,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { api } from '../services/api';

interface ScannerProps {
  openCopilot: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ openCopilot }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const sampleTargets = [
    { label: 'Benign Authority', url: 'https://en.wikipedia.org/wiki/Computer_security' },
    { label: 'Phishing Impersonation', url: 'https://paypal-security-update.account-verification.top/login.php' },
    { label: 'Raw IP Host Vector', url: 'http://192.168.1.105:8080/secure/wallet-claim.html' },
  ];

  const handleScan = async (targetUrl?: string) => {
    const inputToScan = (targetUrl || url).trim();
    if (!inputToScan) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await api.runAnalysis(inputToScan, 'scanner');
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-500/50 bg-red-950/20';
    if (score >= 25) return 'text-amber-400 border-amber-500/50 bg-amber-950/20';
    return 'text-emerald-400 border-emerald-500/50 bg-emerald-950/20';
  };

  return (
    <div className="space-y-6">
      {/* Search Input Section */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            AI-Powered Website Threat Scanner
          </h2>
          <p className="text-xs text-slate-300">
            Submit any URL for real-time heuristic parsing, lexical entropy calculation, DNS verification, and machine learning risk classification.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleScan();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter destination URL (e.g. https://domain.com/path or raw IP)..."
              disabled={loading}
              className="w-full bg-[#050B14] border border-cyan-900/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing Telemetry...
              </>
            ) : (
              <>
                <span>Inspect URL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Test Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-mono">Sample Test Vectors:</span>
          {sampleTargets.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrl(sample.url);
                handleScan(sample.url);
              }}
              disabled={loading}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 hover:border-cyan-500/50 hover:bg-slate-850 transition"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-300 flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Main Result Card */}
          <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/40 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400">Target Inspected</span>
                <h3 className="text-xl font-bold text-white break-all">{result.domain}</h3>
                <p className="text-xs text-slate-400 font-mono break-all">{result.url}</p>
              </div>

              {/* Risk Score Pill */}
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl border text-center ${getScoreColor(result.score)} shadow-inner`}>
                  <div className="text-3xl font-extrabold font-mono leading-none">{result.score}</div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold mt-1">Risk Score / 100</div>
                </div>
                <div className="space-y-1">
                  <div className={`text-sm font-bold uppercase tracking-wider ${
                    result.score >= 70 ? 'text-red-400' : result.score >= 25 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {result.riskLabel}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {result.score >= 70 ? 'Immediate Defensive Action Required' : result.score >= 25 ? 'Proceed with Extreme Caution' : 'Nominal Behavioral Baseline'}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Security Assessment */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-cyan-950/20 border border-cyan-800/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Grounded AI Security Analysis
                </span>
                <button
                  onClick={openCopilot}
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Discuss with Copilot <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {result.explanation || 'No explicit vulnerabilities observed during telemetry evaluation.'}
              </p>
            </div>

            {/* Tri-Grid: Heuristic Signals, ML Prediction, Threat Intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Heuristic Signals */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Heuristic Signals ({result.signals?.length || 0})
                </span>
                <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar">
                  {(!result.signals || result.signals.length === 0) ? (
                    <div className="text-xs text-slate-500 py-3">No suspicious heuristic patterns flagged.</div>
                  ) : (
                    result.signals.map((sig: any, idx: number) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            sig.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            sig.severity === 'high' ? 'bg-red-500/10 text-red-400' :
                            sig.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-700/30 text-slate-400'
                          }`}>
                            {sig.severity}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{sig.category}</span>
                        </div>
                        <p className="text-[11px] text-slate-300">{sig.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Machine Learning Probability */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Machine Learning Model
                </span>
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Malicious Probability</span>
                      <span className="font-mono font-bold text-white">
                        {Math.round((result.mlPrediction?.probability || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.round((result.mlPrediction?.probability || 0) * 100))}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-850 text-xs space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Classification:</span>
                      <span className="font-semibold text-slate-200">{result.mlPrediction?.prediction || 'Benign / Low Risk'}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Model Version:</span>
                      <span className="font-mono text-cyan-400">{result.mlPrediction?.modelVersion || 'v1.4.0-logistic-rf'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Threat Intelligence Feeds */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  Threat Intelligence
                </span>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">Google Safe Browsing</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        result.providerResults?.safeBrowsing?.status === 'malicious' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {result.providerResults?.safeBrowsing?.status || 'clean'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{result.providerResults?.safeBrowsing?.details}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">VirusTotal</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        result.providerResults?.virusTotal?.status === 'malicious' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {result.providerResults?.virusTotal?.status || 'clean'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">{result.providerResults?.virusTotal?.details}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-850 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-300">DNS Resolution</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {result.providerResults?.dnsLookup?.resolved ? 'Resolved' : 'No Records'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate">
                      {result.providerResults?.dnsLookup?.ipAddresses?.join(', ') || 'No public A records'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
