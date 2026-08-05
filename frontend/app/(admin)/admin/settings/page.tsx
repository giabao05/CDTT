'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Save, Building2, Phone, Mail, Link as LinkIcon, CreditCard } from 'lucide-react';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    shop_name: 'PhoneStore',
    shop_address: '',
    hotline: '',
    email: '',
    facebook_url: '',
    bank_name: '',
    bank_account: '',
    bank_owner: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/systemsettings');
      const data: SystemSetting[] = res.data;
      
      const newSettings = { ...settings };
      data.forEach(item => {
        newSettings[item.key] = item.value;
      });
      setSettings(newSettings);
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // For each key in settings state, send a PUT to /systemsettings/{key}
      const promises = Object.entries(settings).map(([key, value]) => {
        return api.put(`/systemsettings/${key}`, {
          key,
          value,
          description: `Cấu hình ${key}`
        });
      });
      
      await Promise.all(promises);
      alert('Đã lưu cấu hình thành công!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Có lỗi xảy ra khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-600 dark:text-slate-400">Đang tải cấu hình...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Cấu hình Hệ thống</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Quản lý thông tin cửa hàng, liên hệ, mạng xã hội, thanh toán</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thông tin Cửa hàng */}
        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Building2 size={20} className="text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Thông tin Cửa hàng</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Cửa Hàng</label>
              <input
                type="text"
                value={settings.shop_name}
                onChange={e => handleChange('shop_name', e.target.value)}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Địa chỉ</label>
              <textarea
                value={settings.shop_address}
                onChange={e => handleChange('shop_address', e.target.value)}
                rows={3}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Liên hệ & Mạng xã hội */}
        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Phone size={20} className="text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Liên hệ & Mạng xã hội</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Phone size={14} className="text-slate-600 dark:text-slate-400" /> Hotline
              </label>
              <input
                type="text"
                value={settings.hotline}
                onChange={e => handleChange('hotline', e.target.value)}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <Mail size={14} className="text-slate-600 dark:text-slate-400" /> Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={e => handleChange('email', e.target.value)}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                <LinkIcon size={14} className="text-slate-600 dark:text-slate-400" /> Facebook Fanpage URL
              </label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={e => handleChange('facebook_url', e.target.value)}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Thanh toán & Chuyển khoản */}
        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CreditCard size={20} className="text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Thanh toán & Chuyển khoản Ngân hàng</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Ngân Hàng</label>
              <input
                type="text"
                value={settings.bank_name}
                onChange={e => handleChange('bank_name', e.target.value)}
                placeholder="VD: Vietcombank"
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số Tài Khoản</label>
              <input
                type="text"
                value={settings.bank_account}
                onChange={e => handleChange('bank_account', e.target.value)}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 font-mono text-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Chủ Tài Khoản</label>
              <input
                type="text"
                value={settings.bank_owner}
                onChange={e => handleChange('bank_owner', e.target.value)}
                className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 uppercase"
              />
            </div>
          </div>
          <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-500">Thông tin này sẽ được hiển thị khi khách hàng chọn phương thức "Chuyển khoản ngân hàng" lúc đặt hàng. Mã QR Code sẽ tự động được sinh ra dựa trên thông tin này.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
