import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import Magnetic from "../components/Magnetic";

const Register = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "tenant" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await api.post("/api/auth/register", formData);
            setSuccess(response.data.message || "Account created. Check your inbox to verify your email.");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page-new register-page-new">
            <div className="auth-side-panel register-side-panel">
                <Link to="/" className="home-brand"><span className="home-brand-mark">r.</span><span>roommatch</span></Link>
                <div className="auth-side-copy">
                    <span className="home-kicker">A fresh start</span>
                    <h2>Your next place<br />is closer than<br /><em>you think.</em></h2>
                    <p>Find rooms, PGs and flats that fit the way you live.</p>
                </div>
                <span className="auth-side-foot">ROOMMATCH · FIND YOUR PLACE</span>
            </div>

            <div className="auth-card auth-card-new register-card-new">
                <Link to="/" className="auth-back-link">← Back to home</Link>
                <div className="auth-header auth-header-new">
                    <span className="home-kicker">Get started</span>
                    <h1>Create your account.</h1>
                    <p>A few details, then you're on your way.</p>
                </div>

                {error && <p className="alert alert-error">{error}</p>}
                {success && (
                    <div className="alert alert-success">
                        <strong>Almost there</strong>
                        <p>{success}</p>
                        <p>Open the verification link in your email before signing in.</p>
                        <Link to="/login">Go to sign in</Link>
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full name</label>
                        <input id="name" type="text" name="name" autoComplete="name" placeholder="Your name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input id="email" type="email" name="email" autoComplete="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" name="password" autoComplete="new-password" placeholder="At least 8 characters, with a number" value={formData.password} onChange={handleChange} minLength={8} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">I am looking to</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange}>
                            <option value="tenant">Find a room or accommodation</option>
                            <option value="landlord">List my property</option>
                        </select>
                    </div>
                    <Magnetic as="button" type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
                        {loading ? "Creating account…" : "Create account"} <span aria-hidden="true">↗</span>
                    </Magnetic>
                </form>

                <p className="auth-footer auth-footer-new">Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
};

export default Register;
