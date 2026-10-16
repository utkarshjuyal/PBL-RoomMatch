import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PropertyCard from "../components/PropertyCard";
import { getSavedProperties, removeSavedProperty } from "../services/savedService";

const Saved = () => {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getSavedProperties();
                setSaved(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load saved properties");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const handleRemove = async (propertyId) => {
        try {
            await removeSavedProperty(propertyId);
            setSaved((prev) => prev.filter((item) => item.property._id !== propertyId));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove property");
        }
    };

    if (loading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="list-page">
            <div className="page-header">
                <h1>Saved Properties</h1>
                <p>Properties you bookmarked for later</p>
            </div>

            {error && <p className="alert alert-error">{error}</p>}

            {saved.length === 0 ? (
                <div className="page-center empty-state">
                    <span className="empty-icon">★</span>
                    <h2>No saved properties yet</h2>
                    <p>Tap the star while browsing to save properties here.</p>
                    <Link to="/discover" className="btn btn-primary">Start Discovering</Link>
                </div>
            ) : (
                <div className="property-grid">
                    {saved.map((item) => (
                        <div key={item._id} className="grid-item">
                            <PropertyCard property={item.property} compact />
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => handleRemove(item.property._id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Saved;
