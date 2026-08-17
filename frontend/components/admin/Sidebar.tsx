'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Smartphone,
  ShoppingCart,
  Users,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
  Bell,
  Package,
  Image,
  FileText,
  MessageSquare,
  ListTree,
  Award,
  Settings,
  BarChart,
  ShieldCheck,
  Shield,
  CreditCard,
  Repeat,
  Mail
} from 'lucide-react';

const navItems = [
  { path: '/admin', label: 'Tổng quan', icon: LayoutDashboard },
  { path: '/admin/analytics', label: 'Báo cáo', icon: BarChart },
  { path: '/admin/products', label: 'Sản phẩm', icon: Smartphone },
  { path: '/admin/categories', label: 'Danh mục', icon: ListTree },
  { path: '/admin/brands', label: 'Thương hiệu', icon: Award },
  { path: '/admin/inventory', label: 'Kho hàng', icon: Package },
  { path: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { path: '/admin/warranty', label: 'Bảo hành (IMEI)', icon: ShieldCheck },
  { path: '/admin/customers', label: 'Khách hàng & Quyền', icon: Users },
  { path: '/admin/vouchers', label: 'Khuyến mãi', icon: Tag },
  { path: '/admin/banners', label: 'Banners', icon: Image },
  { path: '/admin/news', label: 'Tin tức', icon: FileText },
  { path: '/admin/reviews', label: 'Đánh giá', icon: MessageSquare },
  { path: '/admin/contacts', label: 'Liên hệ', icon: Mail },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {}
      }
    };
    
    loadUser();
    
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside
      style={{ width: collapsed ? 64 : 224 }}
      className="relative flex flex-col h-screen bg-slate-50 dark:bg-[#0d1117] border-r border-slate-200 dark:border-[#1e293b] transition-all duration-300 ease-in-out flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200 dark:border-[#1e293b]">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
          <Zap size={16} className="text-slate-900 dark:text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-[#f1f5f9] leading-none">PhoneStore</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5 font-mono tracking-wider">ADMIN</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {!collapsed && (
          <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-widest px-2 mb-3">
            Menu
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map(({ path, label, icon: Icon, badge }) => {
            const active = pathname === path;
            return (
              <li key={path}>
                <Link
                  href={path}
                  title={collapsed ? label : undefined}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative
                    ${active
                      ? 'bg-[#6366f1]/15 text-[#818cf8]'
                      : 'text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-slate-200 dark:bg-[#1e293b]/60 hover:text-slate-600 dark:text-[#94a3b8]'
                    }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#6366f1] rounded-r-full" />
                  )}
                  <div className="relative flex-shrink-0">
                    <Icon size={16} />
                    {badge && !active && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ef4444] rounded-full text-[8px] font-bold text-slate-900 dark:text-white flex items-center justify-center">
                        {badge}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="flex-1 text-left text-[13px]">{label}</span>
                  )}
                  {!collapsed && badge && (
                    <span className="ml-auto bg-[#ef4444]/15 text-[#f87171] text-[10px] font-mono px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {!collapsed && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1e293b]">
            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-widest px-2 mb-3">
              Hệ thống
            </p>
            <Link href="/admin/notifications" className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${pathname === '/admin/notifications' ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-slate-200 dark:bg-[#1e293b]/60 hover:text-slate-600 dark:text-[#94a3b8]'}`}>
              <Bell size={16} />
              <span>Thông báo</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Admin info */}
      <div className={`border-t border-slate-200 dark:border-[#1e293b] p-3 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white uppercase overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || 'A')}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 mb-3">
            <Link href="/admin/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white flex-shrink-0 uppercase overflow-hidden hover:ring-2 hover:ring-[#6366f1] transition-all">
              {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : (user?.name?.charAt(0) || 'A')}
            </Link>
            <div className="overflow-hidden">
              <p className="text-[12px] font-semibold text-slate-900 dark:text-[#f1f5f9] truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#475569] truncate">{user?.email || 'admin'}</p>
            </div>
          </div>
        )}
        {!collapsed && (
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:bg-[#ef4444]/10 hover:text-[#f87171] transition-colors">
            <LogOut size={13} />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-200 dark:bg-[#1e293b] border border-slate-300 dark:border-[#334155] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:text-slate-600 dark:text-[#94a3b8] hover:bg-[#334155] transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
