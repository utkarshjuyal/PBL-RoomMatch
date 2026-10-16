import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PropertyCard from "../components/PropertyCard";
import { getRecommendations } from "../services/propertyService";
import { recordInteraction } from "../services/interactionService";
import { saveProperty } from "../services/savedService";

const Discover = () => {
    const [properties, setProperties] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [swipeDirection, setSwipeDirection] = useState("");

    const loadRecommendations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getRecommendations();
            setProperties(data);
            setCurrentIndex(0);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load properties");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRecommendations();
    }, [loadRecommendations]);

    const currentProperty = properties[currentIndex];

    const advance = () => {
        setSwipeDirection("");
        setCurrentIndex((prev) => prev + 1);
    };

    const handleAction = async (action) => {
        if (!currentProperty || actionLoading) return;

        setActionLoading(true);
        setSwipeDirection(action === "LIKE" ? "right" : "left");

        try {
            await recordInteraction(currentProperty._id, action);
            advance();
        } catch (err) {
            setSwipeDirection("");
            setError(err.response?.data?.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentProperty || actionLoading) return;

        setActionLoading(true);

        try {
            await saveProperty(currentProperty._id);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save property");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return <div className="page-center"><div className="spinner" /><p>Finding your perfect match...</p></div>;
    }

    if (error && !currentProperty) {
        return (
            <div className="page-center">
                <p className="error-text">{error}</p>
                <button type="button" className="btn btn-primary" onClick={loadRecommendations}>Try Again</button>
            </div>
        );
    }

    if (!currentProperty) {
        return (
            <div className="page-center empty-state">
                <span className="empty-icon">🎉</span>
                <h2>You're all caught up!</h2>
                <p>No more properties to show right now. Update your preferences or check back later.</p>
                <div className="empty-actions">
                    <Link to="/preferences" className="btn btn-primary">Update Preferences</Link>
                    <Link to="/saved" className="btn btn-secondary">View Saved</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="discover-page">
            <div className="discover-header">
                <h1>Discover</h1>
                <p>{properties.length - currentIndex} properties remaining</p>
            </div>

            {error && <p className="alert alert-error">{error}</p>}

            <div className="swipe-stack">
                <div className={`swipe-card-wrapper ${swipeDirection}`}>
                    <PropertyCard property={currentProperty} />
                </div>
            </div>

            <div className="swipe-actions">
                <button
                    type="button"
                    className="action-btn dislike"
                    onClick={() => handleAction("DISLIKE")}
                    disabled={actionLoading}
                    aria-label="Dislike"
                >
                    ✕
                </button>

                <button
                    type="button"
                    className="action-btn save"
                    onClick={handleSave}
                    disabled={actionLoading}
                    aria-label="Save"
                >
                    ★
                </button>

                <button
                    type="button"
                    className="action-btn like"
                    onClick={() => handleAction("LIKE")}
                    disabled={actionLoading}
                    aria-label="Like"
                >
                    ♥
                </button>
            </div>
        </div>
    );
};

export default Discover;
