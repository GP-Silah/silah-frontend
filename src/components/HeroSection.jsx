import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom'; // ✅ استدعاء useNavigate
import './HeroSection.css';

const HeroSection = () => {
    const { t } = useTranslation();
    const navigate = useNavigate(); // ✅ تعريف الدالة

    return (
        <section className="hero-section">
            <div className="hero-content">
                <div className="hero-text">
                    <h1>{t('heroTitle')}</h1>
                    <p>{t('heroSubtitle')}</p>

                    {/* ✅ الزر يوجه لصفحة التسجيل */}
                    <button
                        className="get-started-btn"
                        onClick={() => navigate('/signup')}
                    >
                        {t('getStarted')}
                    </button>
                </div>
                <div className="hero-image">
                    <img
                        src="Stockpic.jpg"
                        alt="Hero Visual"
                    />
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
