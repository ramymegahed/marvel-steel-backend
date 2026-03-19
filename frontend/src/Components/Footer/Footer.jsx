import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useLanguage } from '../Context/LanguageContext';

// Constants moved outside component
const SOCIAL_ICONS = {
  Facebook,
  Instagram,
  
};

// Content dictionary moved outside component
const FOOTER_CONTENT = {
  en: {
    brand: 'Marvel Steel',
    description: 'Crafting premium furniture that combines the strength of steel with the warmth of wood.',
    quickLinks: 'Quick Links',
    contactUs: 'Contact Us',
    paymentMethods: 'Payment Methods',
    followUs: 'Follow Us',
    copyright: 'All rights reserved',
    quickLinksItems: [
      { name: 'Home', path: '/' },
      { name: 'Shop All', path: '/shop' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ],
    contactInfo: [
      { icon: Phone, text: '01044231348', ariaLabel: 'WhatsApp us', isWhatsApp: true },
      { icon: Mail, text: 'info@marvelsteel.com', ariaLabel: 'Email us' },
      { icon: MapPin, text: 'Cairo, Egypt', ariaLabel: 'Our location' },
    ],
    paymentMethodsList: [
      'Vodafone Cash',
      'InstaPay',
      'Cash on Delivery',
    ],
    socialLinks: [
      { icon: 'Facebook', href: 'https://www.facebook.com/share/1AgrVBaJ6j/', label: 'Facebook', ariaLabel: 'Follow us on Facebook' },
      { icon: 'Instagram', href: 'https://www.instagram.com/', label: 'Instagram', ariaLabel: 'Follow us on Instagram' },
    ]
  },
  ar: {
    brand: 'مارفل ستيل',
    description: 'نصنع أثاثاً فاخراً يجمع بين قوة الستيل ودفء الخشب.',
    quickLinks: 'روابط سريعة',
    contactUs: 'اتصل بنا',
    paymentMethods: 'طرق الدفع',
    followUs: 'تابعنا',
    copyright: 'جميع الحقوق محفوظة',
    quickLinksItems: [
      { name: 'الرئيسية', path: '/' },
      { name: 'جميع المنتجات', path: '/shop' },
      { name: 'من نحن', path: '/about' },
      { name: 'اتصل بنا', path: '/contact' },
    ],
    contactInfo: [
      { icon: Phone, text: '01044231348', ariaLabel: 'WhatsApp us', isWhatsApp: true },
      { icon: Mail, text: 'info@marvelsteel.com', ariaLabel: 'Email us' },
      { icon: MapPin, text: 'Cairo, Egypt', ariaLabel: 'Our location' },
    ],
    paymentMethodsList: [
      'فودافون كاش',
      'انستا باي',
      'الدفع عند الاستلام',
    ],
    socialLinks: [
      { icon: 'Facebook', href: 'https://www.facebook.com/share/1AgrVBaJ6j/', label: 'فيسبوك', ariaLabel: 'تابعنا على فيسبوك' },
      { icon: 'Instagram', href: 'https://www.instagram.com/', label: 'انستغرام', ariaLabel: 'تابعنا على انستغرام' },
    ]
  }
};

// Extracted components for better separation of concerns

const FooterHeading = React.memo(({ children, language, className = '' }) => (
  <h4
    className={`text-base sm:text-lg mb-3 sm:mb-4 font-semibold ${language === 'en' ? 'text-center sm:text-left' : ''
      } ${className}`}
    style={{ fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'inherit' }}
  >
    {children}
  </h4>
));

FooterHeading.displayName = 'FooterHeading';

const QuickLinks = React.memo(({ links, language }) => (
  <nav aria-label={language === 'ar' ? 'روابط سريعة' : 'Quick links'}>
    <ul className={`space-y-2 text-xs sm:text-sm ${language === 'en' ? 'text-center sm:text-left' : ''
      }`}>
      {links.map((link) => (
        <li key={link.path}>
          <Link
            to={link.path}
            className="text-white/80 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1 inline-block"
            aria-label={link.name}
          >
            {link.name}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
));

QuickLinks.displayName = 'QuickLinks';

const ContactInfo = React.memo(({ contacts, language }) => (
  <ul className={`space-y-2 sm:space-y-3 text-xs sm:text-sm ${language === 'en' ? 'text-center sm:text-left' : ''
    }`}>
    {contacts.map((item, index) => {
      const IconComponent = item.icon;
      const isWhatsApp = item.isWhatsApp;
      const whatsappLink = `https://wa.me/201044231348`; // Removed leading 0 for international format

      const content = (
        <>
          <IconComponent
            className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-white/80"
            aria-hidden="true"
          />
          <span className="text-white/80">{item.text}</span>
        </>
      );

      return (
        <li
          key={index}
          className={`flex items-center gap-2 sm:gap-3 ${language === 'ar'
            ? 'justify-start flex-row'
            : 'justify-center sm:justify-start'
            }`}
        >
          {isWhatsApp ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 sm:gap-3 hover:text-white transition-colors group"
              aria-label={item.ariaLabel}
            >
              <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 shrink-0 text-white/80 group-hover:text-white" />
              <span className="text-white/80 group-hover:text-white">{item.text}</span>
            </a>
          ) : (
            content
          )}
        </li>
      );
    })}
  </ul>
));

ContactInfo.displayName = 'ContactInfo';

const PaymentMethods = React.memo(({ methods, language }) => (
  <ul className={`space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/80 mb-5 sm:mb-6 ${language === 'en' ? 'text-center sm:text-left' : ''
    }`}>
    {methods.map((method, index) => (
      <li
        key={index}
        className={`flex items-center gap-2 ${language === 'ar'
          ? 'flex-row justify-start'
          : 'justify-center sm:justify-start'
          }`}
      >
        <span aria-hidden="true" className="shrink-0">✓</span>
        <span>{method}</span>
      </li>
    ))}
  </ul>
));

PaymentMethods.displayName = 'PaymentMethods';

const SocialLinks = React.memo(({ links, language }) => (
  <div className={`flex items-center gap-3 sm:gap-4 ${language === 'ar'
    ? 'justify-start'
    : 'justify-center sm:justify-start'
    }`}>
    {links.map((social, index) => {
      const IconComponent = SOCIAL_ICONS[social.icon];
      return (
        <a
          key={index}
          href={social.href}
          aria-label={social.ariaLabel}
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
        </a>
      );
    })}
  </div>
));

SocialLinks.displayName = 'SocialLinks';

const Copyright = React.memo(({ brand, copyright, year, language }) => (
  <div className="border-t border-white/20 mt-10 sm:mt-12 pt-6 sm:pt-8">
    <p className={`text-xs sm:text-sm text-white/60 ${language === 'ar' ? 'text-right' : 'text-center sm:text-center'
      }`}>
      © {year} {brand}. {copyright}.
    </p>
  </div>
));

Copyright.displayName = 'Copyright';

// Main Footer Component
export default function Footer() {
  const { language } = useLanguage();
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Memoize content based on language
  const currentContent = useMemo(() => FOOTER_CONTENT[language], [language]);

  // Memoize RTL styles
  const rtlStyles = useMemo(() => language === 'ar' ? {
    direction: 'rtl',
    textAlign: 'right',
  } : {
    direction: 'ltr',
    textAlign: 'left',
  }, [language]);

  // Memoize brand heading style
  const brandStyle = useMemo(() => ({
    fontFamily: language === 'ar' ? 'Cairo, Tajawal, sans-serif' : 'Playfair Display, serif'
  }), [language]);

  // Desktop layout classes based on language
  const desktopAlignmentClasses = useMemo(() =>
    language === 'ar'
      ? 'lg:text-right'
      : 'lg:text-left',
    [language]);

  return (
    <footer
      className="bg-[#5C3A21] text-white"
      style={rtlStyles}
      aria-label={language === 'ar' ? 'تذييل الصفحة' : 'Footer'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">

          {/* Logo & Description */}
          <div className={`${language === 'en' ? 'text-center sm:text-left' : 'text-center sm:text-left'} ${desktopAlignmentClasses}`}>
            <h2
              className="text-xl sm:text-2xl mb-3 sm:mb-4"
              style={brandStyle}
            >
              {currentContent.brand}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto sm:mx-0">
              {currentContent.description}
            </p>
          </div>

          {/* Quick Links */}
          <div className={`${language === 'en' ? 'text-center sm:text-left' : 'text-center sm:text-left'} ${desktopAlignmentClasses}`}>
            <FooterHeading language={language}>
              {currentContent.quickLinks}
            </FooterHeading>
            <QuickLinks
              links={currentContent.quickLinksItems}
              language={language}
            />
          </div>

          {/* Contact Info */}
          <div className={`${language === 'en' ? 'text-center sm:text-left' : 'text-center sm:text-left'} ${desktopAlignmentClasses}`}>
            <FooterHeading language={language}>
              {currentContent.contactUs}
            </FooterHeading>
            <ContactInfo
              contacts={currentContent.contactInfo}
              language={language}
            />
          </div>

          {/* Payment & Social */}
          <div className={`${language === 'en' ? 'text-center sm:text-left' : 'text-center sm:text-left'} ${desktopAlignmentClasses}`}>
            <FooterHeading language={language}>
              {currentContent.paymentMethods}
            </FooterHeading>
            <PaymentMethods
              methods={currentContent.paymentMethodsList}
              language={language}
            />

            <FooterHeading language={language}>
              {currentContent.followUs}
            </FooterHeading>
            <SocialLinks
              links={currentContent.socialLinks}
              language={language}
            />
          </div>
        </div>

        {/* Copyright */}
        <Copyright
          brand={currentContent.brand}
          copyright={currentContent.copyright}
          year={currentYear}
          language={language}
        />
      </div>
    </footer>
  );
}