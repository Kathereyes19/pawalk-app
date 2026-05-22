import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { usePaymentMethods } from '@/contexts/PaymentMethodsContext';
import { useUserData } from '@/contexts/UserDataContext';
import { maskCardNumber } from '@/lib/paymentCardUtils';
import { ProductCard } from '../components/marketplace/ProductCard';
import { CartItemRow } from '../components/marketplace/CartItemRow';
import { MarketplaceFilterSheet } from '../components/marketplace/MarketplaceFilterSheet';
import { PaymentMethodCard } from '../components/payments/PaymentMethodCard';
import { AddPaymentMethodSheet } from '../components/payments/AddPaymentMethodSheet';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import type { CheckoutPaymentSelection } from '@/types';

export const MarketplaceScreen: React.FC = () => {
  const { t } = useLanguage();
  const { profile } = useUserData();
  const marketplace = useMarketplace();
  const { view } = marketplace;

  return (
    <div className="h-full overflow-hidden bg-background-secondary relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {view === 'home' && <MarketplaceHomeView />}
          {view === 'product' && <MarketplaceProductView />}
          {view === 'cart' && <MarketplaceCartView />}
          {view === 'checkout' && <MarketplaceCheckoutView profileAddress={profile?.neighborhood} />}
          {view === 'confirmed' && <MarketplaceOrderConfirmedView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const MarketplaceHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  cartCount?: number;
  onCart?: () => void;
}> = ({ title, subtitle, onBack, cartCount = 0, onCart }) => (
  <div className="sticky top-0 z-10 bg-gradient-to-br from-primary to-accent px-4 pt-4 pb-5 shadow-lg">
    <div className="flex items-center justify-between mb-3">
      {onBack ? (
        <IconButton
          onClick={onBack}
          variant="ghost"
          className="bg-white/20 text-white hover:bg-white/30 border-0 min-w-11 min-h-11"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
      ) : (
        <div className="w-11" />
      )}
      {onCart && (
        <button
          type="button"
          onClick={onCart}
          className="relative p-2.5 rounded-full bg-white/20 text-white min-w-11 min-h-11 flex items-center justify-center"
          aria-label="Carrito"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      )}
    </div>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    {subtitle && <p className="text-white/90 text-sm mt-1">{subtitle}</p>}
  </div>
);

function MarketplaceHomeView() {
  const { t } = useLanguage();
  const {
    filteredProducts,
    filters,
    setFilters,
    resetFilters,
    priceBounds,
    isLoading,
    cartCount,
    openProduct,
    openCart,
  } = useMarketplace();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto pb-24">
      <MarketplaceHeader
        title={t('marketplace.title')}
        subtitle={t('marketplace.subtitle')}
        cartCount={cartCount}
        onCart={openCart}
      />

      <div className="p-4 space-y-4 -mt-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('marketplace.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-3 rounded-2xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="shrink-0 w-12 h-12 rounded-2xl border border-border bg-card flex items-center justify-center text-primary"
            aria-label="Filtros"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-semibold">{t('marketplace.empty.title')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('marketplace.empty.desc')}</p>
            <Button size="sm" className="mt-4" variant="outline" onClick={resetFilters}>
              {t('marketplace.filters.reset')}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <ProductCard product={product} onClick={() => openProduct(product.id)} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MarketplaceFilterSheet
        open={filtersOpen}
        filters={filters}
        priceBounds={priceBounds}
        onClose={() => setFiltersOpen(false)}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onReset={resetFilters}
      />
    </div>
  );
}

function MarketplaceProductView() {
  const { t } = useLanguage();
  const { selectedProduct, goBack, addToCart, openCart, cartCount } = useMarketplace();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!selectedProduct) {
    return (
      <div className="h-full flex items-center justify-center">
        <Button onClick={goBack}>{t('back')}</Button>
      </div>
    );
  }

  const gallery = selectedProduct.gallery.length
    ? selectedProduct.gallery
    : [selectedProduct.imageEmoji];

  return (
    <div className="h-full overflow-y-auto pb-28">
      <MarketplaceHeader
        title={selectedProduct.name}
        subtitle={t(`marketplace.category.${selectedProduct.category}`)}
        onBack={goBack}
        cartCount={cartCount}
        onCart={openCart}
      />

      <div className="p-4 space-y-4">
        <Card padding="none" className="overflow-hidden">
          <div className="h-56 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center text-7xl">
            {gallery[galleryIndex]}
          </div>
          <div className="flex gap-2 p-3 overflow-x-auto">
            {gallery.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setGalleryIndex(index)}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                  galleryIndex === index ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-primary">
              ${selectedProduct.price.toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{selectedProduct.rating.toFixed(1)}</span>
              <span>({selectedProduct.reviewCount})</span>
            </div>
          </div>
          <Badge variant={selectedProduct.inStock ? 'success' : 'default'}>
            {selectedProduct.inStock ? t('marketplace.inStock') : t('marketplace.outOfStock')}
          </Badge>
        </div>

        <Card>
          <h3 className="font-semibold mb-2">{t('marketplace.description')}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {selectedProduct.description}
          </p>
        </Card>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('marketplace.quantity')}</span>
          <div className="flex items-center gap-2 bg-muted/60 rounded-xl p-1">
            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              -
            </IconButton>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => setQuantity((value) => value + 1)}
            >
              +
            </IconButton>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 z-20">
        <div className="max-w-md mx-auto">
          <Button
            fullWidth
            size="xl"
            disabled={!selectedProduct.inStock}
            onClick={() => {
              addToCart(selectedProduct.id, quantity);
              openCart();
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            {t('marketplace.addToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MarketplaceCartView() {
  const { t } = useLanguage();
  const { cartProducts, cartSubtotal, goBack, openCheckout, updateCartQuantity, removeFromCart } =
    useMarketplace();

  return (
    <div className="h-full overflow-y-auto pb-28">
      <MarketplaceHeader title={t('marketplace.cart.title')} onBack={goBack} />

      <div className="p-4 space-y-3">
        {cartProducts.length === 0 ? (
          <Card className="text-center py-12">
            <ShoppingCart className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-semibold">{t('marketplace.cart.empty')}</p>
          </Card>
        ) : (
          cartProducts.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onIncrease={() => updateCartQuantity(item.id, item.quantity + 1)}
              onDecrease={() => updateCartQuantity(item.id, item.quantity - 1)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))
        )}
      </div>

      {cartProducts.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-20">
          <Card className="max-w-md mx-auto shadow-xl border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{t('marketplace.subtotal')}</span>
              <span className="text-xl font-bold text-primary">${cartSubtotal.toLocaleString()}</span>
            </div>
            <Button fullWidth size="xl" onClick={openCheckout}>
              {t('marketplace.checkout.cta')}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function MarketplaceCheckoutView({ profileAddress }: { profileAddress?: string | null }) {
  const { t } = useLanguage();
  const {
    cartProducts,
    cartSubtotal,
    goBack,
    placeOrder,
    defaultPaymentMethod,
    paymentMethods,
    addPaymentMethod,
  } = useMarketplaceCheckoutData();
  const [address, setAddress] = useState(profileAddress ?? '');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'card' | 'pse'>('card');
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultPaymentMethod) setSelectedCardId(defaultPaymentMethod.id);
  }, [defaultPaymentMethod?.id]);

  const selectedCard = useMemo(
    () => paymentMethods.find((method) => method.id === selectedCardId) ?? defaultPaymentMethod,
    [paymentMethods, selectedCardId, defaultPaymentMethod]
  );

  const buildPayment = (): CheckoutPaymentSelection | null => {
    if (paymentType === 'pse') return { type: 'pse', paymentLabel: 'PSE' };
    const card = selectedCard ?? defaultPaymentMethod;
    if (!card) return null;
    return {
      type: 'card',
      paymentMethodId: card.id,
      paymentLabel: maskCardNumber(card.last4, card.brand),
    };
  };

  const handleConfirm = async () => {
    setError(null);
    const payment = buildPayment();
    if (!payment) {
      setError('Selecciona un método de pago o agrega una tarjeta.');
      return;
    }

    setIsProcessing(true);
    const result = await placeOrder({
      deliveryAddress: address,
      paymentMethodLabel: payment.paymentLabel,
      paymentMethodId: payment.paymentMethodId,
    });
    setIsProcessing(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="h-full overflow-y-auto pb-28">
      <MarketplaceHeader title={t('marketplace.checkout.title')} onBack={goBack} />

      <div className="p-4 space-y-4">
        <Card>
          <h3 className="font-semibold mb-3">{t('marketplace.checkout.summary')}</h3>
          <div className="space-y-2">
            {cartProducts.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">${item.lineTotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-3 mt-3 border-t border-border font-bold">
            <span>{t('marketplace.subtotal')}</span>
            <span className="text-primary">${cartSubtotal.toLocaleString()}</span>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t('marketplace.checkout.address')}
          </h3>
          <Input
            label={t('marketplace.checkout.addressLabel')}
            placeholder="Calle, barrio, ciudad"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">{t('marketplace.checkout.payment')}</h3>
            <button
              type="button"
              className="text-sm text-primary font-medium"
              onClick={() => setAddCardOpen(true)}
            >
              + Tarjeta
            </button>
          </div>
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                selectable
                selected={paymentType === 'card' && selectedCardId === method.id}
                onSelect={() => {
                  setPaymentType('card');
                  setSelectedCardId(method.id);
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => setPaymentType('pse')}
              className={`w-full text-left p-3 rounded-2xl border ${
                paymentType === 'pse' ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              PSE — Débito bancario
            </button>
          </div>
        </Card>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </Card>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 z-20">
        <Button fullWidth size="xl" loading={isProcessing} onClick={handleConfirm}>
          {t('marketplace.checkout.confirm')} · ${cartSubtotal.toLocaleString()}
        </Button>
      </div>

      <AddPaymentMethodSheet
        open={addCardOpen}
        mode="add"
        onClose={() => setAddCardOpen(false)}
        onSubmit={async (payload) => {
          const result = await addPaymentMethod(payload);
          if (!result.error) setAddCardOpen(false);
          return result;
        }}
      />
    </div>
  );
}

function useMarketplaceCheckoutData() {
  const marketplace = useMarketplace();
  const { defaultPaymentMethod, paymentMethods, addPaymentMethod } = usePaymentMethods();
  return { ...marketplace, defaultPaymentMethod, paymentMethods, addPaymentMethod };
}

function MarketplaceOrderConfirmedView() {
  const { t } = useLanguage();
  const { lastOrder, goHome } = useMarketplace();

  return (
    <div className="h-full overflow-y-auto pb-24 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-24 h-24 rounded-full bg-success/15 flex items-center justify-center mb-5"
        >
          <CheckCircle2 className="w-14 h-14 text-success" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">{t('marketplace.confirmed.title')}</h2>
        <p className="text-muted-foreground max-w-xs">{t('marketplace.confirmed.desc')}</p>

        {lastOrder && (
          <Card className="mt-6 w-full max-w-sm text-left">
            <p className="text-xs text-muted-foreground">Pedido #{lastOrder.id.slice(0, 8)}</p>
            <p className="font-bold text-primary text-lg mt-1">
              ${lastOrder.subtotal.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{lastOrder.deliveryAddress}</p>
            <p className="text-sm mt-1">{lastOrder.paymentMethodLabel}</p>
          </Card>
        )}
      </div>

      <div className="p-4 pb-safe">
        <Button fullWidth size="xl" onClick={goHome}>
          {t('marketplace.confirmed.cta')}
        </Button>
      </div>
    </div>
  );
}
