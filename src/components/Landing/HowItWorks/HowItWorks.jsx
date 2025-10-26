import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './HowItWorks.css';

function HowItWorks() {
  const { t, i18n } = useTranslation('landing');
  const isRTL = i18n.language === 'ar';

  const steps = [
    { number: 1, text: t('how.step1') },
    { number: 2, text: t('how.step2') },
    { number: 3, text: t('how.step3') },
    { number: 4, text: t('how.step4') },
  ];

  return (
    <section
      className={`how-it-works-section ${isRTL ? 'rtl' : ''}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <motion.div
        className="how-container"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="how-title">{t('how.title')}</h2>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div key={step.number} className="step-item">
              <div className="circle">{step.number}</div>
              <p className="step-text">{step.text}</p>

              {/* Connector line (except last) */}
              {index < steps.length - 1 && <div className="line" />}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export default HowItWorks;
