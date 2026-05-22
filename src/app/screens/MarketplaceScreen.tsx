import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  ShoppingCart,
  SlidersHorizontal,
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useMarketplace } from '@/contexts/MarketplaceContext';
import { useUserData } from '@/contexts/UserDataContext';
import {
  formatOrderDate,
  formatOrderId,
  getProductGalleryUrls,
  resolveLiveOrderStatus,
} from '@/features/marketplace';
import {
  CheckoutHeader,
  CheckoutPaymentSelector,
  CheckoutSecurityBanner,
  CheckoutFixedFooter,
  OrderConfirmedLayout,
  useCheckoutPayment,
  runCheckoutProcessing,
  MARKETPLACE_PROCESSING_STAGES,
} from '../components/checkout';
import { AddPaymentMethodSheet } from '../components/payments/AddPaymentMethodSheet';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ProductGridSkeleton } from '../components/marketplace/ProductCardSkeleton';
import { ProductImage } from '../components/marketplace/ProductImage';
import { StarRating } from '../components/marketplace/StarRating';
import { MarketplaceCategoryChips } from '../components/marketplace/MarketplaceCategoryChips';
import { MarketplaceTrustBar } from '../components/marketplace/MarketplaceTrustBar';
import { CartItemRow } from '../components/marketplace/CartItemRow';
import { MarketplaceFilterSheet } from '../components/marketplace/MarketplaceFilterSheet';
import { MarketplaceFilterSidebar } from '../components/marketplace/MarketplaceFilterSidebar';
import { OrderCard } from '../components/marketplace/OrderCard';
import { OrderTrackingStepper } from '../components/marketplace/OrderTrackingStepper';
import { RecommendedProductsSection } from '../components/marketplace/RecommendedProductsSection';
import { Button } from '../components/Button';
import { headerIconButtonClassName } from '../components/ChipButton';
import { Input } from '../components/Input';
import { IconButton } from '../components/IconButton';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';

export const MarketplaceScreen: React.FC = () => {
  const { profile } = useUserData();
  const { view } = useMarketplace();

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
          {view === 'orders' && <MarketplaceOrdersView />}
          {view === 'tracking' && <MarketplaceOrderTrackingView />}
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
  onOrders?: () => void;
}> = ({ title, subtitle, onBack, cartCount = 0, onCart, onOrders }) => (
  <div className="sticky top-0 z-10 bg-gradient-to-br from-primary to-accent px-4 pt-4 pb-5 shadow-lg">
    <div className="flex items-center justify-between mb-3">
      {onBack ? (
        <IconButton
          onClick={onBack}
          variant="ghost"
          className={headerIconButtonClassName}
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </IconButton>
      ) : (
        <div className="w-11" />
      )}
      <div className="flex items-center gap-2">
        {onOrders && (
          <IconButton
            onClick={onOrders}
            variant="ghost"
            className={headerIconButtonClassName}
            aria-label="Mis pedidos"
          >
            <Package className="w-5 h-5" />
          </IconButton>
        )}
        {onCart && (
          <div className="relative">
            <IconButton
              onClick={onCart}
              variant="ghost"
              className={headerIconButtonClassName}
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
            </IconButton>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center pointer-events-none">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    {subtitle && <p className="text-white/90 text-sm mt-1">{subtitle}</p>}
  </div>
);

function MarketplaceHomeView() {
  const { t } = useLanguage();
  const {
    filteredProducts,
    recommendedProducts,
    filters,
    setFilters,
    resetFilters,
    priceBounds,
    isLoading,
    cartCount,
    openProduct,
    openCart,
    openOrders,
    addToCart,
  } = useMarketplace();
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="h-full md:flex md:overflow-hidden">
      <MarketplaceFilterSidebar
        filters={filters}
        priceBounds={priceBounds}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onReset={resetFilters}
        resultCount={filteredProducts.length}
      />

      <div className="flex-1 h-full overflow-y-auto pb-24 md:pb-6">
      <MarketplaceHeader
        title={t('marketplace.title')}
        subtitle={t('marketplace.subtitle')}
        cartCount={cartCount}
        onCart={openCart}
        onOrders={openOrders}
      />

      <div className="p-4 space-y-4 -mt-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('marketplace.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-3.5 rounded-2xl border border-border bg-card text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <IconButton
            onClick={() => setFiltersOpen(true)}
            variant="outline"
            size="lg"
            className="shrink-0 shadow-sm md:hidden"
            aria-label="Filtros"
          >
            <SlidersHorizontal className="w-5 h-5 text-primary" />
          </IconButton>
        </div>

        <MarketplaceTrustBar />

        <MarketplaceCategoryChips
          active={filters.browseCategory}
          onChange={(browseCategory) => setFilters((current) => ({ ...current, browseCategory }))}
        />

        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <>
            {recommendedProducts.length > 0 && filters.browseCategory === 'all' && !filters.search && (
              <RecommendedProductsSection
                products={recommendedProducts}
                onProductClick={openProduct}
                onAddToCart={(productId) => addToCart(productId, 1)}
              />
            )}

            <div className="flex items-center justify-between pt-1">
              <h2 className="font-bold text-base">
                {filters.browseCategory === 'all'
                  ? t('marketplace.allProducts')
                  : t(`marketplace.browse.${filters.browseCategory}`)}
              </h2>
              <span className="text-xs text-muted-foreground">
                {filteredProducts.length} {t('marketplace.results')}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="text-center py-12 border-dashed">
                <ShoppingBag className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-semibold">{t('marketplace.empty.title')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('marketplace.empty.desc')}</p>
                <Button size="md" className="mt-4" variant="outline" onClick={resetFilters}>
                  {t('marketplace.filters.reset')}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.4) }}
                  >
                    <ProductCard
                      product={product}
                      onClick={() => openProduct(product.id)}
                      onAddToCart={(productId) => addToCart(productId, 1)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
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

  const gallery = getProductGalleryUrls(selectedProduct);

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
        <Card padding="none" className="overflow-hidden shadow-lg border-0">
          <ProductImage
            product={selectedProduct}
            size="detail"
            emojiOverride={gallery[galleryIndex]}
            className="h-56 w-full"
          />
          <div className="flex gap-2 p-3 overflow-x-auto bg-card border-t border-border">
            {gallery.map((emoji, index) => (
              <button
                key={`${selectedProduct.id}-gallery-${index}`}
                type="button"
                onClick={() => setGalleryIndex(index)}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 shrink-0 transition-all bg-muted/40 ${
                  galleryIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl font-bold text-primary">
              ${selectedProduct.price.toLocaleString()}
            </p>
            <StarRating
              rating={selectedProduct.rating}
              reviewCount={selectedProduct.reviewCount}
              size="md"
              className="mt-2"
            />
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
          <div className="flex items-center gap-2 bg-muted/60 rounded-full p-1">
            <IconButton size="sm" variant="ghost" onClick={() => setQuantity((v) => Math.max(1, v - 1))}>
              -
            </IconButton>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <IconButton size="sm" variant="ghost" onClick={() => setQuantity((v) => v + 1)}>
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
  const { cartProducts, cartSubtotal, goBack, placeOrder } = useMarketplace();
  const checkoutPayment = useCheckoutPayment({ allowedTypes: ['card', 'pse', 'nequi'] });
  const [address, setAddress] = useState(profileAddress ?? '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (isProcessing) return;
    setError(null);

    if (!address.trim()) {
      setError(t('marketplace.checkout.addressRequired'));
      return;
    }

    const selection = checkoutPayment.buildPaymentSelection();
    if (!selection) {
      setError(t('marketplace.checkout.paymentRequired'));
      return;
    }

    setIsProcessing(true);
    const result = await runCheckoutProcessing(
      async () =>
        placeOrder({
          deliveryAddress: address,
          paymentMethodLabel: selection.paymentLabel,
          paymentMethodId: selection.paymentMethodId,
        }),
      setProcessingStage,
      MARKETPLACE_PROCESSING_STAGES
    );
    setIsProcessing(false);
    if (result.error) setError(result.error);
  };

  return (
    <div className="h-full overflow-y-auto pb-36 bg-background-secondary">
      <CheckoutHeader
        title={t('marketplace.checkout.title')}
        subtitle={t('marketplace.checkout.subtitle')}
        onBack={goBack}
      />

      <div className="p-4 space-y-6">
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

        <CheckoutPaymentSelector
          title={t('marketplace.checkout.payment')}
          paymentMethods={checkoutPayment.paymentMethods}
          paymentMethodsLoading={checkoutPayment.paymentMethodsLoading}
          paymentType={checkoutPayment.paymentType}
          selectedCardId={checkoutPayment.selectedCardId}
          showAllCards={checkoutPayment.showAllCards}
          allowedTypes={checkoutPayment.allowedTypes}
          onPaymentTypeChange={checkoutPayment.setPaymentType}
          onSelectCard={checkoutPayment.setSelectedCardId}
          onToggleShowAllCards={() => checkoutPayment.setShowAllCards((value) => !value)}
          onAddCard={() => checkoutPayment.setAddCardOpen(true)}
        />

        <CheckoutSecurityBanner />
      </div>

      <AddPaymentMethodSheet
        open={checkoutPayment.addCardOpen}
        mode="add"
        onClose={() => checkoutPayment.setAddCardOpen(false)}
        onSubmit={checkoutPayment.handleAddCard}
      />

      <CheckoutFixedFooter
        total={cartSubtotal}
        confirmLabel={t('marketplace.checkout.confirm')}
        isProcessing={isProcessing}
        processingStage={processingStage}
        processingStages={MARKETPLACE_PROCESSING_STAGES}
        error={error}
        onConfirm={handleConfirm}
        bottomOffset="tab"
      />
    </div>
  );
}

function MarketplaceOrdersView() {
  const { t } = useLanguage();
  const { orders, ordersLoading, goBack, openOrderTracking, refreshOrders } = useMarketplace();

  return (
    <div className="h-full overflow-y-auto pb-24">
      <MarketplaceHeader title={t('marketplace.orders.title')} subtitle={t('marketplace.orders.subtitle')} onBack={goBack} />

      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <Button size="md" variant="outline" onClick={() => void refreshOrders()}>
            <RefreshCw className={`w-4 h-4 ${ordersLoading ? 'animate-spin' : ''}`} />
            {t('marketplace.orders.refresh')}
          </Button>
        </div>

        {ordersLoading && orders.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <Package className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-semibold">{t('marketplace.orders.empty.title')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('marketplace.orders.empty.desc')}</p>
          </Card>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => openOrderTracking(order.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function MarketplaceOrderTrackingView() {
  const { t, language } = useLanguage();
  const { selectedOrder, goBack } = useMarketplace();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 15000);
    return () => window.clearInterval(interval);
  }, []);

  const tracking = useMemo(() => {
    void tick;
    return selectedOrder ? resolveLiveOrderStatus(selectedOrder) : null;
  }, [selectedOrder, tick]);

  if (!selectedOrder || !tracking) {
    return (
      <div className="h-full flex items-center justify-center">
        <Button onClick={goBack}>{t('back')}</Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      <MarketplaceHeader
        title={t('marketplace.tracking.title')}
        subtitle={`${t('marketplace.orders.orderId')} #${formatOrderId(selectedOrder.id)}`}
        onBack={goBack}
      />

      <div className="p-4 space-y-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <OrderTrackingStepper steps={tracking.steps} />
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">{t('marketplace.tracking.details')}</h3>
          <div className="space-y-2">
            {selectedOrder.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.quantity}× {item.name}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="pt-3 mt-3 border-t border-border space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('marketplace.checkout.address')}</span>
              <span className="font-medium text-right max-w-[60%]">{selectedOrder.deliveryAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('marketplace.checkout.payment')}</span>
              <span className="font-medium">{selectedOrder.paymentMethodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('marketplace.orders.purchaseDate')}</span>
              <span className="font-medium">
                {formatOrderDate(selectedOrder.createdAt, language === 'en' ? 'en-US' : 'es-CO')}
              </span>
            </div>
            <div className="flex justify-between font-bold text-primary">
              <span>{t('marketplace.subtotal')}</span>
              <span>${selectedOrder.subtotal.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MarketplaceOrderConfirmedView() {
  const { t, language } = useLanguage();
  const { lastOrder, goHome, openOrders } = useMarketplace();

  return (
    <OrderConfirmedLayout
      title={t('marketplace.confirmed.title')}
      subtitle={t('marketplace.confirmed.desc')}
      primaryAction={{
        label: t('marketplace.orders.viewOrders'),
        onClick: openOrders,
        icon: <Package className="w-5 h-5" />,
      }}
      secondaryAction={{
        label: t('marketplace.confirmed.cta'),
        onClick: goHome,
        variant: 'outline',
      }}
    >
      {lastOrder && (
        <Card variant="elevated" className="shadow-2xl border-2 border-primary/10 bg-gradient-to-br from-card to-primary/5">
          <p className="text-xs text-muted-foreground">
            {t('marketplace.orders.orderId')} #{formatOrderId(lastOrder.id)}
          </p>
          <p className="font-bold text-primary text-2xl mt-1">${lastOrder.subtotal.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-3">{lastOrder.deliveryAddress}</p>
          <p className="text-sm mt-1">{lastOrder.paymentMethodLabel}</p>
          <p className="text-xs text-muted-foreground mt-3">
            {formatOrderDate(lastOrder.createdAt, language === 'en' ? 'en-US' : 'es-CO')}
          </p>
        </Card>
      )}
    </OrderConfirmedLayout>
  );
}
