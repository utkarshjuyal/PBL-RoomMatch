import { useEffect, useState } from "react";

import { getProfile, saveProfile } from "../services/profileService";

const Profile = () => {
    const [formData, setFormData] = useState({
        age: "",
        gender: "",
        occupation: "",
        collegeOrWorkplace: "",
        bio: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await getProfile();

                if (data.profile) {
                    setFormData({
                        age: data.profile.age ?? "",
                        gender: data.profile.gender || "",
                        occupation: data.profile.occupation || "",
                        collegeOrWorkplace: data.profile.collegeOrWorkplace || "",
                        bio: data.profile.bio || ""
                    });
                }
            } catch (err) {
                if (err.response?.status !== 404) {
                    setError(err.response?.data?.message || "Failed to load profile");
                }
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setSaving(true);

        try {
            await saveProfile(formData);
            setMessage("Profile saved successfully!");
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="form-page">
            <div className="page-header">
                <h1>My Profile</h1>
                <p>Tell us a bit about yourself</p>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input id="age" type="number" name="age" value={formData.age} onChange={handleChange} min="16" max="100" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="occupation">Occupation</label>
                        <input id="occupation" type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Student" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="collegeOrWorkplace">College / Workplace</label>
                        <input id="collegeOrWorkplace" type="text" name="collegeOrWorkplace" value={formData.collegeOrWorkplace} onChange={handleChange} placeholder="UPES, Dehradun" />
                    </div>

                    <div className="form-group full">
                        <label htmlFor="bio">Bio</label>
                        <textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="A short intro about yourself..." maxLength={500} />
                    </div>
                </div>

                {message && <p className="alert alert-success">{message}</p>}
                {error && <p className="alert alert-error">{error}</p>}

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
