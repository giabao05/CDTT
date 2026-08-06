'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap, Shield, Truck, RotateCcw, ChevronRight, ChevronLeft, TrendingUp, Calendar, User, FileText } from 'lucide-react';
import type { Brand, Product } from '@/types';
import { fetchFeaturedProducts, fetchProducts, fetchBanners, fetchArticles, fetchBrands } from '@/lib/api';
import ProductCard from '@/components/ProductCard';



const PRICE_SEGMENTS = [
  { label: 'Dưới 5 triệu', sub: 'Giá tốt nhất', color: '#22C55E' },
  { label: '5 – 10 triệu', sub: 'Tầm trung', color: '#3B82F6' },
  { label: '10 – 20 triệu', sub: 'Cao cấp', color: '#8B5CF6' },
  { label: 'Trên 20 triệu', sub: 'Flagship', color: '#E8002D' },
];

export default function HomePage() {
  const router = useRouter();
  const [heroSlide, setHeroSlide] = useState(0);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featData, allData, bannersData, articlesData, brandsData] = await Promise.all([
          fetchFeaturedProducts(),
          fetchProducts(),
          fetchBanners(),
          fetchArticles(),
          fetchBrands()
        ]);
        setFeatured(featData);
        setBanners(bannersData.filter((b: any) => b.isActive).sort((a: any, b: any) => a.sortOrder - b.sortOrder));
        setNewProducts(allData.products.slice(0, 8)); // Just grab the latest 8 as new
        setAllProducts(allData.products);
        setArticles(articlesData.filter((a: any) => a.isPublished).slice(0, 3)); // 3 latest articles
        setBrands(brandsData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Use featured for hero slides, fallback to newProducts if featured is empty
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
    return <div className="min-h-screen flex items-center justify-center bg-[#F8F8F7]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">

      {banners.length > 0 ? (
        <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] group bg-[#111111] border-b-[4px] border-[#5a0c0c] overflow-hidden p-4 md:p-8">
          
          {/* Cyber-Metallic Outer Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyMHYyMEgwVjB6bTEwIDEwYTEgMSAwIDAgMCAwIDJoLjAxYTEgMSAwIDAgMCAwLTJoLS4wMXoiIGZpbGw9IiMzMzMiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-20"></div>
          
          {/* The Inner Dark Metallic Plate */}
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] shadow-[inset_0_0_50px_rgba(255,0,0,0.05),_0_0_40px_rgba(0,0,0,0.9)] border-[2px] border-[#333333]">
            
            {/* Red Glow Edge */}
            <div className="absolute inset-2 border border-[#ff3333]/20 rounded-[1.5rem] shadow-[inset_0_0_40px_rgba(255,0,0,0.15)] pointer-events-none z-10"></div>
            
            {/* Concentric Ridges (Left) */}
            <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_0%_30%,_transparent_0,_transparent_15px,_rgba(255,255,255,0.02)_16px,_rgba(255,255,255,0.02)_17px)] pointer-events-none"></div>

            {banners.map((b, i) => (
              <div 
                key={b.id} 
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center"
                style={{ opacity: i === heroSlide ? 1 : 0, zIndex: i === heroSlide ? 10 : 0 }}
              >
                <div className="container mx-auto px-6 md:px-16 w-full h-full flex flex-col md:flex-row items-center justify-between gap-8 py-12 relative z-20">
                  
                  {/* Text Content (Left) */}
                  <div className="flex-1 text-center md:text-left transform transition-all duration-1000 ease-out translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 mt-8 md:mt-0 max-w-xl" style={{ opacity: i === heroSlide ? 1 : 0, transform: i === heroSlide ? 'translateY(0)' : 'translateY(2rem)', transitionDelay: '200ms' }}>
                    
                    <div className="inline-block px-5 py-1.5 bg-gradient-to-r from-[#222] to-[#111] text-[#aaa] font-sans font-semibold text-[0.65rem] md:text-xs rounded-full mb-6 uppercase tracking-[0.25em] shadow-[0_5px_10px_rgba(0,0,0,0.5)] border border-[#444]">
                      The Smart Choice
                    </div>
                    
                    <h2 className="text-5xl md:text-6xl lg:text-[5rem] font-serif uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#f3e5ab] via-[#d4af37] to-[#aa8022] mb-6 tracking-wide leading-[1.1] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] filter drop-shadow-[0_2px_0_rgba(255,255,255,0.2)]">
                      {b.title}
                    </h2>
                    
                    <p className="text-[#ccc] font-sans text-sm md:text-lg font-medium mb-10 max-w-lg mx-auto md:mx-0 leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                      {b.description || 'Trải nghiệm sự hoàn mỹ. Khám phá ngay sản phẩm đỉnh cao với công nghệ vượt trội - Độc quyền, Giá tốt.'}
                    </p>
                    
                    {b.linkUrl && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); router.push(b.linkUrl); }}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-b from-[#222] to-[#0a0a0a] text-[#ff4444] font-sans font-bold text-sm md:text-base uppercase tracking-widest rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.6),_inset_0_0_15px_rgba(255,0,0,0.2)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(255,0,0,0.3),_inset_0_0_20px_rgba(255,0,0,0.4)] active:scale-95 group/btn border border-[#ff4444]/40"
                      >
                        <Zap size={18} className="text-[#ff4444] animate-pulse" />
                        Khám Phá Ngay
                      </button>
                    )}
                  </div>

                  {/* Product Image Platform (Right) */}
                  <div className="flex-1 w-full h-full relative flex items-center justify-center md:justify-end">
                     <div className="relative w-full h-full flex items-center justify-center max-w-[450px]">
                        
                        {/* Vibrant Outer Aura Glow */}
                        <div className="absolute w-[85%] md:w-[90%] aspect-[4/5] md:aspect-square rounded-[3.5rem] bg-gradient-to-tr from-[#ff0055] via-[#ffaa00] to-[#00aaff] opacity-20 blur-2xl group-hover:opacity-70 group-hover:scale-110 transition-all duration-1000 animate-pulse z-0"></div>

                        {/* Solid White Base (Now acting as a pristine clipping container) */}
                        <div className="absolute w-[85%] aspect-[4/5] md:aspect-square bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.8),_inset_0_0_20px_rgba(0,0,0,0.05)] border-[4px] md:border-[6px] border-white/80 z-10 overflow-hidden flex items-center justify-center transform transition-all duration-1000 group-hover:-translate-y-4 group-hover:shadow-[0_50px_80px_rgba(255,50,50,0.2)] cursor-pointer" onClick={() => { if (b.linkUrl) router.push(b.linkUrl) }}>
                          {/* Inner subtle styling */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f8f8f8]"></div>
                          
                          {/* Shimmer effect that sweeps across on hover */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transform -translate-x-[150%] group-hover:translate-x-[150%] transition-all duration-[1500ms] ease-in-out z-20 pointer-events-none"></div>

                          {/* Image placed INSIDE to perfectly clip any sharp white corners */}
                          <img 
                            src={b.imageUrl} 
                            alt={b.title} 
                            className="relative z-10 w-[95%] h-[95%] object-contain mix-blend-multiply hover:scale-110 transition-transform duration-[1000ms] ease-out drop-shadow-xl" 
                          />
                        </div>

                        {/* Upgraded Glowing Gold Badge */}
                        <div className="absolute top-[2%] md:top-[4%] z-30 px-6 py-2 bg-gradient-to-b from-[#e60000] via-[#b30000] to-[#800000] border border-[#ffcc00] rounded-full text-[#ffea80] font-bold text-sm tracking-widest shadow-[0_10px_30px_rgba(255,0,0,0.6),_inset_0_1px_3px_rgba(255,255,255,0.5)] transform transition-transform duration-700 group-hover:scale-110 pointer-events-none">
                          ĐỘC QUYỀN
                        </div>
                     </div>
                  </div>

                </div>
              </div>
            ))}
            
            {/* Pagination Beads */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-30">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setHeroSlide(i); }}
                  className="h-2.5 transition-all duration-300 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
                  style={{
                    width: i === heroSlide ? 30 : 10,
                    background: i === heroSlide ? '#ff3333' : '#333333',
                    boxShadow: i === heroSlide ? '0 0 10px rgba(255,51,51,0.5)' : 'none'
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

      {/* ── TRUST BAR ───────────────────────────────────── */}
      <div className="bg-[#0A0A0A] border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-800">
            {[
              { icon: Truck, label: 'Miễn phí giao hàng', sub: 'Đơn từ 5.000.000 ₫' },
              { icon: Shield, label: 'Bảo hành chính hãng', sub: '12 – 24 tháng' },
              { icon: RotateCcw, label: 'Đổi trả 30 ngày', sub: 'Không cần lý do' },
              { icon: Zap, label: 'Giao trong 2 giờ', sub: 'Nội thành HCM & HN' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 px-4 sm:px-6 py-4">
                <div className="w-9 h-9 bg-zinc-900 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-[#E8002D]" />
                </div>
                <div>
                  <p className="text-white text-xs font-display font-700 leading-tight">{label}</p>
                  <p className="text-zinc-500 text-[10px] font-body mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BRANDS ──────────────────────────────────────── */}
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
            <div key={brand.name} className="relative group z-0 rounded-2xl transition-all duration-700 transform group-hover:-translate-y-3 group-hover:shadow-[0_20px_50px_rgba(255,0,128,0.15)]">
              
              {/* Massive Color Bleed Aura (Loang màu) */}
              <div className="absolute -inset-[15px] rounded-[2.5rem] bg-gradient-to-tr from-[#ff0055] via-[#ffaa00] to-[#00aaff] opacity-0 blur-2xl group-hover:opacity-80 transition-all duration-700 pointer-events-none z-0"></div>

              {/* Spinning RGB Gradient Border */}
              <div className="absolute -inset-[3px] rounded-[1.1rem] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] aspect-square animate-[spin_3s_linear_infinite]" 
                      style={{ backgroundImage: 'conic-gradient(from 0deg, #ff0055, #ffaa00, #00aaff, #aa00ff, #ff0055)' }}>
                 </div>
              </div>
              
              <button
                onClick={() => router.push(`/product?brand=${brand.name}`)}
                className="relative w-[130px] sm:w-[160px] flex flex-col items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl overflow-hidden z-20 border border-zinc-200 group-hover:border-transparent transition-colors duration-500"
              >
                {/* Shimmer effect that sweeps across on hover */}
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

      {/* ── PRICE SEGMENTS ──────────────────────────────── */}
      <section className="py-4 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight mb-6">
          Lọc theo mức giá
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRICE_SEGMENTS.map(seg => (
            <button
              key={seg.label}
              onClick={() => router.push('/product')}
              className="group flex items-center gap-4 p-4 bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-md transition-all text-left"
            >
              <div
                className="w-1 self-stretch flex-shrink-0"
                style={{ background: seg.color }}
              />
              <div>
                <p className="font-display font-700 text-sm text-[#0A0A0A] group-hover:text-[#E8002D] transition-colors">
                  {seg.label}
                </p>
                <p className="text-[11px] text-zinc-400 font-body mt-0.5">{seg.sub}</p>
              </div>
              <ChevronRight size={14} className="ml-auto text-zinc-300 group-hover:text-[#E8002D] transition-colors" />
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#E8002D]" />
            <div>
               <p className="text-[10px] font-display font-600 tracking-widest uppercase text-zinc-400">
                Đề xuất cho bạn
              </p>
              <h2 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight">
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

      {/* ── PROMO BANNER ────────────────────────────────── */}
      <section className="py-4 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden bg-[#0A0A0A] p-8 sm:p-12">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #E8002D 0, #E8002D 1px, transparent 0, transparent 50%)',
              backgroundSize: '12px 12px',
            }}
          />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-[#E8002D] text-[10px] font-display font-700 tracking-widest uppercase mb-2">
                Flash Sale hôm nay
              </p>
              <h3 className="font-display font-900 text-white text-3xl sm:text-4xl tracking-tight">
                Giảm đến 20%
              </h3>
              <p className="text-zinc-400 font-body text-sm mt-2">
                Áp dụng cho toàn bộ điện thoại tầm trung đến 22:00 hôm nay
              </p>
            </div>
            <button
              onClick={() => router.push('/product')}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#E8002D] text-white font-display font-700 text-sm tracking-wider uppercase hover:bg-red-600 transition-colors flex-shrink-0"
            >
              <TrendingUp size={16} />
              Mua ngay
            </button>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ─────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#0A0A0A]" />
            <div>
              <p className="text-[10px] font-display font-600 tracking-widest uppercase text-zinc-400">
                Hàng mới về
              </p>
              <h2 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight">
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

      {/* ── ARTICLES / NEWS ──────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto border-t border-zinc-200">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#E8002D]" />
            <div>
              <p className="text-[10px] font-display font-600 tracking-widest uppercase text-[#E8002D]">
                Tin tức & Công nghệ
              </p>
              <h2 className="font-display font-800 text-2xl sm:text-3xl text-[#0A0A0A] tracking-tight">
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
                className="group cursor-pointer bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                onClick={() => router.push(`/articles/${article.slug}`)}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
                  {article.thumbnail ? (
                    <img 
                      src={article.thumbnail} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <FileText size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-[#E8002D]">
                    Công nghệ
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-700 text-lg text-[#0A0A0A] leading-tight mb-3 group-hover:text-[#E8002D] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  
                  {/* Extract text from HTML content for excerpt */}
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

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="bg-[#0A0A0A] border-t border-zinc-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-[#E8002D] flex items-center justify-center">
                  <span className="text-white font-display font-900 text-xs">P</span>
                </div>
                <span className="font-display font-900 text-white text-lg">
                  PHONE<span className="text-[#E8002D]"> STORE</span>
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-body leading-relaxed">
                Hệ thống bán lẻ điện thoại chính hãng uy tín số 1 Việt Nam.
                Cam kết 100% hàng chính hãng.
              </p>
            </div>

            {[
              {
                title: 'Sản phẩm',
                links: ['iPhone', 'Samsung Galaxy', 'Xiaomi', 'OPPO', 'Vivo'],
              },
              {
                title: 'Hỗ trợ',
                links: ['Theo dõi đơn hàng', 'Đổi trả & Hoàn tiền', 'Bảo hành', 'Liên hệ'],
              },
              {
                title: 'Công ty',
                links: ['Về Phone Store', 'Tuyển dụng', 'Chính sách', 'Blog'],
              },
            ].map(col => (
              <div key={col.title}>
                <p className="text-white font-display font-700 text-xs tracking-widest uppercase mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-zinc-500 text-xs hover:text-white transition-colors font-body">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-zinc-600 text-xs font-mono-data">
              © 2025 Phone Store. All rights reserved.
            </p>
            <p className="text-zinc-600 text-xs font-body">
              Giấy phép ĐKKD: 0123456789 — HCM, Việt Nam
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
