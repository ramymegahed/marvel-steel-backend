import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Check, Phone, Truck, MessageSquare, Loader, AlertCircle } from 'lucide-react';
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

// ─── Settings Input Component ────────────────────────────────────────────────
const SettingsInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon: Icon,
  error,
  language
}) => (
  <div className="w-full">
    <label className="text-sm text-[#2C2C2C]/70 mb-1.5 block">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-[#2C2C2C]/40`} />
      )}
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 ${Icon ? (language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3') : (language === 'ar' ? 'pr-3 pl-3' : 'pl-3 pr-3')
          } rounded-lg bg-white border ${error ? 'border-red-500' : 'border-[#2C2C2C]/10'
          } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      />
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-500">{error}</p>
    )}
  </div>
);

// ─── Settings Textarea Component ─────────────────────────────────────────────
const SettingsTextarea = ({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
  icon: Icon,
  error,
  language
}) => (
  <div className="w-full">
    <label className="text-sm text-[#2C2C2C]/70 mb-1.5 block">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-3 w-4 h-4 text-[#2C2C2C]/40`} />
      )}
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full ${Icon ? (language === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3') : (language === 'ar' ? 'pr-3 pl-3' : 'pl-3 pr-3')
          } py-2 rounded-lg bg-white border ${error ? 'border-red-500' : 'border-[#2C2C2C]/10'
          } focus:outline-none focus:border-[#8B5E3C] transition-colors text-sm resize-none`}
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      />
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-500">{error}</p>
    )}
  </div>
);

// ─── Settings Section Component ──────────────────────────────────────────────
const SettingsSection = ({ title, children, lastUpdated }) => (
  <Card className="mb-6">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {lastUpdated && (
          <p className="text-xs text-[#2C2C2C]/50">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-5">
        {children}
      </div>
    </CardContent>
  </Card>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminSettings() {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAdmin();

  // ─── State Management ──────────────────────────────────────────────────────
  const [settings, setSettings] = useState({
    vodafone_cash_number: '',
    instapay_number: '',
    whatsapp_number: '',
    delivery_time: '',
    order_confirmation_message: '',
    id: null,
    updated_at: null
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Responsive
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // ─── Content Dictionary ─────────────────────────────────────────────────────
  const content = useMemo(() => ({
    en: {
      title: 'Settings',
      subtitle: 'Configure your store settings',
      saveSettings: 'Save Settings',
      saving: 'Saving...',
      savedSuccess: 'Settings saved successfully!',
      loading: 'Loading settings...',
      error: 'Failed to load settings',
      retry: 'Retry',
      sections: {
        payment: 'Payment Settings',
        contact: 'Contact Settings',
        order: 'Order Settings'
      },
      labels: {
        vodafone_cash: 'Vodafone Cash Number',
        vodafone_cash_placeholder: 'Enter Vodafone Cash number',
        instapay: 'Instapay Number/Username',
        instapay_placeholder: 'Enter Instapay number or username',
        whatsapp: 'WhatsApp Number',
        whatsapp_placeholder: 'Enter WhatsApp number with country code',
        delivery_time: 'Delivery Time',
        delivery_time_placeholder: 'e.g., 3-5 business days',
        order_confirmation: 'Order Confirmation Message',
        order_confirmation_placeholder: 'Enter the message sent to customers after order confirmation'
      },
      errors: {
        vodafone_cash_required: 'Vodafone Cash number is required',
        instapay_required: 'Instapay number is required',
        whatsapp_required: 'WhatsApp number is required',
        delivery_time_required: 'Delivery time is required',
        order_confirmation_required: 'Order confirmation message is required'
      }
    },
    ar: {
      title: 'الإعدادات',
      subtitle: 'تكوين إعدادات المتجر',
      saveSettings: 'حفظ الإعدادات',
      saving: 'جاري الحفظ...',
      savedSuccess: 'تم حفظ الإعدادات بنجاح!',
      loading: 'جاري تحميل الإعدادات...',
      error: 'فشل تحميل الإعدادات',
      retry: 'إعادة المحاولة',
      sections: {
        payment: 'إعدادات الدفع',
        contact: 'إعدادات الاتصال',
        order: 'إعدادات الطلبات'
      },
      labels: {
        vodafone_cash: 'رقم فودافون كاش',
        vodafone_cash_placeholder: 'أدخل رقم فودافون كاش',
        instapay: 'رقم/اسم مستخدم إنستاباي',
        instapay_placeholder: 'أدخل رقم أو اسم مستخدم إنستاباي',
        whatsapp: 'رقم الواتساب',
        whatsapp_placeholder: 'أدخل رقم الواتساب مع رمز الدولة',
        delivery_time: 'وقت التوصيل',
        delivery_time_placeholder: 'مثال: 3-5 أيام عمل',
        order_confirmation: 'رسالة تأكيد الطلب',
        order_confirmation_placeholder: 'أدخل الرسالة المرسلة للعملاء بعد تأكيد الطلب'
      },
      errors: {
        vodafone_cash_required: 'رقم فودافون كاش مطلوب',
        instapay_required: 'رقم إنستاباي مطلوب',
        whatsapp_required: 'رقم الواتساب مطلوب',
        delivery_time_required: 'وقت التوصيل مطلوب',
        order_confirmation_required: 'رسالة تأكيد الطلب مطلوبة'
      }
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

    return res.json();
  }, []);

  // ─── Fetch Settings ────────────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/v1/admin/settings/');
      setSettings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ─── Form Validation ───────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    const errors = {};

    if (!settings.vodafone_cash_number?.trim()) {
      errors.vodafone_cash_number = t.errors.vodafone_cash_required;
    }
    if (!settings.instapay_number?.trim()) {
      errors.instapay_number = t.errors.instapay_required;
    }
    if (!settings.whatsapp_number?.trim()) {
      errors.whatsapp_number = t.errors.whatsapp_required;
    }
    if (!settings.delivery_time?.trim()) {
      errors.delivery_time = t.errors.delivery_time_required;
    }
    if (!settings.order_confirmation_message?.trim()) {
      errors.order_confirmation_message = t.errors.order_confirmation_required;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [settings, t.errors]);

  // ─── Handle Input Change ───────────────────────────────────────────────────
  const handleInputChange = useCallback((field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [formErrors]);

  // ─── Handle Save ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);
    try {
      const updated = await apiFetch('/api/v1/admin/settings/', {
        method: 'PUT',
        body: JSON.stringify({
          vodafone_cash_number: settings.vodafone_cash_number,
          instapay_number: settings.instapay_number,
          whatsapp_number: settings.whatsapp_number,
          delivery_time: settings.delivery_time,
          order_confirmation_message: settings.order_confirmation_message
        })
      });

      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ─── Format last updated ───────────────────────────────────────────────────
  const lastUpdated = settings.updated_at
    ? formatDate(settings.updated_at, language)
    : null;

  // ─── Responsive Classes ────────────────────────────────────────────────────
  const responsiveClasses = useMemo(() => ({
    headerSize: isMobile ? 'text-2xl' : 'text-3xl sm:text-4xl',
    px: isMobile ? 'px-4' : isTablet ? 'px-6' : 'px-4 sm:px-6 lg:px-8',
    pb: isMobile ? 'pb-12' : isTablet ? 'pb-16' : 'pb-20',
    mb: isMobile ? 'mb-6' : 'mb-8',
  }), [isMobile, isTablet]);

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-[#8B5E3C] mx-auto mb-4" />
          <p className="text-[#2C2C2C]">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ─── Error State ───────────────────────────────────────────────────────────
  if (error && !settings.id) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-[#2C2C2C] mb-2">{t.error}</p>
            <p className="text-sm text-[#2C2C2C]/60 mb-6">{error}</p>
            <button
              onClick={fetchSettings}
              className="px-6 py-2 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 text-white transition-colors"
            >
              {t.retry}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Mobile Layout ─────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={{ overflowX: 'hidden', width: '100%', ...rtlStyles }}>
        <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
          {/* Header */}
          <div className={responsiveClasses.mb}>
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Payment Settings */}
            <SettingsSection title={t.sections.payment} lastUpdated={lastUpdated}>
              <SettingsInput
                label={t.labels.vodafone_cash}
                value={settings.vodafone_cash_number}
                onChange={(val) => handleInputChange('vodafone_cash_number', val)}
                placeholder={t.labels.vodafone_cash_placeholder}
                icon={Phone}
                error={formErrors.vodafone_cash_number}
                language={language}
              />
              <SettingsInput
                label={t.labels.instapay}
                value={settings.instapay_number}
                onChange={(val) => handleInputChange('instapay_number', val)}
                placeholder={t.labels.instapay_placeholder}
                icon={Phone}
                error={formErrors.instapay_number}
                language={language}
              />
            </SettingsSection>

            {/* Contact Settings */}
            <SettingsSection title={t.sections.contact}>
              <SettingsInput
                label={t.labels.whatsapp}
                value={settings.whatsapp_number}
                onChange={(val) => handleInputChange('whatsapp_number', val)}
                placeholder={t.labels.whatsapp_placeholder}
                icon={Phone}
                error={formErrors.whatsapp_number}
                language={language}
              />
            </SettingsSection>

            {/* Order Settings */}
            <SettingsSection title={t.sections.order}>
              <SettingsInput
                label={t.labels.delivery_time}
                value={settings.delivery_time}
                onChange={(val) => handleInputChange('delivery_time', val)}
                placeholder={t.labels.delivery_time_placeholder}
                icon={Truck}
                error={formErrors.delivery_time}
                language={language}
              />
              <SettingsTextarea
                label={t.labels.order_confirmation}
                value={settings.order_confirmation_message}
                onChange={(val) => handleInputChange('order_confirmation_message', val)}
                placeholder={t.labels.order_confirmation_placeholder}
                rows={4}
                icon={MessageSquare}
                error={formErrors.order_confirmation_message}
                language={language}
              />
            </SettingsSection>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors text-sm text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t.saveSettings}</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="fixed bottom-20 left-4 right-4 bg-green-600 text-white p-3 rounded-lg shadow-lg animate-fade-in-up flex items-center justify-center gap-2 z-50">
              <Check className="w-4 h-4 shrink-0" />
              <p className="text-sm">{t.savedSuccess}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Tablet Layout ─────────────────────────────────────────────────────────
  if (isTablet) {
    return (
      <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={rtlStyles}>
        <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
          {/* Header */}
          <div className={responsiveClasses.mb}>
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Payment Settings */}
            <SettingsSection title={t.sections.payment} lastUpdated={lastUpdated}>
              <div className="grid grid-cols-2 gap-4">
                <SettingsInput
                  label={t.labels.vodafone_cash}
                  value={settings.vodafone_cash_number}
                  onChange={(val) => handleInputChange('vodafone_cash_number', val)}
                  placeholder={t.labels.vodafone_cash_placeholder}
                  icon={Phone}
                  error={formErrors.vodafone_cash_number}
                  language={language}
                />
                <SettingsInput
                  label={t.labels.instapay}
                  value={settings.instapay_number}
                  onChange={(val) => handleInputChange('instapay_number', val)}
                  placeholder={t.labels.instapay_placeholder}
                  icon={Phone}
                  error={formErrors.instapay_number}
                  language={language}
                />
              </div>
            </SettingsSection>

            {/* Contact Settings */}
            <SettingsSection title={t.sections.contact}>
              <div className="grid grid-cols-1 max-w-md">
                <SettingsInput
                  label={t.labels.whatsapp}
                  value={settings.whatsapp_number}
                  onChange={(val) => handleInputChange('whatsapp_number', val)}
                  placeholder={t.labels.whatsapp_placeholder}
                  icon={Phone}
                  error={formErrors.whatsapp_number}
                  language={language}
                />
              </div>
            </SettingsSection>

            {/* Order Settings */}
            <SettingsSection title={t.sections.order}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 max-w-md">
                  <SettingsInput
                    label={t.labels.delivery_time}
                    value={settings.delivery_time}
                    onChange={(val) => handleInputChange('delivery_time', val)}
                    placeholder={t.labels.delivery_time_placeholder}
                    icon={Truck}
                    error={formErrors.delivery_time}
                    language={language}
                  />
                </div>
                <SettingsTextarea
                  label={t.labels.order_confirmation}
                  value={settings.order_confirmation_message}
                  onChange={(val) => handleInputChange('order_confirmation_message', val)}
                  placeholder={t.labels.order_confirmation_placeholder}
                  rows={4}
                  icon={MessageSquare}
                  error={formErrors.order_confirmation_message}
                  language={language}
                />
              </div>
            </SettingsSection>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-12 px-8 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors text-sm text-white flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>{t.saving}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{t.saveSettings}</span>
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up flex items-center gap-2">
              <Check className="w-4 h-4" />
              <p className="text-sm">{t.savedSuccess}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Desktop Layout ────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-[#F5F1E8] ${responsiveClasses.pb}`} style={rtlStyles}>
      <div className={`max-w-7xl mx-auto ${responsiveClasses.px}`}>
        {/* Header */}
        <div className={responsiveClasses.mb}>
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Payment Settings */}
          <SettingsSection title={t.sections.payment} lastUpdated={lastUpdated}>
            <div className="grid grid-cols-2 gap-6">
              <SettingsInput
                label={t.labels.vodafone_cash}
                value={settings.vodafone_cash_number}
                onChange={(val) => handleInputChange('vodafone_cash_number', val)}
                placeholder={t.labels.vodafone_cash_placeholder}
                icon={Phone}
                error={formErrors.vodafone_cash_number}
                language={language}
              />
              <SettingsInput
                label={t.labels.instapay}
                value={settings.instapay_number}
                onChange={(val) => handleInputChange('instapay_number', val)}
                placeholder={t.labels.instapay_placeholder}
                icon={Phone}
                error={formErrors.instapay_number}
                language={language}
              />
            </div>
          </SettingsSection>

          {/* Contact Settings */}
          <SettingsSection title={t.sections.contact}>
            <div className="grid grid-cols-1 max-w-md">
              <SettingsInput
                label={t.labels.whatsapp}
                value={settings.whatsapp_number}
                onChange={(val) => handleInputChange('whatsapp_number', val)}
                placeholder={t.labels.whatsapp_placeholder}
                icon={Phone}
                error={formErrors.whatsapp_number}
                language={language}
              />
            </div>
          </SettingsSection>

          {/* Order Settings */}
          <SettingsSection title={t.sections.order}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 max-w-md">
                <SettingsInput
                  label={t.labels.delivery_time}
                  value={settings.delivery_time}
                  onChange={(val) => handleInputChange('delivery_time', val)}
                  placeholder={t.labels.delivery_time_placeholder}
                  icon={Truck}
                  error={formErrors.delivery_time}
                  language={language}
                />
              </div>
              <SettingsTextarea
                label={t.labels.order_confirmation}
                value={settings.order_confirmation_message}
                onChange={(val) => handleInputChange('order_confirmation_message', val)}
                placeholder={t.labels.order_confirmation_placeholder}
                rows={4}
                icon={MessageSquare}
                error={formErrors.order_confirmation_message}
                language={language}
              />
            </div>
          </SettingsSection>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-6 mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-12 px-10 rounded-lg bg-[#8B5E3C] hover:bg-[#8B5E3C]/90 transition-colors text-sm text-white flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>{t.saving}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.saveSettings}</span>
              </>
            )}
          </button>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="fixed bottom-8 right-8 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-up flex items-center gap-2">
            <Check className="w-4 h-4" />
            <p className="text-sm">{t.savedSuccess}</p>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}