import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getProfile, saveProfile } from "../services/profileService";

const amenitiesList = [
    "WiFi", "AC", "Parking", "Food", "Laundry", "Power Backup", "Gym"
];

const Preferences = () => {
    const [formData, setFormData] = useState({
        preferredCity: "",
        preferredArea: "",
        budgetMin: "",
        budgetMax: "",
        accommodationType: "",
        preferredRoomType: "",
        preferredAmenities: [],
        moveInDate: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const data = await getProfile();

                if (data.profile) {
                    setFormData({
                        preferredCity: data.profile.preferredCity || "",
                        preferredArea: data.profile.preferredArea || "",
                        budgetMin: data.profile.budgetMin ?? "",
                        budgetMax: data.profile.budgetMax ?? "",
                        accommodationType: data.profile.accommodationType || "",
                        preferredRoomType: data.profile.preferredRoomType || "",
                        preferredAmenities: data.profile.preferredAmenities || [],
                        moveInDate: data.profile.moveInDate
                            ? data.profile.moveInDate.split("T")[0]
                            : ""
                    });
                }
            } catch (err) {
                if (err.response?.status !== 404) {
                    setError(err.response?.data?.message || "Failed to load preferences");
                }
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAmenityChange = (amenity) => {
        setFormData((previous) => ({
            ...previous,
            preferredAmenities: previous.preferredAmenities.includes(amenity)
                ? previous.preferredAmenities.filter((item) => item !== amenity)
                : [...previous.preferredAmenities, amenity]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (formData.budgetMin && formData.budgetMax &&
            Number(formData.budgetMin) > Number(formData.budgetMax)) {
            setError("Minimum budget cannot be greater than maximum budget.");
            return;
        }

        setSaving(true);

        try {
            await saveProfile(formData);
            setMessage("Preferences saved! Your recommendations will improve.");
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
                <h1>My Preferences</h1>
                <p>Set your ideal accommodation criteria for better matches</p>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="preferredCity">Preferred City</label>
                        <input id="preferredCity" type="text" name="preferredCity" value={formData.preferredCity} onChange={handleChange} placeholder="Dehradun" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="preferredArea">Preferred Area</label>
                        <input id="preferredArea" type="text" name="preferredArea" value={formData.preferredArea} onChange={handleChange} placeholder="Rajpur Road" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="budgetMin">Min Budget (₹)</label>
                        <input id="budgetMin" type="number" name="budgetMin" value={formData.budgetMin} onChange={handleChange} min="0" placeholder="5000" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="budgetMax">Max Budget (₹)</label>
                        <input id="budgetMax" type="number" name="budgetMax" value={formData.budgetMax} onChange={handleChange} min="0" placeholder="10000" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="accommodationType">Accommodation Type</label>
                        <select id="accommodationType" name="accommodationType" value={formData.accommodationType} onChange={handleChange}>
                            <option value="">Any type</option>
                            <option value="PG">PG</option>
                            <option value="FLAT">Flat</option>
                            <option value="ROOM">Room</option>
                            <option value="HOSTEL">Hostel</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="preferredRoomType">Room Type</label>
                        <select id="preferredRoomType" name="preferredRoomType" value={formData.preferredRoomType} onChange={handleChange}>
                            <option value="">Any room</option>
                            <option value="SINGLE">Single</option>
                            <option value="DOUBLE">Double</option>
                            <option value="TRIPLE">Triple</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="moveInDate">Move-in Date</label>
                        <input id="moveInDate" type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} />
                    </div>

                    <div className="form-group full">
                        <label>Preferred Amenities</label>
                        <div className="checkbox-grid">
                            {amenitiesList.map((amenity) => (
                                <label key={amenity} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.preferredAmenities.includes(amenity)}
                                        onChange={() => handleAmenityChange(amenity)}
                                    />
                                    {amenity}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {message && <p className="alert alert-success">{message}</p>}
                {error && <p className="alert alert-error">{error}</p>}

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Preferences"}
                    </button>
                    <Link to="/discover" className="btn btn-secondary">Start Discovering</Link>
                </div>
            </form>
        </div>
    );
};

export default Preferences;
