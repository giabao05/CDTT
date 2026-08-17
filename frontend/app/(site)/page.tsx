'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, Truck, RotateCcw, ChevronRight, ChevronLeft, TrendingUp, Calendar, User, FileText, Smartphone, Gift } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Brand, Product } from '@/types';
import { fetchFeaturedProducts, fetchProducts, fetchBanners, fetchArticles, fetchBrands, getSystemSetting, fetchVouchers } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import LoadingScreen from '@/components/LoadingScreen';
import { useAuthStore } from '@/store/authStore';
import { X } from 'lucide-react';



const PRICE_SEGMENTS = [
  { label: 'Dưới 5 triệu', sub: 'Giá tốt nhất', color: '#22C55E' },
  { label: '5 – 10 triệu', sub: 'Tầm trung', color: '#3B82F6' },
  { label: '10 – 20 triệu', sub: 'Cao cấp', color: '#8B5CF6' },
  { label: 'Trên 20 triệu', sub: 'Flagship', color: '#E8002D' },
];

let cachedHomeData: any = null;

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [heroSlide, setHeroSlide] = useState(0);
  const [featured, setFeatured] = useState<Product[]>(cachedHomeData?.featData || []);
  const [newProducts, setNewProducts] = useState<Product[]>(cachedHomeData?.newProducts || []);
  const [banners, setBanners] = useState<any[]>(cachedHomeData?.bannersData || []);
  const [articles, setArticles] = useState<any[]>(cachedHomeData?.articlesData || []);
  const [showPromoPopup, setShowPromoPopup] = useState(true);
  const [brands, setBrands] = useState<any[]>(cachedHomeData?.brandsData || []);
  const [allProducts, setAllProducts] = useState<Product[]>(cachedHomeData?.allProducts || []);
  const [loading, setLoading] = useState(true);
  const [trustFeatures, setTrustFeatures] = useState(cachedHomeData?.trustFeatures || [
    { icon: 'Truck', label: 'Miễn phí giao hàng', sub: 'Đơn từ 5.000.000 ₫' },
    { icon: 'Shield', label: 'Bảo hành chính hãng', sub: '12 – 24 tháng' },
    { icon: 'RotateCcw', label: '1 đổi 1 trong 30 ngày', sub: 'Lỗi do nhà sản xuất' },
    { icon: 'Zap', label: 'Giao trong 2 giờ', sub: 'Nội thành HCM & HN' },
  ]);
  const [footerSettings, setFooterSettings] = useState<any>(cachedHomeData?.footerSettings || null);
  const [vouchers, setVouchers] = useState<any[]>(cachedHomeData?.vouchersData || []);
  const [currentVoucherIndex, setCurrentVoucherIndex] = useState(0);

  useEffect(() => {
    if (vouchers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentVoucherIndex(prev => (prev + 1) % vouchers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [vouchers]);

  useEffect(() => {
    async function loadData() {
      if (cachedHomeData) {
        setLoading(false);
        return;
      }
      try {
        const [featData, allData, bannersData, articlesData, brandsData, trustFeaturesSetting, footerSetting, vouchersData] = await Promise.all([
          fetchFeaturedProducts(),
          fetchProducts(),
          fetchBanners(),
          fetchArticles(),
          fetchBrands(),
          getSystemSetting('trust_features').catch(() => null),
          getSystemSetting('footer_settings').catch(() => null),
          fetchVouchers().catch(() => [])
        ]);
        
        const filteredBanners = bannersData.filter((b: any) => b.isActive).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        const slicedNewProducts = allData.products.slice(0, 8);
        const filteredArticles = articlesData.filter((a: any) => a.isPublished).slice(0, 3);
        const filteredVouchers = vouchersData && vouchersData.length > 0 ? vouchersData.filter((v: any) => v.isActive !== false) : [];
        
        let parsedTrust = trustFeatures;
        let parsedFooter = null;

        if (trustFeaturesSetting && trustFeaturesSetting.value) {
          try { parsedTrust = JSON.parse(trustFeaturesSetting.value); } catch (e) {}
        }
        if (footerSetting && footerSetting.value) {
          try { parsedFooter = JSON.parse(footerSetting.value); } catch (e) {}
        }

        cachedHomeData = {
          featData,
          bannersData: filteredBanners,
          newProducts: slicedNewProducts,
          allProducts: allData.products,
          articlesData: filteredArticles,
          brandsData,
          vouchersData: filteredVouchers,
          trustFeatures: parsedTrust,
          footerSettings: parsedFooter
        };

        setFeatured(featData);
        setBanners(filteredBanners);
        setNewProducts(slicedNewProducts);
        setAllProducts(allData.products);
        setArticles(filteredArticles);
        setBrands(brandsData);
        setVouchers(filteredVouchers);
        setTrustFeatures(parsedTrust);
        setFooterSettings(parsedFooter);
        
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroProducts = featured.length >= 3 ? featured : (newProducts.length >= 3 ? newProducts : []);

  const heroSlides = heroProducts.slice(0, 3).map((p, i) => ({
    title: p.name,
    subtitle: p.description || 'Sản phẩm nổi bật mới nhất.',
    cta: 'Khám phá ngay',
    product: p,
    bg: i === 0 ? '#0A0A0A' : i === 1 ? '#0D1B3E' : '#1A0A00',
    accent: i === 0 ? '#E8002D' : i === 1 ? '#3B82F6' : '#FF6900',
    tag: i === 0 ? 'MỚI RA MẮT' : i === 1 ? 'BÁN CHẠY' : 'GIẢM GIÁ',
  }));

  useEffect(() => {
    const totalSlides = banners.length > 0 ? banners.length : heroSlides.length;
    if (totalSlides <= 1) return;
    const interval = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length, heroSlides.length]);

  const slide = heroSlides[heroSlide];

  if (loading) {
    return <LoadingScreen />;
  }

  const defaultFooter = {
    companyName: 'PHONE STORE',
    description: 'Hệ thống bán lẻ điện thoại chính hãng uy tín số 1 Việt Nam. Cam kết 100% hàng chính hãng.',
    columns: [
      { title: 'Sản phẩm', links: 'iPhone,Samsung Galaxy,Xiaomi,OPPO,Vivo' },
      { title: 'Hỗ trợ', links: 'Theo dõi đơn hàng,Đổi trả & Hoàn tiền,Bảo hành,Liên hệ' },
      { title: 'Công ty', links: 'Về Phone Store,Tuyển dụng,Chính sách,Blog' }
    ],
    copyright: '© 2025 Phone Store. All rights reserved.',
    license: 'Giấy phép ĐKKD: 0123456789 — HCM, Việt Nam'
  };

  const activeFooter = footerSettings || defaultFooter;

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      {/* Khuyến mãi Popup (Dựa vào cấu hình user) */}
      {user?.promoNotifEnabled && showPromoPopup && (
        <div className="fixed bottom-28 right-6 z-50 w-80 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-red-100 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 text-white relative">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Gift size={20} /> Ưu đãi độc quyền!
            </h3>
            <button onClick={() => setShowPromoPopup(false)} className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-5">
            <p className="text-gray-600 text-sm mb-4">Chào {user.name || 'bạn'}, hệ thống đang có ưu đãi giảm 20% cho toàn bộ sản phẩm hôm nay.</p>
            <button onClick={() => { setShowPromoPopup(false); router.push('/promotions'); }} className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition-colors shadow-md shadow-red-600/30">
              Xem ưu đãi ngay
            </button>
          </div>
        </div>
      )}

      {banners.length > 0 ? (
        <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] group bg-[#050505] overflow-hidden p-2 md:p-6">
          
          <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-[#0a0a0a] border border-[#333] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center">
            
            {/* Elegant wavy vector-like background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,0,100,0.15),_transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(255,215,0,0.05),_transparent_40%)]"></div>
            <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-20 pointer-events-none" style={{ backgroundImage: 'repeating-radial-gradient(circle at center, transparent 0, transparent 40px, rgba(255,215,0,0.1) 41px, rgba(255,215,0,0.1) 42px)' }}></div>


            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-6 md:px-16 w-full h-full flex flex-col md:flex-row items-center justify-between gap-8 py-12 relative z-20">
                
                {/* TEXT CONTAINER (Animating) */}
                <div className="flex-1 w-full h-full relative flex items-center">
                  {banners.map((b, i) => (
                    <div 
                      key={`text-${b.id}`}
                      className="absolute left-0 right-0 flex flex-col items-center md:items-start text-center md:text-left transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu"
                      style={{ 
                        opacity: i === heroSlide ? 1 : 0, 
                        zIndex: i === heroSlide ? 10 : 0,
                        transform: i === heroSlide ? 'perspective(2000px) rotateX(0deg) translateZ(0) scale(1)' : 'perspective(2000px) rotateX(15deg) translateZ(-200px) translateY(40px) scale(0.95)',
                        filter: i === heroSlide ? 'blur(0px) brightness(1)' : 'blur(15px) brightness(0.5)',
                        pointerEvents: i === heroSlide ? 'auto' : 'none'
                      }}
                    >
                      <div className="inline-flex items-center justify-center relative mb-6">
                        <div className="absolute inset-0 bg-[#ffd700] rounded-sm transform skew-x-[-20deg] scale-105 opacity-30 blur-[2px]"></div>
                        <div className="relative bg-[#111] border border-[#d4af37] px-6 py-1.5 transform skew-x-[-20deg] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                          <span className="block transform skew-x-[20deg] text-[#d4af37] font-sans font-bold text-[10px] md:text-xs uppercase tracking-[0.3em]">
                            THE SMART CHOICE
                          </span>
                        </div>
                      </div>
                      
                      <h2 className="text-5xl md:text-6xl lg:text-[5.5rem] font-serif uppercase text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-6 tracking-wider leading-tight drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]">
                        {b.title}
                      </h2>
                      
                      <p className="font-sans text-sm md:text-base mb-10 max-w-md mx-auto md:mx-0 leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-gray-200 via-white to-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                        {b.description || 'Trải nghiệm sự hoàn mỹ. Khám phá ngay sản phẩm đỉnh cao với công nghệ vượt trội - Độc quyền, Giá tốt.'}
                      </p>
                      
                      {b.linkUrl && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); router.push(b.linkUrl); }}
                          className="group/btn relative inline-flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-[#5a0000] via-[#990000] to-[#5a0000] text-white font-sans font-bold text-sm uppercase tracking-widest rounded-full border-[2px] border-[#d4af37] shadow-[0_0_20px_rgba(255,0,0,0.4),_inset_0_0_10px_rgba(255,100,100,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,50,50,0.6)] active:scale-95 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover/btn:translate-x-[150%] transition-transform duration-[1500ms]"></div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#ff6b6b] to-[#8b0000] border border-[#ffb3b3] shadow-[0_0_10px_#ff0000] flex items-center justify-center transform rotate-45">
                            <div className="w-2 h-2 bg-white/80 rounded-sm blur-[1px]"></div>
                          </div>
                          KHÁM PHÁ NGAY
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* IMAGE CONTAINER (Static Rings, Animating Image) */}
                <div className="flex-1 w-full h-full relative flex items-center justify-center md:justify-end cursor-pointer" onClick={() => { if (banners[heroSlide]?.linkUrl) router.push(banners[heroSlide].linkUrl) }}>
                   <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] flex items-center justify-center group/rings">
                      
                      {/* STATIC RINGS */}
                      <div className="absolute inset-[-20%] rounded-full bg-[#ff0066] opacity-20 blur-[60px] group-hover/rings:opacity-40 transition-opacity duration-1000"></div>
                      <div className="absolute inset-[0%] rounded-full border-[1px] border-[#d4af37]/40 shadow-[0_0_20px_rgba(255,0,100,0.5)] animate-[spin_20s_linear_infinite]"></div>
                      <div className="absolute inset-[5%] rounded-full bg-gradient-to-br from-[#ff99cc] via-[#ff0066] to-[#660022] p-[6px] shadow-[0_0_40px_rgba(255,0,100,0.6)]">
                        <div className="w-full h-full rounded-full bg-[#111]"></div>
                      </div>
                      <div className="absolute inset-[14%] rounded-full border-[8px] border-[#ff0066] shadow-[0_0_30px_#ff0066,_inset_0_0_30px_#ff0066] animate-[pulse_3s_ease-in-out_infinite]"></div>
                      <div className="absolute inset-[15%] rounded-full bg-gradient-to-tr from-[#990033] via-[#ff0066] to-[#ff3399] opacity-80 backdrop-blur-md overflow-hidden">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(0,0,0,0.4)_100%)]"></div>
                      </div>

                      {/* ANIMATING IMAGES */}
                      {banners.map((b, i) => {
                        let state = 'next';
                        if (i === heroSlide) state = 'active';
                        else if (i === (heroSlide - 1 + banners.length) % banners.length) state = 'prev';

                        return (
                          <img 
                            key={`img-${b.id}`}
                            src={b.imageUrl} 
                            alt={b.title} 
                            className="absolute z-20 w-[65%] h-[120%] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform-gpu group-hover/rings:scale-110 group-hover/rings:-translate-y-4"
                            style={{ 
                              opacity: state === 'active' ? 1 : 0, 
                              zIndex: state === 'active' ? 10 : 0,
                              transform: state === 'active' 
                                ? 'perspective(2000px) rotateY(0deg) translateZ(0) scale(1)' 
                                : state === 'prev' 
                                  ? 'perspective(2000px) rotateY(30deg) translateZ(-300px) translateX(-100px) scale(0.8)' 
                                  : 'perspective(2000px) rotateY(-30deg) translateZ(-300px) translateX(100px) scale(0.8)',
                              filter: state === 'active' ? 'blur(0px)' : 'blur(10px)',
                              pointerEvents: state === 'active' ? 'auto' : 'none'
                            }}
                          />
                        );
                      })}

                      {/* STATIC BADGE ĐỘC QUYỀN */}
                      <div className="absolute -top-[5%] z-30 px-6 py-1.5 bg-gradient-to-b from-[#800000] to-[#4d0000] border-[2px] border-[#d4af37] rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.8),_inset_0_2px_4px_rgba(255,255,255,0.2)] transform transition-transform duration-700 group-hover/rings:scale-110 pointer-events-none">
                        <span className="text-[#fff5c3] font-sans font-bold text-xs tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          ĐỘC QUYỀN
                        </span>
                      </div>
                   </div>
                </div>

              </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); setHeroSlide((prev) => (prev - 1 + banners.length) % banners.length); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:border-[#d4af37] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            >
              <ChevronLeft size={24} />
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); setHeroSlide((prev) => (prev + 1) % banners.length); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 border border-white/10 text-white backdrop-blur-sm hover:border-[#d4af37] transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-[0_0_15px_rgba(0,0,0,0.8)]"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setHeroSlide(i); }}
                  className="h-1.5 transition-all duration-300 rounded-full"
                  style={{
                    width: i === heroSlide ? 32 : 12,
                    background: i === heroSlide ? '#d4af37' : 'rgba(255,255,255,0.2)',
                    boxShadow: i === heroSlide ? '0 0 10px rgba(212,175,55,0.5)' : 'none'
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      ) : heroSlides.length > 0 ? (
      <section
        className="relative overflow-hidden"
        style={{ background: slide.bg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] lg:min-h-[560px]">
            <div className="flex flex-col justify-center py-16 lg:py-20 pr-0 lg:pr-12 relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-display font-700 tracking-widest uppercase mb-6 w-fit"
                style={{ background: slide.accent, color: '#fff' }}
              >
                <Zap size={10} />
                {slide.tag}
              </div>

              <h1 className="font-display font-900 text-white text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight mb-4">
                {slide.title.split(' ').map((word, i) => (
                  <span key={i} className={i === slide.title.split(' ').length - 1 ? '' : 'block'}>
                    {word}{' '}
                  </span>
                ))}
              </h1>

              <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-sm font-body leading-relaxed line-clamp-3">
                {slide.subtitle}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => router.push(`/product/${slide.product.slug}`)}
                  className="flex items-center gap-2 px-6 py-3 font-display font-700 text-sm tracking-wider uppercase text-white transition-all duration-200 hover:gap-4"
                  style={{ background: slide.accent }}
                >
                  {slide.cta}
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => router.push('/product')}
                  className="flex items-center gap-2 px-6 py-3 font-display font-600 text-sm tracking-wider uppercase text-zinc-300 border border-zinc-700 hover:border-zinc-400 hover:text-white transition-colors"
                >
                  Tất cả sản phẩm
                </button>
              </div>

              <div className="mt-8 flex items-baseline gap-3">
                <span className="text-zinc-500 text-sm font-body">Chỉ từ</span>
                <span className="font-display font-800 text-2xl" style={{ color: slide.accent }}>
                  {((slide.product.baseSalePrice ?? slide.product.basePrice)).toLocaleString('vi-VN')} ₫
                </span>
                {slide.product.baseSalePrice && (
                  <span className="text-zinc-600 text-sm line-through font-mono-data">
                    {slide.product.basePrice.toLocaleString('vi-VN')} ₫
                  </span>
                )}
              </div>
            </div>

            <div className="hidden lg:flex items-end justify-center relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at 60% 40%, ${slide.accent} 0%, transparent 60%)`,
                }}
              />
              <img
                src={slide.product.thumbnail || slide.product.images?.[0] || 'https://via.placeholder.com/400'}
                alt={slide.product.name}
                className="relative z-10 w-full max-w-sm object-contain drop-shadow-2xl"
                style={{ maxHeight: '520px' }}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-4 sm:left-6 flex gap-2 z-20">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className="h-1 transition-all duration-300"
              style={{
                width: i === heroSlide ? 32 : 8,
                background: i === heroSlide ? slide.accent : '#3F3F46',
              }}
            />
          ))}
        </div>

        <div className="absolute right-4 sm:right-6 bottom-6 flex gap-2 z-20">
          {heroSlides.map((s, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className="w-16 h-10 overflow-hidden border-2 transition-all"
              style={{ borderColor: i === heroSlide ? slide.accent : 'transparent' }}
            >
              <img src={s.product.thumbnail || s.product.images?.[0] || 'https://via.placeholder.com/150'} alt={s.product.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>
      ) : (
        <section className="bg-black py-20 text-center flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-white text-3xl font-display font-800 mb-4">Chưa có sản phẩm nào</h1>
          <button
             onClick={() => router.push('/product')}
             className="px-6 py-3 font-display font-600 text-sm uppercase text-white border border-zinc-700 hover:border-zinc-400 transition-colors"
           >
             Xem thêm
          </button>
        </section>
      )}

      <div className="relative z-30 -mt-6 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="bg-[#111]/90 backdrop-blur-xl rounded-2xl border border-zinc-800/80 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-zinc-800/60">
            {trustFeatures.map(({ icon, label, sub }) => {
              const Icon = (LucideIcons as any)[icon] || LucideIcons.CheckCircle;
              return (
              <div key={label} className="group flex items-center gap-4 px-4 sm:px-6 py-5 cursor-pointer hover:bg-white/[0.03] transition-colors duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
                
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center flex-shrink-0 group-hover:border-[#ff3333] group-hover:shadow-[0_0_15px_rgba(255,51,51,0.3)] transition-all duration-300 group-hover:-translate-y-1">
                  <Icon size={20} className="text-[#E8002D] group-hover:text-[#ffcccc] transition-colors duration-300 group-hover:scale-110" />
                </div>
                <div className="relative z-10">
                  <p className="text-zinc-200 text-xs sm:text-sm font-display font-700 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#ffaa00] transition-all duration-300">{label}</p>
                  <p className="text-zinc-500 text-[10px] sm:text-[11px] font-body mt-0.5 group-hover:text-zinc-400 transition-colors duration-300">{sub}</p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight">
            Thương hiệu
          </h2>
          <button
            onClick={() => router.push('/product')}
            className="flex items-center gap-1 text-xs font-display font-600 tracking-wider uppercase text-zinc-500 hover:text-[#E8002D] transition-colors"
          >
            Xem tất cả <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {brands.map((brand: any) => (
            <div key={brand.name} className="relative group z-0 rounded-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 hover-shake-tilt hover:shadow-[0_20px_50px_rgba(255,0,128,0.15)]">
              
              <div className="absolute -inset-[15px] rounded-[2.5rem] bg-gradient-to-tr from-[#ff0055] via-[#ffaa00] to-[#00aaff] opacity-0 blur-2xl group-hover:opacity-80 transition-all duration-700 pointer-events-none z-0"></div>

              <div className="absolute -inset-[3px] rounded-[1.1rem] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square animate-[spin_3s_linear_infinite]" 
                      style={{ backgroundImage: 'conic-gradient(from 0deg, #ff0055, #ffaa00, #00aaff, #aa00ff, #ff0055)' }}>
                 </div>
              </div>
              
              <button
                onClick={() => router.push(`/product?brand=${brand.name}`)}
                className="relative w-[130px] sm:w-[160px] flex flex-col items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl overflow-hidden z-20 border border-zinc-200 group-hover:border-transparent transition-colors duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/90 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-[150%] group-hover:translate-x-[150%] transition-all duration-[1200ms] ease-in-out z-20 pointer-events-none"></div>

                <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-50 border border-zinc-100 transition-colors z-10 flex items-center justify-center p-1">
                  <img
                    src={brand.logoUrl || 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&h=80&fit=crop'}
                    alt={brand.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 rounded-md"
                  />
                </div>
                <div className="text-center z-10">
                  <p className="text-xs sm:text-sm font-display font-800 text-[#0A0A0A] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#ff0055] group-hover:to-[#00aaff] transition-all duration-300">
                    {brand.name}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-mono-data mt-0.5">
                    {allProducts.filter(p => p.brand?.toLowerCase() === brand.name?.toLowerCase()).length} máy
                  </p>
                </div>
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="py-4 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight mb-6">
          Lọc theo mức giá
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRICE_SEGMENTS.map(seg => (
            <button
              key={seg.label}
              onClick={() => router.push('/product')}
              className="relative group overflow-hidden flex items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-zinc-200 hover:border-transparent transition-all duration-500 hover:shadow-[0_15px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 text-left z-10"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10 rounded-2xl" 
                style={{ background: `linear-gradient(135deg, ${seg.color}15, transparent)` }} 
              />
              
              <div 
                className="absolute -inset-[2px] rounded-[1.1rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-20 animate-[spin_4s_linear_infinite]"
                style={{ backgroundImage: `conic-gradient(from 0deg, ${seg.color}, transparent, ${seg.color})` }}
              />
              <div className="absolute inset-[1px] rounded-2xl bg-white pointer-events-none -z-10" />

              <div
                className="w-1.5 self-stretch rounded-full flex-shrink-0 group-hover:scale-y-125 transition-all duration-500"
                style={{ background: seg.color, boxShadow: `0 0 10px ${seg.color}80` }}
              />
              
              <div className="relative z-10 flex-1">
                <p className="font-display font-800 text-sm text-[#0A0A0A] group-hover:translate-x-1 transition-transform duration-300">
                  <span className="bg-clip-text group-hover:text-transparent transition-colors duration-300" style={{ backgroundImage: `linear-gradient(to right, #0A0A0A, ${seg.color})` }}>{seg.label}</span>
                </p>
                <p className="text-[11px] text-zinc-500 font-body mt-0.5 group-hover:translate-x-1 transition-transform duration-300 delay-75">{seg.sub}</p>
              </div>
              
              <div 
                className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-white group-hover:border-transparent group-hover:rotate-[360deg] transition-all duration-700 shadow-sm" 
                style={{ color: seg.color }}
              >
                 <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-1.5 h-10 rounded-full overflow-hidden shadow-[0_0_10px_rgba(232,0,45,0.4)]">
               <div className="absolute inset-0 bg-gradient-to-b from-[#E8002D] to-[#ff0055] group-hover:scale-y-150 transition-transform duration-500 ease-out" />
               <div className="absolute inset-0 bg-[#E8002D] blur-[2px] opacity-70 animate-[pulse_2s_infinite]" />
            </div>
            <div>
               <p className="text-[10px] sm:text-xs font-display font-700 tracking-[0.2em] uppercase text-zinc-400 group-hover:text-[#E8002D] transition-colors duration-300">
                Đề xuất cho bạn
              </p>
              <h2 className="font-display font-900 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#E8002D] group-hover:to-zinc-800 transition-all duration-300">
                Sản phẩm nổi bật
              </h2>
            </div>
          </div>
          <button
            onClick={() => router.push('/product')}
            className="flex items-center gap-1 text-xs font-display font-600 tracking-wider uppercase text-zinc-500 hover:text-[#E8002D] transition-colors"
          >
            Xem tất cả <ChevronRight size={14} />
          </button>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500">Chưa có sản phẩm nổi bật</div>
        )}
      </section>

      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0a0a0a] via-[#1a0505] to-[#2a0000] p-8 sm:p-12 border border-[#ff0033]/20 shadow-[0_20px_50px_rgba(232,0,45,0.2)] group cursor-pointer" onClick={() => router.push('/promotions')}>
          
          <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none">
             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyMHYyMEgwVjB6bTEwIDEwYTEgMSAwIDAgMCAwIDJoLjAxYTEgMSAwIDAgMCAwLTJoLS4wMXoiIGZpbGw9IiMzMzMiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] animate-[pulse_4s_infinite]" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff0055]/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="relative min-h-[160px] w-full sm:w-[70%]">
              {vouchers.length > 0 ? vouchers.map((v, i) => (
                <div 
                  key={i}
                  className={`absolute inset-0 flex flex-col justify-center transition-all duration-1000 ease-in-out ${
                    (vouchers.length === 1 || i === currentVoucherIndex)
                      ? 'opacity-100 translate-y-0 pointer-events-auto' 
                      : 'opacity-0 translate-y-4 pointer-events-none'
                  }`}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#ff0033]/50 bg-[#ff0033]/10 text-[#ff0033] text-xs font-bold tracking-widest uppercase mb-3 w-fit">
                    <Gift size={14} className="animate-pulse" /> Mã Quà Tặng
                  </div>
                  <h3 className="font-display font-900 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Giảm ngay <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{v.discountPercent}%</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-mono font-black rounded text-sm sm:text-base shadow-[0_0_20px_rgba(250,204,21,0.6)] border border-yellow-200 uppercase tracking-wider relative overflow-hidden group/code">
                      <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover/code:translate-x-full transition-transform duration-500 ease-in-out" />
                      {v.code}
                    </div>
                    <span className="text-zinc-400 text-sm">
                      (Áp dụng đến {new Date(v.expiresAt || v.endDate || Date.now()).toLocaleDateString('vi-VN')})
                    </span>
                  </div>
                </div>
              )) : (
                <div className="absolute inset-0 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#ff0033]/50 bg-[#ff0033]/10 text-[#ff0033] text-xs font-bold tracking-widest uppercase mb-3 w-fit">
                    <Gift size={14} className="animate-pulse" /> Flash Sale
                  </div>
                  <h3 className="font-display font-900 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Miễn phí <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">Ship</span>
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-mono font-black rounded text-sm sm:text-base shadow-[0_0_20px_rgba(250,204,21,0.6)] border border-yellow-200 uppercase tracking-wider relative overflow-hidden group/code">
                      <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover/code:translate-x-full transition-transform duration-500 ease-in-out" />
                      PHONE10
                    </div>
                    <span className="text-zinc-400 text-sm">
                      cho đơn hàng trên 5 triệu
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={(e) => { e.stopPropagation(); router.push('/promotions'); }}
              className="relative overflow-hidden group/btn flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-[#E8002D] to-[#ff0055] text-white font-display font-800 text-sm tracking-wider uppercase rounded-full shadow-[0_10px_30px_rgba(232,0,45,0.5)] hover:shadow-[0_15px_40px_rgba(255,0,85,0.7)] hover:scale-110 transition-all duration-300 flex-shrink-0 mt-4 sm:mt-0"
            >
               <span className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300" />
               <TrendingUp size={18} className="relative z-10 group-hover/btn:animate-[spin_1s_ease-in-out_1]" />
               <span className="relative z-10">Lấy mã ngay</span>
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-1.5 h-10 rounded-full overflow-hidden shadow-[0_0_10px_rgba(0,170,255,0.4)]">
               <div className="absolute inset-0 bg-gradient-to-b from-[#00aaff] to-[#0055ff] group-hover:scale-y-150 transition-transform duration-500 ease-out" />
               <div className="absolute inset-0 bg-[#00aaff] blur-[2px] opacity-70 animate-[pulse_2.5s_infinite]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-display font-700 tracking-[0.2em] uppercase text-zinc-400 group-hover:text-[#00aaff] transition-colors duration-300">
                Hàng mới về
              </p>
              <h2 className="font-display font-900 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00aaff] group-hover:to-zinc-800 transition-all duration-300">
                Ra mắt gần đây
              </h2>
            </div>
          </div>
        </div>

        {newProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500">Chưa có sản phẩm mới</div>
        )}
      </section>

      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto border-t border-zinc-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative w-1.5 h-10 rounded-full overflow-hidden shadow-[0_0_10px_rgba(255,170,0,0.4)]">
               <div className="absolute inset-0 bg-gradient-to-b from-[#ffaa00] to-[#ff5500] group-hover:scale-y-150 transition-transform duration-500 ease-out" />
               <div className="absolute inset-0 bg-[#ffaa00] blur-[2px] opacity-70 animate-[pulse_3s_infinite]" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-display font-700 tracking-[0.2em] uppercase text-[#ffaa00] group-hover:text-[#ff5500] transition-colors duration-300">
                Tin tức & Công nghệ
              </p>
              <h2 className="font-display font-900 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#ffaa00] group-hover:to-zinc-800 transition-all duration-300">
                Bài viết mới nhất
              </h2>
            </div>
          </div>
          <button
            onClick={() => router.push('/articles')}
            className="hidden sm:flex items-center gap-1.5 text-sm font-body font-500 text-zinc-500 hover:text-[#0A0A0A] transition-colors"
          >
            Xem thêm <ChevronRight size={14} />
          </button>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div 
                key={article.id} 
                className="group relative z-0 cursor-pointer bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-[0_20px_40px_rgba(232,0,45,0.12)] hover:border-[#E8002D]/30 transition-all duration-500 overflow-hidden flex flex-col transform hover:-translate-y-2"
                onClick={() => router.push(`/articles/${article.slug}`)}
              >
                {/* Neon Glow Aura */}
                <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-tr from-[#E8002D] to-[#ff4444] opacity-0 blur-xl group-hover:opacity-20 transition-all duration-500 -z-10 pointer-events-none"></div>

                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                  {article.thumbnail ? (
                    <img 
                      src={article.thumbnail} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <FileText size={48} />
                    </div>
                  )}
                  {/* Subtle Light Sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-[1500ms] pointer-events-none z-10"></div>
                  
                  <div className="absolute top-3 left-3 bg-[#E8002D]/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg z-20 uppercase tracking-wider">
                    Tin Mới
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col relative z-20 bg-white">
                  <h3 className="font-display font-700 text-lg text-[#0A0A0A] leading-tight mb-3 group-hover:text-[#E8002D] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-zinc-500 font-body text-sm line-clamp-3 mb-4 flex-1" dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + '...' }}></p>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-auto pt-4 border-t border-zinc-100">
<div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User size={14} />
                      {article.author}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500">Chưa có bài viết nào</div>
        )}
      </section>
    </div>
  );
}
