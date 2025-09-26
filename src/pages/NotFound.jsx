import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  // لغة الصفحة هذه فقط
  const [pageLang, setPageLang] = useState("en");
  const isAr = pageLang === "ar";
  const toggleLang = () => setPageLang(isAr ? "en" : "ar");

  return (
    <>
      {/* الهيدر البسيط */}
      <header className="nf-header">
        <img src="/Type=logo.png" alt="Site logo" className="nf-header__logo" />

        {/* أيقونة اللغة (تبديل محلي) */}
        <img
          src="/Icon=language.png"
          alt={isAr ? "تغيير اللغة" : "Change language"}
          className="nf-header__lang"
          onClick={toggleLang}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" ? toggleLang() : null)}
          style={{ cursor: "pointer" }}
        />
      </header>

      {/* نضيف كلاس محلي عند العربية */}
      <main className={`notfound ${isAr ? "notfound--ar" : ""}`}>
        <div className="notfound__inner">
          <div className="notfound__code">404</div>

          <h1 className="notfound__title">
            {isAr ? "عفوًا!" : "Oops!"}
          </h1>

          <h2 className="notfound__lead">
            {isAr ? "يبدو أنك سلكت طريقًا خاطئًا." : "Looks like you took a wrong turn."}
          </h2>

          <p className="notfound__text">
            {isAr
              ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. خلّنا نرجّعك للطريق الصحيح!"
              : "The page you’re looking for doesn’t exist or has been moved. Let’s get you back on track!"}
          </p>

          <Link to="/" className="notfound__btn">
            {isAr ? "العودة للصفحة الرئيسية" : "Return to Homepage"}
          </Link>
        </div>
      </main>
    </>
  );
}