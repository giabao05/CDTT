'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart, Tag, X, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { fetchVouchers } from '@/lib/api';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

export default function CartPage() {
  const router = useRouter();
  const {
    cart, subtotal, discountAmount, shippingFee, totalAmount,
    removeItem, updateQty, applyCoupon, removeCoupon,
  } = useCart();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [vouchers, setVouchers] = useState<any[]>([]);

  useEffect(() => {
    fetchVouchers().then(data => {
      if (data) {
        setVouchers(data.filter((v: any) => v.isActive !== false));
      }
    });
  }, []);

  const handleApplyCoupon = (codeToApply = couponInput) => {
    if (!codeToApply.trim()) return;
    const upperCode = codeToApply.toUpperCase();
    const found = vouchers.find(v => v.code.toUpperCase() === upperCode);
    
    if (found) {
      applyCoupon(upperCode, found.discountPercent / 100);
      setCouponSuccess(`Áp dụng thành công mã "${upperCode}"!`);
      setCouponError('');
    } else {
      setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
      setCouponSuccess('');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F8F7] flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-white border border-zinc-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart size={28} className="text-zinc-300" />
          </div>
          <h2 className="font-display font-800 text-2xl text-[#0A0A0A] mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-zinc-500 font-body text-sm mb-6">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng.
          </p>
          <button
            onClick={() => router.push('/product')}
            className="px-8 py-3 bg-[#0A0A0A] text-white font-display font-700 text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-800 text-3xl text-[#0A0A0A] tracking-tight">
              Giỏ hàng
            </h1>
            <p className="text-sm text-zinc-500 font-body mt-1">
              {cart.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm trong giỏ
            </p>
          </div>
          <button
            onClick={() => router.push('/product')}
            className="text-xs font-display font-600 tracking-wider uppercase text-zinc-500 hover:text-[#E8002D] transition-colors"
          >
            ← Tiếp tục mua
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── CART ITEMS ── */}
          <div className="lg:col-span-2 space-y-3">
            {/* Free shipping progress */}
            {subtotal < 5000000 && (
              <div className="bg-white border border-zinc-200 p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-display font-600 text-zinc-600">
                    Thêm <span className="text-[#E8002D] font-700">{fmt(5000000 - subtotal)}</span> để được miễn phí vận chuyển
                  </span>
                  <Truck size={14} className="text-zinc-400" />
                </div>
                <div className="h-1.5 bg-zinc-100 overflow-hidden">
                  <div
                    className="h-full bg-[#E8002D] transition-all"
                    style={{ width: `${Math.min(100, (subtotal / 5000000) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {subtotal >= 5000000 && (
              <div className="bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-sm text-green-700 font-display font-600">
                <Truck size={15} />
                Bạn được miễn phí vận chuyển!
              </div>
            )}

            {/* Items */}
            {cart.items.map(item => {
              const price = item.variant.salePrice ?? item.variant.price;
              const originalPrice = item.variant.salePrice ? item.variant.price : null;
              return (
                <div
                  key={item.variant.id}
                  className="bg-white border border-zinc-200 p-4 flex gap-4"
                >
                  {/* Image */}
                  <button
                    onClick={() => router.push(`/product/${item.product.slug}`)}
                    className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-zinc-50 border border-zinc-100 overflow-hidden"
                  >
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-display font-600 tracking-widest uppercase text-zinc-600">
                          {item.product.brand}
                        </p>
                        <button
                          onClick={() => router.push(`/product/${item.product.slug}`)}
                          className="font-display font-700 text-sm text-[#0A0A0A] hover:text-[#E8002D] transition-colors text-left leading-tight mt-0.5"
                        >
                          {item.product.name}
                        </button>
                        <p className="text-xs text-zinc-700 font-body mt-1">
                          {item.variant.color} · {item.variant.storage} · {item.variant.ram}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variant.id)}
                        className="text-zinc-300 hover:text-[#E8002D] transition-colors flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-zinc-200">
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-mono-data font-700 text-zinc-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variant.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:bg-zinc-50 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-display font-700 text-base text-[#E8002D]">
                          {fmt(price * item.quantity)}
                        </p>
                        {originalPrice && (
                          <p className="text-xs text-zinc-400 line-through font-mono-data">
                            {fmt(originalPrice * item.quantity)}
                          </p>
                        )}
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-zinc-400 font-body">
                            {fmt(price)} / máy
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 p-5 sticky top-24">
              <h2 className="font-display font-700 text-sm tracking-widest uppercase text-[#0A0A0A] mb-4">
                Tóm tắt đơn hàng
              </h2>

              {/* Coupon */}
              <div className="mb-4">
                {cart.couponCode ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-green-600" />
                      <span className="text-xs font-mono-data font-600 text-green-700">
                        {cart.couponCode}
                      </span>
                      <span className="text-xs text-green-600 font-body">
                        -{Math.round(cart.discount * 100)}%
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-green-500 hover:text-red-500 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 relative">
                    <input
                      type="text"
                      placeholder="Mã giảm giá"
                      value={couponInput}
                      onFocus={() => {
                        const dr = document.getElementById('coupon-dropdown');
                        if(dr) dr.classList.remove('hidden');
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          const dr = document.getElementById('coupon-dropdown');
                          if(dr) dr.classList.add('hidden');
                        }, 200);
                      }}
                      onChange={e => {
                        setCouponInput(e.target.value);
                        setCouponError('');
                        setCouponSuccess('');
                      }}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      className="flex-1 border border-zinc-300 text-xs font-mono-data px-3 py-2 focus:outline-none focus:border-zinc-500 uppercase placeholder:normal-case placeholder:font-body"
                    />
                    <button
                      onClick={() => handleApplyCoupon()}
                      className="px-3 py-2 bg-[#0A0A0A] text-white text-xs font-display font-700 tracking-wider uppercase hover:bg-zinc-700 transition-colors"
                    >
                      <Tag size={13} />
                    </button>
                    
                    {/* Coupon Dropdown */}
                    <div id="coupon-dropdown" className="absolute top-full left-0 w-full bg-white border border-zinc-200 shadow-lg mt-1 z-10 hidden">
                      <div className="flex flex-col max-h-48 overflow-y-auto">
                        {vouchers.length > 0 ? vouchers.map((c) => (
                          <button
                            key={c.code}
                            onClick={() => {
                              setCouponInput(c.code);
                              handleApplyCoupon(c.code);
                            }}
                            className="px-3 py-2 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0 flex justify-between items-center"
                          >
                            <span className="font-mono-data font-700 text-xs text-zinc-800">{c.code}</span>
                            <span className="text-[10px] text-green-600 font-500">Giảm {c.discountPercent}%</span>
                          </button>
                        )) : (
                          <div className="px-3 py-2 text-left text-[11px] text-zinc-500">Không có mã giảm giá nào.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {couponError && (
                  <p className="text-[10px] text-[#E8002D] font-body mt-1">{couponError}</p>
                )}
                {couponSuccess && (
                  <p className="text-[10px] text-green-600 font-body mt-1">{couponSuccess}</p>
                )}
              </div>

              {/* Line items */}
              <div className="space-y-3 text-sm border-t border-zinc-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-body font-600 text-zinc-800">Tạm tính</span>
                  <span className="font-mono-data font-700 text-zinc-900">{fmt(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span className="font-body">Giảm giá voucher</span>
                    <span className="font-mono-data font-600">-{fmt(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-body font-600 text-zinc-800">Phí vận chuyển</span>
                  <span className={`font-mono-data font-700 ${shippingFee === 0 ? 'text-green-700' : 'text-zinc-900'}`}>
                    {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 mt-4 pt-4 flex items-center justify-between">
                <span className="font-display font-800 text-sm uppercase tracking-wider text-zinc-900">Tổng cộng</span>
                <span className="font-display font-900 text-xl text-[#E8002D]">
                  {fmt(totalAmount)}
                </span>
              </div>

              <button
                onClick={() => router.push('/cart/checkout')}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 bg-[#E8002D] text-white font-display font-700 text-sm tracking-wider uppercase hover:bg-red-700 transition-colors"
              >
                Tiến hành thanh toán
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => router.push('/product')}
                className="w-full mt-2 py-2.5 text-xs font-display font-600 tracking-wider uppercase text-zinc-500 hover:text-[#0A0A0A] transition-colors"
              >
                ← Tiếp tục mua sắm
              </button>

              {/* Security note */}
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-600 text-center font-body leading-relaxed">
                  Thanh toán bảo mật SSL 256-bit. Chấp nhận VNPay, MoMo, ZaloPay, COD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
