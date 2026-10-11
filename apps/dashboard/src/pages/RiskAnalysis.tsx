import React, { useState } from 'react';
import { Cpu, ShieldCheck, ShieldAlert, AlertTriangle, Layers, Percent, Sliders } from 'lucide-react';

export const RiskAnalysis: React.FC = () => {
  const [testIpHost, setTestIpHost] = useState(false);
  const [testPort, setTestPort] = useState(false);
  const [testPunycode, setTestPunycode] = useState(false);
  const [testAbuseTld, setTestAbuseTld] = useState(false);
  const [testBrand, setTestBrand] = useState(false);
  const [testPhishKw, setTestPhishKw] = useState(false);

  // Compute simulated score
  let simScore = 0;
  if (testIpHost) simScore += 45;
  if (testPort) simScore += 25;
  if (testPunycode) simScore += 40;
  if (testAbuseTld) simScore += 20;
  if (testBrand) simScore += 40;
  if (testPhishKw) simScore += 30;
  simScore = Math.min(100, simScore);

  let simLabel = 'Low observed risk';
  if (simScore >= 70) simLabel = 'High risk';
  else if (simScore >= 25) simLabel = 'Suspicious';

  const heuristicWeights = [
    { signal: 'HEUR_IP_HOST', category: 'Network & Host', weight: '+45 pts', desc: 'Direct IP addressing instead of DNS registered domain' },
    { signal: 'HEUR_BRAND_IMPERSONATION', category: 'Brand Protection', weight: '+40 pts', desc: 'Protected brand keyword in non-apex domain or path' },
    { signal: 'HEUR_PUNYCODE_HOMOGLYPH', category: 'Deceptive Naming', weight: '+40 pts', desc: 'Internationalized punycode (xn--) or Cyrillic homoglyph characters' },
    { signal: 'HEUR_PHISHING_KEYWORDS', category: 'Credential Phishing', weight: '+30 pts', desc: 'Sensitive login, verify, banking, or wallet tokens' },
    { signal: 'HEUR_NON_STD_PORT', category: 'Network & Port', weight: '+25 pts', desc: 'Non-standard port allocation (e.g. :8080, :2082)' },
    { signal: 'HEUR_ABUSIVE_TLD', category: 'Domain Reputation', weight: '+20 pts', desc: 'Top-Level Domain with statistically elevated fraud volume (.top, .xyz)' },
    { signal: 'HEUR_HIGH_ENTROPY_URI', category: 'Obfuscation', weight: '+15 pts', desc: 'Shannon character entropy > 4.5 in URL path/query' },
    { signal: 'HEUR_EXCESSIVE_LENGTH', category: 'URL Structure', weight: '+15 pts', desc: 'URL length exceeds 180 characters with nested parameters' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0C1A30] via-[#0A1324] to-[#070D19] border border-cyan-900/40 shadow-xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Cpu className="w-4 h-4 text-cyan-400" />
          RISK ENGINE METHODOLOGY & WEIGHT FORMULATION
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">Explainable Risk Scoring Pipeline</h2>
        <p className="text-xs text-slate-300 max-w-2xl">
          CyberShield scores represent a deterministic composite of 12 lexical and network heuristics fused with a 18-feature machine learning classifier and verified upstream threat feeds.
        </p>
      </div>

      {/* Threshold Definitions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">0 — 24 Points</span>
          <h4 className="text-sm font-bold text-white">Low Observed Risk</h4>
          <p className="text-xs text-slate-300">Standard behavior with verified TLS and legitimate apex domain authority.</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">25 — 69 Points</span>
          <h4 className="text-sm font-bold text-white">Suspicious Anomaly</h4>
          <p className="text-xs text-slate-300">Structural or reputation anomalies requiring user caution and confirmation.</p>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1">
          <span className="text-[10px] font-mono uppercase text-red-400 font-bold">70 — 89 Points</span>
          <h4 className="text-sm font-bold text-white">High Risk Intercept</h4>
          <p className="text-xs text-slate-300">Multiple correlated phishing indicators or deceptive typosquatting signatures.</p>
        </div>

        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1">
          <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">90 — 100 Points</span>
          <h4 className="text-sm font-bold text-white">Confirmed Threat Match</h4>
          <p className="text-xs text-slate-300">Target listed in Google Safe Browsing or multi-engine VirusTotal blacklists.</p>
        </div>
      </div>

      {/* Heuristic Weight Distribution Table */}
      <div className="p-5 rounded-2xl bg-[#091122] border border-cyan-900/30 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Deterministic Signal Weight Matrix</h3>
          <p className="text-xs text-slate-400">Rules applied during real-time telemetry normalization</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Signal Identifier</th>
                <th className="py-2.5 px-3">Domain Category</th>
                <th className="py-2.5 px-3">Impact Weight</th>
                <th className="py-2.5 px-3">Technical Trigger Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {heuristicWeights.map((hw) => (
                <tr key={hw.signal} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 text-cyan-300 font-bold">{hw.signal}</td>
                  <td className="py-3 px-3 text-slate-300">{hw.category}</td>
                  <td className="py-3 px-3 text-amber-400 font-bold">{hw.weight}</td>
                  <td className="py-3 px-3 font-sans text-xs text-slate-300">{hw.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Heuristic Simulator */}
      <div className="p-6 rounded-2xl bg-[#091122] border border-cyan-900/40 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Interactive Risk Engine Simulator
          </h3>
          <p className="text-xs text-slate-400">Toggle sample signals to observe the deterministic score response in real-time.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Raw IP Host (+45)', state: testIpHost, set: setTestIpHost },
            { label: 'Non-Standard Port (+25)', state: testPort, set: setTestPort },
            { label: 'Punycode Homoglyph (+40)', state: testPunycode, set: setTestPunycode },
            { label: 'High-Abuse TLD (+20)', state: testAbuseTld, set: setTestAbuseTld },
            { label: 'Brand Impersonation (+40)', state: testBrand, set: setTestBrand },
            { label: 'Phishing Keywords (+30)', state: testPhishKw, set: setTestPhishKw },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => item.set(!item.state)}
              className={`p-3 rounded-xl border text-xs font-medium text-left transition ${
                item.state 
                  ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.state ? '✅ ' : '⬜ '} {item.label}
            </button>
          ))}
        </div>

        {/* Calculated Simulation Output */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase">Simulated Output</span>
            <div className="text-xs text-slate-200 mt-0.5">Classification: <span className="font-bold text-white">{simLabel}</span></div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-cyan-400">{simScore} / 100</div>
          </div>
        </div>
      </div>
    </div>
  );
};
