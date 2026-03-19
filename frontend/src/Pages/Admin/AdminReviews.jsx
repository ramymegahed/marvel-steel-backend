import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, X, MessageSquare, User,
  Calendar, AlertTriangle, Loader, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';
import { useAdmin } from '../../Components/Context/AdminContext';
import { BASE_URL } from '../../App';

// ─── Card Component ──────────────────────────────────────────────────────────
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
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 animate-fade-in"
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

// ─── Review Modal Component ───────────────────────────────────────────────────
const ReviewModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  formData,
  onFormChange,
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
    const { name, value } = e.target;
    onFormChange(name, value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${isMobile ? 'max-w-full mx-4' : 'max-w-md'} max-h-[90vh] overflow-hidden`} style={rtlStyles}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5 transition-colors"
          >
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Customer Name */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.customerName}
              </label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name || ''}
                onChange={handleChange}
                placeholder={t.customerNamePlaceholder}
                className={`w-full h-10 px-3 rounded-lg bg-white border ${submitAttempted && formErrors?.customer_name ? 'border-red-500' : 'border-[#2C2C2C]/10'
                  } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                required
              />
              {submitAttempted && formErrors?.customer_name && (
                <p className="mt-1 text-xs text-red-500">{formErrors.customer_name}</p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.comment}
              </label>
              <textarea
                name="comment"
                value={formData.comment || ''}
                onChange={handleChange}
                placeholder={t.commentPlaceholder}
                rows={4}
                className={`w-full px-3 py-2 rounded-lg bg-white border ${submitAttempted && formErrors?.comment ? 'border-red-500' : 'border-[#2C2C2C]/10'
                  } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm resize-none`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                required
              />
              {submitAttempted && formErrors?.comment && (
                <p className="mt-1 text-xs text-red-500">{formErrors.comment}</p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
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
              className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : (title === t.addNewReview ? t.add : t.save)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Review Card Component for Mobile ────────────────────────────────────────
const ReviewCard = ({ review, t, language, onEdit, onDelete }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="space-y-4">
        {/* Header with customer info and actions */}
        <div className="flex items-start justify-between mt-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#2C2C2C]/40" />
              <h3 className="font-semibold text-[#2C2C2C] truncate">{review.customer_name}</h3>
            </div>
            <p className="text-xs text-[#2C2C2C]/70 mt-1">ID: {review.id}</p>
          </div>
          <div className="flex gap-1 shrink-0 mr-2">
            <button
              onClick={() => onEdit(review)}
              className="p-2 hover:bg-[#2C2C2C]/5 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-[#2C2C2C]/70" />
            </button>
            <button
              onClick={() => onDelete(review)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>

        {/* Comment */}
        <p className="text-sm text-[#2C2C2C]/80 italic line-clamp-3">
          "{review.comment}"
        </p>

        {/* Date */}
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-[#2C2C2C]/40" />
          <span className="text-xs text-[#2C2C2C]/70">{formatDate(review.created_at, language)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Review Card Component for Desktop/Tablet ────────────────────────────────
const ReviewTabletDesktopCard = ({ review, t, language, onEdit, onDelete }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mt-5">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header with customer */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#2C2C2C]/40" />
                <h3 className="font-semibold text-[#2C2C2C]">{review.customer_name}</h3>
              </div>
              <p className="text-xs text-[#2C2C2C]/70 mt-1">ID: {review.id}</p>
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm text-[#2C2C2C]/80 italic line-clamp-3">
            "{review.comment}"
          </p>

          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-[#2C2C2C]/40" />
            <span className="text-xs text-[#2C2C2C]/70">{formatDate(review.created_at, language)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
          <button
            onClick={() => onEdit(review)}
            className="p-2 hover:bg-[#2C2C2C]/5 rounded-lg transition-colors"
            title={t.edit}
          >
            <Edit2 className="w-4 h-4 text-[#2C2C2C]/70" />
          </button>
          <button
            onClick={() => onDelete(review)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title={t.delete}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Stats Card Component ────────────────────────────────────────────────────
const StatsCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-start justify-between mt-5">
        <div>
          <p className="text-sm text-[#2C2C2C]/70">{title}</p>
          <p className="text-2xl font-bold text-[#2C2C2C] mt-1">{value}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-[#8B5E3C]/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#8B5E3C]" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminReviews() {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAdmin();

  // ─── State Management ──────────────────────────────────────────────────────
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected items
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    comment: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
      title: 'Reviews',
      subtitle: 'Manage customer reviews and feedback',
      searchPlaceholder: 'Search by customer name or comment...',
      mobileSearchPlaceholder: 'Search reviews...',
      noReviews: 'No reviews found',
      addReview: 'Add Review',
      editReview: 'Edit Review',
      addNewReview: 'Add New Review',
      deleteConfirm: 'Are you sure you want to delete this review?',
      totalReviews: 'Total Reviews',
      allReviews: 'All Reviews',
      customerName: 'Customer Name *',
      customerNamePlaceholder: 'Enter customer name',
      comment: 'Comment *',
      commentPlaceholder: 'Enter review comment',
      cancel: 'Cancel',
      add: 'Add Review',
      save: 'Save Changes',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      confirmDelete: 'Delete Review',
      deleteWarning: 'This action cannot be undone.',
      loading: 'Loading...',
      retry: 'Retry',
      nameRequired: 'Customer name is required',
      commentRequired: 'Comment is required',
      loadMore: 'Load More',
      showing: 'Showing',
      of: 'of',
      reviews: 'reviews'
    },
    ar: {
      title: 'التقييمات',
      subtitle: 'إدارة تقييمات العملاء وملاحظاتهم',
      searchPlaceholder: 'البحث باسم العميل أو التعليق...',
      mobileSearchPlaceholder: 'البحث في التقييمات...',
      noReviews: 'لم يتم العثور على تقييمات',
      addReview: 'إضافة تقييم',
      editReview: 'تعديل التقييم',
      addNewReview: 'إضافة تقييم جديد',
      deleteConfirm: 'هل أنت متأكد من حذف هذا التقييم؟',
      totalReviews: 'إجمالي التقييمات',
      allReviews: 'جميع التقييمات',
      customerName: 'اسم العميل *',
      customerNamePlaceholder: 'أدخل اسم العميل',
      comment: 'التعليق *',
      commentPlaceholder: 'أدخل تعليق التقييم',
      cancel: 'إلغاء',
      add: 'إضافة تقييم',
      save: 'حفظ التغييرات',
      edit: 'تعديل',
      delete: 'حذف',
      deleting: 'جاري الحذف...',
      confirmDelete: 'حذف التقييم',
      deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
      loading: 'جاري التحميل...',
      retry: 'إعادة المحاولة',
      nameRequired: 'اسم العميل مطلوب',
      commentRequired: 'التعليق مطلوب',
      loadMore: 'تحميل المزيد',
      showing: 'عرض',
      of: 'من',
      reviews: 'تقييمات'
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

  // ─── Fetch Reviews (GET) ───────────────────────────────────────────────────
  const fetchReviews = useCallback(async (skip = 0, limit = 10, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/v1/admin/reviews/?skip=${skip}&limit=${limit}`);

      if (Array.isArray(data)) {
        setReviews(prev => append ? [...prev, ...data] : data);
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

  // Initial fetch
  useEffect(() => {
    fetchReviews(0, pagination.limit, false);
  }, []);

  // ─── Load More ─────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchReviews(pagination.skip, pagination.limit, true);
    }
  }, [fetchReviews, pagination.skip, pagination.limit, pagination.hasMore, loading]);

  // ─── Form Validation ───────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.customer_name?.trim()) {
      errors.customer_name = t.nameRequired;
    }
    if (!formData.comment?.trim()) {
      errors.comment = t.commentRequired;
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.customer_name, formData.comment, t.nameRequired, t.commentRequired]);

  // ─── Reset Form ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({
      customer_name: '',
      comment: ''
    });
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

  // ─── Add Review (POST) ─────────────────────────────────────────────────────
  const handleAddReview = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const newReview = await apiFetch('/api/v1/admin/reviews/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setReviews(prev => [newReview, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Edit Review (PUT) ─────────────────────────────────────────────────────
  const handleEditReview = async (e) => {
    e.preventDefault();
    if (!selectedReview) return;

    setSubmitAttempted(true);
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    try {
      const updatedReview = await apiFetch(`/api/v1/admin/reviews/${selectedReview.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      setReviews(prev => prev.map(r => r.id === selectedReview.id ? updatedReview : r));
      setIsEditModalOpen(false);
      setSelectedReview(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Delete Review (DELETE) ────────────────────────────────────────────────
  const handleDeleteClick = useCallback((review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!reviewToDelete) return;

    setDeleteLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/admin/reviews/${reviewToDelete.id}`, { method: 'DELETE' });
      setReviews(prev => prev.filter(r => r.id !== reviewToDelete.id));
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }, [reviewToDelete, apiFetch]);

  // ─── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = useCallback((review) => {
    setSelectedReview(review);
    setFormData({
      customer_name: review.customer_name || '',
      comment: review.comment || ''
    });
    setIsEditModalOpen(true);
  }, []);

  // ─── Filter Reviews ────────────────────────────────────────────────────────
  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) return reviews;

    const term = searchTerm.toLowerCase();
    return reviews.filter(review =>
      review.customer_name?.toLowerCase().includes(term) ||
      review.comment?.toLowerCase().includes(term) ||
      review.id?.toString().includes(term)
    );
  }, [reviews, searchTerm]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: reviews.length
  }), [reviews]);

  // ─── Responsive Classes ────────────────────────────────────────────────────
  const responsiveClasses = useMemo(() => ({
    gridCols: isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    headerSize: isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl',
    px: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-4 sm:px-6 lg:px-8',
    pb: isMobile ? 'pb-12' : isTablet ? 'pb-16' : 'pb-20',
    mb: isMobile ? 'mb-6' : 'mb-8',
  }), [isMobile, isTablet]);

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading && reviews.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#8B5E3C] mx-auto mb-4" />
          <p className="text-[#2C2C2C]">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ─── Mobile Layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={rtlStyles}>
        <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
          {/* Header */}
          <div className={`${responsiveClasses.mb} flex justify-between items-center`}>
            <div>
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
            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="w-10 h-10 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors flex items-center justify-center shrink-0"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Stats Card */}
          <div className="mb-4">
            <StatsCard title={t.totalReviews} value={stats.total} />
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.mobileSearchPlaceholder}
                className={`w-full h-10 ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Reviews Count */}
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-[#2C2C2C]">
              {t.allReviews} ({filteredReviews.length})
            </h2>
          </div>

          {/* Reviews Cards */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/20" />
                  <p className="text-[#2C2C2C]/70">{t.noReviews}</p>
                </CardContent>
              </Card>
            ) : (
              filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  t={t}
                  language={language}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>

          {/* Load More */}
          {pagination.hasMore && filteredReviews.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-[#2C2C2C] text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  t.loadMore
                )}
              </button>
            </div>
          )}
        </div>

        {/* Modals */}
        <ReviewModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            resetForm();
          }}
          title={t.addNewReview}
          onSubmit={handleAddReview}
          formData={formData}
          onFormChange={handleInputChange}
          formErrors={formErrors}
          submitAttempted={submitAttempted}
          error={error}
          loading={loading}
          t={t}
          rtlStyles={rtlStyles}
          language={language}
          isMobile={isMobile}
        />

        <ReviewModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedReview(null);
            resetForm();
          }}
          title={t.editReview}
          onSubmit={handleEditReview}
          formData={formData}
          onFormChange={handleInputChange}
          formErrors={formErrors}
          submitAttempted={submitAttempted}
          error={error}
          loading={loading}
          t={t}
          rtlStyles={rtlStyles}
          language={language}
          isMobile={isMobile}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setReviewToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          itemName={reviewToDelete?.customer_name || ''}
          loading={deleteLoading}
          t={t}
          rtlStyles={rtlStyles}
        />
      </div>
    );
  }

  // ─── Desktop and Tablet Layout ─────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={rtlStyles}>
      <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
        {/* Header */}
        <div className={`${responsiveClasses.mb} flex justify-between items-center`}>
          <div>
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
          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="h-11 px-5 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors text-sm text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t.addReview}
          </button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard title={t.totalReviews} value={stats.total} />
        </div>

        {/* Search */}
        <div className="mb-5">
          <Card>
            <CardContent className="p-4 ">
              <div className="relative mt-5">
                <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className={`w-full h-10 ${language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} rounded-lg bg-white border border-[#2C2C2C]/10 focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Reviews Count */}
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-[#2C2C2C]">
            {t.allReviews} ({filteredReviews.length})
          </h2>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredReviews.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 sm:p-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[#2C2C2C]/20 mt-5" />
                  <p className="text-[#2C2C2C]/70">{t.noReviews}</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <ReviewTabletDesktopCard
                key={review.id}
                review={review}
                t={t}
                language={language}
                onEdit={openEditModal}
                onDelete={handleDeleteClick}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {pagination.hasMore && filteredReviews.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 text-[#2C2C2C] text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {t.loading}
                </>
              ) : (
                t.loadMore
              )}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReviewModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={t.addNewReview}
        onSubmit={handleAddReview}
        formData={formData}
        onFormChange={handleInputChange}
        formErrors={formErrors}
        submitAttempted={submitAttempted}
        error={error}
        loading={loading}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
        isMobile={isMobile}
      />

      <ReviewModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReview(null);
          resetForm();
        }}
        title={t.editReview}
        onSubmit={handleEditReview}
        formData={formData}
        onFormChange={handleInputChange}
        formErrors={formErrors}
        submitAttempted={submitAttempted}
        error={error}
        loading={loading}
        t={t}
        rtlStyles={rtlStyles}
        language={language}
        isMobile={isMobile}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={reviewToDelete?.customer_name || ''}
        loading={deleteLoading}
        t={t}
        rtlStyles={rtlStyles}
      />

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