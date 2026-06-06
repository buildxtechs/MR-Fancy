// LocalStorage-based Database Layer for MR Fancy Store
// Replaces MongoDB with zero-dependency local persistence

const generateId = () => Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
const now = () => new Date().toISOString();

// ─── Default Seed Data ────────────────────────────────────────
const DEFAULT_PRODUCTS = [
  { _id: generateId(), name: 'Leather Wallet (Black)', category: 'Fancy', costPrice: 250, sellingPrice: 450, stockQuantity: 50, sku: 'FW-001', barcode: '890123456001', lowStockThreshold: 10, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Scented Candle Set', category: 'Gifts', costPrice: 120, sellingPrice: 299, stockQuantity: 100, sku: 'GC-002', barcode: '890123456002', lowStockThreshold: 15, unit: 'set', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Titan Designer Watch', category: 'Fancy', costPrice: 1200, sellingPrice: 2499, stockQuantity: 5, sku: 'FW-003', barcode: '890123456003', lowStockThreshold: 8, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Premium Hair Clip Set', category: 'Fancy', costPrice: 15, sellingPrice: 45, stockQuantity: 200, sku: 'HC-004', barcode: '890123456004', lowStockThreshold: 20, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Greeting Card (Birthday)', category: 'Gifts', costPrice: 20, sellingPrice: 65, stockQuantity: 300, sku: 'GC-005', barcode: '890123456005', lowStockThreshold: 30, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Handmade Soap (Neem)', category: 'Grocery', costPrice: 35, sellingPrice: 85, stockQuantity: 8, sku: 'HS-006', barcode: '890123456006', lowStockThreshold: 10, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Photo Frame (Gold)', category: 'Gifts', costPrice: 180, sellingPrice: 399, stockQuantity: 35, sku: 'PF-007', barcode: '890123456007', lowStockThreshold: 5, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Silk Pouch Bag', category: 'Fancy', costPrice: 90, sellingPrice: 199, stockQuantity: 60, sku: 'SP-008', barcode: '890123456008', lowStockThreshold: 10, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Brass Diya (Pair)', category: 'Fancy', costPrice: 150, sellingPrice: 350, stockQuantity: 25, sku: 'BD-009', barcode: '890123456009', lowStockThreshold: 5, unit: 'pair', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Organic Honey (500ml)', category: 'Grocery', costPrice: 200, sellingPrice: 380, stockQuantity: 40, sku: 'OH-010', barcode: '890123456010', lowStockThreshold: 8, unit: 'bottle', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Silver Anklet (Pair)', category: 'Fancy', costPrice: 380, sellingPrice: 750, stockQuantity: 18, sku: 'SA-011', barcode: '890123456011', lowStockThreshold: 5, unit: 'pair', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Basmati Rice (5kg)', category: 'Grocery', costPrice: 320, sellingPrice: 499, stockQuantity: 75, sku: 'BR-012', barcode: '890123456012', lowStockThreshold: 15, unit: 'bag', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Gift Hamper (Premium)', category: 'Gifts', costPrice: 500, sellingPrice: 1299, stockQuantity: 12, sku: 'GH-013', barcode: '890123456013', lowStockThreshold: 5, unit: 'box', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Kumkum Box (Brass)', category: 'Fancy', costPrice: 85, sellingPrice: 195, stockQuantity: 45, sku: 'KB-014', barcode: '890123456014', lowStockThreshold: 10, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Coconut Oil (1L)', category: 'Grocery', costPrice: 150, sellingPrice: 260, stockQuantity: 90, sku: 'CO-015', barcode: '890123456015', lowStockThreshold: 20, unit: 'bottle', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Decorative Wall Clock', category: 'Gifts', costPrice: 350, sellingPrice: 799, stockQuantity: 7, sku: 'WC-016', barcode: '890123456016', lowStockThreshold: 3, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Sandalwood Agarbatti', category: 'Fancy', costPrice: 25, sellingPrice: 60, stockQuantity: 150, sku: 'AG-017', barcode: '890123456017', lowStockThreshold: 30, unit: 'pack', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Kids Stationery Kit', category: 'Gifts', costPrice: 80, sellingPrice: 175, stockQuantity: 55, sku: 'SK-018', barcode: '890123456018', lowStockThreshold: 10, unit: 'set', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Turmeric Powder (200g)', category: 'Grocery', costPrice: 40, sellingPrice: 80, stockQuantity: 120, sku: 'TP-019', barcode: '890123456019', lowStockThreshold: 25, unit: 'pack', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Crystal Flower Vase', category: 'Gifts', costPrice: 280, sellingPrice: 599, stockQuantity: 10, sku: 'FV-020', barcode: '890123456020', lowStockThreshold: 3, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Embroidered Purse', category: 'Fancy', costPrice: 110, sellingPrice: 249, stockQuantity: 40, sku: 'EP-021', barcode: '890123456021', lowStockThreshold: 8, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Custom Name Keychain', category: 'Custom', costPrice: 30, sellingPrice: 99, stockQuantity: 80, sku: 'CK-022', barcode: '890123456022', lowStockThreshold: 15, unit: 'pcs', createdAt: now(), updatedAt: now() },
];

const DEFAULT_CUSTOMERS = [
  { _id: generateId(), name: 'Rajesh Kumar', phone: '9876543210', loyaltyPoints: 450, segment: 'VIP', purchaseHistory: [], createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Anitha Selvam', phone: '9123456789', loyaltyPoints: 120, segment: 'Regular', purchaseHistory: [], createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Prakash M', phone: '8877665544', loyaltyPoints: 50, segment: 'Regular', purchaseHistory: [], createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Lakshmi Devi', phone: '9090909090', loyaltyPoints: 800, segment: 'VIP', purchaseHistory: [], createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Murugan S', phone: '7878787878', loyaltyPoints: 30, segment: 'Regular', purchaseHistory: [], createdAt: now(), updatedAt: now() },
];

const DEFAULT_VENDORS = [
  { _id: generateId(), name: 'Tamil Nadu Fancy Wholesalers', phone: '9000111222', address: "Parry's Corner, Chennai", productsSupplied: ['FW-001', 'HC-004', 'BD-009'], creditBalance: 12500, createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Global Gift Suppliers', phone: '9988776655', address: 'BVK Iyengar Road, Bangalore', productsSupplied: ['GC-002', 'PF-007', 'GC-005'], creditBalance: 0, createdAt: now(), updatedAt: now() },
];

// ─── Core LocalDB Class ────────────────────────────────────────
export class LocalDB {
  private collection: string;

  constructor(collection: string) {
    this.collection = `mrfancy_${collection}`;
  }

  private getStore(): any[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.collection);
    return raw ? JSON.parse(raw) : [];
  }

  private setStore(data: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.collection, JSON.stringify(data));
  }

  getAll(filter?: { q?: string; category?: string }): any[] {
    let items = this.getStore();
    if (filter?.q) {
      const q = filter.q.toLowerCase();
      items = items.filter((item: any) =>
        Object.values(item).some(v =>
          typeof v === 'string' && v.toLowerCase().includes(q)
        )
      );
    }
    if (filter?.category) {
      items = items.filter((item: any) => item.category === filter.category);
    }
    return items;
  }

  getById(id: string): any | null {
    return this.getStore().find((item: any) => item._id === id) || null;
  }

  create(data: any): any {
    const store = this.getStore();
    const item = { ...data, _id: generateId(), createdAt: now(), updatedAt: now() };
    store.push(item);
    this.setStore(store);
    return item;
  }

  update(id: string, data: any): any | null {
    const store = this.getStore();
    const idx = store.findIndex((item: any) => item._id === id);
    if (idx === -1) return null;
    store[idx] = { ...store[idx], ...data, updatedAt: now() };
    this.setStore(store);
    return store[idx];
  }

  updateMany(filter: (item: any) => boolean, update: (item: any) => any) {
    const store = this.getStore();
    const updated = store.map(item => filter(item) ? { ...update(item), updatedAt: now() } : item);
    this.setStore(updated);
  }

  delete(id: string): boolean {
    const store = this.getStore();
    const filtered = store.filter((item: any) => item._id !== id);
    this.setStore(filtered);
    return filtered.length < store.length;
  }

  count(filter?: (item: any) => boolean): number {
    const store = this.getStore();
    return filter ? store.filter(filter).length : store.length;
  }

  seed(defaultData: any[]) {
    if (this.getStore().length === 0) {
      this.setStore(defaultData);
    }
  }
}

// ─── Pre-configured Collections ────────────────────────────────
export const productsDB = new LocalDB('products');
export const customersDB = new LocalDB('customers');
export const salesDB = new LocalDB('sales');
export const vendorsDB = new LocalDB('vendors');

// ─── Seed Function (call on app init) ──────────────────────────
export function seedDatabase() {
  if (typeof window === 'undefined') return;
  const seeded = localStorage.getItem('mrfancy_has_seeded');
  if (!seeded) {
    productsDB.seed(DEFAULT_PRODUCTS);
    customersDB.seed(DEFAULT_CUSTOMERS);
    vendorsDB.seed(DEFAULT_VENDORS);
    localStorage.setItem('mrfancy_has_seeded', 'true');
  }
}
