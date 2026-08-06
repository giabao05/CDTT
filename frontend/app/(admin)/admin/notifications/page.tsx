'use client';
import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2, Mail, MailOpen } from 'lucide-react';
import api from '@/utils/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/ADMIN');
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      await api.put(`/notifications/${n.id}/read`);
    }
    fetchNotifications();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="text-[#6366f1]" size={24} />
            Lịch sử Thông báo
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý và theo dõi tất cả các thông báo từ hệ thống
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <CheckCircle size={16} />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Bell size={48} className="mb-4 text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-medium">Không có thông báo nào</p>
            <p className="text-sm mt-1">Bạn đã xem hết tất cả thông báo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-[#1e293b]">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 sm:p-5 flex gap-4 transition-colors ${!notif.read ? 'bg-[#6366f1]/5 dark:bg-[#6366f1]/10' : 'hover:bg-slate-50 dark:hover:bg-[#111827]'}`}
              >
                <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${!notif.read ? 'bg-[#6366f1] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                  {!notif.read ? <Mail size={18} /> : <MailOpen size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                    <h3 className={`text-sm sm:text-base ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.read ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.read && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs font-medium text-[#6366f1] hover:text-[#4f46e5] flex items-center gap-1"
                      >
                        <CheckCircle size={14} />
                        Đánh dấu đã đọc
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
