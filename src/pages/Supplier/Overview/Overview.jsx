import React from "react";
import { useTranslation } from "react-i18next";
import "./Overview.css";

function SupplierOverview() {
  // نربط الصفحة بملف الترجمة supplierOverview.json
  const { t } = useTranslation("supplierOverview");

  // اسم المورد مؤقت
  const supplierName = "Saad";

  return (
    <div className="supplier-overview">
      {/* العنوان */}
      <header className="overview-header">
        <h1 className="overview-title">
          {t("header.title", { name: supplierName })}
        </h1>
        <p className="overview-subtitle">{t("header.subtitle")}</p>
      </header>

      {/* الكروت */}
      <section className="overview-cards">
        {/* الكرت الأول */}
        <article className="overview-card">
          <div className="card-icon-wrapper">
            <img
              src="/status-icon.png"
              alt={t("cards.status.title")}
              className="card-icon"
            />
          </div>
          <h2 className="card-title">{t("cards.status.title")}</h2>
          <p className="card-main-text">{t("cards.status.text")}</p>
          <button className="card-button">{t("cards.status.button")}</button>
        </article>

        {/* الكرت الثاني */}
        <article className="overview-card">
          <div className="card-icon-wrapper">
            <img
              src="/pending-icon.png"
              alt={t("cards.pending.title")}
              className="card-icon"
            />
          </div>
          <h2 className="card-title">{t("cards.pending.title")}</h2>
          <p className="card-main-text card-number">5</p>
          <button className="card-button">{t("cards.pending.button")}</button>
        </article>

        {/* الكرت الثالث */}
        <article className="overview-card">
          <div className="card-icon-wrapper">
            <img
              src="/stock-icon.png"
              alt={t("cards.stock.title")}
              className="card-icon"
            />
          </div>
          <h2 className="card-title">{t("cards.stock.title")}</h2>
          <p className="card-main-text">{t("cards.stock.text")}</p>
          <button className="card-button">{t("cards.stock.button")}</button>
        </article>
      </section>

      {/* الخطة */}
      <section className="overview-plan">
        <p className="plan-text">
          {t("plan.label")}{" "}
          <span className="plan-name">{t("plan.planName")}</span>
        </p>
        <p className="plan-subtext">{t("plan.subtitle")}</p>
        <button className="plan-button">{t("plan.button")}</button>
      </section>
    </div>
  );
}

export default SupplierOverview;