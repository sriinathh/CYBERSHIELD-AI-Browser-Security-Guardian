import mongoose from 'mongoose';

const ThreatCacheSchema = new mongoose.Schema({
  normalizedKey: { type: String, required: true, index: true },
  providerId: { type: String, required: true },
  status: { type: String, required: true },
  category: { type: String },
  checkedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const ThreatCache = mongoose.model('ThreatCache', ThreatCacheSchema);
