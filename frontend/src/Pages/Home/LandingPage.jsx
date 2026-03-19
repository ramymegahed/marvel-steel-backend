import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Ruler, Truck, Wallet,
  ShoppingBag, MousePointer, CreditCard,
  Star, ChevronLeft, ChevronRight, Loader, ImageOff
} from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { BASE_URL } from '../../App';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const ANIMATION_DURATION = 0.6;
const DELAY_STEP = 0.1;

const REVIEWS_PER_PAGE = 3;
const PRODUCTS_PER_PAGE = 4; // Changed from PRODUCTS_PER_LOAD to PRODUCTS_PER_PAGE
const CATEGORIES_PER_PAGE = 6;
const MAX_PRODUCTS_TO_SHOW = 4; // Kept for backward compatibility

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1633944095397-878622ebc01c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80';

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
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: ANIMATION_DURATION },
};

const heroAnimation = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8 }
};

// ─── Content Dictionary ─────────────────────────────────────────────────────
const LANDING_CONTENT = {
  en: {
    heroTitle: 'Crafted to Elevate Your Living Space',
    heroSubtitle: 'Timeless steel and wood designs made to last.',
    exploreCollection: 'Explore Collection',
    shopBedrooms: 'Shop Bedrooms',
    shopByCategory: 'Shop by Category',
    featuredProducts: 'Featured Products',
    featuredSubtitle: 'Handpicked pieces for your home',
    whyChooseUs: 'Why Choose Marvel Steel',
    howItWorks: 'How It Works',
    whatOurCustomersSay: 'What Our Customers Say',
    readyToTransform: 'Ready to Transform Your Home?',
    shopNow: 'Shop Now',
    viewDetails: 'View Details',
    loading: 'Loading...',
    error: 'Error loading content',
    retry: 'Retry',
    from: 'from',
    to: 'to',
    price: 'Price',
    sale: 'SALE',
    outOfStock: 'Out of Stock',
    noImage: 'No image available',
    noCategories: 'No categories available',
    noProducts: 'No products available',
    noReviews: 'No reviews yet',
    prev: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    benefits: [
      { icon: 'Package', title: 'Premium Materials', description: 'Only the finest steel and wood' },
      { icon: 'Ruler', title: 'Custom Sizes Available', description: 'Tailored to your space' },
      { icon: 'Truck', title: 'Fast Delivery', description: 'Quick and reliable shipping' },
      { icon: 'Wallet', title: 'Cash on Delivery', description: 'Pay when you receive' },
    ],
    steps: [
      { icon: 'MousePointer', title: 'Choose Your Design', description: 'Browse our collection and find the perfect piece' },
      { icon: 'ShoppingBag', title: 'Add to Cart & Submit', description: 'Select your options and place your order' },
      { icon: 'CreditCard', title: 'Pay on Delivery', description: 'Cash on Delivery — pay when your order arrives' },
    ],
  },
  ar: {
    heroTitle: 'مصممة لترتقي بمساحة معيشتك',
    heroSubtitle: 'تصاميم خالدة من الستيل والخشب تدوم طويلاً',
    exploreCollection: 'استكشف المجموعة',
    shopBedrooms: 'تسوق غرف النوم',
    shopByCategory: 'تسوق حسب الفئة',
    featuredProducts: 'منتجات مميزة',
    featuredSubtitle: 'قطع مختارة بعناية لمنزلك',
    whyChooseUs: 'لماذا تختار مارفل ستيل',
    howItWorks: 'كيف يعمل',
    whatOurCustomersSay: 'ماذا يقول عملاؤنا',
    readyToTransform: 'مستعد لتحويل منزلك؟',
    shopNow: 'تسوق الآن',
    viewDetails: 'عرض التفاصيل',
    loading: 'جاري التحميل...',
    error: 'خطأ في تحميل المحتوى',
    retry: 'إعادة المحاولة',
    from: 'من',
    to: 'إلى',
    price: 'السعر',
    sale: 'تخفيض',
    outOfStock: 'غير متوفر',
    noImage: 'لا توجد صورة',
    noCategories: 'لا توجد فئات',
    noProducts: 'لا توجد منتجات',
    noReviews: 'لا توجد تقييمات بعد',
    prev: 'السابق',
    next: 'التالي',
    page: 'صفحة',
    of: 'من',
    benefits: [
      { icon: 'Package', title: 'مواد فاخرة', description: 'أجود أنواع الستيل والخشب' },
      { icon: 'Ruler', title: 'مقاسات حسب الطلب', description: 'مصممة لتناسب مساحتك' },
      { icon: 'Truck', title: 'توصيل سريع', description: 'شحن سريع وموثوق' },
      { icon: 'Wallet', title: 'الدفع عند الاستلام', description: 'ادفع عند استلام الطلب' },
    ],
    steps: [
      { icon: 'MousePointer', title: 'اختر تصميمك', description: 'تصفح مجموعتنا وابحث عن القطعة المثالية' },
      { icon: 'ShoppingBag', title: 'أضف إلى السلة وأرسل', description: 'اختر خياراتك وقدم طلبك' },
      { icon: 'CreditCard', title: 'ادفع عند الاستلام', description: 'الدفع عند الاستلام — ادفع حين يصل طلبك' },
    ],
  },
};

// Icon mapping
const ICONS = {
  Package, Ruler, Truck, Wallet, MousePointer, ShoppingBag, CreditCard
};

// ─── Extracted Components ───────────────────────────────────────────────────

const LoadingSkeleton = React.memo(({ count = 3, type = 'category' }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="animate-pulse">
        {type === 'category' && (
          <div className="h-64 sm:h-80 md:h-96 bg-gray-300 rounded-xl"></div>
        )}
        {type === 'product' && (
          <div className="bg-[#F5F1E8] rounded-xl overflow-hidden">
            <div className="aspect-square bg-gray-300"></div>
            <div className="p-4 sm:p-6">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
        {type === 'review' && (
          <div className="bg-white p-6 rounded-xl">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-4 h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
            <div className="h-16 bg-gray-300 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

const ErrorDisplay = React.memo(({ message, onRetry, t }) => (
  <div className="text-center py-8">
    <p className="text-red-600 mb-4" role="alert">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
        aria-label={t.retry}
      >
        {t.retry}
      </button>
    )}
  </div>
));

ErrorDisplay.displayName = 'ErrorDisplay';

const NoImagePlaceholder = React.memo(({ t, categoryName }) => (
  <div className="w-full h-full bg-[#8B5E3C]/10 flex flex-col items-center justify-center p-4">
    <Package className="w-16 h-16 text-[#8B5E3C]/40 mb-2" aria-hidden="true" />
    <p className="text-lg text-[#2C2C2C]/70 text-center font-medium">{categoryName}</p>
    <p className="text-sm text-[#2C2C2C]/50 text-center mt-2">{t.noImage}</p>
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

const CategoryCard = React.memo(({ category, language, onImageError, hasImageError }) => {
  const catImage = useMemo(() => getFullImageUrl(category.image_url), [category.image_url]);
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  const handleImageError = useCallback(() => {
    onImageError(category.id);
  }, [category.id, onImageError]);

  return (
    <Link
      to={`/shop?category_id=${category.id}`}
      className="group block relative h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
      aria-label={`Shop ${category.name}`}
    >
      {!hasImageError && catImage ? (
        <>
          <img
            src={catImage}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <h3 className="text-2xl sm:text-3xl text-white px-4 text-center" style={titleFont}>
              {category.name}
            </h3>
          </div>
        </>
      ) : (
        <NoImagePlaceholder t={{ noImage: language === 'ar' ? 'لا توجد صورة' : 'No image' }} categoryName={category.name} />
      )}
    </Link>
  );
});

CategoryCard.displayName = 'CategoryCard';

const ProductCard = React.memo(({ product, language, t, onImageError, hasImageError }) => {
  const imgSrc = useMemo(() => getProductImage(product), [product]);
  const hasSizes = useMemo(() => product.sizes && product.sizes.length > 0, [product.sizes]);
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit'
  }), [language]);

  const handleImageError = useCallback(() => {
    onImageError(product.id);
  }, [product.id, onImageError]);

  return (
    <div className="bg-[#F5F1E8] rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="aspect-square overflow-hidden bg-[#EBE7DC] shrink-0 relative">
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
            {product.sizes.length} {product.sizes.length > 1 ? 'Sizes' : 'Size'}
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6 flex flex-col grow">
        <h3 className="text-base sm:text-lg text-[#2C2C2C] mb-2 line-clamp-2 min-h-14" style={titleFont}>
          {product.name}
        </h3>

        <PriceDisplay product={product} t={t} language={language} />

        <div className="mt-4">
          <Link
            to={`/product/${product.id}`}
            className="block w-full py-2.5 sm:py-3 text-center bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
            aria-label={`View details for ${product.name}`}
          >
            {t.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const ReviewCard = React.memo(({ review, language }) => {
  const formattedDate = useMemo(() =>
    new Date(review.created_at).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-GB',
      { year: 'numeric', month: 'short', day: 'numeric' }
    ), [review.created_at, language]
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col h-full">
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-[#8B5E3C] text-[#8B5E3C]" aria-hidden="true" />
        ))}
      </div>
      <p className="text-sm sm:text-base text-[#2C2C2C]/80 leading-relaxed mb-4 grow">
        "{review.comment}"
      </p>
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
        <p className="text-sm font-medium text-[#2C2C2C]">{review.customer_name}</p>
        <time className="text-xs text-[#2C2C2C]/50" dateTime={review.created_at}>
          {formattedDate}
        </time>
      </div>
    </div>
  );
});

ReviewCard.displayName = 'ReviewCard';

const BenefitCard = React.memo(({ benefit, index, t }) => {
  const IconComponent = ICONS[benefit.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: ANIMATION_DURATION, delay: index * DELAY_STEP }}
      className="text-center"
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-[#8B5E3C] rounded-full flex items-center justify-center">
        <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-lg sm:text-xl text-[#2C2C2C] mb-2">{benefit.title}</h3>
      <p className="text-sm sm:text-base text-[#2C2C2C]/70">{benefit.description}</p>
    </motion.div>
  );
});

BenefitCard.displayName = 'BenefitCard';

const StepCard = React.memo(({ step, index, language, t, isLast }) => {
  const IconComponent = ICONS[step.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: ANIMATION_DURATION, delay: index * DELAY_STEP }}
      className="text-center relative"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-[#8B5E3C] rounded-full flex items-center justify-center">
        <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
      </div>
      <h3 className="text-lg sm:text-xl text-[#2C2C2C] mb-2 sm:mb-3">{step.title}</h3>
      <p className="text-sm sm:text-base text-[#2C2C2C]/70">{step.description}</p>
      {!isLast && (
        <div
          className="hidden md:block absolute top-10 w-[80%] h-0.5 bg-[#8B5E3C]/30"
          style={{
            [language === 'ar' ? 'right' : 'left']: '60%',
            transform: language === 'ar' ? 'scaleX(-1)' : 'none',
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
});

StepCard.displayName = 'StepCard';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const { language } = useLanguage();

  // ─── API state ─────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);

  // ─── Pagination state ────────────────────────────────────────────────────
  const [categoryPage, setCategoryPage] = useState(0);
  const [productPage, setProductPage] = useState(0);

  // ─── Loading states ────────────────────────────────────────────────────────
  const [loadingStates, setLoadingStates] = useState({
    categories: true,
    products: true,
    reviews: true
  });

  // ─── Error states ──────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({
    categories: null,
    products: null,
    reviews: null
  });

  // ─── Image error states ────────────────────────────────────────────────────
  const [categoryImageErrors, setCategoryImageErrors] = useState({});
  const [productImageErrors, setProductImageErrors] = useState({});

  // ─── Computed values ───────────────────────────────────────────────────────
  const totalReviewPages = useMemo(() =>
    Math.ceil(reviews.length / REVIEWS_PER_PAGE), [reviews.length]
  );

  // Category pagination computed values
  const totalCategoryPages = useMemo(() =>
    Math.ceil(categories.length / CATEGORIES_PER_PAGE), [categories.length]
  );

  const visibleCategories = useMemo(() =>
    categories.slice(
      categoryPage * CATEGORIES_PER_PAGE,
      categoryPage * CATEGORIES_PER_PAGE + CATEGORIES_PER_PAGE
    ), [categories, categoryPage]
  );

  // Product pagination computed values
  const productsWithImages = useMemo(() =>
    featuredProducts.filter(hasProductImage), [featuredProducts]
  );

  const totalProductPages = useMemo(() =>
    Math.ceil(productsWithImages.length / PRODUCTS_PER_PAGE), [productsWithImages.length]
  );

  const visibleProducts = useMemo(() =>
    productsWithImages.slice(
      productPage * PRODUCTS_PER_PAGE,
      productPage * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE
    ), [productsWithImages, productPage]
  );

  const visibleReviews = useMemo(() =>
    reviews.slice(
      reviewPage * REVIEWS_PER_PAGE,
      reviewPage * REVIEWS_PER_PAGE + REVIEWS_PER_PAGE
    ), [reviews, reviewPage]
  );

  // Show categories even without images - just take current page
  const categoriesToShow = useMemo(() =>
    visibleCategories, [visibleCategories]
  );

  // Show products with pagination
  const productsToShow = useMemo(() =>
    visibleProducts, [visibleProducts]
  );

  // ─── Memoized values ───────────────────────────────────────────────────────
  const t = useMemo(() => LANDING_CONTENT[language], [language]);

  const rtlStyles = useMemo(() => language === 'ar' ? {
    direction: 'rtl',
    textAlign: 'right',
  } : {}, [language]);

  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  const heroMargin = useMemo(() =>
    language === 'ar' ? 'auto' : 0, [language]
  );

  // ─── Fetch Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    const abortControllers = [];

    const fetchData = async (url, signal, setter, setLoading, setError, errorMessage) => {
      try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(errorMessage);
        const data = await response.json();
        setter(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error(`${errorMessage}:`, err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    // Fetch categories - get all categories for pagination
    const categoriesController = new AbortController();
    abortControllers.push(categoriesController);
    fetchData(
      `${BASE_URL}/categories/`,
      categoriesController.signal,
      setCategories,
      (loading) => setLoadingStates(prev => ({ ...prev, categories: loading })),
      (error) => setErrors(prev => ({ ...prev, categories: error })),
      'Failed to fetch categories'
    );

    // Fetch products - get all products for pagination (removed limit)
    const productsController = new AbortController();
    abortControllers.push(productsController);
    fetchData(
      `${BASE_URL}/products/`,
      productsController.signal,
      setFeaturedProducts,
      (loading) => setLoadingStates(prev => ({ ...prev, products: loading })),
      (error) => setErrors(prev => ({ ...prev, products: error })),
      'Failed to fetch products'
    );

    // Fetch reviews
    const reviewsController = new AbortController();
    abortControllers.push(reviewsController);
    fetchData(
      `${BASE_URL}/reviews/?skip=0&limit=100`,
      reviewsController.signal,
      setReviews,
      (loading) => setLoadingStates(prev => ({ ...prev, reviews: loading })),
      (error) => setErrors(prev => ({ ...prev, reviews: error })),
      'Failed to fetch reviews'
    );

    return () => {
      abortControllers.forEach(controller => controller.abort());
    };
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Reset product page when products change (e.g., after fetch)
  useEffect(() => {
    setProductPage(0);
  }, [featuredProducts]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleCategoryImageError = useCallback((categoryId) => {
    setCategoryImageErrors(prev => ({ ...prev, [categoryId]: true }));
  }, []);

  const handleProductImageError = useCallback((productId) => {
    setProductImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const handleReviewPageChange = useCallback((newPage) => {
    setReviewPage(newPage);
    document.getElementById('reviews-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  // Category pagination handlers
  const handleCategoryPageChange = useCallback((newPage) => {
    setCategoryPage(newPage);
    document.getElementById('categories-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  // Product pagination handlers
  const handleProductPageChange = useCallback((newPage) => {
    setProductPage(newPage);
    document.getElementById('products-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <main className="bg-[#F5F1E8] min-h-screen" style={rtlStyles}>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            {...heroAnimation}
            className="max-w-2xl"
            style={{ marginLeft: heroMargin }}
          >
            <h1
              className="text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight"
              style={titleFont}
            >
              {t.heroTitle}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-10 leading-relaxed">{t.heroSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label={t.exploreCollection}
              >
                {t.exploreCollection}
              </Link>
              <Link
                to="/shop"
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-xl hover:bg-white hover:text-[#2C2C2C] transition-colors text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                aria-label={t.shopBedrooms}
              >
                {t.shopBedrooms}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section id="categories-section" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl text-[#2C2C2C] mb-4" style={titleFont}>
              {t.shopByCategory}
            </h2>
          </motion.div>

          {loadingStates.categories && <LoadingSkeleton count={3} type="category" />}

          {errors.categories && !loadingStates.categories && (
            <ErrorDisplay message={errors.categories} onRetry={handleRetry} t={t} />
          )}

          {!loadingStates.categories && !errors.categories && categoriesToShow.length === 0 && (
            <div className="text-center py-12 text-[#2C2C2C]/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p>{t.noCategories}</p>
            </div>
          )}

          {!loadingStates.categories && !errors.categories && categoriesToShow.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {categoriesToShow.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: ANIMATION_DURATION, delay: index * DELAY_STEP }}
                  >
                    <CategoryCard
                      category={category}
                      language={language}
                      onImageError={handleCategoryImageError}
                      hasImageError={categoryImageErrors[category.id]}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Category Pagination controls */}
              {totalCategoryPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 sm:mt-12">
                  <button
                    onClick={() => handleCategoryPageChange(Math.max(0, categoryPage - 1))}
                    disabled={categoryPage === 0}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-[#8B5E3C] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    aria-label={language === 'ar' ? 'الفئات السابقة' : 'Previous categories'}
                  >
                    {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <span className="text-sm text-[#2C2C2C]/70">
                    {t.page} {categoryPage + 1} {t.of} {totalCategoryPages}
                  </span>
                  <button
                    onClick={() => handleCategoryPageChange(Math.min(totalCategoryPages - 1, categoryPage + 1))}
                    disabled={categoryPage >= totalCategoryPages - 1}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-[#8B5E3C] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    aria-label={language === 'ar' ? 'الفئات التالية' : 'Next categories'}
                  >
                    {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section id="products-section" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl text-[#2C2C2C] mb-4" style={titleFont}>
              {t.featuredProducts}
            </h2>
            <p className="text-sm sm:text-base text-[#2C2C2C]/70">{t.featuredSubtitle}</p>
          </motion.div>

          {loadingStates.products && <LoadingSkeleton count={4} type="product" />}

          {errors.products && !loadingStates.products && (
            <ErrorDisplay message={errors.products} onRetry={handleRetry} t={t} />
          )}

          {!loadingStates.products && !errors.products && productsToShow.length === 0 && (
            <div className="text-center py-12 text-[#2C2C2C]/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p>{t.noProducts}</p>
            </div>
          )}

          {!loadingStates.products && !errors.products && productsToShow.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {productsToShow.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: ANIMATION_DURATION, delay: index * DELAY_STEP }}
                  >
                    <ProductCard
                      product={product}
                      language={language}
                      t={t}
                      onImageError={handleProductImageError}
                      hasImageError={productImageErrors[product.id]}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Product Pagination controls */}
              {totalProductPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 sm:mt-12">
                  <button
                    onClick={() => handleProductPageChange(Math.max(0, productPage - 1))}
                    disabled={productPage === 0}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-[#8B5E3C] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    aria-label={language === 'ar' ? 'المنتجات السابقة' : 'Previous products'}
                  >
                    {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <span className="text-sm text-[#2C2C2C]/70">
                    {t.page} {productPage + 1} {t.of} {totalProductPages}
                  </span>
                  <button
                    onClick={() => handleProductPageChange(Math.min(totalProductPages - 1, productPage + 1))}
                    disabled={productPage >= totalProductPages - 1}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-[#8B5E3C] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    aria-label={language === 'ar' ? 'المنتجات التالية' : 'Next products'}
                  >
                    {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#EBE7DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl text-[#2C2C2C] mb-4" style={titleFont}>
              {t.whyChooseUs}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {t.benefits.map((benefit, index) => (
              <BenefitCard key={benefit.title} benefit={benefit} index={index} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl text-[#2C2C2C] mb-4" style={titleFont}>
              {t.howItWorks}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {t.steps.map((step, index) => (
              <StepCard
                key={step.title}
                step={step}
                index={index}
                language={language}
                t={t}
                isLast={index === t.steps.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ───────────────────────────────────────────────── */}
      <section id="reviews-section" className="py-16 sm:py-20 bg-[#EBE7DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl text-[#2C2C2C] mb-4" style={titleFont}>
              {t.whatOurCustomersSay}
            </h2>
          </motion.div>

          {loadingStates.reviews && <LoadingSkeleton count={3} type="review" />}

          {errors.reviews && !loadingStates.reviews && (
            <ErrorDisplay message={errors.reviews} onRetry={handleRetry} t={t} />
          )}

          {!loadingStates.reviews && !errors.reviews && reviews.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleReviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * DELAY_STEP }}
                  >
                    <ReviewCard review={review} language={language} />
                  </motion.div>
                ))}
              </div>

              {/* Pagination controls */}
              {totalReviewPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => handleReviewPageChange(Math.max(0, reviewPage - 1))}
                    disabled={reviewPage === 0}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-[#8B5E3C] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    aria-label={language === 'ar' ? 'التعليقات السابقة' : 'Previous reviews'}
                  >
                    {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                  </button>
                  <span className="text-sm text-[#2C2C2C]/70">
                    {t.page} {reviewPage + 1} {t.of} {totalReviewPages}
                  </span>
                  <button
                    onClick={() => handleReviewPageChange(Math.min(totalReviewPages - 1, reviewPage + 1))}
                    disabled={reviewPage >= totalReviewPages - 1}
                    className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center disabled:opacity-40 hover:bg-[#8B5E3C] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]"
                    aria-label={language === 'ar' ? 'التعليقات التالية' : 'Next reviews'}
                  >
                    {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </>
          )}

          {!loadingStates.reviews && !errors.reviews && reviews.length === 0 && (
            <p className="text-center text-[#2C2C2C]/70">{t.noReviews}</p>
          )}
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 bg-[#5C3A21] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: ANIMATION_DURATION }}
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl mb-6 sm:mb-8 leading-tight"
              style={titleFont}
            >
              {t.readyToTransform}
            </h2>
            <Link
              to="/shop"
              className="inline-block px-8 sm:px-10 py-3 sm:py-4 bg-white text-[#2C2C2C] rounded-xl hover:bg-[#F5F1E8] transition-colors text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5C3A21]"
              aria-label={t.shopNow}
            >
              {t.shopNow}
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}