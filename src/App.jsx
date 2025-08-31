import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login'; // ✅ مهم جدًا

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
            </Routes>
        </div>
    );
}

export default App;
