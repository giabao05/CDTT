'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { ArrowLeft, Send, Clock, User, Mail, CheckCircle, Info } from 'lucide-react';

export default function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [resolvedParams.id]);

  const fetchContact = async () => {
    try {
      const res = await api.get(`/contact/${resolvedParams.id}`);
      setContact(res.data);
      
      // Nếu trạng thái là UNREAD thì gọi API mark as read
      if (res.data.status === 'UNREAD') {
        await api.put(`/contact/${resolvedParams.id}/read`);
        setContact((prev: any) => ({ ...prev, status: 'READ' }));
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      alert('Không thể tải thông tin liên hệ!');
      router.push('/admin/contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      alert('Vui lòng nhập nội dung trả lời!');
      return;
    }
    setSending(true);
    try {
      await api.post(`/contact/${resolvedParams.id}/reply`, { replyContent });
      alert('Gửi phản hồi thành công!');
      fetchContact(); // reload để lấy trạng thái mới
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Có lỗi xảy ra khi gửi phản hồi!');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Đang tải...</div>;
  }

  if (!contact) return null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/contacts" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin liên hệ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-500" />
              Thông tin người gửi
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">Họ và tên</label>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <User size={14} className="text-slate-400" />
                  {contact.name}
                </div>
              </div>
              
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">Email</label>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <Mail size={14} className="text-slate-400" />
                  <a href={`mailto:${contact.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                    {contact.email}
                  </a>
                </div>
              </div>
              
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">Ngày gửi</label>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <Clock size={14} className="text-slate-400" />
                  {new Date(contact.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block mb-1">Trạng thái</label>
                {contact.status === 'REPLIED' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <CheckCircle size={14} />
                    Đã trả lời ({new Date(contact.repliedAt).toLocaleDateString('vi-VN')})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                    <Clock size={14} />
                    Chờ trả lời
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải: Nội dung & Phản hồi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Nội dung liên hệ</h3>
            <div className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {contact.content}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">
              {contact.status === 'REPLIED' ? 'Nội dung bạn đã trả lời' : 'Viết phản hồi cho khách hàng'}
            </h3>
            
            {contact.status === 'REPLIED' ? (
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 text-sm text-indigo-900 dark:text-indigo-200 whitespace-pre-wrap leading-relaxed">
                {contact.replyContent}
              </div>
            ) : (
              <form onSubmit={handleReply}>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập nội dung email phản hồi của bạn tại đây..."
                  className="w-full h-40 p-4 rounded-xl bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors text-sm text-slate-900 dark:text-white resize-none mb-4"
                  required
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                  >
                    <Send size={16} />
                    {sending ? 'Đang gửi...' : 'Gửi email phản hồi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
