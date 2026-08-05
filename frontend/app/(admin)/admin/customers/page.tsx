'use client';
import { useState, useEffect } from 'react';
import { Search, Lock, Unlock, Eye, TrendingUp, ShoppingBag, Shield, Users } from 'lucide-react';
import type { Customer } from '@/types/admin';
import { useAuthStore } from '@/store/authStore';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Banned'>('All');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'roles'>('customers');
  
  const { token, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8080/api/v1/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const mappedUsers: Customer[] = data.map((u: any) => ({
          id: String(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          orders: 0,
          spent: 0,
          status: 'Active', // Mock active since backend doesn't have ban feature yet
          joined: 'N/A',
          avatar: u.name ? u.name.charAt(0).toUpperCase() : 'U',
          role: u.role || 'USER',
        }));
        setCustomers(mappedUsers);
      } else {
        console.error('Failed to fetch users, status:', res.status);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeUserRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/users/${id}/role?role=${newRole}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, role: newRole } : c))
        );
        if (selected?.id === id) {
          setSelected((c) => (c ? { ...c, role: newRole } : c));
        }
      } else {
        alert('Có lỗi xảy ra khi đổi quyền.');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền:', error);
      alert('Có lỗi xảy ra khi đổi quyền.');
    }
  };

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleBan = (id: string) => {
    // Only mock toggle in frontend for now since backend has no status field
    setCustomers((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: c.status === 'Active' ? 'Banned' : 'Active' } : c)
    );
    if (selected?.id === id) {
      setSelected((c) => c ? { ...c, status: c.status === 'Active' ? 'Banned' : 'Active' } : c);
    }
  };

  const activeCount = customers.filter((c) => c.status === 'Active').length;

  if (!token) {
    return <div className="p-6 text-center text-slate-500">Đang kiểm tra quyền truy cập...</div>;
  }

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Đang tải danh sách người dùng...</div>;
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-[#1e293b] mb-6">
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'customers' 
              ? 'border-[#6366f1] text-[#6366f1] dark:text-[#818cf8]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-[#64748b] dark:hover:text-[#94a3b8]'
          }`}
        >
          <Users size={16} />
          Khách hàng
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'roles' 
              ? 'border-[#6366f1] text-[#6366f1] dark:text-[#818cf8]' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-[#64748b] dark:hover:text-[#94a3b8]'
          }`}
        >
          <Shield size={16} />
          Phân quyền
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Tổng người dùng', value: customers.length, color: '#6366f1' },
          { label: 'Đang hoạt động', value: activeCount, color: '#10b981' },
          { label: 'Bị khóa', value: customers.length - activeCount, color: '#ef4444' },
          { label: 'Quản trị viên', value: customers.filter(c => c.role === 'ADMIN').length, color: '#e8002d' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">{s.label}</p>
            <p className="text-[20px] font-bold font-mono mt-1" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email, số điện thoại..."
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-8 pr-4 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
          />
        </div>
        <div className="flex gap-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg p-1">
          {(['All', 'Active', 'Banned'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                statusFilter === f
                  ? f === 'Banned' ? 'bg-[#ef4444]/15 text-[#f87171]' : 'bg-[#6366f1]/15 text-[#818cf8]'
                  : 'text-slate-500 dark:text-slate-500 dark:text-[#475569] hover:text-slate-500 dark:text-slate-500 dark:text-[#64748b]'
              }`}
            >
              {f === 'All' ? 'Tất cả' : f === 'Active' ? 'Hoạt động' : 'Bị khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e293b]">
                <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">Khách hàng / Người dùng</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">Liên hệ</th>
                {activeTab === 'roles' && (
                  <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">Quyền (Role)</th>
                )}
                {activeTab === 'customers' && (
                  <>
                    <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">Đơn hàng</th>
                    <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">Tổng chi tiêu</th>
                  </>
                )}
                <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">Trạng thái</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-200 dark:border-[#1e293b]/40 hover:bg-[#1a2235]/40 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                        customer.status === 'Banned' ? 'bg-[#ef4444]/15 text-[#f87171]' : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-slate-900 dark:text-white'
                      }`}>
                        {customer.avatar}
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-slate-900 dark:text-[#f1f5f9]">{customer.name}</p>
                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155]">{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{customer.email}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">{customer.phone}</p>
                  </td>
                  {activeTab === 'roles' && (
                    <td className="px-4 py-3">
                      <select
                        value={customer.role}
                        onChange={(e) => changeUserRole(customer.id, e.target.value)}
                        className={`text-[11px] font-mono font-bold px-2 py-1 rounded outline-none border ${
                          customer.role === 'ADMIN' ? 'bg-[#e8002d]/10 text-[#e8002d] border-[#e8002d]/20' : 'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20'
                        }`}
                      >
                        <option value="USER" className="text-black">USER</option>
                        <option value="ADMIN" className="text-black">ADMIN</option>
                      </select>
                    </td>
                  )}
                  {activeTab === 'customers' && (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={11} className="text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
                          <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-[#94a3b8]">{customer.orders}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={11} className="text-[#34d399]" />
                          <span className="text-[12px] font-mono font-semibold text-[#34d399]">
                            {(customer.spent / 1_000_000).toFixed(1)}M₫
                          </span>
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                      customer.status === 'Active'
                        ? 'text-[#34d399] bg-[#10b981]/10'
                        : 'text-[#f87171] bg-[#ef4444]/10'
                    }`}>
                      {customer.status === 'Active' ? 'Hoạt động' : 'Bị khóa'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelected(customer)}
                        className="w-7 h-7 rounded-md bg-slate-200 dark:bg-[#1e293b] hover:bg-[#6366f1]/20 hover:text-[#818cf8] text-slate-500 dark:text-slate-500 dark:text-[#64748b] flex items-center justify-center transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => toggleBan(customer.id)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                          customer.status === 'Active'
                            ? 'bg-slate-200 dark:bg-[#1e293b] hover:bg-[#ef4444]/20 hover:text-[#f87171] text-slate-500 dark:text-slate-500 dark:text-[#64748b]'
                            : 'bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#34d399]'
                        }`}
                        title={customer.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
                      >
                        {customer.status === 'Active' ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-[13px] text-slate-600 dark:text-slate-400 dark:text-[#334155]">Không tìm thấy người dùng</div>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="w-80 bg-slate-50 dark:bg-[#0d1117] border-l border-slate-200 dark:border-[#1e293b] h-full overflow-y-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Hồ sơ tài khoản</h3>
              <button onClick={() => setSelected(null)} className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b]">
                ×
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3 ${
                  selected.status === 'Banned' ? 'bg-[#ef4444]/15 text-[#f87171]' : 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-slate-900 dark:text-white'
                }`}>
                  {selected.avatar}
                </div>
                <p className="text-[15px] font-semibold text-slate-900 dark:text-[#f1f5f9]">{selected.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">{selected.email}</p>
                
                {activeTab === 'roles' && (
                  <div className="mt-3">
                    <select
                      value={selected.role}
                      onChange={(e) => changeUserRole(selected.id, e.target.value)}
                      className={`text-[12px] font-mono font-bold px-3 py-1.5 rounded outline-none border ${
                        selected.role === 'ADMIN' ? 'bg-[#e8002d]/10 text-[#e8002d] border-[#e8002d]/20' : 'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20'
                      }`}
                    >
                      <option value="USER" className="text-black">Vai trò: USER</option>
                      <option value="ADMIN" className="text-black">Vai trò: ADMIN</option>
                    </select>
                  </div>
                )}

                <span className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-[11px] font-medium ${
                  selected.status === 'Active' ? 'text-[#34d399] bg-[#10b981]/10' : 'text-[#f87171] bg-[#ef4444]/10'
                }`}>
                  {selected.status === 'Active' ? 'Đang hoạt động' : 'Đã bị khóa'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Đơn hàng', value: selected.orders },
                  { label: 'ID', value: selected.id },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-[#111827] rounded-lg p-3">
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155]">{item.label}</p>
                    <p className="text-[12px] font-mono font-semibold text-slate-600 dark:text-[#94a3b8] mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-lg p-3">
                <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155] mb-1">Số điện thoại</p>
                <p className="text-[12px] text-slate-600 dark:text-[#94a3b8]">{selected.phone}</p>
              </div>

              <button
                onClick={() => toggleBan(selected.id)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-colors ${
                  selected.status === 'Active'
                    ? 'bg-[#ef4444]/10 text-[#f87171] hover:bg-[#ef4444]/20'
                    : 'bg-[#10b981]/10 text-[#34d399] hover:bg-[#10b981]/20'
                }`}
              >
                {selected.status === 'Active' ? (
                  <><Lock size={13} /> Khóa tài khoản</>
                ) : (
                  <><Unlock size={13} /> Mở khóa tài khoản</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
