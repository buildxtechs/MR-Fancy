import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  phone: string;
  address?: string;
  productsSupplied: string[];
  creditBalance: number;
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  productsSupplied: [{ type: String }],
  creditBalance: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);
