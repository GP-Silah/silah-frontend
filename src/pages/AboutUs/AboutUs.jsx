import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AboutUs.css';

const AboutUs = () => {
  const { t, i18n } = useTranslation('about');

  useEffect(() => {
    document.title = t('pageTitle.about', {ns:'common'});

    const sections = document.querySelectorAll('.fade-section');

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
    <main className="about-page">
      {/* Header Section */}
      <section className="about-header fade-section">
        <p className="section-label">{t('label')}</p>
        <h1>{t('title')}</h1>
        <blockquote>{t('quote')}</blockquote>
      </section>

      {/* Story / Mission / Vision */}
      <section className="story-mission-vision fade-section">
        <div className="smv-item">
          <h2>{t('story.title')}</h2>
          <p>{t('story.text')}</p>
        </div>

        <div className="smv-item">
          <h2>{t('mission.title')}</h2>
          <p>{t('mission.text')}</p>
        </div>

        <div className="smv-item">
          <h2>{t('vision.title')}</h2>
          <p>{t('vision.text')}</p>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values fade-section">
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
      <section className="cta fade-section">
        <h3>{t('cta.title')}</h3>
        <p>{t('cta.text')}</p>
        <Link to="/signup">
          <button className="cta-btn">{t('cta.button')}</button>
        </Link>
      </section>
    </main>
  );
};

//   return (
//     <main className="about-page">
//       {/* Header Section */}
//       <section className="about-header fade-section">
//         <p className="section-label">{t('about.label')}</p>
//         <h1>{t('about.title')}</h1>
//         <blockquote>{t('about.quote')}</blockquote>
//       </section>

//       {/* Story / Mission / Vision */}
//       <section className="story-mission-vision fade-section">
//         <div className="smv-item">
//           <h2>{t('about.story.title')}</h2>
//           <p>{t('about.story.text')}</p>
//         </div>

//         <div className="smv-item">
//           <h2>{t('about.mission.title')}</h2>
//           <p>{t('about.mission.text')}</p>
//         </div>

//         <div className="smv-item">
//           <h2>{t('about.vision.title')}</h2>
//           <p>{t('about.vision.text')}</p>
//         </div>
//       </section>

//       {/* Core Values */}
//       <section className="core-values fade-section">
//         <h2>{t('about.values.title')}</h2>
//         <ul>
//           <li>{t('about.values.connectivity')}</li>
//           <li>{t('about.values.innovation')}</li>
//           <li>{t('about.values.trust')}</li>
//           <li>{t('about.values.efficiency')}</li>
//           <li>{t('about.values.empowerment')}</li>
//         </ul>
//       </section>

//       {/* CTA */}
//       <section className="cta fade-section">
//         <h3>{t('about.cta.title')}</h3>
//         <p>{t('about.cta.text')}</p>
//         <Link to="/signup">
//           <button className="cta-btn">{t('about.cta.button')}</button>
//         </Link>
//       </section>
//     </main>
//   );
// };

export default AboutUs;
