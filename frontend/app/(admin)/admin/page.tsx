'use client';
import { useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { revenueData, brandShareData, orders } from '@/data/adminMockData';

const kpis = [
  {
    label: 'Tổng Doanh thu',
    value: '4.28 tỷ',
    sub: 'VNĐ tháng này',
    change: +18.4,
    icon: TrendingUp,
    color: '#6366f1',
    bg: '#6366f1',
  },
  {
    label: 'Đơn hàng mới',
    value: '892',
    sub: 'đơn tháng này',
    change: +12.1,
    icon: ShoppingCart,
    color: '#06b6d4',
    bg: '#06b6d4',
  },
  {
    label: 'Khách hàng',
    value: '847',
    sub: 'đã đăng ký',
    change: +8.6,
    icon: Users,
    color: '#10b981',
    bg: '#10b981',
  },
  {
    label: 'Sắp hết hàng',
    value: '7',
    sub: 'sản phẩm',
    change: -2,
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: '#f59e0b',
  },
];

const statusColors: Record<string, string> = {
  Pending: 'text-[#fbbf24] bg-[#f59e0b]/10',
  Confirmed: 'text-[#60a5fa] bg-[#3b82f6]/10',
  Shipping: 'text-[#a78bfa] bg-[#8b5cf6]/10',
  Delivered: 'text-[#34d399] bg-[#10b981]/10',
  Cancelled: 'text-[#f87171] bg-[#ef4444]/10',
};

const statusLabels: Record<string, string> = {
  Pending: 'Chờ xác nhận',
  Confirmed: 'Đã xác nhận',
  Shipping: 'Đang giao',
  Delivered: 'Đã giao',
  Cancelled: 'Đã hủy',
};

const chartTabs = ['7 ngày', '14 ngày', '1 tháng'];

const formatVND = (v: number) => {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(0) + 'M';
  return v.toLocaleString('vi-VN');
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2235] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[11px] shadow-xl">
      <p className="text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1 font-mono">{label}</p>
      <p className="text-[#818cf8] font-semibold">{formatVND(payload[0].value)} VNĐ</p>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0);
  const displayData = activeTab === 0 ? revenueData.slice(-7) : activeTab === 1 ? revenueData : revenueData;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const positive = kpi.change > 0;
          return (
            <div
              key={kpi.label}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl p-4 hover:border-slate-300 dark:border-[#334155] transition-colors group relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ background: kpi.bg }}
              />
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${kpi.bg}18` }}
                >
                  <Icon size={16} style={{ color: kpi.color }} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-mono font-semibold ${positive ? 'text-[#34d399]' : 'text-[#f87171]'}`}
                >
                  {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                  {Math.abs(kpi.change)}%
                </span>
              </div>
              <p className="text-[22px] font-bold text-slate-900 dark:text-[#f1f5f9] font-mono leading-none">{kpi.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-1">{kpi.label}</p>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155] mt-0.5 font-mono">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Doanh thu</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">Theo ngày trong tháng 7/2024</p>
            </div>
            <div className="flex gap-1">
              {chartTabs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(i)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activeTab === i
                      ? 'bg-[#6366f1]/15 text-[#818cf8]'
                      : 'text-slate-500 dark:text-slate-500 dark:text-[#475569] hover:text-slate-500 dark:text-slate-500 dark:text-[#64748b]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={displayData} margin={{ top: 0, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#334155', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatVND(v)}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#6366f1', stroke: '#818cf8', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Brand Pie */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Thị phần Thương hiệu</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">Tỷ lệ bán ra theo hãng</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={brandShareData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
              >
                {brandShareData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a2235',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v: number) => [`${v}%`, '']}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {brandShareData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{item.name}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-600 dark:text-[#94a3b8]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders by day bar + Recent orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Orders Bar */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl p-5">
          <h3 className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9] mb-1">Đơn hàng / ngày</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-4">14 ngày gần nhất</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#334155', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#334155', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: '#06b6d4' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="orders" fill="#06b6d4" radius={[3, 3, 0, 0]} opacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#1e293b]">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-900 dark:text-[#f1f5f9]">Đơn hàng gần nhất</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">{orders.length} đơn gần nhất</p>
            </div>
            <button className="text-[11px] text-[#6366f1] hover:text-[#818cf8] transition-colors">
              Xem tất cả →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#1e293b]">
                  {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái', ''].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order, i) => (
                  <tr key={order.id} className="border-b border-slate-200 dark:border-[#1e293b]/50 hover:bg-[#1a2235]/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-mono text-[#6366f1]">{order.id}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-[12px] text-slate-900 dark:text-[#f1f5f9] font-medium">{order.customer}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">{order.date}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] font-mono font-semibold text-slate-900 dark:text-[#f1f5f9]">
                        {order.total.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[9px] text-slate-500 dark:text-slate-500 dark:text-[#475569] ml-1">₫</span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button className="text-slate-600 dark:text-slate-400 dark:text-[#334155] hover:text-slate-500 dark:text-slate-500 dark:text-[#64748b] transition-colors">
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
