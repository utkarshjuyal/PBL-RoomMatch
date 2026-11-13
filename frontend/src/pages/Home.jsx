import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Magnetic from "../components/Magnetic";

const Home = () => {
    const { user } = useAuth();
    const destination = user?.role === "landlord" ? "/landlord" : "/discover";

    return (
        <div className="home-page">
            <header className="home-nav">
                <Link to="/" className="home-brand" aria-label="RoomMatch home">
                    <span className="home-brand-mark" aria-hidden="true">r.</span>
                    <span>roommatch</span>
                </Link>

                <nav className="home-nav-links" aria-label="Main navigation">
                    <a href="#how-it-works">How it works</a>
                    <a href="#why-roommatch">Why RoomMatch</a>
                </nav>

                <div className="home-nav-actions">
                    {user ? (
                        <>
                            <Link to={destination} className="home-nav-text">Your space</Link>
                            <Magnetic as={Link} to={destination} className="btn btn-primary home-nav-cta">
                                Open RoomMatch <span aria-hidden="true">↗</span>
                            </Magnetic>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="home-nav-text">Sign in</Link>
                            <Magnetic as={Link} to="/register" className="btn btn-primary home-nav-cta">
                                Get started <span aria-hidden="true">↗</span>
                            </Magnetic>
                        </>
                    )}
                </div>
            </header>

            <main>
                <section className="home-hero">
                    <div className="home-hero-copy">
                        <span className="home-kicker"><span className="kicker-dot" /> A more considered way to find a room</span>
                        <h1>Find a place<br />that feels <em>like yours.</em></h1>
                        <p className="home-hero-description">
                            Less scrolling. Fewer compromises. Discover rooms, PGs and flats that fit your preferences and your everyday life.
                        </p>
                        <div className="home-hero-actions">
                            <Magnetic as={Link} to={user ? destination : "/register"} className="btn btn-primary btn-lg home-primary-cta">
                                Find your place <span aria-hidden="true">↗</span>
                            </Magnetic>
                            <a href="#how-it-works" className="home-secondary-cta">See how it works <span aria-hidden="true">↓</span></a>
                        </div>
                        <div className="home-hero-note">
                            <span className="home-note-rule" />
                            <span>Made for the way you actually live.</span>
                        </div>
                    </div>

                    <div className="home-hero-media">
                        <img
                            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=88"
                            alt="Warm, naturally lit contemporary living room"
                            fetchPriority="high"
                        />
                        <div className="hero-image-caption">
                            <span>Find your kind of space</span>
                            <span className="hero-caption-mark" aria-hidden="true">↗</span>
                        </div>
                    </div>
                    <div className="home-hero-index" aria-hidden="true">01 / 03</div>
                </section>

                <section className="home-how" id="how-it-works">
                    <div className="home-section-intro">
                        <span className="home-kicker">A simpler search</span>
                        <h2>From searching to<br /><em>settling in.</em></h2>
                    </div>
                    <div className="home-steps">
                        <article className="home-step">
                            <span className="step-number">01</span>
                            <div>
                                <h3>Tell us what matters</h3>
                                <p>Set your budget, preferred area, room type and the details that make a place feel right.</p>
                            </div>
                        </article>
                        <article className="home-step">
                            <span className="step-number">02</span>
                            <div>
                                <h3>Meet your matches</h3>
                                <p>Explore accommodation recommendations shaped around your preferences.</p>
                            </div>
                        </article>
                        <article className="home-step">
                            <span className="step-number">03</span>
                            <div>
                                <h3>Keep the good ones</h3>
                                <p>Like and save places worth a closer look, then revisit them whenever you need.</p>
                            </div>
                        </article>
                    </div>
                </section>

                <section className="home-editorial" id="why-roommatch">
                    <div className="editorial-image">
                        <img
                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85"
                            alt="Bright, calm apartment interior with a comfortable seating area"
                            loading="lazy"
                        />
                    </div>
                    <div className="editorial-copy">
                        <span className="home-kicker">Room hunting, with more clarity</span>
                        <h2>A better fit is about more than four walls.</h2>
                        <p>
                            The right place should work for your budget, your routine and the way you want to live. RoomMatch brings those details together so you can spend less time searching and more time choosing.
                        </p>
                        <Link to={user ? destination : "/register"} className="home-inline-link">Explore RoomMatch <span aria-hidden="true">↗</span></Link>
                    </div>
                </section>

                <section className="home-final-cta">
                    <div>
                        <span className="home-kicker">Your next chapter starts here</span>
                        <h2>Make room for<br /><em>something better.</em></h2>
                    </div>
                    <Magnetic as={Link} to={user ? destination : "/register"} className="btn btn-light btn-lg">
                        Start exploring <span aria-hidden="true">↗</span>
                    </Magnetic>
                </section>
            </main>

            <footer className="home-footer-new">
                <Link to="/" className="home-brand"><span className="home-brand-mark" aria-hidden="true">r.</span><span>roommatch</span></Link>
                <span>Find a place that fits your life.</span>
                <span>© {new Date().getFullYear()} RoomMatch</span>
            </footer>
        </div>
    );
};

export default Home;
