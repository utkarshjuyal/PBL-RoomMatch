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
    const [savedCurrent, setSavedCurrent] = useState(false);
    const [error, setError] = useState("");
    const [swipeDirection, setSwipeDirection] = useState("");

    const loadRecommendations = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getRecommendations();
            setProperties(data);
            setCurrentIndex(0);
            setSavedCurrent(false);
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
        setSavedCurrent(false);
        setCurrentIndex((prev) => prev + 1);
    };

    const handleAction = async (action) => {
        if (!currentProperty || actionLoading) return;

        setActionLoading(true);
        setSwipeDirection(action === "LIKE" ? "right" : "left");

        try {
            await recordInteraction(currentProperty._id, action);
            setTimeout(() => {
                advance();
                setActionLoading(false);
            }, 220);
        } catch (err) {
            setSwipeDirection("");
            setError(err.response?.data?.message || "Action failed");
            setActionLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentProperty || actionLoading || savedCurrent) return;

        setActionLoading(true);

        try {
            await saveProperty(currentProperty._id);
            setSavedCurrent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save property");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-center">
                <div className="spinner" />
                <p>Finding your perfect match...</p>
            </div>
        );
    }

    if (error && !currentProperty) {
        return (
            <div className="page-center">
                <p className="error-text">{error}</p>
                <button type="button" className="btn btn-primary" onClick={loadRecommendations}>
                    Try Again
                </button>
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
                <span className="discover-counter">
                    {properties.length - currentIndex} {properties.length - currentIndex === 1 ? "property" : "properties"} remaining
                </span>
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
                    aria-label="Pass"
                    title="Pass"
                >
                    <svg viewBox="0 0 24 24" width="26" height="26" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span className="action-label">Pass</span>
                </button>

                <button
                    type="button"
                    className={`action-btn save ${savedCurrent ? "is-saved" : ""}`}
                    onClick={handleSave}
                    disabled={actionLoading || savedCurrent}
                    aria-label="Save property"
                    title={savedCurrent ? "Saved" : "Save for later"}
                >
                    <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.2" fill={savedCurrent ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span className="action-label">{savedCurrent ? "Saved" : "Save"}</span>
                </button>

                <button
                    type="button"
                    className="action-btn like"
                    onClick={() => handleAction("LIKE")}
                    disabled={actionLoading}
                    aria-label="Like"
                    title="Like"
                >
                    <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2.2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span className="action-label">Like</span>
                </button>
            </div>
        </div>
    );
};

export default Discover;