import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../Components/Context/LanguageContext';

// Constants moved outside component
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const SCROLL_OPTIONS = { top: 0, behavior: 'instant' };

// Animation variants moved outside component
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

// Content dictionary moved outside component
const ABOUT_CONTENT = {
  en: {
    title: 'About Marvel Steel',
    paragraphs: [
      'Marvel Steel is dedicated to crafting premium furniture that combines the strength and durability of steel with the natural warmth and beauty of wood. Since our founding, we\'ve been committed to creating pieces that not only look stunning but are built to last for generations.',
      'Our skilled craftsmen pay meticulous attention to every detail, ensuring that each piece meets our exacting standards for quality and design. We believe that furniture should be both functional and beautiful, elevating your living space while serving your practical needs.',
      'We offer custom sizes and finishes to ensure your furniture fits perfectly in your home. With fast delivery across Egypt and flexible payment options including cash on delivery, we make it easy to transform your living space.'
    ],
    values: {
      title: 'Our Values',
      items: [
        {
          title: 'Quality First',
          description: 'We use only premium materials and expert craftsmanship',
        },
        {
          title: 'Customer Satisfaction',
          description: 'Your happiness is our priority',
        },
        {
          title: 'Timeless Design',
          description: 'We create furniture that never goes out of style',
        },
        {
          title: 'Sustainability',
          description: 'Built to last, reducing waste and environmental impact',
        },
      ]
    }
  },
  ar: {
    title: 'عن مارفل ستيل',
    paragraphs: [
      'تكرس مارفل ستيل نفسها لصناعة أثاث فاخر يجمع بين قوة ومتانة الستيل مع الدفء الطبيعي والجمال الخلاب للخشب. منذ تأسيسنا، ونحن ملتزمون بإنشاء قطع لا تبدو مذهلة فحسب، بل تم بناؤها لتدوم لأجيال.',
      'يهتم حرفيونا المهرة بكل التفاصيل بدقة متناهية، مما يضمن أن كل قطعة تلبي معاييرنا الصارمة للجودة والتصميم. نحن نؤمن أن الأثاث يجب أن يكون عملياً وجميلاً في نفس الوقت، يرتقي بمساحة معيشتك بينما يلبي احتياجاتك العملية.',
      'نحن نقدم مقاسات وتشطيبات حسب الطلب لضمان أن يناسب أثاثك منزلك بشكل مثالي. مع التوصيل السريع في جميع أنحاء مصر وخيارات الدفع المرنة بما في ذلك الدفع عند الاستلام، نجعل من السهل تحويل مساحة معيشتك.'
    ],
    values: {
      title: 'قيمنا',
      items: [
        {
          title: 'الجودة أولاً',
          description: 'نستخدم فقط أجود المواد والحرفية المتقنة',
        },
        {
          title: 'رضا العملاء',
          description: 'سعادتك هي أولويتنا',
        },
        {
          title: 'تصميم خالد',
          description: 'نصنع أثاثًا لا يخرج عن الموضة أبداً',
        },
        {
          title: 'الاستدامة',
          description: 'مصنوع ليدوم طويلاً، مما يقلل من النفايات والتأثير البيئي',
        },
      ]
    }
  }
};

// Extracted components for better separation of concerns

const ValueItem = React.memo(({ value, language, index }) => {
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit'
  }), [language]);

  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <span className="text-[#8B5E3C] text-lg sm:text-xl shrink-0" aria-hidden="true">✓</span>
      <div>
        <strong
          className="text-sm sm:text-base md:text-lg text-[#2C2C2C]"
          style={titleFont}
        >
          {value.title}:
        </strong>
        <span
          className="text-sm sm:text-base md:text-lg text-[#2C2C2C]/70"
          style={titleFont}
        >
          {' '}{value.description}
        </span>
      </div>
    </div>
  );
});

ValueItem.displayName = 'ValueItem';

const Paragraph = React.memo(({ text, index, isLast, language }) => {
  const fontFamily = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit'
  }), [language]);

  return (
    <p
      className={`text-sm sm:text-base md:text-lg text-[#2C2C2C]/70 leading-relaxed ${!isLast ? 'mb-3 sm:mb-4' : ''}`}
      style={fontFamily}
    >
      {text}
    </p>
  );
});

Paragraph.displayName = 'Paragraph';

const ContentSection = React.memo(({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
));

ContentSection.displayName = 'ContentSection';

// Main About Component
export default function About() {
  const { language } = useLanguage();
  const [viewport, setViewport] = useState({ isMobile: false, isTablet: false });

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo(SCROLL_OPTIONS);
  }, []);

  // Optimized resize handler
  const handleResize = useCallback(() => {
    setViewport({
      isMobile: window.innerWidth < MOBILE_BREAKPOINT,
      isTablet: window.innerWidth >= MOBILE_BREAKPOINT && window.innerWidth < TABLET_BREAKPOINT
    });
  }, []);

  useEffect(() => {
    // Initial call
    handleResize();

    // Add resize listener with passive option
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Memoize content based on language
  const currentContent = useMemo(() => ABOUT_CONTENT[language], [language]);

  // Memoize RTL styles
  const rtlStyles = useMemo(() => language === 'ar' ? {
    direction: 'rtl',
    textAlign: 'right',
  } : {}, [language]);

  // Memoize font styles
  const titleFont = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  // Determine padding and spacing based on viewport
  const containerClasses = useMemo(() => {
    const baseClasses = 'min-h-screen bg-[#F5F1E8]';
    if (viewport.isMobile) return `${baseClasses} pt-20 pb-12`;
    if (viewport.isTablet) return `${baseClasses} pt-24 pb-16`;
    return `${baseClasses} pt-28 pb-20`;
  }, [viewport.isMobile, viewport.isTablet]);

  const titleClasses = useMemo(() => {
    if (viewport.isMobile) return 'text-3xl mb-6';
    if (viewport.isTablet) return 'text-4xl mb-7';
    return 'text-4xl md:text-5xl mb-8';
  }, [viewport.isMobile, viewport.isTablet]);

  const contentSpacing = useMemo(() => {
    if (viewport.isMobile) return 'space-y-5';
    if (viewport.isTablet) return 'space-y-6';
    return 'space-y-8';
  }, [viewport.isMobile, viewport.isTablet]);

  const sectionPadding = useMemo(() => {
    if (viewport.isMobile) return 'p-5';
    if (viewport.isTablet) return 'p-7';
    return 'p-8';
  }, [viewport.isMobile, viewport.isTablet]);

  const valuesTitleClasses = useMemo(() => {
    if (viewport.isMobile) return 'text-xl mb-4';
    if (viewport.isTablet) return 'text-2xl mb-5';
    return 'text-2xl md:text-3xl mb-6';
  }, [viewport.isMobile, viewport.isTablet]);

  const valuesSpacing = useMemo(() => {
    if (viewport.isMobile) return 'space-y-3';
    if (viewport.isTablet) return 'space-y-3';
    return 'space-y-4';
  }, [viewport.isMobile, viewport.isTablet]);

  return (
    <main>
      <div className={containerClasses} style={rtlStyles}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
          >
            <h1
              className={`${titleClasses} text-[#2C2C2C]`}
              style={titleFont}
            >
              {currentContent.title}
            </h1>

            <div className={contentSpacing}>
              {/* Main Content */}
              <ContentSection className={sectionPadding}>
                {currentContent.paragraphs.map((paragraph, index) => (
                  <Paragraph
                    key={index}
                    text={paragraph}
                    index={index}
                    isLast={index === currentContent.paragraphs.length - 1}
                    language={language}
                  />
                ))}
              </ContentSection>

              {/* Values Section */}
              <ContentSection className={sectionPadding}>
                <h2
                  className={`${valuesTitleClasses} text-[#2C2C2C]`}
                  style={titleFont}
                >
                  {currentContent.values.title}
                </h2>
                <div className={valuesSpacing}>
                  {currentContent.values.items.map((value, index) => (
                    <ValueItem
                      key={index}
                      value={value}
                      language={language}
                      index={index}
                    />
                  ))}
                </div>
              </ContentSection>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}