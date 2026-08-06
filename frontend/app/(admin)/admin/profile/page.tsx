'use client';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Save, Camera, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{show: boolean; type: 'success' | 'error'; message: string}>({ show: false, type: 'success', message: '' });

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setUser(u);
        setName(u.name || '');
        setPhone(u.phone || '');
        // Sync fresh data from backend
        if (u?.id && token) {
          fetch(`http://localhost:8080/api/v1/users/${u.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).then(res => res.ok ? res.json() : null)
            .then(fresh => {
              if (fresh) {
                const updated = { ...u, ...fresh };
                setUser(updated);
                setName(updated.name || '');
                setPhone(updated.phone || '');
                localStorage.setItem('user', JSON.stringify(updated));
              }
            }).catch(() => {});
        }
      } catch (e) {}
    }
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const token = localStorage.getItem('token');
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('http://localhost:8080/api/v1/upload', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { url } = await uploadRes.json();
      if (url) {
        const updateRes = await fetch(`http://localhost:8080/api/v1/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ avatar: url }),
        });
        if (updateRes.ok) {
          const updated = { ...user, avatar: url };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
          showToast('success', 'Cập nhật ảnh đại diện thành công!');
        }
      }
    } catch (err) {
      showToast('error', 'Upload ảnh thất bại!');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: 'success', message: '' }), 3000);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const res = await api.put(`/users/${user.id}`, { name, phone });
      const updatedUser = { ...user, ...res.data };
      
      // Update local storage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Trigger event or refresh so Header updates
      window.dispatchEvent(new Event('storage'));
      
      showToast('success', 'Đã cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error(error);
      showToast('error', 'Cập nhật thất bại. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto min-h-[calc(100vh-80px)]">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-8 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl shadow-black/10 animate-slideInRight ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400">Hồ sơ cá nhân</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Quản lý và cập nhật thông tin tài khoản của bạn</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d1117]/80 backdrop-blur-xl border border-slate-200 dark:border-[#1e293b]/80 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden relative">
        
        {/* Cover & Avatar */}
        <div className="h-40 bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#d946ef] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-16 left-6 sm:left-10 z-10">
              <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-[#0d1117] bg-white dark:bg-[#111827] flex items-center justify-center text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] uppercase shadow-lg shadow-black/10 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user?.name || 'Avatar'} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'A'
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                {isUploadingAvatar ? (
                  <Loader2 size={24} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-24 pb-8 px-6 sm:px-10">
          
          <div className="flex justify-between items-start flex-col sm:flex-row gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {user?.name || 'Đang tải...'}
                {user?.role === 'ADMIN' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] uppercase font-bold tracking-wider border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Name Input */}
              <div className="group">
                <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-[#6366f1]">Họ và tên</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 transition-all shadow-sm"
                    placeholder="Nhập họ và tên..."
                  />
                </div>
              </div>
              
              {/* Phone Input */}
              <div className="group">
                <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-[#6366f1]">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366f1] transition-colors">
                    <Phone size={18} />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#111827]/50 border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 transition-all shadow-sm"
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Email (Disabled) */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2">Email (Đăng nhập)</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-[#1e293b]/30 border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> Email không thể thay đổi
                </p>
              </div>

              {/* Role (Disabled) */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 dark:text-slate-300 mb-2">Vai trò hệ thống</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6366f1]/70">
                    <Shield size={18} />
                  </div>
                  <input
                    type="text"
                    value={user?.role === 'ADMIN' ? 'Super Admin' : user?.role || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-[#1e293b]/30 border border-slate-200 dark:border-[#1e293b] rounded-xl text-sm text-[#6366f1] font-semibold cursor-not-allowed shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-[#1e293b] flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-[#6366f1]/30 hover:shadow-[#6366f1]/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
