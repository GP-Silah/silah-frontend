import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import RequestPasswordReset from './pages/RequestPasswordReset'; // جديد
import PasswordReset from './pages/PasswordReset'; // جديد

function App() {
    const { i18n } = useTranslation();

    return (
        <div className={i18n.language === 'ar' ? 'lang-ar' : 'lang-en'}>
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

                {/* مسار احتياطي */}
                <Route
                    path="*"
                    element={<Landing />}
                />
            </Routes>
        </div>
    );
}

export default App;
