'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/types';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

const STORAGE_KEY = 'recently_viewed_products';

export function saveRecentlyViewed(product: Product) {
  if (typeof window === 'undefined') return;
  
  const saved = localStorage.getItem(STORAGE_KEY);
  let products: any[] = saved ? JSON.parse(saved) : [];
  
  // Remove if exists to push to front
  products = products.filter((p: any) => p.id !== product.id);
  
  // Store minimal data to save quota
  const minimalProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    thumbnail: product.thumbnail,
    basePrice: product.basePrice,
  };
  
  products.unshift(minimalProduct);
  
  // Keep max 15 items
  products = products.slice(0, 15);
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save recently viewed products', e);
    // If it still fails, clear it
    localStorage.removeItem(STORAGE_KEY);
  }
}

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setProducts(JSON.parse(saved));
    }
  }, []);

  if (!mounted || products.length === 0) return null;

  const removeProduct = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
  };

  const clearHistory = () => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const resolveImageUrl = (url?: string) => {
    if (!url || url.startsWith('#')) return '';
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    return `http://localhost:8080/uploads/${url}`;
  };

  return (
    <section className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-800 text-xl sm:text-2xl text-[#0A0A0A] tracking-tight">
          Sản phẩm đã xem
        </h2>
        <button 
          onClick={clearHistory}
          className="text-sm text-zinc-500 hover:text-red-500 transition-colors font-medium"
        >
          Xóa lịch sử
        </button>
      </div>
      
      <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] scrollbar-hide pr-2">
        {products.map(p => (
          <div key={p.id} className="relative group">
            <a 
              href={`/product/${p.slug}`}
              className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden bg-white rounded-xl">
                <img 
                  src={resolveImageUrl(p.thumbnail)} 
                  alt={p.name}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              
              <div className="flex flex-col gap-1 overflow-hidden">
                <h3 className="text-sm font-display font-600 text-[#0A0A0A] line-clamp-2 leading-tight">
                  {p.name}
                </h3>
                <p className="text-sm font-bold text-[#E8002D]">
                  {fmt(p.basePrice)}
                </p>
              </div>
            </a>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                removeProduct(p.id, e);
              }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
              title="Xóa khỏi lịch sử"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
