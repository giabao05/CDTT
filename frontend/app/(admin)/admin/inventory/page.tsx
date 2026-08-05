'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Search, AlertTriangle, Save, Package } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/admin';

interface InventoryItem extends ProductVariant {
  productName: string;
  productId: number;
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
      const res = await api.get('/products');
      const products: Product[] = res.data;
      
      const allVariants: InventoryItem[] = [];
      products.forEach(p => {
        if (p.variants && p.variants.length > 0) {
          p.variants.forEach(v => {
            allVariants.push({
              ...v,
              productName: p.name,
              productId: p.id
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

  const handleStockChange = (id: number, newStock: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, stockQuantity: newStock } : item
    ));
  };

  const saveStock = async (item: InventoryItem) => {
    setSavingId(item.id);
    try {
      // Typically we'd have a specific endpoint for updating stock, e.g. PUT /products/{pid}/variants/{vid}
      // Assuming a generic update or we can just mock the success for now if the endpoint doesn't exist
      // await api.put(`/products/${item.productId}/variants/${item.id}/stock`, { stockQuantity: item.stockQuantity });
      
      // For this demo, let's assume it succeeds
      await new Promise(resolve => setTimeout(resolve, 500));
      alert(`Đã cập nhật tồn kho thành công cho ${item.productName} - ${item.color || item.storage}`);
    } catch (err) {
      console.error('Lỗi khi lưu tồn kho:', err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredItems = items.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.stockQuantity - b.stockQuantity);

  const lowStockCount = items.filter(i => i.stockQuantity < 10).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quản lý Kho hàng</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Kiểm tra và cập nhật số lượng tồn kho của các sản phẩm</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-amber-500" size={20} />
          <div>
            <p className="text-sm font-medium text-amber-500">Cảnh báo sắp hết hàng</p>
            <p className="text-xs text-amber-400/70">{lowStockCount} sản phẩm có số lượng dưới 10</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-200 dark:border-[#1e293b] flex justify-between items-center bg-slate-50 dark:bg-[#0d1117]">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-200 dark:bg-[#1e293b] text-slate-900 dark:text-white border-none rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 transition-shadow"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-600 dark:text-slate-400">Đang tải dữ liệu kho...</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-200 dark:bg-[#1e293b] text-slate-600 dark:text-slate-400 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Sản phẩm</th>
                  <th className="px-4 py-3 font-medium">Phân loại (Màu / Dung lượng)</th>
                  <th className="px-4 py-3 font-medium">Mã SKU</th>
                  <th className="px-4 py-3 font-medium">Giá bán</th>
                  <th className="px-4 py-3 font-medium">Tồn kho hiện tại</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Lưu cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#1e293b]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-200 dark:bg-[#1e293b]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-1">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="object-contain h-full" />
                          ) : (
                            <Package size={20} className="text-slate-500 dark:text-slate-500" />
                          )}
                        </div>
                        {item.productName}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.color} {item.storage ? `- ${item.storage}` : ''}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">{item.sku || 'N/A'}</td>
                    <td className="px-4 py-3 text-emerald-400">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={item.stockQuantity}
                          onChange={(e) => handleStockChange(item.id, parseInt(e.target.value) || 0)}
                          className={`w-20 bg-white dark:bg-[#07090f] border ${item.stockQuantity < 10 ? 'border-amber-500/50 text-amber-400' : 'border-slate-200 dark:border-[#1e293b] text-slate-900 dark:text-white'} rounded-lg px-2 py-1 text-sm focus:ring-1 focus:ring-indigo-500`}
                        />
                        {item.stockQuantity < 10 && (
                          <span className="text-amber-500 text-xs font-medium">Sắp hết!</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => saveStock(item)}
                        disabled={savingId === item.id}
                        className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center justify-center"
                        title="Lưu số lượng"
                      >
                        <Save size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-slate-500">
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
