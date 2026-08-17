'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, Sun, Moon, ChevronDown, Store, Settings, Package, ShoppingCart, Tag, AlertTriangle, Shield, Info, Clock, CheckCheck, UserPlus, Star, MessageSquare } from 'lucide-react';
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
    
    // Load user from localStorage then sync from backend
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        // Sync fresh data from backend (avatar, etc.)
        if (parsed?.id && token) {
          fetch(`http://localhost:8080/api/v1/users/${parsed.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => {
            if (res.ok) return res.json();
          }).then(freshUser => {
            if (freshUser) {
              const updated = { ...parsed, ...freshUser };
              setUser(updated);
              localStorage.setItem('user', JSON.stringify(updated));
            }
          }).catch(() => {});
        }
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

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }
    setShowNotifications(false);
    
    const titleLower = notif.title.toLowerCase();
    if (titleLower.includes('đơn hàng')) {
      router.push('/admin/orders');
    } else if (titleLower.includes('khách hàng')) {
      router.push('/admin/customers');
    } else if (titleLower.includes('đánh giá')) {
      router.push('/admin/products');
    } else if (titleLower.includes('khuyến mãi') || titleLower.includes('giảm giá')) {
      router.push('/admin/vouchers');
    } else if (titleLower.includes('liên hệ')) {
      router.push('/admin/contacts');
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
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border border-slate-200/50 dark:border-[#1e293b]/50 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-fadeIn transform origin-top-right transition-all">
              <div className="px-4 py-4 border-b border-slate-100 dark:border-[#1e293b] flex justify-between items-center bg-white/50 dark:bg-[#111827]/50 relative z-10">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-[#6366f1]" />
                  <p className="text-[14px] font-bold text-slate-900 dark:text-[#f1f5f9]">Thông báo mới</p>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#6366f1] font-semibold hover:text-[#4f46e5] transition-colors flex items-center gap-1 bg-[#6366f1]/10 px-2 py-1 rounded-md"
                    >
                      <CheckCheck size={14} /> Đánh dấu đã đọc
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-3">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-[#1e293b] rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-inner">
                      <Bell size={24} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <span className="text-sm font-medium">Không có thông báo nào.</span>
                  </div>
                ) : notifications.map(notif => {
                  let Icon = Info;
                  let iconColor = 'text-blue-500 dark:text-blue-400';
                  let iconBg = 'bg-blue-50 dark:bg-blue-500/10';
                  let iconBorder = 'border-blue-100 dark:border-blue-500/20';
                  
                  const titleLower = notif.title.toLowerCase();
                  if (titleLower.includes('đơn hàng')) {
                    Icon = Package; iconColor = 'text-green-600 dark:text-green-400'; iconBg = 'bg-green-50 dark:bg-green-500/10'; iconBorder = 'border-green-100 dark:border-green-500/20';
                  } else if (titleLower.includes('khách hàng')) {
                    Icon = UserPlus; iconColor = 'text-indigo-600 dark:text-indigo-400'; iconBg = 'bg-indigo-50 dark:bg-indigo-500/10'; iconBorder = 'border-indigo-100 dark:border-indigo-500/20';
                  } else if (titleLower.includes('đánh giá')) {
                    Icon = Star; iconColor = 'text-yellow-500 dark:text-yellow-400'; iconBg = 'bg-yellow-50 dark:bg-yellow-500/10'; iconBorder = 'border-yellow-100 dark:border-yellow-500/20';
                  } else if (titleLower.includes('liên hệ')) {
                    Icon = MessageSquare; iconColor = 'text-cyan-500 dark:text-cyan-400'; iconBg = 'bg-cyan-50 dark:bg-cyan-500/10'; iconBorder = 'border-cyan-100 dark:border-cyan-500/20';
                  } else if (titleLower.includes('giỏ hàng')) {
                    Icon = ShoppingCart; iconColor = 'text-[#E8002D] dark:text-[#ff4444]'; iconBg = 'bg-[#E8002D]/10 dark:bg-[#ff4444]/10'; iconBorder = 'border-[#E8002D]/20 dark:border-[#ff4444]/20';
                  } else if (titleLower.includes('khuyến mãi') || titleLower.includes('giảm giá')) {
                    Icon = Tag; iconColor = 'text-orange-500 dark:text-orange-400'; iconBg = 'bg-orange-50 dark:bg-orange-500/10'; iconBorder = 'border-orange-100 dark:border-orange-500/20';
                  } else if (titleLower.includes('cảnh báo')) {
                    Icon = AlertTriangle; iconColor = 'text-red-500 dark:text-red-400'; iconBg = 'bg-red-50 dark:bg-red-500/10'; iconBorder = 'border-red-100 dark:border-red-500/20';
                  } else if (titleLower.includes('bảo mật') || titleLower.includes('mật khẩu')) {
                    Icon = Shield; iconColor = 'text-purple-500 dark:text-purple-400'; iconBg = 'bg-purple-50 dark:bg-purple-500/10'; iconBorder = 'border-purple-100 dark:border-purple-500/20';
                  }

                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotificationClick(notif)} 
                      className={`p-4 border-b border-slate-100/50 dark:border-[#1e293b]/50 cursor-pointer transition-all duration-300 hover:bg-slate-50 dark:hover:bg-[#1e293b]/50 flex gap-3 relative overflow-hidden ${!notif.read ? 'bg-[#6366f1]/5 dark:bg-[#6366f1]/10' : 'bg-transparent opacity-70 hover:opacity-100'}`}
                    >
                      {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6366f1]" />}
                      
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border ${iconBg} ${iconColor} ${iconBorder} shadow-sm`}>
                        <Icon size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className={`text-[13px] leading-tight truncate ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                            {notif.title}
                          </h4>
                        </div>
                        <p className="text-[12px] text-slate-500 dark:text-[#94a3b8] leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        {notif.createdAt && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                            <Clock size={10} />
                            <span>{new Date(notif.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-4 py-3 border-t border-slate-100 dark:border-[#1e293b] text-center bg-slate-50 dark:bg-[#111827]">
                <Link href="/admin/orders" className="text-[12px] font-medium text-[#6366f1] hover:text-[#4f46e5] hover:underline transition-colors" onClick={() => setShowNotifications(false)}>
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
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-[11px] font-bold text-white uppercase overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'A'
              )}
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
