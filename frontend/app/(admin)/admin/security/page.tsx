'use client';
import { useState, useEffect } from 'react';
import { Shield, Key, Smartphone, AlertTriangle, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/utils/api';

export default function SecurityPage() {
  const [user, setUser] = useState<any>(null);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {}
    }
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('error', 'Vui lòng điền đầy đủ các trường mật khẩu!');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.put(`/users/${user.id}/password`, { oldPassword, newPassword });
      showToast('success', 'Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Mật khẩu hiện tại không đúng hoặc lỗi hệ thống!';
      showToast('error', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl shadow-black/10 animate-slideInRight ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Bảo mật tài khoản</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Bảo vệ tài khoản quản trị của bạn an toàn hơn</p>
      </div>

      <div className="bg-white dark:bg-[#0d1117]/80 backdrop-blur-xl border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden divide-y divide-slate-200 dark:divide-[#1e293b]">
        
        {/* Password */}
        <div className="p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-[#111827]/30 transition-colors">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20 flex items-center justify-center text-white">
              <Key size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Đổi mật khẩu</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Đổi mật khẩu định kỳ để giữ tài khoản luôn an toàn</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl bg-slate-50 dark:bg-[#111827]/50 p-6 rounded-xl border border-slate-200 dark:border-[#1e293b]">
            <div className="md:col-span-2 group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-rose-500 transition-colors">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
              />
            </div>
            
            <div className="group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-rose-500 transition-colors">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
              />
            </div>

            <div className="group">
              <label className="block text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-rose-500 transition-colors">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
              />
            </div>
          </div>
          <button 
            onClick={handlePasswordChange}
            disabled={isSubmitting}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-slate-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>

        {/* 2FA */}
        <div className="p-6 sm:p-8 hover:bg-slate-50/50 dark:hover:bg-[#111827]/30 transition-colors">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-[#6366f1]/20 flex items-center justify-center text-white">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Xác thực 2 bước (2FA)</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Bảo vệ tăng cường bằng điện thoại</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl relative overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-orange-800 dark:text-orange-400">Chưa bật xác thực 2 bước</p>
              <p className="text-sm text-orange-600 dark:text-orange-400/80 mt-1 mb-0 max-w-xl">Tài khoản của bạn dễ gặp rủi ro nếu lộ mật khẩu. Bật 2FA để thêm một lớp bảo mật cực kỳ an toàn.</p>
            </div>
            <button className="whitespace-nowrap px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 group-hover:-translate-y-0.5">
              Bật 2FA ngay
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
