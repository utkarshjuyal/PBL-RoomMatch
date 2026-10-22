import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "tenant"
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
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
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <span className="brand-icon large">🏠</span>
                    <h1>Create account</h1>
                    <p>Join RoomMatch and find your ideal accommodation</p>
                </div>

                {error && <p className="alert alert-error">{error}</p>}
                {success && <div className="alert alert-success"><strong>Almost there</strong><p>{success}</p><p>Open the verification link in your email before signing in.</p><Link to="/login">Go to sign in</Link></div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            placeholder="At least 8 characters, with a number"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">I am a</label>
                        <select id="role" name="role" value={formData.role} onChange={handleChange}>
                            <option value="tenant">Tenant — looking for a room</option>
                            <option value="landlord">Landlord — listing properties</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
