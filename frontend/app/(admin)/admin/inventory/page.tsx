'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Search, AlertTriangle, Save, Package } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/admin';

interface InventoryItem extends ProductVariant {
  productName: string;
  productId: number;
  productThumbnail?: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/products?size=1000');
      const products: Product[] = res.data.content || [];
      
      const allVariants: InventoryItem[] = [];
      products.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach(v => {
            allVariants.push({
              ...v,
              productName: p.name,
              productId: p.id,
              productThumbnail: p.thumbnail
            });
          });
        }
      });
      
      setItems(allVariants);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockChange = (id: number, newStock: number | string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, stockQuantity: newStock as any } : item
    ));
  };

  const saveStock = async (item: InventoryItem) => {
    setSavingId(item.id);
    try {
      const stock = typeof item.stockQuantity === 'number' ? item.stockQuantity : parseInt(item.stockQuantity as any) || 0;
      await api.put(`/products/variants/${item.id}/stock`, { stockQuantity: stock });
      // Update local state to reflect parsed number
      handleStockChange(item.id, stock);
      alert(`Đã cập nhật tồn kho thành công cho ${item.productName} - ${item.color || item.storage}`);
    } catch (err) {
      console.error('Lỗi khi lưu tồn kho:', err);
      alert('Đã xảy ra lỗi khi lưu số lượng tồn kho.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredItems = items.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.stockQuantity - b.stockQuantity);

  const lowStockCount = items.filter(i => i.stockQuantity < 10).length;

  const getImageUrl = (url: string | undefined) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    if (url.startsWith('#')) return null; // Ignore color codes
    return `http://localhost:8080/uploads/${url}`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Quản lý Kho hàng</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kiểm tra và cập nhật số lượng tồn kho của các sản phẩm</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="bg-amber-100 dark:bg-amber-500/20 p-2 rounded-lg">
            <AlertTriangle className="text-amber-600 dark:text-amber-500" size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-500">Cảnh báo sắp hết hàng</p>
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400/70">{lowStockCount} sản phẩm có số lượng dưới 10</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-160px)]">
        <div className="p-5 border-b border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1117]">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#1e293b]/50 text-slate-900 dark:text-white border border-slate-200 dark:border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 dark:bg-[#1e293b]/30 text-slate-500 dark:text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                  <th className="px-6 py-4 font-semibold">Phân loại</th>
                  <th className="px-6 py-4 font-semibold">Mã SKU</th>
                  <th className="px-6 py-4 font-semibold">Giá bán</th>
                  <th className="px-6 py-4 font-semibold">Tồn kho hiện tại</th>
                  <th className="px-6 py-4 font-semibold text-right">Lưu cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]/50">
                {filteredItems.map(item => {
                  const displayImage = getImageUrl(item.imageUrl) || getImageUrl(item.productThumbnail);
                  return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-[#1e293b] flex items-center justify-center p-1 overflow-hidden group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors shrink-0">
                          {displayImage ? (
                            <img src={displayImage} alt={item.productName} className="object-cover w-full h-full rounded-lg" />
                          ) : (
                            <Package size={20} className="text-slate-400 dark:text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.productName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Variant ID: #{item.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-[#1e293b]">
                        {item.color} {item.storage ? `- ${item.storage}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400">{item.sku || 'N/A'}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="0"
                          value={item.stockQuantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleStockChange(item.id, val === '' ? '' : parseInt(val));
                          }}
                          className={`w-24 bg-white dark:bg-[#07090f] border ${typeof item.stockQuantity === 'number' && item.stockQuantity < 10 ? 'border-amber-400 dark:border-amber-500/50 text-amber-600 dark:text-amber-400 focus:ring-amber-500' : 'border-slate-300 dark:border-[#1e293b] text-slate-900 dark:text-white focus:ring-indigo-500'} rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-opacity-50 transition-shadow outline-none`}
                        />
                        {typeof item.stockQuantity === 'number' && item.stockQuantity < 10 && (
                          <span className="text-amber-600 dark:text-amber-500 text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">Sắp hết!</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => saveStock(item)}
                        disabled={savingId === item.id}
                        className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-sm hover:shadow focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#0d1117] outline-none"
                        title="Lưu số lượng"
                      >
                        {savingId === item.id ? (
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Save size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                  );
                })}
                {filteredItems.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      Không tìm thấy phân loại sản phẩm nào.
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
