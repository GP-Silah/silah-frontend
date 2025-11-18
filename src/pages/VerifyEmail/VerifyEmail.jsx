import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmailDialog from '../../components/EmailDialog/EmailDialog';
import './EmailFlow.css';
import '../../i18n';

const EmailFlow = () => {
  const { t, i18n } = useTranslation('EmailFlow');
  const [step, setStep] = useState('verify'); // verify | resend | success | error
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    document.title = t('pageTitle');
  }, [t, i18n.language]);

  const handleLangToggle = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  // ------------- 🟢 Case 1: verifying email from token -----------------
  useEffect(() => {
    if (token) {
      const verifyEmail = async () => {
        try {
          setLoading(true);
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-email`,
            null,
            {
              params: { token },
            },
          );
          setStep('success');
        } catch (err) {
          console.error(err);
          setStep('error');
        } finally {
          setLoading(false);
        }
      };
      verifyEmail();
    }
  }, [token]);

  // ------------- 🔁 resend verification email -----------------
  const handleResend = async () => {
    if (!email) return;
    try {
      setLoading(true);
      await axios.post(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/auth/resend-verification-email`,
        { email: email.trim() }, // removes any extra spaces
      );
      setStatus(t('resend.success'));
      setTimeout(() => {
        setStatus('');
        setStep('resendSuccess');
      }, 1500);
    } catch (err) {
      console.error(err);

      if (err.response) {
        const { status, data } = err.response;

        if (status === 400 && data.message === 'Email already verified') {
          setStatus(t('resend.alreadyVerified'));
          setStep('success'); // email already verified → treat as success
        } else if (status === 404 && data.message === 'User not found') {
          setStatus(t('resend.userNotFound'));
        } else {
          setStatus(t('resend.error'));
        }
      } else {
        setStatus(t('resend.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------- RESEND EMAIL SUCCESSEDED -----------------
  if (step === 'resendSuccess') {
    return (
      <EmailDialog
        icon="✅"
        title={t('resendSuccess.title')}
        message={t('resendSuccess.message')}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button
          className="resend-btn"
          onClick={() => setStep('resend')}
          disabled={loading}
        >
          {t('resendSuccess.button')} {/* "Resend again" */}
        </button>
      </EmailDialog>
    );
  }

  // ------------- ⚠️ no email in state -----------------
  if (!email && !token) {
    return (
      <EmailDialog
        icon="⚠️"
        title={t('missingEmailTitle')}
        message={t('missingEmailMessage')}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      />
    );
  }

  // ------------- ✅ verify from signup (no token) -----------------
  if (step === 'verify' && !token) {
    return (
      <EmailDialog
        icon={t('verify.icon')}
        title={t('verify.title')}
        message={t('verify.message', { email })}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button
          className="resend-btn"
          onClick={() => setStep('resend')}
          disabled={loading}
        >
          {loading ? t('loading') : t('verify.button')}
        </button>
      </EmailDialog>
    );
  }

  // ------------- 🔁 resend -----------------
  if (step === 'resend') {
    return (
      <EmailDialog
        icon={t('resend.icon')}
        title={t('resend.title')}
        message={t('resend.message')}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button
          className="resend-btn"
          onClick={handleResend}
          disabled={loading}
        >
          {loading ? t('loading') : t('resend.button')}
        </button>
        {status && <p className="email-success">{status}</p>}
      </EmailDialog>
    );
  }

  // ------------- 🎉 success -----------------
  if (step === 'success') {
    return (
      <EmailDialog
        icon={t('success.icon')}
        title={t('success.title')}
        message={t('success.message')}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button className="resend-btn" onClick={() => navigate('/login')}>
          {t('success.button')}
        </button>
      </EmailDialog>
    );
  }

  // ------------- ❌ error -----------------
  if (step === 'error') {
    return (
      <EmailDialog
        icon="❌"
        title={t('error.title')}
        message={t('error.message')}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button className="resend-btn" onClick={() => navigate('/signup')}>
          {t('error.button')}
        </button>
      </EmailDialog>
    );
  }
};

export default EmailFlow;
