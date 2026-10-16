import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user } = useAuth();

    if (user) {
        const destination = user.role === "landlord" ? "/landlord" : "/discover";

        return (
            <div className="landing-page">
                <section className="hero-section compact">
                    <h1>Welcome back, {user.name}!</h1>
                    <p>Ready to {user.role === "landlord" ? "manage your listings" : "discover your next home"}?</p>
                    <Link to={destination} className="btn btn-primary btn-lg">
                        {user.role === "landlord" ? "Go to Dashboard" : "Start Discovering"}
                    </Link>
                </section>
            </div>
        );
    }

    return (
        <div className="landing-page">
            <section className="hero-section">
                <div className="hero-badge">Swipe. Match. Move in.</div>
                <h1>Find your perfect room,<br />one swipe at a time</h1>
                <p>
                    RoomMatch helps students and professionals discover PGs, flats, and rooms
                    tailored to their preferences — just like dating apps, but for accommodation.
                </p>

                <div className="hero-actions">
                    <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
                    <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                </div>
            </section>

            <section className="features-section">
                <div className="feature-card">
                    <span className="feature-icon">♥</span>
                    <h3>Swipe to Match</h3>
                    <p>Like or pass on properties with a simple swipe. No more endless scrolling.</p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">🎯</span>
                    <h3>Smart Recommendations</h3>
                    <p>Get personalized suggestions based on your budget, location, and preferences.</p>
                </div>
                <div className="feature-card">
                    <span className="feature-icon">★</span>
                    <h3>Save & Compare</h3>
                    <p>Bookmark interesting properties and compare them before making a decision.</p>
                </div>
            </section>
        </div>
    );
};

export default Home;
