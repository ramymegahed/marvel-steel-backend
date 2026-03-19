import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Package, AlertTriangle, Smartphone, CreditCard, Wallet } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useCart } from '../../Components/Context/Cartcontext';
import { BASE_URL } from '../../App';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const SCROLL_OPTIONS = { top: 0, behavior: 'instant' };
const ANIMATION_DURATION = 0.6;
const ANIMATION_DELAY_STEP = 0.1;
const NAVIGATION_DELAY = 100;

// Payment method constants
const PAYMENT_METHODS = {
    CASH_ON_DELIVERY: 'cash_on_delivery',
    VODAFONE_CASH: 'vodafone_cash',
    INSTAPAY: 'instapay'
};

// ─── Helper Functions ──────────────────────────────────────────────────────
const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${BASE_URL}/${imagePath}`;
};

const getItemImage = (item) => getFullImageUrl(item.image_url) || null;

const validatePhoneNumber = (phone) => /^[0-9+\-\s]+$/.test(phone);

// ─── Animation Variants ─────────────────────────────────────────────────────
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: ANIMATION_DURATION }
};

// ─── Content Dictionary ─────────────────────────────────────────────────────
const CHECKOUT_CONTENT = {
    en: {
        title: 'Checkout',
        subtitle: 'Complete your order',
        contactInfo: 'Contact Information',
        customerName: 'Full Name',
        phoneNumber: 'Phone Number',
        address: 'Address (including city)',
        notes: 'Notes (Optional)',
        paymentMethod: 'Payment Method',
        cashOnDelivery: 'Cash on Delivery',
        cashOnDeliveryDesc: 'Pay when you receive your order',
        vodafoneCash: 'Vodafone Cash',
        vodafoneCashDesc: 'Pay via Vodafone Cash wallet',
        instapay: 'InstaPay',
        instapayDesc: 'Pay via InstaPay transfer',
        orderSummary: 'Order Summary',
        subtotal: 'Subtotal',
        shippingFee: 'Shipping Fee',
        total: 'Total',
        qty: 'Qty',
        size: 'Size',
        submitOrder: 'Confirm Order',
        processing: 'Processing...',
        orderPlaced: 'Order Placed',
        error: 'Error',
        close: 'Close',
        genericError: 'An error occurred. Please try again.',
        validation: {
            nameRequired: 'Full name is required',
            phoneRequired: 'Phone number is required',
            phoneInvalid: 'Please enter a valid phone number',
            addressRequired: 'Address is required',
        },
        currency: 'EGP',
    },
    ar: {
        title: 'إتمام الطلب',
        subtitle: 'أكمل طلبك',
        contactInfo: 'معلومات الاتصال',
        customerName: 'الاسم الكامل',
        phoneNumber: 'رقم الهاتف',
        address: 'العنوان (شامل المدينة)',
        notes: 'ملاحظات (اختياري)',
        paymentMethod: 'طريقة الدفع',
        cashOnDelivery: 'الدفع عند الاستلام',
        cashOnDeliveryDesc: 'ادفع عند استلام طلبك',
        vodafoneCash: 'فودافون كاش',
        vodafoneCashDesc: 'ادفع عبر محفظة فودافون كاش',
        instapay: 'انستا باي',
        instapayDesc: 'ادفع عبر تحويل انستا باي',
        orderSummary: 'ملخص الطلب',
        subtotal: 'المجموع الفرعي',
        shippingFee: 'رسوم الشحن',
        total: 'الإجمالي',
        qty: 'الكمية',
        size: 'المقاس',
        submitOrder: 'تأكيد الطلب',
        processing: 'جاري المعالجة...',
        orderPlaced: 'تم تأكيد الطلب',
        error: 'خطأ',
        close: 'إغلاق',
        genericError: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        validation: {
            nameRequired: 'الاسم الكامل مطلوب',
            phoneRequired: 'رقم الهاتف مطلوب',
            phoneInvalid: 'يرجى إدخال رقم هاتف صحيح',
            addressRequired: 'العنوان مطلوب',
        },
        currency: 'جنيه',
    },
};

// ─── Extracted Components ───────────────────────────────────────────────────

const ErrorModal = React.memo(({ isOpen, onClose, message, t, rtlStyles }) => {
    if (!isOpen) return null;

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) onClose();
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="error-modal-title"
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" style={rtlStyles}>
                <div className="bg-red-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" aria-hidden="true" />
                    </div>
                    <h2 id="error-modal-title" className="text-lg font-semibold text-red-700">
                        {t.error}
                    </h2>
                </div>

                <div className="p-6">
                    <p className="text-[#2C2C2C] mb-6">
                        {message || t.genericError}
                    </p>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
                            aria-label={t.close}
                        >
                            {t.close}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

ErrorModal.displayName = 'ErrorModal';

const FormInput = React.memo(({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    required = false,
    autoComplete,
    rows,
    language,
    submitAttempted,
    placeholder
}) => {
    const inputClasses = `w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] bg-white ${submitAttempted && error ? 'border-red-500' : 'border-[#2C2C2C]/20'
        }`;

    const textAlign = language === 'ar' ? 'right' : 'left';
    const inputId = `input-${name}`;

    return (
        <div>
            <label
                htmlFor={inputId}
                className="block text-sm sm:text-base text-[#2C2C2C] mb-1 sm:mb-2"
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {type === 'textarea' ? (
                <textarea
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    rows={rows}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`${inputClasses} resize-none`}
                    style={{ textAlign }}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            ) : (
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={inputClasses}
                    style={{ textAlign }}
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : undefined}
                />
            )}

            {submitAttempted && error && (
                <p id={`${inputId}-error`} className="text-xs sm:text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

const OrderSummaryItem = React.memo(({ item, t, index }) => {
    const imgSrc = useMemo(() => getItemImage(item), [item]);
    const price = useMemo(() =>
        item.subtotal?.toLocaleString() || (item.price * item.quantity).toLocaleString(),
        [item.subtotal, item.price, item.quantity]
    );

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.style.display = 'none';
    }, []);

    return (
        <div key={item.id || index} className="flex gap-2 sm:gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-lg overflow-hidden bg-[#F5F1E8]">
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
                        <Package className="w-5 h-5 text-[#2C2C2C]/30" aria-hidden="true" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-[#2C2C2C] font-medium truncate">{item.product_name}</p>
                <p className="text-xs text-[#2C2C2C]/70">{t.size}: {item.size_name}</p>
                <p className="text-xs text-[#2C2C2C]/70">{t.qty}: {item.quantity}</p>
            </div>
            <div className="text-xs sm:text-sm text-[#2C2C2C] whitespace-nowrap">
                {t.currency} {price}
            </div>
        </div>
    );
});

OrderSummaryItem.displayName = 'OrderSummaryItem';

const OrderSummary = React.memo(({ loadingCalc, checkoutSummary, items, totalPrice, t, language }) => {
    const calcItems = useMemo(() => checkoutSummary?.items || items, [checkoutSummary?.items, items]);
    const subtotal = useMemo(() => checkoutSummary?.subtotal ?? totalPrice, [checkoutSummary?.subtotal, totalPrice]);
    const shippingFee = useMemo(() => checkoutSummary?.shipping_fee ?? 0, [checkoutSummary?.shipping_fee]);
    const finalTotal = useMemo(() => checkoutSummary?.final_total ?? totalPrice, [checkoutSummary?.final_total, totalPrice]);

    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    return (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm">
            <h2 className="text-lg sm:text-xl text-[#2C2C2C] mb-4 sm:mb-6" style={titleFont}>
                {t.orderSummary}
            </h2>

            {loadingCalc ? (
                <div className="flex justify-center py-8">
                    <Loader className="w-6 h-6 text-[#8B5E3C] animate-spin" aria-label="Loading" />
                </div>
            ) : (
                <>
                    <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                        {calcItems.map((item, index) => (
                            <OrderSummaryItem
                                key={item.id || index}
                                item={item}
                                t={t}
                                index={index}
                            />
                        ))}
                    </div>

                    <div className="space-y-2 border-t border-[#2C2C2C]/10 pt-4 mb-4">
                        <div className="flex justify-between text-sm text-[#2C2C2C]/70">
                            <span>{t.subtotal}</span>
                            <span>{t.currency} {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#2C2C2C]/70">
                            <span>{t.shippingFee}</span>
                            <span>{t.currency} {shippingFee.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex justify-between text-base sm:text-xl text-[#2C2C2C] mb-5 sm:mb-6">
                        <span>{t.total}</span>
                        <span className="text-[#8B5E3C] font-bold">{t.currency} {finalTotal.toLocaleString()}</span>
                    </div>
                </>
            )}
        </div>
    );
});

OrderSummary.displayName = 'OrderSummary';

const PaymentMethod = React.memo(({ selectedMethod, onMethodChange, t, language }) => {
    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    const getIcon = (method) => {
        switch (method) {
            case PAYMENT_METHODS.VODAFONE_CASH:
                return <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />;
            case PAYMENT_METHODS.INSTAPAY:
                return <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />;
            default:
                return <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />;
        }
    };

    const getPaymentClass = (method) => {
        return selectedMethod === method
            ? 'border-2 border-[#8B5E3C] bg-[#8B5E3C]/5'
            : 'border border-[#2C2C2C]/10 hover:border-[#8B5E3C]/30';
    };

    return (
        <div className="bg-white p-5 sm:p-8 rounded-xl shadow-sm">
            <h2 className="text-lg sm:text-2xl text-[#2C2C2C] mb-4 sm:mb-6" style={titleFont}>
                {t.paymentMethod}
            </h2>

            <div className="space-y-3">
                {/* Cash on Delivery */}
                <div
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${getPaymentClass(PAYMENT_METHODS.CASH_ON_DELIVERY)}`}
                    onClick={() => onMethodChange(PAYMENT_METHODS.CASH_ON_DELIVERY)}
                    role="radio"
                    aria-checked={selectedMethod === PAYMENT_METHODS.CASH_ON_DELIVERY}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onMethodChange(PAYMENT_METHODS.CASH_ON_DELIVERY)}
                >
                    <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: selectedMethod === PAYMENT_METHODS.CASH_ON_DELIVERY ? '#8B5E3C' : '#2C2C2C33' }}>
                        {selectedMethod === PAYMENT_METHODS.CASH_ON_DELIVERY && (
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#8B5E3C]" aria-hidden="true" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {getIcon(PAYMENT_METHODS.CASH_ON_DELIVERY)}
                            <p className="text-sm sm:text-base text-[#2C2C2C] font-medium">{t.cashOnDelivery}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-[#2C2C2C]/70 mt-1">{t.cashOnDeliveryDesc}</p>
                    </div>
                </div>

                {/* Vodafone Cash */}
                <div
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${getPaymentClass(PAYMENT_METHODS.VODAFONE_CASH)}`}
                    onClick={() => onMethodChange(PAYMENT_METHODS.VODAFONE_CASH)}
                    role="radio"
                    aria-checked={selectedMethod === PAYMENT_METHODS.VODAFONE_CASH}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onMethodChange(PAYMENT_METHODS.VODAFONE_CASH)}
                >
                    <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: selectedMethod === PAYMENT_METHODS.VODAFONE_CASH ? '#8B5E3C' : '#2C2C2C33' }}>
                        {selectedMethod === PAYMENT_METHODS.VODAFONE_CASH && (
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#8B5E3C]" aria-hidden="true" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {getIcon(PAYMENT_METHODS.VODAFONE_CASH)}
                            <p className="text-sm sm:text-base text-[#2C2C2C] font-medium">{t.vodafoneCash}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-[#2C2C2C]/70 mt-1">{t.vodafoneCashDesc}</p>
                    </div>
                </div>

                {/* InstaPay */}
                <div
                    className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${getPaymentClass(PAYMENT_METHODS.INSTAPAY)}`}
                    onClick={() => onMethodChange(PAYMENT_METHODS.INSTAPAY)}
                    role="radio"
                    aria-checked={selectedMethod === PAYMENT_METHODS.INSTAPAY}
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && onMethodChange(PAYMENT_METHODS.INSTAPAY)}
                >
                    <div className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: selectedMethod === PAYMENT_METHODS.INSTAPAY ? '#8B5E3C' : '#2C2C2C33' }}>
                        {selectedMethod === PAYMENT_METHODS.INSTAPAY && (
                            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#8B5E3C]" aria-hidden="true" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            {getIcon(PAYMENT_METHODS.INSTAPAY)}
                            <p className="text-sm sm:text-base text-[#2C2C2C] font-medium">{t.instapay}</p>
                        </div>
                        <p className="text-xs sm:text-sm text-[#2C2C2C]/70 mt-1">{t.instapayDesc}</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

PaymentMethod.displayName = 'PaymentMethod';

const ContactInfoForm = React.memo(({ formData, errors, submitAttempted, handleInputChange, t, language }) => {
    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    return (
        <div className="bg-white p-5 sm:p-8 rounded-xl shadow-sm">
            <h2 className="text-lg sm:text-2xl text-[#2C2C2C] mb-4 sm:mb-6" style={titleFont}>
                {t.contactInfo}
            </h2>
            <div className="space-y-3 sm:space-y-4">
                <FormInput
                    label={t.customerName}
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    error={errors.customer_name}
                    required
                    autoComplete="name"
                    language={language}
                    submitAttempted={submitAttempted}
                />

                <FormInput
                    label={t.phoneNumber}
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    required
                    autoComplete="tel"
                    language={language}
                    submitAttempted={submitAttempted}
                />

                <FormInput
                    label={t.address}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    error={errors.address}
                    required
                    autoComplete="address-line1"
                    language={language}
                    submitAttempted={submitAttempted}
                />

                <FormInput
                    label={t.notes}
                    name="notes"
                    type="textarea"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    autoComplete="off"
                    language={language}
                    submitAttempted={submitAttempted}
                />
            </div>
        </div>
    );
});

ContactInfoForm.displayName = 'ContactInfoForm';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Checkout() {
    const { language } = useLanguage();
    const navigate = useNavigate();
    const { items, totalPrice, cartId, fetchCart } = useCart();
    const hasNavigated = useRef(false);

    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [checkoutSummary, setCheckoutSummary] = useState(null);
    const [loadingCalc, setLoadingCalc] = useState(true);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS.CASH_ON_DELIVERY);
    const [formData, setFormData] = useState({
        customer_name: '',
        phone: '',
        address: '',
        notes: '',
    });
    const [errors, setErrors] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);

    // ─── Memoized Values ─────────────────────────────────────────────────────
    const t = useMemo(() => CHECKOUT_CONTENT[language], [language]);

    const rtlStyles = useMemo(() => language === 'ar' ? {
        direction: 'rtl',
        textAlign: 'right',
    } : {}, [language]);

    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    // ─── Responsive Handler ──────────────────────────────────────────────────
    const handleResize = useCallback(() => {
        setViewport({
            isMobile: window.innerWidth < MOBILE_BREAKPOINT,
            isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
        });
    }, []);

    useEffect(() => {
        window.scrollTo(SCROLL_OPTIONS);
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // ─── Fetch Checkout Calculation ──────────────────────────────────────────
    useEffect(() => {
        if (orderPlaced || !cartId) {
            setLoadingCalc(false);
            return;
        }

        const fetchCalculation = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/v1/checkout/calculate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-cart-id': cartId
                    },
                });

                if (!response.ok) {
                    console.error('Calculate endpoint error:', response.status);
                    setCheckoutSummary(null);
                } else {
                    const data = await response.json();
                    setCheckoutSummary(data);
                }
            } catch (err) {
                console.error('checkout calculate error:', err);
                setCheckoutSummary(null);
            } finally {
                setLoadingCalc(false);
            }
        };

        fetchCalculation();
    }, [cartId, orderPlaced]);

    // ─── Redirect to Cart if Empty ──────────────────────────────────────────
    useEffect(() => {
        if (!loadingCalc && items.length === 0 && !orderPlaced && !hasNavigated.current) {
            hasNavigated.current = true;
            navigate('/cart');
        }
    }, [items, loadingCalc, navigate, orderPlaced]);

    // ─── Form Validation ─────────────────────────────────────────────────────
    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!formData.customer_name.trim()) newErrors.customer_name = t.validation.nameRequired;
        if (!formData.phone.trim()) {
            newErrors.phone = t.validation.phoneRequired;
        } else if (!validatePhoneNumber(formData.phone)) {
            newErrors.phone = t.validation.phoneInvalid;
        }
        if (!formData.address.trim()) newErrors.address = t.validation.addressRequired;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, t.validation]);

    // ─── Form Handlers ──────────────────────────────────────────────────────
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handlePaymentMethodChange = useCallback((method) => {
        setSelectedPaymentMethod(method);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (orderPlaced) return;

        setSubmitAttempted(true);

        if (!validateForm() || !cartId) return;

        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const res = await fetch(`${BASE_URL}/api/v1/checkout/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-cart-id': cartId
                },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    phone: formData.phone,
                    address: formData.address,
                    payment_method: selectedPaymentMethod,
                    notes: formData.notes || '',
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Order submission failed');
            }

            const order = await res.json();

            setOrderPlaced(true);
            await fetchCart();

            setTimeout(() => {
                navigate('/order-success', {
                    state: {
                        orderId: order.id,
                        orderDetails: order
                    },
                    replace: true
                });
            }, NAVIGATION_DELAY);

        } catch (err) {
            console.error('checkout confirm error:', err);
            setErrorMessage(err.message || t.genericError);
            setShowErrorModal(true);
            setOrderPlaced(false);
        } finally {
            setIsSubmitting(false);
            setSubmitAttempted(false);
        }
    }, [formData, cartId, selectedPaymentMethod, validateForm, navigate, fetchCart, t.genericError, orderPlaced]);

    const handleErrorModalClose = useCallback(() => {
        setShowErrorModal(false);
        setErrorMessage('');
    }, []);

    // ─── Responsive Classes ──────────────────────────────────────────────────
    const containerClasses = useMemo(() => {
        const baseClasses = 'min-h-screen bg-[#F5F1E8]';
        if (viewport.isMobile) return `${baseClasses} pt-16 pb-12`;
        return `${baseClasses} ${viewport.isTablet ? 'pt-24' : 'pt-28'} pb-20`;
    }, [viewport.isMobile, viewport.isTablet]);

    const titleClasses = useMemo(() => {
        if (viewport.isMobile) return 'text-2xl mb-1';
        if (viewport.isTablet) return 'text-3xl mb-2';
        return 'text-3xl sm:text-4xl mb-2';
    }, [viewport.isMobile, viewport.isTablet]);

    const subtitleClasses = useMemo(() => {
        if (viewport.isMobile) return 'text-sm';
        if (viewport.isTablet) return 'text-base';
        return 'text-base sm:text-lg';
    }, [viewport.isMobile, viewport.isTablet]);

    const headerMargin = useMemo(() => {
        if (viewport.isMobile) return 'mb-5';
        return 'mb-8';
    }, [viewport.isMobile]);

    const stickyOffset = useMemo(() => {
        if (viewport.isTablet) return 'top-24';
        return 'top-28';
    }, [viewport.isTablet]);

    if (items.length === 0 && !orderPlaced) return null;

    // ─── Mobile Layout ────────────────────────────────────────────────────────
    if (viewport.isMobile) {
        return (
            <div className={containerClasses} style={rtlStyles}>
                <div className="max-w-6xl mx-auto px-4">
                    <motion.div {...fadeInUp} className={headerMargin}>
                        <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
                        <p className={subtitleClasses}>{t.subtitle}</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} noValidate>
                        <motion.div
                            {...fadeInUp}
                            transition={{ duration: ANIMATION_DURATION, delay: ANIMATION_DELAY_STEP }}
                            className="mb-5"
                        >
                            <ContactInfoForm
                                formData={formData}
                                errors={errors}
                                submitAttempted={submitAttempted}
                                handleInputChange={handleInputChange}
                                t={t}
                                language={language}
                            />
                        </motion.div>

                        <motion.div
                            {...fadeInUp}
                            transition={{ duration: ANIMATION_DURATION, delay: ANIMATION_DELAY_STEP * 2 }}
                            className="mb-5"
                        >
                            <PaymentMethod
                                selectedMethod={selectedPaymentMethod}
                                onMethodChange={handlePaymentMethodChange}
                                t={t}
                                language={language}
                            />
                        </motion.div>

                        <div className="sticky bottom-4 mt-5">
                            <div className="bg-white p-5 sm:p-6 rounded-xl shadow-lg">
                                <OrderSummary
                                    loadingCalc={loadingCalc}
                                    checkoutSummary={checkoutSummary}
                                    items={items}
                                    totalPrice={totalPrice}
                                    t={t}
                                    language={language}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || loadingCalc || orderPlaced}
                                    className={`w-full mt-4 py-3.5 sm:py-4 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2 ${(isSubmitting || loadingCalc || orderPlaced) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    aria-label={isSubmitting ? t.processing : (orderPlaced ? t.orderPlaced : t.submitOrder)}
                                >
                                    {isSubmitting ? t.processing : (orderPlaced ? t.orderPlaced : t.submitOrder)}
                                </button>
                            </div>
                        </div>
                    </form>

                    <ErrorModal
                        isOpen={showErrorModal}
                        onClose={handleErrorModalClose}
                        message={errorMessage}
                        t={t}
                        rtlStyles={rtlStyles}
                    />
                </div>
            </div>
        );
    }

    // ─── Tablet/Desktop Layout ────────────────────────────────────────────────
    return (
        <div className={containerClasses} style={rtlStyles}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div {...fadeInUp} className={headerMargin}>
                    <h1 className={titleClasses} style={titleFont}>{t.title}</h1>
                    <p className={subtitleClasses}>{t.subtitle}</p>
                </motion.div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <motion.div
                                {...fadeInUp}
                                transition={{ duration: ANIMATION_DURATION, delay: ANIMATION_DELAY_STEP }}
                                className="mb-5"
                            >
                                <ContactInfoForm
                                    formData={formData}
                                    errors={errors}
                                    submitAttempted={submitAttempted}
                                    handleInputChange={handleInputChange}
                                    t={t}
                                    language={language}
                                />
                            </motion.div>

                            <motion.div
                                {...fadeInUp}
                                transition={{ duration: ANIMATION_DURATION, delay: ANIMATION_DELAY_STEP * 2 }}
                            >
                                <PaymentMethod
                                    selectedMethod={selectedPaymentMethod}
                                    onMethodChange={handlePaymentMethodChange}
                                    t={t}
                                    language={language}
                                />
                            </motion.div>
                        </div>

                        <motion.div
                            {...fadeInUp}
                            transition={{ duration: ANIMATION_DURATION, delay: ANIMATION_DELAY_STEP * 3 }}
                            className="lg:col-span-1"
                        >
                            <div className={`sticky ${stickyOffset}`}>
                                <OrderSummary
                                    loadingCalc={loadingCalc}
                                    checkoutSummary={checkoutSummary}
                                    items={items}
                                    totalPrice={totalPrice}
                                    t={t}
                                    language={language}
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting || loadingCalc || orderPlaced}
                                    className={`w-full mt-4 py-3.5 sm:py-4 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2 ${(isSubmitting || loadingCalc || orderPlaced) ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    aria-label={isSubmitting ? t.processing : (orderPlaced ? t.orderPlaced : t.submitOrder)}
                                >
                                    {isSubmitting ? t.processing : (orderPlaced ? t.orderPlaced : t.submitOrder)}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </form>

                <ErrorModal
                    isOpen={showErrorModal}
                    onClose={handleErrorModalClose}
                    message={errorMessage}
                    t={t}
                    rtlStyles={rtlStyles}
                />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}