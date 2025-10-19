import React from "react";
import "./EmailDialog.css"; // ✅ نربطه بملفه الخاص

const EmailDialog = ({ icon, title, message, lang, onToggleLang, children }) => {
  return (
    <div className="email-container">
      <div className={`email-card ${lang === "ar" ? "rtl" : ""}`}>
        <div className="email-icon">{icon}</div>
        <h2 className="email-title">{title}</h2>
        <p className="email-message">{message}</p>

        {children && <div className="email-actions">{children}</div>}

        <button className="toggle-btn" onClick={onToggleLang}>
          {lang === "en" ? "العربية" : "English"}
        </button>
      </div>
    </div>
  );
};

export default EmailDialog;
