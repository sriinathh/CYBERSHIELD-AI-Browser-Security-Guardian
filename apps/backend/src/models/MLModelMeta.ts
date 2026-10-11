import mongoose, { Document } from 'mongoose';

export interface IMLModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  sampleSize: number;
}

export interface IMLModelMeta extends Document {
  version: string;
  name: string;
  algorithm: string;
  features: string[];
  weights?: Record<string, number>;
  intercept?: number;
  metrics: IMLModelMetrics;
  isActive: boolean;
  trainedAt: Date;
  description: string;
}

const MLModelMetaSchema = new mongoose.Schema({
  version: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  algorithm: { type: String, required: true },
  features: [{ type: String }],
  weights: { type: Object, default: {} },
  intercept: { type: Number, default: 0 },
  metrics: {
    accuracy: { type: Number, required: true },
    precision: { type: Number, required: true },
    recall: { type: Number, required: true },
    f1Score: { type: Number, required: true },
    rocAuc: { type: Number, required: true },
    confusionMatrix: {
      truePositive: { type: Number, default: 0 },
      falsePositive: { type: Number, default: 0 },
      trueNegative: { type: Number, default: 0 },
      falseNegative: { type: Number, default: 0 }
    },
    sampleSize: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  trainedAt: { type: Date, default: Date.now },
  description: { type: String, default: '' }
}, { timestamps: true });

export const MLModelMeta = mongoose.model<IMLModelMeta>('MLModelMeta', MLModelMetaSchema);
