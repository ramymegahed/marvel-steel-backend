import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../../Components/Context/LanguageContext';

export default function NotFound() {
    const { language } = useLanguage();
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Scroll to top when the page loads
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'instant'
        });
    }, []); 

    // Translation content
    const content = {
        en: {
            title: 'Page Not Found',
            subtitle: "The page you're looking for doesn't exist or has been moved.",
            button: 'Back to Home',
            notFound: '404'
        },
        ar: {
            title: 'الصفحة غير موجودة',
            subtitle: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
            button: 'العودة للرئيسية',
            notFound: '٤٠٤'
        }
    };

    const currentContent = content[language];

    // RTL styles for Arabic
    const rtlStyles = language === 'ar' ? {
        direction: 'rtl',
        textAlign: 'right',
    } : {};

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Mobile layout
    if (isMobile) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4" style={rtlStyles}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1
                        className="text-7xl text-[#8B5E3C] mb-3"
                        style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif' }}
                    >
                        {currentContent.notFound}
                    </h1>
                    <h2
                        className="text-2xl text-[#2C2C2C] mb-3"
                        style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif' }}
                    >
                        {currentContent.title}
                    </h2>
                    <p className="text-sm text-[#2C2C2C]/70 mb-6 max-w-xs mx-auto">
                        {currentContent.subtitle}
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3.5 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm font-medium"
                    >
                        {currentContent.button}
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Tablet layout
    if (isTablet) {
        return (
            <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-6" style={rtlStyles}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    <h1
                        className="text-8xl text-[#8B5E3C] mb-4"
                        style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif' }}
                    >
                        {currentContent.notFound}
                    </h1>
                    <h2
                        className="text-3xl text-[#2C2C2C] mb-3"
                        style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif' }}
                    >
                        {currentContent.title}
                    </h2>
                    <p className="text-base text-[#2C2C2C]/70 mb-7">
                        {currentContent.subtitle}
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-7 py-3.5 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm font-medium"
                    >
                        {currentContent.button}
                    </Link>
                </motion.div>
            </div>
        );
    }

    // Desktop layout
    return (
        <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center px-4" style={rtlStyles}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
            >
                <h1
                    className="text-8xl sm:text-9xl text-[#8B5E3C] mb-4"
                    style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif' }}
                >
                    {currentContent.notFound}
                </h1>
                <h2
                    className="text-2xl sm:text-3xl text-[#2C2C2C] mb-4"
                    style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif' }}
                >
                    {currentContent.title}
                </h2>
                <p className="text-sm sm:text-base text-[#2C2C2C]/70 mb-8">
                    {currentContent.subtitle}
                </p>
                <Link
                    to="/"
                    className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-[#8B5E3C] text-white rounded-xl hover:bg-[#5C3A21] transition-colors text-sm sm:text-base font-medium"
                >
                    {currentContent.button}
                </Link>
            </motion.div>
        </div>
    );
}