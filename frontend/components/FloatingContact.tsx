'use client';
import { Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSystemSetting } from '@/lib/api';

export default function FloatingContact() {
  const [contactInfo, setContactInfo] = useState({
    hotline: '1900 1234'
  });

  useEffect(() => {
    async function loadContactSettings() {
      try {
        const setting = await getSystemSetting('contact_settings');
        if (setting && setting.value) {
          const parsed = JSON.parse(setting.value);
          if (parsed.hotline) {
            setContactInfo(prev => ({ ...prev, hotline: parsed.hotline }));
          }
        }
      } catch (e) {
        // ignore
      }
    }
    loadContactSettings();
  }, []);

  // Format hotline for href (remove spaces)
  const phoneHref = contactInfo.hotline.replace(/\s+/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Messenger Button */}
      <Link href="https://m.me/" target="_blank" className="relative group flex items-center justify-center">
        <div className="absolute right-full mr-4 bg-black/80 text-white text-[13px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none">
          Chat Messenger
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
        </div>
        <div className="w-[50px] h-[50px] bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 text-white">
          <MessageCircle size={26} fill="white" />
        </div>
      </Link>

      {/* Zalo Button */}
      <Link href="https://zalo.me/" target="_blank" className="relative group flex items-center justify-center">
        <div className="absolute right-full mr-4 bg-black/80 text-white text-[13px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none">
          Chat Zalo
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
        </div>
        <div className="w-[50px] h-[50px] bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
          <span className="text-white font-bold text-sm tracking-wider">Zalo</span>
        </div>
      </Link>

      {/* Hotline Button with Pulse Effect */}
      <Link href={`tel:${phoneHref}`} className="relative group mt-2 flex items-center justify-center">
        <div className="absolute right-full mr-4 bg-[#E8002D] text-white text-[14px] font-bold px-4 py-2 rounded-lg whitespace-nowrap opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none shadow-lg">
          Gọi ngay: {contactInfo.hotline}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#E8002D] rotate-45"></div>
        </div>
        
        <div className="absolute inset-0 bg-[#E8002D] rounded-full animate-ping opacity-60"></div>
        <div className="relative w-14 h-14 bg-[#E8002D] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(232,0,45,0.5)] hover:scale-110 transition-transform duration-300 border-[3px] border-white">
          <Phone className="text-white animate-[wiggle_1s_ease-in-out_infinite]" size={24} fill="currentColor" />
        </div>
      </Link>
    </div>
  );
}
