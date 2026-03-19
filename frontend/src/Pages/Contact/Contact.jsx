import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../../Components/Context/LanguageContext';

// Content dictionary
const CONTACT_CONTENT = {
  en: {
    title: 'Get in Touch',
    subtitle: "We'd love to hear from you",
    whatsapp: {
      number: '01044231348',
      message: 'Chat on WhatsApp',
      availability: 'Available 24/7'
    },
    social: {
      title: 'Follow Us',
      facebook: 'Facebook',
      instagram: 'Instagram'
    }
  },
  ar: {
    title: 'تواصل معنا',
    subtitle: 'يسعدنا التواصل معك',
    whatsapp: {
      number: '٠١٠٤٤٢٣١٣٤٨',
      message: 'تواصل عبر واتساب',
      availability: 'متاح ٢٤/٧'
    },
    social: {
      title: 'تابعنا',
      facebook: 'فيسبوك',
      instagram: 'انستغرام'
    }
  }
};

export default function Contact() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsVisible(true);
  }, []);

  const content = CONTACT_CONTENT[language];
  const isRTL = language === 'ar';

  // WhatsApp link with the provided number
  const whatsappLink = `https://wa.me/201044231348`; // Removed the leading 0 for international format

  return (
    <main className={`min-h-screen bg-linear-to-br from-[#F5F1E8] to-[#E8E0D5] py-12 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-2xl mx-auto mt-10 md:mt-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1
            className="text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-3"
            style={{ fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'Inter, sans-serif' }}
          >
            {content.title}
          </h1>
          <p className="text-lg text-[#2C2C2C]/70">
            {content.subtitle}
          </p>
        </motion.div>

        {/* WhatsApp Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 hover:shadow-2xl transition-shadow"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#25D366] w-16 h-16 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
          </div>

          <h2
            className="text-2xl font-semibold text-center text-[#2C2C2C] mb-2"
            style={{ fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'Inter, sans-serif' }}
          >
            WhatsApp
          </h2>

          <p className="text-center text-[#2C2C2C]/60 text-sm mb-4">
            {content.whatsapp.availability}
          </p>

          <div className="text-center mb-6">
            <span className="text-3xl md:text-4xl font-bold text-[#2C2C2C] tracking-wider">
              {content.whatsapp.number}
            </span>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-center py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#25D366]/50"
          >
            {content.whatsapp.message}
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3
            className="text-xl text-center text-[#2C2C2C]/70 mb-6"
            style={{ fontFamily: isRTL ? 'Cairo, Tajawal, sans-serif' : 'Inter, sans-serif' }}
          >
            {content.social.title}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/1AgrVBaJ6j/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1877F2] hover:bg-[#0D5AB9] text-white p-6 rounded-xl text-center transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#1877F2]/50 group"
            >
              <Facebook className="w-8 h-8 mx-auto mb-3 group-hover:animate-bounce" />
              <span className="font-semibold text-lg">{content.social.facebook}</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/" // Note: You provided Facebook link for Instagram, update this if you have the correct Instagram link
              target="_blank"
              rel="noopener noreferrer"
              className="bg-linear-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] hover:opacity-90 text-white p-6 rounded-xl text-center transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#833AB4]/50 group"
            >
              <Instagram className="w-8 h-8 mx-auto mb-3 group-hover:animate-bounce" />
              <span className="font-semibold text-lg">{content.social.instagram}</span>
            </a>
          </div>
        </motion.div>

        {/* Quick Contact Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-sm text-[#2C2C2C]/50 mt-12"
        >
          {isRTL ? 'نحن في انتظارك!' : "We're here for you!"}
        </motion.p>
      </div>
    </main>
  );
}