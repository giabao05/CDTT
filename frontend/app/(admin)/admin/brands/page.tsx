'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, Edit2, Trash2, Search, Image as ImageIcon } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    logoUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/brands/${editItem.id}`, { ...form, id: editItem.id });
      } else {
        await api.post('/brands', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving brand:', err);
      alert('Có lỗi xảy ra khi lưu! Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
    try {
      await api.delete(`/brands/${id}`);
      fetchData();
    } catch (err) {
      console.error('Error deleting brand:', err);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', description: '', logoUrl: '' });
    setIsModalOpen(true);
  };

  const openEdit = (item: Brand) => {
    setEditItem(item);
    setForm({ 
      name: item.name || '', 
      slug: item.slug || '', 
      description: item.description || '', 
      logoUrl: item.logoUrl || '' 
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // Resize to max 400px to keep payload tiny
          let { width, height } = img;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Use WebP or PNG for transparency, keeps size extremely small (<100KB)
          const dataUrl = canvas.toDataURL('image/png');
          setForm(prev => ({ ...prev, logoUrl: dataUrl }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const filtered = brands.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Thương hiệu</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Thêm, sửa, xóa các nhãn hàng (Apple, Samsung, Xiaomi...)</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Thêm Thương hiệu
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-slate-50 dark:bg-[#0d1117]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm thương hiệu..."
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
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Logo</th>
                  <th className="px-4 py-3 font-medium">Tên Thương hiệu</th>
                  <th className="px-4 py-3 font-medium">Đường dẫn (Slug)</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2">
                        {item.logoUrl ? (
                          <img src={item.logoUrl} alt={item.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <ImageIcon size={20} className="text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.slug}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(item)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                {editItem ? 'Sửa Thương hiệu' : 'Thêm Thương hiệu Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Thương hiệu</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Slug (Đường dẫn tĩnh)</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={e => setForm({...form, slug: e.target.value})}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ảnh Logo</label>
                <div className="flex items-start gap-4">
                  {form.logoUrl && (
                    <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
                      <img src={form.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mb-3"
                    />
                    <input
                      type="text"
                      value={form.logoUrl}
                      onChange={e => setForm({...form, logoUrl: e.target.value})}
                      placeholder="Hoặc nhập URL hình ảnh..."
                      className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#1e293b]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
