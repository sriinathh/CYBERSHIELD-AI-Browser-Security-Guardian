import mongoose, { Document } from 'mongoose';

export interface IUserPreferences {
  notifications: boolean;
  dataSharing: boolean;
  twoFactor: boolean;
  theme: string;
  apiKey?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  preferences: IUserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  preferences: {
    notifications: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: true },
    twoFactor: { type: Boolean, default: false },
    theme: { type: String, default: 'cyberpunk' },
    apiKey: { type: String, default: 'sk_live_cyber_0000000000000' }
  },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);

