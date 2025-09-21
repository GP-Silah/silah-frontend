import React from "react";
import { useTranslation } from "react-i18next";
import "./LegalPages.css"; // ملف CSS مشترك للشروط والخصوصية

const TermsOfService = () => {
    const { t } = useTranslation();

    return (
        <main className="legal-container">
            <h1>{t("terms.title")}</h1>
            <p>{t("terms.intro")}</p>

            <h2>1. {t("terms.eligibility.title")}</h2>
            <p>{t("terms.eligibility.text")}</p>
            <ul>
                <li>{t("terms.eligibility.point1")}</li>
                <li>{t("terms.eligibility.point2")}</li>
                <li>{t("terms.eligibility.point3")}</li>
                <li>{t("terms.eligibility.note")}</li>
            </ul>

            <h2>2. {t("terms.services.title")}</h2>
            <p>{t("terms.services.text")}</p>

            <h2>3. {t("terms.payments.title")}</h2>
            <p>{t("terms.payments.text")}</p>

            <h2>4. {t("terms.content.title")}</h2>
            <p>{t("terms.content.text")}</p>

            <h2>5. {t("terms.retention.title")}</h2>
            <p>{t("terms.retention.text")}</p>

            <h2>6. {t("terms.liability.title")}</h2>
            <p>{t("terms.liability.text")}</p>

            <h2>7. {t("terms.law.title")}</h2>
            <p>{t("terms.law.text")}</p>

            <h2>8. {t("terms.modifications.title")}</h2>
            <p>{t("terms.modifications.text")}</p>

            <h2>9. {t("terms.contact.title")}</h2>
            <p>{t("terms.contact.text")}</p>
        </main>
    );
};

export default TermsOfService;
