import mongoose, { Document } from 'mongoose';

export type SecurityEventType = 
  | 'MALWARE_DETECTED'
  | 'PHISHING_ATTEMPT'
  | 'SUSPICIOUS_DOMAIN'
  | 'UNENCRYPTED_AUTH'
  | 'ANOMALOUS_PORT'
  | 'HIGH_RISK_INTERCEPT'
  | 'PROVIDER_UNAVAILABLE'
  | 'ANALYSIS_FAILURE'
  | 'USER_REVIEWED_EVENT';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ISecurityEvent extends Document {
  user?: mongoose.Types.ObjectId;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  description: string;
  target: string;
  source: 'extension' | 'scanner' | 'threat_engine' | 'system';
  metadata: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SecurityEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'MALWARE_DETECTED',
      'PHISHING_ATTEMPT',
      'SUSPICIOUS_DOMAIN',
      'UNENCRYPTED_AUTH',
      'ANOMALOUS_PORT',
      'HIGH_RISK_INTERCEPT',
      'PROVIDER_UNAVAILABLE',
      'ANALYSIS_FAILURE',
      'USER_REVIEWED_EVENT'
    ],
    index: true
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true 
  },
  description: { type: String, required: true },
  target: { type: String, required: true, index: true },
  source: { 
    type: String, 
    enum: ['extension', 'scanner', 'threat_engine', 'system'], 
    default: 'system',
    index: true 
  },
  metadata: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
  acknowledged: { type: Boolean, default: false }
}, { timestamps: true });

export const SecurityEvent = mongoose.model<ISecurityEvent>('SecurityEvent', SecurityEventSchema);
