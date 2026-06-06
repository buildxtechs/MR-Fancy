import mongoose from 'mongoose';
import dbConnect from '../lib/mongodb';
import Product from '../models/Product';
import Customer from '../models/Customer';
import Vendor from '../models/Vendor';

const sampleProducts = [
  { name: 'Leather Wallet (Black)', category: 'Fancy', costPrice: 250, sellingPrice: 450, stockQuantity: 50, sku: 'FW-001', barcode: '890123456001', lowStockThreshold: 10, unit: 'pcs' },
  { name: 'Scented Candle Set', category: 'Gifts', costPrice: 120, sellingPrice: 299, stockQuantity: 100, sku: 'GC-002', barcode: '890123456002', lowStockThreshold: 15, unit: 'set' },
  { name: 'Titan Designer Watch', category: 'Fancy', costPrice: 1200, sellingPrice: 2499, stockQuantity: 5, sku: 'FW-003', barcode: '890123456003', lowStockThreshold: 8, unit: 'pcs' },
  { name: 'Premium Hair Clip', category: 'Fancy', costPrice: 15, sellingPrice: 45, stockQuantity: 200, sku: 'HC-004', barcode: '890123456004', lowStockThreshold: 20, unit: 'pcs' },
  { name: 'Greeting Card (Birthday)', category: 'Gifts', costPrice: 20, sellingPrice: 65, stockQuantity: 300, sku: 'GC-005', barcode: '890123456005', lowStockThreshold: 30, unit: 'pcs' },
  { name: 'Handmade Soap (Neem)', category: 'Fancy', costPrice: 35, sellingPrice: 85, stockQuantity: 8, sku: 'HS-006', barcode: '890123456006', lowStockThreshold: 10, unit: 'pcs' },
];

const sampleCustomers = [
  { name: 'Rajesh Kumar', phone: '9876543210', loyaltyPoints: 450, segment: 'VIP' },
  { name: 'Anitha Selvam', phone: '9123456789', loyaltyPoints: 120, segment: 'Regular' },
  { name: 'Prakash M', phone: '8877665544', loyaltyPoints: 50, segment: 'Regular' },
];

const sampleVendors = [
  { name: 'Tamil Nadu Fancy Wholesalers', phone: '9000111222', address: 'Parry’s Corner, Chennai', creditBalance: 12500 },
  { name: 'Global Gift Suppliers', phone: '9988776655', address: 'BVK Iyengar Road, Bangalore', creditBalance: 0 },
];

async function seed() {
  try {
    console.log('🌱 Connecting to database...');
    // Manually pass URI if lib/mongodb fails in script context
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined');
    
    await mongoose.connect(uri);
    console.log('✅ Connected.');

    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Vendor.deleteMany({});

    console.log('📦 Seeding products...');
    await Product.insertMany(sampleProducts);

    console.log('👥 Seeding customers...');
    await Customer.insertMany(sampleCustomers);

    console.log('🚛 Seeding vendors...');
    await Vendor.insertMany(sampleVendors);

    console.log('✨ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
