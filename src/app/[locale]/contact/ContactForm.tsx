'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiMessageSquare, FiSend, FiCheck, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

type Status = '' | 'loading' | 'success' | 'error';

type Translations = {
  form_title: string;
  form_name_label: string;
  form_name_placeholder?: string;
  form_email_label: string;
  form_email_placeholder?: string;
  form_message_label: string;
  form_message_placeholder?: string;
  form_consent_label: string;
  form_characters_left?: string;
  common_submit_button: string;
  common_sending_button: string;
  common_feedback_success: string;
  common_feedback_error: string;
  common_feedback_error_api: string;
  common_validation_fix_errors: string;
  common_validation_name_min_length: string;
  common_validation_name_max_length: string;
  common_validation_email_invalid: string;
  common_validation_message_min_length: string;
  common_validation_message_max_length: string;
};

type Props = { translations: Translations };

type FormState = {
  name: string;
  email: string;
  message: string;
  consent: boolean;
  company: string; // honeypot
};

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1200;
const NAME_MIN = 2;
const NAME_MAX = 80;

// Input wrapper to add icon and glint
const InputWrapper = ({ children, icon: Icon, error }: { children: React.ReactNode; icon: any; error?: string }) => (
  <div className="relative group">
    <div className={`absolute left-4 top-4 text-white/40 transition-colors group-focus-within:text-gold-400 ${error ? 'text-red-400' : ''}`}>
      <Icon size={20} />
    </div>
    {children}
    {error && (
      <motion.div
        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="absolute right-4 top-4 text-red-400"
      >
        <FiAlertCircle size={20} />
      </motion.div>
    )}
  </div>
);

export default function ContactForm({ translations }: Props) {
  const [status, setStatus] = React.useState<Status>('');
  const [notice, setNotice] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formData, setFormData] = React.useState<FormState>({
    name: '',
    email: '',
    message: '',
    consent: false,
    company: '',
  });

  // Autosave
  React.useEffect(() => {
    const saved = localStorage.getItem('contact-draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<FormState>;
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        /* ignore */
      }
    }
  }, []);
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      localStorage.setItem('contact-draft', JSON.stringify(formData));
    }, 400);
    return () => window.clearTimeout(id);
  }, [formData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, type } = e.target;
    const value = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : (e.target as HTMLInputElement).value;
    setFormData((prev) => ({ ...prev, [id]: value } as FormState));
    if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' })); // clear error on type
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (formData.name.trim().length < NAME_MIN) e.name = translations.common_validation_name_min_length || `Min. ${NAME_MIN} chars`;
    if (formData.name.trim().length > NAME_MAX) e.name = translations.common_validation_name_max_length || `Max. ${NAME_MAX} chars`;
    if (!/^\S+@\S+\.[\w-]{2,}$/.test(formData.email.trim())) e.email = translations.common_validation_email_invalid || 'Invalid email';
    const len = formData.message.trim().length;
    if (len < MESSAGE_MIN) e.message = translations.common_validation_message_min_length || `Min. ${MESSAGE_MIN} chars`;
    if (len > MESSAGE_MAX) e.message = translations.common_validation_message_max_length || `Max. ${MESSAGE_MAX} chars`;
    if (!formData.consent) e.consent = 'Required';
    return e;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // honeypot
    if (formData.company) {
      setStatus('success');
      setNotice(translations.common_feedback_success || 'Thank you!');
      window.setTimeout(() => { setStatus(''); setNotice(''); }, 3000);
      return;
    }

    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) {
      setStatus('error');
      setNotice(translations.common_validation_fix_errors || 'Please fix the errors below.');
      return;
    }

    try {
      setStatus('loading');
      setNotice(translations.common_sending_button || 'Sending...');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          consent: formData.consent,
        } satisfies Omit<FormState, 'company'>),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(j?.message || translations.common_feedback_error_api || 'Server Error');
      }

      setStatus('success');
      setNotice(translations.common_feedback_success || 'Message sent!');
      setFormData({ name: '', email: '', message: '', consent: false, company: '' });
      setErrors({});
      localStorage.removeItem('contact-draft');
      window.setTimeout(() => { setStatus(''); setNotice(''); }, 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (translations.common_feedback_error || 'Oops! Try again.');
      setStatus('error');
      setNotice(msg);
    }
  };

  const chars = formData.message.trim().length;
  const left = Math.max(0, MESSAGE_MAX - chars);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a12]/80 p-8 backdrop-blur-xl shadow-2xl"
    >
      {/* Decorative Glow */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">{translations.form_title}</h2>
          <p className="text-white/40 text-sm mt-1">We usually respond within 24 hours.</p>
        </div>
        <div className="hidden md:block">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <FiSend className="text-black ml-1" size={24} />
          </div>
        </div>
      </div>

      <div aria-live="polite" role="status" className="sr-only" id="form-status">
        {status && notice}
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6 relative z-10">
        {/* honeypot */}
        <input id="company" type="text" value={formData.company} onChange={onChange} className="hidden" tabIndex={-1} aria-hidden="true" />

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">
              {translations.form_name_label}
            </label>
            <InputWrapper icon={FiUser} error={errors.name}>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={onChange}
                required
                className={`w-full rounded-xl border ${errors.name ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-gold-400/50 bg-black/40'} px-4 py-4 pl-12 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-gold-400/50 transition-all`}
                placeholder={translations.form_name_placeholder}
              />
            </InputWrapper>
            {errors.name && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><FiAlertCircle /> {errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">
              {translations.form_email_label}
            </label>
            <InputWrapper icon={FiMail} error={errors.email}>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={onChange}
                required
                className={`w-full rounded-xl border ${errors.email ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-gold-400/50 bg-black/40'} px-4 py-4 pl-12 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-gold-400/50 transition-all`}
                placeholder={translations.form_email_placeholder}
              />
            </InputWrapper>
            {errors.email && <p className="text-xs text-red-400 ml-1 flex items-center gap-1"><FiAlertCircle /> {errors.email}</p>}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-white/60 ml-1">
            {translations.form_message_label}
          </label>
          <div className="relative group">
            <div className={`absolute left-4 top-4 text-white/40 transition-colors group-focus-within:text-gold-400 ${errors.message ? 'text-red-400' : ''}`}>
              <FiMessageSquare size={20} />
            </div>
            <textarea
              id="message"
              rows={6}
              maxLength={MESSAGE_MAX}
              value={formData.message}
              onChange={onChange}
              required
              className={`w-full resize-y rounded-xl border ${errors.message ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-gold-400/50 bg-black/40'} px-4 py-4 pl-12 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-gold-400/50 transition-all scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}
              placeholder={translations.form_message_placeholder}
            />
          </div>
          <div className="flex justify-between px-1">
            {errors.message ? (
              <p className="text-xs text-red-400 flex items-center gap-1"><FiAlertCircle /> {errors.message}</p>
            ) : <span />}
            <span className={`text-xs font-mono transition-colors ${left < 50 ? 'text-amber-400' : 'text-white/30'}`}>{left}</span>
          </div>
        </div>

        {/* Consent */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setFormData(p => ({ ...p, consent: !p.consent }))}>
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.consent ? 'bg-gold-400 border-gold-400 text-black' : 'border-white/30 bg-transparent'}`}>
            {formData.consent && <FiCheck size={14} strokeWidth={4} />}
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/80 select-none leading-relaxed">{translations.form_consent_label}</p>
            {errors.consent && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><FiAlertCircle /> Required</p>}
          </div>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={status === 'loading'}
          className={`relative w-full overflow-hidden rounded-xl py-4 text-base font-bold uppercase tracking-wide shadow-lg transition-all 
            ${status === 'loading' ? 'bg-white/10 text-white/50 cursor-wait' : 'bg-gradient-to-r from-gold-400 to-amber-500 text-black hover:shadow-gold-500/25'}
          `}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {status === 'loading' ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                {translations.common_sending_button}
              </>
            ) : status === 'success' ? (
              <>
                <FiCheckCircle size={20} />
                Sent Successfully
              </>
            ) : (
              <>
                {translations.common_submit_button} <FiSend />
              </>
            )}
          </span>
          {/* Shine effect */}
          {!status && (
            <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          )}
        </motion.button>

        {/* Status Message */}
        <AnimatePresence>
          {status && notice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`rounded-xl px-4 py-3 text-center font-bold text-sm flex items-center justify-center gap-2 ${status === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : status === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/10 text-white'
                }`}
            >
              {status === 'success' ? <FiCheckCircle /> : status === 'error' ? <FiAlertCircle /> : null}
              {notice}
            </motion.div>
          )}
        </AnimatePresence>

      </form>
    </motion.section>
  );
}
