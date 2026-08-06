'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart,
  DollarSign,
  Download,
  Calendar,
  MoreHorizontal,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Image from 'next/image';

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  revenueGrowth: number;
  productsSold: number;
}

const COLORS = ['#6366f1', '#3b82f6', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30 ngày qua');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateFilter]); // Re-fetch when date filter changes

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would pass the dateFilter to the API here
      const [summaryRes, chartRes, topProductsRes, categoryRes] = await Promise.all([
        api.get('/analytics/summary'),
        api.get('/analytics/revenue-chart'),
        api.get('/analytics/top-products'),
        api.get('/analytics/category-share')
      ]);
      setSummary(summaryRes.data);
      setChartData(chartRes.data);
      setTopProducts(topProductsRes.data);
      
      // Calculate percentages for category share
      const rawCategoryData = categoryRes.data || [];
      const totalCategoryValue = rawCategoryData.reduce((acc: number, curr: any) => acc + curr.value, 0);
      const processedCategoryData = rawCategoryData.map((c: any) => ({
        name: c.name || 'Khác',
        value: totalCategoryValue > 0 ? Number(((c.value / totalCategoryValue) * 100).toFixed(1)) : 0
      }));
      setCategoryData(processedCategoryData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleExportReport = () => {
    // Basic CSV Export implementation
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // \uFEFF is for UTF-8 BOM to support Vietnamese characters
    
    // Summary Section
    csvContent += "BÁO CÁO TỔNG QUAN\n";
    csvContent += `Tổng Doanh Thu,${summary?.totalRevenue || 0}\n`;
    csvContent += `Tổng Đơn Hàng,${summary?.totalOrders || 0}\n`;
    csvContent += `Khách Hàng Mới,${summary?.totalCustomers || 0}\n\n`;
    
    // Top Products Section
    csvContent += "SẢN PHẨM BÁN CHẠY\n";
    csvContent += "ID,Tên Sản Phẩm,Danh Mục,Đã Bán,Doanh Thu\n";
    topProducts.forEach(p => {
      csvContent += `${p.id},"${p.name}","${p.category}",${p.sales},${p.revenue}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BaoCao_KinhDoanh_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterOptions = ['Hôm nay', '7 ngày qua', '30 ngày qua', 'Tháng này', 'Năm nay'];

  if (isLoading && !summary) {
    return (
      <div className="p-8 flex justify-center items-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 relative">
      {isLoading && summary && (
        <div className="absolute inset-0 bg-white/50 dark:bg-[#0d1117]/50 backdrop-blur-sm z-50 flex justify-center items-center rounded-xl">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-40">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Tổng quan về tình hình kinh doanh và tăng trưởng của cửa hàng.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dropdown Date Filter */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <Calendar size={16} />
              <span>{dateFilter}</span>
            </button>
            
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-[#1e293b] rounded-xl shadow-lg z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {filterOptions.map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setDateFilter(option);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${dateFilter === option ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Export Button */}
          <button 
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-indigo-200 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0d1117]"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
            <span className="flex items-center text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
              <TrendingUp size={14} className="mr-1" /> +{summary?.revenueGrowth}%
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Tổng Doanh Thu</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight relative z-10">{formatCurrency(summary?.totalRevenue || 0)}</h3>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <ShoppingCart size={20} />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Tổng Đơn Hàng</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight relative z-10">{summary?.totalOrders}</h3>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={20} />
            </div>
            <span className="flex items-center text-blue-600 dark:text-blue-400 text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">
              <TrendingUp size={14} className="mr-1" /> +8.2%
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Khách Hàng Mới</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight relative z-10">{summary?.totalCustomers}</h3>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-5 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Package size={20} />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 relative z-10">Sản phẩm đã bán</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight relative z-10">{summary?.productsSold || 0}</h3>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Doanh thu & Tăng trưởng</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thống kê 6 tháng gần nhất</p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value / 1000000}M`}
                  dx={-10}
                />
                <RechartsTooltip 
                  cursor={{ stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1, strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                  formatter={(value: number) => [formatCurrency(value), 'Doanh thu']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenueArea)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device/Category Chart */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Doanh thu theo danh mục</h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center">
            {categoryData.length > 0 ? (
              <>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value}%`, 'Tỷ lệ']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full mt-6 space-y-3 px-2">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{category.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sản phẩm bán chạy</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Các sản phẩm có doanh thu cao nhất tháng này</p>
          </div>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-colors hover:bg-indigo-100 dark:hover:bg-indigo-500/20">
            Xem tất cả <ArrowUpRight size={16} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e293b]">
                <th className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 pl-2">Sản phẩm</th>
                <th className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Danh mục</th>
                <th className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400">Đã bán</th>
                <th className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 text-right pr-2">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]/50">
              {topProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-white border border-slate-200 dark:border-[#1e293b] shrink-0 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors">
                        <Image src={product.image} alt={product.name} fill className="object-cover p-1" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{product.name}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">ID: #{product.id.toString().padStart(5, '0')}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-[#1e293b]">
                      {product.category}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} className="text-emerald-500" />
                      <span className="font-semibold text-slate-900 dark:text-white">{product.sales}</span>
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium text-sm text-slate-900 dark:text-white pr-2">
                    {formatCurrency(product.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

