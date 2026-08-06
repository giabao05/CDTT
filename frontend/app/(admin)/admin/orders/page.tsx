'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Printer, ChevronDown, X, MapPin, CreditCard, Package, RefreshCw } from 'lucide-react';
import { fetchOrders, updateOrderStatus } from '@/lib/api';
import type { Order, OrderStatus } from '@/types/admin';

const statusList: OrderStatus[] = ['Pending', 'Confirmed', 'Shipping', 'Delivered', 'Cancelled'];
const statusLabels: Record<OrderStatus, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};
const statusColors: Record<OrderStatus, string> = {
  Pending: 'text-[#fbbf24] bg-[#f59e0b]/10 border-[#f59e0b]/20',
  Confirmed: 'text-[#60a5fa] bg-[#3b82f6]/10 border-[#3b82f6]/20',
  Shipping: 'text-[#c084fc] bg-[#a855f7]/10 border-[#a855f7]/20',
  Delivered: 'text-[#34d399] bg-[#10b981]/10 border-[#10b981]/20',
  Cancelled: 'text-[#f87171] bg-[#ef4444]/10 border-[#ef4444]/20',
};
const paymentLabels: Record<string, string> = { COD: 'Tiền mặt (COD)', VNPay: 'VNPay', Momo: 'MoMo' };
const paymentColors: Record<string, string> = {
  COD: 'text-slate-600 dark:text-[#94a3b8]',
  VNPay: 'text-[#60a5fa]',
  Momo: 'text-[#f472b6]',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async (showLoading = false) => {
    if (showLoading) setRefreshing(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load orders', error);
    } finally {
      if (showLoading) setRefreshing(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { loadData(true); }, [loadData]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => loadData(false), 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const filtered = orders.filter((o) => {
    const matchFilter = activeFilter === 'all' || o.status === activeFilter;
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder((o) => o ? { ...o, status } : o);
    
    // Call backend to persist changes
    const success = await updateOrderStatus(orderId, status);
    if (!success) {
      alert("Cập nhật trạng thái thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header row: filters + refresh */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              activeFilter === 'all' ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'text-slate-500 dark:text-[#475569] hover:text-[#64748b] bg-white dark:bg-[#111827]'
            }`}
          >
            Tất cả ({orders.length})
          </button>
          {statusList.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                activeFilter === s ? `${statusColors[s]} border` : 'text-slate-500 dark:text-[#475569] hover:text-[#64748b] bg-white dark:bg-[#111827]'
              }`}
            >
              {statusLabels[s]} ({orders.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 dark:text-[#475569] hidden sm:block">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#6366f1]/10 text-[#818cf8] hover:bg-[#6366f1]/20 transition-colors disabled:opacity-60"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm mã đơn, tên khách..."
          className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-8 pr-4 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e293b]">
                {['Mã đơn', 'Khách hàng', 'Sản phẩm', 'Tổng tiền', 'Thanh toán', 'Trạng thái', 'Ngày đặt', 'Hành động'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-slate-200 dark:border-[#1e293b]/40 hover:bg-[#1a2235]/40 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono text-[#6366f1]">{order.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-medium text-slate-900 dark:text-[#f1f5f9]">{order.customer}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">
                      {order.items?.[0]?.name || 'Chưa có sản phẩm'}
                    </p>
                    {order.items && order.items.length > 1 && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155]">+{order.items.length - 1} sản phẩm khác</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-mono font-semibold text-slate-900 dark:text-[#f1f5f9]">
                      {order.total.toLocaleString('vi-VN')}₫
                    </p>
                    {order.shipping > 0 && (
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155] font-mono">+{order.shipping.toLocaleString('vi-VN')}₫ ship</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium ${paymentColors[order.payment]}`}>{order.payment}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative group/status">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium cursor-pointer ${
                        statusColors[order.status as OrderStatus] || 
                        statusColors[Object.keys(statusLabels).find(k => statusLabels[k as OrderStatus] === order.status) as OrderStatus] || 
                        statusColors.Pending
                      }`}>
                        {statusLabels[order.status as OrderStatus] || order.status}
                        <ChevronDown size={9} />
                      </span>
                      <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-xl z-10 overflow-hidden hidden group-hover/status:block">
                        {statusList.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            className={`w-full px-3 py-2 text-left text-[11px] flex items-center justify-between hover:bg-slate-200 dark:bg-[#1e293b] transition-colors ${(order.status === s || statusLabels[s] === order.status) ? 'text-[#818cf8]' : 'text-slate-500 dark:text-slate-500 dark:text-[#64748b]'}`}
                          >
                            {statusLabels[s]}
                            {(order.status === s || statusLabels[s] === order.status) && <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-500 dark:text-[#475569]">{order.date}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="w-7 h-7 rounded-md bg-slate-200 dark:bg-[#1e293b] hover:bg-[#6366f1]/20 hover:text-[#818cf8] text-slate-500 dark:text-slate-500 dark:text-[#64748b] flex items-center justify-center transition-colors"
                        title="Chi tiết"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        className="w-7 h-7 rounded-md bg-slate-200 dark:bg-[#1e293b] hover:bg-[#06b6d4]/20 hover:text-[#22d3ee] text-slate-500 dark:text-slate-500 dark:text-[#64748b] flex items-center justify-center transition-colors"
                        title="In hóa đơn"
                      >
                        <Printer size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[13px] text-slate-600 dark:text-slate-400 dark:text-[#334155]">Không tìm thấy đơn hàng</div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1e293b]">
              <div>
                <h2 className="text-[14px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Chi tiết đơn hàng</h2>
                <p className="text-[11px] font-mono text-[#6366f1] mt-0.5">{selectedOrder.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:text-slate-600 dark:text-[#94a3b8]">
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Customer */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4">
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider mb-3">Thông tin khách hàng</p>
                <p className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">{selectedOrder.customer}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] mt-1">{selectedOrder.email}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{selectedOrder.phone}</p>
                <div className="flex items-start gap-1.5 mt-2">
                  <MapPin size={11} className="text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{selectedOrder.address}</p>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4">
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider mb-3">Thanh toán</p>
                <div className="flex items-center gap-2">
                  <CreditCard size={13} className="text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
                  <span className={`text-[12px] font-medium ${paymentColors[selectedOrder.payment]}`}>
                    {paymentLabels[selectedOrder.payment]}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white dark:bg-[#111827] rounded-xl p-4">
                <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider mb-3">Sản phẩm đã đặt</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-[#1e293b]/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-[#1e293b] flex items-center justify-center">
                          <Package size={12} className="text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-900 dark:text-[#f1f5f9]">{item.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">x{item.qty}</p>
                        </div>
                      </div>
                      <p className="text-[11px] font-mono text-slate-900 dark:text-[#f1f5f9]">
                        {(item.price * item.qty).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#1e293b] space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-500 dark:text-[#475569]">Tạm tính</span>
                    <span className="font-mono text-slate-600 dark:text-[#94a3b8]">{selectedOrder.total.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-500 dark:text-[#475569]">Phí vận chuyển</span>
                    <span className="font-mono text-slate-600 dark:text-[#94a3b8]">
                      {selectedOrder.shipping > 0 ? `${selectedOrder.shipping.toLocaleString('vi-VN')}₫` : 'Miễn phí'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px] font-semibold pt-1">
                    <span className="text-slate-900 dark:text-[#f1f5f9]">Tổng cộng</span>
                    <span className="font-mono text-[#34d399]">
                      {(selectedOrder.total + selectedOrder.shipping).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                </div>
              </div>

              {/* Update status */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-2">Cập nhật trạng thái</p>
                <div className="flex gap-2 flex-wrap">
                  {statusList.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedOrder.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                        selectedOrder.status === s
                          ? `${statusColors[s]} border-current`
                          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#1e293b] text-slate-500 dark:text-slate-500 dark:text-[#475569] hover:border-slate-300 dark:border-[#334155]'
                      }`}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-[#1e293b] flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-200 dark:bg-[#1e293b] text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] rounded-lg hover:bg-[#334155] transition-colors">
                <Printer size={13} />
                In hóa đơn
              </button>
              <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 bg-[#6366f1] text-[12px] text-white rounded-lg hover:bg-[#4f46e5] transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
