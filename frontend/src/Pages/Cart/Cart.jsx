import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, Minus, Plus, Loader, Package } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useCart } from '../../Components/Context/Cartcontext';
import { BASE_URL } from '../../App';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const SCROLL_OPTIONS = { top: 0, behavior: 'instant' };
const ANIMATION_DURATION = 0.6;
const ITEM_DELAY_INCREMENT = 0.1;

const ITEM_PLACEHOLDER =
  'https://images.unsplash.com/photo-1633944095397-878622ebc01c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80';

// ─── Helper Functions (without hooks) ──────────────────────────────────────
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  return `${BASE_URL}/${imagePath}`;
};

const getItemImage = (item) => getFullImageUrl(item.image_url) || null;

// ─── Animation Variants ─────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: ANIMATION_DURATION }
};

// ─── Content Dictionary ─────────────────────────────────────────────────────
const CART_CONTENT = {
  en: {
    title: 'Shopping Cart',
    emptyCart: {
      title: 'Your Cart is Empty',
      subtitle: 'Add some beautiful furniture to your cart!',
      button: 'Continue Shopping'
    },
    itemCount: (n) => `${n} item(s) in your cart`,
    size: 'Size',
    subtotal: 'Subtotal',
    delivery: 'Delivery',
    deliveryText: 'Calculated at checkout',
    total: 'Total',
    proceedToCheckout: 'Proceed to Checkout',
    continueShopping: 'Continue Shopping',
    removeItem: 'Remove item',
    decreaseQuantity: 'Decrease quantity',
    increaseQuantity: 'Increase quantity',
    orderSummary: 'Order Summary',
    currency: 'EGP',
  },
  ar: {
    title: 'سلة التسوق',
    emptyCart: {
      title: 'سلتك فارغة',
      subtitle: 'أضف بعض الأثاث الجميل إلى سلتك!',
      button: 'مواصلة التسوق'
    },
    itemCount: (n) => `${n} منتج(ة) في سلتك`,
    size: 'المقاس',
    subtotal: 'المجموع الفرعي',
    delivery: 'التوصيل',
    deliveryText: 'يُحسب عند الدفع',
    total: 'الإجمالي',
    proceedToCheckout: 'متابعة الدفع',
    continueShopping: 'مواصلة التسوق',
    removeItem: 'إزالة المنتج',
    decreaseQuantity: 'تقليل الكمية',
    increaseQuantity: 'زيادة الكمية',
    orderSummary: 'ملخص الطلب',
    currency: 'جنيه',
  },
};

// ─── Extracted Components ───────────────────────────────────────────────────

const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center pt-20">
    <Loader className="w-10 h-10 text-[#8B5E3C] animate-spin" aria-label="Loading" />
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const EmptyCart = React.memo(({ t, language }) => {
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  return (
    <div className="min-h-screen bg-[#F5F1E8] pt-20 sm:pt-28 pb-12 sm:pb-20 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div {...fadeInUp}>
          <ShoppingBag className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 text-[#2C2C2C]/30" aria-hidden="true" />
          <h2 className="text-2xl sm:text-3xl text-[#2C2C2C] mb-3 sm:mb-4" style={titleFont}>
            {t.emptyCart.title}
          </h2>
          <p className="text-sm sm:text-base text-[#2C2C2C]/70 mb-6 sm:mb-8">{t.emptyCart.subtitle}</p>
          <Link
            to="/shop"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
            aria-label={t.emptyCart.button}
          >
            {t.emptyCart.button}
          </Link>
        </motion.div>
      </div>
    </div>
  );
});

EmptyCart.displayName = 'EmptyCart';

const CartItem = React.memo(({ item, index, t, language, onUpdate, onRemove, compact = false }) => {
  const imgSrc = useMemo(() => getItemImage(item), [item]);
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit'
  }), [language]);

  const handleDecrease = useCallback(() => {
    onUpdate(item.id, Math.max(1, item.quantity - 1));
  }, [item.id, item.quantity, onUpdate]);

  const handleIncrease = useCallback(() => {
    onUpdate(item.id, item.quantity + 1);
  }, [item.id, item.quantity, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  const handleImageError = useCallback((e) => {
    e.target.onerror = null;
    e.target.src = ITEM_PLACEHOLDER;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATION, delay: index * ITEM_DELAY_INCREMENT }}
      className="bg-white p-4 sm:p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow"
    >
      <div className={`flex gap-${compact ? '4' : '6'}`}>
        {/* Product image */}
        <div className={`${compact ? 'w-20 h-20' : 'w-28 h-28 sm:w-32 sm:h-32'} shrink-0 rounded-xl overflow-hidden bg-[#F5F1E8]`}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.product_name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} text-[#2C2C2C]/30`} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Item details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <h3 className={`${compact ? 'text-sm' : 'text-base sm:text-lg'} text-[#2C2C2C] font-medium line-clamp-2`} style={titleFont}>
              {item.product_name}
            </h3>
            <button
              onClick={handleRemove}
              className="text-red-500 hover:text-red-600 transition-colors ml-2 shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 rounded p-1"
              aria-label={t.removeItem}
            >
              <Trash2 className={`${compact ? 'w-4 h-4' : 'w-4 h-4 sm:w-5 sm:h-5'}`} aria-hidden="true" />
            </button>
          </div>

          {/* Size label */}
          {item.size_name && (
            <p className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} text-[#2C2C2C]/70 mb-1`}>
              {t.size}: <span style={titleFont}>{item.size_name}</span>
            </p>
          )}

          {/* Unit price */}
          {item.item_price != null && (
            <p className={`${compact ? 'text-base' : 'text-lg sm:text-xl'} text-[#8B5E3C] font-medium mb-2 sm:mb-4`}>
              {t.currency} {item.item_price.toLocaleString()}
            </p>
          )}

          {/* Quantity controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleDecrease}
                className={`${compact ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-lg bg-[#F5F1E8] flex items-center justify-center hover:bg-[#EBE7DC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]`}
                aria-label={t.decreaseQuantity}
                disabled={item.quantity <= 1}
              >
                <Minus className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
              <span className={`${compact ? 'text-sm w-8' : 'text-base sm:text-lg w-10 sm:w-12'} text-[#2C2C2C] text-center`}>
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                className={`${compact ? 'w-7 h-7' : 'w-8 h-8 sm:w-9 sm:h-9'} rounded-lg bg-[#F5F1E8] flex items-center justify-center hover:bg-[#EBE7DC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]`}
                aria-label={t.increaseQuantity}
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Line subtotal */}
            {item.subtotal != null && (
              <span className={`${compact ? 'text-xs' : 'text-sm sm:text-base'} text-[#2C2C2C]`}>
                {t.subtotal}: <span className="font-medium">{t.currency} {item.subtotal.toLocaleString()}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

const OrderSummary = React.memo(({ t, totalPrice, onCheckout, onContinue, stickyClass = '' }) => {
  const titleFont = useMemo(() => ({
    fontFamily: t.language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [t.language]);

  return (
    <div className={`bg-white p-5 sm:p-6 rounded-xl shadow-sm ${stickyClass}`}>
      <h2 className="text-lg sm:text-xl text-[#2C2C2C] mb-4 sm:mb-6" style={titleFont}>
        {t.orderSummary}
      </h2>
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#2C2C2C]/10">
        <div className="flex justify-between text-sm sm:text-base text-[#2C2C2C]/70">
          <span>{t.subtotal}</span>
          <span>{t.currency} {totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm sm:text-base text-[#2C2C2C]/70">
          <span>{t.delivery}</span>
          <span>{t.deliveryText}</span>
        </div>
      </div>
      <div className="flex justify-between text-base sm:text-xl text-[#2C2C2C] mb-5 sm:mb-6">
        <span>{t.total}</span>
        <span className="text-[#8B5E3C] font-bold">{t.currency} {totalPrice.toLocaleString()}</span>
      </div>
      <button
        onClick={onCheckout}
        className="w-full py-3.5 sm:py-4 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors mb-3 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
        aria-label={t.proceedToCheckout}
      >
        {t.proceedToCheckout}
      </button>
      <Link
        to="/shop"
        onClick={onContinue}
        className="block w-full py-3.5 sm:py-4 text-center border-2 border-[#8B5E3C] text-[#8B5E3C] rounded-xl hover:bg-[#8B5E3C] hover:text-white transition-colors text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
        aria-label={t.continueShopping}
      >
        {t.continueShopping}
      </Link>
    </div>
  );
});

OrderSummary.displayName = 'OrderSummary';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Cart() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { items, totalPrice, loading, updateItem, removeItem } = useCart();
  const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(SCROLL_OPTIONS);
  }, []);

  // Responsive handler
  const handleResize = useCallback(() => {
    setViewport({
      isMobile: window.innerWidth < MOBILE_BREAKPOINT,
      isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
    });
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Memoized values
  const t = useMemo(() => {
    const content = CART_CONTENT[language];
    return {
      ...content,
      language // Pass language for font calculations
    };
  }, [language]);

  const rtlStyles = useMemo(() => language === 'ar' ? {
    direction: 'rtl',
    textAlign: 'right',
  } : {}, [language]);

  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  // Navigation handlers
  const handleCheckout = useCallback(() => {
    navigate('/checkout');
  }, [navigate]);

  // Responsive classes
  const containerClasses = useMemo(() => {
    const baseClasses = 'min-h-screen bg-[#F5F1E8]';
    if (viewport.isMobile) return `${baseClasses} pt-16 pb-12`;
    if (viewport.isTablet) return `${baseClasses} pt-24 pb-16`;
    return `${baseClasses} pt-28 pb-20`;
  }, [viewport.isMobile, viewport.isTablet]);

  const titleClasses = useMemo(() => {
    if (viewport.isMobile) return 'text-2xl mb-1';
    if (viewport.isTablet) return 'text-3xl mb-1';
    return 'text-3xl sm:text-4xl mb-2';
  }, [viewport.isMobile, viewport.isTablet]);

  const itemCountClasses = useMemo(() => {
    if (viewport.isMobile) return 'text-sm';
    if (viewport.isTablet) return 'text-base';
    return 'text-base sm:text-lg';
  }, [viewport.isMobile, viewport.isTablet]);

  const headerMargin = useMemo(() => {
    if (viewport.isMobile) return 'mb-5';
    if (viewport.isTablet) return 'mb-6';
    return 'mb-8';
  }, [viewport.isMobile, viewport.isTablet]);

  const gridGap = useMemo(() => {
    if (viewport.isTablet) return 'gap-6';
    return 'gap-8';
  }, [viewport.isTablet]);

  const stickyOffset = useMemo(() => {
    if (viewport.isTablet) return 'top-24';
    return 'top-28';
  }, [viewport.isTablet]);

  // Loading state
  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  // Empty cart - Check if there are no items
  if (items.length === 0) {
    return <EmptyCart t={t} language={language} />;
  }

  // Mobile layout
  if (viewport.isMobile) {
    return (
      <div className={containerClasses} style={rtlStyles}>
        <div className="max-w-6xl mx-auto px-4">
          <motion.div {...fadeInUp} className={headerMargin}>
            <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
            <p className={itemCountClasses}>{t.itemCount(items.length)}</p>
          </motion.div>

          <div className="space-y-4 mb-6">
            {items.map((item, index) => (
              <CartItem
                key={item.id}
                item={item}
                index={index}
                t={t}
                language={language}
                onUpdate={updateItem}
                onRemove={removeItem}
                compact
              />
            ))}
          </div>

          <div className="sticky bottom-4">
            <OrderSummary
              t={t}
              totalPrice={totalPrice}
              onCheckout={handleCheckout}
              onContinue={() => { }}
              stickyClass="shadow-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  // Shared header for tablet/desktop
  const Header = React.memo(() => (
    <motion.div {...fadeInUp} className={headerMargin}>
      <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
      <p className={itemCountClasses}>{t.itemCount(items.length)}</p>
    </motion.div>
  ));

  Header.displayName = 'Header';

  const ItemsList = React.memo(() => (
    <div className="space-y-4">
      {items.map((item, index) => (
        <CartItem
          key={item.id}
          item={item}
          index={index}
          t={t}
          language={language}
          onUpdate={updateItem}
          onRemove={removeItem}
        />
      ))}
    </div>
  ));

  ItemsList.displayName = 'ItemsList';

  // Tablet/Desktop layout
  return (
    <div className={containerClasses} style={rtlStyles}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />

        <div className={`grid grid-cols-1 lg:grid-cols-3 ${gridGap}`}>
          <div className="lg:col-span-2">
            <ItemsList />
          </div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: ANIMATION_DURATION, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <OrderSummary
              t={t}
              totalPrice={totalPrice}
              onCheckout={handleCheckout}
              onContinue={() => { }}
              stickyClass={`sticky ${stickyOffset}`}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}