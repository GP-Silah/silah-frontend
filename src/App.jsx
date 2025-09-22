import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Header from './components/Header';
import Footer from './components/Footer';

import Landing from './pages/Landing';
import Signup from './pages/Signup/Signup';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';
import EmailSuccess from './pages/VerifyEmail/EmailSuccess';
import ResendVerificationEmail from './pages/VerifyEmail/ResendVerificationEmail';
import Login from './pages/Login/Login';
import RequestPasswordReset from './pages/ResetPassword/RequestPasswordReset';
import PasswordReset from './pages/ResetPassword/PasswordReset';

import AboutUs from './pages/AboutUs/AboutUs';
import TermsOfService from './pages/LegalPages/TermsOfService';
import Privacy from './pages/LegalPages/PrivacyPolicy';

function App() {
  const { i18n } = useTranslation();

  return (
    <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
      {/* TODO: this header is for guest users only, need to create
      another header for logged in users and use react-router-dom to show the
      correct header based on authentication status */}
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-success" element={<EmailSuccess />} />
        <Route
          path="/resend-verification-email"
          element={<ResendVerificationEmail />}
        />

        {/* صفحات إعادة تعيين كلمة المرور */}
        <Route path="/reset-password" element={<RequestPasswordReset />} />
        <Route path="/reset-password/confirm" element={<PasswordReset />} />

        {/* صفحات ثابتة (احذفيها إذا ما عندك الملفات) */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* مسار احتياطي 
        No here fayrouz add here 404 page if I understood correctly*/}
        <Route path="*" element={<Landing />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
