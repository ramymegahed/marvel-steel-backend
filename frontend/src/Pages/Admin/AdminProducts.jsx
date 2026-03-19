import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Search, Plus, Edit2, Trash2, Upload, X, Star,
  ChevronDown, Package, Image as ImageIcon, Ruler,
  AlertTriangle, Loader, Percent
} from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useAdmin } from '../../Components/Context/AdminContext';
import { BASE_URL } from '../../App';

// ─── Shared UI Components ─────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-[#2C2C2C]/10 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

// ─── Helper function to get full image URL (UPDATED with better handling) ─────
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  try {
    // Decode the URL-encoded path first (handles Arabic characters)
    const decodedPath = decodeURIComponent(imagePath);

    // Remove any duplicate 'uploads/' and clean up the path
    let cleanPath = decodedPath.replace(/^uploads\/+/, 'uploads/');

    // Remove any leading slashes
    cleanPath = cleanPath.replace(/^\/+/, '');

    // Ensure the path doesn't have multiple slashes
    cleanPath = cleanPath.replace(/\/+/g, '/');

    // Clean the BASE_URL
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

    // Construct the full URL
    const fullUrl = `${baseUrl}/${cleanPath}`;

    // For debugging - remove in production
    console.log('Image URL:', { original: imagePath, decoded: decodedPath, full: fullUrl });

    return fullUrl;
  } catch (error) {
    console.error('Error processing image URL:', error, imagePath);
    // Fallback: try with original path
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    return `${baseUrl}/${imagePath.replace(/^\/+/, '')}`;
  }
};

// ─── Image Upload Component ──────────────────────────────────────────────────
const ImageUpload = ({ images, onImageUpload, onImageRemove, onSetMain, t, language }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onImageUpload(files);
    }
    // Reset input so same file can be uploaded again
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-[#2C2C2C]/70 block">
          {t.productImages}
        </label>
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 rounded-lg bg-[#8B5E3C]/10 hover:bg-[#8B5E3C]/20 text-[#8B5E3C] text-sm flex items-center gap-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t.uploadImages}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {images.map((image, index) => {
            const imageUrl = image instanceof File
              ? URL.createObjectURL(image)
              : getFullImageUrl(image.image_url || image);

            return (
              <div key={index} className="relative group aspect-square">
                <img
                  src={imageUrl}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border border-[#2C2C2C]/10"
                  onLoad={(e) => {
                    // Clean up blob URL after load
                    if (image instanceof File) {
                      URL.revokeObjectURL(e.target.src);
                    }
                  }}
                  onError={(e) => {
                    console.error('Failed to load image:', imageUrl);
                    e.target.src = 'https://via.placeholder.com/200?text=Error';
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  {!image.is_main && !(image instanceof File) && (
                    <button
                      type="button"
                      onClick={() => onSetMain(index)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title={t.setAsPrimary}
                    >
                      <Star className="w-4 h-4 text-[#8B5E3C]" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onImageRemove(index)}
                    className="p-2 bg-white rounded-full hover:bg-red-50"
                    title={t.remove}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                {image.is_main && (
                  <div className="absolute top-2 left-2 bg-[#8B5E3C] text-white px-2 py-1 rounded text-xs">
                    {t.primary}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[#2C2C2C]/40">
        {t.imageFormats}
      </p>
    </div>
  );
};

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
  loading,
  t,
  rtlStyles
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
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

// ─── Image Gallery Modal (UPDATED with error handling) ───────────────────────
const ImageGalleryModal = ({
  isOpen,
  onClose,
  product,
  images,
  onSetMain,
  onDeleteImage,
  onUploadImages,
  t,
  rtlStyles
}) => {
  const fileInputRef = useRef(null);
  const [imageErrors, setImageErrors] = useState({});

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onUploadImages(files);
    }
    e.target.value = '';
  };

  const handleImageError = (imageId) => {
    console.error('Gallery image failed to load:', imageId);
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden" style={rtlStyles}>
        <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t.productImages} - {product?.name}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5">
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Upload Button */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-[#2C2C2C]/20 rounded-lg text-[#2C2C2C]/60 hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {t.clickToUpload}
            </button>
          </div>

          {/* Images Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => {
              const imageUrl = getFullImageUrl(image.image_url);
              const hasError = imageErrors[image.id];

              return (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-[#F5F1E8] rounded-lg overflow-hidden flex items-center justify-center">
                    {!hasError ? (
                      <img
                        src={imageUrl}
                        alt="Product"
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(image.id)}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2">
                        <ImageIcon className="w-8 h-8 text-[#2C2C2C]/30" />
                        <span className="text-xs text-red-500 mt-1 text-center">
                          {t.imageError || 'Failed to load'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.is_main && !hasError && (
                      <button
                        onClick={() => onSetMain(image.id)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                        title={t.setAsPrimary}
                      >
                        <Star className="w-4 h-4 text-[#8B5E3C]" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteImage(image.id)}
                      className="p-2 bg-white rounded-full hover:bg-red-50"
                      title={t.delete}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                  {image.is_main && !hasError && (
                    <div className="absolute top-2 left-2 bg-[#8B5E3C] text-white px-2 py-1 rounded text-xs">
                      {t.primary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {images.length === 0 && (
            <div className="text-center py-12 text-[#2C2C2C]/50">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{t.noImages}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Sizes Modal (with empty fields and validation) ─────────────────────────
const SizesModal = ({
  isOpen,
  onClose,
  product,
  sizes,
  onAddSize,
  onEditSize,
  onDeleteSize,
  t,
  rtlStyles,
  language
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [sizeForm, setSizeForm] = useState({
    name: '',
    price: '',
    discount_price: '',
    stock_quantity: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!sizeForm.name?.trim()) {
      errors.name = t.sizeNameRequired || 'Size name is required';
    }
    if (sizeForm.price === '' || sizeForm.price === null) {
      errors.price = t.priceRequired || 'Price is required';
    } else if (Number(sizeForm.price) < 0) {
      errors.price = t.pricePositive || 'Price must be positive';
    }
    if (sizeForm.discount_price && Number(sizeForm.discount_price) < 0) {
      errors.discount_price = t.discountPricePositive || 'Discount price must be positive';
    }
    if (sizeForm.stock_quantity === '' || sizeForm.stock_quantity === null) {
      errors.stock_quantity = t.stockRequired || 'Stock quantity is required';
    } else if (Number(sizeForm.stock_quantity) < 0) {
      errors.stock_quantity = t.stockPositive || 'Stock quantity must be positive';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert empty strings to 0 for API
      const submitData = {
        name: sizeForm.name,
        price: sizeForm.price === '' ? 0 : Number(sizeForm.price),
        discount_price: sizeForm.discount_price === '' ? 0 : Number(sizeForm.discount_price),
        stock_quantity: sizeForm.stock_quantity === '' ? 0 : Number(sizeForm.stock_quantity)
      };

      if (editingSize) {
        await onEditSize(editingSize.id, submitData);
      } else {
        await onAddSize(submitData);
      }
      setIsAdding(false);
      setEditingSize(null);
      setSizeForm({ name: '', price: '', discount_price: '', stock_quantity: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Error saving size:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (size) => {
    setEditingSize(size);
    setSizeForm({
      name: size.name,
      price: size.price?.toString() || '',
      discount_price: size.discount_price?.toString() || '',
      stock_quantity: size.stock_quantity?.toString() || ''
    });
    setIsAdding(true);
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingSize(null);
    setSizeForm({ name: '', price: '', discount_price: '', stock_quantity: '' });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setSizeForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field if it exists
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden" style={rtlStyles}>
        <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t.manageSizes} - {product?.name}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5">
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Add Size Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full mb-6 py-3 border-2 border-dashed border-[#2C2C2C]/20 rounded-lg text-[#2C2C2C]/60 hover:border-[#8B5E3C] hover:text-[#8B5E3C] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t.addSize}
            </button>
          )}

          {/* Size Form */}
          {isAdding && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-[#F5F1E8] rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-xs text-[#2C2C2C]/70 mb-1 block">
                    {t.sizeName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={sizeForm.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: كبير' : 'e.g., Large'}
                    className={`w-full h-9 px-3 rounded-lg bg-white border ${formErrors.name ? 'border-red-500' : 'border-[#2C2C2C]/10'
                      } focus:outline-none focus:border-[#8B5E3C] text-sm`}
                    required
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#2C2C2C]/70 mb-1 block">
                    {t.price} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sizeForm.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full h-9 px-3 rounded-lg bg-white border ${formErrors.price ? 'border-red-500' : 'border-[#2C2C2C]/10'
                      } focus:outline-none focus:border-[#8B5E3C] text-sm`}
                  />
                  {formErrors.price && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.price}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#2C2C2C]/70 mb-1 block items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {t.discountPrice}
                  </label>
                  <input
                    type="number"
                    value={sizeForm.discount_price}
                    onChange={(e) => handleInputChange('discount_price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full h-9 px-3 rounded-lg bg-white border ${formErrors.discount_price ? 'border-red-500' : 'border-[#2C2C2C]/10'
                      } focus:outline-none focus:border-[#8B5E3C] text-sm`}
                  />
                  {formErrors.discount_price && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.discount_price}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-[#2C2C2C]/70 mb-1 block">
                    {t.stockQuantity} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={sizeForm.stock_quantity}
                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                    placeholder="0"
                    min="0"
                    className={`w-full h-9 px-3 rounded-lg bg-white border ${formErrors.stock_quantity ? 'border-red-500' : 'border-[#2C2C2C]/10'
                      } focus:outline-none focus:border-[#8B5E3C] text-sm`}
                  />
                  {formErrors.stock_quantity && (
                    <p className="mt-1 text-xs text-red-500">{formErrors.stock_quantity}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-sm"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : (editingSize ? t.save : t.add)}
                </button>
              </div>
            </form>
          )}

          {/* Sizes List */}
          <div className="space-y-3">
            {sizes.map((size) => (
              <div key={size.id} className="flex items-center justify-between p-4 bg-[#F5F1E8] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Ruler className="w-4 h-4 text-[#8B5E3C]" />
                    <span className="font-medium text-[#2C2C2C]">{size.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm">
                    <span className="text-[#2C2C2C]/70">
                      {t.price}: EGP {size.price?.toFixed?.(2) || size.price}
                    </span>
                    {size.discount_price > 0 && (
                      <span className="text-[#2C2C2C]/70">
                        {t.discountPrice}: EGP {size.discount_price?.toFixed?.(2) || size.discount_price}
                      </span>
                    )}
                    <span className="text-[#2C2C2C]/70">
                      {t.stock}: {size.stock_quantity}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(size)}
                    className="p-2 hover:bg-[#2C2C2C]/10 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-[#2C2C2C]" />
                  </button>
                  <button
                    onClick={() => onDeleteSize(size.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}

            {sizes.length === 0 && !isAdding && (
              <div className="text-center py-8 text-[#2C2C2C]/50">
                <Ruler className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>{t.noSizes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Product Modal ───────────────────────────────────────────────────────────
const ProductModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  formData,
  onFormChange,
  categories,
  formErrors,
  submitAttempted,
  error,
  loading,
  t,
  rtlStyles,
  language,
  isMobile,
  onImageUpload,
  onImageRemove,
  onSetMainImage,
  images
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onFormChange(name, type === 'checkbox' ? checked : value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${isMobile ? 'max-w-full mx-4' : 'max-w-3xl'} max-h-[90vh] overflow-hidden`} style={rtlStyles}>
        <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {title}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5">
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.productName}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder={t.productNamePlaceholder}
                className={`w-full h-10 px-3 rounded-lg bg-white border ${submitAttempted && formErrors?.name ? 'border-red-500' : 'border-[#2C2C2C]/10'
                  } focus:outline-none focus:border-[#8B5E3C] text-sm`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                required
              />
              {submitAttempted && formErrors?.name && (
                <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.category}
              </label>
              <div className="relative">
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] text-sm appearance-none ${language === 'ar' ? 'text-right' : 'text-left'
                    } ${submitAttempted && formErrors?.category_id ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40 pointer-events-none`} />
              </div>
              {submitAttempted && formErrors?.category_id && (
                <p className="mt-1 text-xs text-red-500">{formErrors.category_id}</p>
              )}
            </div>

            {/* Materials */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.materials}
              </label>
              <input
                type="text"
                name="materials"
                value={formData.materials || ''}
                onChange={handleChange}
                placeholder={t.materialsPlaceholder}
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] text-sm"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Delivery Time */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.deliveryTime}
              </label>
              <input
                type="text"
                name="delivery_time"
                value={formData.delivery_time || ''}
                onChange={handleChange}
                placeholder={t.deliveryTimePlaceholder}
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] text-sm"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.description}
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder={t.descriptionPlaceholder}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] text-sm resize-none"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Image Upload */}
            <ImageUpload
              images={images}
              onImageUpload={onImageUpload}
              onImageRemove={onImageRemove}
              onSetMain={onSetMainImage}
              t={t}
              language={language}
            />

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active || false}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#2C2C2C]/10 text-[#8B5E3C] focus:ring-[#8B5E3C]"
              />
              <label htmlFor="is_active" className="text-sm text-[#2C2C2C]/70">
                {t.isActive}
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-[#2C2C2C]/10 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-sm text-[#2C2C2C]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : (title === t.addNewProduct ? t.add : t.save)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Product Card Component (UPDATED with better image handling) ─────────────
const ProductCard = React.memo(({ product, t, language, onEdit, onDelete, onManageImages, onManageSizes }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const mainImage = product.images?.find(img => img.is_main) || product.images?.[0];
  const imageUrl = mainImage ? getFullImageUrl(mainImage.image_url) : null;

  // Calculate total stock from sizes
  const totalStock = product.sizes?.reduce((sum, size) => sum + (size.stock_quantity || 0), 0) || 0;

  const handleImageError = () => {
    console.error('Failed to load image:', imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Image */}
          <div className="h-40 bg-[#F5F1E8] rounded-lg flex items-center justify-center relative shrink-0 overflow-hidden mt-5">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#F5F1E8] z-10">
                <Loader className="w-6 h-6 text-[#8B5E3C] animate-spin" />
              </div>
            )}
            {imageUrl && !imageError ? (
              <img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Package className="w-8 h-8 text-[#2C2C2C]/30" />
                {imageError && (
                  <span className="text-xs text-red-500 mt-1">{t.imageError || 'Failed to load'}</span>
                )}
              </div>
            )}
            {product.images?.length > 0 && !imageError && (
              <div className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-2 bg-[#8B5E3C] text-white px-2 py-1 rounded text-xs z-20`}>
                {product.images.length} {product.images.length > 1 ? t.images : t.image}
              </div>
            )}
            <div className={`absolute ${language === 'ar' ? 'right-2' : 'left-2'} top-2 z-20`}>
              <span className={`px-2 py-1 text-xs font-medium rounded ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {product.is_active ? t.active : t.inactive}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[#2C2C2C] truncate" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-xs text-[#2C2C2C]/70 mt-1">ID: {product.id}</p>
              </div>
              <span className="px-2 py-1 bg-[#8B5E3C]/10 text-[#8B5E3C] text-xs font-medium rounded whitespace-nowrap">
                {product.category?.name}
              </span>
            </div>

            <p className="text-sm text-[#2C2C2C]/70 line-clamp-2 mt-2 h-10">
              {product.description || t.noDescription}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm shrink-0">
            <div className="p-2 bg-[#F5F1E8] rounded-lg">
              <p className="text-xs text-[#2C2C2C]/70">{t.sizes}</p>
              <p className="font-medium text-[#2C2C2C]">{product.sizes?.length || 0}</p>
            </div>
            <div className="p-2 bg-[#F5F1E8] rounded-lg">
              <p className="text-xs text-[#2C2C2C]/70">{t.images}</p>
              <p className="font-medium text-[#2C2C2C]">{product.images?.length || 0}</p>
            </div>
            <div className="p-2 bg-[#F5F1E8] rounded-lg">
              <p className="text-xs text-[#2C2C2C]/70">{t.stock}</p>
              <p className="font-medium text-[#2C2C2C]">{totalStock}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 shrink-0">
            <button
              onClick={() => onManageImages(product)}
              className="py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-sm text-[#2C2C2C] flex items-center justify-center gap-1"
            >
              <ImageIcon className="w-4 h-4" />
              {t.images}
            </button>
            <button
              onClick={() => onManageSizes(product)}
              className="py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-sm text-[#2C2C2C] flex items-center justify-center gap-1"
            >
              <Ruler className="w-4 h-4" />
              {t.sizes}
            </button>
          </div>

          <div className="flex gap-2 pt-2 shrink-0">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-sm text-[#2C2C2C] flex items-center justify-center gap-1"
            >
              <Edit2 className="w-4 h-4" />
              {t.edit}
            </button>
            <button
              onClick={() => onDelete(product)}
              className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminProducts() {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAdmin();

  // ─── State Management ──────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [isSizesModalOpen, setIsSizesModalOpen] = useState(false);

  // Selected items
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productSizes, setProductSizes] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    materials: '',
    category_id: '',
    delivery_time: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Images for add/edit modal
  const [modalImages, setModalImages] = useState([]);

  // Pagination
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    hasMore: true
  });

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ─── Content Dictionary (with validation messages and image error) ─────────
  const content = useMemo(() => ({
    en: {
      title: 'Products',
      subtitle: 'Manage your product catalog',
      searchPlaceholder: 'Search products by name, category, or ID...',
      mobileSearchPlaceholder: 'Search products...',
      noProducts: 'No products found',
      addProduct: 'Add Product',
      editProduct: 'Edit Product',
      addNewProduct: 'Add New Product',
      deleteConfirm: 'Are you sure you want to delete',
      productName: 'Product Name *',
      productNamePlaceholder: 'Enter product name',
      category: 'Category *',
      selectCategory: 'Select category',
      materials: 'Materials',
      materialsPlaceholder: 'e.g., Steel, Iron, Aluminum',
      deliveryTime: 'Delivery Time',
      deliveryTimePlaceholder: 'e.g., 3-5 business days',
      description: 'Description',
      descriptionPlaceholder: 'Enter product description',
      isActive: 'Active',
      cancel: 'Cancel',
      add: 'Add Product',
      save: 'Save Changes',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      price: 'Price',
      discountPrice: 'Discount Price',
      stock: 'Stock',
      sizes: 'Sizes',
      images: 'Images',
      image: 'Image',
      noDescription: 'No description available',
      active: 'Active',
      inactive: 'Inactive',
      nameRequired: 'Product name is required',
      categoryRequired: 'Category is required',
      createdAt: 'Created',
      loadMore: 'Load More',
      retry: 'Retry',
      confirmDelete: 'Delete Product',
      deleteWarning: 'This action cannot be undone.',
      manageImages: 'Manage Images',
      manageSizes: 'Manage Sizes',
      productImages: 'Product Images',
      noImages: 'No images uploaded',
      setAsPrimary: 'Set as primary',
      primary: 'Primary',
      uploadImages: 'Upload Images',
      clickToUpload: 'Click to upload or drag and drop',
      imageFormats: 'PNG, JPG, WEBP up to 5MB (multiple files allowed)',
      addSize: 'Add Size',
      sizeName: 'Size Name',
      additionalPrice: 'Price',
      stockQuantity: 'Stock Quantity',
      noSizes: 'No sizes added',
      manageSizes: 'Manage Sizes',
      totalStock: 'Total Stock',
      yes: 'Yes, Delete',
      no: 'No, Cancel',
      remove: 'Remove',
      // Validation messages
      sizeNameRequired: 'Size name is required',
      priceRequired: 'Price is required',
      pricePositive: 'Price must be positive',
      discountPricePositive: 'Discount price must be positive',
      stockRequired: 'Stock quantity is required',
      stockPositive: 'Stock quantity must be positive',
      // Image error message
      imageError: 'Failed to load image'
    },
    ar: {
      title: 'المنتجات',
      subtitle: 'إدارة كتالوج المنتجات',
      searchPlaceholder: 'البحث عن منتجات بالاسم أو الفئة أو الرقم...',
      mobileSearchPlaceholder: 'البحث عن منتجات...',
      noProducts: 'لم يتم العثور على منتجات',
      addProduct: 'إضافة منتج',
      editProduct: 'تعديل المنتج',
      addNewProduct: 'إضافة منتج جديد',
      deleteConfirm: 'هل أنت متأكد من حذف',
      productName: 'اسم المنتج *',
      productNamePlaceholder: 'أدخل اسم المنتج',
      category: 'الفئة *',
      selectCategory: 'اختر الفئة',
      materials: 'المواد',
      materialsPlaceholder: 'مثال: صلب، حديد، ألمنيوم',
      deliveryTime: 'وقت التسليم',
      deliveryTimePlaceholder: 'مثال: 3-5 أيام عمل',
      description: 'الوصف',
      descriptionPlaceholder: 'أدخل وصف المنتج',
      isActive: 'نشط',
      cancel: 'إلغاء',
      add: 'إضافة منتج',
      save: 'حفظ التغييرات',
      edit: 'تعديل',
      delete: 'حذف',
      deleting: 'جاري الحذف...',
      price: 'السعر',
      discountPrice: 'سعر الخصم',
      stock: 'المخزون',
      sizes: 'المقاسات',
      images: 'الصور',
      image: 'صورة',
      noDescription: 'لا يوجد وصف',
      active: 'نشط',
      inactive: 'غير نشط',
      nameRequired: 'اسم المنتج مطلوب',
      categoryRequired: 'الفئة مطلوبة',
      createdAt: 'تاريخ الإنشاء',
      loadMore: 'تحميل المزيد',
      retry: 'إعادة المحاولة',
      confirmDelete: 'حذف المنتج',
      deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
      manageImages: 'إدارة الصور',
      manageSizes: 'إدارة المقاسات',
      productImages: 'صور المنتج',
      noImages: 'لم يتم رفع صور',
      setAsPrimary: 'تعيين كأساسي',
      primary: 'أساسي',
      uploadImages: 'رفع الصور',
      clickToUpload: 'انقر للرفع أو اسحب وأفلت',
      imageFormats: 'PNG, JPG, WEBP حتى 5 ميجابايت (يمكن رفع عدة ملفات)',
      addSize: 'إضافة مقاس',
      sizeName: 'اسم المقاس',
      additionalPrice: 'السعر',
      stockQuantity: 'كمية المخزون',
      noSizes: 'لم تتم إضافة مقاسات',
      manageSizes: 'إدارة المقاسات',
      totalStock: 'إجمالي المخزون',
      yes: 'نعم، احذف',
      no: 'لا، إلغاء',
      remove: 'إزالة',
      // Validation messages
      sizeNameRequired: 'اسم المقاس مطلوب',
      priceRequired: 'السعر مطلوب',
      pricePositive: 'يجب أن يكون السعر موجباً',
      discountPricePositive: 'يجب أن يكون سعر الخصم موجباً',
      stockRequired: 'كمية المخزون مطلوبة',
      stockPositive: 'يجب أن تكون كمية المخزون موجبة',
      // Image error message
      imageError: 'فشل تحميل الصورة'
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
      ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

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

  // ─── Fetch Categories ──────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiFetch('/api/v1/admin/categories/?skip=0&limit=100');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [apiFetch]);

  // ─── Fetch Products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (skip = 0, limit = 20, append = false, categoryId = null) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/v1/admin/products/?skip=${skip}&limit=${limit}`;
      if (categoryId) {
        url += `&category_id=${categoryId}`;
      }

      const data = await apiFetch(url);

      if (Array.isArray(data)) {
        setProducts(prev => append ? [...prev, ...data] : data);
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

  // ─── Fetch Product Images ──────────────────────────────────────────────────
  const fetchProductImages = useCallback(async (productId) => {
    try {
      const data = await apiFetch(`/api/v1/admin/products/${productId}/images`);
      setProductImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching images:', err);
    }
  }, [apiFetch]);

  // ─── Fetch Product Sizes ───────────────────────────────────────────────────
  const fetchProductSizes = useCallback(async (productId) => {
    try {
      const data = await apiFetch(`/api/v1/admin/products/${productId}/sizes`);
      setProductSizes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching sizes:', err);
    }
  }, [apiFetch]);

  // Initial fetch
  useEffect(() => {
    fetchCategories();
    fetchProducts(0, pagination.limit, false);
  }, []);

  // ─── Load More ─────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchProducts(pagination.skip, pagination.limit, true);
    }
  }, [fetchProducts, pagination.skip, pagination.limit, pagination.hasMore, loading]);

  // ─── Filter Products ───────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const term = searchTerm.toLowerCase();
    return products.filter(product =>
      product.name?.toLowerCase().includes(term) ||
      product.category?.name?.toLowerCase().includes(term) ||
      product.id?.toString().includes(term)
    );
  }, [products, searchTerm]);

  // ─── Form Validation ───────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = t.nameRequired;
    }
    if (!formData.category_id) {
      errors.category_id = t.categoryRequired;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name, formData.category_id, t.nameRequired, t.categoryRequired]);

  // ─── Reset Form ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      materials: '',
      category_id: '',
      delivery_time: '',
      is_active: true
    });
    setModalImages([]);
    setFormErrors({});
    setSubmitAttempted(false);
  }, []);

  // ─── Handle Input Change ───────────────────────────────────────────────────
  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [formErrors]);

  // ─── Handle Image Upload in Modal ──────────────────────────────────────────
  const handleModalImageUpload = useCallback((files) => {
    setModalImages(prev => [...prev, ...files]);
  }, []);

  const handleModalImageRemove = useCallback((index) => {
    setModalImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleModalSetMainImage = useCallback((index) => {
    // This would be implemented when sending to server
    console.log('Set main image:', index);
  }, []);

  // ─── Add Product ───────────────────────────────────────────────────────────
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      // First create the product
      const newProduct = await apiFetch('/api/v1/admin/products/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      // Then upload images if any
      if (modalImages.length > 0) {
        for (const image of modalImages) {
          const imageFormData = new FormData();
          imageFormData.append('file', image);

          await apiFetch(`/api/v1/admin/products/${newProduct.id}/images`, {
            method: 'POST',
            body: imageFormData
          });
        }
      }

      // Refresh products to get updated data with images
      await fetchProducts(0, pagination.limit, false);

      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Edit Product ──────────────────────────────────────────────────────────
  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSubmitAttempted(true);
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      // Update product
      const updated = await apiFetch(`/api/v1/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      // Upload new images if any
      if (modalImages.length > 0) {
        for (const image of modalImages) {
          const imageFormData = new FormData();
          imageFormData.append('file', image);

          await apiFetch(`/api/v1/admin/products/${selectedProduct.id}/images`, {
            method: 'POST',
            body: imageFormData
          });
        }
      }

      // Refresh products
      await fetchProducts(0, pagination.limit, false);

      setIsEditModalOpen(false);
      setSelectedProduct(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Delete Product ────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/admin/products/${productToDelete.id}`, { method: 'DELETE' });
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }, [productToDelete, apiFetch]);

  // ─── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = useCallback((product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      materials: product.materials || '',
      category_id: product.category_id || '',
      delivery_time: product.delivery_time || '',
      is_active: product.is_active
    });
    setModalImages([]); // Reset images, they'll be uploaded separately
    setIsEditModalOpen(true);
  }, []);

  // ─── Image Management ──────────────────────────────────────────────────────
  const openImageGallery = useCallback(async (product) => {
    setSelectedProduct(product);
    await fetchProductImages(product.id);
    setIsImageGalleryOpen(true);
  }, [fetchProductImages]);

  const handleSetMainImage = useCallback(async (imageId) => {
    if (!selectedProduct) return;

    try {
      const updated = await apiFetch(`/api/v1/admin/products/images/${imageId}/set-main?product_id=${selectedProduct.id}`, {
        method: 'PUT'
      });

      setProductImages(prev => prev.map(img => ({
        ...img,
        is_main: img.id === imageId
      })));

      // Update product in list
      await fetchProducts(0, pagination.limit, false);
    } catch (err) {
      console.error('Error setting main image:', err);
    }
  }, [selectedProduct, apiFetch, fetchProducts, pagination.limit]);

  const handleDeleteImage = useCallback(async (imageId) => {
    if (!selectedProduct) return;

    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiFetch(`/api/v1/admin/products/images/${imageId}`, { method: 'DELETE' });
      setProductImages(prev => prev.filter(img => img.id !== imageId));

      // Update product in list
      await fetchProducts(0, pagination.limit, false);
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  }, [selectedProduct, apiFetch, fetchProducts, pagination.limit]);

  const handleUploadImages = useCallback(async (files) => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await apiFetch(`/api/v1/admin/products/${selectedProduct.id}/images`, {
          method: 'POST',
          body: formData
        });
      }

      // Refresh images
      await fetchProductImages(selectedProduct.id);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, apiFetch, fetchProductImages]);

  // ─── Size Management ───────────────────────────────────────────────────────
  const openSizesModal = useCallback(async (product) => {
    setSelectedProduct(product);
    await fetchProductSizes(product.id);
    setIsSizesModalOpen(true);
  }, [fetchProductSizes]);

  const handleAddSize = useCallback(async (sizeData) => {
    if (!selectedProduct) return;

    try {
      const newSize = await apiFetch(`/api/v1/admin/products/${selectedProduct.id}/sizes`, {
        method: 'POST',
        body: JSON.stringify(sizeData)
      });

      setProductSizes(prev => [...prev, newSize]);

      // Update product in list
      await fetchProducts(0, pagination.limit, false);
    } catch (err) {
      console.error('Error adding size:', err);
    }
  }, [selectedProduct, apiFetch, fetchProducts, pagination.limit]);

  const handleEditSize = useCallback(async (sizeId, sizeData) => {
    if (!selectedProduct) return;

    try {
      const updated = await apiFetch(`/api/v1/admin/products/sizes/${sizeId}`, {
        method: 'PUT',
        body: JSON.stringify(sizeData)
      });

      setProductSizes(prev => prev.map(s => s.id === sizeId ? updated : s));

      // Update product in list
      await fetchProducts(0, pagination.limit, false);
    } catch (err) {
      console.error('Error editing size:', err);
    }
  }, [selectedProduct, apiFetch, fetchProducts, pagination.limit]);

  // NOTE: DELETE endpoint for sizes is not provided in the given endpoints
  // This implementation assumes it exists, but you should verify with backend
  const handleDeleteSize = useCallback(async (sizeId) => {
    if (!selectedProduct) return;

    if (!window.confirm('Are you sure you want to delete this size?')) return;

    try {
      await apiFetch(`/api/v1/admin/products/sizes/${sizeId}`, { method: 'DELETE' });
      setProductSizes(prev => prev.filter(s => s.id !== sizeId));

      // Update product in list
      await fetchProducts(0, pagination.limit, false);
    } catch (err) {
      console.error('Error deleting size:', err);
    }
  }, [selectedProduct, apiFetch, fetchProducts, pagination.limit]);

  // ─── Responsive Classes ────────────────────────────────────────────────────
  const responsiveClasses = useMemo(() => ({
    gridCols: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    headerSize: isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl',
    px: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-4 sm:px-6 lg:px-8',
    pb: isMobile ? 'pb-12' : isTablet ? 'pb-16' : 'pb-20',
    mb: isMobile ? 'mb-6' : 'mb-8',
  }), [isMobile, isTablet]);

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading && products.length === 0) {
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
      <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
        {/* Header */}
        <div className={`${responsiveClasses.mb} flex justify-between items-center`}>
          <div>
            <h1 className={`${responsiveClasses.headerSize} text-[#2C2C2C] mb-1`} style={{ fontFamily: 'Playfair Display, serif' }}>
              {t.title}
            </h1>
            <p className="text-sm text-[#2C2C2C]/70">
              {isMobile ? t.mobileSearchPlaceholder : t.subtitle}
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className={`${isMobile ? 'w-10 h-10' : 'h-11 px-5 gap-2'} rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white flex items-center justify-center`}
          >
            <Plus className="w-5 h-5" />
            {!isMobile && <span className="text-sm">{t.addProduct}</span>}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className={`relative ${!isMobile && 'max-w-xl'}`}>
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isMobile ? t.mobileSearchPlaceholder : t.searchPlaceholder}
              className={`w-full h-10 ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] text-sm`}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className={`grid ${responsiveClasses.gridCols} gap-5 auto-rows-fr mb-8`}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  t={t}
                  language={language}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClick}
                  onManageImages={openImageGallery}
                  onManageSizes={openSizesModal}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-[#2C2C2C] text-sm disabled:opacity-50 flex items-center gap-2"
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
          </>
        ) : (
          !loading && (
            <div className="text-center py-20 text-[#2C2C2C]/50">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-4">{t.noProducts}</p>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t.addProduct}
              </button>
            </div>
          )
        )}
      </div>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={t.addNewProduct}
        onSubmit={handleAddProduct}
        formData={formData}
        onFormChange={handleInputChange}
        categories={categories}
        formErrors={formErrors}
        submitAttempted={submitAttempted}
        error={error}
        loading={loading}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
        isMobile={isMobile}
        onImageUpload={handleModalImageUpload}
        onImageRemove={handleModalImageRemove}
        onSetMainImage={handleModalSetMainImage}
        images={modalImages}
      />

      {/* Edit Product Modal */}
      <ProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
          resetForm();
        }}
        title={t.editProduct}
        onSubmit={handleEditProduct}
        formData={formData}
        onFormChange={handleInputChange}
        categories={categories}
        formErrors={formErrors}
        submitAttempted={submitAttempted}
        error={error}
        loading={loading}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
        isMobile={isMobile}
        onImageUpload={handleModalImageUpload}
        onImageRemove={handleModalImageRemove}
        onSetMainImage={handleModalSetMainImage}
        images={modalImages}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={productToDelete?.name || ''}
        itemType="product"
        loading={deleteLoading}
        t={t}
        rtlStyles={rtlStyles}
      />

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isImageGalleryOpen}
        onClose={() => {
          setIsImageGalleryOpen(false);
          setSelectedProduct(null);
          setProductImages([]);
        }}
        product={selectedProduct}
        images={productImages}
        onSetMain={handleSetMainImage}
        onDeleteImage={handleDeleteImage}
        onUploadImages={handleUploadImages}
        t={t}
        rtlStyles={rtlStyles}
      />

      {/* Sizes Modal */}
      <SizesModal
        isOpen={isSizesModalOpen}
        onClose={() => {
          setIsSizesModalOpen(false);
          setSelectedProduct(null);
          setProductSizes([]);
        }}
        product={selectedProduct}
        sizes={productSizes}
        onAddSize={handleAddSize}
        onEditSize={handleEditSize}
        onDeleteSize={handleDeleteSize}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
      />

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