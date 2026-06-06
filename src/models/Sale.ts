import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISale extends Document {
  customer: mongoose.Types.ObjectId;
  items: ISaleItem[];
  totalAmount: number;
  discount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Split';
  paymentDetails?: any;
  billNumber: string;
}

const SaleSchema: Schema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'Split'], default: 'Cash' },
  billNumber: { type: String, required: true, unique: true },
  paymentDetails: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.models.Sale || mongoose.model<ISale>('Sale', SaleSchema);
