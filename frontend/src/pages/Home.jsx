import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VALLEY_IMAGE =
    "https://images.unsplash.com/photo-1695722876604-55b4f67110c3?auto=format&fit=crop&w=2600&q=90";

export default function Home() {
    const { user } = useAuth();
    const destination = user?.role === "landlord" ? "/landlord" : "/discover";
    const primaryPath = user ? destination : "/register";

    return (
        <div className="rm-landing">
            <div className="rm-landing-image" aria-hidden="true">
                <img src={VALLEY_IMAGE} alt="" fetchPriority="high" />
            </div>
            <div className="rm-landing-shade" aria-hidden="true" />

            <header className="rm-landing-nav">
                <div className="rm-landing-actions">
                    {user ? (
                        <Link to={destination} className="rm-login-link">
                            My RoomMatch
                        </Link>
                    ) : (
                        <Link to="/login" className="rm-login-link">
                            Sign in
                        </Link>
                    )}
                    <Link to={primaryPath} className="rm-nav-cta">
                        {user ? "Open app" : "Get started"}
                        <span aria-hidden="true">↗</span>
                    </Link>
                </div>
            </header>

            <main className="rm-landing-content">
                <div className="rm-landing-kicker">
                    <span /> DEHRADUN · UTTARAKHAND
                </div>
                <h1>
                    Find your place
                    <br />
                    in the <em>Doon.</em>
                </h1>
                <p>Rooms, PGs and shared stays that fit the way you live.</p>
                <div className="rm-landing-cta-row">
                    <Link to={primaryPath} className="rm-hero-cta">
                        {user?.role === "landlord" ? "Open dashboard" : "Explore rooms"}
                        <span aria-hidden="true">↗</span>
                    </Link>
                    {!user && (
                        <Link to="/register" className="rm-host-link">
                            Have a place to list?
                        </Link>
                    )}
                    {user?.role === "landlord" && (
                        <Link to="/landlord/new" className="rm-host-link">
                            List a property
                        </Link>
                    )}
                </div>
            </main>

            <footer className="rm-landing-bottom">
                <a
                    className="rm-github-link"
                    href="https://github.com/utkarshjuyal"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Visit my GitHub profile"
                >
                    GitHub <span aria-hidden="true">↗</span>
                </a>
                <span className="rm-landing-scroll">
                    A better way to find a room <span aria-hidden="true">↓</span>
                </span>
                <span className="rm-landing-copyright">© 2026 RoomMatch</span>
            </footer>
        </div>
    );
}

