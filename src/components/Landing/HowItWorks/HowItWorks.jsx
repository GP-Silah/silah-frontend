// components/HowItWorks.jsx
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';

function HowItWorks() {
  const { i18n } = useTranslation('landing');

  // نختار الصورة حسب اللغة الحالية
  const imageSrc =
    i18n.language === 'ar' ? '/Howitworkspic-ar.jpg' : '/Howitworkspic.jpg';

  return (
    <section className="how-it-works-section">
      <motion.div
        className="how-it-works-image"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <img src={imageSrc} alt="How It Works" />
      </motion.div>
    </section>
  );
}

export default HowItWorks;
