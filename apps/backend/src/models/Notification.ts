import mongoose, { Document } from 'mongoose';

export interface INotification extends Document {
  user?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'warning' | 'threat';
  read: boolean;
  link?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'info', 'warning', 'threat'], default: 'info' },
  read: { type: Boolean, default: false, index: true },
  link: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
