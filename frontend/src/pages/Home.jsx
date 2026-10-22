import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Home = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState(10000);
  const [location, setLocation] = useState("Dehradun");
  const destination = user?.role === "landlord" ? "/landlord" : "/map";
  return <div className="landing-page landing-redesign">
    <section className="hero-section hero-modern">
      <div className="hero-copy">
        <span className="hero-badge">A better way to find your next home</span>
        <h1>Find a place<br/>that feels <em>like yours.</em></h1>
        <p>Thoughtful spaces, transparent prices, and places that fit your everyday life. Find your next room without the endless searching.</p>
        <div className="hero-actions">
          <Link to={user ? destination : "/register"} className="btn btn-primary btn-lg">Explore nearby <span aria-hidden="true">↗</span></Link>
          <Link to={user ? "/preferences" : "/login"} className="btn btn-secondary btn-lg">Find my match</Link>
        </div>
        <div className="hero-trust"><span>⌖ Location-led discovery</span><span>♡ Personalised matches</span><span>₹ Transparent rent</span></div>
      </div>
      <div className="hero-visual" aria-label="RoomMatch property preview">
        <div className="hero-orbit orbit-one"></div><div className="hero-orbit orbit-two"></div>
        <article className="hero-property-card hero-property-main">
          <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85" alt="Warm, sunlit modern living space" />
          <div className="hero-property-info"><span className="eyebrow">A place to settle in</span><h3>Room for your next chapter</h3><p>Warm spaces · Thoughtful matches</p></div>
        </article>
        <div className="floating-note note-price"><span>Rent that fits</span><strong>Set your budget</strong></div>
        <div className="floating-note note-map"><span className="note-pin">⌖</span><div><strong>Nearby, made simple</strong><small>Explore places around you</small></div></div>
      </div>
    </section>
    <section className="quick-search panel-surface">
      <div><span className="eyebrow">Start with what matters</span><h2>Your place, your priorities.</h2></div>
      <label>Preferred area<input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City or locality" /></label>
      <label>Monthly budget <strong>₹{budget.toLocaleString("en-IN")}</strong><input type="range" min="3000" max="30000" step="500" value={budget} onChange={e=>setBudget(Number(e.target.value))}/></label>
      <Link className="btn btn-primary" to={user ? `/map?city=${encodeURIComponent(location)}&maxRent=${budget}` : "/register"}>See matches <span aria-hidden="true">→</span></Link>
    </section>
    <section className="home-section">
      <div className="section-heading"><div><span className="eyebrow">Made for real life</span><h2>Finding a room, without the noise.</h2></div><Link to={user ? "/map" : "/register"} className="text-link">Explore RoomMatch ↗</Link></div>
      <div className="features-section">
        <article className="feature-card"><span className="feature-icon">⌖</span><h3>See what's nearby</h3><p>Explore accommodation on a map, choose an area, and compare places at a glance.</p></article>
        <article className="feature-card"><span className="feature-icon">✳</span><h3>Matches with meaning</h3><p>Recommendations consider your budget, preferred room type, location, and amenities.</p></article>
        <article className="feature-card"><span className="feature-icon">♥</span><h3>Choose at your pace</h3><p>Swipe, like, save, and revisit the places you want to consider more closely.</p></article>
      </div>
    </section>
    <section className="home-cta"><div><span className="eyebrow">Your next chapter starts here</span><h2>A little closer to feeling at home.</h2><p>Set your preferences and explore places that make sense for you.</p></div><Link to={user ? destination : "/register"} className="btn btn-light">Get started ↗</Link></section>
    <footer className="home-footer"><span>⌂ RoomMatch</span><span>Find a place that fits your life.</span><span>Demo listings are labelled clearly.</span></footer>
  </div>;
};
export default Home;
