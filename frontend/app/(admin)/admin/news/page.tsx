'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import { Plus, Edit2, Trash2, Search, FileText, Image as ImageIcon, Bold, Italic, Underline } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  thumbnail: string;
  author: string;
  isPublished: boolean;
  createdAt: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    thumbnail: '',
    author: '',
    isPublished: true
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles');
      setArticles(res.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isModalOpen && editorRef.current) {
      if (editorRef.current.innerHTML !== form.content) {
        editorRef.current.innerHTML = form.content;
      }
    }
  }, [isModalOpen, editArticle]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      setForm(prev => ({ ...prev, content: editorRef.current!.innerHTML }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand('insertImage', false, base64);
        
        // Add basic styles to newly inserted images
        const imgs = editorRef.current.getElementsByTagName('img');
        for (let i = 0; i < imgs.length; i++) {
          if (!imgs[i].style.maxWidth) {
            imgs[i].style.maxWidth = '100%';
            imgs[i].style.height = 'auto';
            imgs[i].style.borderRadius = '8px';
            imgs[i].style.margin = '16px 0';
            imgs[i].style.cursor = 'move';
          }
        }
        handleEditorInput();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(prev => ({ ...prev, thumbnail: base64 }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editArticle) {
        await api.put(`/articles/${editArticle.id}`, form);
      } else {
        await api.post('/articles', form);
      }
      setIsModalOpen(false);
      fetchArticles();
    } catch (err) {
      console.error('Error saving article:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await api.delete(`/articles/${id}`);
      fetchArticles();
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  const openAdd = () => {
    setEditArticle(null);
    setForm({ title: '', slug: '', content: '', thumbnail: '', author: 'Admin', isPublished: true });
    setIsModalOpen(true);
  };

  const openEdit = (a: Article) => {
    setEditArticle(a);
    setForm({ ...a });
    setIsModalOpen(true);
  };

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Tin tức</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Thêm, sửa, xóa các bài viết và tin tức công nghệ</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Thêm Bài Viết
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-slate-50 dark:bg-[#0d1117]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm bài viết..."
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
                  <th className="px-4 py-3 font-medium rounded-tl-lg w-24">Hình ảnh</th>
                  <th className="px-4 py-3 font-medium">Tiêu đề</th>
                  <th className="px-4 py-3 font-medium">Tác giả</th>
                  <th className="px-4 py-3 font-medium">Ngày đăng</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {filteredArticles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-16 h-12 bg-slate-200 dark:bg-[#1e293b] rounded-lg overflow-hidden relative">
                        {article.thumbnail ? (
                          <img src={article.thumbnail} alt={article.title} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="absolute inset-0 m-auto text-slate-500 dark:text-slate-500" size={16} />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-xs truncate">{article.title}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{article.author}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        article.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {article.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(article)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(article.id)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredArticles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
                      Không tìm thấy bài viết nào.
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
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-white dark:bg-[#161b22]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editArticle ? 'Sửa Bài Viết' : 'Thêm Bài Viết Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="article-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tiêu đề</label>
                    <input
                      type="text"
                      required
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
                      className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Đường dẫn (Slug)</label>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={e => setForm({...form, slug: e.target.value})}
                      className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Ảnh Đại Diện (Thumbnail)</label>
                    <div className="flex items-center gap-3">
                      {form.thumbnail && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-200 dark:border-[#1e293b]">
                          <img src={form.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="cursor-pointer bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 flex-1 justify-center border border-dashed border-indigo-200 dark:border-indigo-500/30">
                        <ImageIcon size={18} />
                        {form.thumbnail ? 'Thay đổi ảnh đại diện' : 'Chọn ảnh từ máy tính'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tác giả</label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={e => setForm({...form, author: e.target.value})}
                      className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 border-b border-slate-200 dark:border-[#1e293b] pb-2">
                    <div className="flex items-center gap-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nội dung</label>
                      <div className="flex gap-1 border-l border-slate-300 dark:border-slate-700 pl-4">
                        <button type="button" onClick={(e) => { e.preventDefault(); document.execCommand('bold', false); editorRef.current?.focus(); handleEditorInput(); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="In đậm (Ctrl+B)">
                          <Bold size={16} />
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); document.execCommand('italic', false); editorRef.current?.focus(); handleEditorInput(); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="In nghiêng (Ctrl+I)">
                          <Italic size={16} />
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); document.execCommand('underline', false); editorRef.current?.focus(); handleEditorInput(); }} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors" title="Gạch chân (Ctrl+U)">
                          <Underline size={16} />
                        </button>
                      </div>
                    </div>
                    <label className="cursor-pointer bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      <ImageIcon size={16} />
                      Chèn ảnh vào nội dung
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onBlur={handleEditorInput}
                    className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[250px] max-h-[500px] overflow-y-auto prose dark:prose-invert"
                    style={{ outline: 'none' }}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={e => setForm({...form, isPublished: e.target.checked})}
                      className="rounded border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#07090f] text-indigo-500 focus:ring-indigo-500 focus:ring-offset-[#0d1117]"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Xuất bản bài viết ngay (Hiển thị cho người dùng)</span>
                  </label>
                </div>
              </form>
            </div>

            <div className="p-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#161b22]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="article-form"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Lưu bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
