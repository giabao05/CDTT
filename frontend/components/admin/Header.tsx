'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Sun, Moon, ChevronDown, Store, Settings } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/admin': 'Tổng quan',
  '/admin/products': 'Quản lý Sản phẩm',
  '/admin/orders': 'Quản lý Đơn hàng',
  '/admin/customers': 'Quản lý Khách hàng',
  '/admin/vouchers': 'Khuyến mãi & Mã giảm giá',
};

const pageSubs: Record<string, string> = {
  '/admin': 'Chào buổi sáng, Admin — Hôm nay có 4 đơn hàng chờ xử lý',
  '/admin/products': '124 sản phẩm đang hoạt động',
  '/admin/orders': '6 đơn hàng mới hôm nay',
  '/admin/customers': '847 khách hàng đã đăng ký',
  '/admin/vouchers': '3 mã đang hoạt động',
};

export default function Header() {
  const pathname = usePathname();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Check local storage or default to dark
    const isDark = localStorage.getItem('theme') !== 'light';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Đơn hàng mới', desc: 'Có 1 đơn hàng mới #1024 vừa được đặt', time: '5 phút trước', unread: true },
    { id: 2, title: 'Đánh giá mới', desc: 'Sản phẩm iPhone 15 Pro vừa có đánh giá 5 sao', time: '2 giờ trước', unread: true },
    { id: 3, title: 'Thành viên mới', desc: 'Khách hàng nguyenvan@gmail.com vừa đăng ký', time: '1 ngày trước', unread: false },
  ];

  const title = pageTitles[pathname] || 'Trang quản trị';
  const sub = pageSubs[pathname] || '';

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#0d1117]/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Left: page title */}
      <div>
        <h1 className="text-[17px] font-semibold text-slate-900 dark:text-[#f1f5f9]">{title}</h1>
        <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">{sub}</p>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh..."
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-8 pr-4 py-2 text-[12px] text-slate-600 dark:text-[#94a3b8] placeholder-[#334155] w-52 focus:outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-600 dark:text-slate-400 dark:text-[#334155] font-mono">⌘K</kbd>
        </div>

        {/* Quick action - Go to user page */}
        <Link href="/" className="flex items-center gap-1.5 px-3 py-2 bg-[#6366f1] hover:bg-[#4f46e5] rounded-lg text-[12px] font-medium text-white transition-colors">
          <Store size={13} />
          <span className="hidden md:block">Trang User</span>
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="relative w-9 h-9 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:text-slate-600 dark:text-[#94a3b8] hover:border-slate-300 dark:border-[#334155] transition-colors"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full" />
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Thông báo mới</p>
                <span className="text-[10px] text-[#6366f1] cursor-pointer hover:underline">Đánh dấu đã đọc</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-3 border-b border-slate-200 dark:border-[#1e293b] hover:bg-slate-200 dark:bg-[#1e293b]/50 cursor-pointer transition-colors ${notif.unread ? 'bg-slate-200 dark:bg-[#1e293b]/20' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-[12px] ${notif.unread ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{notif.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#94a3b8]">{notif.desc}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-200 dark:border-[#1e293b] text-center">
                <Link href="/admin/orders" className="text-[11px] text-[#6366f1] hover:underline" onClick={() => setShowNotifications(false)}>
                  Xem tất cả hoạt động
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link href="/admin/settings" className="w-9 h-9 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:text-slate-600 dark:text-[#94a3b8] hover:border-slate-300 dark:border-[#334155] transition-colors">
          <Settings size={15} />
        </Link>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="w-9 h-9 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:text-slate-600 dark:text-[#94a3b8] hover:border-slate-300 dark:border-[#334155] transition-colors"
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-[#1e293b]" />

        {/* Avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-200 dark:bg-[#1e293b] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-[11px] font-bold text-slate-900 dark:text-white">
              A
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[11px] font-semibold text-slate-900 dark:text-[#f1f5f9] leading-none">Admin</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={12} className="text-slate-500 dark:text-slate-500 dark:text-[#475569] hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1e293b]">
                <p className="text-[12px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Admin Chính</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">admin@phonestore.vn</p>
              </div>
              {['Hồ sơ cá nhân', 'Cài đặt', 'Bảo mật'].map((item) => (
                <button
                  key={item}
                  onClick={() => setShowProfile(false)}
                  className="w-full px-4 py-2.5 text-left text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-slate-200 dark:bg-[#1e293b] hover:text-slate-600 dark:text-[#94a3b8] transition-colors"
                >
                  {item}
                </button>
              ))}
              <div className="border-t border-slate-200 dark:border-[#1e293b]">
                <button className="w-full px-4 py-2.5 text-left text-[12px] text-[#f87171] hover:bg-[#ef4444]/10 transition-colors">
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
