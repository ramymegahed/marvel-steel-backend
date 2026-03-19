import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    FolderTree,
    Users,
    Settings,
    Star,
    Menu,
    X,
    Languages,
    LogOut
} from 'lucide-react';
import { useLanguage } from '../Components/Context/LanguageContext';
import { useAdmin } from '../Components/Context/AdminContext';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const ANIMATION_DURATION = 300;

// ─── Content Dictionary ─────────────────────────────────────────────────────
const ADMIN_CONTENT = {
    en: {
        welcome: 'Welcome back, Admin',
        subtitle: 'Manage your Marvel Steel e-commerce platform',
        footer: 'All rights reserved.',
        userRole: 'Super Admin',
        userEmail: 'admin@marvelsteel.com',
        logout: 'Logout',
        adminTitle: 'Marvel Steel Admin',
        closeSidebar: 'Close sidebar',
        openSidebar: 'Open sidebar',
        toggleLanguage: 'Toggle language',
    },
    ar: {
        welcome: 'مرحباً بعودتك، المدير',
        subtitle: 'إدارة منصة مارفل ستيل للتجارة الإلكترونية',
        footer: 'جميع الحقوق محفوظة.',
        userRole: 'مدير النظام',
        userEmail: 'admin@marvelsteel.com',
        logout: 'تسجيل الخروج',
        adminTitle: 'مارفل ستيل إدارة',
        closeSidebar: 'إغلاق القائمة',
        openSidebar: 'فتح القائمة',
        toggleLanguage: 'تبديل اللغة',
    }
};

// ─── Navigation Items ──────────────────────────────────────────────────────
const NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/categories', label: 'Categories', icon: FolderTree },
    { path: '/admin/staff', label: 'Staff', icon: Users },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
];

// ─── Extracted Components ───────────────────────────────────────────────────

const NavItem = React.memo(({ item, isActive, onClick, language }) => {
    const IconComponent = item.icon;

    return (
        <NavLink
            to={item.path}
            end={item.end}
            onClick={onClick}
            className={({ isActive }) =>
                `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5C3A21] ${isActive
                    ? 'bg-[#8B5E3C] text-white'
                    : 'text-white/80 hover:bg-[#8B5E3C]/50 hover:text-white'
                }`
            }
            aria-current={isActive ? 'page' : undefined}
        >
            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            <span className="text-sm sm:text-base">{item.label}</span>
        </NavLink>
    );
});

NavItem.displayName = 'NavItem';

const UserInfo = React.memo(({ userRole, userEmail, language }) => {
    const initials = useMemo(() =>
        language === 'ar' ? 'م أ' : 'SA',
        [language]
    );

    return (
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#8B5E3C] flex items-center justify-center shrink-0">
                <span className="text-white text-xs sm:text-sm font-medium">
                    {initials}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm text-white truncate">{userRole}</div>
                <div className="text-[10px] sm:text-xs text-white/60 truncate">{userEmail}</div>
            </div>
        </div>
    );
});

UserInfo.displayName = 'UserInfo';

const LogoutButton = React.memo(({ onLogout, label }) => (
    <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-white/80 hover:bg-red-600/20 hover:text-white transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5C3A21]"
        aria-label={label}
    >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-300" aria-hidden="true" />
        <span className="text-sm sm:text-base">{label}</span>
    </button>
));

LogoutButton.displayName = 'LogoutButton';

const LanguageToggle = React.memo(({ language, onToggle, t }) => (
    <button
        onClick={onToggle}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#F5F1E8] hover:bg-[#E8E0D5] text-[#2C2C2C] transition-colors duration-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2"
        aria-label={t.toggleLanguage}
    >
        <Languages className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        <span className="hidden sm:inline font-medium">
            {language === 'en' ? 'العربية' : 'English'}
        </span>
    </button>
));

LanguageToggle.displayName = 'LanguageToggle';

const SidebarOverlay = React.memo(({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
            onClick={onClose}
            aria-hidden="true"
        />
    );
});

SidebarOverlay.displayName = 'SidebarOverlay';

const Header = React.memo(({
    onMenuClick,
    title,
    subtitle,
    language,
    onLanguageToggle,
    t,
    currentDate
}) => (
    <header className="bg-white border-b border-[#2C2C2C]/10 sticky top-0 z-30 shadow-sm">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
            <button
                onClick={onMenuClick}
                className="lg:hidden text-[#2C2C2C] hover:text-[#8B5E3C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2 rounded"
                aria-label={t.openSidebar}
            >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </button>
            <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg text-[#2C2C2C] truncate">{title}</h2>
                <p className="text-xs sm:text-sm text-[#2C2C2C]/60 truncate">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
                <LanguageToggle language={language} onToggle={onLanguageToggle} t={t} />
                <div className="hidden sm:block text-xs text-[#2C2C2C]/70">
                    {currentDate}
                </div>
            </div>
        </div>
    </header>
));

Header.displayName = 'Header';

const Footer = React.memo(({ footer, year }) => (
    <footer className="bg-white border-t border-[#2C2C2C]/10 py-3 px-4 sm:px-6">
        <p className="text-xs text-[#2C2C2C]/60 text-center">
            © {year} Marvel Steel. {footer}
        </p>
    </footer>
));

Footer.displayName = 'Footer';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

    const { language, toggleLanguage } = useLanguage();
    const { logout } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();

    // ─── Memoized values ─────────────────────────────────────────────────────
    const t = useMemo(() => ADMIN_CONTENT[language], [language]);

    const isRTL = useMemo(() => language === 'ar', [language]);

    const rtlStyles = useMemo(() => isRTL ? {
        direction: 'rtl',
        textAlign: 'right',
    } : {}, [isRTL]);

    const currentDate = useMemo(() =>
        new Date().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }), [language]
    );

    const currentYear = useMemo(() => new Date().getFullYear(), []);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            // Use window.location for a hard redirect to ensure all state is cleared
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [logout]);

    const handleResize = useCallback(() => {
        setViewport({
            isMobile: window.innerWidth < MOBILE_BREAKPOINT,
            isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
        });
    }, []);

    const handleSidebarClose = useCallback(() => {
        setSidebarOpen(false);
    }, []);

    const handleSidebarOpen = useCallback(() => {
        setSidebarOpen(true);
    }, []);

    // ─── Effects ─────────────────────────────────────────────────────────────
    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (viewport.isMobile && sidebarOpen && !e.target.closest('.admin-sidebar')) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [viewport.isMobile, sidebarOpen]);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (viewport.isMobile) {
            setSidebarOpen(false);
        }
    }, [location, viewport.isMobile]);

    // ─── Sidebar positioning classes ─────────────────────────────────────────
    const sidebarClasses = useMemo(() => {
        const baseClasses = 'admin-sidebar fixed lg:sticky inset-y-0 z-50 w-64 bg-[#5C3A21] text-white transform transition-transform duration-300 ease-in-out lg:top-0 lg:h-screen';

        if (isRTL) {
            return `${baseClasses} right-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
                }`;
        }

        return `${baseClasses} left-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`;
    }, [isRTL, sidebarOpen]);

    // ─── Navigation items with translated labels ─────────────────────────────
    const navItemsWithLabels = useMemo(() =>
        NAV_ITEMS.map((item, index) => ({
            ...item,
            label: t.navItems?.[index]?.label || item.label
        })), [t.navItems]
    );

    return (
        <div className="min-h-screen flex bg-[#F5F1E8]" style={rtlStyles}>
            {/* Sidebar */}
            <aside className={sidebarClasses}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-5 sm:p-6 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <h1
                                className="text-lg sm:text-xl text-white"
                                style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                                {t.adminTitle}
                            </h1>
                            <button
                                onClick={handleSidebarClose}
                                className="lg:hidden text-white hover:text-white/80 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#5C3A21] rounded"
                                aria-label={t.closeSidebar}
                            >
                                <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
                        {navItemsWithLabels.map((item) => (
                            <NavItem
                                key={item.path}
                                item={item}
                                onClick={handleSidebarClose}
                                language={language}
                            />
                        ))}
                    </nav>

                    {/* User Info and Logout */}
                    <div className="p-3 sm:p-4 border-t border-white/10 space-y-2">
                        <UserInfo
                            userRole={t.userRole}
                            userEmail={t.userEmail}
                            language={language}
                        />
                        <LogoutButton onLogout={handleLogout} label={t.logout} />
                    </div>
                </div>
            </aside>

            {/* Mobile sidebar overlay */}
            <SidebarOverlay isOpen={sidebarOpen} onClose={handleSidebarClose} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <Header
                    onMenuClick={handleSidebarOpen}
                    title={t.welcome}
                    subtitle={t.subtitle}
                    language={language}
                    onLanguageToggle={toggleLanguage}
                    t={t}
                    currentDate={currentDate}
                />

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>

                <Footer footer={t.footer} year={currentYear} />
            </div>

            {/* Add animation styles */}
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