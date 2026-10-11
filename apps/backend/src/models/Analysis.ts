import mongoose, { Document } from 'mongoose';

export interface ISignal {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  source: string;
  confidence: number;
  confirmed: boolean;
}

export interface IMLPrediction {
  score: number;
  prediction: string;
  probability: number;
  modelVersion: string;
  features: Record<string, number>;
}

export interface IAnalysis extends Document {
  user?: mongoose.Types.ObjectId;
  url: string;
  domain: string;
  score: number;
  riskLabel: 'Low observed risk' | 'Suspicious' | 'High risk' | 'Confirmed threat match' | 'Unknown or incomplete';
  signals: ISignal[];
  indicators: string[]; // For fast human-readable rendering
  mlPrediction?: IMLPrediction;
  providerResults: Record<string, any>;
  explanation?: string;
  analysisStatus: 'completed' | 'failed' | 'pending';
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SignalSchema = new mongoose.Schema({
  id: { type: String, required: true },
  category: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  description: { type: String, required: true },
  source: { type: String, required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  confirmed: { type: Boolean, default: false }
}, { _id: false });

const MLPredictionSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  prediction: { type: String, required: true },
  probability: { type: Number, required: true },
  modelVersion: { type: String, required: true },
  features: { type: Object, default: {} }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  url: { type: String, required: true, index: true },
  domain: { type: String, required: true, index: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  riskLabel: { 
    type: String, 
    enum: ['Low observed risk', 'Suspicious', 'High risk', 'Confirmed threat match', 'Unknown or incomplete'],
    required: true,
    index: true 
  },
  signals: [SignalSchema],
  indicators: [{ type: String }],
  mlPrediction: MLPredictionSchema,
  providerResults: { type: Object, default: {} },
  explanation: { type: String, default: '' },
  analysisStatus: { type: String, enum: ['completed', 'failed', 'pending'], default: 'completed' },
  analyzedAt: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);
