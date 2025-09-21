import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function Signup() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
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
    });

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedValue = type === 'checkbox' ? checked : value;

        setFormData({ ...formData, [name]: updatedValue });

        let error = '';
        if (
            (name === 'commercialRegister' || name === 'nationalId') &&
            updatedValue
        ) {
            if (!/^\d+$/.test(updatedValue))
                error = t('signup.errors.numbersOnly');
        }
        if (name === 'email' && updatedValue) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updatedValue))
                error = t('signup.errors.invalidEmail');
        }
        if (name === 'confirmPassword' && updatedValue) {
            if (updatedValue !== formData.password)
                error = t('signup.errors.passwordMismatch');
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
                formData.name &&
                /^\d+$/.test(formData.nationalId) &&
                formData.city
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

    const nextStep = () => {
        if (isStepValid()) {
            if (step === 3) {
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        name: formData.name,
                    }),
                );
                navigate('/login');
            } else {
                setStep((prev) => prev + 1);
            }
        }
    };

    const prevStep = () => setStep((prev) => prev - 1);

    return (
        <div className="signup-page">
            {/* تم إزالة الهيدر هنا؛ الهيدر الأصلي من App.jsx هو المستخدم */}

            <div className="signup-container">
                <div className="signup-form">
                    <h2>{t(`signup.step${step}Title`)}</h2>

                    {step === 1 && (
                        <>
                            <input
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                placeholder={t('signup.businessName')}
                                className={
                                    formErrors.businessName ? 'error' : ''
                                }
                            />
                            {formErrors.businessName && (
                                <p className="error-message">
                                    {formErrors.businessName}
                                </p>
                            )}

                            <input
                                name="commercialRegister"
                                value={formData.commercialRegister}
                                onChange={handleChange}
                                placeholder={t('signup.commercialRegister')}
                                className={
                                    formErrors.commercialRegister ? 'error' : ''
                                }
                            />
                            {formErrors.commercialRegister && (
                                <p className="error-message">
                                    {formErrors.commercialRegister}
                                </p>
                            )}

                            <select
                                name="businessActivity"
                                value={formData.businessActivity}
                                onChange={handleChange}
                                className={
                                    formErrors.businessActivity ? 'error' : ''
                                }
                            >
                                <option
                                    value=""
                                    hidden
                                >
                                    {t('signup.businessActivity')}
                                </option>
                                <option>Activity 1</option>
                                <option>Activity 2</option>
                            </select>

                            <p className="login-text">
                                {t('signup.haveAccount')}{' '}
                                <span
                                    className="login-link"
                                    onClick={() => navigate('/login')}
                                >
                                    {t('signup.login')}
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
                                placeholder={t('signup.name')}
                                className={formErrors.name ? 'error' : ''}
                            />
                            {formErrors.name && (
                                <p className="error-message">
                                    {formErrors.name}
                                </p>
                            )}

                            <input
                                name="nationalId"
                                value={formData.nationalId}
                                onChange={handleChange}
                                placeholder={t('signup.nationalId')}
                                className={formErrors.nationalId ? 'error' : ''}
                            />
                            {formErrors.nationalId && (
                                <p className="error-message">
                                    {formErrors.nationalId}
                                </p>
                            )}

                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder={t('signup.city')}
                                className={formErrors.city ? 'error' : ''}
                            />
                            {formErrors.city && (
                                <p className="error-message">
                                    {formErrors.city}
                                </p>
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
                                placeholder={t('signup.email')}
                                className={formErrors.email ? 'error' : ''}
                            />
                            {formErrors.email && (
                                <p className="error-message">
                                    {formErrors.email}
                                </p>
                            )}

                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('signup.password')}
                                className={formErrors.password ? 'error' : ''}
                            />

                            <input
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={t('signup.confirmPassword')}
                                className={
                                    formErrors.confirmPassword ? 'error' : ''
                                }
                            />
                            {formErrors.confirmPassword && (
                                <p className="error-message">
                                    {formErrors.confirmPassword}
                                </p>
                            )}

                            <label className="checkbox">
                                <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                />
                                {t('signup.agree')}{' '}
                                <a
                                    href="/terms"
                                    className="terms-link"
                                >
                                    {t('signup.terms')}
                                </a>
                            </label>
                        </>
                    )}

                    <div className="form-navigation">
                        {step > 1 && (
                            <button
                                className="nav-btn"
                                onClick={prevStep}
                            >
                                {t('signup.back')}
                            </button>
                        )}
                        <button
                            className="submit-btn"
                            disabled={!isStepValid()}
                            onClick={nextStep}
                        >
                            {step === 3 ? t('signup.done') : t('signup.next')}
                        </button>
                    </div>
                </div>

                <div className="signup-image">
                    <img
                        src={`/step${step}${
                            i18n.language === 'ar' ? '-ar' : ''
                        }.png`}
                        alt="Step"
                    />
                </div>
            </div>
        </div>
    );
}

export default Signup;
