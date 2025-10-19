import React, { useEffect } from 'react';
import HeroSection from '../../components/Landing/HeroSection/HeroSection';
import WhyChooseUs from '../../components/Landing/WhyChooseUs/WhyChooseUs';
import HowItWorks from '../../components/Landing/HowItWorks/HowItWorks';
import ExploreCategories from '../../components/Landing/ExploreCategories/ExploreCategories'; // أو './ExploreCategories' حسب المسار
import { useTranslation } from 'react-i18next';

import '../../App.css';

function Landing() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('pageTitle.landing', { ns: 'common' });
  }, [t, i18n.language]);

  return (
    <div className={`landing-page ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <HeroSection />
      <div className="container">
        <WhyChooseUs />
        <HowItWorks />
        <ExploreCategories />
      </div>
    </div>
  );
}

export default Landing;
