import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignupBusinessActivity from '@/components/SingupBusinessActivity/SignupBusinessActivity';
import './Signup.css';

function Signup() {
  const { t, i18n } = useTranslation('signup');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = t('pageTitle.signup', { ns: 'common' });
  }, [t, i18n.language]);

  // Load initial state from localStorage
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('signupForm');
    return saved
      ? JSON.parse(saved)
      : {
          businessName: '',
          commercialRegister: '',
          businessActivity: '',
          name: '',
          nationalId: '',
          city: '',
          email: '',
          password: '',
          confirmPassword: '',
          termsAccepted: false,
          prefferedLanguage: i18n.language.toUpperCase(),
        };
  });

  // Save on every change
  useEffect(() => {
    localStorage.setItem('signupForm', JSON.stringify(formData));
  }, [formData]);

  const [step, setStep] = useState(() => {
    const savedStep = localStorage.getItem('signupStep');
    return savedStep ? Number(savedStep) : 1;
  });

  useEffect(() => {
    localStorage.setItem('signupStep', step);
  }, [step]);

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: updatedValue });

    let error = '';

    switch (name) {
      case 'commercialRegister':
        if (!/^\d{10}$/.test(updatedValue)) error = t('errors.invalidCRN');
        break;
      case 'nationalId':
        if (!/^\d{10}$/.test(updatedValue)) error = t('errors.invalidNID');
        break;
      case 'city':
        if (
          updatedValue &&
          !/^[\u0600-\u06FFa-zA-Z\s-]+$/u.test(updatedValue)
        ) {
          error = t('errors.invalidCity');
        }
        break;
      case 'email':
        if (updatedValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedValue))
          error = t('errors.invalidEmail');
        break;
      case 'password':
        if (
          updatedValue &&
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#!$]{8,28}$/.test(
            updatedValue,
          )
        )
          error = t('errors.weakPassword');
        break;
      case 'confirmPassword':
        if (updatedValue !== formData.password)
          error = t('errors.passwordMismatch');
        break;
    }

    setFormErrors({ ...formErrors, [name]: error });
  };

  const isStepValid = () => {
    if (step === 1) {
      return (
        formData.businessName &&
        /^\d+$/.test(formData.commercialRegister) &&
        formData.businessActivity
      );
    } else if (step === 2) {
      return (
        formData.name && /^\d+$/.test(formData.nationalId) && formData.city
      );
    } else if (step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return (
        formData.email &&
        emailRegex.test(formData.email) &&
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword &&
        formData.termsAccepted
      );
    }
    return false;
  };

  const nextStep = async () => {
    if (!isStepValid()) return;

    // Step 3 means time to call backend
    if (step === 3) {
      setLoading(true);
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          crn: formData.commercialRegister,
          businessName: formData.businessName,
          city: formData.city,
          nid: formData.nationalId,
          categories: formData.businessActivity,
          agreedToTerms: formData.termsAccepted,
          preferredLanguage: i18n.language.toUpperCase(),
        };

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
          payload,
          { withCredentials: true }, // << important, used to store the token cookie
        );

        // ✅ Clear local storage after successful signup
        localStorage.removeItem('signupForm');
        localStorage.removeItem('signupStep');

        // if we reach here → signup succeeded
        navigate('/verify-email', { state: { email: formData.email } });
      } catch (err) {
        console.log(err);

        // Handle real + swagger formats, and handle arrays safely
        let backendMessage =
          err.response?.data?.error?.message || err.response?.data?.message;

        if (backendMessage) {
          const msg = backendMessage;

          if (msg.includes('NID already exists')) {
            setFormErrors((prev) => ({
              ...prev,
              nationalId: t('errors.nidExists'),
            }));
            setStep(2);
            return; // ✅ stop here to let React re-render
          } else if (msg.includes('CRN already exists')) {
            setFormErrors((prev) => ({
              ...prev,
              commercialRegister: t('errors.crnExists'),
            }));
            setStep(1);
            return;
          } else if (msg.includes('Email already exists')) {
            setFormErrors((prev) => ({
              ...prev,
              email: t('errors.emailExists'),
            }));
            setStep(3);
            return;
          } else if (msg.includes('Temporary issue with provider')) {
            alert(t('errors.wathqTemporary'));
            return;
          } else if (msg.includes('does not exist in Wathq records')) {
            setFormErrors((prev) => ({
              ...prev,
              commercialRegister: t('errors.wathqNotFound'),
            }));
            setStep(1);
            return;
          } else if (msg.includes('not active')) {
            setFormErrors((prev) => ({
              ...prev,
              commercialRegister: t('errors.wathqSuspended'),
            }));
            setStep(1);
            return;
          }
        } else {
          alert(t('errors.networkError'));
        }
      } finally {
        setLoading(false);
      }
    } else {
      // move to next step normally
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-form">
          <h2>{t(`step${step}Title`)}</h2>

          {step === 1 && (
            <>
              <input
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder={t('businessName')}
                className={formErrors.businessName ? 'error' : ''}
              />
              {formErrors.businessName && (
                <p className="error-message">{formErrors.businessName}</p>
              )}

              <input
                name="commercialRegister"
                value={formData.commercialRegister}
                onChange={handleChange}
                placeholder={t('commercialRegister')}
                className={formErrors.commercialRegister ? 'error' : ''}
              />
              {formErrors.commercialRegister && (
                <p className="error-message">{formErrors.commercialRegister}</p>
              )}

              <SignupBusinessActivity
                value={formData.businessActivity} // array of selected category IDs
                onChange={(selectedIds) =>
                  setFormData({ ...formData, businessActivity: selectedIds })
                }
              />

              <p className="login-text">
                {t('haveAccount')}{' '}
                <span className="login-link" onClick={() => navigate('/login')}>
                  {t('login')}
                </span>
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('name')}
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && (
                <p className="error-message">{formErrors.name}</p>
              )}

              <input
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder={t('nationalId')}
                className={formErrors.nationalId ? 'error' : ''}
              />
              {formErrors.nationalId && (
                <p className="error-message">{formErrors.nationalId}</p>
              )}

              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder={t('city')}
                className={formErrors.city ? 'error' : ''}
              />
              {formErrors.city && (
                <p className="error-message">{formErrors.city}</p>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('email')}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && (
                <p className="error-message">{formErrors.email}</p>
              )}

              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('password')}
                className={formErrors.password ? 'error' : ''}
              />
              {formErrors.password && (
                <p className="error-message">{formErrors.password}</p>
              )}

              <input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('confirmPassword')}
                className={formErrors.confirmPassword ? 'error' : ''}
              />
              {formErrors.confirmPassword && (
                <p className="error-message">{formErrors.confirmPassword}</p>
              )}

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                {t('agree')}{' '}
                <a href="/terms" className="terms-link">
                  {t('terms')}
                </a>
              </label>
            </>
          )}

          <div className="form-navigation">
            {step > 1 && (
              <button className="nav-btn" onClick={prevStep}>
                {t('back')}
              </button>
            )}
            <button
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading || !isStepValid()}
              onClick={nextStep}
            >
              {loading ? (
                <>
                  {t('signingUp')}
                  <span className="loading-spinner"></span>
                </>
              ) : step === 3 ? (
                t('done')
              ) : (
                t('next')
              )}
            </button>
          </div>
        </div>

        <div className="signup-image">
          <img
            src={`/step${step}${i18n.language === 'ar' ? '-ar' : ''}.png`}
            alt="Step"
          />
        </div>
      </div>
    </div>
  );
}

export default Signup;
