'use client';
import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getSystemSetting } from '@/lib/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    address: '123 Đường Công Nghệ, Quận 1, TP.HCM',
    hotline: '1900 1234',
    email: 'support@phonestore.com',
    workingHours: '8:00 - 22:00 (Tất cả các ngày trong tuần)'
  });

  useEffect(() => {
    async function loadContactSettings() {
      try {
        const setting = await getSystemSetting('contact_settings');
        if (setting && setting.value) {
          const parsed = JSON.parse(setting.value);
          setContactInfo(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error('Failed to load contact settings', e);
      }
    }
    loadContactSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Gửi liên hệ thành công!');
        setFormData({ name: '', email: '', content: '' });
      } else {
        alert(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-[80vh] flex flex-col justify-center">
      <h1 className="text-4xl font-display font-900 text-[#0A0A0A] mb-12 tracking-tight text-center">
        LIÊN <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0000] to-[#ff6a00]">HỆ</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start max-w-5xl mx-auto w-full">
        <div className="relative">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-400/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl font-display font-900 text-[#0A0A0A] mb-6 relative z-10">Thông tin liên hệ</h2>
          <div className="space-y-6 text-zinc-600 bg-white p-8 md:p-10 border border-zinc-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative z-10">
            <div className="flex flex-col gap-1 pb-6 border-b border-zinc-100">
              <strong className="text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase flex items-center gap-1.5">
                <MapPin size={14} className="text-[#ff0000]" />
                Địa chỉ
              </strong> 
              <span className="text-[15px] font-500">{contactInfo.address}</span>
            </div>
            <div className="flex flex-col gap-1 pb-6 border-b border-zinc-100">
              <strong className="text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase flex items-center gap-1.5">
                <Phone size={14} className="text-[#ff0000]" />
                Điện thoại
              </strong> 
              <span className="text-[15px] font-500 text-[#ff0000]">{contactInfo.hotline}</span>
            </div>
            <div className="flex flex-col gap-1 pb-6 border-b border-zinc-100">
              <strong className="text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase flex items-center gap-1.5">
                <Mail size={14} className="text-[#ff0000]" />
                Email
              </strong> 
              <span className="text-[15px] font-500 hover:text-[#ff0000] transition-colors cursor-pointer">{contactInfo.email}</span>
            </div>
            <div className="flex flex-col gap-1">
              <strong className="text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase flex items-center gap-1.5">
                <Clock size={14} className="text-[#ff0000]" />
                Giờ làm việc
              </strong> 
              <span className="text-[15px] font-500">{contactInfo.workingHours}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 md:p-10 border border-zinc-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <h2 className="text-2xl font-display font-900 text-[#0A0A0A] mb-8">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase mb-2">Họ và tên</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nhập họ và tên của bạn..." 
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-500" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase mb-2">Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Nhập địa chỉ email..." 
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-500" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-display font-800 tracking-widest text-[#0A0A0A] uppercase mb-2">Nội dung</label>
              <textarea 
                rows={4} 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Nhập nội dung cần hỗ trợ..." 
                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none font-500"
              ></textarea>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0A0A0A] text-white px-6 py-4 rounded-xl font-display font-800 tracking-wider shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all mt-4 uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
