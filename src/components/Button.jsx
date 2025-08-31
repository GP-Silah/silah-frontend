import { useTranslation } from 'react-i18next';

function Button({ label, onClick, className = '' }) {
    const { i18n } = useTranslation();
    const isArabic = i18n.language === 'ar';
    const fullClassName = `${className} ${isArabic ? 'arabic-btn' : ''}`.trim();

    return (
        <button
            onClick={onClick}
            className={fullClassName}
        >
            {label}
        </button>
    );
}

export default Button;
