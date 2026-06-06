import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  loyaltyPoints: number;
  purchaseHistory: mongoose.Types.ObjectId[];
  segment: string;
}

const CustomerSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  loyaltyPoints: { type: Number, default: 0 },
  segment: { type: String, enum: ['Regular', 'VIP', 'High Spender'], default: 'Regular' },
  purchaseHistory: [{ type: String, ref: 'Sale' }]
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
