import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PropertyCard from "../components/PropertyCard";
import { getInteractions } from "../services/interactionService";

const Liked = () => {
    const [interactions, setInteractions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getInteractions("LIKE");
                setInteractions(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load liked properties");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="list-page">
            <div className="page-header">
                <h1>Liked Properties</h1>
                <p>Properties you showed interest in</p>
            </div>

            {error && <p className="alert alert-error">{error}</p>}

            {interactions.length === 0 ? (
                <div className="page-center empty-state">
                    <span className="empty-icon">♥</span>
                    <h2>No likes yet</h2>
                    <p>Swipe right on properties you like to see them here.</p>
                    <Link to="/discover" className="btn btn-primary">Start Discovering</Link>
                </div>
            ) : (
                <div className="property-grid">
                    {interactions.map((item) => (
                        <PropertyCard key={item._id} property={item.property} compact />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Liked;
