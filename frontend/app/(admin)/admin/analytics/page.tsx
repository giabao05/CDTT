'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueGrowth: number;
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, chartRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/revenue-chart')
      ]);
      setSummary(summaryRes.data);
      setChartData(chartRes.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-600 dark:text-slate-400">Đang tải báo cáo...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Theo dõi doanh thu, số lượng đơn hàng và tình hình kinh doanh</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign size={24} className="text-emerald-400" />
            </div>
            <span className="flex items-center text-emerald-400 text-sm font-medium">
              <TrendingUp size={16} className="mr-1" /> +{summary?.revenueGrowth}%
            </span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Tổng Doanh thu</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(summary?.totalRevenue || 0)}</h3>
        </div>

        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <ShoppingCart size={24} className="text-indigo-400" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Tổng Đơn hàng</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalOrders}</h3>
        </div>

        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users size={24} className="text-blue-400" />
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-1">Khách hàng</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalCustomers}</h3>
        </div>

        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <BarChartIcon size={32} className="text-amber-400 mb-3" />
          <h3 className="text-slate-900 dark:text-white font-medium">Báo cáo Nâng cao</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Xuất Excel / PDF đang phát triển</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Biểu đồ Doanh thu (6 tháng qua)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  cursor={{fill: '#1e293b', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Xu hướng Tăng trưởng</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#34d399' }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} dot={{ r: 4, fill: '#34d399', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
