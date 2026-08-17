'use client';
import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  ChevronDown,
  X,
  Upload,
  Check,
} from 'lucide-react';
import type { Product } from '@/types/admin';
import { API_BASE_URL, createProduct, deleteProduct, updateProduct } from '@/lib/api';

const brands = ['Tất cả', 'Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo'];
const statusFilters = ['Tất cả', 'In Stock', 'Low Stock', 'Out of Stock'];
const statusLabels: Record<string, string> = {
  'In Stock': 'Còn hàng',
  'Low Stock': 'Sắp hết',
  'Out of Stock': 'Hết hàng',
};
const statusColors: Record<string, string> = {
  'In Stock': 'text-[#34d399] bg-[#10b981]/10',
  'Low Stock': 'text-[#fbbf24] bg-[#f59e0b]/10',
  'Out of Stock': 'text-[#f87171] bg-[#ef4444]/10',
};

const emptyProduct: Omit<Product, 'id'> = {
  name: '', category: 'Điện thoại', brand: 'Apple', image: '', images: [], price: 0, salePrice: null,
  stock: 0, status: 'In Stock', ram: '', storage: '', color: '',
  chipset: '', screen: '', battery: '', camera: '', os: '', description: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<{name: string, slug: string}[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [brandFilter, setBrandFilter] = useState('Tất cả');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyProduct);
  const [variants, setVariants] = useState<{ color: string; colorCode?: string; imageUrl?: string; storage: string; ram: string; stock: string; price: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'variants'>('basic');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API_BASE_URL}/products?size=1000`);
        if (res.ok) {
          const data = await res.json();
          // Map backend ProductResponse to admin Product type
          const mapped = data.content.map((p: any) => ({
            id: p.id.toString(),
            name: p.name,
            category: p.category?.name || 'Khác',
            brand: p.brand?.name || 'Khác',
            image: p.thumbnail || p.images?.[0]?.imageUrl || '',
            images: p.images?.map((img: any) => img.imageUrl) || [],
            price: p.basePrice || 0,
            salePrice: p.salePrice || null,
            stock: p.variants?.reduce((acc: number, v: any) => acc + (v.stockQuantity || 0), 0) || 0,
            status: p.isActive ? 'In Stock' : 'Out of Stock',
            ram: p.specification?.ram || '',
            storage: p.specification?.storage || '',
            color: 'Đen',
            chipset: p.specification?.processor || '',
            screen: p.specification?.screenSize || '',
            battery: p.specification?.battery || '',
            camera: p.specification?.mainCamera || '',
            os: p.specification?.os || '',
            description: p.description || '',
            variants: p.variants || [],
          }));
          setProducts(mapped);
        } else {
          setError('Lỗi khi tải dữ liệu từ máy chủ (Backend trả về lỗi)');
        }
      } catch (e) {
        console.error(e);
        setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra xem Backend đã chạy chưa.');
      } finally {
        setLoading(false);
      }
    }
    
    async function loadCategories() {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        if (res.ok) {
          const data = await res.json();
          setDbCategories(data);
        }
      } catch (e) {
        console.error('Lỗi khi tải danh mục', e);
      }
    }
    
    loadProducts();
    loadCategories();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'Tất cả' || p.category === categoryFilter;
    const matchBrand = brandFilter === 'Tất cả' || p.brand === brandFilter;
    const matchStatus = statusFilter === 'Tất cả' || p.status === statusFilter;
    return matchSearch && matchCategory && matchBrand && matchStatus;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyProduct, category: dbCategories[0]?.name || '' });
    setVariants([]);
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    const { id: _id, ...rest } = p;
    setForm({
      ...rest,
      images: p.images || (p.image ? [p.image] : [])
    });
    setVariants(p.variants?.map(v => {
      let parsedColor = '#888888';
      let parsedImg = '';
      if (v.imageUrl) {
        if (v.imageUrl.includes('|')) {
          const parts = v.imageUrl.split('|');
          parsedColor = parts[0];
          parsedImg = parts[1];
        } else if (v.imageUrl.startsWith('#')) {
          parsedColor = v.imageUrl;
        } else {
          parsedImg = v.imageUrl;
        }
      }
      return { 
        id: (v as any).id,
        color: v.color || '', 
        storage: v.storage || '', 
        ram: v.ram || '',
        stock: (v.stockQuantity ?? v.stock ?? 0).toString(), 
        price: (v.price || 0).toString(),
        colorCode: parsedColor,
        imageUrl: parsedImg
      };
    }) || []);
    setActiveTab('basic');
    setShowModal(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        basePrice: form.price,
        salePrice: form.salePrice,
        thumbnail: form.image,
        category: form.category,
        brand: form.brand,
        isFeatured: false,
        isActive: form.status !== 'Out of Stock',
        specification: {
          screenSize: form.screen,
          os: form.os,
          processor: form.chipset,
          mainCamera: form.camera,
          battery: form.battery,
          ram: form.ram,
          storage: form.storage
        },
        variants: variants.map(v => ({
          id: (v as any).id,
          sku: `${form.name}-${v.color}-${v.storage}-${v.ram}`.toUpperCase().replace(/\s+/g, '-'),
          color: v.color,
          storage: v.storage,
          ram: v.ram,
          price: Number(v.price) || 0,
          stockQuantity: Number(v.stock) || 0,
          imageUrl: (v.colorCode || '#888888') + (v.imageUrl ? `|${v.imageUrl}` : ''),
          isActive: true
        })),
        images: form.images && form.images.length > 0 
          ? form.images.map((img, i) => ({ imageUrl: img, isThumbnail: i === 0, sortOrder: i }))
          : (form.image ? [{ imageUrl: form.image, isThumbnail: true, sortOrder: 0 }] : [])
      };

      if (editProduct) {
        const updatedProd = await updateProduct(editProduct.id, payload);
        if (updatedProd) {
          // Re-fetch products to get updated list from server
          const res = await fetch(`${API_BASE_URL}/products?size=1000`);
          if (res.ok) {
            const data = await res.json();
            const mapped = (data.content || []).map((p: any) => ({
              id: p.id.toString(),
              name: p.name,
              category: p.category?.name || 'Khác',
              brand: p.brand?.name || 'Khác',
              image: p.thumbnail || p.images?.[0]?.imageUrl || '',
              images: p.images?.map((img: any) => img.imageUrl) || [],
              price: p.basePrice || 0,
              salePrice: p.salePrice || null,
              stock: p.variants?.reduce((acc: number, v: any) => acc + (v.stockQuantity || 0), 0) || 0,
              status: p.isActive ? 'In Stock' : 'Out of Stock',
              ram: p.specification?.ram || '',
              storage: p.specification?.storage || '',
              color: 'Đen',
              chipset: p.specification?.processor || '',
              screen: p.specification?.screenSize || '',
              battery: p.specification?.battery || '',
              camera: p.specification?.mainCamera || '',
              os: p.specification?.os || '',
              description: p.description || '',
              variants: p.variants || [],
            }));
            setProducts(mapped);
          }
        }
      } else {
        const newProd = await createProduct(payload);
        if (newProd) {
          // Re-fetch products to get updated list from server
          const res = await fetch(`${API_BASE_URL}/products?size=1000`);
          if (res.ok) {
            const data = await res.json();
            const mapped = (data.content || []).map((p: any) => ({
              id: p.id.toString(),
              name: p.name,
              category: p.category?.name || 'Khác',
              brand: p.brand?.name || 'Khác',
              image: p.thumbnail || p.images?.[0]?.imageUrl || '',
              price: p.basePrice || 0,
              salePrice: p.salePrice || null,
              stock: p.variants?.reduce((acc: number, v: any) => acc + (v.stockQuantity || 0), 0) || 0,
              status: p.isActive ? 'In Stock' : 'Out of Stock',
              ram: p.specification?.ram || '',
              storage: p.specification?.storage || '',
              color: 'Đen',
              chipset: p.specification?.processor || '',
              screen: p.specification?.screenSize || '',
              battery: p.specification?.battery || '',
              camera: p.specification?.mainCamera || '',
              os: p.specification?.os || '',
              description: p.description || '',
              variants: p.variants || [],
            }));
            setProducts(mapped);
          }
        }
      }
      setShowModal(false);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setDeleteId(null);
    }
  };

  const update = (field: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="p-6 animate-fadeIn">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-52">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 dark:text-[#475569]" />
          <input
            type="text"
            placeholder="Tìm sản phẩm, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg pl-8 pr-4 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] focus:outline-none focus:border-[#6366f1]/50"
        >
          <option value="Tất cả">Danh mục (Tất cả)</option>
          {dbCategories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] focus:outline-none focus:border-[#6366f1]/50"
        >
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] focus:outline-none focus:border-[#6366f1]/50"
        >
          {statusFilters.map((s) => <option key={s} value={s}>{s === 'Tất cả' ? 'Tất cả trạng thái' : statusLabels[s]}</option>)}
        </select>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6366f1] hover:bg-[#4f46e5] rounded-lg text-[12px] font-medium text-white transition-colors ml-auto"
        >
          <Plus size={14} />
          Thêm sản phẩm
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-5 text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">
        <span className="font-mono">{filtered.length} sản phẩm</span>
        <span>·</span>
        <span className="text-[#34d399]">{filtered.filter((p) => p.status === 'In Stock').length} còn hàng</span>
        <span>·</span>
        <span className="text-[#fbbf24]">{filtered.filter((p) => p.status === 'Low Stock').length} sắp hết</span>
        <span>·</span>
        <span className="text-[#f87171]">{filtered.filter((p) => p.status === 'Out of Stock').length} hết hàng</span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden min-h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-zinc-500">
            Đang tải dữ liệu sản phẩm...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px] text-[#ef4444] px-4 text-center">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e293b]">
                {['Sản phẩm', 'Danh mục / Hãng', 'Phân loại', 'Giá bán', 'Tồn kho', 'Trạng thái', 'Hành động'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-medium text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase tracking-wider font-mono whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-200 dark:border-[#1e293b]/40 hover:bg-[#1a2235]/40 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-[#1e293b] overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[12px] font-medium text-slate-900 dark:text-[#f1f5f9]">{product.name}</p>
                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155]">{product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-50 dark:bg-[#6366f1]/10 text-indigo-600 dark:text-[#818cf8] border border-indigo-100 dark:border-[#6366f1]/20">{product.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">{product.brand}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#64748b]">{product.ram} / {product.storage}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155]">{product.color}</p>
                  </td>
                  <td className="px-4 py-3">
                    {product.salePrice ? (
                      <div>
                        <p className="text-[12px] font-mono font-semibold text-[#34d399]">
                          {product.salePrice.toLocaleString('vi-VN')}₫
                        </p>
                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] line-through">
                          {product.price.toLocaleString('vi-VN')}₫
                        </p>
                      </div>
                    ) : (
                      <p className="text-[12px] font-mono font-semibold text-slate-900 dark:text-[#f1f5f9]">
                        {product.price.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[12px] font-mono font-semibold ${product.stock === 0 ? 'text-[#f87171]' : product.stock < 10 ? 'text-[#fbbf24]' : 'text-slate-600 dark:text-[#94a3b8]'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[product.status]}`}>
                      {statusLabels[product.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(product)}
                        className="w-7 h-7 rounded-md bg-slate-200 dark:bg-[#1e293b] hover:bg-[#6366f1]/20 hover:text-[#818cf8] text-slate-500 dark:text-slate-500 dark:text-[#64748b] flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteId(product.id)}
                        className="w-7 h-7 rounded-md bg-slate-200 dark:bg-[#1e293b] hover:bg-[#ef4444]/20 hover:text-[#f87171] text-slate-500 dark:text-slate-500 dark:text-[#64748b] flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-[13px] text-slate-600 dark:text-slate-400 dark:text-[#334155]">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-2xl p-6 w-full max-w-sm animate-fadeIn">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-[#f1f5f9] mb-2">Xóa sản phẩm?</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-5">Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-slate-200 dark:bg-[#1e293b] text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] rounded-lg hover:bg-[#334155] transition-colors">
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-[#ef4444] text-[12px] text-slate-900 dark:text-white rounded-lg hover:bg-[#dc2626] transition-colors">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-50 dark:bg-[#0d1117] border border-slate-200 dark:border-[#1e293b] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fadeIn">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#1e293b]">
              <div>
                <h2 className="text-[15px] font-semibold text-slate-900 dark:text-[#f1f5f9]">
                  {editProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569] mt-0.5">
                  {editProduct ? editProduct.name : 'Điền đầy đủ thông tin sản phẩm'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-[#1e293b] flex items-center justify-center text-slate-500 dark:text-slate-500 dark:text-[#64748b] hover:text-slate-600 dark:text-[#94a3b8] transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 py-3 border-b border-slate-200 dark:border-[#1e293b]">
              {(['basic', 'specs', 'variants'] as const).map((tab) => {
                const labels = { basic: 'Thông tin cơ bản', specs: 'Thông số kỹ thuật', variants: 'Biến thể & Hình ảnh' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTab === tab ? 'bg-[#6366f1]/15 text-[#818cf8]' : 'text-slate-500 dark:text-slate-500 dark:text-[#475569] hover:text-slate-500 dark:text-slate-500 dark:text-[#64748b]'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {activeTab === 'basic' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Tên sản phẩm *</label>
                      <input
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        placeholder="iPhone 15 Pro Max 256GB Titanium"
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Danh mục</label>
                      <select
                        value={form.category}
                        onChange={(e) => update('category', e.target.value)}
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50"
                      >
                        {dbCategories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Thương hiệu</label>
                      <select
                        value={form.brand}
                        onChange={(e) => update('brand', e.target.value)}
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50"
                      >
                        {brands.slice(1).map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Trạng thái</label>
                      <select
                        value={form.status}
                        onChange={(e) => update('status', e.target.value as Product['status'])}
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-600 dark:text-[#94a3b8] focus:outline-none focus:border-[#6366f1]/50"
                      >
                        <option value="In Stock">Còn hàng</option>
                        <option value="Low Stock">Sắp hết</option>
                        <option value="Out of Stock">Hết hàng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Giá gốc (₫)</label>
                      <input
                        type="number"
                        value={form.price || ''}
                        onChange={(e) => update('price', Number(e.target.value))}
                        placeholder="34990000"
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Giá khuyến mãi (₫)</label>
                      <input
                        type="number"
                        value={form.salePrice ?? ''}
                        onChange={(e) => update('salePrice', e.target.value ? Number(e.target.value) : null)}
                        placeholder="Để trống nếu không KM"
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Số lượng tồn kho</label>
                      <input
                        type="number"
                        value={form.stock || ''}
                        onChange={(e) => update('stock', Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Màu sắc</label>
                      <input
                        value={form.color}
                        onChange={(e) => update('color', e.target.value)}
                        placeholder="Titanium Black"
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Mô tả sản phẩm</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => update('description', e.target.value)}
                        rows={3}
                        placeholder="Mô tả chi tiết về sản phẩm..."
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50 resize-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'chipset', label: 'Chipset / CPU', placeholder: 'Apple A17 Pro' },
                    { key: 'ram', label: 'RAM', placeholder: '8GB' },
                    { key: 'storage', label: 'Bộ nhớ trong', placeholder: '256GB' },
                    { key: 'screen', label: 'Màn hình', placeholder: '6.7" Super Retina XDR OLED' },
                    { key: 'battery', label: 'Pin', placeholder: '4422 mAh' },
                    { key: 'camera', label: 'Camera', placeholder: '48MP + 12MP + 12MP' },
                    { key: 'os', label: 'Hệ điều hành', placeholder: 'iOS 17' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className={key === 'screen' || key === 'camera' ? 'col-span-2' : ''}>
                      <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">{label}</label>
                      <input
                        value={form[key as keyof typeof form] as string}
                        onChange={(e) => update(key as keyof typeof form, e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="space-y-4">
                  {/* Image upload */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Hình ảnh sản phẩm (có thể chọn nhiều ảnh)</label>
                    <label className="border-2 border-dashed border-slate-200 dark:border-[#1e293b] rounded-xl p-8 text-center hover:border-slate-300 dark:border-[#334155] transition-colors cursor-pointer group block relative overflow-hidden">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, image/webp"
                        multiple
                        className="hidden" 
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            let loadedCount = 0;
                            const newImages = [...(form.images || [])];
                            
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                newImages.push(reader.result as string);
                                loadedCount++;
                                if (loadedCount === files.length) {
                                  update('images', newImages);
                                  if (!form.image) update('image', newImages[0]);
                                }
                              };
                              reader.readAsDataURL(file);
                            });
                          }
                        }}
                      />
                      <Upload size={24} className="mx-auto text-slate-600 dark:text-slate-400 dark:text-[#334155] group-hover:text-slate-500 dark:text-slate-500 dark:text-[#475569] transition-colors mb-2" />
                      <p className="text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">Kéo thả hoặc <span className="text-[#6366f1]">chọn các file</span></p>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-[#334155] mt-1">PNG, JPG, WEBP tối đa 5MB</p>
                    </label>

                    {/* Previews */}
                    {(form.images && form.images.length > 0) ? (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {form.images.map((img, idx) => (
                          <div key={idx} className="relative group w-20 h-20 rounded-lg border border-slate-200 dark:border-[#1e293b] overflow-hidden bg-white/5">
                            <img src={img} alt="Preview" className="w-full h-full object-contain" />
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                const newImages = form.images.filter((_, i) => i !== idx);
                                update('images', newImages);
                                if (form.image === img) update('image', newImages[0] || '');
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (form.image && (form.image.startsWith('data:image') || form.image.startsWith('http'))) && (
                      <div className="mt-4 relative group w-20 h-20 rounded-lg border border-slate-200 dark:border-[#1e293b] overflow-hidden bg-white/5">
                        <img src={form.image} alt="Preview" className="w-full h-full object-contain" />
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            update('image', '');
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  {/* URL image */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569] mb-1.5">Hoặc thêm URL hình ảnh</label>
                    <div className="flex gap-2">
                      <input
                        id="url-input"
                        placeholder="https://..."
                        className="flex-1 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-lg px-3 py-2.5 text-[12px] text-slate-900 dark:text-[#f1f5f9] placeholder-[#334155] focus:outline-none focus:border-[#6366f1]/50"
                      />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const input = document.getElementById('url-input') as HTMLInputElement;
                          const url = input.value.trim();
                          if (url) {
                            const newImages = [...(form.images || []), url];
                            update('images', newImages);
                            if (!form.image) update('image', url);
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2.5 bg-slate-200 dark:bg-[#1e293b] text-slate-900 dark:text-[#f1f5f9] text-[12px] rounded-lg hover:bg-[#334155]"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                  {/* Variants table */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-[#475569]">Biến thể sản phẩm</label>
                      <button onClick={() => setVariants([...variants, { color: '', colorCode: '#888888', storage: '', ram: '', stock: '', price: '' }])} className="flex items-center gap-1 text-[11px] text-[#6366f1] hover:text-[#818cf8]">
                        <Plus size={11} /> Thêm biến thể
                      </button>
                    </div>
                    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1e293b] rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-[#1e293b]">
                            {['Màu sắc', 'Mã màu', 'Ảnh phân loại', 'Dung lượng', 'RAM', 'Kho', 'Giá', ''].map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-[10px] font-mono text-slate-600 dark:text-slate-400 dark:text-[#334155] uppercase">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {variants.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-4 text-center text-[11px] text-slate-500 dark:text-slate-500 dark:text-[#475569]">
                                Chưa có biến thể nào. Hãy thêm biến thể.
                              </td>
                            </tr>
                          ) : variants.map((v, i) => (
                            <tr key={i} className="border-b border-slate-200 dark:border-[#1e293b]/40">
                              <td className="px-3 py-2">
                                <input
                                  value={v.color}
                                  onChange={(e) => {
                                    const newV = [...variants];
                                    newV[i] = { ...newV[i], color: e.target.value };
                                    setVariants(newV);
                                  }}
                                  placeholder="Màu..."
                                  className="w-full bg-transparent border border-slate-200 dark:border-[#1e293b] rounded px-2 py-1 text-[11px] text-slate-900 dark:text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]/50"
                                />
                              </td>
                              <td className="px-3 py-2 w-16">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="color"
                                    value={v.colorCode || '#888888'}
                                    onChange={(e) => {
                                      const newV = [...variants];
                                      newV[i] = { ...newV[i], colorCode: e.target.value };
                                      setVariants(newV);
                                    }}
                                    className="w-8 h-7 rounded cursor-pointer border border-slate-200 dark:border-[#1e293b] bg-transparent p-0.5"
                                    title="Chọn mã màu"
                                  />
                                </div>
                              </td>
                              <td className="px-3 py-2 w-16">
                                <label className="flex items-center justify-center w-9 h-9 border border-dashed border-slate-300 dark:border-slate-600 rounded cursor-pointer overflow-hidden group hover:border-indigo-500 transition-colors">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const newV = [...variants];
                                          newV[i] = { ...newV[i], imageUrl: reader.result as string };
                                          setVariants(newV);
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  {v.imageUrl && !v.imageUrl.startsWith('#') ? (
                                    <img src={v.imageUrl.startsWith('http') ? v.imageUrl : (v.imageUrl.startsWith('data:image') ? v.imageUrl : `http://localhost:8080/uploads/${v.imageUrl}`)} className="w-full h-full object-cover" alt="Variant" />
                                  ) : (
                                    <Plus size={14} className="text-slate-400 group-hover:text-indigo-500" />
                                  )}
                                </label>
                              </td>
                              <td className="px-3 py-2">
                              <input
                                value={v.storage}
                                onChange={(e) => {
                                  const newV = [...variants];
                                  newV[i] = { ...newV[i], storage: e.target.value };
                                  setVariants(newV);
                                }}
                                  placeholder="VD: 256GB"
                                  className="w-full bg-transparent border border-slate-200 dark:border-[#1e293b] rounded px-2 py-1 text-[11px] font-mono text-slate-900 dark:text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]/50"
                                />
                              </td>
                              <td className="px-3 py-2">
                              <input
                                value={v.ram}
                                onChange={(e) => {
                                  const newV = [...variants];
                                  newV[i] = { ...newV[i], ram: e.target.value };
                                  setVariants(newV);
                                }}
                                  placeholder="VD: 8GB"
                                  className="w-full bg-transparent border border-slate-200 dark:border-[#1e293b] rounded px-2 py-1 text-[11px] font-mono text-slate-900 dark:text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]/50"
                                />
                              </td>
                              <td className="px-3 py-2 w-20">
                              <input
                                type="text"
                                value={v.stock}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const newV = [...variants];
                                  newV[i] = { ...newV[i], stock: val as any };
                                  setVariants(newV);
                                }}
                                className="w-full bg-transparent border border-slate-200 dark:border-[#1e293b] rounded px-2 py-1 text-[11px] font-mono text-slate-900 dark:text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]/50"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={v.price}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  const newV = [...variants];
                                  newV[i] = { ...newV[i], price: val as any };
                                  setVariants(newV);
                                }}
                                  placeholder="Giá (₫)"
                                  className="w-full bg-transparent border border-slate-200 dark:border-[#1e293b] rounded px-2 py-1 text-[11px] font-mono text-slate-900 dark:text-[#f1f5f9] focus:outline-none focus:border-[#6366f1]/50"
                                />
                              </td>
                              <td className="px-3 py-2">
                                <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-[#ef4444] hover:text-[#f87171]">
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-[#1e293b]">
              <div className="flex gap-1">
                {(['basic', 'specs', 'variants'] as const).map((tab, i) => (
                  <div key={tab} className={`w-1.5 h-1.5 rounded-full transition-colors ${activeTab === tab ? 'bg-[#6366f1]' : 'bg-slate-200 dark:bg-[#1e293b]'}`} />
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-[#1e293b] text-[12px] text-slate-500 dark:text-slate-500 dark:text-[#64748b] rounded-lg hover:bg-[#334155] transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] text-[12px] text-white rounded-lg transition-colors"
                >
                  <Check size={13} />
                  {editProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
