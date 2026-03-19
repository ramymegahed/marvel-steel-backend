import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';

// ─── Constants ─────────────────────────────────────────────────────────────
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const SCROLL_OPTIONS = { top: 0, behavior: 'instant' };
const ANIMATION_DURATION = 0.6;
const SPRING_ANIMATION = { delay: 0.2, type: 'spring', stiffness: 200 };

// ─── Animation Variants ─────────────────────────────────────────────────────
const fadeInScale = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: ANIMATION_DURATION }
};

const scaleIn = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    transition: SPRING_ANIMATION
};

// ─── Content Dictionary ─────────────────────────────────────────────────────
const ORDER_SUCCESS_CONTENT = {
    en: {
        title: '🎉 Order Received Successfully!',
        subtitle: 'Thank you for your order! Our team will contact you shortly to confirm the details and arrange delivery.',
        nextSteps: 'What happens next?',
        backToHome: 'Back to Home',
        continueShopping: 'Continue Shopping',
        steps: [
            "We'll call you within 24 hours to confirm your order and delivery details",
            "Your furniture will be carefully prepared and packaged",
            "We'll deliver it to your doorstep at the scheduled time"
        ]
    },
    ar: {
        title: '🎉 تم استلام الطلب بنجاح!',
        subtitle: 'شكراً لطلبك! سيتواصل معك فريقنا قريباً لتأكيد التفاصيل وترتيب التوصيل.',
        nextSteps: 'ماذا يحدث بعد ذلك؟',
        backToHome: 'العودة للرئيسية',
        continueShopping: 'مواصلة التسوق',
        steps: [
            "سنتصل بك خلال ٢٤ ساعة لتأكيد طلبك وتفاصيل التوصيل",
            "سيتم تجهيز وتغليف أثاثك بعناية",
            "سنقوم بتوصيله إلى باب منزلك في الموعد المحدد"
        ]
    }
};

// ─── Extracted Components ───────────────────────────────────────────────────

const SuccessIcon = React.memo(() => (
    <motion.div
        {...scaleIn}
        className="mb-6 sm:mb-7 md:mb-8"
    >
        <CheckCircle
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 mx-auto text-green-500"
            aria-label="Success checkmark"
            aria-hidden="false"
        />
    </motion.div>
));

SuccessIcon.displayName = 'SuccessIcon';

const StepItem = React.memo(({ step, index, language }) => {
    const stepNumber = index + 1;
    const textAlign = useMemo(() => language === 'ar' ? 'right' : 'left', [language]);

    return (
        <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center shrink-0 text-xs sm:text-sm mt-0.5">
                {stepNumber}
            </div>
            <p className="text-xs sm:text-sm md:text-base text-[#2C2C2C]/70 leading-relaxed">
                {step}
            </p>
        </div>
    );
});

StepItem.displayName = 'StepItem';

const StepsList = React.memo(({ steps, language }) => {
    const textAlign = useMemo(() => language === 'ar' ? 'right' : 'left', [language]);

    return (
        <div className="space-y-2.5 sm:space-y-3" style={{ textAlign }}>
            {steps.map((step, index) => (
                <StepItem
                    key={index}
                    step={step}
                    index={index}
                    language={language}
                />
            ))}
        </div>
    );
});

StepsList.displayName = 'StepsList';

const ActionButtons = React.memo(({ backToHome, continueShopping }) => {
    const buttonBaseClasses = "px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl text-sm sm:text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:ring-offset-2";

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
                to="/"
                className={`${buttonBaseClasses} bg-[#8B5E3C] text-white hover:bg-[#5C3A21]`}
                aria-label={backToHome}
            >
                {backToHome}
            </Link>
            <Link
                to="/shop"
                className={`${buttonBaseClasses} border-2 border-[#8B5E3C] text-[#8B5E3C] hover:bg-[#8B5E3C] hover:text-white`}
                aria-label={continueShopping}
            >
                {continueShopping}
            </Link>
        </div>
    );
});

ActionButtons.displayName = 'ActionButtons';

const NextStepsCard = React.memo(({ nextSteps, steps, language }) => {
    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    return (
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-sm mb-6 sm:mb-7 md:mb-8">
            <h3
                className="text-base sm:text-lg md:text-xl text-[#2C2C2C] mb-3 sm:mb-4"
                style={titleFont}
            >
                {nextSteps}
            </h3>
            <StepsList steps={steps} language={language} />
        </div>
    );
});

NextStepsCard.displayName = 'NextStepsCard';

// ─── Main Component ─────────────────────────────────────────────────────────
export default function OrderSuccess() {
    const { language } = useLanguage();
    const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

    // Scroll to top when the page loads
    useEffect(() => {
        window.scrollTo(SCROLL_OPTIONS);
    }, []);

    // Responsive handler
    const handleResize = useCallback(() => {
        setViewport({
            isMobile: window.innerWidth < MOBILE_BREAKPOINT,
            isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
        });
    }, []);

    useEffect(() => {
        handleResize();
        window.addEventListener('resize', handleResize, { passive: true });
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    // Memoized values
    const currentContent = useMemo(() => ORDER_SUCCESS_CONTENT[language], [language]);

    const rtlStyles = useMemo(() => language === 'ar' ? {
        direction: 'rtl',
        textAlign: 'right',
    } : {}, [language]);

    const titleFont = useMemo(() => ({
        fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
    }), [language]);

    // Responsive classes
    const containerClasses = useMemo(() => {
        const baseClasses = 'min-h-screen bg-[#F5F1E8] flex items-center justify-center';
        if (viewport.isMobile) return `${baseClasses} px-4 py-8`;
        if (viewport.isTablet) return `${baseClasses} px-6`;
        return `${baseClasses} px-4 mt-10`;
    }, [viewport.isMobile, viewport.isTablet]);

    const titleClasses = useMemo(() => {
        if (viewport.isMobile) return 'text-2xl sm:text-3xl mb-3';
        if (viewport.isTablet) return 'text-3xl md:text-4xl mb-4';
        return 'text-3xl sm:text-4xl md:text-5xl mb-4';
    }, [viewport.isMobile, viewport.isTablet]);

    const subtitleClasses = useMemo(() => {
        if (viewport.isMobile) return 'text-base mb-6';
        if (viewport.isTablet) return 'text-lg mb-7';
        return 'text-base sm:text-lg md:text-xl mb-8';
    }, [viewport.isMobile, viewport.isTablet]);

    return (
        <main>
            <div className={containerClasses} style={rtlStyles}>
                <motion.div
                    {...fadeInScale}
                    className="max-w-2xl w-full text-center"
                >
                    <SuccessIcon />

                    <h1
                        className={titleClasses}
                        style={titleFont}
                    >
                        {currentContent.title}
                    </h1>

                    <p className={`${subtitleClasses} text-[#2C2C2C]/70 leading-relaxed`}>
                        {currentContent.subtitle}
                    </p>

                    <NextStepsCard
                        nextSteps={currentContent.nextSteps}
                        steps={currentContent.steps}
                        language={language}
                    />

                    <ActionButtons
                        backToHome={currentContent.backToHome}
                        continueShopping={currentContent.continueShopping}
                    />
                </motion.div>
            </div>
        </main>
    );
}