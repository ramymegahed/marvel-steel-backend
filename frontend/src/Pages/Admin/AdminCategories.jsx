import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, FolderTree, Upload, AlertTriangle } from 'lucide-react';
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

// ─── Delete Confirmation Modal ───────────────────────────────────────────────
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  categoryName,
  loading,
  t,
  rtlStyles,
  language
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        style={rtlStyles}
      >
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-red-700" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t.confirmDelete}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-[#2C2C2C] mb-2">
            {t.deleteConfirm} <span className="font-semibold">"{categoryName}"</span>
          </p>
          <p className="text-sm text-[#2C2C2C]/60 mb-6">
            {t.deleteWarning}
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-sm text-[#2C2C2C] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

// ─── Helper function to get full image URL ───────────────────────────────────
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, prepend the base URL
  return `${BASE_URL}/${imagePath}`;
};

// ─── Image Upload Component ──────────────────────────────────────────────────
const ImageUpload = ({ imagePreview, onImageChange, onImageRemove, t, language }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
        {t.image}
      </label>

      {imagePreview ? (
        <div className="relative w-full h-32 rounded-lg border-2 border-[#2C2C2C]/10 overflow-hidden group">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Change image"
            >
              <Upload className="w-4 h-4 text-[#2C2C2C]" />
            </button>
            <button
              type="button"
              onClick={onImageRemove}
              className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
              aria-label="Remove image"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-32 border-2 border-dashed border-[#2C2C2C]/10 rounded-lg hover:border-[#8B5E3C] hover:bg-[#8B5E3C]/5 transition-all flex flex-col items-center justify-center gap-2"
        >
          <Upload className="w-6 h-6 text-[#2C2C2C]/40" />
          <span className="text-sm text-[#2C2C2C]/60">{t.uploadImage}</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Image upload"
      />

      <p className="text-xs text-[#2C2C2C]/40">
        {t.imageFormats}
      </p>
    </div>
  );
};

// ─── Category Modal Component ────────────────────────────────────────────────
const CategoryModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  formData,
  onFormChange,
  onImageChange,
  onImageRemove,
  imagePreview,
  formErrors,
  submitAttempted,
  error,
  loading,
  t,
  rtlStyles,
  language,
  isMobile
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Convert sort_order to number
    const processedValue = name === 'sort_order' ? parseInt(value) || 0 :
      type === 'checkbox' ? checked : value;
    onFormChange(name, processedValue);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl w-full ${isMobile ? 'max-w-full mx-4' : 'max-w-md'}`}
        style={rtlStyles}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} encType="multipart/form-data">
          <div className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Error inside modal */}
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Category Name */}
            <div>
              <label htmlFor="category-name" className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.categoryName}
              </label>
              <input
                id="category-name"
                name="name"
                type="text"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder={t.categoryNamePlaceholder}
                autoComplete="off"
                className={`w-full h-10 px-3 rounded-lg bg-white border ${submitAttempted && formErrors?.name ? 'border-red-500' : 'border-[#2C2C2C]/10'
                  } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                required
                aria-required="true"
                aria-invalid={!!formErrors?.name}
                aria-describedby={formErrors?.name ? 'name-error' : undefined}
              />
              {submitAttempted && formErrors?.name && (
                <p id="name-error" className="mt-1 text-xs text-red-500" role="alert">
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="category-description" className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.description}
              </label>
              <textarea
                id="category-description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder={t.descriptionPlaceholder}
                rows={3}
                autoComplete="off"
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm resize-none"
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="category-sort-order" className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.sortOrder}
              </label>
              <input
                id="category-sort-order"
                name="sort_order"
                type="number"
                value={formData.sort_order || 0}
                onChange={handleChange}
                autoComplete="off"
                className="w-full h-10 px-3 rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm"
                min="0"
              />
            </div>

            {/* Image Upload */}
            <ImageUpload
              imagePreview={imagePreview}
              onImageChange={onImageChange}
              onImageRemove={onImageRemove}
              t={t}
              language={language}
            />

            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                id="category-is-active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active || false}
                onChange={handleChange}
                className="w-4 h-4 rounded border-[#2C2C2C]/10 text-[#8B5E3C] focus:ring-[#8B5E3C]"
              />
              <label htmlFor="category-is-active" className="text-sm text-[#2C2C2C]/70">
                {t.isActive}
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-[#2C2C2C]/10 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-sm text-[#2C2C2C]"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.loading : (title === t.addNew ? t.add : t.save)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Category Card Component ────────────────────────────────────────────────
const CategoryCard = React.memo(({ category, t, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  // Get full image URL
  const imageUrl = useMemo(() => {
    return getFullImageUrl(category.image_url);
  }, [category.image_url]);

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between shrink-0 mt-5">
            <div className="w-12 h-12 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center overflow-hidden">
              {imageUrl && !imageError ? (
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              ) : (
                <FolderTree className="w-6 h-6 text-[#8B5E3C]" aria-hidden="true" />
              )}
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
              {category.is_active ? t.active : t.inactive}
            </span>
          </div>

          {/* Info */}
          <div className="shrink-0">
            <h3 className="font-semibold text-[#2C2C2C] mb-1 truncate" title={category.name}>
              {category.name}
            </h3>
            <p className="text-xs text-[#2C2C2C]/70">ID: {category.id}</p>
            <p className="text-xs text-[#2C2C2C]/70 mt-1">
              {t.sortOrder}: {category.sort_order || 0}
            </p>
            <p className="text-xs text-[#2C2C2C]/70 mt-1">
              {t.createdAt}: {new Date(category.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Description */}
          <div className="flex-1 min-h-15">
            <p className="text-sm text-[#2C2C2C]/70 leading-relaxed line-clamp-3">
              {category.description || t.noDescription}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(category)}
              className="flex-1 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-sm text-[#2C2C2C] flex items-center justify-center gap-1"
              aria-label={`Edit ${category.name}`}
            >
              <Edit2 className="w-4 h-4" aria-hidden="true" />
              {t.edit}
            </button>
            <button
              type="button"
              onClick={() => onDelete(category)}
              className="w-9 h-9 rounded-lg bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center"
              aria-label={`Delete ${category.name}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" aria-hidden="true" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminCategories() {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAdmin();

  // ─── State Management ──────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    hasMore: true
  });

  // ─── Content Dictionary ─────────────────────────────────────────────────────
  const content = useMemo(() => ({
    en: {
      title: 'Categories',
      subtitle: 'Manage product categories and classifications',
      mobileSubtitle: 'Manage product categories',
      addCategory: 'Add Category',
      editCategory: 'Edit Category',
      deleteConfirm: 'Are you sure you want to delete',
      noDescription: 'No description available',
      categoryName: 'Category Name *',
      categoryNamePlaceholder: 'Enter category name',
      description: 'Description',
      descriptionPlaceholder: 'Enter category description',
      sortOrder: 'Sort Order',
      isActive: 'Active',
      image: 'Category Image',
      uploadImage: 'Click to upload image',
      imageFormats: 'PNG, JPG, WEBP up to 5MB',
      cancel: 'Cancel',
      add: 'Add Category',
      save: 'Save Changes',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      addNew: 'Add New Category',
      loading: 'Loading...',
      error: 'Error loading categories',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      nameRequired: 'Category name is required',
      createdAt: 'Created',
      loadMore: 'Load More',
      retry: 'Retry',
      confirmDelete: 'Delete Category',
      deleteWarning: 'This action cannot be undone.',
      changeImage: 'Change image',
      removeImage: 'Remove image',
      yes: 'Yes, Delete',
      no: 'No, Cancel'
    },
    ar: {
      title: 'الأقسام',
      subtitle: 'إدارة أقسام المنتجات وتصنيفاتها',
      mobileSubtitle: 'إدارة أقسام المنتجات',
      addCategory: 'إضافة قسم',
      editCategory: 'تعديل القسم',
      deleteConfirm: 'هل أنت متأكد من حذف',
      noDescription: 'لا يوجد وصف',
      categoryName: 'اسم القسم *',
      categoryNamePlaceholder: 'أدخل اسم القسم',
      description: 'الوصف',
      descriptionPlaceholder: 'أدخل وصف القسم',
      sortOrder: 'ترتيب الفرز',
      isActive: 'نشط',
      image: 'صورة القسم',
      uploadImage: 'اضغط لرفع صورة',
      imageFormats: 'PNG, JPG, WEBP حتى 5 ميجابايت',
      cancel: 'إلغاء',
      add: 'إضافة قسم',
      save: 'حفظ التغييرات',
      edit: 'تعديل',
      delete: 'حذف',
      deleting: 'جاري الحذف...',
      addNew: 'إضافة قسم جديد',
      loading: 'جاري التحميل...',
      error: 'خطأ في تحميل الأقسام',
      status: 'الحالة',
      active: 'نشط',
      inactive: 'غير نشط',
      nameRequired: 'اسم القسم مطلوب',
      createdAt: 'تاريخ الإنشاء',
      loadMore: 'تحميل المزيد',
      retry: 'إعادة المحاولة',
      confirmDelete: 'حذف القسم',
      deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
      changeImage: 'تغيير الصورة',
      removeImage: 'إزالة الصورة',
      yes: 'نعم، احذف',
      no: 'لا، إلغاء'
    },
  }), []);

  const t = content[language];

  // ─── RTL Styles ────────────────────────────────────────────────────────────
  const rtlStyles = useMemo(() =>
    language === 'ar' ? { direction: 'rtl', textAlign: 'right' } : {},
    [language]
  );

  // ─── Empty Form Template ───────────────────────────────────────────────────
  const emptyForm = useMemo(() => ({
    name: '',
    description: '',
    sort_order: 0,
    is_active: true,
  }), []);

  const [formData, setFormData] = useState(emptyForm);

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

  // Cleanup image preview on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // ─── API Helper ────────────────────────────────────────────────────────────
  const apiFetch = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Not authenticated — please log in again.');

    const headers = {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    };

    // Don't set Content-Type for FormData, browser will set it with boundary
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

  // ─── Fetch Categories with Pagination ──────────────────────────────────────
  const fetchCategories = useCallback(async (skip = 0, limit = 20, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/v1/admin/categories/?skip=${skip}&limit=${limit}`);

      // Handle response (assuming it's an array)
      if (Array.isArray(data)) {
        setCategories(prev => append ? [...prev, ...data] : data);
        setPagination(prev => ({
          ...prev,
          skip: skip + data.length,
          hasMore: data.length === limit // If we got exactly limit, there might be more
        }));
      } else {
        setCategories([]);
        setPagination(prev => ({ ...prev, hasMore: false }));
      }
    } catch (err) {
      setError(err.message);
      setPagination(prev => ({ ...prev, hasMore: false }));
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // Initial fetch
  useEffect(() => {
    fetchCategories(0, pagination.limit, false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Load More Categories ──────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchCategories(pagination.skip, pagination.limit, true);
    }
  }, [fetchCategories, pagination.skip, pagination.limit, pagination.hasMore, loading]);

  // ─── Form Validation ───────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = t.nameRequired;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.name, t.nameRequired]);

  // ─── Reset Form ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData(emptyForm);
    setFormErrors({});
    setError(null);
    setSubmitAttempted(false);
    setImageFile(null);
    // Clean up blob URL if it exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  }, [emptyForm, imagePreview]);

  // ─── Handle Input Change ───────────────────────────────────────────────────
  const handleInputChange = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear field-specific error when user starts typing
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  }, [formErrors]);

  // ─── Handle Image Change ───────────────────────────────────────────────────
  const handleImageChange = useCallback((file) => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPG, WEBP)');
      return;
    }

    setImageFile(file);

    // Create preview - clean up old preview if it exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  }, [imagePreview]);

  // ─── Handle Image Remove ───────────────────────────────────────────────────
  const handleImageRemove = useCallback(() => {
    setImageFile(null);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    } else {
      setImagePreview(null);
    }
  }, [imagePreview]);

  // ─── Add Category ──────────────────────────────────────────────────────────
  const handleAddCategory = async (e) => {
    e?.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();

      // Append form fields
      formDataObj.append('name', formData.name?.trim());
      if (formData.description?.trim()) {
        formDataObj.append('description', formData.description.trim());
      }
      formDataObj.append('sort_order', parseInt(formData.sort_order) || 0);
      formDataObj.append('is_active', formData.is_active);

      // Append image file if exists
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }

      const newCategory = await apiFetch('/api/v1/admin/categories/', {
        method: 'POST',
        body: formDataObj,
      });

      // Add the new category to the list with the image_url from response
      setCategories((prev) => [newCategory, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Edit Category ─────────────────────────────────────────────────────────
  const handleEditCategory = async (e) => {
    e?.preventDefault();
    if (!selectedCategory) return;

    setSubmitAttempted(true);
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      // Create FormData for file upload
      const formDataObj = new FormData();

      // Append form fields (only if they've changed or are provided)
      if (formData.name?.trim()) {
        formDataObj.append('name', formData.name.trim());
      }
      if (formData.description?.trim()) {
        formDataObj.append('description', formData.description.trim());
      }
      formDataObj.append('sort_order', parseInt(formData.sort_order) || 0);
      formDataObj.append('is_active', formData.is_active);

      // Append image file if exists (new upload)
      if (imageFile) {
        formDataObj.append('image', imageFile);
      }

      const updated = await apiFetch(`/api/v1/admin/categories/${selectedCategory.id}`, {
        method: 'PUT',
        body: formDataObj,
      });

      // Update the category in the list with the new data including image_url
      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? updated : c))
      );
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Delete Category ───────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/admin/categories/${categoryToDelete.id}`, { method: 'DELETE' });
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }, [categoryToDelete, apiFetch]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
  }, []);

  // ─── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = useCallback((category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      sort_order: category.sort_order || 0,
      is_active: category.is_active,
    });
    // Set image preview from existing image_url (this is a URL from server, not a blob)
    if (category.image_url) {
      setImagePreview(getFullImageUrl(category.image_url));
    }
    setFormErrors({});
    setSubmitAttempted(false);
    setIsEditModalOpen(true);
  }, []);

  // ─── Responsive Classes ────────────────────────────────────────────────────
  const responsiveClasses = useMemo(() => ({
    gridCols: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    headerSize: isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl',
    px: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-4 sm:px-6 lg:px-8',
    pb: isMobile ? 'pb-12' : isTablet ? 'pb-16' : 'pb-20',
    mb: isMobile ? 'mb-6' : 'mb-8',
  }), [isMobile, isTablet]);

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8B5E3C] border-t-transparent rounded-full animate-spin mx-auto mb-4" role="status" aria-label="Loading" />
          <p className="text-[#2C2C2C]">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={rtlStyles}>
      <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>

        {/* Page Header */}
        <div className={`${responsiveClasses.mb} flex justify-between items-center`}>
          <div>
            <h1 className={`${responsiveClasses.headerSize} text-[#2C2C2C] mb-1`} style={{ fontFamily: 'Playfair Display, serif' }}>
              {t.title}
            </h1>
            <p className="text-sm text-[#2C2C2C]/70">
              {isMobile ? t.mobileSubtitle : t.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className={`${isMobile ? 'w-10 h-10' : 'h-11 px-5 gap-2'
              } rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors text-white flex items-center justify-center`}
            aria-label={t.addCategory}
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            {!isMobile && <span className="text-sm">{t.addCategory}</span>}
          </button>
        </div>

        {/* Global Error with Retry */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" role="alert">
            <span>{error}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchCategories(0, pagination.limit, false)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md transition-colors text-red-700 text-xs"
              >
                {t.retry}
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className={`grid ${responsiveClasses.gridCols} gap-5 auto-rows-fr mb-8`}>
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  t={t}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-[#2C2C2C] text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          /* Empty state */
          !loading && !error && (
            <div className="text-center py-20 text-[#2C2C2C]/50">
              <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p className="mb-4">No categories yet. Add one to get started.</p>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white transition-colors text-sm inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t.addCategory}
              </button>
            </div>
          )
        )}
      </div>

      {/* Add Category Modal */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={t.addNew}
        onSubmit={handleAddCategory}
        formData={formData}
        onFormChange={handleInputChange}
        onImageChange={handleImageChange}
        onImageRemove={handleImageRemove}
        imagePreview={imagePreview}
        formErrors={formErrors}
        submitAttempted={submitAttempted}
        error={error}
        loading={loading}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
        isMobile={isMobile}
      />

      {/* Edit Category Modal */}
      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCategory(null);
          resetForm();
        }}
        title={t.editCategory}
        onSubmit={handleEditCategory}
        formData={formData}
        onFormChange={handleInputChange}
        onImageChange={handleImageChange}
        onImageRemove={handleImageRemove}
        imagePreview={imagePreview}
        formErrors={formErrors}
        submitAttempted={submitAttempted}
        error={error}
        loading={loading}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
        isMobile={isMobile}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        categoryName={categoryToDelete?.name || ''}
        loading={deleteLoading}
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