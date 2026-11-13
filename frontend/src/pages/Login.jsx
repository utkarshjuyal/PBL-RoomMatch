import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Magnetic from "../components/Magnetic";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState("");
    const [resending, setResending] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", { email, password });
            const { token, user } = response.data;
            login(user, token);

            if (user.role === "landlord") {
                navigate("/landlord");
            } else {
                navigate("/discover");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const resendVerification = async () => {
        setResending(true);
        setNotice("");
        try {
            const response = await api.post("/api/auth/resend-verification", { email });
            setNotice(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Could not resend verification email.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="auth-page auth-page-new">
            <div className="auth-side-panel">
                <Link to="/" className="home-brand"><span className="home-brand-mark">r.</span><span>roommatch</span></Link>
                <div className="auth-side-copy">
                    <span className="home-kicker">A better place to begin</span>
                    <h2>Find a space<br />for your <em>next chapter.</em></h2>
                    <p>Your preferences. Your pace. A place that feels right.</p>
                </div>
                <span className="auth-side-foot">ROOMMATCH · FIND YOUR PLACE</span>
            </div>

            <div className="auth-card auth-card-new">
                <Link to="/" className="auth-back-link">← Back to home</Link>
                <div className="auth-header auth-header-new">
                    <span className="home-kicker">Welcome back</span>
                    <h1>Good to see you.</h1>
                    <p>Sign in to pick up where you left off.</p>
                </div>

                {error && <p className="alert alert-error">{error}</p>}
                {notice && <p className="alert alert-success">{notice}</p>}
                {error.toLowerCase().includes("verify your email") && (
                    <button type="button" className="btn btn-secondary btn-full resend-button" disabled={resending || !email} onClick={resendVerification}>
                        {resending ? "Sending…" : "Resend verification email"}
                    </button>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email address</label>
                        <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                    </div>
                    <Magnetic as="button" type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
                        {loading ? "Signing in…" : "Sign in"} <span aria-hidden="true">↗</span>
                    </Magnetic>
                </form>

                <p className="auth-footer auth-footer-new">New to RoomMatch? <Link to="/register">Create an account</Link></p>
            </div>
        </div>
    );
};

export default Login;
