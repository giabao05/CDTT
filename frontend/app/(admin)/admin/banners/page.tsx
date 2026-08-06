'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, LayoutTemplate, Zap } from 'lucide-react';
import type { Product } from '@/types/admin';

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 1,
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bannersRes, productsRes] = await Promise.all([
        api.get('/banners'),
        api.get('/products?size=1000')
      ]);
      setBanners(bannersRes.data);
      setProducts(productsRes.data.content || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editBanner) {
        await api.put(`/banners/${editBanner.id}`, form);
      } else {
        await api.post('/banners', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving banner:', err);
      alert(err.response?.data?.error || err.message || 'Có lỗi xảy ra khi lưu banner.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await api.delete(`/banners/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  const openAdd = () => {
    setEditBanner(null);
    const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.sortOrder || 0)) + 1 : 1;
    setForm({ title: '', description: '', imageUrl: '', linkUrl: '', sortOrder: nextOrder, isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (b: Banner) => {
    setEditBanner(b);
    setForm({ ...b });
    setIsModalOpen(true);
  };

  const handleProductSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;
    
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setForm(prev => ({
        ...prev,
        title: product.name,
        description: product.description || '',
        linkUrl: `/product/${product.slug}`,
        // If they want to use product image as banner (usually banners have specific ratios, but good for default)
        imageUrl: prev.imageUrl || product.thumbnail || '' 
      }));
    }
  };

  const filteredBanners = banners.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.sortOrder - b.sortOrder);
  
  const activeBanners = [...banners].filter(b => b.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  // Auto-slide preview
  useEffect(() => {
    if (showPreview && activeBanners.length > 1) {
      const timer = setInterval(() => {
        setCurrentPreviewIndex(prev => (prev + 1) % activeBanners.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [showPreview, activeBanners.length]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Banners</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Thêm, sửa, xóa các banner quảng cáo trên trang chủ</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowPreview(!showPreview);
              setCurrentPreviewIndex(0);
            }}
            className="bg-slate-200 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <LayoutTemplate size={16} /> {showPreview ? 'Đóng Xem trước' : 'Xem trước Giao diện'}
          </button>
          <button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Thêm Banner
          </button>
        </div>
      </div>
      
      {showPreview && (
        <div className="mb-6 bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6 shadow-lg relative">
          <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wider">Xem trước Trang Chủ</h3>
          
          <div className="relative w-full max-w-5xl mx-auto h-[400px] rounded-xl overflow-hidden bg-[#111111] border-[4px] border-[#333] shadow-2xl group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGgyMHYyMEgwVjB6bTEwIDEwYTEgMSAwIDAgMCAwIDJoLjAxYTEgMSAwIDAgMCAwLTJoLS4wMXoiIGZpbGw9IiMzMzMiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a] shadow-[inset_0_0_50px_rgba(255,0,0,0.05)]"></div>

            {activeBanners.length > 0 ? (
              <>
                <div className="container mx-auto px-6 w-full h-full flex items-center justify-between gap-4 py-8 relative z-20">
                  
                  {/* Text Content */}
                  <div className="flex-1 text-left max-w-sm">
                    <div className="inline-block px-3 py-1 bg-gradient-to-r from-[#222] to-[#111] text-[#aaa] font-sans font-semibold text-[0.55rem] rounded-full mb-4 uppercase tracking-[0.25em] shadow-[0_5px_10px_rgba(0,0,0,0.5)] border border-[#444]">
                      The Smart Choice
                    </div>
                    
                    <h2 className="text-3xl font-serif uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#f3e5ab] via-[#d4af37] to-[#aa8022] mb-4 tracking-wide leading-[1.1] drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                      {activeBanners[currentPreviewIndex].title}
                    </h2>
                    
                    <p className="text-[#ccc] font-sans text-xs font-medium mb-6 leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] line-clamp-3">
                      {activeBanners[currentPreviewIndex].description || 'Trải nghiệm sự hoàn mỹ. Khám phá ngay sản phẩm đỉnh cao với công nghệ vượt trội - Độc quyền, Giá tốt.'}
                    </p>
                    
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-b from-[#222] to-[#0a0a0a] text-[#ff4444] font-sans font-bold text-xs uppercase tracking-widest rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.6),_inset_0_0_15px_rgba(255,0,0,0.2)] border border-[#ff4444]/40">
                      <Zap size={14} className="text-[#ff4444]" />
                      Khám Phá Ngay
                    </button>
                  </div>

                  {/* Image Platform */}
                  <div className="flex-1 h-full relative flex items-center justify-end">
                    <div className="relative w-full max-w-[280px] aspect-[4/5] flex items-center justify-center">
                      <div className="absolute w-[90%] aspect-[4/5] rounded-[2rem] bg-gradient-to-tr from-[#ff0055] via-[#ffaa00] to-[#00aaff] opacity-20 blur-xl"></div>
                      <div className="absolute w-[90%] aspect-[4/5] bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.8)] border-[3px] border-white/80 z-10 overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-b from-white to-[#f8f8f8]"></div>
                        <img 
                          src={activeBanners[currentPreviewIndex].imageUrl} 
                          alt={activeBanners[currentPreviewIndex].title} 
                          className="relative z-10 w-[95%] h-[95%] object-contain mix-blend-multiply drop-shadow-xl"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/800x800/1e293b/fff?text=Invalid+Image';
                          }}
                        />
                      </div>
                      <div className="absolute top-[4%] z-30 px-4 py-1.5 bg-gradient-to-b from-[#e60000] via-[#b30000] to-[#800000] border border-[#ffcc00] rounded-full text-[#ffea80] font-bold text-[0.65rem] tracking-widest shadow-[0_5px_15px_rgba(255,0,0,0.6)]">
                        ĐỘC QUYỀN
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
                  {activeBanners.map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPreviewIndex(i)}
                      className={`h-2 rounded-full transition-all ${i === currentPreviewIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60 w-2'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-500">
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p>Chưa có banner nào đang hoạt động</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-slate-50 dark:bg-[#0d1117]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm banner..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-200 dark:bg-[#1e293b] text-slate-900 dark:text-white border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 transition-shadow"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">Đang tải...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-200 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Hình ảnh</th>
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium">Đường dẫn</th>
                  <th className="px-4 py-3 font-medium">Thứ tự</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {filteredBanners.map(banner => (
                  <tr key={banner.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-32 h-16 bg-slate-200 dark:bg-[#1e293b] rounded-lg overflow-hidden relative">
                        {banner.imageUrl ? (
                          <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto text-slate-500 dark:text-slate-500" size={20} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{banner.title}</td>
                    <td className="px-4 py-3 text-indigo-400">{banner.linkUrl}</td>
                    <td className="px-4 py-3">{banner.sortOrder}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        banner.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {banner.isActive ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(banner)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBanners.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
                      Không tìm thấy banner nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-white dark:bg-[#161b22]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editBanner ? 'Sửa Banner' : 'Thêm Banner Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3 mb-4">
                <label className="block text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">Tạo nhanh từ Sản phẩm</label>
                <select 
                  onChange={handleProductSelect}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 text-sm"
                  defaultValue=""
                >
                  <option value="" disabled>-- Chọn một sản phẩm để tự động điền thông tin --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tiêu đề</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mô tả (Subtitle)</label>
                <textarea
                  value={form.description || ''}
                  onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  rows={2}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Link Hình Ảnh (URL)</label>
                <input
                  type="text"
                  required
                  value={form.imageUrl}
                  onChange={e => setForm({...form, imageUrl: e.target.value})}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
                {form.imageUrl && (
                  <div className="mt-2 w-full h-32 bg-white dark:bg-[#07090f] rounded-lg border border-slate-200 dark:border-[#1e293b] overflow-hidden">
                    <img 
                      src={form.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/fff?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Đường dẫn khi click (Link URL)</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={e => setForm({...form, linkUrl: e.target.value})}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  placeholder="/products/iphone-15"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm({...form, sortOrder: parseInt(e.target.value) || 0})}
                    className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Trạng thái</label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm({...form, isActive: e.target.checked})}
                      className="rounded border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#07090f] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-[#0d1117]"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Hiển thị Banner này</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
