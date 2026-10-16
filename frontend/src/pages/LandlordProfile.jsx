import { useEffect, useState } from "react";
import api from "../services/api";

const empty = { displayName: "", phone: "", city: "", bio: "" };
export default function LandlordProfile() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/api/landlord-profile").then(({ data }) => {
      if (active && data.profile) setForm({ displayName: data.profile.displayName || "", phone: data.profile.phone || "", city: data.profile.city || "", bio: data.profile.bio || "" });
    }).catch((err) => {
      if (active && err.response?.status !== 404) setError(err.response?.data?.message || "Could not load landlord profile");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setError(""); setMessage(""); setSaving(true);
    try {
      await api.put("/api/landlord-profile", form);
      setMessage("Landlord profile saved to MongoDB.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save profile");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-center"><div className="spinner" /></div>;
  return <div className="form-page">
    <div className="page-header"><h1>Landlord Profile</h1><p>Your contact and public listing details</p></div>
    <form className="form-card" onSubmit={submit}>
      <div className="form-grid">
        <div className="form-group"><label htmlFor="displayName">Display name</label><input id="displayName" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} maxLength={100} placeholder="Name shown to tenants" /></div>
        <div className="form-group"><label htmlFor="phone">Contact phone</label><input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={20} placeholder="Optional contact number" /></div>
        <div className="form-group full"><label htmlFor="city">City</label><input id="city" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} maxLength={100} placeholder="Dehradun" /></div>
        <div className="form-group full"><label htmlFor="bio">About you</label><textarea id="bio" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} maxLength={500} placeholder="A short introduction (optional)" /></div>
      </div>
      {error && <p className="alert alert-error">{error}</p>}
      {message && <p className="alert alert-success">{message}</p>}
      <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Landlord Profile"}</button>
    </form>
  </div>;
}
