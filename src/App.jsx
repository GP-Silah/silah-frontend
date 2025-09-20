import { Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login"; // ✅ مهم جدًا
import AboutUs from "./pages/AboutUs";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Footer from "./components/Footer";
import Header from "./components/Header";

function App() {
    const { i18n } = useTranslation();

    return (
        <div className={i18n.language === "ar" ? "lang-ar" : "lang-en"}>
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
                    element={<PrivacyPolicy />}
                />
            </Routes>
            <Footer />
        </div>
    );
}

export default App;
