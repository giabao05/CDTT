'use client';
import { useAuthStore } from '../../../store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package, MapPin, LogOut, ShieldCheck, Heart, Clock, Settings, CreditCard, ChevronRight, Eye, Plus, Edit2, Trash2, Crown, Star, TrendingUp, Camera } from 'lucide-react';
import { fetchUserOrders, fetchUserFavorites, updateUserProfile, changeUserPassword, deleteUserAccount, uploadFile, updateUserSettings } from '../../../lib/api';
import Link from 'next/link';
import LoadingScreen from '@/components/LoadingScreen';

export default function ProfilePage() {
  const { user, logout, initAuth, updateUser } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('account'); // 'account', 'orders', 'favorites', 'address', 'settings'
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ id: 0, name: '', phone: '', street: '', city: '', isDefault: false });
  
  const [settings, setSettings] = useState({
    emailNotif: true,
    promoNotif: false
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const updateSetting = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    if (user?.id) {
      try {
        const updatedUser = await updateUserSettings(user.id, {
          emailNotifEnabled: newSettings.emailNotif,
          promoNotifEnabled: newSettings.promoNotif
        });
        updateUser(updatedUser);
        showToast('Đã lưu cài đặt');
      } catch (e) {
        showToast('Lỗi khi lưu cài đặt');
        setSettings(settings);
      }
    }
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', dob: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  
  // Birthday Gift state
  const [giftClaimedThisYear, setGiftClaimedThisYear] = useState(false);
  const [showVoucherCode, setShowVoucherCode] = useState(false);

  // Password & Account State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePasswordSubmit = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      showToast('Vui lòng điền đầy đủ mật khẩu cũ và mới');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Mật khẩu mới không khớp');
      return;
    }
    try {
      setIsChangingPassword(true);
      if (user?.id) {
        await changeUserPassword(user.id, { 
          oldPassword: passwordForm.oldPassword, 
          newPassword: passwordForm.newPassword 
        });
        showToast('Đổi mật khẩu thành công!');
        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (e: any) {
      showToast(e.message || 'Lỗi đổi mật khẩu');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác. Mọi dữ liệu sẽ bị xóa vĩnh viễn.")) {
      try {
        if (user?.id) {
          await deleteUserAccount(user.id);
          logout();
          router.push('/');
        }
      } catch (e: any) {
        showToast(e.message || 'Lỗi xóa tài khoản');
      }
    }
  };

  // Function to save addresses and sync to localStorage
  const saveAddresses = (newAddresses: any[]) => {
    setAddresses(newAddresses);
    if (user && user.email) {
      localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(newAddresses));
    }
  };

  useEffect(() => {
    initAuth();
    
    // Sync user data from backend to get latest avatar etc.
    const syncUser = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed?.id) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/users/${parsed.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const freshUser = await res.json();
              updateUser({ ...parsed, ...freshUser });
            }
          }
        } catch (e) {}
      }
    };
    syncUser();
    
    setMounted(true);
  }, [initAuth]);

  useEffect(() => {
    if (user && user.email) {
      setLoadingData(true);
      Promise.all([
        fetchUserOrders(user.email),
        fetchUserFavorites(user.email)
      ]).then(([ordersData, favData]) => {
        setOrders(ordersData);
        setFavorites(favData);
      }).finally(() => {
        setLoadingData(false);
      });
      
      // Initialize profile form
      setProfileForm({
        name: user.name || user.username || '',
        phone: user.phone || '',
        dob: localStorage.getItem(`dob_${user.email}`) || ''
      });
      
      const claimedYear = localStorage.getItem(`birthday_gift_claimed_year_${user.email}`);
      if (claimedYear === new Date().getFullYear().toString()) {
        setGiftClaimedThisYear(true);
      } else {
        setGiftClaimedThisYear(false);
      }
      setShowVoucherCode(false);
      
      setSettings({
        emailNotif: user.emailNotifEnabled ?? true,
        promoNotif: user.promoNotifEnabled ?? false
      });

      // Load addresses for specific user
      const saved = localStorage.getItem(`user_addresses_${user.email}`);
      if (saved) {
        try {
          let parsedAddresses = JSON.parse(saved);
          let modified = false;
          parsedAddresses = parsedAddresses.map((a: any) => {
             if (a.isDefault) {
                let newName = a.name;
                if (!a.name || a.name === user.email || a.name === user.username) {
                   newName = user.name || a.name;
                   modified = true;
                }
                if (newName !== a.name) {
                   modified = true;
                   return { ...a, name: newName };
                }
             }
             return a;
          });
          setAddresses(parsedAddresses);
          if (modified) {
            localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(parsedAddresses));
          }
        } catch (e) { }
      } else {
        if (user.address || user.phone || user.name) {
          const defaultAddresses = [
            { 
              id: 1, 
              name: user.name || user.username || user.email || 'Người dùng', 
              phone: user.phone || '', 
              street: user.address || '', 
              city: '', 
              isDefault: true 
            }
          ];
          setAddresses(defaultAddresses);
          localStorage.setItem(`user_addresses_${user.email}`, JSON.stringify(defaultAddresses));
        } else {
          setAddresses([]);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, router, mounted]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F7]">
        <div className="w-8 h-8 border-2 border-[#E8002D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !user.id) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        const res = await updateUserProfile(user.id, { avatar: url });
        updateUser({ ...user, avatar: url });
        setProfileMessage({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
      } else {
        setProfileMessage({ type: 'error', text: 'Upload ảnh thất bại.' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật ảnh đại diện.' });
    } finally {
      setIsUploadingAvatar(false);
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || !user.id) return;
    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });
    try {
      if (profileForm.dob) {
         localStorage.setItem(`dob_${user.email}`, profileForm.dob);
      }
      const updatedData = {
        name: profileForm.name,
        phone: profileForm.phone
      };
      const res = await updateUserProfile(user.id, updatedData);
      updateUser({ ...user, ...res });
      
      // Auto-update default address in address book
      let currentAddresses = [...addresses];
      const defaultIndex = currentAddresses.findIndex(a => a.isDefault);
      if (defaultIndex !== -1) {
        currentAddresses[defaultIndex] = {
          ...currentAddresses[defaultIndex],
          name: profileForm.name || currentAddresses[defaultIndex].name,
          phone: profileForm.phone || currentAddresses[defaultIndex].phone,
        };
      } else if (currentAddresses.length === 0) {
        currentAddresses = [{
          id: Date.now(),
          name: profileForm.name || user.name || user.email || 'Người dùng',
          phone: profileForm.phone || '',
          street: '',
          city: '',
          isDefault: true
        }];
      }
      saveAddresses(currentAddresses);

      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    } catch (e) {
      setProfileMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const totalAccumulated = orders
    .filter(o => {
      const s = (o.status || '').toLowerCase();
      return !s.includes('cancel') && !s.includes('hủy');
    })
    .reduce((sum, o) => sum + (Number(o.total) || Number(o.totalAmount) || 0), 0);
    
  const formattedAccumulated = new Intl.NumberFormat('vi-VN').format(totalAccumulated) + ' ₫';

  const getMembershipTier = (total: number) => {
    if (total >= 50000000) return { name: 'Thành viên Kim Cương', color: 'bg-blue-100 text-blue-600', next: null, benefits: ['Miễn phí vận chuyển mọi đơn hàng', 'Giảm 10% khi mua phụ kiện', 'Quà tặng sinh nhật trị giá 1.000.000đ', 'Hotline hỗ trợ riêng 24/7'] };
    if (total >= 20000000) return { name: 'Thành viên Vàng', color: 'bg-yellow-100 text-yellow-600', next: 50000000, nextName: 'Kim Cương', benefits: ['Miễn phí vận chuyển (tối đa 50k)', 'Giảm 5% khi mua phụ kiện', 'Quà tặng sinh nhật trị giá 500.000đ'] };
    if (total >= 5000000) return { name: 'Thành viên Bạc', color: 'bg-zinc-100 text-zinc-600', next: 20000000, nextName: 'Vàng', benefits: ['Giảm 50% phí vận chuyển', 'Giảm 2% khi mua phụ kiện', 'Quà tặng sinh nhật 200.000đ'] };
    return { name: 'Thành viên Đồng', color: 'bg-orange-100 text-orange-600', next: 5000000, nextName: 'Bạc', benefits: ['Tích điểm đổi quà', 'Nhận thông báo khuyến mãi sớm'] };
  };

  const currentTier = getMembershipTier(totalAccumulated);

  const renderContent = () => {
    
    let joinedDate = 'Hôm nay';
    
    const parseAnyDateToString = (d: any): string | null => {
      if (!d) return null;
      if (typeof d === 'string') {
        if (d.includes('Invalid Date')) return null;
        // Nếu đã có dạng dd/mm/yyyy thì lấy luôn
        if (d.includes('/')) return d.split(' ')[0];
        
        // Handle common custom formats like "dd-MM-yyyy" or "HH:mm dd-MM-yyyy"
        if (d.includes('-') && d.split('-').length === 3) {
           const datePart = d.split(' ').pop(); // gets "dd-MM-yyyy"
           if (datePart && datePart.includes('-')) {
             const parts = datePart.split('-');
             // if it's DD-MM-YYYY
             if (parts[0].length <= 2) {
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
             }
           }
        }
        
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) {
           const res = dateObj.toLocaleDateString('vi-VN');
           return res !== 'Invalid Date' ? res : null;
        }
      }
      if (d instanceof Date && !isNaN(d.getTime())) {
          const res = d.toLocaleDateString('vi-VN');
          return res !== 'Invalid Date' ? res : null;
      }
      if (typeof d === 'number') {
          const res = new Date(d).toLocaleDateString('vi-VN');
          return res !== 'Invalid Date' ? res : null;
      }
      return null;
    };

    const userJoinDateStr = parseAnyDateToString(user?.createdAt);
    if (userJoinDateStr) {
      joinedDate = userJoinDateStr;
    } else if (orders && orders.length > 0) {
      const validOrders = orders.filter((o: any) => o.createdAt || o.date);
      if (validOrders.length > 0) {
        const parseToMs = (d: any) => {
          if (!d) return Date.now();
          if (typeof d === 'string' && d.includes('/')) {
            const parts = d.split(' ')[0].split('/');
            if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          }
          if (typeof d === 'string' && d.includes('-') && d.split('-')[0].length <= 2) {
             const parts = d.split(' ').pop()!.split('-');
             if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
          }
          const ms = new Date(d).getTime();
          return isNaN(ms) ? Date.now() : ms;
        };
        const oldestOrder = [...validOrders].sort((a, b) => parseToMs(a.createdAt || a.date) - parseToMs(b.createdAt || b.date))[0];
        const oldestStr = parseAnyDateToString(oldestOrder.createdAt || oldestOrder.date);
        if (oldestStr) joinedDate = oldestStr;
      }
    }

    switch (activeTab) {
      case 'orders':
        return (
          <div className="bg-white border border-zinc-100 p-8 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] min-h-[400px]">
            <h2 className="text-2xl font-display font-900 text-[#0A0A0A] mb-8 border-b border-zinc-100 pb-4">Quản lý đơn hàng</h2>
            {loadingData ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#E8002D] border-t-transparent rounded-full animate-spin"></div></div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Package size={64} className="mb-4 text-zinc-200" />
                <p className="text-lg font-600 text-zinc-600">Bạn chưa có đơn hàng nào</p>
                <p className="text-sm mt-2 mb-6">Cùng khám phá hàng ngàn sản phẩm đang có tại Phone Store nhé!</p>
                <button onClick={() => router.push('/product')} className="bg-[#E8002D] text-white px-6 py-2.5 rounded-lg font-600 text-sm hover:bg-red-700 transition-colors">
                  Mua sắm ngay
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order, idx) => {
                  const statusLabels: Record<string, string> = {
                    Pending: 'Chờ xác nhận',
                    Confirmed: 'Đã xác nhận',
                    Shipping: 'Đang giao',
                    Delivered: 'Đã giao',
                    Cancelled: 'Đã hủy',
                  };
                  const displayStatus = statusLabels[order.status] || order.status || 'Chờ xác nhận';

                  const getStatusColor = (status: string) => {
                    const s = status?.toLowerCase() || '';
                    if (s.includes('deliver') || s.includes('đã giao') || s.includes('hoàn thành')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
                    if (s.includes('ship') || s.includes('đang giao')) return 'bg-blue-50 text-blue-600 border-blue-200';
                    if (s.includes('cancel') || s.includes('hủy')) return 'bg-red-50 text-red-600 border-red-200';
                    return 'bg-amber-50 text-amber-600 border-amber-200';
                  };

                  const s = (order.status || '').toLowerCase();
                  const isCancelled = s.includes('cancel') || s.includes('hủy');
                  let stepIdx = 0;
                  if (s.includes('confirm') || s.includes('process') || s.includes('xác nhận') || s.includes('xử lý')) stepIdx = 1;
                  if (s.includes('ship') || s.includes('giao')) stepIdx = 2;
                  if (s.includes('deliver') || s.includes('đã giao') || s.includes('hoàn thành')) stepIdx = 3;

                  return (
                    <div key={idx} className="bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-zinc-300 transition-all duration-300 group">
                      {/* Order Header */}
                      <div className="bg-zinc-50/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-zinc-200 text-zinc-400 shadow-sm group-hover:text-[#E8002D] group-hover:border-[#E8002D] transition-colors">
                            <Package size={22} />
                          </div>
                          <div>
                            <span className="font-800 text-zinc-900 block text-lg tracking-tight">Đơn hàng #{order.id}</span>
                            <span className="text-xs font-500 text-zinc-500 flex items-center gap-1.5 mt-1">
                              <Clock size={12} /> {order.date}
                            </span>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-700 border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {displayStatus}
                        </span>
                      </div>

                      {/* Shipping Timeline */}
                      <div className="px-8 py-6 border-b border-zinc-100 bg-white/50 hidden sm:block">
                        <div className="relative max-w-2xl mx-auto">
                          {/* Progress Line */}
                          <div className="absolute top-3 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full z-0"></div>
                          
                          {/* Active Progress Line */}
                          {(() => {
                            return (
                              <>
                                <div 
                                  className={`absolute top-3 left-0 h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ${isCancelled ? 'bg-red-500' : 'bg-[#E8002D]'}`}
                                  style={{ width: `${isCancelled ? 100 : (stepIdx / 3) * 100}%` }}
                                ></div>
                                
                                {/* Steps */}
                                <div className="relative z-10 flex justify-between">
                                  {['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao'].map((step, idx) => {
                                    const isActive = isCancelled ? (idx === 0 || idx === 3) : idx <= stepIdx;
                                    const isCurrent = isCancelled ? idx === 3 : idx === stepIdx;
                                    
                                    return (
                                      <div key={idx} className="flex flex-col items-center gap-2.5 w-16 -ml-4 first:ml-0 last:-mr-4">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 shadow-sm
                                          ${isActive 
                                            ? (isCancelled && idx === 3 ? 'bg-red-500 text-white ring-4 ring-red-50 scale-110' : 'bg-[#E8002D] text-white ring-4 ring-red-50 scale-110')
                                            : 'bg-white border-2 border-zinc-200 text-zinc-300'
                                          }`}
                                        >
                                          {isCancelled && idx === 3 ? '✕' : (isActive ? '✓' : idx + 1)}
                                        </div>
                                        <span className={`text-[10px] font-700 uppercase tracking-wide text-center leading-tight transition-colors duration-500 ${isActive ? (isCancelled && idx === 3 ? 'text-red-600' : 'text-[#E8002D]') : 'text-zinc-400'}`}>
                                          {isCancelled && idx === 3 ? 'Đã hủy' : step}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-6">
                        <div className="space-y-3">
                          {order.items && order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center group/item p-3 rounded-lg hover:bg-zinc-50 transition-colors">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover/item:bg-[#E8002D] group-hover/item:scale-150 transition-all" />
                                <span className="text-zinc-700 font-500 text-sm">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-6">
                                <span className="text-zinc-400 font-500 text-sm text-right min-w-[30px]">x{item.qty}</span>
                                <span className="font-700 text-zinc-800 text-sm text-right min-w-[90px]">{item.price?.toLocaleString('vi-VN')} đ</span>
                                {!isCancelled && stepIdx === 3 && item.slug && (
                                  <button 
                                    onClick={() => router.push(`/product/${item.slug}?review=true`)}
                                    className="px-3 py-1.5 bg-white border border-[#E8002D] text-[#E8002D] text-xs font-700 rounded hover:bg-[#E8002D] hover:text-white transition-colors"
                                  >
                                    Đánh giá
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Footer */}
                      <div className="bg-zinc-50/50 px-6 py-5 border-t border-zinc-100 flex justify-between items-center">
                        <span className="text-xs font-700 text-zinc-500 uppercase tracking-widest">Tổng thanh toán</span>
                        <span className="text-2xl font-900 text-[#E8002D] drop-shadow-sm">{order.total?.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      case 'favorites':
        return (
          <div className="bg-white border border-zinc-100 p-8 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] min-h-[400px]">
            <h2 className="text-2xl font-display font-900 text-[#0A0A0A] mb-8 border-b border-zinc-100 pb-4">Sản phẩm yêu thích</h2>
            {loadingData ? (
              <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#E8002D] border-t-transparent rounded-full animate-spin"></div></div>
            ) : favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                <Heart size={64} className="mb-4 text-zinc-200" />
                <p className="text-lg font-600 text-zinc-600">Danh sách yêu thích trống</p>
                <p className="text-sm mt-2 mb-6">Hãy thả tim cho những sản phẩm bạn yêu thích để xem lại dễ dàng hơn.</p>
                <button onClick={() => router.push('/product')} className="bg-[#E8002D] text-white px-6 py-2.5 rounded-lg font-600 text-sm hover:bg-red-700 transition-colors">
                  Xem sản phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((fav, idx) => (
                  <div key={idx} className="border border-zinc-200 p-4 rounded-lg flex items-center gap-4 hover:border-zinc-300 transition-colors bg-zinc-50/50">
                    <div className="w-20 h-20 bg-white rounded-md flex-shrink-0 flex items-center justify-center border border-zinc-100 p-1">
                      <img src={fav.product.thumbnail || '/placeholder.png'} alt={fav.product.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-600 text-zinc-900 line-clamp-2 text-sm">{fav.product.name}</h3>
                      <p className="text-[#E8002D] font-700 text-sm mt-1">{fav.product.basePrice?.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <Link href={`/product/${fav.product.slug}`} className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-[#E8002D] hover:border-[#E8002D] transition-colors flex-shrink-0">
                      <Eye size={18} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'address':
        return (
          <div className="bg-white border border-zinc-100 p-8 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] min-h-[400px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-100 pb-4 mb-8 gap-4">
              <h2 className="text-2xl font-display font-900 text-[#0A0A0A]">Sổ địa chỉ</h2>
              <button onClick={() => { setAddressForm({ id: 0, name: '', phone: '', street: '', city: '', isDefault: false }); setIsAddressModalOpen(true); }} className="bg-[#E8002D] text-white px-5 py-2.5 rounded-lg font-600 text-sm hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-95 flex items-center gap-2">
                <Plus size={16} /> Thêm địa chỉ mới
              </button>
            </div>
            
            <div className="space-y-4">
              {addresses.map((addr) => (
                <div key={addr.id} className={`border ${addr.isDefault ? 'border-zinc-200 bg-white' : 'border-zinc-200 bg-zinc-50/30'} rounded-xl p-6 hover:border-[#E8002D] hover:shadow-md transition-all group relative overflow-hidden`}>
                  {addr.isDefault && <div className="absolute top-0 right-0 bg-[#E8002D] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm">Mặc định</div>}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-full ${addr.isDefault ? 'bg-red-50 text-[#E8002D] border-red-100 group-hover:bg-[#E8002D] group-hover:text-white' : 'bg-zinc-100 text-zinc-500 border-zinc-200 group-hover:bg-zinc-200'} flex items-center justify-center shrink-0 border transition-colors`}>
                        <MapPin size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-800 text-zinc-900 text-base">{addr.name}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-300"></div>
                          <span className="text-zinc-600 font-500 text-sm">{addr.phone}</span>
                        </div>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-lg">
                          {addr.street}<br/>
                          {addr.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setAddressForm(addr); setIsAddressModalOpen(true); }} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Chỉnh sửa">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => saveAddresses(addresses.filter(a => a.id !== addr.id))} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  {!addr.isDefault && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex gap-3 ml-16">
                       <button onClick={() => {
                         saveAddresses(addresses.map(a => ({...a, isDefault: a.id === addr.id})));
                       }} className="text-xs font-600 text-zinc-500 hover:text-[#E8002D] uppercase tracking-wider transition-colors bg-white px-3 py-1.5 border border-zinc-200 rounded hover:border-[#E8002D]">
                         Thiết lập mặc định
                       </button>
                    </div>
                  )}
                </div>
              ))}
              {addresses.length === 0 && (
                <div className="text-center py-10 text-zinc-500">Chưa có địa chỉ nào.</div>
              )}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white border border-zinc-100 p-8 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] min-h-[400px] relative">
            {toastMsg && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-600 shadow-lg animate-in fade-in slide-in-from-top-4">
                {toastMsg}
              </div>
            )}
            <h2 className="text-2xl font-display font-900 text-[#0A0A0A] mb-8 border-b border-zinc-100 pb-4">Cài đặt tài khoản & Bảo mật</h2>
            
            {/* Thông báo */}
            <div className="mb-8">
              <h3 className="text-lg font-600 text-zinc-800 mb-4 flex items-center gap-2">
                Cài đặt thông báo
              </h3>
              <div className="space-y-4">
                <div onClick={() => updateSetting('emailNotif')} className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 hover:border-zinc-300 transition-colors cursor-pointer select-none">
                  <div>
                    <p className="font-600 text-zinc-900">Thông báo đơn hàng qua Email/SMS</p>
                    <p className="text-sm text-zinc-500 mt-1">Nhận cập nhật về tình trạng giao hàng, xác nhận thanh toán.</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative shadow-inner flex-shrink-0 transition-colors ${settings.emailNotif ? 'bg-green-500' : 'bg-zinc-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.emailNotif ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                <div onClick={() => updateSetting('promoNotif')} className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 hover:border-zinc-300 transition-colors cursor-pointer select-none">
                  <div>
                    <p className="font-600 text-zinc-900">Khuyến mãi & Tin tức mới</p>
                    <p className="text-sm text-zinc-500 mt-1">Nhận email thông báo về các chương trình giảm giá ưu đãi đặc biệt.</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative shadow-inner flex-shrink-0 transition-colors ${settings.promoNotif ? 'bg-green-500' : 'bg-zinc-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${settings.promoNotif ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bảo mật */}
            <div className="mb-8">
              <h3 className="text-lg font-600 text-zinc-800 mb-4 flex items-center gap-2">
                Bảo mật tài khoản
              </h3>
              <div className="space-y-4">
                <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50/50 hover:border-zinc-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-600 text-zinc-900">Thay đổi mật khẩu</p>
                      <p className="text-sm text-zinc-500 mt-1">Nên cập nhật mật khẩu định kỳ để bảo vệ tài khoản tốt hơn.</p>
                    </div>
                    <button onClick={() => setIsPasswordModalOpen(true)} className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg font-600 text-sm hover:bg-zinc-800 transition-colors">
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vùng nguy hiểm */}
            <div>
              <h3 className="text-lg font-600 text-red-600 mb-4 flex items-center gap-2">
                Vùng nguy hiểm
              </h3>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50/30 flex items-center justify-between hover:bg-red-50/50 transition-colors">
                <div>
                  <p className="font-600 text-zinc-900">Yêu cầu xóa tài khoản</p>
                  <p className="text-sm text-zinc-500 mt-1">Hành động này không thể hoàn tác. Mọi dữ liệu sẽ bị xóa vĩnh viễn.</p>
                </div>
                <button onClick={handleDeleteAccount} className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-600 text-sm hover:bg-red-50 transition-colors">
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </div>
        );
      case 'account':
      default: {
        const dobDateStr = localStorage.getItem(`dob_${user.email}`) || profileForm.dob;
        let isBirthday = false;
        if (dobDateStr) {
           const dobDate = new Date(dobDateStr);
           const today = new Date();
           if (!isNaN(dobDate.getTime())) {
              isBirthday = dobDate.getDate() === today.getDate() && dobDate.getMonth() === today.getMonth();
           }
        }
        
        const usedYear = localStorage.getItem(`birthday_gift_used_year_${user.email}`);
        
        const giftValue = currentTier.name === 'Thành viên Kim Cương' ? 1000000 : currentTier.name === 'Thành viên Vàng' ? 500000 : 200000;
        const giftFormatted = new Intl.NumberFormat('vi-VN').format(giftValue) + 'đ';
        
        // Auto-sync legacy values
        if (typeof window !== 'undefined' && user?.email) {
           const existingVal = localStorage.getItem(`birthday_gift_value_${user.email}`);
           if (!existingVal || parseInt(existingVal) !== giftValue) {
              localStorage.setItem(`birthday_gift_value_${user.email}`, giftValue.toString());
           }
        }
        
        const handleClaimGift = () => {
           localStorage.setItem(`birthday_gift_claimed_year_${user.email}`, new Date().getFullYear().toString());
           localStorage.setItem(`birthday_gift_claimed_date_${user.email}`, new Date().toISOString());
           localStorage.setItem(`birthday_gift_value_${user.email}`, giftValue.toString());
           setShowVoucherCode(true);
           setGiftClaimedThisYear(true);
        };

        return (
          <div className="space-y-6">
            {isBirthday && currentTier.name !== 'Thành viên Đồng' && usedYear !== new Date().getFullYear().toString() && (
               <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px] rounded-[22px] shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  <div className="bg-white rounded-[20px] p-6 relative z-10 flex flex-col sm:flex-row items-center gap-6">
                     <div className="w-16 h-16 bg-gradient-to-br from-pink-50 to-red-50 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-red-100">
                        <span className="text-3xl relative z-10 animate-bounce">🎁</span>
                     </div>
                     <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-xl font-900 text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mb-1">
                           Chúc mừng sinh nhật, {user.name || user.username}!
                        </h3>
                        {!giftClaimedThisYear ? (
                           <p className="text-zinc-600 font-500 text-sm">
                              Hôm nay là sinh nhật của bạn! Với hạng <b className={currentTier.color.replace('bg-', 'text-').split(' ')[1]}>{currentTier.name}</b>, bạn đã được gửi tặng một phần quà sinh nhật đặc biệt. Chúc bạn một ngày thật vui vẻ!
                           </p>
                        ) : (
                           <p className="text-zinc-600 font-500 text-sm">
                              Quà của bạn là mã giảm giá <b className="text-red-600 text-lg px-2 bg-red-50 rounded border border-red-100 font-display">HAPPYBDAY2026</b>. (Giảm {giftFormatted}, hạn sử dụng trong 15 ngày). Hãy sao chép và dùng ở trang thanh toán nhé!
                           </p>
                        )}
                     </div>
                     {!giftClaimedThisYear ? (
                        <button onClick={handleClaimGift} className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-2.5 rounded-lg font-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap active:scale-95">
                           Nhận quà ngay
                        </button>
                     ) : (
                        <button onClick={() => { navigator.clipboard.writeText('HAPPYBDAY2026'); alert('Đã sao chép mã voucher HAPPYBDAY2026!'); }} className="bg-zinc-100 text-zinc-600 px-6 py-2.5 rounded-lg font-700 hover:bg-zinc-200 transition-all whitespace-nowrap border border-zinc-200 active:scale-95">
                           Sao chép mã
                        </button>
                     )}
                  </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-600 uppercase">Đơn hàng</p>
                  <p className="text-2xl font-900 text-zinc-900">{orders.length}</p>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-[#E8002D] rounded-full flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-600 uppercase">Tích luỹ</p>
                  <p className="text-2xl font-900 text-zinc-900">{formattedAccumulated}</p>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-600 uppercase">Đã tham gia</p>
                  <p className="text-2xl font-900 text-zinc-900">{joinedDate}</p>
                </div>
              </div>
            </div>
            
            {/* Premium Progress Bar Section */}
            <div className="relative overflow-hidden bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm mb-8">
              {/* Optional background glow */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-[#E8002D]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-zinc-50 flex items-center justify-center shadow-inner border border-zinc-100">
                      <TrendingUp className="text-[#E8002D]" size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-800 text-zinc-900 tracking-tight">Tiến trình hạng thành viên</h3>
                      <p className="text-sm text-zinc-500 font-500 mt-1">Tích lũy chi tiêu để nhận nhiều ưu đãi</p>
                    </div>
                  </div>
                  <div className={`px-5 py-2.5 ${currentTier.color.replace('bg-', 'bg-').replace('100', '50')} border ${currentTier.color.replace('bg-', 'border-').replace('100', '200')} shadow-sm text-sm font-700 rounded-full flex items-center gap-2 w-fit`}>
                    {currentTier.next ? <Star size={18} /> : <Crown size={18} className="text-blue-600" />}
                    {currentTier.name}
                  </div>
                </div>

                {currentTier.next ? (
                  <div className="bg-zinc-50/80 rounded-xl p-6 md:p-8 border border-zinc-100">
                     <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-sm font-600 text-zinc-500 mb-1">Đã tích lũy</p>
                          <p className="text-2xl md:text-3xl font-900 text-zinc-900 tracking-tight">{formattedAccumulated}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-600 text-zinc-500 mb-1">Mục tiêu <span className="text-[#E8002D]">{currentTier.nextName}</span></p>
                          <p className="text-xl md:text-2xl font-800 text-zinc-700 tracking-tight">{new Intl.NumberFormat('vi-VN').format(currentTier.next)} ₫</p>
                        </div>
                     </div>
                     <div className="relative mt-4 mb-8">
                        <div className="w-full bg-zinc-200 h-5 rounded-full overflow-hidden shadow-inner relative">
                           <div className="h-full bg-gradient-to-r from-[#E8002D] to-red-500 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${Math.min(100, (totalAccumulated / 50000000) * 100)}%` }}>
                             <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                           </div>
                        </div>
                        
                        {/* Milestones */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-3.5 h-3.5 bg-white rounded-full shadow border-[3px] border-red-500 z-10">
                           <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-700 text-red-500">Đồng</div>
                        </div>
                        <div className={`absolute top-1/2 -translate-y-1/2 left-[10%] w-3.5 h-3.5 bg-white rounded-full shadow border-[3px] z-10 ${totalAccumulated >= 5000000 ? 'border-red-500' : 'border-zinc-300'}`}>
                           <div className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-700 ${totalAccumulated >= 5000000 ? 'text-red-500' : 'text-zinc-400'}`}>Bạc</div>
                        </div>
                        <div className={`absolute top-1/2 -translate-y-1/2 left-[40%] w-3.5 h-3.5 bg-white rounded-full shadow border-[3px] z-10 ${totalAccumulated >= 20000000 ? 'border-red-500' : 'border-zinc-300'}`}>
                           <div className={`absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-700 ${totalAccumulated >= 20000000 ? 'text-red-500' : 'text-zinc-400'}`}>Vàng</div>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3.5 h-3.5 bg-white rounded-full shadow border-[3px] border-zinc-300 z-10">
                           <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-700 text-zinc-400">Kim Cương</div>
                        </div>
                     </div>
                     <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between text-sm gap-3">
                        <p className="text-zinc-600 font-500">
                          Mua thêm <b className="text-zinc-900 text-lg mx-1">{new Intl.NumberFormat('vi-VN').format(currentTier.next - totalAccumulated)} ₫</b> để thăng hạng
                        </p>
                        <span className="text-[#E8002D] font-700 flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"><Crown size={16} /> Đặc quyền đang chờ!</span>
                     </div>
                     
                     <div className="mt-6 pt-6 border-t border-zinc-200/60">
                        <h4 className="text-sm font-700 text-zinc-800 mb-4 flex items-center gap-2">
                           <Star size={16} className="text-yellow-500" /> Đặc quyền {currentTier.name}
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {currentTier.benefits.map((b, i) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 font-500">
                                 <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[#E8002D] shadow-sm flex-shrink-0"></div>
                                 {b}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 rounded-xl p-5 border border-blue-100 flex flex-col gap-3">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                         <Crown size={20} />
                       </div>
                       <div>
                         <h4 className="text-base font-800 text-indigo-700">
                           Hạng Thành Viên Tối Đa
                         </h4>
                         <p className="text-blue-800/80 text-[13px] font-500 mt-0.5">Bạn đã đạt mức hạng cao nhất với tổng chi tiêu cực khủng. Cảm ơn bạn!</p>
                       </div>
                     </div>
                     
                     <div className="w-full bg-white/60 px-5 pt-4 pb-2 rounded-xl border border-white shadow-sm mt-1">
                         <div className="flex justify-between text-xs text-blue-800 mb-2 font-700">
                            <span className="flex items-center gap-2">Đã tích lũy: <span className="text-blue-900">{formattedAccumulated}</span></span>
                            <span className="uppercase text-indigo-600">Vô cực</span>
                         </div>
                         <div className="relative mt-2 mb-6">
                            <div className="w-full bg-blue-100/50 h-3 rounded-full overflow-hidden shadow-inner relative border border-blue-200/50">
                               <div className="h-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full w-full relative">
                                 <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                               </div>
                            </div>
                            
                            {/* Milestones */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 bg-white rounded-full shadow border-[2px] border-blue-400 z-10"></div>
                            <div className="absolute top-1/2 -translate-y-1/2 left-[10%] w-2.5 h-2.5 bg-white rounded-full shadow border-[2px] border-indigo-400 z-10">
                               <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-700 text-indigo-700">Bạc</div>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-2.5 h-2.5 bg-white rounded-full shadow border-[2px] border-purple-400 z-10">
                               <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-700 text-purple-700">Vàng</div>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-0 w-3 h-3 bg-white rounded-full shadow border-[2px] border-purple-600 z-10 flex items-center justify-center">
                               <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-900 text-purple-800">Kim Cương</div>
                            </div>
                         </div>
                     </div>
                     
                      {/* Bảng Đặc Quyền Kim Cương */}
                      <div className="mt-4 bg-white/60 px-5 py-4 rounded-xl border border-white shadow-sm">
                        <h4 className="text-sm font-800 text-indigo-800 mb-3 flex items-center gap-2">
                           <Crown size={16} className="text-indigo-600" /> Đặc quyền của bạn
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                           {currentTier.benefits.map((b, i) => (
                              <li key={i} className="flex items-start gap-2 text-[13px] text-blue-900 font-600">
                                 <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-500 flex-shrink-0 shadow-sm"></div>
                                 {b}
                              </li>
                           ))}
                        </ul>
                      </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-zinc-100 p-8 md:p-10 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.03)] mt-8">
              <h2 className="text-2xl font-display font-900 text-[#0A0A0A] mb-8 border-b border-zinc-100 pb-4">Cập nhật thông tin chi tiết</h2>
              
              <div className="space-y-6 max-w-2xl">
                {profileMessage.text && (
                  <div className={`p-4 rounded-lg text-sm font-600 ${profileMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {profileMessage.text}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-zinc-700 mb-2 font-600">Tên đăng nhập</label>
                    <input type="text" readOnly value={user.username || ''} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-lg px-4 py-3 cursor-not-allowed font-500" />
                    <p className="text-xs text-zinc-400 mt-1.5">* Tên đăng nhập không thể thay đổi</p>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-700 mb-2 font-600">Địa chỉ Email</label>
                    <input type="email" readOnly value={user.email || ''} className="w-full bg-zinc-50 border border-zinc-200 text-zinc-500 rounded-lg px-4 py-3 cursor-not-allowed font-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-zinc-700 mb-2 font-600">Họ và tên</label>
                    <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} placeholder="Nhập họ và tên đầy đủ..." className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E8002D]/20 focus:border-[#E8002D] transition-all font-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-700 mb-2 font-600">Số điện thoại</label>
                    <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} placeholder="Nhập số điện thoại liên hệ..." className="w-full bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E8002D]/20 focus:border-[#E8002D] transition-all font-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-700 mb-2 font-600">Ngày sinh</label>
                  <input type="date" value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})} className="w-full md:w-1/2 bg-white border border-zinc-300 text-zinc-900 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E8002D]/20 focus:border-[#E8002D] transition-all font-500" />
                </div>
                
                <div className="pt-6 border-t border-zinc-100 mt-8 flex gap-4">
                  <button 
                    type="button" 
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="bg-[#E8002D] text-white px-8 py-3 rounded-lg font-600 shadow-sm shadow-red-500/30 hover:bg-red-700 hover:shadow-red-500/50 disabled:opacity-70 transition-all text-sm uppercase tracking-wide flex items-center justify-center min-w-[140px]"
                  >
                    {isSavingProfile ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Lưu thay đổi'}
                  </button>
                  <button type="button" onClick={() => setProfileForm({ name: user.name || user.username || '', phone: user.phone || '', dob: localStorage.getItem(`dob_${user.email}`) || '' })} className="bg-zinc-100 text-zinc-700 px-8 py-3 rounded-lg font-600 hover:bg-zinc-200 transition-all text-sm">
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <>
      {loadingData && <LoadingScreen />}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
        <h1 className="text-4xl font-display font-900 text-[#0A0A0A] mb-10 tracking-tight">
          HỒ SƠ <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0000] to-[#ff6a00]">CÁ NHÂN</span>
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-zinc-100 p-8 shadow-[0_15px_40px_rgba(0,0,0,0.03)] rounded-[2rem] flex flex-col items-center relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 rounded-full blur-2xl pointer-events-none" />
            <div className="w-24 h-24 bg-zinc-100 border-4 border-white shadow-sm rounded-full flex items-center justify-center mb-4 relative group overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-zinc-400" />
              )}
              
              {/* Overlay for uploading */}
              <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {isUploadingAvatar ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Camera size={20} className="mb-1" />
                    <span className="text-[10px] font-600">Thay đổi</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </label>

              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center z-10" title="Đã xác thực">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <p className="text-center text-zinc-900 font-700 text-lg">{user.username || 'Người dùng'}</p>
            <p className="text-center text-sm text-zinc-500 mt-1">{user.email}</p>
            <div className={`mt-4 px-3 py-1 ${currentTier.color} text-xs font-600 rounded-full`}>{currentTier.name}</div>
          </div>
          
          <div className="bg-white border border-zinc-100 shadow-[0_15px_40px_rgba(0,0,0,0.03)] rounded-[1.5rem] overflow-hidden">
            <button 
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center justify-between px-6 py-4.5 text-[13px] font-display font-800 tracking-wider uppercase transition-all duration-300 ${activeTab === 'account' ? 'bg-zinc-50/80 border-l-[3px] border-[#ff0000] text-[#0A0A0A]' : 'text-zinc-500 hover:text-[#0A0A0A] hover:bg-zinc-50/50 border-l-[3px] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <User size={18} className={activeTab === 'account' ? 'text-[#ff0000]' : ''} />
                Thông tin
              </div>
              <ChevronRight size={16} className={activeTab === 'account' ? 'opacity-100' : 'opacity-0'} />
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-6 py-4.5 text-[13px] font-display font-800 tracking-wider uppercase transition-all duration-300 border-t border-zinc-100/50 ${activeTab === 'orders' ? 'bg-zinc-50/80 border-l-[3px] border-[#ff0000] text-[#0A0A0A]' : 'text-zinc-500 hover:text-[#0A0A0A] hover:bg-zinc-50/50 border-l-[3px] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Package size={18} className={activeTab === 'orders' ? 'text-[#ff0000]' : ''} />
                Đơn hàng
              </div>
              <ChevronRight size={16} className={activeTab === 'orders' ? 'opacity-100' : 'opacity-0'} />
            </button>
            <button 
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center justify-between px-6 py-4.5 text-[13px] font-display font-800 tracking-wider uppercase transition-all duration-300 border-t border-zinc-100/50 ${activeTab === 'favorites' ? 'bg-zinc-50/80 border-l-[3px] border-[#ff0000] text-[#0A0A0A]' : 'text-zinc-500 hover:text-[#0A0A0A] hover:bg-zinc-50/50 border-l-[3px] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Heart size={18} className={activeTab === 'favorites' ? 'text-[#ff0000]' : ''} />
                Yêu thích
              </div>
              <ChevronRight size={16} className={activeTab === 'favorites' ? 'opacity-100' : 'opacity-0'} />
            </button>
            <button 
              onClick={() => setActiveTab('address')}
              className={`w-full flex items-center justify-between px-6 py-4.5 text-[13px] font-display font-800 tracking-wider uppercase transition-all duration-300 border-t border-zinc-100/50 ${activeTab === 'address' ? 'bg-zinc-50/80 border-l-[3px] border-[#ff0000] text-[#0A0A0A]' : 'text-zinc-500 hover:text-[#0A0A0A] hover:bg-zinc-50/50 border-l-[3px] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <MapPin size={18} className={activeTab === 'address' ? 'text-[#ff0000]' : ''} />
                Sổ địa chỉ
              </div>
              <ChevronRight size={16} className={activeTab === 'address' ? 'opacity-100' : 'opacity-0'} />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-6 py-4.5 text-[13px] font-display font-800 tracking-wider uppercase transition-all duration-300 border-t border-zinc-100/50 ${activeTab === 'settings' ? 'bg-zinc-50/80 border-l-[3px] border-[#ff0000] text-[#0A0A0A]' : 'text-zinc-500 hover:text-[#0A0A0A] hover:bg-zinc-50/50 border-l-[3px] border-transparent'}`}
            >
              <div className="flex items-center gap-3">
                <Settings size={18} className={activeTab === 'settings' ? 'text-[#ff0000]' : ''} />
                Cài đặt
              </div>
              <ChevronRight size={16} className={activeTab === 'settings' ? 'opacity-100' : 'opacity-0'} />
            </button>
          </div>
          
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-white text-zinc-600 hover:text-red-500 hover:bg-red-50 transition-colors text-[13px] border border-zinc-100 rounded-[1.5rem] font-display font-800 tracking-wider uppercase shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
      
      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-700 text-zinc-900">{addressForm.id ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Họ và tên</label>
                <input type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E8002D] focus:border-transparent outline-none text-zinc-900" placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Số điện thoại</label>
                <input type="text" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E8002D] focus:border-transparent outline-none text-zinc-900" placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Tỉnh/Thành phố, Quận/Huyện</label>
                <input type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E8002D] focus:border-transparent outline-none text-zinc-900" placeholder="Ví dụ: TP. Hồ Chí Minh" />
              </div>
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Địa chỉ cụ thể</label>
                <textarea value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#E8002D] focus:border-transparent outline-none min-h-[80px] text-zinc-900" placeholder="Số nhà, tên đường, phường/xã..." />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm({...addressForm, isDefault: e.target.checked})} className="w-4 h-4 text-[#E8002D] focus:ring-[#E8002D] border-zinc-300 rounded" />
                <label htmlFor="isDefault" className="text-sm text-zinc-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <button onClick={() => setIsAddressModalOpen(false)} className="px-5 py-2 font-600 text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors">Hủy</button>
              <button 
                onClick={() => {
                  if (addressForm.id) {
                    let updated = addresses.map(a => a.id === addressForm.id ? addressForm : a);
                    if (addressForm.isDefault) updated = updated.map(a => ({...a, isDefault: a.id === addressForm.id}));
                    saveAddresses(updated);
                  } else {
                    const newAddr = { ...addressForm, id: Date.now() };
                    let updated = [...addresses, newAddr];
                    // If it's the first address, make it default automatically
                    if (updated.length === 1 || newAddr.isDefault) {
                      updated = updated.map(a => ({...a, isDefault: a.id === newAddr.id}));
                    }
                    saveAddresses(updated);
                  }
                  setIsAddressModalOpen(false);
                }} 
                className="px-5 py-2 font-600 text-white bg-[#E8002D] hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Lưu địa chỉ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="font-700 text-zinc-900">Thay đổi mật khẩu</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Mật khẩu hiện tại</label>
                <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none text-zinc-900" placeholder="Nhập mật khẩu hiện tại" />
              </div>
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Mật khẩu mới</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none text-zinc-900" placeholder="Nhập mật khẩu mới" />
              </div>
              <div>
                <label className="block text-sm font-600 text-zinc-700 mb-1.5">Xác nhận mật khẩu mới</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none text-zinc-900" placeholder="Nhập lại mật khẩu mới" />
              </div>
            </div>
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <button onClick={() => setIsPasswordModalOpen(false)} className="px-5 py-2 font-600 text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors">Hủy</button>
              <button 
                onClick={handleChangePasswordSubmit}
                disabled={isChangingPassword}
                className="px-5 py-2 font-600 text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center min-w-[140px]"
              >
                {isChangingPassword ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
