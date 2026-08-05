'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Repeat, CheckCircle, XCircle, Search, Clock, Smartphone, Info } from 'lucide-react';

interface TradeInRequest {
  id: number;
  customerName: string;
  phone: string;
  oldDeviceName: string;
  deviceCondition: string; // A (Like new), B (Good), C (Scratched)
  estimatedPrice: number;
  finalPrice: number | null;
  newProductVariantId: number;
  status: string; // PENDING, INSPECTING, ACCEPTED, REJECTED
  requestDate: string;
}

export default function TradeInPage() {
  const [requests, setRequests] = useState<TradeInRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<TradeInRequest | null>(null);
  const [finalPrice, setFinalPrice] = useState<number>(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/trade-ins');
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching trade-ins:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: string, price: number | null = null) => {
    try {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      
      const updateData = { ...req, status };
      if (price !== null) updateData.finalPrice = price;
      
      await api.put(`/trade-ins/${id}`, updateData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const openApproveModal = (req: TradeInRequest) => {
    setSelectedReq(req);
    setFinalPrice(req.estimatedPrice);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><Clock size={12}/> Đợi kiểm tra</span>;
      case 'INSPECTING':
        return <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><Search size={12}/> Đang định giá</span>;
      case 'ACCEPTED':
        return <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><CheckCircle size={12}/> Đã chốt thu</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-xs font-medium flex items-center w-fit gap-1"><XCircle size={12}/> Từ chối thu</span>;
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Thu cũ Đổi mới (Trade-in)</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Tiếp nhận yêu cầu, định giá máy cũ và trợ giá lên đời cho khách</p>
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
                  <th className="px-4 py-3 font-medium">Máy cũ của khách</th>
                  <th className="px-4 py-3 font-medium">Tình trạng (Khách báo)</th>
                  <th className="px-4 py-3 font-medium">Giá dự kiến</th>
                  <th className="px-4 py-3 font-medium">Lên đời máy (Variant ID)</th>
                  <th className="px-4 py-3 font-medium">Trạng thái</th>
                  <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {requests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{req.customerName}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">SĐT: {req.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-amber-400">{req.oldDeviceName}</td>
                    <td className="px-4 py-3">Loại {req.deviceCondition}</td>
                    <td className="px-4 py-3">
                      <div className="text-slate-600 dark:text-slate-400 line-through text-xs">{formatCurrency(req.estimatedPrice)}</div>
                      {req.finalPrice && req.status === 'ACCEPTED' ? (
                        <div className="font-medium text-emerald-400">{formatCurrency(req.finalPrice)}</div>
                      ) : (
                        <div className="font-medium text-emerald-400">{formatCurrency(req.estimatedPrice)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-indigo-400 font-mono">#{req.newProductVariantId}</td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'PENDING' && (
                        <button onClick={() => handleUpdateStatus(req.id, 'INSPECTING')} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors">Nhận kiểm tra</button>
                      )}
                      {req.status === 'INSPECTING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openApproveModal(req)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors">Chốt giá & Thu</button>
                          <button onClick={() => { if(confirm('Từ chối thu mua máy này?')) handleUpdateStatus(req.id, 'REJECTED') }} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors">Từ chối</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
                      Chưa có yêu cầu Thu cũ đổi mới nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && selectedReq && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-white dark:bg-[#161b22]">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-400" /> Chốt Giá Thu Cũ
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">&times;</button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateStatus(selectedReq.id, 'ACCEPTED', finalPrice); }} className="p-6 space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex gap-3 mb-4">
                <Info size={20} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-300">
                  <p><strong>Khách hàng:</strong> {selectedReq.customerName}</p>
                  <p><strong>Máy cũ:</strong> {selectedReq.oldDeviceName} (Loại {selectedReq.deviceCondition})</p>
                  <p><strong>Giá dự kiến (App):</strong> {formatCurrency(selectedReq.estimatedPrice)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Giá thu mua cuối cùng (VNĐ)</label>
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">Sau khi kỹ thuật viên kiểm tra máy thực tế, hãy nhập mức giá chốt để thu mua.</p>
                <input
                  type="number"
                  required
                  value={finalPrice}
                  onChange={e => setFinalPrice(Number(e.target.value))}
                  className="w-full bg-white dark:bg-[#07090f] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2 text-emerald-400 font-bold focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-[#1e293b]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-[#1e293b] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg">Hủy</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Chốt thu mua & Lên đời</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
