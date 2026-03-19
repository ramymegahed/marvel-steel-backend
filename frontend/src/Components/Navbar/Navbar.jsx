import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, MessageCircle, Menu, X, Languages } from 'lucide-react';
import { useLanguage } from '../Context/LanguageContext';
import { useCart } from '../Context/Cartcontext';

// Constants moved outside component to prevent recreation
const SCROLL_THRESHOLD = 50;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

// Content dictionary moved outside component
const NAV_CONTENT = {
    en: {
        brand: 'Marvel Steel',
        navLinks: [
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: 'About', path: '/about' },
            { name: 'Contact', path: '/contact' },
        ]
    },
    ar: {
        brand: 'مارفل ستيل',
        navLinks: [
            { name: 'الرئيسية', path: '/' },
            { name: 'المتجر', path: '/shop' },
            { name: 'من نحن', path: '/about' },
            { name: 'اتصل بنا', path: '/contact' },
        ]
    }
};

// Extracted components for better separation of concerns
const NavLink = React.memo(({ link, isActive, shouldBeTransparent, language, onClick }) => {
    const linkClasses = useMemo(() => {
        const baseClasses = 'transition-colors duration-300 text-sm';
        if (isActive) return `${baseClasses} text-[#8B5E3C]`;
        if (shouldBeTransparent) return `${baseClasses} text-white hover:text-[#8B5E3C]`;
        return `${baseClasses} text-[#2C2C2C] hover:text-[#8B5E3C]`;
    }, [isActive, shouldBeTransparent]);

    return (
        <Link
            to={link.path}
            className={linkClasses}
            onClick={onClick}
            style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Poppins, sans-serif' }}
            aria-current={isActive ? 'page' : undefined}
        >
            {link.name}
        </Link>
    );
});

NavLink.displayName = 'NavLink';

const ActionButtons = React.memo(({ shouldBeTransparent, language, toggleLanguage, itemCount }) => {
    const buttonClasses = useMemo(() =>
        `transition-colors duration-300 hover:text-[#8B5E3C] ${shouldBeTransparent ? 'text-white' : 'text-[#2C2C2C]'}`,
        [shouldBeTransparent]
    );

    // WhatsApp link with the provided number
    const whatsappLink = `https://wa.me/201044231348`; // Removed leading 0 for international format

    return (
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative flex items-center">
                <button
                    onClick={toggleLanguage}
                    className={`absolute pe-3 ${buttonClasses}`}
                    style={{
                        [language === 'ar' ? 'left' : 'right']: '100%',
                        marginLeft: language === 'ar' ? '0' : '-30px',
                        marginRight: language === 'ar' ? '-30px' : '0',
                        zIndex: 1
                    }}
                    aria-label={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                >
                    <Languages className="w-4 h-4" />
                </button>

                <Link
                    to="/cart"
                    className={`relative z-10 ${buttonClasses}`}
                    aria-label="Shopping cart"
                >
                    <ShoppingCart className="w-5 h-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#8B5E3C] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {itemCount > 9 ? '9+' : itemCount}
                        </span>
                    )}
                </Link>
            </div>

            <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses}
                aria-label="Contact us on WhatsApp"
            >
                <MessageCircle className="w-5 h-5" />
            </a>
        </div>
    );
});

ActionButtons.displayName = 'ActionButtons';

const MobileMenu = React.memo(({ isOpen, navLinks, isActiveLink, onLinkClick, language }) => {
    if (!isOpen) return null;

    return (
        <div className="overflow-hidden transition-all duration-300 max-h-96 opacity-100">
            <nav className="bg-white py-2 space-y-1 rounded-lg mt-2 shadow-lg" aria-label="Mobile navigation">
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        onClick={onLinkClick}
                        className={`block px-4 py-2.5 font-['Poppins'] text-sm transition-colors ${isActiveLink(link.path)
                            ? 'text-[#8B5E3C] bg-[#F5F1E8]'
                            : 'text-[#2C2C2C] hover:text-[#8B5E3C] hover:bg-[#F5F1E8]'
                            }`}
                        style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Poppins, sans-serif' }}
                        aria-current={isActiveLink(link.path) ? 'page' : undefined}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
});

MobileMenu.displayName = 'MobileMenu';

// Main Navbar Component
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });
    const { language, toggleLanguage } = useLanguage();
    const location = useLocation();
    const { totalItems } = useCart(); // Get cart item count from context

    // Memoized values
    const currentContent = useMemo(() => NAV_CONTENT[language], [language]);
    const isHomePage = useMemo(() => location.pathname === '/', [location.pathname]);
    const shouldBeTransparent = useMemo(() => isHomePage && !scrolled, [isHomePage, scrolled]);

    // Optimized scroll handler with useCallback
    const handleScroll = useCallback(() => {
        setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }, []);

    // Optimized resize handler with useCallback
    const handleResize = useCallback(() => {
        setViewport({
            isMobile: window.innerWidth < MOBILE_BREAKPOINT,
            isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
        });
    }, []);

    // Optimized link checker with useCallback
    const isActiveLink = useCallback((path) => {
        if (path.includes('?')) {
            const [basePath, categoryParam] = path.split('?');
            return location.pathname === basePath && location.search === `?${categoryParam}`;
        }
        return location.pathname === path;
    }, [location.pathname, location.search]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Optimized effect with cleanup
    useEffect(() => {
        // Initial calls
        handleScroll();
        handleResize();

        // Add listeners with passive option for better performance
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleScroll, handleResize]);

    // RTL styles memoized
    const rtlStyles = useMemo(() => language === 'ar' ? {
        direction: 'rtl',
        textAlign: 'right',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
    } : {}, [language]);

    // Render based on viewport
    const renderNavContent = () => {
        const commonProps = {
            shouldBeTransparent,
            language,
            toggleLanguage,
            itemCount: totalItems // Pass the actual cart count
        };

        if (viewport.isMobile) {
            return (
                <div className="px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center relative" aria-label="Home">
                            <img
                                src="furnitures-logo.png"
                                alt="Marvel Steel Logo"
                                className="absolute w-10 h-10 object-contain opacity-50"
                                loading="eager"
                                style={{
                                    [language === 'ar' ? 'right' : 'left']: 0,
                                    transform: language === 'ar' ? 'translateX(20%)' : 'translateX(-20%)'
                                }}
                            />
                            <span
                                className={`text-xl transition-colors duration-300 relative z-10 ${shouldBeTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
                                style={{
                                    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif',
                                    [language === 'ar' ? 'marginRight' : 'marginLeft']: '30px'
                                }}
                            >
                                {currentContent.brand}
                            </span>
                        </Link>

                        {/* Icons and Menu Button */}
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                            <ActionButtons {...commonProps} />
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`transition-colors duration-300 ${shouldBeTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <MobileMenu
                        isOpen={mobileMenuOpen}
                        navLinks={currentContent.navLinks}
                        isActiveLink={isActiveLink}
                        onLinkClick={() => setMobileMenuOpen(false)}
                        language={language}
                    />
                </div>
            );
        }

        // Desktop/Tablet layout
        return (
            <div className={viewport.isTablet ? "px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center relative" aria-label="Home">
                        <img
                            src="furnitures-logo.png"
                            alt="Marvel Steel Logo"
                            className={`absolute object-contain opacity-40 ${viewport.isTablet ? 'w-10 h-10' : 'w-14 h-14'}`}
                            loading="eager"
                            style={{
                                [language === 'ar' ? 'right' : 'left']: 0,
                                transform: language === 'ar' ? `translateX(${viewport.isTablet ? '25%' : '30%'})` : `translateX(-${viewport.isTablet ? '25%' : '30%'})`
                            }}
                        />
                        <span
                            className={`text-2xl transition-colors duration-300 relative z-10 ${shouldBeTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
                            style={{
                                fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif',
                                [language === 'ar' ? 'marginRight' : 'marginLeft']: viewport.isTablet ? '30px' : '40px'
                            }}
                        >
                            {currentContent.brand}
                        </span>
                    </Link>

                    {!viewport.isTablet && (
                        <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse" aria-label="Main navigation">
                            {currentContent.navLinks.map((link) => (
                                <NavLink
                                    key={link.path}
                                    link={link}
                                    isActive={isActiveLink(link.path)}
                                    shouldBeTransparent={shouldBeTransparent}
                                    language={language}
                                />
                            ))}
                        </nav>
                    )}

                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <ActionButtons {...commonProps} />
                        {viewport.isTablet && (
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`transition-colors duration-300 ${shouldBeTransparent ? 'text-white' : 'text-[#2C2C2C]'}`}
                                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={mobileMenuOpen}
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>

                {viewport.isTablet && (
                    <MobileMenu
                        isOpen={mobileMenuOpen}
                        navLinks={currentContent.navLinks}
                        isActiveLink={isActiveLink}
                        onLinkClick={() => setMobileMenuOpen(false)}
                        language={language}
                    />
                )}
            </div>
        );
    };

    return (
        <header>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${shouldBeTransparent ? 'bg-transparent' : 'bg-white shadow-md'
                    }`}
                style={rtlStyles}
                aria-label="Main navigation"
            >
                {renderNavContent()}
            </nav>
        </header>
    );
}