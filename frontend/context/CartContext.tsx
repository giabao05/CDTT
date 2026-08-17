'use client';
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Cart, CartItem, Product, ProductVariant } from '../types';

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; variant: ProductVariant; quantity?: number }
  | { type: 'REMOVE_ITEM'; variantId: string }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'APPLY_COUPON'; code: string; discount: number; isGift: boolean }
  | { type: 'REMOVE_COUPON'; code: string }
  | { type: 'CLEAR' };

import { useAuthStore } from '../store/authStore';
import { createNotification, notifyFrontendUpdate } from '../lib/api';

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case 'ADD_ITEM': {
      const q = action.quantity ?? 1;
      const existing = state.items.findIndex(i => i.variant.id === action.variant.id);
      if (existing >= 0) {
        const items = [...state.items];
        items[existing] = { ...items[existing], quantity: items[existing].quantity + q };
        return { ...state, items };
      }
      const newItem: CartItem = { product: action.product, variant: action.variant, quantity: q };
      return { ...state, items: [...state.items, newItem] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.variant.id !== action.variantId) };
    case 'UPDATE_QTY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter(i => i.variant.id !== action.variantId) };
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.variant.id === action.variantId ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case 'APPLY_COUPON': {
      // If it's a system voucher (not gift), remove existing system vouchers
      let newCoupons = [...state.coupons];
      if (!action.isGift) {
        newCoupons = newCoupons.filter(c => c.isGift);
      }
      // Remove same code if exists
      newCoupons = newCoupons.filter(c => c.code !== action.code.toUpperCase());
      newCoupons.push({ code: action.code.toUpperCase(), discount: action.discount, isGift: action.isGift });
      return { ...state, coupons: newCoupons };
    }
    case 'REMOVE_COUPON':
      return { ...state, coupons: state.coupons.filter(c => c.code !== action.code) };
    case 'CLEAR':
      return { items: [], coupons: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  cart: Cart;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string, discount: number, isGift?: boolean) => void;
  removeCoupon: (code: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], coupons: [] });

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.variant.salePrice ?? item.variant.price) * item.quantity,
    0
  );
  const shippingFee = subtotal >= 5000000 ? 0 : 30000;
  
  const discountAmount = cart.coupons.reduce((sum, c) => {
     let d = c.discount > 1 ? Math.min(c.discount, subtotal) : Math.round(subtotal * c.discount);
     return sum + d;
  }, 0);
  
  const totalAmount = Math.max(0, subtotal - discountAmount) + shippingFee;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product: Product, variant: ProductVariant, quantity?: number) => {
    dispatch({ type: 'ADD_ITEM', product, variant, quantity });
    const user = useAuthStore.getState().user;
    if (user && user.email) {
      createNotification(
        user.email,
        'Thêm vào giỏ hàng',
        `Bạn đã thêm ${quantity || 1} sản phẩm ${product.name} (Bản ${variant.storage}) vào giỏ hàng thành công.`
      ).then(() => {
        notifyFrontendUpdate();
      });
    }
  };

  const removeItem = (variantId: string) =>
    dispatch({ type: 'REMOVE_ITEM', variantId });

  const updateQty = (variantId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QTY', variantId, quantity });

  const applyCoupon = (code: string, discount: number, isGift: boolean = false) => {
    dispatch({ type: 'APPLY_COUPON', code, discount, isGift });
  };

  const removeCoupon = (code: string) => dispatch({ type: 'REMOVE_COUPON', code });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{
      cart, totalItems, subtotal, discountAmount, shippingFee, totalAmount,
      addItem, removeItem, updateQty, applyCoupon, removeCoupon, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
