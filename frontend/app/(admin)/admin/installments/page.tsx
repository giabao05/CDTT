'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { CreditCard, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

interface InstallmentRequest {
  id: number;
  customerName: string;
  phone: string;
  identityCard: string;
  productVariantId: number;
  upfrontPayment: number;
  months: number;
  interestRate: number;
  status: string; // PENDING, APPROVED, REJECTED, COMPLETED
  requestDate: string;
}

export default function InstallmentsPage() {
  const [requests, setRequests] = useState<InstallmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/installments');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching installments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    if (!confirm(`Xác nhận chuyển trạng thái thành ${status}?`)) return;
    
    try {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      
      await api.put(`/installments/${id}`, { ...req, status });
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><Clock size={12}/> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><CheckCircle size={12}/> Đã duyệt</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><XCircle size={12}/> Từ chối</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><CheckCircle size={12}/> Hoàn tất</span>;
      default:
        return <span className="px-2 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Trả góp</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Duyệt và theo dõi hồ sơ mua trả góp của khách hàng</p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">Đang tải hồ sơ...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-200 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Khách hàng</th>
                  <th className="px-4 py-3 font-medium">Sản phẩm (Variant ID)</th>
                  <th className="px-4 py-3 font-medium">Trả trước</th>
                  <th className="px-4 py-3 font-medium">Kỳ hạn</th>
                  <th className="px-4 py-3 font-medium">Ngày gửi</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{req.customerName}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">SĐT: {req.phone} - CCCD: {req.identityCard}</div>
                    </td>
                    <td className="px-4 py-3 text-indigo-400 font-mono">#{req.productVariantId}</td>
                    <td className="px-4 py-3 font-medium text-emerald-400">{formatCurrency(req.upfrontPayment)}</td>
                    <td className="px-4 py-3">
                      {req.months} tháng <br/><span className="text-xs text-slate-600 dark:text-slate-400">(Lãi {req.interestRate}%)</span>
                    </td>
                    <td className="px-4 py-3">{new Date(req.requestDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors">Duyệt</button>
                          <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors">Từ chối</button>
                        </div>
                      )}
                      {req.status === 'APPROVED' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'COMPLETED')} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs transition-colors">Hoàn tất HĐ</button>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
                      Chưa có hồ sơ trả góp nào.
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
