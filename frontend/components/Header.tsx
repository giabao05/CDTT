'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown, Camera, Loader2,
  Phone, Smartphone, Apple, Cpu, Bell, Shield, CheckCheck,
  Package, Tag, Info, AlertTriangle, Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/authStore';
import type { Brand } from '../types';
import { products } from '../data/products';
import Link from 'next/link';
import { fetchUserNotifications, markNotificationAsRead, fetchVouchers, searchProductsByQuery } from '../lib/api';
import { useRouter, usePathname } from 'next/navigation';
import { useFavoriteStore } from '../store/favoriteStore';

const BRANDS: { name: Brand; color: string }[] = [
  { name: 'Apple', color: '#0A0A0A' },
  { name: 'Samsung', color: '#1428A0' },
  { name: 'Xiaomi', color: '#FF6900' },
  { name: 'OPPO', color: '#1D6FA4' },
  { name: 'Vivo', color: '#415FFF' },
];

export default function Header() {
  const { totalItems } = useCart();
  const { user, initAuth } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64data }),
        });
        const data = await res.json();
        if (data.modelName && data.modelName.toLowerCase() !== 'unknown') {
          setSearchQuery(data.modelName);
          setSearchOpen(true);
        } else {
          alert('Không nhận diện được điện thoại trong ảnh. ' + (data.error ? `Lỗi: ${data.error}` : 'Vui lòng thử ảnh khác rõ nét hơn.'));
        }
      } catch (err) {
        console.error('Lỗi phân tích ảnh:', err);
        alert('Có lỗi xảy ra khi phân tích ảnh.');
      } finally {
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };

  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      searchProductsByQuery(searchQuery).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const fetchNotifs = () => {
      if (user && user.email) {
        fetchUserNotifications(user.email).then(data => { if (data) setNotifications(data); }).catch(() => {});
      }
    };

    if (user && user.email) {
      // Initial fetch
      fetchNotifs();
      
      // Poll for new notifications every 10 seconds (faster updates)
      interval = setInterval(fetchNotifs, 10000);
    }

    // Listen for custom event to trigger immediate update
    window.addEventListener('update-notifications', fetchNotifs);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('update-notifications', fetchNotifs);
    };
  }, [user]);

  const { initFavorites, clearFavorites } = useFavoriteStore();
  
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [currentVoucherIndex, setCurrentVoucherIndex] = useState(0);

  useEffect(() => {
    fetchVouchers().then(data => {
      if (data && data.length > 0) {
        setVouchers(data.filter((v: any) => v.isActive !== false));
      }
    });
  }, []);

  useEffect(() => {
    if (vouchers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentVoucherIndex(prev => (prev + 1) % vouchers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [vouchers]);

  useEffect(() => {
    if (user && user.email) {
      initFavorites(user.email);
    } else {
      clearFavorites();
    }
  }, [user, initFavorites, clearFavorites]);

  const handleReadNotif = async (id: number) => {
    await markNotificationAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await handleReadNotif(notif.id);
    }
    setNotifOpen(false);
    
    const titleLower = notif.title.toLowerCase();
    if (titleLower.includes('đặt hàng') || titleLower.includes('đơn hàng')) {
      router.push('/profile');
    } else if (titleLower.includes('giỏ hàng')) {
      router.push('/cart');
    } else if (titleLower.includes('khuyến mãi') || titleLower.includes('giảm giá')) {
      router.push('/product');
    } else if (titleLower.includes('cảnh báo') || titleLower.includes('bảo mật') || titleLower.includes('mật khẩu')) {
      router.push('/profile');
    }
  };

  const handleReadAllNotifs = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    // Optimistic UI update
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    
    try {
      await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));
    } catch (e) {
      console.error('Lỗi khi đánh dấu đã đọc:', e);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Don't show header on order success page if you want (I'll keep it for now)

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      <div className="bg-gradient-to-r from-[#800000] via-[#E8002D] to-[#800000] text-white text-xs font-display font-600 tracking-wider text-center py-1.5 px-4 overflow-hidden relative h-7 shadow-[0_2px_10px_rgba(232,0,45,0.3)]">
        <div 
          className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateY(-${currentVoucherIndex * 28}px)` }}
        >
          {vouchers.length > 0 ? (
            vouchers.map((v, i) => (
              <span key={i} className="flex items-center justify-center gap-2 h-7 flex-shrink-0 drop-shadow-md">
                <Bell size={11} className="animate-pulse" />
                Ưu đãi: Giảm {v.discountPercent}% cho đơn hàng — Nhập mã: <span className="text-[#ffe066] font-bold">{v.code}</span>
              </span>
            ))
          ) : (
            <span className="flex items-center justify-center gap-2 h-7 flex-shrink-0 drop-shadow-md">
              <Bell size={11} className="animate-pulse" />
              Miễn phí vận chuyển đơn hàng từ 5.000.000 ₫ — Mã: <span className="text-[#ffe066] font-bold">PHONE10</span> giảm thêm 10%
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[72px] gap-6">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group/logo">
            <div className="relative w-9 h-9 flex items-center justify-center rounded-lg overflow-hidden border border-[#ff4444]/30 shadow-[0_0_15px_rgba(232,0,45,0.4)] group-hover/logo:shadow-[0_0_25px_rgba(232,0,45,0.6)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff0033] to-[#990000]"></div>
              <Smartphone size={18} className="text-white relative z-10 transform group-hover/logo:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-display font-900 text-white text-xl tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              PHONE<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4444] to-[#ff0000]"> STORE</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 ml-4 flex-shrink-0">
            {[
              { href: '/', label: 'Trang chủ' },
              { href: '/product', label: 'Sản phẩm' },
              { href: '/articles', label: 'Bài viết' },
              { href: '/contact', label: 'Liên hệ' },
              { href: '/promotions', label: 'Khuyến mãi' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-2 xl:px-3 py-2 text-xs font-display font-600 tracking-widest uppercase transition-colors group/nav whitespace-nowrap ${
                  isActive(link.href) ? 'text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
                {isActive(link.href) ? (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-[#E8002D] to-transparent shadow-[0_-2px_10px_rgba(232,0,45,0.8)]"></span>
                ) : (
                  <span className="absolute bottom-0 left-1/2 right-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#E8002D]/50 to-transparent transition-all duration-300 group-hover/nav:left-2 group-hover/nav:right-2 opacity-0 group-hover/nav:opacity-100"></span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex-1 max-w-[350px] relative ml-2 xl:ml-6 mr-2" ref={searchRef}>
            <div className="relative group/search rounded-full">
              {/* Outer Glow */}
              <div className="absolute -inset-[2px] rounded-full overflow-hidden z-0 opacity-40 group-focus-within/search:opacity-100 group-hover/search:opacity-80 transition-opacity duration-500">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#E8002D_25%,#ff0055_50%,transparent_75%)] animate-[spin_3s_linear_infinite] blur-md" />
              </div>
              
              {/* Running Border */}
              <div className="absolute -inset-[1px] rounded-full overflow-hidden z-0 opacity-60 group-focus-within/search:opacity-100 group-hover/search:opacity-100 transition-opacity duration-500">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] aspect-square bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#E8002D_25%,#ff0055_50%,transparent_75%)] animate-[spin_3s_linear_infinite]" />
              </div>

              {/* Inner Background */}
              <div className="absolute inset-[1px] bg-[#111] rounded-full z-0 transition-colors duration-300 group-focus-within/search:bg-[#0a0a0a]" />

              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/search:text-white transition-colors duration-300 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                className="relative z-10 w-full bg-transparent text-white text-sm placeholder:text-zinc-500 pl-11 pr-20 py-2.5 focus:outline-none transition-all duration-300"
              />
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                {isAnalyzing ? (
                  <Loader2 size={16} className="text-zinc-400 animate-spin" />
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-zinc-400 hover:text-[#E8002D] transition-colors"
                    title="Tìm kiếm bằng hình ảnh"
                  >
                    <Camera size={16} />
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {searchOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-full min-w-[320px] mt-2 bg-[#111] border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 rounded-xl overflow-hidden">
                {suggestions.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => {
                      router.push(`/product/${p.slug}`);
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-800/50 last:border-0"
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-10 h-10 object-contain bg-white rounded-md flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white font-display font-600 truncate">{p.name}</p>
                      <p className="text-xs text-[#E8002D] font-mono-data mt-0.5">
                        {((p.variants[0].salePrice ?? p.variants[0].price)).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 xl:gap-3 flex-shrink-0">
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E8002D] rounded-full border border-[#0A0A0A]"></span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] rounded-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                    {/* Header */}
                    <div className="p-4 bg-white/90 border-b border-zinc-100 flex justify-between items-center shadow-sm relative z-10">
                      <div className="flex items-center gap-2">
                        <Bell size={18} className="text-[#2d1b54]" />
                        <span className="font-800 text-[#2d1b54] text-[15px]">Thông báo</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleReadAllNotifs}
                            className="text-[12px] text-indigo-600 font-700 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-md"
                            title="Đánh dấu đã đọc tất cả"
                          >
                            <CheckCheck size={14} /> Đã đọc hết
                          </button>
                        )}
                        <span className="text-[11px] font-black bg-gradient-to-r from-[#E8002D] to-[#ff4444] text-white px-2.5 py-1 rounded-full shadow-md">
                          {unreadCount > 0 ? `${unreadCount} MỚI` : '0 MỚI'}
                        </span>
                      </div>
                    </div>
                    {/* List */}
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 flex flex-col items-center justify-center text-zinc-400 gap-3">
                          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 shadow-inner">
                            <Bell size={24} className="text-zinc-300" />
                          </div>
                          <span className="text-sm font-500">Chưa có thông báo nào.</span>
                        </div>
                      ) : (
                        notifications.map(n => {
                          let Icon = Info;
                          let iconColor = 'text-blue-500';
                          let iconBg = 'bg-blue-50';
                          let iconBorder = 'border-blue-100';
                          
                          const titleLower = n.title.toLowerCase();
                          if (titleLower.includes('đặt hàng')) {
                            Icon = Package; iconColor = 'text-green-600'; iconBg = 'bg-green-50'; iconBorder = 'border-green-100';
                          } else if (titleLower.includes('giỏ hàng')) {
                            Icon = ShoppingCart; iconColor = 'text-[#E8002D]'; iconBg = 'bg-[#E8002D]/10'; iconBorder = 'border-[#E8002D]/20';
                          } else if (titleLower.includes('khuyến mãi') || titleLower.includes('giảm giá')) {
                            Icon = Tag; iconColor = 'text-orange-500'; iconBg = 'bg-orange-50'; iconBorder = 'border-orange-100';
                          } else if (titleLower.includes('cảnh báo')) {
                            Icon = AlertTriangle; iconColor = 'text-red-500'; iconBg = 'bg-red-50'; iconBorder = 'border-red-100';
                          } else if (titleLower.includes('bảo mật') || titleLower.includes('mật khẩu')) {
                            Icon = Shield; iconColor = 'text-purple-500'; iconBg = 'bg-purple-50'; iconBorder = 'border-purple-100';
                          }

                          return (
                            <div 
                              key={n.id} 
                              onClick={() => handleNotificationClick(n)}
                              className={`p-4 border-b border-zinc-100/50 cursor-pointer transition-all duration-300 hover:bg-white flex gap-3 relative overflow-hidden ${!n.read ? 'bg-indigo-50/20' : 'bg-transparent opacity-70 hover:opacity-100'}`}
                            >
                              {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />}
                              
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${iconBg} ${iconColor} ${iconBorder} shadow-sm`}>
                                <Icon size={18} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-[14px] leading-tight mb-1 truncate ${!n.read ? 'font-800 text-[#2d1b54]' : 'font-600 text-zinc-600'}`}>
                                  {n.title}
                                </h4>
                                <p className="text-[12px] text-zinc-500 leading-relaxed line-clamp-2">
                                  {n.message}
                                </p>
                                {n.createdAt && (
                                  <div className="flex items-center gap-1 mt-2 text-[10px] font-500 text-zinc-400">
                                    <Clock size={10} />
                                    <span>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-full text-[#ff4444] hover:bg-[#ff4444]/10 hover:shadow-[0_0_10px_rgba(255,68,68,0.2)] transition-all duration-300 whitespace-nowrap">
                <Shield size={16} />
                <span className="text-xs font-display font-600 tracking-wide hidden lg:block">
                  Quản trị
                </span>
              </Link>
            )}

            <Link href={user ? "/profile" : "/login"} className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-300 whitespace-nowrap">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-6 h-6 rounded-full object-cover border border-[#E8002D]/50 shadow-[0_0_5px_rgba(232,0,45,0.3)]" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <User size={14} className="text-zinc-400" />
                </div>
              )}
              <span className="text-xs font-display font-600 tracking-wide hidden lg:block">
                {user ? 'Hồ sơ' : 'Đăng nhập'}
              </span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#2a2a2a] to-[#111] rounded-full border border-zinc-700 text-zinc-200 hover:text-white hover:border-[#E8002D]/50 shadow-[0_4px_10px_rgba(0,0,0,0.5)] hover:shadow-[0_4px_15px_rgba(232,0,45,0.2)] transition-all duration-300 group/cart whitespace-nowrap"
            >
              <ShoppingCart size={16} className="group-hover/cart:text-[#E8002D] transition-colors" />
              <span className="text-xs font-display font-600 tracking-wide hidden sm:block">
                Giỏ hàng
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-gradient-to-br from-[#ff0033] to-[#990000] text-white text-[10px] font-display font-800 flex items-center justify-center px-1 rounded-full shadow-[0_2px_5px_rgba(232,0,45,0.5)] border border-[#050505]">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D0D0D] border-t border-zinc-800 px-4 py-4">
          <nav className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/product"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Sản phẩm
            </Link>
            <Link
              href="/articles"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Bài viết
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Liên hệ
            </Link>
            <Link
              href="/promotions"
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              Khuyến mãi
            </Link>
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors sm:hidden"
            >
              {user ? 'Hồ sơ cá nhân' : 'Đăng nhập'}
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left px-3 py-2.5 text-sm font-display font-600 tracking-wider uppercase text-[#E8002D] hover:text-white hover:bg-zinc-900 transition-colors sm:hidden"
              >
                Quản trị
              </Link>
            )}

          </nav>
        </div>
      )}
    </header>
  );
}
