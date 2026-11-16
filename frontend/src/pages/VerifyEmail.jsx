import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const COOLDOWN_SECONDS = 60;

export default function VerifyEmail() {
  const { state } = useLocation();
  const email = state?.email;
  const navigate = useNavigate();
  const { login } = useAuth();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Opened directly (refresh / bookmark) with no email to verify.
  if (!email) return <Navigate to="/register" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6 digit code from your email.");
      return;
    }
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/verify-email", { email, code });
      login(data.user, data.token);
      navigate(data.user.role === "landlord" ? "/landlord" : "/discover", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "We could not verify your code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const { data } = await api.post("/api/auth/resend-code", { email });
      setNotice(data.message);
      setCode("");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || "We could not send a new code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card verify-card">
        <span className="verify-icon">✉</span>
        <h1>Check your email</h1>
        <p>We sent a 6 digit code to <strong>{email}</strong>. It expires in 15 minutes.</p>

        {error && <p className="alert alert-error">{error}</p>}
        {notice && <p className="alert alert-success">{notice}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="code">Verification code</label>
            <input
              id="code"
              className="otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || code.length !== 6}>
            {loading ? "Verifying…" : "Verify email"}
          </button>
        </form>

        <button type="button" className="btn btn-secondary btn-full resend-button" onClick={handleResend} disabled={cooldown > 0 || resending}>
          {cooldown > 0 ? `Send a new code in ${cooldown}s` : resending ? "Sending…" : "Send a new code"}
        </button>
        <p className="auth-footer">Wrong email? <Link to="/register">Start again</Link></p>
      </div>
    </div>
  );
}
