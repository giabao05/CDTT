export default function PromotionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-900 text-zinc-900 mb-8 tracking-tight">
        KHUYẾN <span className="text-[#E8002D]">MÃI</span>
      </h1>
      <div className="space-y-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center hover:shadow-md hover:border-zinc-300 transition-all group overflow-hidden relative">
          <div className="w-full md:w-64 h-40 bg-gradient-to-br from-red-500 to-[#E8002D] rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
            <span className="text-white font-900 text-4xl tracking-tighter drop-shadow-md">SALE 50%</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-800 text-zinc-900 mb-2">Đại tiệc công nghệ - Giảm nửa giá</h2>
            <p className="text-zinc-600 mb-4 leading-relaxed">Giảm giá lên đến 50% cho các phụ kiện và 20% cho điện thoại khi thanh toán qua ví điện tử VNPay, Momo. Đặc biệt tặng kèm tai nghe cho 100 khách hàng đầu tiên.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-700 text-[#E8002D] bg-red-50 border border-red-200 rounded-md px-3 py-1.5">Áp dụng đến 30/11</span>
              <button className="text-sm font-600 text-zinc-600 hover:text-[#E8002D] transition-colors underline underline-offset-4">Xem chi tiết</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center hover:shadow-md hover:border-zinc-300 transition-all group overflow-hidden relative">
          <div className="w-full md:w-64 h-40 bg-zinc-900 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border-2 border-dashed border-zinc-700">
            <span className="text-white font-900 text-3xl tracking-tight">PHONE10</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-800 text-zinc-900 mb-2">Giảm thêm 10% đơn từ 5 triệu</h2>
            <p className="text-zinc-600 mb-4 leading-relaxed">Nhập mã PHONE10 tại bước thanh toán để được giảm ngay 10% (tối đa 1 triệu đồng). Áp dụng cho mọi sản phẩm đang được bán tại cửa hàng.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-700 text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-md px-3 py-1.5">Số lượng có hạn</span>
              <button className="text-sm font-600 text-zinc-600 hover:text-[#E8002D] transition-colors underline underline-offset-4">Xem chi tiết</button>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm flex flex-col md:flex-row gap-8 items-center hover:shadow-md hover:border-zinc-300 transition-all group overflow-hidden relative">
          <div className="w-full md:w-64 h-40 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
            <span className="text-white font-900 text-2xl tracking-tight mb-1 drop-shadow-sm">Thu Cũ Đổi Mới</span>
            <span className="text-white/90 font-600 text-sm bg-black/20 px-3 py-1 rounded-full mt-2">Trợ giá 2.000.000đ</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-800 text-zinc-900 mb-2">Lên đời siêu phẩm dễ dàng</h2>
            <p className="text-zinc-600 mb-4 leading-relaxed">Mang điện thoại cũ của bạn đến cửa hàng để được định giá và trợ giá thêm lên tới 2.000.000đ khi lên đời các dòng máy iPhone 15 series và Galaxy S24 series.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs font-700 text-purple-700 bg-purple-50 border border-purple-200 rounded-md px-3 py-1.5">Áp dụng đến hết tháng</span>
              <button className="text-sm font-600 text-zinc-600 hover:text-[#E8002D] transition-colors underline underline-offset-4">Định giá ngay</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
