'use client';

import { useEffect, useState } from 'react';
import { fetchVouchers } from '../../../lib/api';

export default function PromotionsPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVouchers().then((data) => {
      // Filter active vouchers or just display all
      setVouchers(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-900 text-zinc-900 mb-8 tracking-tight">
        KHUYẾN <span className="text-[#E8002D]">MÃI</span>
      </h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#E8002D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vouchers.length === 0 ? (
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
              <div key={voucher.id || index} className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center hover:shadow-md hover:border-zinc-300 transition-all group overflow-hidden relative">
                <div className={`w-full md:w-64 h-40 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner`}>
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                  <span className="text-white font-900 text-3xl tracking-tighter drop-shadow-md px-4 text-center">
                    {voucher.code}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-800 text-zinc-900 mb-2">Giảm {voucher.discountPercent}% cho đơn hàng</h2>
                  <p className="text-zinc-600 mb-4 leading-relaxed">
                    Sử dụng mã <strong>{voucher.code}</strong> tại bước thanh toán để nhận ngay ưu đãi giảm {voucher.discountPercent}% trên tổng giá trị đơn hàng. 
                    {voucher.maxUsage ? ` Số lượng giới hạn: ${voucher.maxUsage} lượt sử dụng.` : ''}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-700 text-[#E8002D] bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
                      {formatDate(voucher.expiresAt)}
                    </span>
                    <button className="text-sm font-600 text-zinc-600 hover:text-[#E8002D] transition-colors underline underline-offset-4">
                      Sao chép mã
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
