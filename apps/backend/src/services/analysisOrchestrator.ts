import mongoose from 'mongoose';
import { normalizeAndValidateUrl } from '../utils/urlNormalizer';
import { analyzeUrlHeuristics } from '../analyzers/heuristicEngine';
import { threatIntelService } from '../providers/threatIntelService';
import { mlRiskEngine } from './mlService';
import { aiSecurityService } from './aiService';
import { Analysis, ISignal } from '../models/Analysis';
import { SecurityEvent } from '../models/SecurityEvent';
import { Notification } from '../models/Notification';
import { socketService } from './socketService';

export interface IOrchestratedAnalysisOptions {
  url: string;
  userId?: string;
  source?: 'extension' | 'scanner' | 'api';
}

export async function orchestrateAnalysis(options: IOrchestratedAnalysisOptions) {
  const { url, userId, source = 'scanner' } = options;

  // 1. Validation & SSRF Normalization
  const urlData = normalizeAndValidateUrl(url);
  if (!urlData.isValid) {
    throw new Error(urlData.error || 'Invalid or prohibited destination URL');
  }

  // 2. Deterministic Heuristic Engine
  const heuristicReport = analyzeUrlHeuristics(urlData);

  // 3. Threat Intelligence Providers & DNS Audit
  const intelReport = await threatIntelService.queryIntelligence(urlData.normalized, urlData.domain);

  // 4. ML Risk Prediction Pipeline
  const mlResult = mlRiskEngine.predict(urlData.normalized);

  // 5. Signal Fusion & Score Arbitration
  const combinedSignals: ISignal[] = [
    ...intelReport.signals,
    ...heuristicReport.signals
  ];

  let finalScore = heuristicReport.score;
  let finalRiskLabel: 'Low observed risk' | 'Suspicious' | 'High risk' | 'Confirmed threat match' = heuristicReport.riskLabel;

  if (intelReport.confirmedThreat) {
    // Confirmed Threat Intelligence match takes strict precedence
    finalScore = Math.max(95, finalScore);
    finalRiskLabel = 'Confirmed threat match';
  } else {
    // Blend Heuristics (60%) and ML Probability (40%)
    const weightedScore = Math.round(heuristicReport.score * 0.6 + mlResult.score * 0.4);
    finalScore = Math.min(100, Math.max(0, weightedScore));
    
    if (finalScore >= 70) finalRiskLabel = 'High risk';
    else if (finalScore >= 25) finalRiskLabel = 'Suspicious';
    else finalRiskLabel = 'Low observed risk';
  }

  const indicators = [
    ...intelReport.signals.map(s => s.description),
    ...heuristicReport.indicators
  ];

  // 6. Grounded AI Explanation
  const explanation = await aiSecurityService.generateRiskExplanation({
    url: urlData.normalized,
    domain: urlData.domain,
    score: finalScore,
    riskLabel: finalRiskLabel,
    signals: combinedSignals,
    indicators,
    providerResults: {
      safeBrowsing: intelReport.safeBrowsing,
      virusTotal: intelReport.virusTotal,
      dnsLookup: intelReport.dnsLookup
    },
    mlPrediction: {
      score: mlResult.score,
      probability: mlResult.probability,
      prediction: mlResult.prediction
    }
  });

  // 7. Persist Analysis to MongoDB
  const analysisDoc = new Analysis({
    user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    url: urlData.normalized,
    domain: urlData.domain,
    score: finalScore,
    riskLabel: finalRiskLabel,
    signals: combinedSignals,
    indicators,
    mlPrediction: {
      score: mlResult.score,
      prediction: mlResult.prediction,
      probability: mlResult.probability,
      modelVersion: mlResult.modelVersion,
      features: mlResult.features
    },
    providerResults: {
      safeBrowsing: intelReport.safeBrowsing,
      virusTotal: intelReport.virusTotal,
      dnsLookup: intelReport.dnsLookup
    },
    explanation,
    analysisStatus: 'completed',
    analyzedAt: new Date()
  });

  // 7. Persist Analysis to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    try {
      await analysisDoc.save();

      // 8. If High Risk or Confirmed Threat, Generate Real Security Event & Notification
      if (finalRiskLabel === 'High risk' || finalRiskLabel === 'Confirmed threat match') {
        const eventType = intelReport.confirmedThreat ? 'MALWARE_DETECTED' : 'PHISHING_ATTEMPT';
        const securityEvent = new SecurityEvent({
          user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          type: eventType,
          severity: finalRiskLabel === 'Confirmed threat match' ? 'critical' : 'high',
          description: `Intercepted dangerous navigation to ${urlData.domain}. Risk Score: ${finalScore}/100.`,
          target: urlData.domain,
          source: source === 'extension' ? 'extension' : 'scanner',
          metadata: {
            url: urlData.normalized,
            score: finalScore,
            riskLabel: finalRiskLabel,
            signals: combinedSignals.slice(0, 3).map(s => s.id)
          },
          timestamp: new Date()
        });
        await securityEvent.save();

        // Create Notification
        const notification = new Notification({
          user: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          title: `${finalRiskLabel === 'Confirmed threat match' ? 'Critical Threat' : 'High Risk'} Intercepted`,
          message: `Blocked suspicious activity on ${urlData.domain} (${finalScore}/100)`,
          type: 'threat',
          link: `/scan?url=${encodeURIComponent(urlData.normalized)}`,
          timestamp: new Date()
        });
        await notification.save();

        // Broadcast Real-Time Alerts
        socketService.emitSecurityEvent(userId, securityEvent);
        socketService.emitNotification(userId, notification);
      }

      // Broadcast Scan Completed
      socketService.emitScanComplete(userId, analysisDoc);
    } catch (saveErr) {
      console.warn('⚠️ Telemetry database persistence skipped:', saveErr);
    }
  }

  return {
    id: analysisDoc._id,
    url: analysisDoc.url,
    domain: analysisDoc.domain,
    score: analysisDoc.score,
    riskLabel: analysisDoc.riskLabel,
    signals: analysisDoc.signals,
    indicators: analysisDoc.indicators,
    explanation: analysisDoc.explanation,
    mlPrediction: analysisDoc.mlPrediction,
    providerResults: analysisDoc.providerResults,
    timestamp: analysisDoc.analyzedAt
  };
}
