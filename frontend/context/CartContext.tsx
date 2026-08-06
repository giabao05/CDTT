'use client';
import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Cart, CartItem, Product, ProductVariant } from '../types';

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; variant: ProductVariant; quantity?: number }
  | { type: 'REMOVE_ITEM'; variantId: string }
  | { type: 'UPDATE_QTY'; variantId: string; quantity: number }
  | { type: 'APPLY_COUPON'; code: string; discount: number }
  | { type: 'REMOVE_COUPON' }
  | { type: 'CLEAR' };

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
      return { ...state, couponCode: action.discount > 0 ? action.code.toUpperCase() : null, discount: action.discount };
    }
    case 'REMOVE_COUPON':
      return { ...state, couponCode: null, discount: 0 };
    case 'CLEAR':
      return { items: [], couponCode: null, discount: 0 };
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
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, { items: [], couponCode: null, discount: 0 });

  const subtotal = cart.items.reduce(
    (sum, item) => sum + (item.variant.salePrice ?? item.variant.price) * item.quantity,
    0
  );
  const shippingFee = subtotal >= 5000000 ? 0 : 30000;
  const discountAmount = Math.round(subtotal * cart.discount);
  const totalAmount = subtotal - discountAmount + shippingFee;
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = (product: Product, variant: ProductVariant, quantity?: number) =>
    dispatch({ type: 'ADD_ITEM', product, variant, quantity });

  const removeItem = (variantId: string) =>
    dispatch({ type: 'REMOVE_ITEM', variantId });

  const updateQty = (variantId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QTY', variantId, quantity });

  const applyCoupon = (code: string, discount: number) => {
    dispatch({ type: 'APPLY_COUPON', code, discount });
  };

  const removeCoupon = () => dispatch({ type: 'REMOVE_COUPON' });
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
