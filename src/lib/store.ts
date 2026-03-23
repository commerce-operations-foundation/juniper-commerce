// Simple in-memory store for demo purposes
// In production this would be a database

export interface CartItem {
  sku: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  options?: Record<string, string>;
}

export interface Cart {
  id: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

const carts = new Map<string, Cart>();

export function getCart(cartId: string): Cart | undefined {
  return carts.get(cartId);
}

export function setCart(cartId: string, cart: Cart): void {
  carts.set(cartId, cart);
}

export function createCart(cartId: string): Cart {
  const cart: Cart = {
    id: cartId,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  carts.set(cartId, cart);
  return cart;
}
