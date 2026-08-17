'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Zap, ChevronRight, Star, Shield, Truck,
  RotateCcw, Check, ChevronLeft, Share2, Heart, Minus, Plus
} from 'lucide-react';
import Image from 'next/image';
import type { Product, ProductVariant } from '@/types';
import { fetchProductBySlug, fetchProducts } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import RecentlyViewed, { saveRecentlyViewed } from '@/components/RecentlyViewed';
import { useAuthStore } from '@/store/authStore';
import { useFavoriteStore } from '@/store/favoriteStore';
import LoadingScreen from '@/components/LoadingScreen';

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

// Invalidate cache V6
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
      if (p) {
         saveRecentlyViewed(p);
         if (p.brand) {
           const related = await fetchProducts(undefined, p.brand);
           setRelatedProducts(related.products.filter(r => r.id !== p.id).slice(0, 4));
         }
      }
      setLoading(false);
    }
    if (slug) load();
  }, [slug]);

  if (loading) {
     return <LoadingScreen />;
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
  const [overrideImage, setOverrideImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedRam, setSelectedRam] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    // Check if URL has ?review=true
    if (typeof window !== 'undefined' && window.location.search.includes('review=true')) {
      setTimeout(() => {
        setActiveTab('reviews');
        setShowReviewForm(true);
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);
    }
  }, []);

  const resolveImageUrl = (url?: string) => {
    if (!url || url.startsWith('#')) return '';
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    return `http://localhost:8080/uploads/${url}`;
  };

  const colors = [...new Set((product.variants || []).map(v => v.color))].filter(Boolean);
  
  const storagesForColor = (color: string) =>
    [...new Set((product.variants || []).filter(v => v.color === color).map(v => v.storage))].filter(Boolean);
    
  const ramsForStorage = (color: string, storage: string) => 
    [...new Set((product.variants || []).filter(v => (color ? v.color === color : true) && v.storage === storage).map(v => v.ram))].filter(Boolean);

  const initColor = selectedColor;
  const storages = initColor ? storagesForColor(initColor) : [...new Set((product.variants || []).map(v => v.storage))].filter(Boolean);
  const initStorage = selectedStorage;
  
  const rams = initStorage ? ramsForStorage(initColor, initStorage) : [...new Set((product.variants || []).map(v => v.ram))].filter(Boolean);
  const initRam = selectedRam;

  const selectedVariant: ProductVariant | undefined = (product.variants || []).find(
    v => v.color === initColor && v.storage === initStorage && v.ram === initRam
  );

  const price = selectedVariant?.salePrice ?? selectedVariant?.price ?? product.baseSalePrice ?? product.basePrice;
  const originalPrice = selectedVariant?.salePrice ? selectedVariant.price : (product.baseSalePrice ? product.basePrice : null);
  const discountPct = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;
  const inStock = selectedVariant ? (selectedVariant.stock > 0) : true;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn đầy đủ màu sắc, dung lượng và RAM trước khi thêm vào giỏ hàng!');
      return;
    }
    addItem(product, selectedVariant, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert('Vui lòng chọn đầy đủ màu sắc, dung lượng và RAM trước khi mua!');
      return;
    }
    addItem(product, selectedVariant, qty);
    router.push('/cart');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm!');
      return;
    }
    setSubmittingReview(true);
    try {
      const { createReview } = await import('@/lib/api');
      await createReview({
        productId: product.id,
        userId: user.id,
        authorName: user.name || user.email || 'Khách hàng',
        authorAvatar: user.avatar ? resolveImageUrl(user.avatar) : `https://i.pravatar.cc/150?u=${user.id}`,
        rating: reviewForm.rating,
        comment: reviewForm.body,
        isApproved: true,
      });
      alert('Đánh giá của bạn đã được gửi thành công!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', body: '' });
      // Optionally reload the page to fetch the new reviews
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Top Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/product')}
            className="flex flex-shrink-0 items-center justify-center w-8 h-8 rounded-full bg-white border border-zinc-200 text-zinc-600 hover:text-[#0A0A0A] hover:border-zinc-300 hover:shadow-sm transition-all"
            title="Quay lại trang sản phẩm"
          >
            <ChevronLeft size={18} />
          </button>
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-zinc-400 font-body">
            <button onClick={() => router.push('/')} className="hover:text-[#E8002D] transition-colors">
              Trang chủ
            </button>
            <span className="text-zinc-500">/</span>
            <button
              onClick={() => router.push(`/product?brand=${product.brand}`)}
              className="hover:text-[#E8002D] transition-colors"
            >
              {product.brand}
            </button>
            <span className="text-zinc-500">/</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8002D] to-[#ff0055] font-600 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Main layout */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-14">

          {/* ── IMAGE GALLERY ── */}
          <div className="flex flex-col-reverse sm:flex-row gap-4 lg:gap-6">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-hide">
              {(product.images && product.images.length > 0 ? product.images : [product.thumbnail || '']).map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveImage(i);
                    setOverrideImage(null);
                  }}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden transition-all duration-300 ${
                    i === activeImage && !overrideImage 
                      ? 'ring-2 ring-[#E8002D] ring-offset-2 scale-105 shadow-[0_5px_15px_rgba(232,0,45,0.2)]' 
                      : 'border border-zinc-200 hover:border-zinc-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative bg-zinc-50 rounded-3xl border border-zinc-100 aspect-square overflow-hidden group shadow-inner">
              <img
                src={overrideImage || (product.images && product.images.length > 0 ? product.images[activeImage] : product.thumbnail) || ''}
                alt={product.name}
                className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-110 drop-shadow-xl"
              />
              {discountPct && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-[#E8002D] to-[#ff0055] text-white text-xs font-display font-800 px-3 py-1.5 rounded-full shadow-[0_5px_15px_rgba(232,0,45,0.4)]">
                  -{discountPct}%
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 right-4 bg-[#0A0A0A] text-white text-[10px] font-display font-800 tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  MỚI
                </div>
              )}

              {/* Nav arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:shadow-lg hover:scale-110 text-zinc-600 hover:text-black"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImage(i => Math.min((product.images?.length || 1) - 1, i + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:shadow-lg hover:scale-110 text-zinc-600 hover:text-black"
                  >
                    <ChevronRight size={20} />
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
            <div className="bg-gradient-to-br from-[#E8002D]/5 to-zinc-50 rounded-2xl p-6 shadow-sm border border-[#E8002D]/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#E8002D]/20 to-transparent rounded-full blur-3xl group-hover:bg-[#E8002D]/30 transition-all duration-700"></div>
              <div className="flex flex-col gap-1 relative z-10">
                <div className="flex items-baseline gap-4">
                  <span className="font-display font-900 text-3xl sm:text-4xl text-[#E8002D]">
                    {fmt(price)}
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-zinc-500 line-through font-mono-data">
                      {fmt(originalPrice)}
                    </span>
                  )}
                </div>
                {originalPrice && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs bg-gradient-to-r from-[#E8002D] to-[#ff0055] text-white font-display font-800 px-3 py-1 rounded-full shadow-sm">
                      Giảm {discountPct}%
                    </span>
                    <p className="text-xs text-zinc-500 font-body font-500">
                      Tiết kiệm {fmt(originalPrice - price)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Color selector */}
            {colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display font-800 tracking-wider uppercase text-[#0A0A0A]">
                  Màu sắc
                </span>
                <span className="text-xs text-zinc-500 font-body bg-zinc-100 px-3 py-1 rounded-full">{initColor || 'Chọn màu'}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map(color => {
                  const v = (product.variants || []).find(x => x.color === color);
                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        // Only clear storage if it's not valid for the new color
                        const validStorages = [...new Set((product.variants || []).filter(v => v.color === color).map(v => v.storage))];
                        if (selectedStorage && !validStorages.includes(selectedStorage)) {
                          setSelectedStorage('');
                          setSelectedRam('');
                        } else if (selectedStorage && selectedRam) {
                          const validRams = [...new Set((product.variants || []).filter(v => v.color === color && v.storage === selectedStorage).map(v => v.ram))];
                          if (!validRams.includes(selectedRam)) {
                            setSelectedRam('');
                          }
                        }

                        if (v?.imageUrl && !v.imageUrl.startsWith('#')) {
                          setOverrideImage(resolveImageUrl(v.imageUrl));
                        } else {
                          const colorIdx = colors.indexOf(color);
                          if (product.images && colorIdx >= 0 && colorIdx < product.images.length) {
                            setActiveImage(colorIdx);
                            setOverrideImage(null);
                          }
                        }
                      }}
                      className={`relative w-11 h-11 rounded-full transition-all duration-300 ${
                        initColor === color 
                          ? 'ring-2 ring-[#0A0A0A] ring-offset-4 scale-110 shadow-lg' 
                          : 'border border-zinc-200 hover:scale-105 hover:shadow-md'
                      }`}
                      title={color}
                      style={{ backgroundColor: v?.colorCode ?? '#ccc' }}
                    >
                      {initColor === color && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check
                            size={16}
                            strokeWidth={3}
                            className={
                              v?.colorCode && parseInt(v.colorCode.slice(1), 16) < 0x888888
                                ? 'text-white drop-shadow-md'
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
            {storages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display font-800 tracking-wider uppercase text-[#0A0A0A]">
                  Dung lượng
                </span>
                <span className="text-xs text-zinc-500 font-body bg-zinc-100 px-3 py-1 rounded-full">{initStorage || 'Chọn bộ nhớ'}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {storages.map(storage => {
                  return (
                    <button
                      key={storage}
                      onClick={() => { 
                        setSelectedStorage(storage); 
                        if (selectedRam) {
                          const validRams = [...new Set((product.variants || []).filter(v => 
                            (selectedColor ? v.color === selectedColor : true) && v.storage === storage
                          ).map(v => v.ram))];
                          if (!validRams.includes(selectedRam)) {
                            setSelectedRam('');
                          }
                        }
                      }}
                      className={`px-6 py-2.5 rounded-full text-sm font-display font-700 transition-all duration-300 ${
                        initStorage === storage
                          ? 'bg-[#0A0A0A] text-white shadow-lg scale-105 border border-[#0A0A0A]'
                          : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 shadow-sm'
                      }`}
                    >
                      <span className="font-mono-data">{storage}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* RAM selector */}
            {rams.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-display font-800 tracking-wider uppercase text-[#0A0A0A]">
                  RAM
                </span>
                <span className="text-xs text-zinc-500 font-body bg-zinc-100 px-3 py-1 rounded-full">{initRam || 'Chọn RAM'}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {rams.map(ram => {
                  return (
                    <button
                      key={ram}
                      onClick={() => setSelectedRam(ram)}
                      className={`px-6 py-2.5 rounded-full text-sm font-display font-700 transition-all duration-300 ${
                        initRam === ram
                          ? 'bg-[#0A0A0A] text-white shadow-lg scale-105 border border-[#0A0A0A]'
                          : 'bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 shadow-sm'
                      }`}
                    >
                      <span className="font-mono-data">{ram}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Stock indicator */}
            {selectedVariant && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-body">
                  Còn {selectedVariant.stock} máy
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
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-800 tracking-wider uppercase text-[#0A0A0A]">
                  Số lượng
                </span>
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-full p-1 shadow-inner">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-mono-data font-700">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(selectedVariant?.stock ?? 99, q + 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <button
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || !inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#E8002D] via-[#ff0055] to-[#E8002D] bg-[length:200%_auto] hover:animate-[gradient-shift_2s_linear_infinite] text-white font-display font-800 text-sm tracking-widest uppercase shadow-[0_10px_30px_rgba(232,0,45,0.4)] hover:shadow-[0_15px_40px_rgba(232,0,45,0.6)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group/buy"
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
                  <Zap size={18} className="relative z-10 group-hover/buy:animate-[zap-shake_0.5s_ease-in-out_infinite]" />
                  <span className="relative z-10">{!selectedVariant ? 'CHỌN CẤU HÌNH' : 'Mua ngay'}</span>
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || !inStock}
                  className={`flex-1 sm:max-w-[200px] flex items-center justify-center gap-2 py-4 rounded-2xl border-2 font-display font-800 text-sm tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                    addedToCart
                      ? 'border-green-500 bg-green-500 text-white shadow-lg'
                      : 'border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} className="animate-[scale-in_0.3s_ease-out]" />
                      Đã thêm
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Thêm vào giỏ
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-100 mt-2">
              {[
                { icon: Shield, label: 'BH 12 tháng', sub: 'Chính hãng', color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', hover: 'hover:shadow-[0_10px_20px_rgba(59,130,246,0.15)] hover:border-blue-300' },
                { icon: Truck, label: 'Giao 2 giờ', sub: 'Nội thành', color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100', hover: 'hover:shadow-[0_10px_20px_rgba(34,197,94,0.15)] hover:border-green-300' },
                { icon: RotateCcw, label: 'Đổi 30 ngày', sub: 'Miễn phí', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', hover: 'hover:shadow-[0_10px_20px_rgba(249,115,22,0.15)] hover:border-orange-300' },
              ].map(({ icon: Icon, label, sub, color, bg, border, hover }) => (
                <div key={label} className={`flex flex-col items-center gap-2 text-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${bg} ${border} ${hover} group`}>
                  <div className="p-2 rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className="text-[11px] sm:text-xs font-display font-800 text-[#0A0A0A] leading-tight">{label}</p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-body mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        {/* ── TABS & RECENTLY VIEWED GRID ── */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-[2fr_1fr] lg:grid-cols-[2.5fr_1fr] gap-6 lg:gap-8 items-start">
          
          {/* ── TABS: SPECS & REVIEWS ── */}
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100 overflow-hidden">
            <div className="flex border-b border-zinc-200 relative">
            {(['specs', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-4 text-xs font-display font-800 tracking-widest uppercase transition-colors z-10 ${
                  activeTab === tab
                    ? 'text-[#0A0A0A]'
                    : 'text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {tab === 'specs' ? 'Thông số kỹ thuật' : `Đánh giá (${product.reviews?.length || 0})`}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E8002D] shadow-[0_0_10px_rgba(232,0,45,0.5)]"></div>
                )}
              </button>
            ))}
          </div>

          {activeTab === 'specs' && (
            <div className="mt-8 animate-[fade-in_0.3s_ease-out]">
              <div className="rounded-2xl border border-zinc-200 overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {product.specs && Object.entries(product.specs).map(([key, value], i) => (
                      value ? (
                      <tr key={key} className={i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'}>
                        <td className="px-6 py-4 w-1/3 text-xs font-display font-800 tracking-wider uppercase text-zinc-500 border-r border-zinc-200">
                          {SPEC_LABELS[key] ?? key}
                        </td>
                        <td className="px-6 py-4 text-sm font-body text-[#0A0A0A] font-500">{value}</td>
                      </tr>
                      ) : null
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (() => {
            const reviews = product.reviews || [];
            const reviewCount = reviews.length;
            const avgRating = reviewCount > 0 
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1) 
              : '0.0';
              
            const distribution = [5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
              return { star, count, pct };
            });

            return (
            <div className="mt-4 space-y-4">
              {/* Rating summary */}
              <div className="bg-white border border-zinc-200 p-6 flex items-center gap-8">
                <div className="text-center w-32">
                  <p className="font-display font-900 text-5xl text-[#0A0A0A]">{avgRating}</p>
                  <div className="flex justify-center mt-1">
                    <StarRating rating={Number(avgRating)} showCount={false} size={14} />
                  </div>
                  <p className="text-xs text-zinc-500 font-body mt-2">
                    {reviewCount.toLocaleString('vi-VN')} đánh giá
                  </p>
                </div>
                <div className="flex-1 space-y-2 border-l border-zinc-200 pl-8">
                  {distribution.map(({ star, pct }) => (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-8">
                        <span className="text-xs font-mono-data text-zinc-600">{star}</span>
                        <Star size={12} fill="#F59E0B" strokeWidth={0} className="text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-mono-data text-zinc-500 w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Write Review Section */}
              <div className="bg-white border border-zinc-200 p-6 flex flex-col items-center">
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-2.5 bg-[#E8002D] text-white font-display font-700 text-sm uppercase tracking-wider hover:bg-red-700 transition-colors"
                  >
                    Viết đánh giá
                  </button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="w-full max-w-2xl space-y-4">
                    <h3 className="font-display font-700 text-lg text-[#0A0A0A]">Đánh giá sản phẩm này</h3>
                    <div>
                      <label className="block text-sm font-display font-700 text-[#0A0A0A] mb-2">Chất lượng sản phẩm</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="focus:outline-none p-2 -ml-2 hover:scale-110 transition-transform"
                          >
                            <Star 
                              size={32} 
                              fill={star <= reviewForm.rating ? "#F59E0B" : "none"} 
                              className={star <= reviewForm.rating ? "text-amber-400" : "text-zinc-300"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-display font-700 text-[#0A0A0A] mb-2">Nhận xét chi tiết</label>
                      <textarea
                        required
                        value={reviewForm.body}
                        onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
                        className="w-full border border-zinc-200 p-3 text-sm font-body text-[#0A0A0A] focus:outline-none focus:border-[#E8002D]"
                        rows={4}
                        placeholder="Mời bạn chia sẻ thêm cảm nhận..."
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-6 py-2.5 border border-zinc-200 text-[#0A0A0A] font-display font-700 text-sm uppercase tracking-wider hover:bg-zinc-50 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 bg-[#E8002D] text-white font-display font-700 text-sm uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Review cards */}
              {product.reviews?.map(review => (
                <div key={review.id} className="bg-white border border-zinc-200 p-5">
                  <div className="flex items-start gap-3">
                    {review.avatar && review.avatar !== 'null' ? (
                      <img
                        src={review.avatar}
                        alt={review.author}
                        className="w-10 h-10 object-cover flex-shrink-0 rounded-full bg-zinc-100"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // prevent infinite loop
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author || 'U')}&background=e0e7ff&color=4f46e5&rounded=true`;
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm flex-shrink-0">
                        {review.author ? review.author.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
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
            );
          })()}
            </div>


          {/* ── RECENTLY VIEWED PRODUCTS ── */}
          <div className="h-full">
            <RecentlyViewed />
          </div>

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
