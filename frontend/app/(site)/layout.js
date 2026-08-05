'use client';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/Header';

export default function SiteLayout({ children }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F8F8F7]">
        <Header />
        {children}
      </div>
    </CartProvider>
  );
}
