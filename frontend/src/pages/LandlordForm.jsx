import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { createProperty, getProperty, updateProperty, uploadPropertyImages } from "../services/propertyService";

const amenitiesList = ["WiFi", "AC", "Parking", "Food", "Laundry", "Power Backup", "Gym", "Study Desk", "Wardrobe", "Common Kitchen", "CCTV", "Attached Bathroom"];

const emptyForm = {
    title: "",
    description: "",
    propertyType: "PG",
    roomType: "SINGLE",
    city: "",
    area: "",
    address: "",
    rent: "",
    securityDeposit: "",
    sharingArrangement: "",
    furnishing: "FURNISHED",
    genderPreference: "ANY",
    occupancy: "",
    availableFrom: "",
    locationPrecision: "UNVERIFIED",
    latitude: "",
    longitude: "",
    amenities: [],
    images: [""]
};

const LandlordForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [imageFiles, setImageFiles] = useState([]);

    useEffect(() => {
        if (!isEdit) return;

        const load = async () => {
            try {
                const property = await getProperty(id);
                setForm({
                    title: property.title || "",
                    description: property.description || "",
                    propertyType: property.propertyType || "PG",
                    roomType: property.roomType || "SINGLE",
                    city: property.city || "",
                    area: property.area || "",
                    address: property.address || "",
                    rent: property.rent || "",
                    securityDeposit: property.securityDeposit ?? "",
                    sharingArrangement: property.sharingArrangement || "",
                    furnishing: property.furnishing || "",
                    genderPreference: property.genderPreference || "ANY",
                    occupancy: property.occupancy ?? "",
                    availableFrom: property.availableFrom ? new Date(property.availableFrom).toISOString().slice(0, 10) : "",
                    locationPrecision: property.locationPrecision || "UNVERIFIED",
                    latitude: property.latitude ?? "",
                    longitude: property.longitude ?? "",
                    amenities: property.amenities || [],
                    images: property.images?.length ? property.images : [""]
                });
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load property");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, isEdit]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggleAmenity = (amenity) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const uploadedImages = imageFiles.length ? await uploadPropertyImages(imageFiles) : [];
            const payload = {
                ...form,
                rent: Number(form.rent),
                securityDeposit: Number(form.securityDeposit) || 0,
                occupancy: form.occupancy === "" ? undefined : Number(form.occupancy),
                latitude: form.latitude === "" ? undefined : Number(form.latitude),
                longitude: form.longitude === "" ? undefined : Number(form.longitude),
                availableFrom: form.availableFrom || undefined,
                images: [...form.images.filter(Boolean), ...uploadedImages].slice(0, 8)
            };

            if (isEdit) {
                await updateProperty(id, payload);
                setMessage("Property updated successfully!");
            } else {
                await createProperty(payload);
                navigate("/landlord");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save property");
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
                <h1>{isEdit ? "Edit Property" : "Add Property"}</h1>
                <p>{isEdit ? "Update your listing details" : "Create a new property listing"}</p>
            </div>

            <form className="form-card" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group full">
                        <label htmlFor="title">Title</label>
                        <input id="title" name="title" value={form.title} onChange={handleChange} required placeholder="Fully Furnished PG near Metro" />
                    </div>

                    <div className="form-group full">
                        <label htmlFor="description">Description</label>
                        <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Describe the property..." />
                    </div>

                    <div className="form-group">
                        <label htmlFor="propertyType">Property Type</label>
                        <select id="propertyType" name="propertyType" value={form.propertyType} onChange={handleChange}>
                            <option value="PG">PG</option>
                            <option value="FLAT">Flat</option>
                            <option value="ROOM">Room</option>
                            <option value="HOSTEL">Hostel</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="roomType">Room Type</label>
                        <select id="roomType" name="roomType" value={form.roomType} onChange={handleChange}>
                            <option value="SINGLE">Single</option>
                            <option value="DOUBLE">Double</option>
                            <option value="TRIPLE">Triple</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input id="city" name="city" value={form.city} onChange={handleChange} required placeholder="Dehradun" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="area">Area</label>
                        <input id="area" name="area" value={form.area} onChange={handleChange} placeholder="Rajpur Road" />
                    </div>

                    <div className="form-group full">
                        <label htmlFor="address">Address</label>
                        <input id="address" name="address" value={form.address} onChange={handleChange} placeholder="Full address" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sharingArrangement">Sharing arrangement</label>
                        <input id="sharingArrangement" name="sharingArrangement" value={form.sharingArrangement} onChange={handleChange} placeholder="e.g. Double sharing" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="furnishing">Furnishing</label>
                        <select id="furnishing" name="furnishing" value={form.furnishing} onChange={handleChange}>
                            <option value="">Not specified</option>
                            <option value="FURNISHED">Furnished</option>
                            <option value="SEMI_FURNISHED">Semi-furnished</option>
                            <option value="UNFURNISHED">Unfurnished</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="genderPreference">Gender preference</label>
                        <select id="genderPreference" name="genderPreference" value={form.genderPreference} onChange={handleChange}>
                            <option value="ANY">Any</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="occupancy">Maximum occupants</label>
                        <input id="occupancy" name="occupancy" type="number" min="1" max="50" value={form.occupancy} onChange={handleChange} placeholder="e.g. 2" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="availableFrom">Available from</label>
                        <input id="availableFrom" name="availableFrom" type="date" value={form.availableFrom} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label htmlFor="locationPrecision">Location accuracy</label>
                        <select id="locationPrecision" name="locationPrecision" value={form.locationPrecision} onChange={handleChange}>
                            <option value="UNVERIFIED">Not verified</option>
                            <option value="APPROXIMATE">Approximate locality</option>
                            <option value="EXACT">Exact address / pin provided</option>
                        </select>
                        <p className="field-hint">Only select exact when the address or map pin is the actual property location.</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="latitude">Latitude (optional)</label>
                        <input id="latitude" name="latitude" type="number" min="-90" max="90" step="any" value={form.latitude} onChange={handleChange} placeholder="e.g. 30.3165" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="longitude">Longitude (optional)</label>
                        <input id="longitude" name="longitude" type="number" min="-180" max="180" step="any" value={form.longitude} onChange={handleChange} placeholder="e.g. 78.0322" />
                        <p className="field-hint">Use coordinates for this property only. A locality-centre pin must be marked approximate.</p>
                    </div>

                    <div className="form-group">
                        <label htmlFor="rent">Monthly Rent (₹)</label>
                        <input id="rent" name="rent" type="number" min="0" value={form.rent} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="securityDeposit">Security Deposit (₹)</label>
                        <input id="securityDeposit" name="securityDeposit" type="number" min="0" value={form.securityDeposit} onChange={handleChange} />
                    </div>

                    <div className="form-group full">
                        <label htmlFor="propertyImages">Property photos (up to 8 images, 5 MB each)</label>
                        <input id="propertyImages" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={(e) => {
                            const selected = Array.from(e.target.files || []);
                            if (selected.some((file) => file.size > 5 * 1024 * 1024)) { setError("Each image must be 5 MB or smaller."); e.target.value = ""; return; }
                            if (selected.length + form.images.filter(Boolean).length > 8) { setError("You can attach up to 8 images in total."); e.target.value = ""; return; }
                            setError(""); setImageFiles(selected);
                        }} />
                        <p className="field-hint">JPG, PNG, WEBP or GIF. Images are uploaded to the backend and their URLs are saved with the listing.</p>
                        {(form.images.filter(Boolean).length > 0 || imageFiles.length > 0) && <div className="image-preview-grid">
                            {form.images.filter(Boolean).map((url, index) => <div className="image-preview" key={`${url}-${index}`}><img src={url} alt={`Current property ${index + 1}`} /><button type="button" className="image-remove" onClick={() => setForm((old) => ({ ...old, images: old.images.filter((_, i) => i !== index) }))} aria-label="Remove current image">×</button></div>)}
                            {imageFiles.map((file, index) => <div className="image-preview" key={`${file.name}-${index}`}><img src={URL.createObjectURL(file)} alt={file.name} /><span className="image-new-tag">New</span></div>)}
                        </div>}
                    </div>

                    <div className="form-group full">
                        <label>Amenities</label>
                        <div className="checkbox-grid">
                            {amenitiesList.map((amenity) => (
                                <label key={amenity} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={form.amenities.includes(amenity)}
                                        onChange={() => toggleAmenity(amenity)}
                                    />
                                    {amenity}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {error && <p className="alert alert-error">{error}</p>}
                {message && <p className="alert alert-success">{message}</p>}

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate("/landlord")}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Uploading & saving..." : isEdit ? "Update Property" : "Create Property"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LandlordForm;
