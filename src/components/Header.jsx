import React from "react";
import "./Header.css";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/*
<img
    src={logo}
    alt="Logo"
/>;*/

const Header = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const toggleLanguage = () => {
        const newLang = i18n.language === "ar" ? "en" : "ar";
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="header">
            <div className="header-left">
                <img
                    src="/logo.png"
                    alt="Logo"
                    className="logo"
                />

                <select className="category-select">
                    <option hidden>{t("header.category")}</option>
                    <option>{t("header.filters.agriculture")}</option>
                    <option>{t("header.filters.beauty")}</option>
                    <option>{t("header.filters.fashion")}</option>
                    <option>{t("header.filters.food")}</option>
                    <option>{t("header.filters.home")}</option>
                    <option>{t("header.filters.hardware")}</option>
                    <option>{t("header.filters.packaging")}</option>
                    <option>{t("header.filters.energy")}</option>
                    <option>{t("header.filters.business")}</option>
                    <option>{t("header.filters.it")}</option>
                    <option>{t("header.filters.shipping")}</option>
                    <option>{t("header.filters.design")}</option>
                    <option>{t("header.filters.manufacturing")}</option>
                    <option>{t("header.filters.technical")}</option>
                    <option>{t("header.filters.legal")}</option>
                </select>
            </div>

            <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder={t("header.searchPlaceholder")}
                />
                <select className="product-select">
                    <option>{t("tabs.products")}</option>
                    <option>{t("tabs.services")}</option>
                </select>
            </div>

            <div className="header-right">
                <button
                    className="language-toggle"
                    onClick={toggleLanguage}
                >
                    <FaGlobe />
                </button>

                {/* ✅ زر Login يوديك لصفحة /login */}
                <button
                    className="login-btn"
                    onClick={() => navigate("/login")}
                >
                    {t("header.login")}
                </button>

                <button
                    className="signup-btn"
                    onClick={() => navigate("/signup")}
                >
                    {t("header.signup")}
                </button>
            </div>
        </header>
    );
};

export default Header;
