
'use client';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Check, Search, ChevronLeft, ChevronRight, Camera, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import type { Brand, FilterState, Product } from '@/types';
import { fetchProducts, fetchCategories, fetchBrands } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import LoadingScreen from '@/components/LoadingScreen';


const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: 'Dưới 5 triệu', range: [0, 5000000] },
  { label: '5 – 10 triệu', range: [5000000, 10000000] },
  { label: '10 – 20 triệu', range: [10000000, 20000000] },
  { label: '20 – 30 triệu', range: [20000000, 30000000] },
  { label: 'Trên 30 triệu', range: [30000000, Infinity] },
];

const DEFAULT_FILTER: FilterState = {
  categories: [],
  brands: [],
  priceRange: [0, Infinity],
  storages: [],
  rams: [],
  inStockOnly: false,
  sortBy: 'popular',
};



function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-zinc-100 py-5 first:pt-2 last:border-0">
      <button
        className="flex items-center justify-between w-full mb-4 text-left group"
        onClick={() => setOpen(!open)}
      >
        <span className="font-display font-800 text-[11px] sm:text-xs tracking-widest uppercase text-[#0A0A0A] group-hover:text-[#E8002D] transition-colors">
          {title}
        </span>
        <div className={`w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center transition-all duration-300 group-hover:bg-red-50 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown size={14} className={`transition-colors ${open ? 'text-[#0A0A0A]' : 'text-zinc-400 group-hover:text-[#E8002D]'}`} />
        </div>
      </button>
      <div className={`transition-all duration-300 overflow-hidden ${open ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pb-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function CheckItem({
  label,
  checked,
  onToggle,
  count,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-2">
      <div
        onClick={onToggle}
        className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all duration-300 flex-shrink-0 shadow-sm ${checked
            ? 'bg-gradient-to-br from-[#0A0A0A] to-zinc-800 border-[#0A0A0A] shadow-[0_2px_8px_rgba(0,0,0,0.2)] scale-110'
            : 'bg-white border-zinc-200 group-hover:border-zinc-400 group-hover:bg-zinc-50'
          }`}
      >
        <Check
          size={12}
          className={`transition-all duration-300 ${checked ? 'text-white opacity-100 scale-100' : 'text-transparent opacity-0 scale-50'}`}
          strokeWidth={3}
        />
      </div>
      <span
        className={`text-[13px] sm:text-sm font-body transition-colors duration-300 ${checked ? 'text-[#0A0A0A] font-700' : 'text-zinc-600 group-hover:text-[#0A0A0A]'
          }`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className={`ml-auto text-[11px] font-mono-data px-2 py-0.5 rounded-full transition-colors ${checked ? 'bg-zinc-100 text-[#0A0A0A]' : 'bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100 group-hover:text-zinc-500'
          }`}>
          {count}
        </span>
      )}
    </label>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') as Brand | null;

  const [products, setProducts] = useState<Product[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchProducts(undefined, undefined, 0, 100),
      fetchCategories(),
      fetchBrands()
    ]).then(([productsData, categoriesData, brandsData]) => {
      setProducts(productsData.products);
      setAvailableCategories(categoriesData.map(c => c.name));
      setAvailableBrands(brandsData.map(b => b.name));
      setLoading(false);
    });
  }, []);

  const [filter, setFilter] = useState<FilterState>({
    ...DEFAULT_FILTER,
    categories: [],
    brands: initialBrand ? [initialBrand] : [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset page to 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64data = reader.result;
      setIsAnalyzing(true);
      try {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64data }),
        });
        const data = await res.json();
        if (data.modelName && data.modelName.toLowerCase() !== 'unknown') {
          setSearchQuery(data.modelName);
        } else {
          alert('Không nhận diện được điện thoại trong ảnh. ' + (data.error ? `Lỗi: ${data.error}` : 'Vui lòng thử ảnh khác rõ nét hơn.'));
        }
      } catch (err) {
        console.error('Lỗi phân tích ảnh:', err);
        alert('Có lỗi xảy ra khi phân tích ảnh.');
      } finally {
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
  };



  const availableStorages = useMemo(() => {
    const s = new Set<string>();
    products.forEach(p => p.variants?.forEach(v => { if (v.storage) s.add(v.storage); }));
    return Array.from(s).sort();
  }, [products]);

  const availableRams = useMemo(() => {
    const r = new Set<string>();
    products.forEach(p => p.variants?.forEach(v => { if (v.ram) r.add(v.ram); }));
    return Array.from(r).sort();
  }, [products]);

  const toggleCategory = (category: string) =>
    setFilter(f => ({
      ...f,
      categories: f.categories.includes(category) ? f.categories.filter(c => c !== category) : [...f.categories, category],
    }));

  const toggleBrand = (brand: Brand) =>
    setFilter(f => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter(b => b !== brand) : [...f.brands, brand],
    }));

  const toggleStorage = (s: string) =>
    setFilter(f => ({
      ...f,
      storages: f.storages.includes(s) ? f.storages.filter(x => x !== s) : [...f.storages, s],
    }));

  const toggleRam = (r: string) =>
    setFilter(f => ({
      ...f,
      rams: f.rams.includes(r) ? f.rams.filter(x => x !== r) : [...f.rams, r],
    }));

  const setPriceRange = (range: [number, number]) =>
    setFilter(f => ({ ...f, priceRange: range }));

  const clearFilters = () => setFilter(DEFAULT_FILTER);

  const activeFilterCount =
    filter.categories.length +
    filter.brands.length +
    filter.storages.length +
    filter.rams.length +
    (filter.inStockOnly ? 1 : 0) +
    (filter.priceRange[0] > 0 || filter.priceRange[1] < Infinity ? 1 : 0);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }
    if (filter.categories.length) list = list.filter(p => filter.categories.includes(p.category));
    if (filter.brands.length) list = list.filter(p => filter.brands.includes(p.brand));
    if (filter.inStockOnly) list = list.filter(p => p.inStock);
    if (filter.storages.length) {
      list = list.filter(p => p.variants.some(v => filter.storages.includes(v.storage)));
    }
    if (filter.rams.length) {
      list = list.filter(p => p.variants.some(v => filter.rams.includes(v.ram)));
    }
    list = list.filter(p => {
      const price = p.baseSalePrice ?? p.basePrice;
      return price >= filter.priceRange[0] && price <= filter.priceRange[1];
    });

    switch (filter.sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.baseSalePrice ?? a.basePrice) - (b.baseSalePrice ?? b.basePrice));
      case 'price-desc':
        return list.sort((a, b) => (b.baseSalePrice ?? b.basePrice) - (a.baseSalePrice ?? a.basePrice));
      case 'newest':
        return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      default:
        return list.sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [filter, products, searchQuery]);

  const renderSidebarContent = () => (
    <div className="space-y-1">
      <div className="pb-5 border-b border-zinc-100 mb-2">
        <div className="relative group">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-body focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]/10 focus:border-[#0A0A0A] transition-all duration-300 placeholder:text-zinc-400"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#0A0A0A] transition-colors pointer-events-none" />
          
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            {isAnalyzing ? (
              <Loader2 size={16} className="text-zinc-400 animate-spin" />
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-zinc-400 hover:text-[#E8002D] transition-colors"
                title="Tìm kiếm bằng hình ảnh"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
      <FilterSection title="Danh mục">
        {availableCategories.map(category => (
          <CheckItem
            key={category}
            label={category}
            checked={filter.categories.includes(category)}
            onToggle={() => toggleCategory(category)}
            count={products.filter(p => p.category === category).length}
          />
        ))}
      </FilterSection>
      <FilterSection title="Thương hiệu">
        {availableBrands.map(brand => (
          <CheckItem
            key={brand}
            label={brand}
            checked={filter.brands.includes(brand)}
            onToggle={() => toggleBrand(brand)}
            count={products.filter(p => p.brand === brand).length}
          />
        ))}
      </FilterSection>

      <FilterSection title="Mức giá">
        {PRICE_RANGES.map(({ label, range }) => (
          <CheckItem
            key={label}
            label={label}
            checked={filter.priceRange[0] === range[0] && filter.priceRange[1] === range[1]}
            onToggle={() =>
              setPriceRange(
                filter.priceRange[0] === range[0] && filter.priceRange[1] === range[1]
                  ? [0, Infinity]
                  : range
              )
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Dung lượng lưu trữ">
        <div className="flex flex-wrap gap-2">
          {availableStorages.map(s => (
            <button
              key={s}
              onClick={() => toggleStorage(s)}
              className={`px-3.5 py-1.5 text-xs font-mono-data rounded-xl border transition-all duration-300 ${filter.storages.includes(s)
                  ? 'bg-gradient-to-br from-[#0A0A0A] to-zinc-800 text-white border-[#0A0A0A] shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-105'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 hover:text-[#0A0A0A]'
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="RAM">
        <div className="flex flex-wrap gap-2">
          {availableRams.map(r => (
            <button
              key={r}
              onClick={() => toggleRam(r)}
              className={`px-3.5 py-1.5 text-xs font-mono-data rounded-xl border transition-all duration-300 ${filter.rams.includes(r)
                  ? 'bg-gradient-to-br from-[#0A0A0A] to-zinc-800 text-white border-[#0A0A0A] shadow-[0_4px_12px_rgba(0,0,0,0.15)] scale-105'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 hover:text-[#0A0A0A]'
                }`}
            >
              {r}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Tình trạng">
        <CheckItem
          label="Chỉ sản phẩm còn hàng"
          checked={filter.inStockOnly}
          onToggle={() => setFilter(f => ({ ...f, inStockOnly: !f.inStockOnly }))}
        />
      </FilterSection>
    </div>
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400 font-body mb-6">
          <button onClick={() => router.push('/')} className="hover:text-[#E8002D]">
            Trang chủ
          </button>
          <span>/</span>
          <span className="text-[#0A0A0A] font-500">
            {filter.brands.length === 1 ? filter.brands[0] : 'Tất cả điện thoại'}
          </span>
        </nav>

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-800 text-3xl text-[#0A0A0A] tracking-tight">
              {filter.brands.length === 1 ? `${filter.brands[0]}` : 'Tất cả điện thoại'}
            </h1>
            <p className="text-sm text-zinc-500 font-body mt-1">
              Hiển thị <span className="font-600 text-[#0A0A0A]">{filtered.length}</span> sản phẩm
            </p>
          </div>

          {/* Sort + filter toggle row */}
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-zinc-200 text-xs font-display font-800 tracking-wider uppercase hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <SlidersHorizontal size={14} />
              Lọc
              {activeFilterCount > 0 && (
                <span className="bg-[#E8002D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-800 shadow-md">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative group">
              <select
                value={filter.sortBy}
                onChange={e => setFilter(f => ({ ...f, sortBy: e.target.value as FilterState['sortBy'] }))}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-display font-700 text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] cursor-pointer hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none group-hover:text-[#0A0A0A] transition-colors" />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-6">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-body mr-1">Đang lọc:</span>
            {filter.categories.map(c => (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-display font-700 hover:border-zinc-400 hover:shadow-sm transition-all"
              >
                {c} <X size={12} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
            {filter.brands.map(b => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-display font-700 hover:border-zinc-400 hover:shadow-sm transition-all"
              >
                {b} <X size={12} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
            {filter.storages.map(s => (
              <button
                key={s}
                onClick={() => toggleStorage(s)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-mono-data hover:border-zinc-400 hover:shadow-sm transition-all"
              >
                {s} <X size={12} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
            {filter.rams.map(r => (
              <button
                key={r}
                onClick={() => toggleRam(r)}
                className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-mono-data hover:border-zinc-400 hover:shadow-sm transition-all"
              >
                {r} <X size={12} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-[11px] sm:text-xs text-[#E8002D] hover:underline font-display font-700 ml-2 px-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100 sticky top-24">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#0A0A0A]" />
                  <p className="font-display font-800 text-sm tracking-widest uppercase text-[#0A0A0A]">
                    Bộ lọc
                  </p>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] text-[#E8002D] font-display font-700 hover:underline bg-red-50 px-2.5 py-1 rounded-full"
                  >
                    Xóa ({activeFilterCount})
                  </button>
                )}
              </div>
              {renderSidebarContent()}
            </div>
          </aside>

          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div className="bg-black/50 absolute inset-0" onClick={() => setSidebarOpen(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto p-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-display font-700 text-sm tracking-widest uppercase">
                    Bộ lọc sản phẩm
                  </p>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
                {renderSidebarContent()}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-full mt-4 py-3 bg-[#0A0A0A] text-white font-display font-700 text-xs tracking-widest uppercase"
                >
                  Áp dụng ({filtered.length} sản phẩm)
                </button>
              </div>
            </div>
          )}

          {/* Product grid */}
          <main className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100">
                  <SlidersHorizontal size={32} className="text-zinc-300" />
                </div>
                <p className="font-display font-800 text-2xl text-[#0A0A0A] mb-2">
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-sm text-zinc-500 font-body mb-8 max-w-md mx-auto leading-relaxed">
                  Rất tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại của bạn. Vui lòng thử lại với các tiêu chí khác.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3.5 bg-[#E8002D] text-white rounded-xl font-display font-800 text-sm tracking-widest uppercase hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 mb-16"
                >
                  Xóa tất cả bộ lọc
                </button>

                {/* Suggested Products */}
                <div className="w-full text-left">
                  <h3 className="font-display font-800 text-xl text-[#0A0A0A] tracking-tight mb-6">Có thể bạn sẽ thích</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {products.slice(0, 8).map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-8">
                  {filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                    />
                  ))}
                </div>
                {/* Pagination UI */}
                <div className="mt-auto flex items-center justify-center gap-2 pb-8">
                  <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:text-[#0A0A0A] hover:border-zinc-300 disabled:opacity-50 disabled:hover:border-zinc-200 transition-all"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: Math.ceil(filtered.length / itemsPerPage) }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-display font-700 transition-all ${
                          currentPage === i + 1
                            ? 'bg-[#0A0A0A] text-white shadow-md'
                            : 'bg-white border border-zinc-200 text-zinc-500 hover:text-[#0A0A0A] hover:border-zinc-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filtered.length / itemsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 hover:text-[#0A0A0A] hover:border-zinc-300 disabled:opacity-50 disabled:hover:border-zinc-200 transition-all"
                    >
                      <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F8F7] py-12 text-center text-zinc-500 font-display font-600">Đang tải...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
