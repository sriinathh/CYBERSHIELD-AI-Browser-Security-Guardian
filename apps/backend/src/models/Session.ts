import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  ipAddress: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Idle', 'Disconnected'], default: 'Active' },
  loginTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', sessionSchema);
