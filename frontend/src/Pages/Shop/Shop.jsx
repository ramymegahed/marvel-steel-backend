import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Filter, X, Loader, Package, ImageOff } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { BASE_URL } from '../../App';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const ANIMATION_DURATION = 0.6;
const DELAY_STEP = 0.05;
const CATEGORIES_LIMIT = 50;
const PRODUCTS_LIMIT = 100;

// ─── Helper Functions ──────────────────────────────────────────────────────
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Handle external URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
      // Decode then encode to handle unencoded Arabic characters without double-encoding
      return encodeURI(decodeURI(imagePath));
    } catch (error) {
      return imagePath;
    }
  }

  try {
    const decodedPath = decodeURIComponent(imagePath);
    // Ensure we don't double up on uploads/ and handle leading slashes
    const cleanPath = decodedPath.replace(/^uploads\/+/, '').replace(/^\/+/, '');
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${baseUrl}/uploads/${cleanPath}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    const cleanPath = imagePath.replace(/^uploads\/+/, '').replace(/^\/+/, '');
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${baseUrl}/uploads/${cleanPath}`;
  }
};

const getProductImage = (product) => {
  const mainImage = product.images?.find((img) => img.is_main) || product.images?.[0];
  return mainImage ? getFullImageUrl(mainImage.image_url) : null;
};

const hasProductImage = (product) => {
  return product.images && product.images.length > 0;
};

const getProductPriceRange = (product) => {
  if (!product.sizes || product.sizes.length === 0) return null;

  const prices = product.sizes.map(size => size.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return { min: minPrice, max: maxPrice };
};

const getProductDiscountRange = (product) => {
  if (!product.sizes || product.sizes.length === 0) return null;

  const discounts = product.sizes
    .map(size => size.discount_price)
    .filter(price => price > 0);

  if (discounts.length === 0) return null;

  const minDiscount = Math.min(...discounts);
  const maxDiscount = Math.max(...discounts);

  return { min: minDiscount, max: maxDiscount };
};

const formatPrice = (price, language) => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// ─── Animation Variants ─────────────────────────────────────────────────────
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: ANIMATION_DURATION }
};

const slideIn = (direction = 'left') => ({
  initial: { opacity: 0, x: direction === 'left' ? -20 : 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.3 }
});

// ─── Content Dictionary ─────────────────────────────────────────────────────
const SHOP_CONTENT = {
  en: {
    title: 'Our Collection',
    subtitle: 'Discover furniture that combines strength with beauty',
    filters: 'Filters',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    category: 'Category',
    allProducts: 'All Products',
    applyFilters: 'Apply Filters',
    products: 'products',
    noProducts: 'No products found matching your criteria',
    noProductsWithImages: 'No products with images available in this category',
    viewDetails: 'View Details',
    from: 'from',
    to: 'to',
    price: 'Price',
    sale: 'SALE',
    outOfStock: 'Out of Stock',
    sizes: 'sizes',
    size: 'size',
    noImage: 'No image available',
  },
  ar: {
    title: 'مجموعتنا',
    subtitle: 'اكتشف أثاثًا يجمع بين القوة والجمال',
    filters: 'فلتر',
    showFilters: 'إظهار الفلتر',
    hideFilters: 'إخفاء الفلتر',
    category: 'الفئة',
    allProducts: 'جميع المنتجات',
    applyFilters: 'تطبيق الفلتر',
    products: 'منتجات',
    noProducts: 'لا توجد منتجات تطابق معايير البحث',
    noProductsWithImages: 'لا توجد منتجات مع صور في هذه الفئة',
    viewDetails: 'عرض التفاصيل',
    from: 'من',
    to: 'إلى',
    price: 'السعر',
    sale: 'تخفيض',
    outOfStock: 'غير متوفر',
    sizes: 'مقاسات',
    size: 'مقاس',
    noImage: 'لا توجد صورة',
  },
};

// ─── Extracted Components ───────────────────────────────────────────────────

const LoadingSpinner = React.memo(() => (
  <div className="flex items-center justify-center py-20">
    <Loader className="w-8 h-8 text-[#8B5E3C] animate-spin" aria-label="Loading" />
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const NoImagePlaceholder = React.memo(({ t }) => (
  <div className="w-full h-full bg-[#EBE7DC] flex flex-col items-center justify-center p-4">
    <ImageOff className="w-12 h-12 text-[#2C2C2C]/30 mb-2" aria-hidden="true" />
    <p className="text-sm text-[#2C2C2C]/50 text-center">{t.noImage}</p>
  </div>
));

NoImagePlaceholder.displayName = 'NoImagePlaceholder';

const PriceDisplay = React.memo(({ product, t, language }) => {
  const priceRange = useMemo(() => getProductPriceRange(product), [product]);
  const discountRange = useMemo(() => getProductDiscountRange(product), [product]);

  if (!priceRange) {
    return <p className="text-sm text-[#2C2C2C]/50 mt-2">{t.outOfStock}</p>;
  }

  const hasDiscount = discountRange !== null;
  const showRange = priceRange.min !== priceRange.max;

  const regularPrice = showRange
    ? `${formatPrice(priceRange.min, language)} - ${formatPrice(priceRange.max, language)}`
    : formatPrice(priceRange.min, language);

  const discountPrice = hasDiscount && showRange
    ? `${formatPrice(discountRange.min, language)} - ${formatPrice(discountRange.max, language)}`
    : hasDiscount ? formatPrice(discountRange.min, language) : '';

  return (
    <div className="mt-2 space-y-1">
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
            {t.sale}
          </span>
          <span className="text-xs text-[#2C2C2C]/50 line-through">
            {regularPrice}
          </span>
        </div>
      )}

      <div className="flex items-baseline gap-1">
        <span className="text-xs text-[#2C2C2C]/70">{t.price}:</span>
        {hasDiscount ? (
          <span className="text-lg font-bold text-red-600">
            {discountPrice}
          </span>
        ) : (
          <span className="text-lg font-bold text-[#2C2C2C]">
            {regularPrice}
          </span>
        )}
      </div>
    </div>
  );
});

PriceDisplay.displayName = 'PriceDisplay';

const ProductCard = React.memo(({ product, index, t, language, onImageError, hasImageError, horizontal = false }) => {
  const imgSrc = useMemo(() => getProductImage(product), [product]);
  const hasSizes = useMemo(() => product.sizes && product.sizes.length > 0, [product.sizes]);
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit'
  }), [language]);

  const handleImageError = useCallback(() => {
    onImageError(product.id);
  }, [product.id, onImageError]);

  const sizeText = useMemo(() =>
    product.sizes.length > 1 ? t.sizes : t.size,
    [product.sizes.length, t.sizes, t.size]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION_DURATION, delay: index * DELAY_STEP }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
    >
      {horizontal ? (
        <div className="flex">
          <div className="w-1/3 aspect-square overflow-hidden bg-[#F5F1E8] relative">
            {!hasImageError && imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={handleImageError}
              />
            ) : (
              <NoImagePlaceholder t={t} />
            )}
            {hasSizes && (
              <div className="absolute top-2 right-2 bg-[#8B5E3C] text-white px-2 py-1 rounded text-xs">
                {product.sizes.length} {sizeText}
              </div>
            )}
          </div>
          <div className="w-2/3 p-4 flex flex-col justify-between">
            <h3 className="text-base text-[#2C2C2C] mb-2 line-clamp-2" style={titleFont}>
              {product.name}
            </h3>

            <PriceDisplay product={product} t={t} language={language} />

            <Link
              to={`/product/${product.id}`}
              className="inline-block px-4 py-2 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm self-start mt-3 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
              aria-label={`${t.viewDetails} for ${product.name}`}
            >
              {t.viewDetails}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="aspect-square overflow-hidden bg-[#F5F1E8] relative">
            {!hasImageError && imgSrc ? (
              <img
                src={imgSrc}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={handleImageError}
              />
            ) : (
              <NoImagePlaceholder t={t} />
            )}
            {hasSizes && (
              <div className="absolute top-2 right-2 bg-[#8B5E3C] text-white px-2 py-1 rounded text-xs">
                {product.sizes.length} {sizeText}
              </div>
            )}
          </div>
          <div className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg text-[#2C2C2C] mb-2 line-clamp-2" style={titleFont}>
              {product.name}
            </h3>

            <PriceDisplay product={product} t={t} language={language} />

            <div className="mt-4">
              <Link
                to={`/product/${product.id}`}
                className="block w-full py-2.5 sm:py-3 text-center bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
                aria-label={`${t.viewDetails} for ${product.name}`}
              >
                {t.viewDetails}
              </Link>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';

const FilterPanel = React.memo(({ categories, selectedCategoryId, onCategoryChange, t }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
        <h3 className="text-base sm:text-lg text-[#2C2C2C] mb-3 sm:mb-4">{t.category}</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              checked={!selectedCategoryId}
              onChange={() => onCategoryChange(null)}
              className="w-4 h-4 accent-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]"
              aria-label={t.allProducts}
            />
            <span className="text-sm text-[#2C2C2C]">{t.allProducts}</span>
          </label>
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategoryId === cat.id}
                onChange={() => onCategoryChange(cat.id)}
                className="w-4 h-4 accent-[#8B5E3C] focus:ring-2 focus:ring-[#8B5E3C]"
                aria-label={cat.name}
              />
              <span className="text-sm text-[#2C2C2C]">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
});

FilterPanel.displayName = 'FilterPanel';

const MobileFilterModal = React.memo(({ show, onClose, categories, selectedCategoryId, onCategoryChange, t, language }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
      <div
        className="bg-white w-full rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
        style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2C2C2C]">{t.filters}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>
        <FilterPanel
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onCategoryChange={onCategoryChange}
          t={t}
        />
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
        >
          {t.applyFilters}
        </button>
      </div>
    </div>
  );
});

MobileFilterModal.displayName = 'MobileFilterModal';

const EmptyState = React.memo(({ t }) => (
  <div className="col-span-full text-center py-12 sm:py-16 lg:py-20">
    <Package className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-[#2C2C2C]/30" aria-hidden="true" />
    <p className="text-base sm:text-lg lg:text-xl text-[#2C2C2C]/70">{t.noProductsWithImages}</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Shop() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── Filter state ──────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get('category_id') ? Number(searchParams.get('category_id')) : null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

  // ─── API state ─────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ─── Image error states ────────────────────────────────────────────────────
  const [productImageErrors, setProductImageErrors] = useState({});

  // ─── Memoized values ───────────────────────────────────────────────────────
  const t = useMemo(() => SHOP_CONTENT[language], [language]);

  const rtlStyles = useMemo(() => language === 'ar' ? {
    direction: 'rtl',
    textAlign: 'right',
  } : {}, [language]);

  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  const productsWithImages = useMemo(() =>
    products.filter(hasProductImage), [products]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleProductImageError = useCallback((productId) => {
    setProductImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategoryId(categoryId);
    if (categoryId) {
      searchParams.set('category_id', categoryId);
    } else {
      searchParams.delete('category_id');
    }
    setSearchParams(searchParams);
    if (viewport.isMobile || viewport.isTablet) setShowFilters(false);
  }, [searchParams, setSearchParams, viewport.isMobile, viewport.isTablet]);

  // ─── Fetch categories ──────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/categories/?limit=${CATEGORIES_LIMIT}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('categories fetch error:', err);
        }
      });

    return () => controller.abort();
  }, []);

  // ─── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const params = new URLSearchParams({ limit: PRODUCTS_LIMIT });
      if (selectedCategoryId) params.set('category_id', selectedCategoryId);

      const controller = new AbortController();
      const res = await fetch(`${BASE_URL}/products/?${params}`, { signal: controller.signal });
      let list = await res.json();
      if (!Array.isArray(list)) list = [];

      setProducts(list);
      setProductImageErrors({});

      return () => controller.abort();
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('products fetch error:', err);
      }
    } finally {
      setLoadingProducts(false);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchProducts();
    return () => abortController.abort();
  }, [fetchProducts]);

  // ─── Sync URL param → state ────────────────────────────────────────────────
  useEffect(() => {
    const catId = searchParams.get('category_id');
    setSelectedCategoryId(catId ? Number(catId) : null);
  }, [searchParams]);

  // ─── Responsive handler ────────────────────────────────────────────────────
  const handleResize = useCallback(() => {
    setViewport({
      isMobile: window.innerWidth < MOBILE_BREAKPOINT,
      isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
    });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // ─── Responsive classes ────────────────────────────────────────────────────
  const containerClasses = useMemo(() => {
    const baseClasses = 'min-h-screen bg-[#F5F1E8]';
    if (viewport.isMobile) return `${baseClasses} pt-20 pb-16`;
    if (viewport.isTablet) return `${baseClasses} pt-24 pb-16`;
    return `${baseClasses} pt-28 pb-20`;
  }, [viewport.isMobile, viewport.isTablet]);

  const titleClasses = useMemo(() => {
    if (viewport.isMobile) return 'text-3xl mb-2';
    if (viewport.isTablet) return 'text-4xl mb-3';
    return 'text-4xl md:text-5xl mb-4';
  }, [viewport.isMobile, viewport.isTablet]);

  const subtitleClasses = useMemo(() => {
    if (viewport.isMobile) return 'text-sm';
    if (viewport.isTablet) return 'text-base';
    return 'text-base md:text-lg';
  }, [viewport.isMobile, viewport.isTablet]);

  const headerMargin = useMemo(() => {
    if (viewport.isMobile) return 'mb-6';
    if (viewport.isTablet) return 'mb-8';
    return 'mb-12';
  }, [viewport.isMobile, viewport.isTablet]);

  // ─── Mobile layout ─────────────────────────────────────────────────────────
  if (viewport.isMobile) {
    return (
      <div className={containerClasses} style={rtlStyles}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div {...fadeInUp} className={headerMargin}>
            <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
            <p className={subtitleClasses}>{t.subtitle}</p>
          </motion.div>

          <button
            onClick={() => setShowFilters(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm text-[#2C2C2C] text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
            aria-label={t.filters}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {t.filters}
          </button>

          <p className="text-sm text-[#2C2C2C]/70 mb-4">{productsWithImages.length} {t.products}</p>

          {loadingProducts ? <LoadingSpinner /> : (
            <div className="grid grid-cols-1 gap-4">
              {productsWithImages.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  t={t}
                  language={language}
                  onImageError={handleProductImageError}
                  hasImageError={productImageErrors[product.id]}
                  horizontal
                />
              ))}
              {productsWithImages.length === 0 && <EmptyState t={t} />}
            </div>
          )}

          <MobileFilterModal
            show={showFilters}
            onClose={() => setShowFilters(false)}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={handleCategoryChange}
            t={t}
            language={language}
          />
        </div>
      </div>
    );
  }

  // ─── Tablet layout ─────────────────────────────────────────────────────────
  if (viewport.isTablet) {
    return (
      <div className={containerClasses} style={rtlStyles}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...fadeInUp} className={headerMargin}>
            <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
            <p className={subtitleClasses}>{t.subtitle}</p>
          </motion.div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-sm text-[#2C2C2C] text-sm mb-6 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
            aria-label={showFilters ? t.hideFilters : t.showFilters}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            {showFilters ? t.hideFilters : t.showFilters}
          </button>

          <div className="flex gap-6">
            {showFilters && (
              <motion.aside
                {...slideIn(language === 'ar' ? 'right' : 'left')}
                className="w-64"
              >
                <FilterPanel
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategoryChange={handleCategoryChange}
                  t={t}
                />
              </motion.aside>
            )}
            <div className="flex-1">
              <p className="text-sm text-[#2C2C2C]/70 mb-4">{productsWithImages.length} {t.products}</p>
              {loadingProducts ? <LoadingSpinner /> : (
                <div className="grid grid-cols-2 gap-4">
                  {productsWithImages.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                      t={t}
                      language={language}
                      onImageError={handleProductImageError}
                      hasImageError={productImageErrors[product.id]}
                    />
                  ))}
                  {productsWithImages.length === 0 && <EmptyState t={t} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Desktop layout ────────────────────────────────────────────────────────
  return (
    <div className={containerClasses} style={rtlStyles}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} className={headerMargin}>
          <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
          <p className={subtitleClasses}>{t.subtitle}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64">
            <FilterPanel
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategoryChange={handleCategoryChange}
              t={t}
            />
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <p className="text-sm text-[#2C2C2C]/70">{productsWithImages.length} {t.products}</p>
            </div>

            {loadingProducts ? <LoadingSpinner /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {productsWithImages.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    t={t}
                    language={language}
                    onImageError={handleProductImageError}
                    hasImageError={productImageErrors[product.id]}
                  />
                ))}
                {productsWithImages.length === 0 && <EmptyState t={t} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}