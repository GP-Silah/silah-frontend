import React from "react";
import { useTranslation } from "react-i18next";
import "./Overview.css";


function SupplierOverview() {
  const { t } = useTranslation();

  return (
    <div className="supplier-overview">

      {/* العنوان */}
      <header className="overview-header">
        <h1 className="overview-title">Welcome back, Saad! 👋</h1>
        <p className="overview-subtitle">
          Here&apos;s a quick overview of your business.
        </p>
      </header>

      {/* الكروت */}
      <section className="overview-cards">
        <article className="overview-card">
          <div className="card-icon-wrapper">
            <img src="/status-icon.png" alt="Store status" className="card-icon" />
          </div>
          <h2 className="card-title">Store Status</h2>
          <p className="card-main-text">Open for Business</p>
          <button className="card-button">Store Settings</button>
        </article>

        <article className="overview-card">
          <div className="card-icon-wrapper">
            <img src="/pending-icon.png" alt="Pending orders" className="card-icon" />
          </div>
          <h2 className="card-title">Pending Orders</h2>
          <p className="card-main-text card-number">5</p>
          <button className="card-button">View</button>
        </article>

        <article className="overview-card">
          <div className="card-icon-wrapper">
            <img src="/stock-icon.png" alt="Stock levels" className="card-icon" />
          </div>
          <h2 className="card-title">Stock Levels</h2>
          <p className="card-main-text">Very Low</p>
          <button className="card-button">Update</button>
        </article>
      </section>

      {/* البلان */}
      <section className="overview-plan">
        <p className="plan-text">
          Your Plan: <span className="plan-name">Basic</span>
        </p>
        <p className="plan-subtext">
          Upgrade to Premium for AI Insights &amp; Unlimited Listings!
        </p>
        <button className="plan-button">Manage Plan</button>
      </section>
    </div>
  );
}

export default SupplierOverview;