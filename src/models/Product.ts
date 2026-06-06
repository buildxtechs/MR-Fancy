import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  sku: string;
  barcode?: string;
  lowStockThreshold: number;
  unit: string;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['Fancy', 'Gifts', 'Grocery', 'Custom'] },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  sku: { type: String, required: true, unique: true },
  barcode: { type: String },
  lowStockThreshold: { type: Number, default: 10 },
  unit: { type: String, default: 'pcs' }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
