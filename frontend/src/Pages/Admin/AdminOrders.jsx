import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, X, Package, Phone, MapPin, Calendar, CreditCard, FileText, AlertTriangle, Loader, Image as ImageIcon, Ruler, Tag } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useAdmin } from '../../Components/Context/AdminContext';
import { BASE_URL } from '../../App';

// ─── Shared UI Components ─────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-[#2C2C2C]/10 ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children }) => (
    <div className="p-6 pb-0">{children}</div>
);

const CardTitle = ({ children }) => (
    <h3 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
        {children}
    </h3>
);

const CardContent = ({ children }) => (
    <div className="p-6 pt-0">{children}</div>
);

// ─── Helper function to format date ──────────────────────────────────────────
const formatDate = (dateString, language) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ─── Helper function to format currency ──────────────────────────────────────
const formatCurrency = (amount, language) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 2
    }).format(amount);
};

// ─── Status Badge Component ──────────────────────────────────────────────────
const StatusBadge = ({ status, t }) => {
    const getStatusColor = () => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_delivery':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {t.status[status.toLowerCase()] || status}
        </span>
    );
};

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    loading,
    t,
    rtlStyles
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" style={rtlStyles}>
                <div className="bg-red-50 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-red-700" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {t.confirmDelete}
                    </h2>
                </div>

                <div className="p-6">
                    <p className="text-[#2C2C2C] mb-2">
                        {t.deleteConfirm} <span className="font-semibold">"{itemName}"</span>
                    </p>
                    <p className="text-sm text-[#2C2C2C]/60 mb-6">{t.deleteWarning}</p>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-sm text-[#2C2C2C] disabled:opacity-50"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t.deleting}
                                </>
                            ) : (
                                t.delete
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Product Image Component ─────────────────────────────────────────────────
const ProductImage = ({ imageUrl, productName, className = '' }) => {
    const [imageError, setImageError] = useState(false);

    // Ensure imageUrl is a string
    const safeImageUrl = typeof imageUrl === 'string' ? imageUrl : '';
    const safeProductName = typeof productName === 'string' ? productName : 'Product';

    if (!safeImageUrl || imageError) {
        return (
            <div className={`bg-[#F5F1E8] flex items-center justify-center ${className}`}>
                <ImageIcon className="w-6 h-6 text-[#2C2C2C]/30" />
            </div>
        );
    }

    return (
        <img
            src={`${BASE_URL}/${safeImageUrl}`}
            alt={safeProductName}
            className={`object-cover ${className}`}
            onError={() => setImageError(true)}
        />
    );
};

// ─── Order Details Modal ─────────────────────────────────────────────────────
const OrderModal = ({
    isOpen,
    onClose,
    order,
    onUpdateStatus,
    loading,
    t,
    language,
    rtlStyles
}) => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [expandedItems, setExpandedItems] = useState([]);

    useEffect(() => {
        if (order) {
            setSelectedStatus(order.status);
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleStatusUpdate = async () => {
        if (selectedStatus === order.status) return;

        setIsUpdating(true);
        try {
            await onUpdateStatus(order.id, selectedStatus);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleItemExpand = (itemId) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const statusOptions = ['pending', 'confirmed', 'in_delivery', 'delivered', 'cancelled'];

    // Safe getters for product data
    const getProductName = (item) => {
        if (!item) return t.product;

        // Check if product is an object with name property
        if (item.product && typeof item.product === 'object' && item.product !== null) {
            return item.product.name || t.product;
        }

        // Check if product_name exists directly on item
        if (item.product_name && typeof item.product_name === 'string') {
            return item.product_name;
        }

        return t.product;
    };

    const getProductObject = (item) => {
        if (!item) return null;

        // Check if product is an object
        if (item.product && typeof item.product === 'object' && item.product !== null) {
            return item.product;
        }

        return null;
    };

    const getSizeObject = (item) => {
        if (!item) return null;

        // Check if size is an object
        if (item.size && typeof item.size === 'object' && item.size !== null) {
            return item.size;
        }

        return null;
    };

    const getSizeName = (item) => {
        const size = getSizeObject(item);
        return size?.name || '';
    };

    const getProductId = (item) => {
        const product = getProductObject(item);
        return product?.id || item.product_id || 'N/A';
    };

    const getProductPrice = (item) => {
        return item.price_at_purchase || item.price || 0;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 relative max-h-[90vh] overflow-y-auto" style={rtlStyles}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
                        {t.orderDetails} — #{order.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-[#2C2C2C]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Update */}
                    <div className="bg-[#F5F1E8] p-4 rounded-lg">
                        <label className="text-sm text-[#2C2C2C]/70 mb-2 block">
                            {t.updateStatus}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="flex-1 h-10 px-3 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] text-sm"
                                dir={language === 'ar' ? 'rtl' : 'ltr'}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {t.status[status]}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={selectedStatus === order.status || isUpdating}
                                className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        {t.updating}
                                    </>
                                ) : (
                                    t.update
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Package className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#2C2C2C]/70">{t.orderId}</p>
                                    <p className="text-base font-medium text-[#2C2C2C]">#{order.id}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#2C2C2C]/70">{t.orderDate}</p>
                                    <p className="text-base font-medium text-[#2C2C2C]">{formatDate(order.created_at, language)}</p>
                                    {order.updated_at !== order.created_at && (
                                        <p className="text-xs text-[#2C2C2C]/50 mt-1">
                                            {t.lastUpdated}: {formatDate(order.updated_at, language)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <CreditCard className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#2C2C2C]/70">{t.paymentMethod}</p>
                                    <p className="text-base font-medium text-[#2C2C2C]">{t.paymentMethods[order.payment_method] || order.payment_method}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#2C2C2C]/70">{t.phone}</p>
                                    <p className="text-base font-medium text-[#2C2C2C]">{order.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#2C2C2C]/70">{t.deliveryAddress}</p>
                                    <p className="text-base font-medium text-[#2C2C2C]">{order.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-[#8B5E3C] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-[#2C2C2C]/70">{t.notes}</p>
                                    <p className="text-base font-medium text-[#2C2C2C]">{order.notes || t.noNotes}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="border-t border-[#2C2C2C]/10 pt-4">
                        <h3 className="text-md font-semibold text-[#2C2C2C] mb-3">{t.customerInfo}</h3>
                        <div className="bg-[#F5F1E8] p-4 rounded-lg">
                            <p className="text-base font-medium text-[#2C2C2C]">{order.customer_name}</p>
                            <p className="text-sm text-[#2C2C2C]/70 mt-1">{order.phone}</p>
                            <p className="text-sm text-[#2C2C2C]/70 mt-1">{order.address}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t border-[#2C2C2C]/10 pt-4">
                        <h3 className="text-md font-semibold text-[#2C2C2C] mb-3">{t.orderItems}</h3>
                        <div className="space-y-4">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => {
                                    const product = getProductObject(item);
                                    const size = getSizeObject(item);
                                    const productName = getProductName(item);
                                    const sizeName = getSizeName(item);
                                    const productId = getProductId(item);
                                    const productPrice = getProductPrice(item);

                                    return (
                                        <div key={item.id || index} className="bg-[#F5F1E8] rounded-lg overflow-hidden">
                                            {/* Item Header */}
                                            <div
                                                className="p-4 cursor-pointer hover:bg-[#8B5E3C]/5 transition-colors"
                                                onClick={() => toggleItemExpand(item.id)}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-medium text-[#2C2C2C]">
                                                                {productName}
                                                            </p>
                                                            {sizeName && (
                                                                <span className="text-xs bg-white px-2 py-1 rounded-full text-[#2C2C2C]/70">
                                                                    {t.size}: {sizeName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2 text-sm">
                                                            <span className="text-[#2C2C2C]/70">
                                                                {t.quantity}: {item.quantity}
                                                            </span>
                                                            <span className="text-[#8B5E3C] font-medium">
                                                                {formatCurrency(productPrice, language)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-xs text-[#2C2C2C]/50">
                                                            {expandedItems.includes(item.id) ? t.showLess : t.showMore}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Product Details */}
                                            {expandedItems.includes(item.id) && product && (
                                                <div className="border-t border-[#2C2C2C]/10 bg-white p-4">
                                                    {/* Product Images */}
                                                    {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                                                        <div className="mb-4">
                                                            <p className="text-sm font-medium text-[#2C2C2C] mb-2">{t.productImages}</p>
                                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                                {product.images.map((image, idx) => (
                                                                    <div key={image?.id || idx} className="shrink-0">
                                                                        <ProductImage
                                                                            imageUrl={image?.image_url}
                                                                            productName={productName}
                                                                            className="w-20 h-20 rounded-lg border border-[#2C2C2C]/10"
                                                                        />
                                                                        {image?.is_main && (
                                                                            <span className="text-xs text-[#8B5E3C] block text-center mt-1">
                                                                                {t.mainImage}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Product Details Grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        {/* Left Column */}
                                                        <div className="space-y-2">
                                                            <div>
                                                                <span className="text-[#2C2C2C]/70">{t.productId}:</span>
                                                                <span className="mr-2 text-[#2C2C2C] font-medium">
                                                                    {productId}
                                                                </span>
                                                            </div>
                                                            {product.description && (
                                                                <div>
                                                                    <span className="text-[#2C2C2C]/70">{t.description}:</span>
                                                                    <p className="text-[#2C2C2C] mt-1 whitespace-pre-line">
                                                                        {product.description}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {product.materials && (
                                                                <div>
                                                                    <span className="text-[#2C2C2C]/70">{t.materials}:</span>
                                                                    <span className="mr-2 text-[#2C2C2C]">{product.materials}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Right Column */}
                                                        <div className="space-y-2">
                                                            {product.category && (
                                                                <div>
                                                                    <span className="text-[#2C2C2C]/70">{t.category}:</span>
                                                                    <div className="mt-1">
                                                                        <span className="text-[#2C2C2C] font-medium">
                                                                            {product.category.name}
                                                                        </span>
                                                                        {product.category.description && (
                                                                            <p className="text-xs text-[#2C2C2C]/70 mt-1">
                                                                                {product.category.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {product.delivery_time && (
                                                                <div>
                                                                    <span className="text-[#2C2C2C]/70">{t.deliveryTime}:</span>
                                                                    <span className="mr-2 text-[#2C2C2C]">{product.delivery_time}</span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="text-[#2C2C2C]/70">{t.isActive}:</span>
                                                                <span className={`mr-2 ${product.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {product.is_active ? t.yes : t.no}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Available Sizes - FIXED: Don't render size objects directly */}
                                                    {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t border-[#2C2C2C]/10">
                                                            <p className="text-sm font-medium text-[#2C2C2C] mb-2">{t.availableSizes}</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {product.sizes.map((sizeItem, idx) => (
                                                                    <div key={idx} className="px-3 py-1 bg-[#F5F1E8] rounded-full text-xs">
                                                                        {sizeItem.name && (
                                                                            <span>
                                                                                {sizeItem.name}
                                                                                {sizeItem.price && ` - ${formatCurrency(sizeItem.price, language)}`}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Selected Size Info - Show if this item had a specific size */}
                                                    {size && (
                                                        <div className="mt-4 pt-4 border-t border-[#2C2C2C]/10">
                                                            <p className="text-sm font-medium text-[#2C2C2C] mb-2">{t.selectedSize}</p>
                                                            <div className="bg-[#F5F1E8] p-3 rounded-lg">
                                                                <p className="text-sm">
                                                                    <span className="font-medium">{size.name}</span>
                                                                    {size.price && (
                                                                        <span className="mr-2 text-[#8B5E3C]">
                                                                            ({formatCurrency(size.price, language)})
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                {size.discount_price && size.discount_price !== size.price && (
                                                                    <p className="text-xs text-green-600 mt-1">
                                                                        {t.discountPrice}: {formatCurrency(size.discount_price, language)}
                                                                    </p>
                                                                )}
                                                                {size.stock_quantity !== undefined && (
                                                                    <p className="text-xs text-[#2C2C2C]/70 mt-1">
                                                                        {t.stock}: {size.stock_quantity}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Purchase Info */}
                                                    <div className="mt-4 pt-4 border-t border-[#2C2C2C]/10 text-xs text-[#2C2C2C]/50">
                                                        <p>{t.priceAtPurchase}: {formatCurrency(productPrice, language)}</p>
                                                        {item.created_at && (
                                                            <p className="mt-1">{t.itemCreatedAt}: {formatDate(item.created_at, language)}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-[#2C2C2C]/70 text-center py-4">{t.noItems}</p>
                            )}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-[#2C2C2C]/10 pt-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-[#2C2C2C]">{t.total}</span>
                            <div className="text-right">
                                <span className="text-xl font-bold text-[#8B5E3C]">{formatCurrency(order.total_price, language)}</span>
                                <p className="text-xs text-[#2C2C2C]/50 mt-1">
                                    {t.itemsCount}: {order.items?.length || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="border-t border-[#2C2C2C]/10 pt-4">
                        <h3 className="text-md font-semibold text-[#2C2C2C] mb-3">{t.orderTimeline}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-[#2C2C2C]/70">{t.createdAt}:</span>
                                <span className="text-[#2C2C2C]">{formatDate(order.created_at, language)}</span>
                            </div>
                            {order.updated_at !== order.created_at && (
                                <div className="flex justify-between">
                                    <span className="text-[#2C2C2C]/70">{t.lastUpdated}:</span>
                                    <span className="text-[#2C2C2C]">{formatDate(order.updated_at, language)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-[#2C2C2C]/10 px-6 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-[#2C2C2C]"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminOrders() {
    const { language } = useLanguage();
    const { getAuthHeaders } = useAdmin();

    // ─── State Management ──────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Pagination
    const [pagination, setPagination] = useState({
        skip: 0,
        limit: 10,
        hasMore: true
    });

    // Responsive
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // ─── Content Dictionary ─────────────────────────────────────────────────────
    const content = useMemo(() => ({
        en: {
            title: 'Orders',
            subtitle: 'Manage and track customer orders',
            searchPlaceholder: 'Search by order ID, customer name, or phone...',
            mobileSearchPlaceholder: 'Search orders...',
            noOrders: 'No orders found',
            allOrders: 'All Orders',
            orderDetails: 'Order Details',
            orderId: 'Order ID',
            customerName: 'Customer Name',
            phone: 'Phone',
            orderDate: 'Order Date',
            deliveryAddress: 'Delivery Address',
            paymentMethod: 'Payment Method',
            notes: 'Notes',
            noNotes: 'No notes',
            total: 'Total',
            updateStatus: 'Update Status',
            update: 'Update',
            updating: 'Updating...',
            close: 'Close',
            showing: 'Showing',
            of: 'of',
            orders: 'orders',
            customerInfo: 'Customer Information',
            orderItems: 'Order Items',
            product: 'Product',
            size: 'Size',
            quantity: 'Quantity',
            noItems: 'No items found',
            loadMore: 'Load More',
            retry: 'Retry',
            confirmDelete: 'Delete Order',
            deleteConfirm: 'Are you sure you want to delete order',
            deleteWarning: 'This action cannot be undone.',
            delete: 'Delete',
            deleting: 'Deleting...',
            cancel: 'Cancel',
            showMore: 'Show Details',
            showLess: 'Show Less',
            productImages: 'Product Images',
            mainImage: 'Main',
            productId: 'Product ID',
            description: 'Description',
            materials: 'Materials',
            category: 'Category',
            deliveryTime: 'Delivery Time',
            isActive: 'Active',
            yes: 'Yes',
            no: 'No',
            availableSizes: 'Available Sizes',
            selectedSize: 'Selected Size',
            discountPrice: 'Discount Price',
            stock: 'Stock',
            priceAtPurchase: 'Price at purchase',
            itemCreatedAt: 'Item added',
            itemsCount: 'Items count',
            orderTimeline: 'Order Timeline',
            createdAt: 'Created at',
            lastUpdated: 'Last updated',
            status: {
                pending: 'Pending',
                confirmed: 'Confirmed',
                in_delivery: 'In Delivery',
                delivered: 'Delivered',
                cancelled: 'Cancelled'
            },
            paymentMethods: {
                cash_on_delivery: 'Cash on Delivery'
            },
            tableHeaders: {
                orderId: 'Order ID',
                customer: 'Customer',
                phone: 'Phone',
                total: 'Total',
                status: 'Status',
                date: 'Date',
                actions: 'Actions'
            },
            view: 'View'
        },
        ar: {
            title: 'الطلبات',
            subtitle: 'إدارة وتتبع طلبات العملاء',
            searchPlaceholder: 'البحث برقم الطلب أو اسم العميل أو الهاتف...',
            mobileSearchPlaceholder: 'البحث في الطلبات...',
            noOrders: 'لم يتم العثور على طلبات',
            allOrders: 'جميع الطلبات',
            orderDetails: 'تفاصيل الطلب',
            orderId: 'رقم الطلب',
            customerName: 'اسم العميل',
            phone: 'رقم الهاتف',
            orderDate: 'تاريخ الطلب',
            deliveryAddress: 'عنوان التوصيل',
            paymentMethod: 'طريقة الدفع',
            notes: 'ملاحظات',
            noNotes: 'لا توجد ملاحظات',
            total: 'الإجمالي',
            updateStatus: 'تحديث الحالة',
            update: 'تحديث',
            updating: 'جاري التحديث...',
            close: 'إغلاق',
            showing: 'عرض',
            of: 'من',
            orders: 'طلبات',
            customerInfo: 'معلومات العميل',
            orderItems: 'عناصر الطلب',
            product: 'المنتج',
            size: 'المقاس',
            quantity: 'الكمية',
            noItems: 'لم يتم العثور على عناصر',
            loadMore: 'تحميل المزيد',
            retry: 'إعادة المحاولة',
            confirmDelete: 'حذف الطلب',
            deleteConfirm: 'هل أنت متأكد من حذف الطلب',
            deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
            delete: 'حذف',
            deleting: 'جاري الحذف...',
            cancel: 'إلغاء',
            showMore: 'عرض التفاصيل',
            showLess: 'إخفاء التفاصيل',
            productImages: 'صور المنتج',
            mainImage: 'الرئيسية',
            productId: 'رقم المنتج',
            description: 'الوصف',
            materials: 'الخامات',
            category: 'التصنيف',
            deliveryTime: 'وقت التوصيل',
            isActive: 'نشط',
            yes: 'نعم',
            no: 'لا',
            availableSizes: 'المقاسات المتاحة',
            selectedSize: 'المقاس المختار',
            discountPrice: 'سعر الخصم',
            stock: 'المخزون',
            priceAtPurchase: 'السعر عند الشراء',
            itemCreatedAt: 'تاريخ إضافة العنصر',
            itemsCount: 'عدد العناصر',
            orderTimeline: 'الجدول الزمني للطلب',
            createdAt: 'تاريخ الإنشاء',
            lastUpdated: 'آخر تحديث',
            status: {
                pending: 'قيد الانتظار',
                confirmed: 'مؤكد',
                in_delivery: 'قيد التوصيل',
                delivered: 'تم التوصيل',
                cancelled: 'ملغي'
            },
            paymentMethods: {
                cash_on_delivery: 'الدفع عند الاستلام'
            },
            tableHeaders: {
                orderId: 'رقم الطلب',
                customer: 'العميل',
                phone: 'الهاتف',
                total: 'الإجمالي',
                status: 'الحالة',
                date: 'التاريخ',
                actions: 'الإجراءات'
            },
            view: 'عرض'
        }
    }), []);

    const t = content[language];

    // ─── RTL Styles ────────────────────────────────────────────────────────────
    const rtlStyles = useMemo(() =>
        language === 'ar' ? { direction: 'rtl', textAlign: 'right' } : {},
        [language]
    );

    // ─── Responsive Detection ──────────────────────────────────────────────────
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ─── API Helper ────────────────────────────────────────────────────────────
    const apiFetch = useCallback(async (path, options = {}) => {
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('Not authenticated');

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

        if (!res.ok) {
            let detail = `Request failed (${res.status})`;
            try {
                const body = await res.json();
                detail = body.detail || body.message || detail;
            } catch {
                // Ignore parse errors
            }
            throw new Error(detail);
        }

        if (res.status === 204) return null;
        return res.json();
    }, []);

    // ─── Fetch Orders ──────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async (skip = 0, limit = 10, append = false, search = '') => {
        setLoading(true);
        setError(null);
        try {
            let url = `/api/v1/admin/orders/?skip=${skip}&limit=${limit}`;
            if (search) {
                url += `&search=${encodeURIComponent(search)}`;
            }

            const data = await apiFetch(url);

            if (Array.isArray(data)) {
                setOrders(prev => append ? [...prev, ...data] : data);
                setPagination(prev => ({
                    ...prev,
                    skip: skip + data.length,
                    hasMore: data.length === limit
                }));
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiFetch]);

    // ─── Fetch Single Order ────────────────────────────────────────────────────
    const fetchOrderById = useCallback(async (orderId) => {
        try {
            const data = await apiFetch(`/api/v1/admin/orders/${orderId}`);
            return data;
        } catch (err) {
            console.error('Error fetching order:', err);
            throw err;
        }
    }, [apiFetch]);

    // ─── Update Order Status ───────────────────────────────────────────────────
    const updateOrderStatus = useCallback(async (orderId, status) => {
        try {
            const updated = await apiFetch(`/api/v1/admin/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });

            // Update orders list
            setOrders(prev => prev.map(order =>
                order.id === orderId ? updated : order
            ));

            // Update selected order if open
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(updated);
            }

            return updated;
        } catch (err) {
            console.error('Error updating order status:', err);
            throw err;
        }
    }, [apiFetch, selectedOrder]);

    // Initial fetch
    useEffect(() => {
        fetchOrders(0, pagination.limit, false);
    }, []);

    // ─── Search with debounce ──────────────────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(0, pagination.limit, false, searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, fetchOrders, pagination.limit]);

    // ─── Load More ─────────────────────────────────────────────────────────────
    const handleLoadMore = useCallback(() => {
        if (!loading && pagination.hasMore) {
            fetchOrders(pagination.skip, pagination.limit, true, searchTerm);
        }
    }, [fetchOrders, pagination.skip, pagination.limit, pagination.hasMore, loading, searchTerm]);

    // ─── Handle View Order ─────────────────────────────────────────────────────
    const handleViewOrder = useCallback(async (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    }, []);

    // ─── Handle Update Status ──────────────────────────────────────────────────
    const handleUpdateStatus = useCallback(async (orderId, status) => {
        await updateOrderStatus(orderId, status);
    }, [updateOrderStatus]);

    // ─── Handle Close Modal ────────────────────────────────────────────────────
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    }, []);

    // ─── Filtered Orders (already filtered by API) ─────────────────────────────
    const filteredOrders = orders;

    // ─── Pagination Calculations ───────────────────────────────────────────────
    const totalPages = Math.ceil(filteredOrders.length / pagination.limit);
    const startIndex = pagination.skip - pagination.limit + 1;
    const currentOrders = filteredOrders;

    // ─── Responsive Classes ────────────────────────────────────────────────────
    const responsiveClasses = useMemo(() => ({
        headerSize: isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl',
        px: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-4 sm:px-6 lg:px-8',
        pb: isMobile ? 'pb-12' : isTablet ? 'pb-16' : 'pb-20',
        mb: isMobile ? 'mb-6' : 'mb-8',
    }), [isMobile, isTablet]);

    // ─── Loading State ─────────────────────────────────────────────────────────
    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#2C2C2C]">{t.loading}</p>
                </div>
            </div>
        );
    }

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={rtlStyles}>
            {/* Order Details Modal */}
            <OrderModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                order={selectedOrder}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
                t={t}
                language={language}
                rtlStyles={rtlStyles}
            />

            <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
                {/* Page Title */}
                <div className={`${responsiveClasses.mb}`}>
                    <h1
                        className={`${responsiveClasses.headerSize} text-[#2C2C2C] mb-1`}
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        {t.title}
                    </h1>
                    <p className="text-sm text-[#2C2C2C]/70">
                        {t.subtitle}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className={`relative ${!isMobile && 'max-w-md'}`}>
                        <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40`} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={isMobile ? t.mobileSearchPlaceholder : t.searchPlaceholder}
                            className={`w-full h-10 ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        />
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex justify-between items-center">
                        <span>{error}</span>
                        <button
                            onClick={() => {
                                setError(null);
                                fetchOrders(0, pagination.limit, false, searchTerm);
                            }}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-red-700 text-xs"
                        >
                            {t.retry}
                        </button>
                    </div>
                )}

                {/* Mobile View - Cards */}
                {isMobile ? (
                    <div className="space-y-4">
                        {filteredOrders.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-[#2C2C2C]/70">{t.noOrders}</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredOrders.map((order) => (
                                <Card key={order.id}>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3 mt-5">
                                            <div>
                                                <p className="text-sm font-medium text-[#2C2C2C]">#{order.id}</p>
                                                <p className="text-xs text-[#2C2C2C]/70 mt-1">{order.customer_name}</p>
                                            </div>
                                            <StatusBadge status={order.status} t={t} />
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <p className="text-sm text-[#2C2C2C]">{order.phone}</p>
                                            <p className="text-sm font-semibold text-[#8B5E3C]">{formatCurrency(order.total_price, language)}</p>
                                            <p className="text-xs text-[#2C2C2C]/70">{formatDate(order.created_at, language)}</p>
                                        </div>

                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="w-full py-2 rounded-lg bg-[#8B5E3C]/10 hover:bg-[#8B5E3C]/20 transition-colors text-[#8B5E3C] text-sm flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {t.view}
                                        </button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    /* Tablet & Desktop View - Table */
                    <Card>
                        <CardHeader>
                            <CardTitle>{t.allOrders} ({filteredOrders.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[#2C2C2C]/10">
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.orderId}
                                            </th>
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.customer}
                                            </th>
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.phone}
                                            </th>
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.total}
                                            </th>
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.status}
                                            </th>
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.date}
                                            </th>
                                            <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-3 px-4 text-sm text-[#2C2C2C]/70 font-medium`}>
                                                {t.tableHeaders.actions}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-8 text-center text-[#2C2C2C]/70">
                                                    {t.noOrders}
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((order) => (
                                                <tr key={order.id} className="border-b border-[#2C2C2C]/10 last:border-0 hover:bg-[#F5F1E8]/50 transition-colors">
                                                    <td className="py-3 px-4 text-sm text-[#2C2C2C] font-medium">#{order.id}</td>
                                                    <td className="py-3 px-4 text-sm text-[#2C2C2C]">{order.customer_name}</td>
                                                    <td className="py-3 px-4 text-sm text-[#2C2C2C]">{order.phone}</td>
                                                    <td className="py-3 px-4 text-sm text-[#2C2C2C] font-medium">{formatCurrency(order.total_price, language)}</td>
                                                    <td className="py-3 px-4">
                                                        <StatusBadge status={order.status} t={t} />
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-[#2C2C2C]/70">
                                                        {formatDate(order.created_at, language)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            onClick={() => handleViewOrder(order)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B5E3C]/10 hover:bg-[#8B5E3C]/20 transition-colors text-[#8B5E3C] text-sm"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            {t.view}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Load More */}
                            {pagination.hasMore && (
                                <div className="mt-6 flex justify-center">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loading}
                                        className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-[#2C2C2C] text-sm disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-[#8B5E3C] border-t-transparent rounded-full animate-spin" />
                                                {t.loading}
                                            </>
                                        ) : (
                                            t.loadMore
                                        )}
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Animation Styles */}
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