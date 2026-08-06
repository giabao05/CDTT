'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search, ShoppingCart, User, Menu, X, ChevronDown,
  Phone, Smartphone, Apple, Cpu, Bell, Shield, CheckCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuthStore } from '../store/authStore';
import type { Brand } from '../types';
import { products } from '../data/products';
import Link from 'next/link';
import { fetchUserNotifications, markNotificationAsRead, fetchVouchers } from '../lib/api';
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

  const suggestions = searchQuery.length > 1
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

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
    if (user && user.email) {
      // Initial fetch
      fetchUserNotifications(user.email).then(data => setNotifications(data));
      
      // Poll for new notifications every 5 seconds
      interval = setInterval(() => {
        fetchUserNotifications(user.email).then(data => setNotifications(data));
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
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

  const isActive = (path: string) => pathname === path;

  // Don't show header on order success page if you want (I'll keep it for now)

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A] border-b border-zinc-800">
      <div className="bg-[#E8002D] text-white text-xs font-display font-600 tracking-wider text-center py-1.5 px-4 overflow-hidden relative h-7">
        <div 
          className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateY(-${currentVoucherIndex * 28}px)` }}
        >
          {vouchers.length > 0 ? (
            vouchers.map((v, i) => (
              <span key={i} className="flex items-center justify-center gap-2 h-7 flex-shrink-0">
                <Bell size={11} />
                Ưu đãi: Giảm {v.discountPercent}% cho đơn hàng — Nhập mã: {v.code}
              </span>
            ))
          ) : (
            <span className="flex items-center justify-center gap-2 h-7 flex-shrink-0">
              <Bell size={11} />
              Miễn phí vận chuyển đơn hàng từ 5.000.000 ₫ — Mã: PHONE10 giảm thêm 10%
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-[#E8002D] flex items-center justify-center">
              <Smartphone size={16} className="text-white" />
            </div>
            <span className="font-display font-900 text-white text-xl tracking-tight">
              PHONE<span className="text-[#E8002D]"> STORE</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-4">
            <Link
              href="/"
              className={`px-3 py-1.5 text-xs font-display font-600 tracking-wider uppercase transition-colors ${
                isActive('/') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              href="/product"
              className={`px-3 py-1.5 text-xs font-display font-600 tracking-wider uppercase transition-colors ${
                isActive('/product') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sản phẩm
            </Link>
            <Link
              href="/articles"
              className={`px-3 py-1.5 text-xs font-display font-600 tracking-wider uppercase transition-colors ${
                isActive('/articles') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Bài viết
            </Link>
            <Link
              href="/contact"
              className={`px-3 py-1.5 text-xs font-display font-600 tracking-wider uppercase transition-colors ${
                isActive('/contact') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Liên hệ
            </Link>
            <Link
              href="/promotions"
              className={`px-3 py-1.5 text-xs font-display font-600 tracking-wider uppercase transition-colors ${
                isActive('/promotions') ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Khuyến mãi
            </Link>
          </nav>

          <div className="flex-1 max-w-md relative" ref={searchRef}>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Tìm kiếm iPhone, Samsung, Xiaomi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm placeholder:text-zinc-500 pl-9 pr-4 py-2 focus:outline-none focus:border-zinc-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {searchOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-zinc-700 shadow-2xl z-50">
                {suggestions.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => {
                      router.push(`/product/${p.slug}`);
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-900 transition-colors text-left"
                  >
                    <img
                      src={p.thumbnail}
                      alt={p.name}
                      className="w-9 h-9 object-cover bg-zinc-800 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-display font-600 truncate">{p.name}</p>
                      <p className="text-xs text-[#E8002D] font-mono-data">
                        {((p.variants[0].salePrice ?? p.variants[0].price)).toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
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
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-zinc-200 shadow-xl rounded-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                      <span className="font-700 text-zinc-900 text-sm">Thông báo</span>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleReadAllNotifs}
                            className="text-xs text-blue-600 font-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                            title="Đánh dấu đã đọc tất cả"
                          >
                            <CheckCheck size={14} /> Đã đọc hết
                          </button>
                        )}
                        <span className="text-xs bg-[#E8002D] text-white px-2 py-0.5 rounded-full">{unreadCount} mới</span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-zinc-500 text-sm">Chưa có thông báo nào.</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.read && handleReadNotif(n.id)}
                            className={`p-4 border-b border-zinc-50 cursor-pointer transition-colors hover:bg-zinc-50 ${!n.read ? 'bg-blue-50/30' : ''}`}
                          >
                            <h4 className={`text-sm ${!n.read ? 'font-700 text-zinc-900' : 'font-600 text-zinc-700'}`}>{n.title}</h4>
                            <p className="text-xs text-zinc-500 mt-1">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {user?.role === 'ADMIN' && (
              <Link href="/admin" className="hidden sm:flex items-center gap-2 px-3 py-2 text-[#E8002D] hover:text-white transition-colors">
                <Shield size={18} />
                <span className="text-xs font-display font-600 tracking-wide hidden lg:block">
                  Quản trị
                </span>
              </Link>
            )}

            <Link href={user ? "/profile" : "/login"} className="hidden sm:flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white transition-colors">
              <User size={18} />
              <span className="text-xs font-display font-600 tracking-wide hidden lg:block">
                {user ? 'Hồ sơ' : 'Đăng nhập'}
              </span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ShoppingCart size={18} />
              <span className="text-xs font-display font-600 tracking-wide hidden sm:block">
                Giỏ hàng
              </span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-[#E8002D] text-white text-[10px] font-display font-800 flex items-center justify-center px-1">
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
