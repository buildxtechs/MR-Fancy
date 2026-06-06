import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  period: string; // e.g., '2025-03'
  totalSales: number;
  totalOrders: number;
  peakSeason: boolean;
  festivalName?: string;
}

const AnalyticsSchema: Schema = new Schema({
  period: { type: String, required: true, unique: true },
  totalSales: { type: Number, default: 0 },
  totalOrders: { type: Number, default: 0 },
  peakSeason: { type: Boolean, default: false },
  festivalName: { type: String }
}, { timestamps: true });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
