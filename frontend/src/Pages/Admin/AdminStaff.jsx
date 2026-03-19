import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, ChevronDown, Mail, Shield, Calendar, User, Award, AlertTriangle, Eye, Loader } from 'lucide-react';
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

// ─── Role Badge Component ────────────────────────────────────────────────────
const RoleBadge = ({ role, t }) => {
  const getRoleColor = () => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'staff':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = () => {
    switch (role?.toLowerCase()) {
      case 'super_admin':
        return <Award className="w-3 h-3 mr-1" />;
      default:
        return <User className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
      {getRoleIcon()}
      {t.roles[role?.toLowerCase()] || role}
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

// ─── View Staff Modal ────────────────────────────────────────────────────────
const ViewStaffModal = ({
  isOpen,
  onClose,
  staff,
  t,
  language,
  rtlStyles
}) => {
  if (!isOpen || !staff) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={rtlStyles}>
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-[#2C2C2C]/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#2C2C2C]" style={{ fontFamily: 'Playfair Display, serif' }}>
            {t.staffDetails}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2C2C2C]/5 transition-colors"
          >
            <X className="w-5 h-5 text-[#2C2C2C]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#8B5E3C]/10 flex items-center justify-center">
                {staff.role === 'super_admin' ? (
                  <Award className="w-10 h-10 text-[#8B5E3C]" />
                ) : (
                  <User className="w-10 h-10 text-[#8B5E3C]" />
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <p className="text-sm text-[#2C2C2C]/70 mb-1">{t.email}</p>
              <div className="flex items-center gap-2 p-3 bg-[#F5F1E8] rounded-lg">
                <Mail className="w-4 h-4 text-[#8B5E3C]" />
                <span className="text-sm text-[#2C2C2C]">{staff.email}</span>
              </div>
            </div>

            {/* Role */}
            <div>
              <p className="text-sm text-[#2C2C2C]/70 mb-1">{t.role}</p>
              <div className="p-3 bg-[#F5F1E8] rounded-lg">
                <RoleBadge role={staff.role} t={t} />
              </div>
            </div>

            {/* ID */}
            <div>
              <p className="text-sm text-[#2C2C2C]/70 mb-1">{t.staffId}</p>
              <p className="text-sm text-[#2C2C2C] p-3 bg-[#F5F1E8] rounded-lg">#{staff.id}</p>
            </div>

            {/* Created At */}
            <div>
              <p className="text-sm text-[#2C2C2C]/70 mb-1">{t.joined}</p>
              <div className="flex items-center gap-2 p-3 bg-[#F5F1E8] rounded-lg">
                <Calendar className="w-4 h-4 text-[#8B5E3C]" />
                <span className="text-sm text-[#2C2C2C]">{formatDate(staff.created_at, language)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#2C2C2C]/10 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-[#2C2C2C]/10 hover:bg-[#2C2C2C]/5 transition-colors text-sm text-[#2C2C2C]"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Staff Modal (Add/Edit) ───────────────────────────────────────────────────
const StaffModal = ({
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
      <div className={`bg-white rounded-xl shadow-2xl w-full ${isMobile ? 'max-w-full mx-4' : 'max-w-md'} max-h-[90vh] overflow-y-auto`} style={rtlStyles}>
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
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.email} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder={t.emailPlaceholder}
                className={`w-full h-10 px-3 rounded-lg bg-white border ${submitAttempted && formErrors?.email ? 'border-red-500' : 'border-[#2C2C2C]/10'
                  } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                required
              />
              {submitAttempted && formErrors?.email && (
                <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
              )}
            </div>

            {/* Role - Only super_admin and staff as per API */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.role} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role || ''}
                  onChange={handleChange}
                  className={`w-full h-10 px-3 rounded-lg bg-white border ${submitAttempted && formErrors?.role ? 'border-red-500' : 'border-[#2C2C2C]/10'
                    } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm appearance-none ${language === 'ar' ? 'text-right' : 'text-left'
                    }`}
                  required
                >
                  <option value="">{t.selectRole}</option>
                  <option value="super_admin">{t.roles.super_admin}</option>
                  <option value="staff">{t.roles.staff}</option>
                </select>
                <ChevronDown className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40 pointer-events-none`} />
              </div>
              {submitAttempted && formErrors?.role && (
                <p className="mt-1 text-xs text-red-500">{formErrors.role}</p>
              )}
            </div>

            {/* Password (only for add/edit) */}
            <div>
              <label className="text-sm text-[#2C2C2C]/70 mb-1 block">
                {t.password} {!formData.id && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                placeholder={t.passwordPlaceholder}
                className={`w-full h-10 px-3 rounded-lg bg-white border ${submitAttempted && formErrors?.password ? 'border-red-500' : 'border-[#2C2C2C]/10'
                  } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                required={!formData.id}
              />
              {submitAttempted && formErrors?.password && (
                <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
              )}
              {formData.id && (
                <p className="mt-1 text-xs text-[#2C2C2C]/50">{t.passwordLeaveBlank}</p>
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
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : (title === t.addNewStaff ? t.add : t.save)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Staff Card Component ─────────────────────────────────────────────────────
const StaffCard = ({ staff, t, language, onView, onEdit, onDelete }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header with avatar and actions */}
          <div className="flex items-start justify-between mt-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[#8B5E3C]/10 flex items-center justify-center shrink-0">
                {staff.role === 'super_admin' ? (
                  <Award className="w-6 h-6 text-[#8B5E3C]" />
                ) : (
                  <User className="w-6 h-6 text-[#8B5E3C]" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#2C2C2C] truncate">{staff.email}</h3>
                <p className="text-xs text-[#2C2C2C]/70">ID: {staff.id}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                onClick={() => onView(staff)}
                className="p-2 hover:bg-[#2C2C2C]/5 rounded-lg transition-colors"
                title={t.view}
              >
                <Eye className="w-4 h-4 text-[#2C2C2C]/70" />
              </button>
              <button
                onClick={() => onEdit(staff)}
                className="p-2 hover:bg-[#2C2C2C]/5 rounded-lg transition-colors"
                title={t.edit}
              >
                <Edit2 className="w-4 h-4 text-[#2C2C2C]/70" />
              </button>
              <button
                onClick={() => onDelete(staff)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title={t.delete}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="w-4 h-4 text-[#2C2C2C]/40 shrink-0" />
              <span className="text-sm text-[#2C2C2C] truncate">{staff.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#2C2C2C]/40 shrink-0" />
              <span className="text-sm text-[#2C2C2C]">{t.joined} {formatDate(staff.created_at, language)}</span>
            </div>
          </div>

          {/* Role Badge */}
          <div className="pt-2">
            <RoleBadge role={staff.role} t={t} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminStaff() {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAdmin();

  // ─── State Management ──────────────────────────────────────────────────────
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected items
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staffToDelete, setStaffToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Pagination
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    hasMore: true
  });

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ─── Content Dictionary ─────────────────────────────────────────────────────
  const content = useMemo(() => ({
    en: {
      title: 'Staff & Admins',
      subtitle: 'Manage staff accounts and permissions',
      searchPlaceholder: 'Search by email or ID...',
      noStaff: 'No staff members found',
      addStaff: 'Add Staff',
      editStaff: 'Edit Staff Member',
      addNewStaff: 'Add New Staff Member',
      deleteConfirm: 'Are you sure you want to delete this staff member?',
      allStaff: 'All Staff Members',
      joined: 'Joined',
      email: 'Email',
      emailPlaceholder: 'Enter email address',
      role: 'Role',
      selectRole: 'Select role',
      password: 'Password',
      passwordPlaceholder: 'Enter password',
      passwordLeaveBlank: 'Leave blank to keep current password',
      cancel: 'Cancel',
      add: 'Add Staff',
      save: 'Save Changes',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      view: 'View',
      staffDetails: 'Staff Details',
      staffId: 'Staff ID',
      close: 'Close',
      confirmDelete: 'Delete Staff Member',
      deleteWarning: 'This action cannot be undone.',
      loadMore: 'Load More',
      retry: 'Retry',
      roles: {
        super_admin: 'Super Admin',
        staff: 'Staff'
      },
      tableHeaders: {
        email: 'Email',
        role: 'Role',
        id: 'ID',
        joined: 'Joined',
        actions: 'Actions'
      },
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      roleRequired: 'Role is required',
      roleInvalid: 'Role must be either Super Admin or Staff',
      passwordRequired: 'Password is required',
      passwordMinLength: 'Password must be at least 6 characters',
    },
    ar: {
      title: 'الموظفين والمدراء',
      subtitle: 'إدارة حسابات الموظفين والصلاحيات',
      searchPlaceholder: 'البحث بالبريد الإلكتروني أو الرقم...',
      noStaff: 'لم يتم العثور على موظفين',
      addStaff: 'إضافة موظف',
      editStaff: 'تعديل بيانات الموظف',
      addNewStaff: 'إضافة موظف جديد',
      deleteConfirm: 'هل أنت متأكد من حذف هذا الموظف؟',
      allStaff: 'جميع الموظفين',
      joined: 'تاريخ الانضمام',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'أدخل البريد الإلكتروني',
      role: 'الدور',
      selectRole: 'اختر الدور',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      passwordLeaveBlank: 'اترك فارغاً للاحتفاظ بكلمة المرور الحالية',
      cancel: 'إلغاء',
      add: 'إضافة موظف',
      save: 'حفظ التغييرات',
      edit: 'تعديل',
      delete: 'حذف',
      deleting: 'جاري الحذف...',
      view: 'عرض',
      staffDetails: 'تفاصيل الموظف',
      staffId: 'رقم الموظف',
      close: 'إغلاق',
      confirmDelete: 'حذف الموظف',
      deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
      loadMore: 'تحميل المزيد',
      retry: 'إعادة المحاولة',
      roles: {
        super_admin: 'مدير عام',
        staff: 'موظف'
      },
      tableHeaders: {
        email: 'البريد الإلكتروني',
        role: 'الدور',
        id: 'الرقم',
        joined: 'تاريخ الانضمام',
        actions: 'الإجراءات'
      },
      emailRequired: 'البريد الإلكتروني مطلوب',
      emailInvalid: 'يرجى إدخال بريد إلكتروني صحيح',
      roleRequired: 'الدور مطلوب',
      roleInvalid: 'يجب أن يكون الدور إما مدير عام أو موظف',
      passwordRequired: 'كلمة المرور مطلوبة',
      passwordMinLength: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
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

  // ─── Fetch Staff ───────────────────────────────────────────────────────────
  const fetchStaff = useCallback(async (skip = 0, limit = 20, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/api/v1/admins/?skip=${skip}&limit=${limit}`);

      if (Array.isArray(data)) {
        setStaff(prev => append ? [...prev, ...data] : data);
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
    fetchStaff(0, pagination.limit, false);
  }, []);

  // ─── Search with debounce ──────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff(0, pagination.limit, false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, fetchStaff, pagination.limit]);

  // ─── Load More ─────────────────────────────────────────────────────────────
  const handleLoadMore = useCallback(() => {
    if (!loading && pagination.hasMore) {
      fetchStaff(pagination.skip, pagination.limit, true);
    }
  }, [fetchStaff, pagination.skip, pagination.limit, pagination.hasMore, loading]);

  // ─── Form Validation ───────────────────────────────────────────────────────
  const validateForm = useCallback((isEdit = false) => {
    const errors = {};

    // Email validation
    if (!formData.email?.trim()) {
      errors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t.emailInvalid;
    }

    // Role validation - only super_admin or staff are accepted
    if (!formData.role) {
      errors.role = t.roleRequired;
    } else if (!['super_admin', 'staff'].includes(formData.role)) {
      errors.role = t.roleInvalid;
    }

    // Password validation (only required for new staff)
    if (!isEdit && !formData.password) {
      errors.password = t.passwordRequired;
    } else if (!isEdit && formData.password && formData.password.length < 6) {
      errors.password = t.passwordMinLength;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, t]);

  // ─── Reset Form ────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      role: '',
      password: ''
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

  // ─── Add Staff ─────────────────────────────────────────────────────────────
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm(false)) return;

    setLoading(true);
    setError(null);
    try {
      const newStaff = await apiFetch('/api/v1/admins/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });

      setStaff(prev => [newStaff, ...prev]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Edit Staff ────────────────────────────────────────────────────────────
  const handleEditStaff = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setSubmitAttempted(true);

    if (!validateForm(true)) return;

    setLoading(true);
    setError(null);
    try {
      // Only include password if it's provided
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const updated = await apiFetch(`/api/v1/admins/${selectedStaff.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      setStaff(prev => prev.map(s => s.id === selectedStaff.id ? updated : s));
      setIsEditModalOpen(false);
      setSelectedStaff(null);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSubmitAttempted(false);
    }
  };

  // ─── Delete Staff ──────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((staff) => {
    setStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!staffToDelete) return;

    setDeleteLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/admins/${staffToDelete.id}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.id !== staffToDelete.id));
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  }, [staffToDelete, apiFetch]);

  // ─── Open View Modal ───────────────────────────────────────────────────────
  const openViewModal = useCallback((staff) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  }, []);

  // ─── Open Edit Modal ───────────────────────────────────────────────────────
  const openEditModal = useCallback((staff) => {
    setSelectedStaff(staff);
    setFormData({
      email: staff.email || '',
      role: staff.role || '',
      password: ''
    });
    setIsEditModalOpen(true);
  }, []);

  // ─── Filtered Staff ────────────────────────────────────────────────────────
  const filteredStaff = useMemo(() => {
    if (!searchTerm.trim()) return staff;

    const term = searchTerm.toLowerCase();
    return staff.filter(member =>
      member.email?.toLowerCase().includes(term) ||
      member.id?.toString().includes(term)
    );
  }, [staff, searchTerm]);

  // ─── Responsive Classes ────────────────────────────────────────────────────
  const responsiveClasses = useMemo(() => ({
    headerSize: isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl',
    px: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-4 sm:px-6 lg:px-8',
    pb: isMobile ? 'pb-12' : isTablet ? 'pb-16' : 'pb-20',
    mb: isMobile ? 'mb-6' : 'mb-8',
  }), [isMobile, isTablet]);

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading && staff.length === 0) {
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
      {/* Modals */}
      <ViewStaffModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
        t={t}
        language={language}
        rtlStyles={rtlStyles}
      />

      <StaffModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        title={t.addNewStaff}
        onSubmit={handleAddStaff}
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

      <StaffModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStaff(null);
          resetForm();
        }}
        title={t.editStaff}
        onSubmit={handleEditStaff}
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
          setStaffToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={staffToDelete?.email || ''}
        loading={deleteLoading}
        t={t}
        rtlStyles={rtlStyles}
      />

      <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
        {/* Header */}
        <div className={`${responsiveClasses.mb} flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4`}>
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
            className={`${isMobile ? 'w-full' : 'h-11 px-5'} py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors text-sm text-white flex items-center justify-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            {t.addStaff}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className={`relative ${!isMobile && 'max-w-md'}`}>
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
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => {
                setError(null);
                fetchStaff(0, pagination.limit, false);
              }}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-red-700 text-xs"
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* Staff Count */}
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[#2C2C2C]">
            {t.allStaff} ({filteredStaff.length})
          </h2>
        </div>

        {/* Staff Grid */}
        {filteredStaff.length > 0 ? (
          <>
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} gap-4`}>
              {filteredStaff.map((member) => (
                <StaffCard
                  key={member.id}
                  staff={member}
                  t={t}
                  language={language}
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="flex justify-center mt-8">
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
          </>
        ) : (
          !loading && (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-[#2C2C2C]/70">{t.noStaff}</p>
              </CardContent>
            </Card>
          )
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