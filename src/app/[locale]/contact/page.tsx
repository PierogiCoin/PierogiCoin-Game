// Plik: src/app/[locale]/contact/page.tsx
'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import ContactForm from './ContactForm';
import PageHeader from '@/components/PageHeader';


export default function ContactPage() {
  const { t } = useTranslation(['contact-page', 'common']);
  const mainRef = useRef<HTMLElement>(null);

  const translations = useMemo(
    () => ({
      title: t('title'),
      subtitle: t('subtitle'),
      info_intro_title: t('info.intro.title'),
      info_intro_text: t('info.intro.text'),
      contact_graphic_alt: t('contact_graphic_alt'),
      info_collaboration_title: t('info.collaboration.title'),
      info_collaboration_text: t('info.collaboration.text'),
      info_support_title: t('info.support.title'),
      info_support_text: t('info.support.text'),
      info_general_contact_title: t('info.general_contact.title'),
      info_general_contact_email_address: t('info.general_contact.email_address'),
      form_title: t('form.title'),
      form_name_label: t('form.name_label'),
      form_email_label: t('form.email_label'),
      form_message_label: t('form.message_label'),
      form_name_placeholder: t('form.name_placeholder'),
      form_email_placeholder: t('form.email_placeholder'),
      form_message_placeholder: t('form.message_placeholder'),
      form_consent_label: t('form.consent_label'),
      common_submit_button: t('common:form.submit_button'),
      common_sending_button: t('common:form.sending_button'),
      common_feedback_success: t('common:feedback.success'),
      common_feedback_error: t('common:feedback.error'),
      common_feedback_error_api: t('common:feedback.error_api'),
      common_validation_fix_errors: t('common:validation.fix_errors'),
      common_validation_name_min_length: t('common:validation.name_min_length'),
      common_validation_name_max_length: t('common:validation.name_max_length'),
      common_validation_email_invalid: t('common:validation.email_invalid'),
      common_validation_message_min_length: t('common:validation.message_min_length'),
      common_validation_message_max_length: t('common:validation.message_max_length'),
    }),
    [t]
  );

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'PierogiCoin',
      url: 'https://pierogimeme.io',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: translations.info_general_contact_email_address || 'hello@pierogimeme.io',
          availableLanguage: ['en', 'pl'],
        },
      ],
    }),
    [translations.info_general_contact_email_address]
  );

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (hash === '#main') mainRef.current?.focus();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] rounded-md bg-gold-400/90 px-3 py-2 text-black"
      >
        {t('common:skip_to_content', 'Przejdź do treści')}
      </a>



      <div className="relative z-10 min-h-screen w-full">
        <PageHeader title={translations.title} subtitle={translations.subtitle} />

        {/* Pasek szybkich kontaktów (bez telefonu) */}
        <section aria-labelledby="quick-contacts" className="container mx-auto px-4 -mt-8 relative z-20">
          <h2 id="quick-contacts" className="sr-only">
            {translations.info_intro_title}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* General Contact */}
            <div className="group rounded-2xl border border-white/10 bg-[#0a0a12]/60 p-6 backdrop-blur-md transition-all hover:bg-[#0a0a12]/80 hover:border-gold-500/30 hover:shadow-lg hover:shadow-gold-500/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 text-gold-400 group-hover:bg-gold-400 group-hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div className="text-lg font-bold text-white mb-2">
                {translations.info_general_contact_title}
              </div>
              <p className="text-sm text-white/60 mb-4 leading-relaxed">{translations.info_intro_text}</p>
              {translations.info_general_contact_email_address && (
                <a
                  className="inline-flex items-center gap-2 text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors"
                  href={`mailto:${translations.info_general_contact_email_address}`}
                >
                  {translations.info_general_contact_email_address}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                </a>
              )}
            </div>

            {/* Collaboration */}
            <div className="group rounded-2xl border border-white/10 bg-[#0a0a12]/60 p-6 backdrop-blur-md transition-all hover:bg-[#0a0a12]/80 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div className="text-lg font-bold text-white mb-2">
                {translations.info_collaboration_title}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {translations.info_collaboration_text}
              </p>
            </div>

            {/* Support */}
            <div className="group rounded-2xl border border-white/10 bg-[#0a0a12]/60 p-6 backdrop-blur-md transition-all hover:bg-[#0a0a12]/80 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              </div>
              <div className="text-lg font-bold text-white mb-2">
                {translations.info_support_title}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">{translations.info_support_text}</p>
            </div>
          </motion.div>
        </section>

        <main
          id="main"
          ref={mainRef}
          tabIndex={-1}
          className="container mx-auto px-4 pb-20 pt-16 md:pb-28 max-w-4xl"
          aria-label={translations.form_title}
        >
          <ContactForm translations={translations} />
        </main>
      </div>

      {/* JSON-LD dla SEO */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
