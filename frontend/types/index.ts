export type Brand = 'Apple' | 'Samsung' | 'Xiaomi' | 'OPPO' | 'Vivo';

export type ProductCategory = 'flagship' | 'midrange' | 'budget';

export interface ProductVariant {
  id: string;
  color: string;
  colorCode: string;
  storage: string;
  ram: string;
  price: number;
  salePrice?: number;
  stock: number;
  sku: string;
}

export interface ProductSpec {
  screen: string;
  chip: string;
  camera: string;
  battery: string;
  charging: string;
  os: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  category: ProductCategory;
  slug: string;
  description: string;
  thumbnail: string;
  images: string[];
  basePrice: number;
  baseSalePrice?: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  inStock: boolean;
  variants: ProductVariant[];
  specs: ProductSpec;
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  couponCode: string | null;
  discount: number;
}

export interface FilterState {
  brands: Brand[];
  priceRange: [number, number];
  storages: string[];
  rams: string[];
  inStockOnly: boolean;
  sortBy: 'popular' | 'newest' | 'price-asc' | 'price-desc';
}

export type Page =
  | { name: 'home' }
  | { name: 'catalog'; brand?: Brand }
  | { name: 'product'; productId: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'order-success'; orderCode: string };
