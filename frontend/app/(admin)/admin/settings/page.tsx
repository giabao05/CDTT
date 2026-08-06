'use client';
import { useState, useEffect } from 'react';
import { Bell, Monitor, Save, Loader2, CheckCircle2, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [theme, setTheme] = useState<'light'|'dark'|'system'>('dark');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    // Load current theme
    const current = localStorage.getItem('theme') || 'dark';
    if (current === 'light') setTheme('light');
    else if (current === 'system') setTheme('system');
    else setTheme('dark');

    // Load notification prefs
    const notifs = localStorage.getItem('pushNotifs');
    if (notifs) setNotifications(notifs === 'true');
    const emails = localStorage.getItem('emailNotifs');
    if (emails) setEmailAlerts(emails === 'true');
  }, []);

  const changeTheme = (newTheme: 'light'|'dark'|'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Update Header too (simulated via storage event if Header was listening, but we just set HTML classes here)
  };

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      localStorage.setItem('pushNotifs', String(notifications));
      localStorage.setItem('emailNotifs', String(emailAlerts));
      setIsSubmitting(false);
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    }, 800);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl shadow-black/10 animate-slideInRight bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">Đã lưu cài đặt thành công!</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Cài đặt hệ thống</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tùy chỉnh giao diện và các tính năng thông báo của bạn</p>
      </div>

      <div className="bg-white dark:bg-[#0d1117]/80 backdrop-blur-xl border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden divide-y divide-slate-200 dark:divide-[#1e293b]">
        
        {/* Theme Settings */}
        <div className="p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-[#111827]/30 transition-colors">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Ngôn ngữ & Khu vực</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tùy chỉnh ngôn ngữ và định dạng hiển thị hệ thống</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl bg-slate-50 dark:bg-[#111827]/50 p-6 rounded-xl border border-slate-200 dark:border-[#1e293b]">
            <div className="group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-500 transition-colors">Ngôn ngữ hệ thống</label>
              <select className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer appearance-none">
                <option value="vi">Tiếng Việt (Vietnamese)</option>
                <option value="en">Tiếng Anh (English)</option>
              </select>
            </div>
            
            <div className="group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-500 transition-colors">Múi giờ</label>
              <select className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer appearance-none">
                <option value="asia-ho-chi-minh">(GMT+07:00) Giờ Đông Dương - Hồ Chí Minh</option>
                <option value="asia-tokyo">(GMT+09:00) Giờ chuẩn Nhật Bản - Tokyo</option>
                <option value="utc">(GMT+00:00) Giờ phối hợp quốc tế (UTC)</option>
              </select>
            </div>

            <div className="group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-500 transition-colors">Định dạng tiền tệ</label>
              <select className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer appearance-none">
                <option value="vnd">Việt Nam Đồng (VNĐ)</option>
                <option value="usd">Đô la Mỹ (USD)</option>
              </select>
            </div>
            
            <div className="group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-indigo-500 transition-colors">Định dạng ngày tháng</label>
              <select className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm cursor-pointer appearance-none">
                <option value="dd-mm-yyyy">DD/MM/YYYY (31/12/2023)</option>
                <option value="mm-dd-yyyy">MM/DD/YYYY (12/31/2023)</option>
                <option value="yyyy-mm-dd">YYYY-MM-DD (2023-12-31)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Settings */}
        <div className="p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-[#111827]/30 transition-colors">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Cấu hình thông báo</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thiết lập các kênh nhận cảnh báo từ hệ thống</p>
            </div>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between p-5 bg-white dark:bg-[#111827]/50 rounded-xl border border-slate-200 dark:border-[#1e293b] shadow-sm hover:border-[#6366f1]/50 transition-colors">
              <div>
                <p className="text-[15px] font-bold text-slate-900 dark:text-white">Thông báo đẩy (Push Notifications)</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Nhận thông báo đơn hàng mới, sự cố bảo hành ngay khi đang mở web mà không cần tải lại trang.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-5 bg-white dark:bg-[#111827]/50 rounded-xl border border-slate-200 dark:border-[#1e293b] shadow-sm hover:border-[#6366f1]/50 transition-colors">
              <div>
                <p className="text-[15px] font-bold text-slate-900 dark:text-white">Email cập nhật & Báo cáo</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Nhận email định kỳ về báo cáo doanh thu, đánh giá xấu từ khách hàng hoặc khi có lỗi hệ thống nghiêm trọng.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} />
                <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end pt-8 border-t border-slate-200 dark:border-[#1e293b]">
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
