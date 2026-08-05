'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Zap, ChevronRight, Star, Shield, Truck,
  RotateCcw, Check, ChevronLeft, Share2, Heart, Minus, Plus
} from 'lucide-react';
import type { Product, ProductVariant } from '@/types';
import { fetchProductBySlug, fetchProducts } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

const SPEC_LABELS: Record<string, string> = {
  screen: 'Màn hình',
  chip: 'Vi xử lý',
  camera: 'Camera',
  battery: 'Pin',
  charging: 'Sạc',
  os: 'Hệ điều hành',
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const p = await fetchProductBySlug(slug);
      setProduct(p);
      if (p && p.brand) {
         const related = await fetchProducts(undefined, p.brand);
         setRelatedProducts(related.filter(r => r.id !== p.id).slice(0, 4));
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
     return <div className="min-h-screen flex items-center justify-center"><p className="text-zinc-400">Đang tải...</p></div>;
  }
  if (!product) {
     return <div className="min-h-screen flex items-center justify-center"><p className="text-zinc-400">Sản phẩm không tồn tại.</p></div>;
  }

  return <ProductDetailContent product={product} relatedProducts={relatedProducts} />;
}

function ProductDetailContent({ product, relatedProducts }: { product: Product, relatedProducts: Product[] }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuthStore();
  const { favoriteIds, addFavoriteId, removeFavoriteId } = useFavoriteStore();
  const productId = parseInt(product.id);
  const isFavorite = favoriteIds.includes(productId);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [addedToCart, setAddedToCart] = useState(false);

  const colors = [...new Set((product.variants || []).map(v => v.color))].filter(Boolean);
  const storagesForColor = (color: string) =>
    [...new Set((product.variants || []).filter(v => v.color === color).map(v => v.storage))].filter(Boolean);

  const initColor = selectedColor || (colors.length > 0 ? colors[0] : '');
  const initStorage = selectedStorage || (storagesForColor(initColor).length > 0 ? storagesForColor(initColor)[0] : '');

  const selectedVariant: ProductVariant | undefined = (product.variants || []).find(
    v => v.color === initColor && v.storage === initStorage
  );

  const price = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.basePrice;
  const originalPrice = selectedVariant?.salePrice ? selectedVariant.price : null;
  const discountPct = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  const inStock = selectedVariant ? (selectedVariant.stock > 0) : true;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addItem(product, selectedVariant);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 font-body mb-6">
          <button onClick={() => router.push('/')} className="hover:text-[#E8002D]">
            Trang chủ
          </button>
          <span>/</span>
          <button
            onClick={() => router.push(`/product?brand=${product.brand}`)}
            className="hover:text-[#E8002D]"
          >
            {product.brand}
          </button>
          <span>/</span>
          <span className="text-[#0A0A0A] font-500 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12">

          {/* ── IMAGE GALLERY ── */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible">
              {(product.images && product.images.length > 0 ? product.images : [product.thumbnail || '']).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-18 sm:h-18 border-2 overflow-hidden transition-all ${
                    i === activeImage ? 'border-[#0A0A0A]' : 'border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative bg-white border border-zinc-200 aspect-square overflow-hidden group">
              <img
                src={(product.images && product.images.length > 0 ? product.images[activeImage] : product.thumbnail) || ''}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              {discountPct && (
                <div className="absolute top-3 left-3 bg-[#E8002D] text-white text-xs font-display font-700 px-2 py-1">
                  -{discountPct}%
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-3 right-3 bg-[#0A0A0A] text-white text-[10px] font-display font-700 tracking-widest px-2 py-1">
                  MỚI
                </div>
              )}

              {/* Nav arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => Math.min((product.images?.length || 1) - 1, i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-display font-700 tracking-widest uppercase text-zinc-400">
                  {product.brand}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    className={`p-1.5 transition-colors ${isFavorite ? 'text-[#E8002D]' : 'text-zinc-400 hover:text-[#E8002D]'}`}
                    onClick={async () => {
                      if (!user) {
                        router.push('/login');
                        return;
                      }
                      if (isFavorite) {
                        removeFavoriteId(productId);
                        import('@/lib/api').then(api => api.removeFavorite(user.email, productId));
                      } else {
                        addFavoriteId(productId);
                        import('@/lib/api').then(api => api.addFavorite(user.email, productId));
                      }
                    }}
                  >
                    <Heart size={16} className={isFavorite ? "fill-current" : ""} />
                  </button>
                  <button className="p-1.5 text-zinc-400 hover:text-[#0A0A0A] transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
              <h1 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight mt-1 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <StarRating rating={product.rating} count={product.reviewCount} size={15} />
                <span className="text-[10px] font-mono-data text-zinc-400">
                  SKU: {selectedVariant?.sku ?? 'N/A'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-zinc-50 border border-zinc-200 p-4">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-900 text-3xl text-[#E8002D]">
                  {fmt(price)}
                </span>
                {originalPrice && (
                  <>
                    <span className="text-sm text-zinc-400 line-through font-mono-data">
                      {fmt(originalPrice)}
                    </span>
                    <span className="text-xs bg-[#E8002D] text-white font-display font-700 px-2 py-0.5">
                      -{discountPct}%
                    </span>
                  </>
                )}
              </div>
              {originalPrice && (
                <p className="text-xs text-zinc-500 font-body mt-1">
                  Tiết kiệm {fmt(originalPrice - price)} so với giá gốc
                </p>
              )}
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-display font-700 tracking-wider uppercase text-[#0A0A0A]">
                  Màu sắc
                </span>
                <span className="text-xs text-zinc-500 font-body">{initColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => {
                  const v = (product.variants || []).find(x => x.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedStorage('');
                      }}
                      className={`relative w-9 h-9 border-2 transition-all ${
                        initColor === color ? 'border-[#0A0A0A] scale-110' : 'border-zinc-300 hover:border-zinc-500'
                      }`}
                      title={color}
                      style={{ backgroundColor: v?.colorCode ?? '#ccc' }}
                    >
                      {initColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={14}
                            strokeWidth={3}
                            className={
                              v?.colorCode && parseInt(v.colorCode.slice(1), 16) < 0x888888
                                ? 'text-white'
                                : 'text-[#0A0A0A]'
                            }
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Storage selector */}
            {storagesForColor(initColor).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-display font-700 tracking-wider uppercase text-[#0A0A0A]">
                  Dung lượng
                </span>
                <span className="text-xs text-zinc-500 font-body">{initStorage}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {storagesForColor(initColor).map(storage => {
                  const v = (product.variants || []).find(x => x.color === initColor && x.storage === storage);
                  const vPrice = v?.salePrice ?? v?.price;
                  return (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2 border text-sm font-display font-600 transition-all ${
                        initStorage === storage
                          ? 'border-[#0A0A0A] bg-[#0A0A0A] text-white'
                          : 'border-zinc-300 text-zinc-700 hover:border-zinc-500'
                      }`}
                    >
                      <span className="font-mono-data">{storage}</span>
                      {vPrice && (
                        <span className="ml-1.5 text-[10px] opacity-70">
                          {fmt(vPrice)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* RAM info */}
            {selectedVariant && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-body">RAM:</span>
                <span className="text-xs font-mono-data bg-zinc-100 px-2 py-0.5 border border-zinc-200">
                  {selectedVariant.ram}
                </span>
                <span className="text-xs text-zinc-400 font-body">
                  • Còn {selectedVariant.stock} máy
                </span>
              </div>
            )}

            {/* Stock indicator */}
            {!inStock && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-display font-600">
                Tạm hết hàng — Đăng ký nhận thông báo khi có hàng
              </div>
            )}

            {/* Quantity + CTA */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-display font-700 tracking-wider uppercase text-zinc-500 w-16">
                  Số lượng
                </span>
                <div className="flex items-center border border-zinc-300">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-mono-data font-500">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(selectedVariant?.stock ?? 99, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#E8002D] text-white font-display font-700 text-sm tracking-wider uppercase hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Zap size={16} />
                  Mua ngay
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 border font-display font-700 text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                    addedToCart
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={16} />
                      Đã thêm
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} />
                      Thêm vào giỏ
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200">
              {[
                { icon: Shield, label: 'BH 12 tháng', sub: 'Chính hãng' },
                { icon: Truck, label: 'Giao 2 giờ', sub: 'Nội thành' },
                { icon: RotateCcw, label: 'Đổi 30 ngày', sub: 'Miễn phí' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center gap-1 text-center py-3 bg-zinc-50 border border-zinc-200">
                  <Icon size={16} className="text-[#E8002D]" />
                  <p className="text-xs font-display font-700 text-[#0A0A0A] leading-tight">{label}</p>
                  <p className="text-[10px] text-zinc-400 font-body">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS: SPECS & REVIEWS ── */}
        <div className="mt-12">
          <div className="flex border-b border-zinc-200">
            {(['specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-xs font-display font-700 tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-[#E8002D] text-[#0A0A0A]'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {tab === 'specs' ? 'Thông số kỹ thuật' : `Đánh giá (${product.reviews?.length || 0})`}
              </button>
            ))}
          </div>

          {activeTab === 'specs' && (
            <div className="bg-white border border-zinc-200 mt-0">
              <table className="w-full">
                <tbody>
                  {product.specs && Object.entries(product.specs).map(([key, value], i) => (
                    value ? (
                    <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                      <td className="px-5 py-3.5 w-40 text-xs font-display font-700 tracking-wider uppercase text-zinc-500 border-r border-zinc-200">
                        {SPEC_LABELS[key] ?? key}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-body text-[#0A0A0A]">{value}</td>
                    </tr>
                    ) : null
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="mt-4 space-y-4">
              {/* Rating summary */}
              <div className="bg-white border border-zinc-200 p-6 flex items-center gap-8">
                <div className="text-center">
                  <p className="font-display font-900 text-5xl text-[#0A0A0A]">{product.rating}</p>
                  <StarRating rating={product.rating} showCount={false} size={18} />
                  <p className="text-xs text-zinc-400 font-body mt-1">
                    {product.reviewCount.toLocaleString('vi-VN')} đánh giá
                  </p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const pct = star === 5 ? 72 : star === 4 ? 18 : star === 3 ? 6 : star === 2 ? 2 : 2;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs font-mono-data text-zinc-500 w-4">{star}</span>
                        <Star size={11} fill="#F59E0B" strokeWidth={0} className="text-amber-400" />
                        <div className="flex-1 h-1.5 bg-zinc-100 overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-mono-data text-zinc-400 w-8">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review cards */}
              {product.reviews?.map(review => (
                <div key={review.id} className="bg-white border border-zinc-200 p-5">
                  <div className="flex items-start gap-3">
                    <img
                      src={review.avatar}
                      alt={review.author}
                      className="w-10 h-10 object-cover flex-shrink-0 bg-zinc-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div>
                          <p className="font-display font-700 text-sm text-[#0A0A0A]">
                            {review.author}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} showCount={false} size={12} />
                            {review.verified && (
                              <span className="flex items-center gap-1 text-[10px] text-green-600 font-display font-600">
                                <Check size={9} strokeWidth={3} />
                                Đã mua hàng
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-zinc-400 font-mono-data flex-shrink-0">
                          {review.date}
                        </span>
                      </div>
                      <p className="font-display font-700 text-sm text-[#0A0A0A] mt-2">{review.title}</p>
                      <p className="text-sm text-zinc-600 font-body mt-1 leading-relaxed">{review.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display font-800 text-2xl text-[#0A0A0A] tracking-tight mb-5">
              Sản phẩm cùng hãng
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
