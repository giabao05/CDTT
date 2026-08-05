'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Search, Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApprove = async (review: Review) => {
    try {
      await api.put(`/reviews/${review.id}`, { ...review, isApproved: !review.isApproved });
      fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.comment?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Đánh giá</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Duyệt và kiểm duyệt đánh giá của khách hàng</p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-slate-50 dark:bg-[#0d1117]">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Tìm nội dung đánh giá..."
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
                  <th className="px-4 py-3 font-medium rounded-tl-lg">ID SP</th>
                  <th className="px-4 py-3 font-medium">Khách hàng (ID)</th>
                  <th className="px-4 py-3 font-medium">Đánh giá</th>
                  <th className="px-4 py-3 font-medium">Nội dung</th>
                  <th className="px-4 py-3 font-medium">Ngày đăng</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {filteredReviews.map(review => (
                  <tr key={review.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-indigo-400">#{review.productId}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">User #{review.userId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} className={i >= review.rating ? 'text-slate-600' : ''} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white max-w-sm truncate">{review.comment}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleApprove(review)} 
                          className={`p-1.5 rounded transition-colors ${review.isApproved ? 'text-emerald-400 hover:bg-emerald-400/10' : 'text-amber-400 hover:bg-amber-400/10'}`}
                          title={review.isApproved ? 'Đã duyệt (Bấm để ẩn)' : 'Chưa duyệt (Bấm để hiện)'}
                        >
                          {review.isApproved ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        </button>
                        <button onClick={() => handleDelete(review.id)} className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Xóa đánh giá">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReviews.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
                      Không tìm thấy đánh giá nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
