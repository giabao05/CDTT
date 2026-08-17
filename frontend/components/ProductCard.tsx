'use client';
import { ShoppingCart, Heart, Zap, Sparkles } from 'lucide-react';
import type { Product } from '../types';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useFavoriteStore } from '../store/favoriteStore';

function formatPrice(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const { user } = useAuthStore();
  const { favoriteIds, addFavoriteId, removeFavoriteId } = useFavoriteStore();
  const productId = parseInt(product.id);
  const isFavorite = favoriteIds.includes(productId);
  const defaultVariant = product.variants[0];
  const price = product.baseSalePrice ?? product.basePrice ?? (defaultVariant?.salePrice ?? defaultVariant?.price);
  const originalPrice = product.baseSalePrice ? product.basePrice : (product.baseSalePrice === undefined && defaultVariant?.salePrice ? defaultVariant?.price : null);
  const discountPct = originalPrice && price < originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <div className="relative group/card h-full transition-all duration-500 hover:-translate-y-2 z-10 hover:z-40 p-[2px] rounded-[28px]">
      
      {/* ── Outer Running Border (Hover Only) ── */}
      <div className="absolute inset-0 rounded-[28px] overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#ff0844_20%,transparent_25%,transparent_50%,#ffb199_70%,transparent_75%,transparent_100%)] opacity-0 group-hover/card:opacity-100 group-hover/card:animate-[spin_4s_linear_infinite] transition-opacity duration-500" />
      </div>

      {/* ── Outer Glow (Intensifies on Hover) ── */}
      <div className="absolute inset-[-6px] rounded-[30px] overflow-hidden z-0 blur-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#ff0844_20%,transparent_25%,transparent_50%,#ffb199_70%,transparent_75%,transparent_100%)] group-hover/card:animate-[spin_4s_linear_infinite]" />
      </div>
      
      <article
        className="relative bg-white flex flex-col h-full cursor-pointer z-10 transition-colors rounded-[26px] shadow-[0_8px_24px_rgba(0,0,0,0.04)] group-hover/card:shadow-[0_15px_50px_rgba(255,8,68,0.4)] overflow-hidden"
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        {/* Subtle decorative background glow inside card */}
        <div className="absolute top-0 right-0 w-full h-48 bg-gradient-to-b from-[#e52e71]/5 to-transparent rounded-t-[26px] pointer-events-none transition-opacity duration-500 group-hover/card:opacity-100 opacity-50" />

        {/* Badges */}
        <div className="absolute top-5 left-5 z-30 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-white/80 backdrop-blur-md text-[#2d1b54] text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-white">
              MỚI
            </span>
          )}
          {discountPct && (
            <span className="bg-gradient-to-r from-[#ff0844] to-[#ffb199] text-white text-[10px] font-black tracking-widest px-3 py-1.5 rounded-full shadow-md border border-white/50">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist Button - Moved to Top Right */}
        <button
          className={`absolute top-5 right-5 z-30 w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 transition-transform hover:scale-110 active:scale-95 ${
            isFavorite 
              ? 'bg-gradient-to-br from-[#ff0844] to-[#ffb199] border-[#ff0844]/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),_0_4px_12px_rgba(255,8,68,0.3)] text-white'
              : 'bg-white/40 backdrop-blur-md border-white/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] text-gray-600 hover:bg-white/60'
          }`}
          onClick={async (e) => {
            e.stopPropagation();
            if (!user) {
              router.push('/login');
              return;
            }
            if (isFavorite) {
              removeFavoriteId(productId);
              import('../lib/api').then(api => api.removeFavorite(user.email, productId));
            } else {
              addFavoriteId(productId);
              import('../lib/api').then(api => api.addFavorite(user.email, productId));
            }
          }}
          title="Yêu thích"
        >
          <Heart size={20} className={isFavorite ? "fill-current" : ""} />
        </button>

        {/* Image Area */}
        <div className="relative aspect-[4/5] flex items-center justify-center z-10 p-8 pt-14">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-contain relative z-20 group-hover/card:[animation:gentle-shake_2.5s_ease-in-out_infinite] drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)]"
            loading="lazy"
          />
        </div>

        {/* Body - Left Aligned Glassmorphism */}
        <div className="flex flex-col flex-1 p-6 pt-0 gap-1 relative z-20">
          
          {/* Brand */}
          <p className="text-[12px] font-semibold tracking-widest text-gray-700 uppercase mb-1">
            {product.brand}
          </p>
          
          {/* Title */}
          <h3 className="font-black text-2xl text-[#2d1b54] leading-tight line-clamp-2">
            {product.name}
          </h3>
          
          {/* Subtitle */}
          <p className="text-[11px] font-medium text-gray-600 mb-3">
            Sản phẩm đỉnh cao với trí tuệ nhân tạo.
          </p>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-8">
            <StarRating rating={product.rating} count={product.reviewCount} size={16} />
          </div>

          {/* Price & Buttons */}
          <div className="w-full mt-auto">
            <div className="flex flex-col gap-0.5 mb-5">
              {/* Premium Price */}
              {originalPrice ? (
                <>
                  <span className="text-2xl font-display font-900 text-[#E8002D] tracking-tight">
                    {formatPrice(price)}
                  </span>
                  <span className="text-sm text-zinc-400 line-through font-mono-data">
                    {formatPrice(originalPrice)}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-display font-900 text-[#0A0A0A] tracking-tight">
                  {formatPrice(price)}
                </span>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-3 mt-1">
              {/* Add to cart - Premium Hover */}
              <button
                className="w-[54px] h-[54px] rounded-2xl bg-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-zinc-200 flex items-center justify-center flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-[#0A0A0A] hover:border-[#0A0A0A] hover:text-white hover:shadow-xl group/cart text-zinc-700"
                onClick={e => {
                  e.stopPropagation();
                  addItem(product, defaultVariant);
                }}
                title="Thêm vào giỏ hàng"
              >
                <ShoppingCart size={22} className="transition-colors duration-300 group-hover/cart:animate-bounce" />
              </button>

              {/* Quick buy - Premium Styling & Hover */}
              <button
                className="group/buy flex-1 rounded-2xl bg-gradient-to-r from-[#E8002D] via-[#ff0055] to-[#E8002D] bg-[length:200%_auto] hover:animate-[gradient-shift_2s_linear_infinite] shadow-[0_10px_20px_rgba(232,0,45,0.3)] flex items-center justify-center gap-2 relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-[0_15px_30px_rgba(232,0,45,0.5)] hover:-translate-y-1 text-white"
                onClick={e => {
                  e.stopPropagation();
                  router.push(`/product/${product.slug}`);
                }}
              >
                <style>{`
                  @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                  @keyframes zap-shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-15deg) scale(1.1); }
                    75% { transform: rotate(15deg) scale(1.1); }
                  }
                `}</style>
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/buy:translate-y-[0%] transition-transform duration-300" />
                <div className="flex items-center gap-2 z-10 transition-transform duration-300 group-hover/buy:scale-110">
                  <Zap size={18} className="fill-current group-hover/buy:animate-[zap-shake_0.5s_ease-in-out_infinite]" />
                  <span className="font-display font-800 text-[14px] tracking-widest uppercase">
                    MUA NGAY
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
