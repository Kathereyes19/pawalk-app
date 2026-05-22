import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUserId } from '@/lib/mockUser';
import {
  createMarketplaceOrder,
  fetchMarketplaceProducts,
  filterMarketplaceProducts,
  getMarketplacePriceBounds,
} from '@/features/marketplace';
import { loadStoredCart, saveStoredCart } from '@/lib/marketplaceStorage';
import type {
  CartLineItem,
  CartProduct,
  CreateMarketplaceOrderInput,
  MarketplaceFilters,
  MarketplaceOrder,
  MarketplaceProduct,
  MarketplaceView,
} from '@/types';
import { DEFAULT_MARKETPLACE_FILTERS as DEFAULT_FILTERS } from '@/types/marketplace';

export interface MarketplaceContextValue {
  products: MarketplaceProduct[];
  filteredProducts: MarketplaceProduct[];
  filters: MarketplaceFilters;
  priceBounds: { min: number; max: number };
  isLoading: boolean;
  error: string | null;
  view: MarketplaceView;
  selectedProduct: MarketplaceProduct | null;
  cartItems: CartLineItem[];
  cartProducts: CartProduct[];
  cartCount: number;
  cartSubtotal: number;
  lastOrder: MarketplaceOrder | null;
  setFilters: React.Dispatch<React.SetStateAction<MarketplaceFilters>>;
  resetFilters: () => void;
  refreshProducts: () => Promise<void>;
  openProduct: (productId: string) => void;
  goHome: () => void;
  openCart: () => void;
  openCheckout: () => void;
  goBack: () => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (input: CreateMarketplaceOrderInput) => Promise<{ error: string | null }>;
}

const MarketplaceContext = createContext<MarketplaceContextValue | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, session, isLoading: authLoading } = useAuth();
  const userId = resolveUserId(user?.id ?? null);

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [filters, setFilters] = useState<MarketplaceFilters>({ ...DEFAULT_FILTERS });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<MarketplaceView>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartLineItem[]>([]);
  const [lastOrder, setLastOrder] = useState<MarketplaceOrder | null>(null);

  const refreshProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { products: fetched, error: fetchError } = await fetchMarketplaceProducts();
    setProducts(fetched);
    setError(fetchError?.message ?? null);
    const bounds = getMarketplacePriceBounds(fetched);
    setFilters((current) => ({
      ...current,
      maxPrice: Math.max(current.maxPrice, bounds.max),
    }));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setCartItems([]);
      return;
    }
    setCartItems(loadStoredCart(userId));
  }, [authLoading, userId, session?.user?.id]);

  const persistCart = useCallback(
    (items: CartLineItem[]) => {
      setCartItems(items);
      if (userId) saveStoredCart(userId, items);
    },
    [userId]
  );

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const filteredProducts = useMemo(
    () => filterMarketplaceProducts(products, filters),
    [products, filters]
  );

  const priceBounds = useMemo(() => getMarketplacePriceBounds(products), [products]);

  const selectedProduct = useMemo(
    () => (selectedProductId ? productMap.get(selectedProductId) ?? null : null),
    [selectedProductId, productMap]
  );

  const cartProducts = useMemo<CartProduct[]>(() => {
    return cartItems
      .map((item) => {
        const product = productMap.get(item.productId);
        if (!product) return null;
        return {
          ...product,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean) as CartProduct[];
  }, [cartItems, productMap]);

  const cartSubtotal = useMemo(
    () => cartProducts.reduce((sum, item) => sum + item.lineTotal, 0),
    [cartProducts]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const resetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      maxPrice: priceBounds.max,
    });
  }, [priceBounds.max]);

  const openProduct = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setView('product');
  }, []);

  const goHome = useCallback(() => {
    setView('home');
    setSelectedProductId(null);
  }, []);

  const openCart = useCallback(() => setView('cart'), []);
  const openCheckout = useCallback(() => setView('checkout'), []);

  const goBack = useCallback(() => {
    if (view === 'product') setView('home');
    else if (view === 'checkout') setView('cart');
    else if (view === 'cart') setView('home');
    else goHome();
  }, [view, goHome]);

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      const product = productMap.get(productId);
      if (!product?.inStock) return;

      const next = [...cartItems];
      const existing = next.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        next.push({ productId, quantity });
      }
      persistCart(next);
    },
    [cartItems, productMap, persistCart]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      persistCart(cartItems.filter((item) => item.productId !== productId));
    },
    [cartItems, persistCart]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      persistCart(
        cartItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    },
    [cartItems, persistCart, removeFromCart]
  );

  const clearCart = useCallback(() => persistCart([]), [persistCart]);

  const placeOrder = useCallback(
    async (input: CreateMarketplaceOrderInput) => {
      if (!userId) return { error: 'Inicia sesión para completar la compra.' };
      if (cartProducts.length === 0) return { error: 'Tu carrito está vacío.' };

      const items = cartProducts.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { order, error: orderError } = await createMarketplaceOrder(
        userId,
        items,
        cartSubtotal,
        input
      );

      if (orderError || !order) {
        return { error: orderError?.message ?? 'No se pudo procesar el pedido.' };
      }

      setLastOrder(order);
      clearCart();
      setView('confirmed');
      return { error: null };
    },
    [userId, cartProducts, cartSubtotal, clearCart]
  );

  const value = useMemo<MarketplaceContextValue>(
    () => ({
      products,
      filteredProducts,
      filters,
      priceBounds,
      isLoading,
      error,
      view,
      selectedProduct,
      cartItems,
      cartProducts,
      cartCount,
      cartSubtotal,
      lastOrder,
      setFilters,
      resetFilters,
      refreshProducts,
      openProduct,
      goHome,
      openCart,
      openCheckout,
      goBack,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
    }),
    [
      products,
      filteredProducts,
      filters,
      priceBounds,
      isLoading,
      error,
      view,
      selectedProduct,
      cartItems,
      cartProducts,
      cartCount,
      cartSubtotal,
      lastOrder,
      resetFilters,
      refreshProducts,
      openProduct,
      goHome,
      openCart,
      openCheckout,
      goBack,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
    ]
  );

  return (
    <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>
  );
};

export function useMarketplace(): MarketplaceContextValue {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
