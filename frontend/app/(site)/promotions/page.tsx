'use client';

import { useEffect, useState } from 'react';
import { fetchVouchers } from '../../../lib/api';
import LoadingScreen from '@/components/LoadingScreen';

export default function PromotionsPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers().then((data) => {
      // Filter active vouchers or just display all
      setVouchers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-900 text-zinc-900 mb-8 tracking-tight">
        KHUYẾN <span className="text-[#E8002D]">MÃI</span>
      </h1>
      
      {vouchers.length === 0 ? (
        <div className="text-center py-20 text-zinc-500 bg-white rounded-xl border border-zinc-200">
          Hiện tại chưa có chương trình khuyến mãi nào.
        </div>
      ) : (
        <div className="space-y-6">
          {vouchers.map((voucher, index) => {
            // Generate some random gradient colors based on index to make them look distinct
            const gradients = [
              "from-red-500 to-[#E8002D]",
              "from-zinc-800 to-black",
              "from-purple-600 to-blue-600",
              "from-orange-400 to-orange-600",
              "from-emerald-500 to-teal-700"
            ];
            const gradient = gradients[index % gradients.length];
            
            const formatDate = (dateString: string) => {
              if (!dateString) return "Không thời hạn";
              const date = new Date(dateString);
              if (isNaN(date.getTime())) return "Không thời hạn";
              return `Áp dụng đến ${date.toLocaleDateString('vi-VN')}`;
            };
            
            return (
              <div key={voucher.id || index} className="bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-8 items-center hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-300 group overflow-hidden relative">
                <div className={`w-full md:w-72 h-48 bg-gradient-to-br ${gradient} rounded-[1.5rem] flex flex-col items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform duration-500`}>
                  {/* Decorative shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-y-[100%] group-hover:-translate-y-[100%] transition-transform duration-1000" />
                  <span className="text-white/80 text-xs font-display font-800 tracking-widest uppercase mb-2">Mã Giảm Giá</span>
                  <span className="text-white font-900 text-4xl tracking-tight drop-shadow-md px-4 text-center">
                    {voucher.code}
                  </span>
                </div>
                <div className="flex-1 py-2">
                  <h2 className="text-[28px] font-display font-900 text-[#0A0A0A] mb-3 leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-orange-500 transition-all">
                    Giảm {voucher.discountPercent}% cho đơn hàng
                  </h2>
                  <p className="text-zinc-500 mb-6 leading-relaxed font-body text-[15px]">
                    Sử dụng mã <strong>{voucher.code}</strong> tại bước thanh toán để nhận ngay ưu đãi giảm {voucher.discountPercent}% trên tổng giá trị đơn hàng. 
                    {voucher.maxUsage ? ` Số lượng giới hạn: ${voucher.maxUsage} lượt sử dụng.` : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-[11px] font-display font-800 tracking-wider text-[#ff0000] bg-red-50 rounded-full px-4 py-2 border border-red-100 uppercase">
                      {formatDate(voucher.expiresAt)}
                    </span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(voucher.code);
                        setCopiedCode(voucher.code);
                        setTimeout(() => setCopiedCode(null), 2000);
                      }}
                      className={`text-xs font-display font-800 tracking-wider transition-colors uppercase px-4 py-2 rounded-full border ${
                        copiedCode === voucher.code
                          ? 'bg-green-50 text-green-600 border-green-200'
                          : 'text-zinc-600 hover:text-[#0A0A0A] bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                      }`}
                    >
                      {copiedCode === voucher.code ? 'Đã sao chép!' : 'Sao chép mã'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
