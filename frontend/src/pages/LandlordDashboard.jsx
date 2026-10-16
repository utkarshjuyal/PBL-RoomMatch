import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMyProperties, deleteProperty } from "../services/propertyService";

const formatRent = (rent) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(rent);

const LandlordDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProperties = async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getMyProperties();
            setProperties(data);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load properties");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Deactivate this listing?")) return;

        try {
            await deleteProperty(id);
            setProperties((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete property");
        }
    };

    if (loading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="list-page">
            <div className="page-header row">
                <div>
                    <h1>My Listings</h1>
                    <p>Manage your property listings</p>
                </div>
                <Link to="/landlord/new" className="btn btn-primary">+ Add Property</Link>
            </div>

            {error && <p className="alert alert-error">{error}</p>}

            {properties.length === 0 ? (
                <div className="page-center empty-state">
                    <span className="empty-icon">🏢</span>
                    <h2>No listings yet</h2>
                    <p>Add your first property to start receiving tenant interest.</p>
                    <Link to="/landlord/new" className="btn btn-primary">Add Property</Link>
                </div>
            ) : (
                <div className="table-card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Rent</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties.map((property) => (
                                <tr key={property._id}>
                                    <td>{property.title}</td>
                                    <td>{property.city}{property.area ? `, ${property.area}` : ""}</td>
                                    <td>{formatRent(property.rent)}</td>
                                    <td>
                                        <span className={`status-pill ${property.status}`}>
                                            {property.status}
                                        </span>
                                    </td>
                                    <td className="table-actions">
                                        <Link to={`/landlord/edit/${property._id}`} className="btn btn-ghost btn-sm">
                                            Edit
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm danger"
                                            onClick={() => handleDelete(property._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LandlordDashboard;
