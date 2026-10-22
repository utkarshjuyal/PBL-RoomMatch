import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
export default function VerifyEmail() {
  const [params] = useSearchParams(); const [state, setState] = useState("loading"); const [message, setMessage] = useState("Checking your verification link…");
  useEffect(() => { const token = params.get("token"); if (!token) { setState("error"); setMessage("This verification link is missing its token."); return; } api.post("/api/auth/verify-email", { token }).then(r=>{setState("success");setMessage(r.data.message || "Your email has been verified.");}).catch(e=>{setState("error");setMessage(e.response?.data?.message || "This verification link is invalid or has expired.");}); }, [params]);
  return <div className="auth-page"><div className="auth-card verify-card"><span className={`verify-icon ${state}`}>{state === "success" ? "✓" : state === "error" ? "!" : "…"}</span><h1>{state === "success" ? "You're verified." : state === "error" ? "Verification link issue" : "Verifying your email"}</h1><p>{message}</p>{state !== "loading" && <Link className="btn btn-primary btn-full" to="/login">Continue to sign in</Link>}</div></div>;
}
