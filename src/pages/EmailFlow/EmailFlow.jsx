import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./EmailFlow.css"; // ✅ ملف CSS خاص بالصفحة
import EmailDialog from "../../components/EmailDialog";
import "../../i18n";

const EmailFlow = () => {
  const { t, i18n } = useTranslation("EmailFlow");
  const [step, setStep] = useState("verify");
  const [status, setStatus] = useState("");
  const email = "example@gmail.com";

  const handleLangToggle = () => {
    i18n.changeLanguage(i18n.language === "en" ? "ar" : "en");
  };

  const handleResend = () => {
    setStatus(t("resend.success"));
    setTimeout(() => {
      setStatus("");
      setStep("success");
    }, 2000);
  };

  if (step === "verify") {
    return (
      <EmailDialog
        icon={t("verify.icon")}
        title={t("verify.title")}
        message={t("verify.message", { email })}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button className="resend-btn" onClick={() => setStep("resend")}>
          {t("verify.button")}
        </button>
      </EmailDialog>
    );
  }

  if (step === "resend") {
    return (
      <EmailDialog
        icon={t("resend.icon")}
        title={t("resend.title")}
        message={t("resend.message")}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      >
        <button className="resend-btn" onClick={handleResend}>
          {t("resend.button")}
        </button>
        {status && <p className="email-success">{status}</p>}
      </EmailDialog>
    );
  }

  if (step === "success") {
    return (
      <EmailDialog
        icon={t("success.icon")}
        title={t("success.title")}
        message={t("success.message")}
        lang={i18n.language}
        onToggleLang={handleLangToggle}
      />
    );
  }
};

export default EmailFlow;
