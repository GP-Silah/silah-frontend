import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const { t } = useTranslation('footer');

  return (
    <footer className="footer">
      <div className="footer-links">
        <Link to="/about-us">{t('about')}</Link>
        <span>|</span>
        <Link to="/terms-of-service">{t('terms')}</Link>
        <span>|</span>
        <Link to="/privacy-policy">{t('privacy')}</Link>
        <span>|</span>
        <a href="mailto:info@silah.site">{t('contact')}: info@silah.site</a>
      </div>
      <p className="copyright">©️ 2025 Silah. {t('rights')}</p>
    </footer>
  );
}

export default Footer;
