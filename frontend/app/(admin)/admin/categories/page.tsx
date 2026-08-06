'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/categories/${editItem.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving category:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else if (err.response?.data) {
         // Spring boot error structure sometimes returns message as string or error field
         alert(typeof err.response.data === 'string' ? err.response.data : (err.response.data.error || 'Không thể xóa danh mục này do đang có sản phẩm bên trong.'));
      } else {
        alert('Không thể xóa danh mục này do đang có sản phẩm bên trong.');
      }
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', description: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditItem(item);
    setForm({ ...item });
    setIsModalOpen(true);
  };

  const filtered = categories.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Danh mục Sản phẩm</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Quản lý các ngành hàng (Điện thoại, Tablet, Phụ kiện...)</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Thêm Danh mục
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-slate-50 dark:bg-[#0d1117]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm danh mục..."
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
                  <th className="px-4 py-3 font-medium rounded-tl-lg">ID</th>
                  <th className="px-4 py-3 font-medium">Tên Danh mục</th>
                  <th className="px-4 py-3 font-medium">Đường dẫn (Slug)</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-400">#{item.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{item.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}>
                        {item.isActive ? 'Hoạt động' : 'Đã ẩn'}
                      </span>
                    </td>
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
                {editItem ? 'Sửa Danh mục' : 'Thêm Danh mục Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tên Danh mục</label>
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Trạng thái</label>
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm({...form, isActive: e.target.checked})}
                    className="rounded border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#07090f] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-[#0d1117]"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">Hoạt động</span>
                </label>
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
