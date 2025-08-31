import GuestHeader from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import WhyChooseUs from '../components/WhyChooseUs';
import HowItWorks from '../components/HowItWorks';
import ExploreCategories from '../components/ExploreCategories'; // أو './ExploreCategories' حسب المسار

import '../App.css';

function Landing() {
    return (
        <div className="landing-page">
            <GuestHeader />
            <HeroSection />
            <div className="container">
                <WhyChooseUs />
                <HowItWorks />
                <ExploreCategories />
            </div>
            <Footer />
        </div>
    );
}

export default Landing;
