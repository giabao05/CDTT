'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronRight, MapPin, CreditCard, Package, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuthStore } from '@/store/authStore';
import { createOrder } from '@/lib/api';

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

const STEPS = ['Thông tin giao hàng', 'Thanh toán', 'Xác nhận'];

type PaymentMethod = 'cod' | 'vnpay' | 'momo' | 'zalopay' | 'bank';

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note: string;
}



const PROVINCES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Hải Phòng', 'An Giang',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; sub: string; logo?: string }[] = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', sub: 'Trả tiền mặt khi nhận hàng' },
  { id: 'vnpay', label: 'VNPay', sub: 'Thẻ ATM / Visa / MasterCard qua VNPay' },
  { id: 'momo', label: 'Ví MoMo', sub: 'Thanh toán qua ứng dụng MoMo' },
  { id: 'zalopay', label: 'ZaloPay', sub: 'Thanh toán qua ví ZaloPay' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', sub: 'Chuyển khoản trực tiếp đến tài khoản' },
];

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-display font-700 tracking-wider uppercase text-zinc-800 mb-1.5">
        {label} {required && <span className="text-[#E8002D]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full border text-sm font-body px-3 py-2.5 focus:outline-none transition-colors text-zinc-900 placeholder:text-zinc-400 ${
          error ? 'border-[#E8002D]' : 'border-zinc-300 focus:border-zinc-500'
        }`}
      />
      {error && (
        <p className="text-[10px] text-[#E8002D] font-body mt-1 flex items-center gap-1">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, discountAmount, shippingFee, totalAmount, clearCart } = useCart();
  const { user, initAuth } = useAuthStore();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [errors, setErrors] = useState<Partial<ShippingForm>>({});
  const [form, setForm] = useState<ShippingForm>({
    fullName: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: '',
  });

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (user && user.email) {
      setForm(f => ({
        ...f,
        email: f.email || user.email,
        fullName: f.fullName || (user.username || '')
      }));
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem('user_addresses');
    if (saved) {
      try {
        const addresses = JSON.parse(saved);
        const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setForm(f => ({
            ...f,
            fullName: defaultAddr.name || f.fullName,
            phone: defaultAddr.phone || f.phone,
            address: defaultAddr.street || f.address,
            province: defaultAddr.city || f.province,
          }));
        }
      } catch (e) {}
    }
  }, []);

  const setField = (key: keyof ShippingForm) => (v: string) =>
    setForm(f => ({ ...f, [key]: v }));

  const validate = (): boolean => {
    const errs: Partial<ShippingForm> = {};
    if (!form.fullName.trim()) errs.fullName = 'Vui lòng nhập họ tên';
    if (!/^(0|\+84)[0-9]{9}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Số điện thoại không hợp lệ';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Email không hợp lệ';
    if (!form.province) errs.province = 'Vui lòng chọn tỉnh/thành phố' as any;
    if (!form.address.trim()) errs.address = 'Vui lòng nhập địa chỉ cụ thể';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };



  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || (user?.email ?? ''),
        province: form.province,
        district: form.district,
        ward: form.ward,
        address: form.address,
        note: form.note,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        shippingFee: shippingFee,
        discountAmount: discountAmount,
        items: cart.items.map(item => ({
          variantId: parseInt(item.variant.id),
          quantity: item.quantity,
          unitPrice: item.variant.salePrice ?? item.variant.price
        }))
      };

      const createdOrder = await createOrder(orderData);
      clearCart();
      router.push(`/cart/success?orderCode=${createdOrder.id}`);
    } catch (error) {
      console.error('Failed to create order', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    }
  };

  const stepIcons = [MapPin, CreditCard, Package];

  return (
    <div className="min-h-screen bg-[#F8F8F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Steps */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => {
            const Icon = stepIcons[i];
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 flex items-center justify-center border-2 transition-all ${
                      i < step
                        ? 'bg-green-500 border-green-500 text-white'
                        : i === step
                        ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                        : 'border-zinc-300 text-zinc-400'
                    }`}
                  >
                    {i < step ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                  </div>
                  <span
                    className={`text-[10px] font-display font-600 tracking-wider mt-1.5 hidden sm:block ${
                      i === step ? 'text-[#0A0A0A]' : 'text-zinc-400'
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-px mx-2 mb-3 sm:mb-4 transition-all ${
                      i < step ? 'bg-green-400' : 'bg-zinc-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Form area */}
          <div className="lg:col-span-2">

            {/* Step 0: Shipping info */}
            {step === 0 && (
              <div className="bg-white border border-zinc-200 p-6">
                <h2 className="font-display font-700 text-sm tracking-widest uppercase text-[#0A0A0A] mb-5">
                  Thông tin giao hàng
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <InputField
                      label="Họ và tên"
                      value={form.fullName}
                      onChange={setField('fullName')}
                      placeholder="Nguyễn Văn A"
                      required
                      error={errors.fullName}
                    />
                  </div>
                  <InputField
                    label="Số điện thoại"
                    value={form.phone}
                    onChange={setField('phone')}
                    placeholder="0901234567"
                    type="tel"
                    required
                    error={errors.phone}
                  />
                  <InputField
                    label="Email"
                    value={form.email}
                    onChange={setField('email')}
                    placeholder="email@example.com"
                    type="email"
                    error={errors.email}
                  />
                  <div>
                    <label className="block text-xs font-display font-700 tracking-wider uppercase text-zinc-600 mb-1.5">
                      Tỉnh / Thành phố <span className="text-[#E8002D]">*</span>
                    </label>
                    <select
                      value={form.province}
                      onChange={e => setField('province')(e.target.value)}
                      className={`w-full border text-sm font-body px-3 py-2.5 bg-white focus:outline-none transition-colors ${
                        errors.province ? 'border-[#E8002D]' : 'border-zinc-300 focus:border-zinc-500'
                      }`}
                    >
                      <option value="">Chọn tỉnh/thành phố</option>
                      {PROVINCES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-[10px] text-[#E8002D] font-body mt-1">{errors.province as string}</p>
                    )}
                  </div>
                  <InputField
                    label="Quận / Huyện"
                    value={form.district}
                    onChange={setField('district')}
                    placeholder="Quận 1"
                  />
                  <InputField
                    label="Phường / Xã"
                    value={form.ward}
                    onChange={setField('ward')}
                    placeholder="Phường Bến Nghé"
                  />
                  <div className="sm:col-span-2">
                    <InputField
                      label="Địa chỉ cụ thể"
                      value={form.address}
                      onChange={setField('address')}
                      placeholder="Số nhà, tên đường..."
                      required
                      error={errors.address}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-display font-700 tracking-wider uppercase text-zinc-600 mb-1.5">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      value={form.note}
                      onChange={e => setField('note')(e.target.value)}
                      placeholder="Giao giờ hành chính, gọi trước khi giao..."
                      rows={3}
                      className="w-full border border-zinc-300 text-sm font-body text-zinc-900 placeholder:text-zinc-400 px-3 py-2.5 focus:outline-none focus:border-zinc-500 resize-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={() => { if (validate()) setStep(1); }}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-[#E8002D] text-white font-display font-700 text-sm tracking-wider uppercase hover:bg-red-700 transition-colors"
                >
                  Tiếp tục
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="bg-white border border-zinc-200 p-6">
                <h2 className="font-display font-700 text-sm tracking-widest uppercase text-[#0A0A0A] mb-5">
                  Phương thức thanh toán
                </h2>

                <div className="space-y-2">
                  {PAYMENT_METHODS.map(method => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-[#0A0A0A] bg-zinc-50'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          paymentMethod === method.id
                            ? 'border-[#0A0A0A] bg-[#0A0A0A]'
                            : 'border-zinc-300'
                        }`}
                      >
                        {paymentMethod === method.id && (
                          <Check size={10} strokeWidth={3} className="text-white" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="hidden"
                      />
                      <div>
                        <p className="font-display font-700 text-sm text-[#0A0A0A]">{method.label}</p>
                        <p className="text-xs text-zinc-400 font-body mt-0.5">{method.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === 'bank' && (
                  <div className="mt-4 bg-zinc-50 border border-zinc-200 p-4 font-mono-data text-xs space-y-1.5">
                    <p className="font-display font-700 text-xs text-zinc-600 mb-2">Thông tin chuyển khoản</p>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Ngân hàng:</span>
                      <span className="text-[#0A0A0A] font-600">Vietcombank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Số tài khoản:</span>
                      <span className="text-[#0A0A0A] font-600">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Chủ tài khoản:</span>
                      <span className="text-[#0A0A0A] font-600">PHONE STORE JSC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Số tiền:</span>
                      <span className="text-[#E8002D] font-700">{fmt(totalAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(0)}
                    className="px-5 py-3 border border-zinc-300 text-xs font-display font-600 tracking-wider uppercase text-zinc-600 hover:border-zinc-500 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#E8002D] text-white font-display font-700 text-xs tracking-wider uppercase hover:bg-red-700 transition-colors"
                  >
                    Xem lại đơn hàng
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <div className="bg-white border border-zinc-200 p-6">
                <h2 className="font-display font-700 text-sm tracking-widest uppercase text-[#0A0A0A] mb-5">
                  Xác nhận đơn hàng
                </h2>

                {/* Shipping summary */}
                <div className="bg-zinc-50 border border-zinc-200 p-4 mb-4">
                  <p className="text-xs font-display font-700 tracking-widest uppercase text-zinc-500 mb-2">
                    Địa chỉ giao hàng
                  </p>
                  <p className="text-sm font-display font-700 text-[#0A0A0A]">{form.fullName}</p>
                  <p className="text-sm font-body text-zinc-800 mt-0.5">{form.phone}</p>
                  <p className="text-sm font-body text-zinc-700 mt-0.5">
                    {form.address}{form.ward ? `, ${form.ward}` : ''}{form.district ? `, ${form.district}` : ''}, {form.province}
                  </p>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-4 mb-6">
                  <p className="text-xs font-display font-700 tracking-widest uppercase text-zinc-500 mb-2">
                    Phương thức thanh toán
                  </p>
                  <p className="text-sm font-display font-700 text-[#0A0A0A]">
                    {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                  </p>
                </div>

                {/* Order items */}
                <div className="space-y-3 mb-4">
                  {cart.items.map(item => (
                    <div key={item.variant.id} className="flex items-center gap-3">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover bg-zinc-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-display font-700 text-[#0A0A0A] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-zinc-400 font-body">
                          {item.variant.color} · {item.variant.storage} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-mono-data font-600 text-[#E8002D] flex-shrink-0">
                        {fmt((item.variant.salePrice ?? item.variant.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 border border-zinc-300 text-xs font-display font-600 tracking-wider uppercase text-zinc-600 hover:border-zinc-500 transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#E8002D] text-white font-display font-700 text-sm tracking-wider uppercase hover:bg-red-700 transition-colors"
                  >
                    <Check size={16} />
                    Đặt hàng ngay ({fmt(totalAmount)})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200 p-5 sticky top-24">
              <h3 className="font-display font-700 text-xs tracking-widest uppercase text-[#0A0A0A] mb-4">
                Đơn hàng ({cart.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map(item => (
                  <div key={item.variant.id} className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.product.thumbnail}
                        alt={item.product.name}
                        className="w-11 h-11 object-cover bg-zinc-100"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-600 text-white text-[9px] font-700 flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-display font-600 text-[#0A0A0A] truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-body">{item.variant.storage}</p>
                    </div>
                    <p className="text-xs font-mono-data font-700 text-zinc-800 flex-shrink-0">
                      {fmt((item.variant.salePrice ?? item.variant.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-100 mt-4 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-800 font-body">
                  <span>Tạm tính</span>
                  <span className="font-mono-data font-700 text-zinc-900">{fmt(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="font-body">Giảm giá</span>
                    <span className="font-mono-data">-{fmt(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-800 font-body">
                  <span>Vận chuyển</span>
                  <span className={`font-mono-data font-700 ${shippingFee === 0 ? 'text-green-700' : 'text-zinc-900'}`}>
                    {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="border-t border-zinc-200 mt-3 pt-3 flex justify-between items-center">
                <span className="font-display font-800 text-xs uppercase tracking-wider text-zinc-900">Tổng</span>
                <span className="font-display font-900 text-lg text-[#E8002D]">{fmt(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
