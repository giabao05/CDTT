'use client';
import { useState, useMemo, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { Brand, FilterState, Product } from '@/types';
import { fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const BRANDS: Brand[] = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'];
const STORAGES = ['64GB', '128GB', '256GB', '512GB', '1TB'];
const RAMS = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const PRICE_RANGES: { label: string; range: [number, number] }[] = [
  { label: 'Dưới 5 triệu', range: [0, 5000000] },
  { label: '5 – 10 triệu', range: [5000000, 10000000] },
  { label: '10 – 20 triệu', range: [10000000, 20000000] },
  { label: '20 – 30 triệu', range: [20000000, 30000000] },
  { label: 'Trên 30 triệu', range: [30000000, Infinity] },
];

const DEFAULT_FILTER: FilterState = {
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
    <div className="border-b border-zinc-200 py-4">
      <button
        className="flex items-center justify-between w-full mb-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-display font-700 text-xs tracking-widest uppercase text-[#0A0A0A]">
          {title}
        </span>
        {open ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
      </button>
      {open && children}
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
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <div
        onClick={onToggle}
        className={`w-4 h-4 flex items-center justify-center border transition-all flex-shrink-0 ${
          checked
            ? 'bg-[#0A0A0A] border-[#0A0A0A]'
            : 'border-zinc-300 group-hover:border-zinc-500'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span
        className={`text-sm font-body transition-colors ${
          checked ? 'text-[#0A0A0A] font-500' : 'text-zinc-600 group-hover:text-zinc-900'
        }`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs text-zinc-400 font-mono-data">{count}</span>
      )}
    </label>
  );
}

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get('brand') as Brand | null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts(undefined, undefined, 0, 100).then(data => {
      setProducts(data.products);
      setLoading(false);
    });
  }, []);

  const [filter, setFilter] = useState<FilterState>({
    ...DEFAULT_FILTER,
    brands: initialBrand && BRANDS.includes(initialBrand) ? [initialBrand] : [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    filter.brands.length +
    filter.storages.length +
    filter.rams.length +
    (filter.inStockOnly ? 1 : 0) +
    (filter.priceRange[0] > 0 || filter.priceRange[1] < Infinity ? 1 : 0);

  const filtered = useMemo(() => {
    let list = [...products];
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
  }, [filter, products]);

  const renderSidebarContent = () => (
    <div className="space-y-0">
      <FilterSection title="Thương hiệu">
        {BRANDS.map(brand => (
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
        <div className="flex flex-wrap gap-1.5">
          {STORAGES.map(s => (
            <button
              key={s}
              onClick={() => toggleStorage(s)}
              className={`px-2.5 py-1 text-xs font-mono-data border transition-all ${
                filter.storages.includes(s)
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'text-zinc-600 border-zinc-300 hover:border-zinc-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="RAM">
        <div className="flex flex-wrap gap-1.5">
          {RAMS.map(r => (
            <button
              key={r}
              onClick={() => toggleRam(r)}
              className={`px-2.5 py-1 text-xs font-mono-data border transition-all ${
                filter.rams.includes(r)
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                  : 'text-zinc-600 border-zinc-300 hover:border-zinc-500'
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
    return <div className="min-h-screen bg-[#F8F8F7] py-12 text-center text-zinc-500 font-display font-600">Đang tải danh sách sản phẩm...</div>;
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
          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-zinc-300 text-xs font-display font-600 tracking-wider uppercase hover:border-zinc-500 transition-colors"
            >
              <SlidersHorizontal size={14} />
              Lọc
              {activeFilterCount > 0 && (
                <span className="bg-[#E8002D] text-white text-[10px] w-4 h-4 flex items-center justify-center font-800">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={filter.sortBy}
              onChange={e => setFilter(f => ({ ...f, sortBy: e.target.value as FilterState['sortBy'] }))}
              className="px-3 py-2 border border-zinc-300 text-xs font-display font-600 bg-white focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              <option value="popular">Phổ biến nhất</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className="text-xs text-zinc-500 font-body">Đang lọc:</span>
            {filter.brands.map(b => (
              <button
                key={b}
                onClick={() => toggleBrand(b)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A0A0A] text-white text-xs font-display font-600 hover:bg-zinc-700 transition-colors"
              >
                {b} <X size={10} />
              </button>
            ))}
            {filter.storages.map(s => (
              <button
                key={s}
                onClick={() => toggleStorage(s)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A0A0A] text-white text-xs font-mono-data hover:bg-zinc-700 transition-colors"
              >
                {s} <X size={10} />
              </button>
            ))}
            {filter.rams.map(r => (
              <button
                key={r}
                onClick={() => toggleRam(r)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0A0A0A] text-white text-xs font-mono-data hover:bg-zinc-700 transition-colors"
              >
                {r} RAM <X size={10} />
              </button>
            ))}
            <button
              onClick={clearFilters}
              className="text-xs text-[#E8002D] hover:underline font-display font-600 ml-2"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white border border-zinc-200 p-4 sticky top-24">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-700 text-xs tracking-widest uppercase text-[#0A0A0A]">
                  Bộ lọc
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#E8002D] font-display font-600 hover:underline"
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
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center mb-4">
                  <SlidersHorizontal size={24} className="text-zinc-400" />
                </div>
                <p className="font-display font-700 text-lg text-zinc-600">
                  Không tìm thấy sản phẩm
                </p>
                <p className="text-sm text-zinc-400 font-body mt-1 mb-4">
                  Thử thay đổi bộ lọc hoặc tìm kiếm khác
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-[#0A0A0A] text-white font-display font-600 text-xs tracking-wider uppercase"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                  />
                ))}
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
