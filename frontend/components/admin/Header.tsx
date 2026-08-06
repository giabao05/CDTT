'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Sun, Moon, ChevronDown, Store, Settings } from 'lucide-react';
import api from '@/utils/api';

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
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check local storage or default to dark
    const isDark = localStorage.getItem('theme') !== 'light';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

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

  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/ADMIN');
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await api.put(`/notifications/${n.id}/read`);
    }
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full animate-ping" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full" />
              </>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center">
                <p className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Thông báo mới</p>
                <span className="text-[10px] text-[#6366f1] cursor-pointer hover:underline" onClick={markAllAsRead}>Đánh dấu đã đọc</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">Không có thông báo nào</div>
                ) : notifications.map(notif => (
                  <div key={notif.id} onClick={() => !notif.read && handleMarkAsRead(notif.id)} className={`p-3 border-b border-slate-200 dark:border-[#1e293b] hover:bg-slate-200 dark:bg-[#1e293b]/50 cursor-pointer transition-colors ${!notif.read ? 'bg-slate-200 dark:bg-[#1e293b]/20' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-[12px] ${!notif.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{notif.title}</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{new Date(notif.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#94a3b8]">{notif.message}</p>
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
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-[11px] font-bold text-slate-900 dark:text-white uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-[11px] font-semibold text-slate-900 dark:text-[#f1f5f9] leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[9px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">{user?.role === 'ADMIN' ? 'Super Admin' : (user?.role || 'Admin')}</p>
            </div>
            <ChevronDown size={12} className="text-slate-500 dark:text-slate-500 dark:text-[#475569] hidden md:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fadeIn">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-[#1e293b]">
                <p className="text-[12px] font-semibold text-slate-900 dark:text-[#f1f5f9]">{user?.name || 'Admin Chính'}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] truncate">{user?.email || 'admin@phonestore.vn'}</p>
              </div>
              
              <Link href="/admin/profile" onClick={() => setShowProfile(false)} className="block w-full px-4 py-2.5 text-left text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-slate-200 dark:bg-[#1e293b] hover:text-slate-600 dark:text-[#94a3b8] transition-colors">
                Hồ sơ cá nhân
              </Link>
              <Link href="/admin/settings" onClick={() => setShowProfile(false)} className="block w-full px-4 py-2.5 text-left text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-slate-200 dark:bg-[#1e293b] hover:text-slate-600 dark:text-[#94a3b8] transition-colors">
                Cài đặt
              </Link>
              <Link href="/admin/security" onClick={() => setShowProfile(false)} className="block w-full px-4 py-2.5 text-left text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-slate-200 dark:bg-[#1e293b] hover:text-slate-600 dark:text-[#94a3b8] transition-colors">
                Bảo mật
              </Link>

              <div className="border-t border-slate-200 dark:border-[#1e293b]">
                <button onClick={handleLogout} className="w-full px-4 py-2.5 text-left text-[12px] text-[#f87171] hover:bg-[#ef4444]/10 transition-colors">
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
