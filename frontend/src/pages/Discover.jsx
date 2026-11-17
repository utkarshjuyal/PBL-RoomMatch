import { useCallback, useEffect, useRef, useState } from "react";
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
    const [dragOffset, setDragOffset] = useState(0);
    const pointerStart = useRef(null);

    const loadRecommendations = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getRecommendations();
            setProperties(data);
            const savedId = sessionStorage.getItem("roommatch-discover-current");
            const savedIndex = savedId ? data.findIndex((item) => String(item._id) === savedId) : -1;
            setCurrentIndex(savedIndex >= 0 ? savedIndex : 0);
            if (savedIndex < 0) sessionStorage.removeItem("roommatch-discover-current");
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
    const actionHandlerRef = useRef(null);

    useEffect(() => {
        if (loading) return;
        if (currentProperty?._id) sessionStorage.setItem("roommatch-discover-current", String(currentProperty._id));
        else sessionStorage.removeItem("roommatch-discover-current");
    }, [loading, currentProperty?._id]);

    const advance = () => {
        setSwipeDirection("");
        setDragOffset(0);
        setSavedCurrent(false);
        setCurrentIndex((previous) => previous + 1);
    };

    const handleAction = async (action) => {
        if (!currentProperty || actionLoading) return;
        setActionLoading(true);
        setSwipeDirection(action === "LIKE" ? "right" : "left");
        setDragOffset(0);

        try {
            await recordInteraction(currentProperty._id, action);
            window.setTimeout(() => {
                advance();
                setActionLoading(false);
            }, 220);
        } catch (err) {
            setSwipeDirection("");
            setError(err.response?.data?.message || "Action failed");
            setActionLoading(false);
        }
    };

    actionHandlerRef.current = handleAction;

    useEffect(() => {
        const handleKeyboardAction = (event) => {
            const target = event.target;
            const isTyping = target instanceof HTMLElement && (
                target.isContentEditable ||
                ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)
            );
            if (isTyping || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                actionHandlerRef.current?.("DISLIKE");
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                actionHandlerRef.current?.("LIKE");
            }
        };

        window.addEventListener("keydown", handleKeyboardAction);
        return () => window.removeEventListener("keydown", handleKeyboardAction);
    }, []);

    const handleSave = async () => {
        if (!currentProperty || actionLoading || savedCurrent) return;
        setActionLoading(true);
        setError("");
        try {
            await saveProperty(currentProperty._id);
            setSavedCurrent(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save property");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePointerDown = (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pointerStart.current = { x: event.clientX, pointerId: event.pointerId };
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const handlePointerMove = (event) => {
        if (!pointerStart.current || actionLoading) return;
        setDragOffset(event.clientX - pointerStart.current.x);
    };

    const finishPointerGesture = (event) => {
        if (!pointerStart.current) return;
        const distance = event.clientX - pointerStart.current.x;
        pointerStart.current = null;
        setDragOffset(0);
        if (distance > 90) handleAction("LIKE");
        else if (distance < -90) handleAction("DISLIKE");
    };

    if (loading) {
        return (
            <div className="discover-loading">
                <div className="discover-loading-card"><span className="loading-shimmer" /></div>
                <p>Finding places that fit you…</p>
            </div>
        );
    }

    if (error && !currentProperty) {
        return (
            <div className="page-center">
                <p className="error-text">{error}</p>
                <button type="button" className="btn btn-primary" onClick={loadRecommendations}>Try again</button>
            </div>
        );
    }

    if (!currentProperty) {
        return (
            <div className="page-center empty-state discover-empty">
                <span className="empty-icon">✳</span>
                <span className="home-kicker">You've seen every match for now</span>
                <h2>That's a good start.</h2>
                <p>There are no more properties to show right now. Update your preferences or revisit the places you saved.</p>
                <div className="empty-actions">
                    <Link to="/preferences" className="btn btn-primary">Update preferences</Link>
                    <Link to="/saved" className="btn btn-secondary">View saved places</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="discover-page discover-page-immersive">
            <div className="discover-heading-new">
                <div>
                    <span className="home-kicker">A shortlist made around you</span>
                    <h1>Places worth a look.</h1>
                </div>
                <span className="discover-counter-new">
                    <strong>{properties.length - currentIndex}</strong> {properties.length - currentIndex === 1 ? "place" : "places"} to explore
                </span>
            </div>

            {error && <p className="alert alert-error discover-alert">{error}</p>}

            <div className="swipe-stack swipe-stack-large">
                <div
                    className={`swipe-card-wrapper ${swipeDirection}`}
                    style={dragOffset ? { transform: `translate3d(${dragOffset}px, 0, 0) rotate(${dragOffset / 34}deg)` } : undefined}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={finishPointerGesture}
                    onPointerCancel={() => { pointerStart.current = null; setDragOffset(0); }}
                >
                    <PropertyCard property={currentProperty} />
                </div>
            </div>

            {(currentProperty.matchBreakdown?.length > 0 || currentProperty.similarityReasons?.length > 0) && (
                <div className="discovery-match-notes" aria-live="polite">
                    {currentProperty.matchBreakdown?.some((item) => item.earned > 0) && (
                        <p><strong>Preference fit</strong><span>{currentProperty.matchBreakdown.filter((item) => item.earned > 0).map((item) => item.label).slice(0, 4).join(" · ")}</span></p>
                    )}
                    {currentProperty.similarityReasons?.length > 0 && (
                        <p><strong>Similar to places you liked</strong><span>{currentProperty.similarityReasons.slice(0, 3).join(" · ")}</span></p>
                    )}
                </div>
            )}

            <div className="swipe-controls-area">
                <div className="swipe-actions swipe-actions-new" aria-label="Property actions">
                    <button type="button" className="action-btn dislike" onClick={() => handleAction("DISLIKE")} disabled={actionLoading} aria-label="Pass on property" title="Pass">
                        <svg viewBox="0 0 24 24" width="23" height="23" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <span className="action-label">Pass</span>
                    </button>
                    <button type="button" className={`action-btn save ${savedCurrent ? "is-saved" : ""}`} onClick={handleSave} disabled={actionLoading || savedCurrent} aria-label="Save property" title={savedCurrent ? "Saved" : "Save for later"}>
                        <svg viewBox="0 0 24 24" width="21" height="21" stroke="currentColor" strokeWidth="1.8" fill={savedCurrent ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                        <span className="action-label">{savedCurrent ? "Saved" : "Save"}</span>
                    </button>
                    <button type="button" className="action-btn like" onClick={() => handleAction("LIKE")} disabled={actionLoading} aria-label="Like property" title="Like">
                        <svg viewBox="0 0 24 24" width="25" height="25" stroke="currentColor" strokeWidth="1.8" fill="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                        <span className="action-label">Like</span>
                    </button>
                </div>
                <p className="swipe-hint">Swipe or drag a card · <kbd>←</kbd> Pass <span>·</span> <kbd>→</kbd> Like</p>
            </div>
        </div>
    );
};

export default Discover;
