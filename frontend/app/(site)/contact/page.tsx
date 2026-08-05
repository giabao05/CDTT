export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <h1 className="text-3xl font-display font-900 text-zinc-900 mb-8 tracking-tight">
        LIÊN <span className="text-[#E8002D]">HỆ</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-xl font-700 text-zinc-900 mb-4">Thông tin liên hệ</h2>
          <div className="space-y-4 text-zinc-600 bg-white p-6 border border-zinc-200 rounded-xl shadow-sm">
            <p className="flex items-center gap-3">
              <strong className="text-zinc-900 min-w-24">Địa chỉ:</strong> 
              123 Đường Công Nghệ, Quận 1, TP.HCM
            </p>
            <p className="flex items-center gap-3">
              <strong className="text-zinc-900 min-w-24">Điện thoại:</strong> 
              1900 1234
            </p>
            <p className="flex items-center gap-3">
              <strong className="text-zinc-900 min-w-24">Email:</strong> 
              support@phonestore.com
            </p>
            <p className="flex items-center gap-3">
              <strong className="text-zinc-900 min-w-24">Giờ làm việc:</strong> 
              8:00 - 22:00 (Tất cả các ngày trong tuần)
            </p>
          </div>
        </div>
        <div className="bg-white p-8 border border-zinc-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-700 text-zinc-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>
          <form className="space-y-5">
            <div>
              <label className="block text-sm text-zinc-700 mb-1.5 font-600">Họ và tên</label>
              <input type="text" placeholder="Nhập họ và tên của bạn..." className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E8002D]/20 focus:border-[#E8002D] transition-all" />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 mb-1.5 font-600">Email</label>
              <input type="email" placeholder="Nhập địa chỉ email..." className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E8002D]/20 focus:border-[#E8002D] transition-all" />
            </div>
            <div>
              <label className="block text-sm text-zinc-700 mb-1.5 font-600">Nội dung</label>
              <textarea rows={4} placeholder="Nhập nội dung cần hỗ trợ..." className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#E8002D]/20 focus:border-[#E8002D] transition-all resize-none"></textarea>
            </div>
            <button type="button" className="w-full bg-[#E8002D] text-white px-6 py-3 rounded-lg font-600 tracking-wide shadow-sm shadow-red-500/30 hover:bg-red-700 hover:shadow-red-500/50 transition-all mt-2 uppercase text-sm">
              Gửi tin nhắn
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
