'use client';
import { ShoppingCart, Heart, Zap } from 'lucide-react';
import type { Product } from '../types';
import StarRating from './StarRating';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { addFavorite } from '../lib/api';
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
  const price = defaultVariant.salePrice ?? defaultVariant.price;
  const originalPrice = defaultVariant.salePrice ? defaultVariant.price : null;
  const discountPct = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <article
      className="group relative bg-white border border-zinc-200 flex flex-col cursor-pointer transition-all duration-300 hover:border-zinc-400 hover:shadow-xl hover:-translate-y-1"
      onClick={() => router.push(`/product/${product.slug}`)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isNew && (
          <span className="bg-[#0A0A0A] text-white text-[10px] font-display font-700 tracking-widest uppercase px-2 py-0.5">
            MỚI
          </span>
        )}
        {discountPct && (
          <span className="bg-[#E8002D] text-white text-[10px] font-display font-700 tracking-wider px-2 py-0.5">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center border transition-colors ${isFavorite ? 'bg-[#E8002D] border-[#E8002D] text-white' : 'bg-white border-zinc-200 text-zinc-400 hover:text-[#E8002D] hover:border-[#E8002D]'}`}
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
        aria-label="Thêm vào yêu thích"
      >
        <Heart size={15} className={isFavorite ? "fill-current" : ""} />
      </button>

      {/* Image */}
      <div className="relative overflow-hidden bg-zinc-50 aspect-square">
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-[10px] font-display font-600 tracking-widest text-zinc-400 uppercase">
          {product.brand}
        </p>
        <h3 className="font-display font-700 text-[#0A0A0A] text-base leading-tight line-clamp-2">
          {product.name}
        </h3>

        <StarRating rating={product.rating} count={product.reviewCount} size={13} />

        {/* Specs pills */}
        <div className="flex flex-wrap gap-1 mt-0.5">
          {product.variants
            .map(v => v.storage)
            .filter((s, i, arr) => arr.indexOf(s) === i)
            .slice(0, 3)
            .map(storage => (
              <span
                key={storage}
                className="text-[10px] font-mono-data text-zinc-500 bg-zinc-100 px-1.5 py-0.5 border border-zinc-200"
              >
                {storage}
              </span>
            ))}
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 border-t border-zinc-100">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-800 text-lg text-[#E8002D]">
              {formatPrice(price)}
            </span>
            {originalPrice && (
              <span className="text-xs text-zinc-400 line-through font-mono-data">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            className="mt-3 w-full flex items-center justify-center gap-2 bg-[#0A0A0A] text-white py-2.5 text-xs font-display font-700 tracking-widest uppercase hover:bg-[#E8002D] transition-colors duration-200"
            onClick={e => {
              e.stopPropagation();
              addItem(product, defaultVariant);
            }}
          >
            <ShoppingCart size={14} />
            Thêm vào giỏ
          </button>

          {/* Quick buy */}
          <button
            className="mt-1.5 w-full flex items-center justify-center gap-2 border border-[#0A0A0A] text-[#0A0A0A] py-2 text-xs font-display font-600 tracking-wider uppercase hover:bg-zinc-100 transition-colors"
            onClick={e => {
              e.stopPropagation();
              router.push(`/product/${product.slug}`);
            }}
          >
            <Zap size={13} />
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}
