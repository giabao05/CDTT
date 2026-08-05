'use client';
import { useState } from 'react';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, User, Phone } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { name, email, password, phone });
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      // Chuyển hướng người dùng sang trang đăng nhập thay vì tự động đăng nhập
      router.push('/login');
    } catch (err) {
      setError('Đăng ký thất bại. Email có thể đã được sử dụng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Tính năng đăng ký bằng ${provider} sẽ sớm được cập nhật! Vui lòng chờ thiết lập Backend.`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 flex-row-reverse">
      {/* Right side - Branding/Image */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-700 to-indigo-600 opacity-90 z-0"></div>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 text-white p-12 flex flex-col items-start max-w-lg">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/30 shadow-xl">
            <span className="text-3xl font-bold">PS</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Gia nhập cộng đồng PhoneStore
          </h1>
          <p className="text-lg text-indigo-100 font-medium">
            Tạo tài khoản ngay hôm nay để nhận thông báo về những ưu đãi công nghệ mới nhất.
          </p>
        </div>
      </div>

      {/* Left side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Đăng ký tài khoản</h2>
            <p className="text-slate-500 font-medium">Bắt đầu trải nghiệm mua sắm tuyệt vời</p>
          </div>
          
          {error && (
            <div className="bg-red-50/50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="diachi@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md shadow-indigo-600/20 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500 font-medium">Hoặc đăng ký với</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button
                onClick={() => handleSocialLogin('Facebook')}
                className="flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
              >
                <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => handleSocialLogin('Twitter')}
                className="flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-sm"
              >
                <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 font-medium">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline underline-offset-4 transition-all">
              Đăng nhập tại đây
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
