'use client';
import { useState, useEffect } from 'react';
import { Plus, Tag, Calendar, Percent, DollarSign, Trash2, X, Check, Loader2 } from 'lucide-react';
import type { Voucher } from '@/types/admin';
import { API_BASE_URL } from '@/lib/api';

const statusColors: Record<string, string> = {
  Active: 'text-[#34d399] bg-[#10b981]/10 border-[#10b981]/20',
  Expired: 'text-[#f87171] bg-[#ef4444]/10 border-[#ef4444]/20',
  Upcoming: 'text-[#fbbf24] bg-[#f59e0b]/10 border-[#f59e0b]/20',
};
const statusLabels: Record<string, string> = {
  Active: 'Đang hoạt động',
  Expired: 'Đã hết hạn',
  Upcoming: 'Sắp diễn ra',
};

const emptyForm = {
  code: '', type: 'percent' as 'percent' | 'fixed', value: 0,
  minOrder: 0, remaining: 0, total: 0, startDate: '', endDate: '', status: 'Active' as Voucher['status'],
};

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vouchers`);
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((v: any) => {
          let status: Voucher['status'] = 'Active';
          const now = new Date();
          const expiresAt = v.expiresAt ? new Date(v.expiresAt) : null;
          if (!v.isActive) status = 'Expired';
          else if (expiresAt && expiresAt < now) status = 'Expired';

          return {
            id: String(v.id),
            code: v.code,
            type: 'percent',
            value: v.discountPercent || 0,
            minOrder: 0,
            remaining: Math.max(0, (v.maxUsage || 0) - (v.currentUsage || 0)),
            total: v.maxUsage || 0,
            startDate: '', // Not in DB
            endDate: expiresAt ? expiresAt.toLocaleDateString('vi-VN') : '',
            status
          };
        });
        setVouchers(mapped);
      }
    } catch (e) {
      console.error('Failed to load vouchers', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.code.trim()) return;
    
    try {
      const payload = {
        code: form.code,
        discountPercent: form.value,
        maxUsage: form.total,
        currentUsage: form.total - form.remaining,
        isActive: form.status === 'Active',
        expiresAt: form.endDate ? `${form.endDate}T23:59:59` : null,
      };
      
      const res = await fetch(`${API_BASE_URL}/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        fetchVouchers();
        setForm(emptyForm);
        setShowForm(false);
      }
    } catch (e) {
      console.error('Error creating voucher', e);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;
    try {
      await fetch(`${API_BASE_URL}/vouchers/${deleteId}`, { method: 'DELETE' });
      fetchVouchers();
      setDeleteId(null);
    } catch (e) {
      console.error('Error deleting voucher', e);
    }
  };

  const active = vouchers.filter((v) => v.status === 'Active');
  const expired = vouchers.filter((v) => v.status === 'Expired');
  const upcoming = vouchers.filter((v) => v.status === 'Upcoming');

  return (
    <div className="p-6 animate-fadeIn">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Đang hoạt động', count: active.length, color: '#10b981' },
          { label: 'Sắp diễn ra', count: upcoming.length, color: '#f59e0b' },
          { label: 'Đã hết hạn', count: expired.length, color: '#ef4444' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">{s.label}</p>
            <p className="text-[20px] font-bold font-mono mt-1" style={{ color: s.color }}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#475569] font-mono">{vouchers.length} mã giảm giá</p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] rounded-lg text-[12px] font-medium text-white transition-colors"
        >
          <Plus size={13} /> Tạo mã mới
        </button>
      </div>

      {/* Voucher cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#6366f1]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden hover:border-slate-300 dark:border-[#334155] transition-colors group"
          >
            {/* Top: code + type */}
            <div className="px-4 pt-4 pb-3 border-b border-slate-200 dark:border-[#1e293b]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 flex items-center justify-center">
                    <Tag size={14} className="text-[#818cf8]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold font-mono text-slate-900 dark:text-[#f1f5f9]">{voucher.code}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155] font-mono">{voucher.id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${statusColors[voucher.status]}`}>
                  {statusLabels[voucher.status]}
                </span>
              </div>
            </div>

            {/* Value */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5 mb-3">
                {voucher.type === 'percent' ? (
                  <Percent size={20} className="text-[#818cf8]" />
                ) : (
                  <DollarSign size={20} className="text-[#34d399]" />
                )}
                <span className="text-[28px] font-black font-mono" style={{
                  color: voucher.type === 'percent' ? '#818cf8' : '#34d399'
                }}>
                  {voucher.type === 'percent' ? `${voucher.value}%` : `${(voucher.value / 1000).toFixed(0)}K₫`}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-500 dark:text-[#475569]">Đơn tối thiểu</span>
                  <span className="font-mono text-slate-600 dark:text-[#94a3b8]">{voucher.minOrder.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-500 dark:text-[#475569]">Còn lại</span>
                  <span className="font-mono">
                    <span className={voucher.remaining === 0 ? 'text-[#f87171]' : 'text-slate-600 dark:text-[#94a3b8]'}>{voucher.remaining}</span>
                    <span className="text-slate-600 dark:text-slate-400 dark:text-[#334155]">/{voucher.total}</span>
                  </span>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mt-2.5">
                <div className="w-full h-1 bg-slate-200 dark:bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all"
                    style={{ width: `${((voucher.total - voucher.remaining) / voucher.total) * 100}%` }}
                  />
                </div>
                <p className="text-[9px] text-slate-600 dark:text-slate-400 dark:text-[#334155] font-mono mt-1">
                  {Math.round(((voucher.total - voucher.remaining) / voucher.total) * 100)}% đã dùng
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">
                <Calendar size={10} />
                <span className="font-mono">{voucher.startDate} → {voucher.endDate}</span>
              </div>
              <button
                onClick={() => setDeleteId(voucher.id)}
                className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#1e293b] hover:bg-[#ef4444]/20 hover:text-[#f87171] text-slate-600 dark:text-slate-400 dark:text-[#334155] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 w-full max-w-sm animate-fadeIn">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-[#f1f5f9] mb-2">Xóa mã giảm giá?</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-2 p-5 bg-slate-50 dark:bg-[#0d1117] border-t border-slate-200 dark:border-[#1e293b]">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-[12px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#94a3b8] hover:bg-slate-200 dark:bg-[#1e293b] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 rounded-lg text-[12px] font-medium text-white bg-[#ef4444] hover:bg-[#dc2626] transition-colors"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full max-w-md animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1e293b]">
              <h2 className="text-[14px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Tạo mã giảm giá mới</h2>
              <button onClick={() => setShowForm(false)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b]">
                <X size={13} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Mã voucher *</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SUMMER2024"
                  className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] font-mono font-bold text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Loại giảm</label>
                  <div className="flex gap-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg p-1">
                    {(['percent', 'fixed'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`flex-1 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          form.type === t ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'text-slate-500 dark:text-slate-500 dark:text-[#475569]'
                        }`}
                      >
                        {t === 'percent' ? '% Phần trăm' : '₫ Cố định'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">
                    Giá trị giảm {form.type === 'percent' ? '(%)' : '(₫)'}
                  </label>
                  <input
                    type="number"
                    value={form.value || ''}
                    onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
                    placeholder={form.type === 'percent' ? '15' : '500000'}
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] font-mono text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Đơn tối thiểu (₫)</label>
                  <input
                    type="number"
                    value={form.minOrder || ''}
                    onChange={(e) => setForm((f) => ({ ...f, minOrder: Number(e.target.value) }))}
                    placeholder="5000000"
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] font-mono text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Số lượng mã</label>
                  <input
                    type="number"
                    value={form.total || ''}
                    onChange={(e) => setForm((f) => ({ ...f, total: Number(e.target.value), remaining: Number(e.target.value) }))}
                    placeholder="100"
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] font-mono text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Trạng thái ban đầu</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Voucher['status'] }))}
                  className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50"
                >
                  <option value="Active">Đang hoạt động</option>
                  <option value="Upcoming">Sắp diễn ra</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 dark:border-[#1e293b] flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-[#1e293b] text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] rounded-lg hover:bg-[#334155]">
                Hủy
              </button>
              <button onClick={handleCreate} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] text-[12px] text-white rounded-lg transition-colors">
                <Check size={13} /> Tạo mã
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
