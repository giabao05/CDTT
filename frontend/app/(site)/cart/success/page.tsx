'use client';
import { CheckCircle, Package, Phone, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderCode = searchParams.get('orderCode') || 'Unknown';
  return (
    <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 border-4 border-green-200 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#E8002D] flex items-center justify-center">
              <span className="text-white text-[10px] font-display font-800">✓</span>
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
        <div className="bg-white border border-zinc-200 p-4 mb-6">
          <p className="text-xs font-display font-600 tracking-widest uppercase text-zinc-400 mb-1.5">
            Mã đơn hàng
          </p>
          <p className="font-mono-data font-700 text-xl text-[#0A0A0A] tracking-widest">
            #{orderCode}
          </p>
        </div>

        {/* Next steps */}
        <div className="space-y-3 mb-8 text-left">
          {[
            { icon: Package, step: '1', title: 'Xác nhận đơn hàng', desc: 'Chúng tôi sẽ gọi điện xác nhận trong vòng 30 phút' },
            { icon: Phone, step: '2', title: 'Chuẩn bị hàng', desc: 'Đơn hàng được đóng gói cẩn thận và bàn giao đơn vị vận chuyển' },
            { icon: ArrowRight, step: '3', title: 'Giao hàng', desc: 'Nhận hàng trong 2–24 giờ tùy khu vực' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex items-start gap-3 bg-white border border-zinc-200 p-4">
              <div className="w-8 h-8 bg-[#0A0A0A] flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-white" />
              </div>
              <div>
                <p className="font-display font-700 text-sm text-[#0A0A0A]">{title}</p>
                <p className="text-xs text-zinc-500 font-body mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3.5 bg-[#E8002D] text-white font-display font-700 text-xs tracking-widest uppercase hover:bg-red-700 transition-colors"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => router.push('/product')}
            className="flex-1 py-3.5 border border-[#0A0A0A] text-[#0A0A0A] font-display font-700 text-xs tracking-widest uppercase hover:bg-[#0A0A0A] hover:text-white transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F7] py-12 text-center font-display font-600 text-zinc-500">Đang tải...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
