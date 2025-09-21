import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Header from './components/Header';
import Footer from './components/Footer';

import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import RequestPasswordReset from './pages/RequestPasswordReset';
import PasswordReset from './pages/PasswordReset';

import AboutUs from './pages/AboutUs';
import TermsOfService from './pages/TermsOfService';
import Privacy from './pages/PrivacyPolicy';

function App() {
    const { i18n } = useTranslation();

    return (
        <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
            <Header />
            <Routes>
                <Route
                    path="/"
                    element={<Landing />}
                />
                <Route
                    path="/signup"
                    element={<Signup />}
                />
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* صفحات إعادة تعيين كلمة المرور */}
                <Route
                    path="/reset-password"
                    element={<RequestPasswordReset />}
                />
                <Route
                    path="/reset-password/confirm"
                    element={<PasswordReset />}
                />

                {/* صفحات ثابتة (احذفيها إذا ما عندك الملفات) */}
                <Route
                    path="/about"
                    element={<AboutUs />}
                />
                <Route
                    path="/terms"
                    element={<TermsOfService />}
                />
                <Route
                    path="/privacy"
                    element={<Privacy />}
                />

                {/* مسار احتياطي */}
                <Route
                    path="*"
                    element={<Landing />}
                />
            </Routes>
            <Footer />
        </div>
    );
}

export default App;
