import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-links">
                <Link to="/about">{t("footer.about")}</Link>
                <span>|</span>
                <Link to="/terms">{t("footer.terms")}</Link>
                <span>|</span>
                <Link to="/privacy">{t("footer.privacy")}</Link>
                <span>|</span>
                <a href="mailto:info@silah.site">
                    {t("footer.contact")}: info@silah.site
                </a>
            </div>
            <p className="copyright">©️ 2025 Silah. {t("footer.rights")}</p>
        </footer>
    );
}

//     return (
//         <footer className="footer">
//             <div className="footer-links">
//                 <a href="#">{t("footer.about")}</a>
//                 <span>|</span>
//                 <a href="#">{t("footer.terms")}</a>
//                 <span>|</span>
//                 <a href="#">{t("footer.privacy")}</a>
//                 <span>|</span>
//                 <a href="mailto:info@silah.site">
//                     {t("footer.contact")}: info@silah.site
//                 </a>
//             </div>
//             <p className="copyright">© 2025 Silah. {t("footer.rights")}</p>
//         </footer>

//     );
// }

export default Footer;
