import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Check, Truck, Shield, ArrowLeft, Loader, Ruler, ImageOff } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useCart } from '../../Components/Context/Cartcontext';
import { BASE_URL } from '../../App';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const ANIMATION_DURATION = 0.6;
const SUCCESS_MESSAGE_DURATION = 3000;
const NULL_VARIANT_VALUE = 'null';

// ─── Helper Functions ──────────────────────────────────────────────────────
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Handle external URLs
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    try {
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
    // Fallback in case of decoding error, try to clean path without decoding
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
    if (!product?.sizes || product.sizes.length === 0) return null;

    const prices = product.sizes
        .map((size) => Number(size.price))
        .filter((price) => Number.isFinite(price) && price >= 0);

    if (prices.length === 0) return null;

    return { min: Math.min(...prices), max: Math.max(...prices) };
};

const getProductDiscountRange = (product) => {
    if (!product?.sizes || product.sizes.length === 0) return null;

    const discounts = product.sizes
        .map((size) => Number(size.discount_price))
        .filter((price) => Number.isFinite(price) && price > 0);

    if (discounts.length === 0) return null;

    return { min: Math.min(...discounts), max: Math.max(...discounts) };
};

const formatPrice = (price, language) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

// ─── Variant Parsing Helpers ───────────────────────────────────────────────
const normalizeKey = (key) => {
    if (!key) return '';

    const normalized = key.trim().toLowerCase();

    const keyMap = {
        color: 'color',
        colours: 'color',
        colour: 'color',
        colors: 'color',
        لون: 'color',
        الون: 'color',

        size: 'size',
        sizes: 'size',
        مقاس: 'size',
        المقاس: 'size',
        dimension: 'size',
        dimensions: 'size',
        bed_size: 'size',

        slat: 'slats',
        slats: 'slats',
        شريحة: 'slats',
        شرائح: 'slats',
        عدد_الشرائح: 'slats',
        panels: 'slats',
        panel: 'slats',
        slats_type: 'slats',

        metal_color: 'metal_color',
        cushion_color: 'cushion_color',
        rope_color: 'rope_color',
        umbrella_color: 'umbrella_color',
    };

    return keyMap[normalized] || normalized;
};

const normalizeAttributeValue = (value) => {
    if (value === null || value === undefined) return NULL_VARIANT_VALUE;

    const stringValue = String(value).trim();
    return stringValue === '' ? NULL_VARIANT_VALUE : stringValue;
};

const getLocalizedGroupLabel = (key, language) => {
    const labels = {
        color: language === 'ar' ? 'الألوان' : 'Colors',
        size: language === 'ar' ? 'المقاس' : 'Size',
        slats: language === 'ar' ? 'الشرائح' : 'Slats',
        metal_color: language === 'ar' ? 'لون المعدن' : 'Metal Color',
        cushion_color: language === 'ar' ? 'لون الكوشن' : 'Cushion Color',
        rope_color: language === 'ar' ? 'لون الحبل' : 'Rope Color',
        umbrella_color: language === 'ar' ? 'لون المظلة' : 'Umbrella Color',
    };

    if (labels[key]) return labels[key];

    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const splitVariantName = (name) => {
    if (!name || typeof name !== 'string') return [];

    return name
        .split(/\s*(?:\/|\||,)\s*/g)
        .map((part) => part.trim())
        .filter(Boolean);
};

const extractAttributesFromFields = (sizeObj) => {
    if (!sizeObj || typeof sizeObj !== 'object') return {};

    const fieldMap = [
        ['bed_size', 'size'],
        ['metal_color', 'metal_color'],
        ['cushion_color', 'cushion_color'],
        ['rope_color', 'rope_color'],
        ['umbrella_color', 'umbrella_color'],
        ['slats_type', 'slats'],
    ];

    const attributes = {};

    fieldMap.forEach(([sourceKey, normalizedKey]) => {
        if (Object.prototype.hasOwnProperty.call(sizeObj, sourceKey)) {
            const value = sizeObj[sourceKey];
            // Only include if value exists and is not empty
            if (value && value !== '' && value !== null && value !== undefined) {
                attributes[normalizedKey] = normalizeAttributeValue(value);
            }
        }
    });

    return attributes;
};

const parseVariantAttributesFromName = (sizeObj) => {
    const rawName = sizeObj?.name || '';

    if (rawName.startsWith('{') && rawName.endsWith('}')) {
        try {
            const parsed = JSON.parse(rawName);
            if (typeof parsed === 'object' && parsed !== null) {
                const normalizedAttrs = {};
                Object.entries(parsed).forEach(([key, value]) => {
                    const normalizedKey = normalizeKey(key);
                    normalizedAttrs[normalizedKey] = normalizeAttributeValue(value);
                });
                return normalizedAttrs;
            }
        } catch (e) {
            // continue
        }
    }

    const parts = splitVariantName(rawName);

    if (!parts.length) {
        return { fallback: NULL_VARIANT_VALUE };
    }

    const explicitAttributes = {};
    const looseValues = [];

    parts.forEach((part) => {
        const keyValueMatch = part.match(/^([^:]+)\s*:\s*(.+)$/);
        if (keyValueMatch) {
            const [, rawKey, rawValue] = keyValueMatch;
            const normalizedKey = normalizeKey(rawKey);
            explicitAttributes[normalizedKey] = normalizeAttributeValue(rawValue);
        } else {
            looseValues.push(part);
        }
    });

    if (Object.keys(explicitAttributes).length > 0) {
        return explicitAttributes;
    }

    if (looseValues.length === 1) {
        const value = normalizeAttributeValue(looseValues[0]);
        if (/\d/.test(value) || ['s', 'm', 'l', 'xl', 'xxl'].includes(value.toLowerCase())) {
            return { size: value };
        }
        return { color: value };
    }

    if (looseValues.length === 2) {
        return {
            color: normalizeAttributeValue(looseValues[0]),
            size: normalizeAttributeValue(looseValues[1]),
        };
    }

    if (looseValues.length >= 3) {
        const attributes = {};
        const possibleKeys = ['color', 'size', 'slats', 'material', 'style', 'finish'];

        looseValues.forEach((value, index) => {
            const normalizedValue = normalizeAttributeValue(value);
            if (index < possibleKeys.length) {
                attributes[possibleKeys[index]] = normalizedValue;
            } else {
                attributes[`attribute_${index + 1}`] = normalizedValue;
            }
        });

        return attributes;
    }

    return { fallback: normalizeAttributeValue(rawName) };
};

const parseVariantAttributes = (sizeObj) => {
    const fieldAttributes = extractAttributesFromFields(sizeObj);

    // Prefer API fields when they exist
    if (Object.keys(fieldAttributes).length > 0) {
        return fieldAttributes;
    }

    // Fallback to parsing name
    return parseVariantAttributesFromName(sizeObj);
};

// Update the buildVariantGroups function to handle Default/duplicate entries
const buildVariantGroups = (sizes) => {
    if (!Array.isArray(sizes) || sizes.length === 0) {
        return { groups: [], enrichedSizes: [], canSplit: false };
    }

    // First, deduplicate sizes based on their attributes
    const uniqueSizes = [];
    const seenAttributes = new Set();

    sizes.forEach((size) => {
        const parsed = parseVariantAttributes(size);

        // Create a key from non-null attributes
        const attributeKey = Object.entries(parsed)
            .filter(([_, value]) => value && value !== NULL_VARIANT_VALUE && value !== 'null' && value !== '')
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join('|');

        // If no attributes, treat as default/fallback
        if (!attributeKey) {
            // Only add one default/fallback size
            if (!seenAttributes.has('default')) {
                seenAttributes.add('default');
                uniqueSizes.push(size);
            }
        } else if (!seenAttributes.has(attributeKey)) {
            seenAttributes.add(attributeKey);
            uniqueSizes.push(size);
        }
    });

    const enrichedSizes = uniqueSizes.map((size) => ({
        ...size,
        parsedAttributes: parseVariantAttributes(size),
    }));

    const allAttributeKeys = new Set();
    enrichedSizes.forEach((size) => {
        Object.keys(size.parsedAttributes || {}).forEach((key) => {
            if (key !== 'fallback') {
                const value = size.parsedAttributes[key];
                // Only include key if it has a non-null value
                if (value && value !== NULL_VARIANT_VALUE && value !== 'null' && value !== '') {
                    allAttributeKeys.add(key);
                }
            }
        });
    });

    const priorityOrder = [
        'size',
        'color',
        'metal_color',
        'cushion_color',
        'rope_color',
        'umbrella_color',
        'slats',
        'material',
        'style',
        'finish',
    ];

    const sortedKeys = Array.from(allAttributeKeys).sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a);
        const bIndex = priorityOrder.indexOf(b);

        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return a.localeCompare(b);
    });

    const groups = sortedKeys
        .map((key) => {
            const options = Array.from(
                new Set(
                    enrichedSizes
                        .map((size) => normalizeAttributeValue(size.parsedAttributes?.[key]))
                        .filter(option =>
                            option !== NULL_VARIANT_VALUE &&
                            option !== null &&
                            option !== undefined &&
                            option !== 'null' &&
                            option !== ''
                        )
                )
            );

            return { key, options };
        })
        .filter((group) => group.options.length > 0);

    // If no groups but we have sizes, treat as simple product with one option
    const canSplit = groups.length > 0;

    return {
        groups,
        enrichedSizes,
        canSplit,
        // Add this to indicate if it's a simple product (like Default)
        isSimpleProduct: !canSplit && enrichedSizes.length === 1
    };
};

const findMatchingVariant = (sizes, selections) => {
    if (!Array.isArray(sizes) || sizes.length === 0) return null;

    return sizes.find((size) => {
        const attrs = size.parsedAttributes || {};

        return Object.entries(selections).every(([key, value]) => {
            if (value === undefined || value === '') return true;

            const normalizedSelected = normalizeAttributeValue(value);
            const normalizedAttr = normalizeAttributeValue(attrs[key]);

            return normalizedAttr === normalizedSelected;
        });
    }) || null;
};

// ─── Animation Variants ─────────────────────────────────────────────────────
const slideIn = (direction = 'left') => ({
    initial: { opacity: 0, x: direction === 'left' ? -30 : 30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: ANIMATION_DURATION }
});

const fadeInScale = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
};

// ─── Content Dictionary ─────────────────────────────────────────────────────
const PRODUCT_CONTENT = {
    en: {
        backToShop: 'Back to Shop',
        back: 'Back',
        selectSize: 'Select Size',
        sizeGuide: 'Size Guide',
        quantity: 'Quantity',
        addToCart: 'Add to Cart',
        adding: 'Adding...',
        addedSuccess: 'Added to cart successfully!',
        description: 'Description',
        materials: 'Materials',
        deliveryTime: 'Delivery Time',
        deliveryInfo: 'Delivery Information',
        deliveryText: 'Fast delivery across Egypt. Pay on delivery — no upfront payment required.',
        trustBadge: 'We will contact you within 24 hours to confirm your order.',
        productNotFound: 'Product not found',
        category: 'Category',
        pleaseCompleteSelection: 'Please complete your selection',
        availableOptions: 'Available Options',
        noOptionsRequired: 'No options to select',
        oneSize: 'One Size',
        from: 'from',
        to: 'to',
        price: 'Price',
        total: 'Total',
        sale: 'SALE',
        outOfStock: 'Out of Stock',
        unitPrice: 'Unit Price',
        noImages: 'No images available for this product',
        imageLoadError: 'Failed to load image',
    },
    ar: {
        backToShop: 'العودة للمتجر',
        back: 'رجوع',
        selectSize: 'اختر المقاس',
        sizeGuide: 'دليل المقاسات',
        quantity: 'الكمية',
        addToCart: 'أضف إلى السلة',
        adding: 'جاري الإضافة...',
        addedSuccess: 'تمت الإضافة إلى السلة بنجاح!',
        description: 'الوصف',
        materials: 'الخامات',
        deliveryTime: 'وقت التوصيل',
        deliveryInfo: 'معلومات التوصيل',
        deliveryText: 'توصيل سريع في جميع أنحاء مصر. الدفع عند الاستلام — لا دفعة مقدمة.',
        trustBadge: 'سنتواصل معك خلال ٢٤ ساعة لتأكيد طلبك.',
        productNotFound: 'المنتج غير موجود',
        category: 'الفئة',
        pleaseCompleteSelection: 'من فضلك أكمل الاختيارات',
        availableOptions: 'الخيارات المتاحة',
        noOptionsRequired: 'لا يحتاج اختيار',
        oneSize: 'مقاس واحد',
        from: 'من',
        to: 'إلى',
        price: 'السعر',
        total: 'الإجمالي',
        sale: 'تخفيض',
        outOfStock: 'غير متوفر',
        unitPrice: 'سعر الوحدة',
        noImages: 'لا توجد صور لهذا المنتج',
        imageLoadError: 'فشل تحميل الصورة',
    },
};

// ─── Extracted Components ───────────────────────────────────────────────────

const LoadingSpinner = React.memo(() => (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center pt-20">
        <Loader className="w-10 h-10 text-[#8B5E3C] animate-spin" aria-label="Loading" />
    </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

const NotFound = React.memo(({ t, onBack }) => (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center pt-20 px-4">
        <div className="text-center">
            <h2 className="text-xl sm:text-2xl text-[#2C2C2C] mb-4">{t.productNotFound}</h2>
            <button
                onClick={onBack}
                className="px-6 py-3 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
                aria-label={t.backToShop}
            >
                {t.backToShop}
            </button>
        </div>
    </div>
));

NotFound.displayName = 'NotFound';

const NoImagePlaceholder = React.memo(({ compact = false, t }) => (
    <div className="w-full h-full bg-[#EBE7DC] flex flex-col items-center justify-center p-4">
        <ImageOff className={`${compact ? 'w-8 h-8' : 'w-16 h-16'} text-[#2C2C2C]/30 mb-2`} aria-hidden="true" />
        <p className={`${compact ? 'text-xs' : 'text-sm'} text-[#2C2C2C]/50 text-center`}>{t.noImages}</p>
    </div>
));

NoImagePlaceholder.displayName = 'NoImagePlaceholder';

const PriceDisplay = React.memo(({ product, selectedSize, quantity, t, language, compact = false, showTotal = false }) => {
    const priceRange = useMemo(() => getProductPriceRange(product), [product]);
    const discountRange = useMemo(() => getProductDiscountRange(product), [product]);

    if (!priceRange) {
        return <p className="text-sm text-[#2C2C2C]/50 mt-2">{t.outOfStock}</p>;
    }

    const hasDiscount = discountRange !== null;
    const showRange = priceRange.min !== priceRange.max && !selectedSize;

    const totalPrice = useMemo(() => {
        if (!selectedSize) return null;
        const unitPrice = Number(selectedSize.discount_price) > 0 ? Number(selectedSize.discount_price) : Number(selectedSize.price);
        return unitPrice * quantity;
    }, [selectedSize, quantity]);

    return (
        <div className="mb-4 space-y-2">
            <div>
                {selectedSize ? (
                    <div>
                        {hasDiscount && Number(selectedSize.discount_price) > 0 ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                        {t.sale}
                                    </span>
                                    <span className="text-sm text-[#2C2C2C]/50 line-through">
                                        {formatPrice(Number(selectedSize.price), language)}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xs text-[#2C2C2C]/70">{t.unitPrice}:</span>
                                    <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-red-600`}>
                                        {formatPrice(Number(selectedSize.discount_price), language)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs text-[#2C2C2C]/70">{t.unitPrice}:</span>
                                <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-[#2C2C2C]`}>
                                    {formatPrice(Number(selectedSize.price), language)}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {hasDiscount && (
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                    {t.sale}
                                </span>
                                <span className="text-xs text-[#2C2C2C]/50 line-through">
                                    {showRange
                                        ? `${formatPrice(priceRange.min, language)} - ${formatPrice(priceRange.max, language)}`
                                        : formatPrice(priceRange.min, language)
                                    }
                                </span>
                            </div>
                        )}
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs text-[#2C2C2C]/70">{t.price}:</span>
                            {hasDiscount ? (
                                <span className={`${compact ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-red-600`}>
                                    {showRange
                                        ? `${formatPrice(discountRange.min, language)} - ${formatPrice(discountRange.max, language)}`
                                        : formatPrice(discountRange.min, language)
                                    }
                                </span>
                            ) : (
                                <span className={`${compact ? 'text-2xl' : 'text-3xl md:text-4xl'} font-bold text-[#2C2C2C]`}>
                                    {showRange
                                        ? `${formatPrice(priceRange.min, language)} - ${formatPrice(priceRange.max, language)}`
                                        : formatPrice(priceRange.min, language)
                                    }
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showTotal && selectedSize && totalPrice !== null && quantity > 1 && (
                <div className="pt-3 mt-2 border-t border-[#2C2C2C]/10">
                    <div className="flex items-baseline justify-between">
                        <span className="text-sm font-medium text-[#2C2C2C]">{t.total}:</span>
                        <span className={`${compact ? 'text-xl' : 'text-2xl'} font-bold text-[#8B5E3C]`}>
                            {formatPrice(totalPrice, language)}
                        </span>
                    </div>
                    <p className="text-xs text-[#2C2C2C]/50 mt-1">
                        ({quantity} × {formatPrice(Number(selectedSize.discount_price) > 0 ? Number(selectedSize.discount_price) : Number(selectedSize.price), language)})
                    </p>
                </div>
            )}
        </div>
    );
});

PriceDisplay.displayName = 'PriceDisplay';

const VariantGroupSelector = React.memo(({
    label,
    options,
    selectedValue,
    onSelect,
    compact = false
}) => {
    // Filter out null/undefined options
    const validOptions = useMemo(() =>
        options.filter(option =>
            option !== NULL_VARIANT_VALUE &&
            option !== null &&
            option !== undefined &&
            option !== 'null' &&
            option !== ''
        ), [options]
    );

    // Don't render anything if there are no valid options
    if (validOptions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <h4 className={`${compact ? 'text-sm' : 'text-base'} text-[#2C2C2C] font-medium`}>
                {label}
            </h4>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {validOptions.map((option) => (
                    <button
                        key={option}
                        onClick={() => onSelect(option)}
                        className={`
                            relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 transition-all text-sm min-h-13
                            ${selectedValue === option
                                ? 'border-[#8B5E3C] bg-[#8B5E3C] text-white shadow-md'
                                : 'border-[#2C2C2C]/20 text-[#2C2C2C] hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5'
                            }
                            focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2
                        `}
                        aria-pressed={selectedValue === option}
                        aria-label={`${label}: ${option}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            {option.toLowerCase().includes('cm') || /\d/.test(option) ? (
                                <Ruler className={`w-3 h-3 ${selectedValue === option ? 'text-white' : 'text-[#2C2C2C]/40'}`} aria-hidden="true" />
                            ) : (
                                <div
                                    className={`w-3 h-3 rounded-full ${selectedValue === option ? 'bg-white' : 'bg-[#2C2C2C]/40'}`}
                                    aria-hidden="true"
                                />
                            )}
                            <span className="truncate">{option}</span>
                        </div>
                        {selectedValue === option && (
                            <Check className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" aria-hidden="true" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
});

VariantGroupSelector.displayName = 'VariantGroupSelector';

VariantGroupSelector.displayName = 'VariantGroupSelector';

const VariantSelector = React.memo(({
    product,
    selectedSize,
    selectedAttributes,
    onSizeSelect,
    onAttributeSelect,
    selectionError,
    t,
    language,
    compact = false
}) => {
    const hasVariants = product?.sizes?.length > 0;

    const { groups, enrichedSizes, canSplit, isSimpleProduct } = useMemo(
        () => buildVariantGroups(product?.sizes || []),
        [product?.sizes]
    );

    return (
        <div id="variant-selector">
            {hasVariants ? (
                <div className="space-y-4">
                    {canSplit ? (
                        <div className="space-y-4">
                            {groups.map((group) => (
                                <VariantGroupSelector
                                    key={group.key}
                                    label={getLocalizedGroupLabel(group.key, language)}
                                    options={group.options}
                                    selectedValue={selectedAttributes[group.key] || ''}
                                    onSelect={(value) => onAttributeSelect(group.key, value, enrichedSizes)}
                                    compact={compact}
                                />
                            ))}
                        </div>
                    ) : isSimpleProduct ? (
                        // Show a simple message for products with one option
                        <div className="p-4 bg-white/50 rounded-xl border border-[#2C2C2C]/10">
                            <p className="text-sm text-[#2C2C2C]/70 flex items-center gap-2">
                                <Check className="w-4 h-4 text-[#8B5E3C]" aria-hidden="true" />
                                {t.oneSize} - {formatPrice(Number(enrichedSizes[0]?.price), language)}
                            </p>
                        </div>
                    ) : (
                        // Show multiple options when they can't be split into groups
                        <div>
                            <h4 className={`${compact ? 'text-sm' : 'text-base'} text-[#2C2C2C] font-medium mb-2`}>
                                {t.availableOptions}
                            </h4>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                {enrichedSizes.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => onSizeSelect(size)}
                                        className={`
                                            relative px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 transition-all text-sm min-h-13
                                            ${selectedSize?.id === size.id
                                                ? 'border-[#8B5E3C] bg-[#8B5E3C] text-white shadow-md'
                                                : 'border-[#2C2C2C]/20 text-[#2C2C2C] hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5'
                                            }
                                            ${selectionError && !selectedSize ? 'border-red-500 animate-pulse' : ''}
                                            focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2
                                        `}
                                        aria-label={`Option ${size.name}`}
                                        aria-pressed={selectedSize?.id === size.id}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {size.name?.toLowerCase?.().includes('cm') || /\d/.test(size.name || '') ? (
                                                <Ruler className={`w-3 h-3 ${selectedSize?.id === size.id ? 'text-white' : 'text-[#2C2C2C]/40'}`} aria-hidden="true" />
                                            ) : (
                                                <div
                                                    className={`w-3 h-3 rounded-full ${selectedSize?.id === size.id ? 'bg-white' : 'bg-[#2C2C2C]/40'}`}
                                                    aria-hidden="true"
                                                />
                                            )}
                                            <span className="truncate">{size.name || t.oneSize}</span>
                                        </div>
                                        {selectedSize?.id === size.id && (
                                            <Check className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white rounded-full p-0.5" aria-hidden="true" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectionError && !selectedSize && (
                        <motion.p
                            {...fadeInScale}
                            className="text-red-500 text-xs mt-1 flex items-center gap-1"
                            role="alert"
                        >
                            <span className="w-1 h-1 bg-red-500 rounded-full" aria-hidden="true"></span>
                            {t.pleaseCompleteSelection}
                        </motion.p>
                    )}
                </div>
            ) : (
                <div className="p-4 bg-white/50 rounded-xl border border-[#2C2C2C]/10">
                    <p className="text-sm text-[#2C2C2C]/70 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-[#8B5E3C]" aria-hidden="true" />
                        {t.noOptionsRequired}
                    </p>
                </div>
            )}
        </div>
    );
});

VariantSelector.displayName = 'VariantSelector';

VariantSelector.displayName = 'VariantSelector';

const SuccessMessage = React.memo(({ message }) => (
    <motion.div
        {...fadeInScale}
        className="flex items-center gap-2 p-3 sm:p-4 bg-green-100 text-green-800 rounded-xl text-sm border border-green-200"
        role="alert"
        aria-live="polite"
    >
        <Check className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        <span>{message}</span>
    </motion.div>
));

SuccessMessage.displayName = 'SuccessMessage';

const QuantitySelector = React.memo(({ quantity, onIncrease, onDecrease, compact = false, t }) => (
    <div>
        <h3 className={`${compact ? 'text-base' : 'text-lg'} text-[#2C2C2C] mb-3 font-medium`}>{t.quantity}</h3>
        <div className="flex items-center gap-3 sm:gap-4">
            <button
                onClick={onDecrease}
                className={`
                    ${compact ? 'w-10 h-10' : 'w-12 h-12'} 
                    rounded-xl bg-white border border-[#2C2C2C]/20 
                    flex items-center justify-center 
                    hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 
                    transition-all active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                `}
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
            >
                <Minus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
            <span className={`${compact ? 'text-xl w-12' : 'text-2xl w-16'} text-[#2C2C2C] text-center font-medium`}>
                {quantity}
            </span>
            <button
                onClick={onIncrease}
                className={`
                    ${compact ? 'w-10 h-10' : 'w-12 h-12'} 
                    rounded-xl bg-white border border-[#2C2C2C]/20 
                    flex items-center justify-center 
                    hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 
                    transition-all active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2
                `}
                aria-label="Increase quantity"
            >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
        </div>
    </div>
));

QuantitySelector.displayName = 'QuantitySelector';

const ImageGallery = React.memo(({ product, selectedImageIndex, onImageSelect, mainImageError, thumbnailErrors, onMainImageError, onThumbnailError, t, compact = false }) => {
    const images = useMemo(
        () => [...(product.images || [])].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0)),
        [product.images]
    );

    const hasImages = useMemo(() => hasProductImage(product), [product]);
    const activeImageUrl = useMemo(
        () =>
            images.length > 0 && !mainImageError
                ? getFullImageUrl(images[selectedImageIndex]?.image_url)
                : null,
        [images, selectedImageIndex, mainImageError]
    );

    return (
        <div>
            <div className={`bg-white rounded-xl overflow-hidden ${compact ? 'mb-3' : 'mb-4'} aspect-square shadow-sm border border-[#2C2C2C]/5`}>
                {hasImages && !mainImageError && activeImageUrl ? (
                    <img
                        src={activeImageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={onMainImageError}
                        loading="eager"
                    />
                ) : (
                    <NoImagePlaceholder compact={compact} t={t} />
                )}
            </div>

            {hasImages && images.length > 1 && (
                compact ? (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {images.map((img, index) => {
                            const thumbUrl = getFullImageUrl(img.image_url);
                            const hasError = thumbnailErrors[index];

                            return (
                                <button
                                    key={img.id ?? index}
                                    onClick={() => onImageSelect(index)}
                                    className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${selectedImageIndex === index ? 'border-[#8B5E3C]' : 'border-transparent hover:border-[#8B5E3C]/50'
                                        }`}
                                    aria-label={`View image ${index + 1}`}
                                    aria-pressed={selectedImageIndex === index}
                                >
                                    {!hasError && thumbUrl ? (
                                        <img
                                            src={thumbUrl}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={() => onThumbnailError(index)}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#EBE7DC] flex items-center justify-center">
                                            <ImageOff className="w-6 h-6 text-[#2C2C2C]/30" aria-hidden="true" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-3 sm:gap-4">
                        {images.map((img, index) => {
                            const thumbUrl = getFullImageUrl(img.image_url);
                            const hasError = thumbnailErrors[index];

                            return (
                                <button
                                    key={img.id ?? index}
                                    onClick={() => onImageSelect(index)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] ${selectedImageIndex === index
                                        ? 'border-[#8B5E3C]'
                                        : 'border-transparent hover:border-[#8B5E3C]/50'
                                        }`}
                                    aria-label={`View image ${index + 1}`}
                                    aria-pressed={selectedImageIndex === index}
                                >
                                    {!hasError && thumbUrl ? (
                                        <img
                                            src={thumbUrl}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={() => onThumbnailError(index)}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[#EBE7DC] flex items-center justify-center">
                                            <ImageOff className="w-6 h-6 text-[#2C2C2C]/30" aria-hidden="true" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
});

ImageGallery.displayName = 'ImageGallery';

const ProductInfo = React.memo(({
    product,
    selectedSize,
    selectedAttributes,
    quantity,
    selectionError,
    showSuccess,
    addingToCart,
    hasVariants,
    onSizeSelect,
    onAttributeSelect,
    onQuantityIncrease,
    onQuantityDecrease,
    onAddToCart,
    t,
    language,
    titleFont,
    compact = false
}) => (
    <div className={compact ? 'space-y-5' : 'space-y-6'}>
        <div>
            <h1
                className={`${compact ? 'text-2xl sm:text-3xl' : 'text-3xl md:text-4xl'} text-[#2C2C2C] mb-2`}
                style={titleFont}
            >
                {product.name}
            </h1>
            {product.category && (
                <p className="text-sm text-[#2C2C2C]/50 mb-2">{t.category}: {product.category.name}</p>
            )}

            <PriceDisplay
                product={product}
                selectedSize={selectedSize}
                quantity={quantity}
                t={t}
                language={language}
                compact={compact}
                showTotal={true}
            />
        </div>

        <VariantSelector
            product={product}
            selectedSize={selectedSize}
            selectedAttributes={selectedAttributes}
            onSizeSelect={onSizeSelect}
            onAttributeSelect={onAttributeSelect}
            selectionError={selectionError}
            t={t}
            language={language}
            compact={compact}
        />

        <QuantitySelector
            quantity={quantity}
            onIncrease={onQuantityIncrease}
            onDecrease={onQuantityDecrease}
            compact={compact}
            t={t}
        />

        <button
            onClick={onAddToCart}
            disabled={addingToCart || (hasVariants && !selectedSize)}
            className={`
                w-full ${compact ? 'py-3.5 text-base' : 'py-4 text-lg font-medium'} 
                bg-[#8B5E3C] text-white rounded-xl 
                hover:bg-[#5C3A21] transition-all 
                disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98]
                relative overflow-hidden
                focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2
            `}
            aria-label={addingToCart ? t.adding : t.addToCart}
        >
            {addingToCart ? (
                <span className="flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
                    {t.adding}
                </span>
            ) : (
                t.addToCart
            )}
        </button>

        {showSuccess && <SuccessMessage message={t.addedSuccess} />}

        <div className="p-3 sm:p-4 bg-[#7A8C5A]/10 rounded-xl border border-[#7A8C5A]/20">
            <p className="text-xs sm:text-sm text-[#2C2C2C]/80">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" aria-hidden="true" />
                {t.trustBadge}
            </p>
        </div>

        {product.description && (
            <div className="pt-4 sm:pt-6 border-t border-[#2C2C2C]/10">
                <h3 className={`${compact ? 'text-base' : 'text-lg'} text-[#2C2C2C] mb-2 sm:mb-3 font-medium`}>{t.description}</h3>
                <p className="text-sm sm:text-base text-[#2C2C2C]/70 leading-relaxed">{product.description}</p>
            </div>
        )}

        {product.materials && (
            <div>
                <h3 className={`${compact ? 'text-base' : 'text-lg'} text-[#2C2C2C] mb-2 sm:mb-3 font-medium`}>{t.materials}</h3>
                <p className="text-sm sm:text-base text-[#2C2C2C]/70">{product.materials}</p>
            </div>
        )}

        {product.delivery_time && (
            <div className="p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-[#2C2C2C]/5">
                <div className="flex items-start gap-2 sm:gap-3">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5E3C] mt-0.5 shrink-0" aria-hidden="true" />
                    <div>
                        <h4 className="text-sm sm:text-base text-[#2C2C2C] mb-1 font-medium">{t.deliveryTime}</h4>
                        <p className="text-xs sm:text-sm text-[#2C2C2C]/70">{product.delivery_time}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-[#2C2C2C]/5">
            <div className="flex items-start gap-2 sm:gap-3">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B5E3C] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                    <h4 className="text-sm sm:text-base text-[#2C2C2C] mb-1 font-medium">{t.deliveryInfo}</h4>
                    <p className="text-xs sm:text-sm text-[#2C2C2C]/70">{t.deliveryText}</p>
                </div>
            </div>
        </div>
    </div>
));

ProductInfo.displayName = 'ProductInfo';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ProductDetails() {
    const { language } = useLanguage();
    const { addItem } = useCart();
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });
    const [selectionError, setSelectionError] = useState(false);
    const [mainImageError, setMainImageError] = useState(false);
    const [thumbnailErrors, setThumbnailErrors] = useState({});

    const t = useMemo(() => PRODUCT_CONTENT[language], [language]);

    const rtlStyles = useMemo(() => language === 'ar' ? {
        direction: 'rtl',
        textAlign: 'right',
    } : {}, [language]);

    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    const hasVariants = useMemo(() => product?.sizes?.length > 0, [product]);
    const parsedVariantData = useMemo(() => buildVariantGroups(product?.sizes || []), [product?.sizes]);

    const handleThumbnailError = useCallback((index) => {
        setThumbnailErrors((prev) => ({ ...prev, [index]: true }));
    }, []);

    const handleMainImageError = useCallback(() => {
        setMainImageError(true);
    }, []);

    const handleImageSelect = useCallback((index) => {
        setSelectedImageIndex(index);
        setMainImageError(false);
    }, []);

    const handleSizeSelect = useCallback((size) => {
        setSelectedSize(size);
        setSelectionError(false);

        const parsed = parseVariantAttributes(size);
        const selections = Object.entries(parsed).reduce((acc, [key, value]) => {
            if (key !== 'fallback') {
                acc[key] = normalizeAttributeValue(value);
            }
            return acc;
        }, {});

        setSelectedAttributes(selections);
    }, []);

    const handleAttributeSelect = useCallback((groupKey, value, enrichedSizes) => {
        setSelectedAttributes((prev) => {
            const nextSelections = {
                ...prev,
                [groupKey]: value,
            };

            const matchedSize = findMatchingVariant(enrichedSizes, nextSelections);
            setSelectedSize(matchedSize || null);
            setSelectionError(false);

            return nextSelections;
        });
    }, []);

    const handleQuantityIncrease = useCallback(() => {
        setQuantity((prev) => prev + 1);
    }, []);

    const handleQuantityDecrease = useCallback(() => {
        setQuantity((prev) => Math.max(1, prev - 1));
    }, []);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleNotFoundBack = useCallback(() => {
        navigate('/shop');
    }, [navigate]);

    const handleAddToCart = useCallback(async () => {
        if (!product) return;

        if (hasVariants && !selectedSize) {
            setSelectionError(true);
            document.getElementById('variant-selector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSelectionError(false);
        setAddingToCart(true);

        const sizeId = hasVariants ? selectedSize?.id : null;
        const result = await addItem(product.id, sizeId, quantity);

        setAddingToCart(false);

        if (result?.success) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), SUCCESS_MESSAGE_DURATION);
        }
    }, [product, selectedSize, quantity, hasVariants, addItem]);

    const handleResize = useCallback(() => {
        setViewport({
            isMobile: window.innerWidth < MOBILE_BREAKPOINT,
            isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
        });
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    useEffect(() => {
        const controller = new AbortController();

        setLoading(true);

        fetch(`${BASE_URL}/products/${id}`, { signal: controller.signal })
            .then((r) => {
                if (!r.ok) throw new Error('not found');
                return r.json();
            })
            .then((data) => setProduct(data))
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error('product fetch error:', err);
                    setProduct(null);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [id]);

    useEffect(() => {
        if (product?.sizes?.length > 0) {
            const { enrichedSizes } = parsedVariantData;
            const firstVariant = enrichedSizes?.[0] || null;

            if (firstVariant) {
                const initialSelections = Object.entries(firstVariant.parsedAttributes || {}).reduce((acc, [key, value]) => {
                    if (key !== 'fallback') {
                        acc[key] = normalizeAttributeValue(value);
                    }
                    return acc;
                }, {});

                setSelectedAttributes(initialSelections);
                setSelectedSize(firstVariant);
            } else {
                setSelectedAttributes({});
                setSelectedSize(null);
            }

            setSelectionError(false);
        } else {
            setSelectedSize(null);
            setSelectedAttributes({});
        }
    }, [product, parsedVariantData]);

    useEffect(() => {
        setMainImageError(false);
        setThumbnailErrors({});
        setSelectedImageIndex(0);
    }, [product]);

    const containerClasses = useMemo(() => {
        const baseClasses = 'min-h-screen bg-[#F5F1E8]';
        if (viewport.isMobile) return `${baseClasses} pt-16 pb-12`;
        if (viewport.isTablet) return `${baseClasses} pt-24 pb-16`;
        return `${baseClasses} pt-28 pb-20`;
    }, [viewport.isMobile, viewport.isTablet]);

    const backButtonClass = useMemo(() => {
        if (viewport.isMobile) return 'mb-4';
        if (viewport.isTablet) return 'mb-6';
        return 'mb-8';
    }, [viewport.isMobile, viewport.isTablet]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!product) {
        return <NotFound t={t} onBack={handleNotFoundBack} />;
    }

    if (viewport.isMobile) {
        return (
            <div className={containerClasses} style={rtlStyles}>
                <div className="px-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-[#2C2C2C] mb-4 hover:text-[#8B5E3C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2 rounded"
                        aria-label={t.back}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} aria-hidden="true" />
                        <span className="text-sm">{t.back}</span>
                    </button>

                    <div className="mb-4">
                        <ImageGallery
                            product={product}
                            selectedImageIndex={selectedImageIndex}
                            onImageSelect={handleImageSelect}
                            mainImageError={mainImageError}
                            thumbnailErrors={thumbnailErrors}
                            onMainImageError={handleMainImageError}
                            onThumbnailError={handleThumbnailError}
                            t={t}
                            compact
                        />
                    </div>

                    <ProductInfo
                        product={product}
                        selectedSize={selectedSize}
                        selectedAttributes={selectedAttributes}
                        quantity={quantity}
                        selectionError={selectionError}
                        showSuccess={showSuccess}
                        addingToCart={addingToCart}
                        hasVariants={hasVariants}
                        onSizeSelect={handleSizeSelect}
                        onAttributeSelect={handleAttributeSelect}
                        onQuantityIncrease={handleQuantityIncrease}
                        onQuantityDecrease={handleQuantityDecrease}
                        onAddToCart={handleAddToCart}
                        t={t}
                        language={language}
                        titleFont={titleFont}
                        compact
                    />
                </div>
            </div>
        );
    }

    const BackButton = () => (
        <button
            onClick={handleBack}
            className={`flex items-center gap-2 text-[#2C2C2C] ${backButtonClass} hover:text-[#8B5E3C] transition-colors group focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2 rounded`}
            aria-label={viewport.isTablet ? t.back : t.backToShop}
        >
            <ArrowLeft
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }}
                aria-hidden="true"
            />
            <span className="text-sm">{viewport.isTablet ? t.back : t.backToShop}</span>
        </button>
    );

    return (
        <div className={containerClasses} style={rtlStyles}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <BackButton />

                <div className={`grid grid-cols-1 ${viewport.isTablet ? 'md:grid-cols-2 gap-8' : 'lg:grid-cols-2 gap-12'}`}>
                    <motion.div {...slideIn(language === 'ar' ? 'right' : 'left')}>
                        <ImageGallery
                            product={product}
                            selectedImageIndex={selectedImageIndex}
                            onImageSelect={handleImageSelect}
                            mainImageError={mainImageError}
                            thumbnailErrors={thumbnailErrors}
                            onMainImageError={handleMainImageError}
                            onThumbnailError={handleThumbnailError}
                            t={t}
                        />
                    </motion.div>

                    <motion.div {...slideIn(language === 'ar' ? 'left' : 'right')}>
                        <ProductInfo
                            product={product}
                            selectedSize={selectedSize}
                            selectedAttributes={selectedAttributes}
                            quantity={quantity}
                            selectionError={selectionError}
                            showSuccess={showSuccess}
                            addingToCart={addingToCart}
                            hasVariants={hasVariants}
                            onSizeSelect={handleSizeSelect}
                            onAttributeSelect={handleAttributeSelect}
                            onQuantityIncrease={handleQuantityIncrease}
                            onQuantityDecrease={handleQuantityDecrease}
                            onAddToCart={handleAddToCart}
                            t={t}
                            language={language}
                            titleFont={titleFont}
                            compact={viewport.isTablet}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}