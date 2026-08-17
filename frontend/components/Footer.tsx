'use client';
import Link from 'next/link';
import { Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSystemSetting } from '@/lib/api';

export default function Footer() {
  const [activeFooter, setActiveFooter] = useState<any>(null);

  useEffect(() => {
    async function loadFooter() {
      try {
        const footerSetting = await getSystemSetting('footer_settings');
        if (footerSetting && footerSetting.value) {
          setActiveFooter(JSON.parse(footerSetting.value));
        }
      } catch (e) {
        console.error('Failed to load footer settings', e);
      }
    }
    loadFooter();
  }, []);

  if (!activeFooter) {
    return (
      <footer className="bg-[#050505] pt-16 pb-8 border-t border-zinc-900 mt-auto">
        {/* Placeholder while loading */}
      </footer>
    );
  }

  return (
    <footer className="relative bg-[#050505] mt-auto overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8002D]/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="space-y-6 col-span-2">
            <Link href="/" className="flex items-center gap-3 group/logo inline-flex">
              <div className="relative w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden border border-[#ff4444]/30 shadow-[0_0_15px_rgba(232,0,45,0.4)] group-hover/logo:shadow-[0_0_25px_rgba(232,0,45,0.6)] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff0033] to-[#990000]"></div>
                <Smartphone size={20} className="text-white relative z-10 transform group-hover/logo:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-display font-900 text-white text-2xl tracking-tight drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {activeFooter.companyName?.split(' ').map((word: string, i: number) => 
                  i === 0 ? <span key={i}>{word} </span> : <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4444] to-[#ff0000]">{word} </span>
                )}
              </span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed font-body max-w-sm">
              {activeFooter.description}
            </p>
          </div>

          {activeFooter.columns?.map((col: any, idx: number) => (
            <div key={idx} className="space-y-5">
              <h3 className="text-white font-display font-700 tracking-wider text-sm uppercase relative inline-block">
                {col.title}
                <span className="absolute -bottom-2 left-0 w-6 h-[2px] bg-[#E8002D]"></span>
              </h3>
              <ul className="space-y-3 pt-2">
                {col.links?.split(',').map((link: string, lIdx: number) => (
                  <li key={lIdx}>
                    <Link 
                      href="#" 
                      className="text-zinc-400 text-sm hover:text-white transition-all duration-300 flex items-center gap-2 group/link"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E8002D]/0 group-hover/link:bg-[#E8002D] transition-colors duration-300"></span>
                      <span className="transform group-hover/link:translate-x-1 transition-transform duration-300">
                        {link.trim()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-800/50 mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-xs font-mono-data">
            {activeFooter.copyright}
          </p>
          <div className="flex gap-4">
             <p className="text-zinc-500 text-xs font-mono-data">
               {activeFooter.license}
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
