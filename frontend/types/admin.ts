export type Page = 'dashboard' | 'products' | 'orders' | 'customers' | 'vouchers';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipping' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'COD' | 'VNPay' | 'Momo';

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  image: string;
  price: number;
  salePrice: number | null;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  ram: string;
  storage: string;
  color: string;
  chipset: string;
  screen: string;
  battery: string;
  camera: string;
  os: string;
  description: string;
  images: string[];
  variants?: { id?: string; color?: string; storage?: string; ram?: string; stock?: number; stockQuantity?: number; price?: number; colorCode?: string; imageUrl?: string; }[];
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  shipping: number;
  status: OrderStatus;
  payment: PaymentMethod;
  date: string;
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  status: 'Active' | 'Banned';
  joined: string;
  avatar: string;
  role?: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  remaining: number;
  total: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Upcoming';
}
