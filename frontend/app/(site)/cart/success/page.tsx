'use client';
import { CheckCircle, Package, Phone, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode') || 'Unknown';
  
  const { width, height } = useWindowSize();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <>
      {isClient && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          numberOfPieces={2000}
          gravity={0.4}
          initialVelocityX={20}
          initialVelocityY={60}
          tweenDuration={300}
          confettiSource={{ x: width / 2, y: height / 2 + 100, w: 0, h: 0 }}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}
    <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-8 relative">
          {/* Ambient glow behind icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-green-400/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full border-[6px] border-white shadow-[0_15px_35px_rgba(34,197,94,0.15)] flex items-center justify-center">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-[#ff0000] to-[#ff6a00] rounded-full flex items-center justify-center shadow-md animate-bounce">
              <span className="text-white text-xs font-display font-900">✓</span>
            </div>
          </div>
        </div>

        <h1 className="font-display font-900 text-3xl text-[#0A0A0A] tracking-tight mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-zinc-500 font-body text-sm mb-6">
          Cảm ơn bạn đã mua hàng tại Phone Store. Đơn hàng của bạn đang được xử lý.
        </p>

        {/* Order code */}
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-zinc-100 p-6 mb-8 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-bl from-zinc-50 to-transparent rounded-full pointer-events-none" />
          <p className="text-[11px] font-display font-800 tracking-widest uppercase text-zinc-400 mb-2">
            Mã đơn hàng của bạn
          </p>
          <p className="font-mono-data font-800 text-2xl text-[#0A0A0A] tracking-widest">
            #{orderCode}
          </p>
        </div>

        {/* Next steps */}
        <div className="space-y-4 mb-10 text-left">
          {[
            { icon: Package, step: '1', title: 'Xác nhận đơn hàng', desc: 'Chúng tôi sẽ gọi điện xác nhận trong vòng 30 phút' },
            { icon: Phone, step: '2', title: 'Chuẩn bị hàng', desc: 'Đơn hàng được đóng gói cẩn thận và bàn giao đơn vị vận chuyển' },
            { icon: ArrowRight, step: '3', title: 'Giao hàng', desc: 'Nhận hàng trong 2–24 giờ tùy khu vực' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex items-center gap-4 bg-white rounded-[1.5rem] border border-zinc-100 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-zinc-100">
                <Icon size={20} className="text-[#0A0A0A]" />
              </div>
              <div>
                <p className="font-display font-800 text-sm text-[#0A0A0A]">{title}</p>
                <p className="text-[13px] text-zinc-500 font-body mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/')}
            className="group relative flex-1 py-4 rounded-[1.2rem] bg-gradient-to-r from-[#ff0000] to-[#ff6a00] text-white font-display font-800 text-xs tracking-widest uppercase shadow-[0_10px_25px_rgba(255,8,68,0.3)] overflow-hidden transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            {/* Glow layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff0844] via-[#ff9900] to-[#ff0844] bg-[length:200%_auto] opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-[gradient-shift_1.5s_linear_infinite]" />
            <span className="relative z-10">Về trang chủ</span>
          </button>
          <button
            onClick={() => router.push('/product')}
            className="flex-1 py-4 rounded-[1.2rem] border-2 border-zinc-200 bg-white text-[#0A0A0A] font-display font-800 text-xs tracking-widest uppercase hover:border-[#0A0A0A] transition-all duration-300 hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)]"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F7] py-12 text-center font-display font-600 text-zinc-500">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
