import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AboutUs.css";

const AboutUs = () => {
    const { t } = useTranslation();

    useEffect(() => {
        const sections = document.querySelectorAll(".fade-section");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                    }
                });
            },
            { threshold: 0.2 },
        );

        sections.forEach((sec) => observer.observe(sec));
    }, []);

    return (
        <main className="about-page">
            {/* Header Section */}
            <section className="about-header fade-section">
                <p className="section-label">{t("about.label")}</p>
                <h1>{t("about.title")}</h1>
                <blockquote>{t("about.quote")}</blockquote>
            </section>

            {/* Story / Mission / Vision */}
            <section className="story-mission-vision fade-section">
                <div className="smv-item">
                    <h2>{t("about.story.title")}</h2>
                    <p>{t("about.story.text")}</p>
                </div>

                <div className="smv-item">
                    <h2>{t("about.mission.title")}</h2>
                    <p>{t("about.mission.text")}</p>
                </div>

                <div className="smv-item">
                    <h2>{t("about.vision.title")}</h2>
                    <p>{t("about.vision.text")}</p>
                </div>
            </section>

            {/* Core Values */}
            <section className="core-values fade-section">
                <h2>{t("about.values.title")}</h2>
                <ul>
                    <li>{t("about.values.connectivity")}</li>
                    <li>{t("about.values.innovation")}</li>
                    <li>{t("about.values.trust")}</li>
                    <li>{t("about.values.efficiency")}</li>
                    <li>{t("about.values.empowerment")}</li>
                </ul>
            </section>

            {/* CTA */}
            <section className="cta fade-section">
                <h3>{t("about.cta.title")}</h3>
                <p>{t("about.cta.text")}</p>
                <Link to="/signup">
                    <button className="cta-btn">{t("about.cta.button")}</button>
                </Link>
            </section>
        </main>
    );
};

export default AboutUs;
