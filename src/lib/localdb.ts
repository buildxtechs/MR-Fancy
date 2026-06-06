// LocalStorage-based Database Layer with background MongoDB sync
// Ensures instant UI response with permanent Cloud persistence

const generateId = () => {
  const chars = '0123456789abcdef';
  let id = '';
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * 16)];
  }
  return id;
};
const now = () => new Date().toISOString();

// ─── Default Seed Data ────────────────────────────────────────
const DEFAULT_PRODUCTS = [
  { _id: generateId(), name: 'Leather Wallet (Black)', category: 'Fancy', costPrice: 250, sellingPrice: 450, stockQuantity: 50, sku: 'FW-001', barcode: '890123456001', lowStockThreshold: 10, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Scented Candle Set', category: 'Gifts', costPrice: 120, sellingPrice: 299, stockQuantity: 100, sku: 'GC-002', barcode: '890123456002', lowStockThreshold: 15, unit: 'set', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Titan Designer Watch', category: 'Fancy', costPrice: 1200, sellingPrice: 2499, stockQuantity: 5, sku: 'FW-003', barcode: '890123456003', lowStockThreshold: 8, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Premium Hair Clip Set', category: 'Fancy', costPrice: 15, sellingPrice: 45, stockQuantity: 200, sku: 'HC-004', barcode: '890123456004', lowStockThreshold: 20, unit: 'pcs', createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Greeting Card (Birthday)', category: 'Gifts', costPrice: 20, sellingPrice: 65, stockQuantity: 300, sku: 'GC-005', barcode: '890123456005', lowStockThreshold: 30, unit: 'pcs', createdAt: now(), updatedAt: now() },
];

const DEFAULT_CUSTOMERS = [
  { _id: generateId(), name: 'Rajesh Kumar', phone: '9876543210', loyaltyPoints: 450, segment: 'VIP', purchaseHistory: [], createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Anitha Selvam', phone: '9123456789', loyaltyPoints: 120, segment: 'Regular', purchaseHistory: [], createdAt: now(), updatedAt: now() },
];

const DEFAULT_VENDORS = [
  { _id: generateId(), name: 'Tamil Nadu Fancy Wholesalers', phone: '9000111222', address: "Parry's Corner, Chennai", productsSupplied: ['FW-001', 'HC-004'], creditBalance: 12500, createdAt: now(), updatedAt: now() },
  { _id: generateId(), name: 'Global Gift Suppliers', phone: '9988776655', address: 'BVK Iyengar Road, Bangalore', productsSupplied: ['GC-002'], creditBalance: 0, createdAt: now(), updatedAt: now() },
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

  setStore(data: any[]) {
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
    const item = { ...data, _id: data._id || generateId(), createdAt: now(), updatedAt: now() };
    store.push(item);
    this.setStore(store);

    // Sync to cloud
    if (typeof window !== 'undefined') {
      fetch(`/api/${this.collection.replace('mrfancy_', '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(e => console.error('Cloud Sync Create Error:', e));
    }

    return item;
  }

  update(id: string, data: any): any | null {
    const store = this.getStore();
    const idx = store.findIndex((item: any) => item._id === id);
    if (idx === -1) return null;
    store[idx] = { ...store[idx], ...data, updatedAt: now() };
    this.setStore(store);

    // Sync to cloud
    if (typeof window !== 'undefined') {
      fetch(`/api/${this.collection.replace('mrfancy_', '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store[idx])
      }).catch(e => console.error('Cloud Sync Update Error:', e));
    }

    return store[idx];
  }

  updateMany(filter: (item: any) => boolean, update: (item: any) => any) {
    const store = this.getStore();
    const updated = store.map(item => {
      if (filter(item)) {
        const updatedItem = { ...update(item), updatedAt: now() };
        // Sync to cloud
        if (typeof window !== 'undefined') {
          fetch(`/api/${this.collection.replace('mrfancy_', '')}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
          }).catch(e => console.error('Cloud Sync UpdateMany Error:', e));
        }
        return updatedItem;
      }
      return item;
    });
    this.setStore(updated);
  }

  delete(id: string): boolean {
    const store = this.getStore();
    const filtered = store.filter((item: any) => item._id !== id);
    this.setStore(filtered);

    // Sync to cloud
    if (typeof window !== 'undefined') {
      fetch(`/api/${this.collection.replace('mrfancy_', '')}?id=${id}`, {
        method: 'DELETE'
      }).catch(e => console.error('Cloud Sync Delete Error:', e));
    }

    return filtered.length < store.length;
  }

  count(filter?: (item: any) => boolean): number {
    const store = this.getStore();
    return filter ? store.filter(filter).length : store.length;
  }

  seed(defaultData: any[]) {
    if (this.getStore().length === 0) {
      this.setStore(defaultData);
      // Populate cloud with initial seed asynchronously
      defaultData.forEach(item => {
        fetch(`/api/${this.collection.replace('mrfancy_', '')}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        }).catch(() => {});
      });
    }
  }
}

// ─── Pre-configured Collections ────────────────────────────────
export const productsDB = new LocalDB('products');
export const customersDB = new LocalDB('customers');
export const salesDB = new LocalDB('sales');
export const vendorsDB = new LocalDB('vendors');

// ─── Cloud Sync Helper ─────────────────────────────────────────
export async function syncFromCloud() {
  if (typeof window === 'undefined') return;
  try {
    const [resProducts, resCustomers, resVendors, resSales] = await Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
      fetch('/api/sales').then(r => r.json())
    ]);

    if (resProducts.success) productsDB.setStore(resProducts.products);
    if (resCustomers.success) customersDB.setStore(resCustomers.customers);
    if (resVendors.success) vendorsDB.setStore(resVendors.vendors);
    if (resSales.success) salesDB.setStore(resSales.sales);

    window.dispatchEvent(new Event('mrfancy_db_synced'));
  } catch (e) {
    console.error('Failed to sync database from cloud:', e);
  }
}

// ─── Seed & Init Function ──────────────────────────────────────
export function seedDatabase() {
  if (typeof window === 'undefined') return;
  const seeded = localStorage.getItem('mrfancy_has_seeded');
  if (!seeded) {
    productsDB.seed(DEFAULT_PRODUCTS);
    customersDB.seed(DEFAULT_CUSTOMERS);
    vendorsDB.seed(DEFAULT_VENDORS);
    localStorage.setItem('mrfancy_has_seeded', 'true');
  }
  
  // Asynchronously trigger cloud sync to update local cache
  syncFromCloud();
}
