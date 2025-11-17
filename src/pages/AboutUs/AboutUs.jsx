import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './AboutUs.module.css'; // ← فقط غيرت الإمبورت

const AboutUs = () => {
  const { t, i18n } = useTranslation('about');

  useEffect(() => {
    document.title = t('pageTitle.about', { ns: 'common' });
    const sections = document.querySelectorAll('.fade-section'); // ← بقي كما هو لأن الكلاس عالمي في الأنيميشن
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 },
    );
    sections.forEach((sec) => observer.observe(sec));
  }, [t, i18n.language]);

  return (
    <main className={styles['about-page']}>
      {/* Header Section */}
      <section className={`${styles['about-header']} fade-section`}>
        <p className={styles['section-label']}>{t('label')}</p>
        <h1>{t('title')}</h1>
        <blockquote>{t('quote')}</blockquote>
      </section>

      {/* Story / Mission / Vision */}
      <section className={`${styles['story-mission-vision']} fade-section`}>
        <div className={styles['smv-item']}>
          <h2>{t('story.title')}</h2>
          <p>{t('story.text')}</p>
        </div>
        <div className={styles['smv-item']}>
          <h2>{t('mission.title')}</h2>
          <p>{t('mission.text')}</p>
        </div>
        <div className={styles['smv-item']}>
          <h2>{t('vision.title')}</h2>
          <p>{t('vision.text')}</p>
        </div>
      </section>

      {/* Core Values */}
      <section className={`${styles['core-values']} fade-section`}>
        <h2>{t('values.title')}</h2>
        <ul>
          <li>{t('values.connectivity')}</li>
          <li>{t('values.innovation')}</li>
          <li>{t('values.trust')}</li>
          <li>{t('values.efficiency')}</li>
          <li>{t('values.empowerment')}</li>
        </ul>
      </section>

      {/* CTA */}
      <section className={`${styles['cta']} fade-section`}>
        <h3>{t('cta.title')}</h3>
        <p>{t('cta.text')}</p>
        <Link to="/signup">
          <button className={styles['cta-btn']}>{t('cta.button')}</button>
        </Link>
      </section>
    </main>
  );
};

export default AboutUs;
