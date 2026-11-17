import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { dismissSavedReminder, getDueSavedReminder, removeSavedProperty } from "../services/savedService";

const relativeTime = (dateValue, now = Date.now()) => {
    const timestamp = new Date(dateValue).getTime();
    if (!Number.isFinite(timestamp)) return "a while";
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (seconds < 60) return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"}`;
};

export default function SavedReminderCenter({ user }) {
    const [reminder, setReminder] = useState(null);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState("");
    const [now, setNow] = useState(Date.now());
    const reminderRef = useRef(null);
    const checkingRef = useRef(false);
    const navigate = useNavigate();
    const location = useLocation();
    reminderRef.current = reminder;

    const checkForReminder = useCallback(async () => {
        const deferForPath = ["/profile", "/preferences", "/discover"].includes(location.pathname) || location.pathname.startsWith("/property/");
        if (reminderRef.current || checkingRef.current || busy || deferForPath || document.visibilityState === "hidden") return;
        checkingRef.current = true;
        try {
            const data = await getDueSavedReminder();
            if (data.reminder?.property) setReminder(data.reminder);
        } catch {
            // Reminder checks are best-effort and must never interrupt normal browsing.
        } finally {
            checkingRef.current = false;
        }
    }, [busy, location.pathname]);

    useEffect(() => {
        if (user?.role !== "tenant") {
            setReminder(null);
            return undefined;
        }
        const initial = window.setTimeout(checkForReminder, 1200);
        const interval = window.setInterval(checkForReminder, 30000);
        return () => {
            window.clearTimeout(initial);
            window.clearInterval(interval);
        };
    }, [user?.id, user?._id, user?.role, checkForReminder]);

    useEffect(() => {
        if (!reminder) return undefined;
        setNow(Date.now());
        const interval = window.setInterval(() => setNow(Date.now()), 30000);
        return () => window.clearInterval(interval);
    }, [reminder?._id]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") checkForReminder();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [checkForReminder]);

    const closeAndDismiss = async () => {
        if (!reminder?.property?._id) return;
        setBusy(true);
        setActionError("");
        try {
            await dismissSavedReminder(reminder.property._id);
        } catch {
            // The server has already marked the reminder as shown atomically.
            setActionError("Reminder state could not be updated. It will not be shown repeatedly.");
        } finally {
            setReminder(null);
            setBusy(false);
        }
    };

    const handleView = async () => {
        if (!reminder?.property?._id) return;
        const propertyId = reminder.property._id;
        await closeAndDismiss();
        navigate(`/property/${propertyId}`, { state: { from: location.pathname } });
    };

    const handleRemove = async () => {
        if (!reminder?.property?._id) return;
        setBusy(true);
        setActionError("");
        try {
            await removeSavedProperty(reminder.property._id);
            setReminder(null);
        } catch {
            setActionError("Could not remove this saved property. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    if (!reminder?.property) return null;
    const property = reminder.property;
    const image = property.images?.[0];

    return (
        <aside className="saved-reminder" role="status" aria-live="polite">
            <div className="saved-reminder-topline">
                <span className="saved-reminder-eyebrow">A little reminder</span>
                <button type="button" className="saved-reminder-close" onClick={closeAndDismiss} aria-label="Dismiss reminder" disabled={busy}>×</button>
            </div>
            <div className="saved-reminder-content">
                {image ? <img src={image} alt="" className="saved-reminder-image" loading="lazy" /> : <div className="saved-reminder-image saved-reminder-placeholder" aria-hidden="true">⌂</div>}
                <div className="saved-reminder-copy">
                    <p>You saved this property {relativeTime(reminder.createdAt, now)} ago. Still interested?</p>
                    <strong>{property.title}</strong>
                    <span>{property.area ? `${property.area}, ` : ""}{property.city}</span>
                </div>
            </div>
            {actionError && <p className="saved-reminder-error" role="alert">{actionError}</p>}
            <div className="saved-reminder-actions">
                <button type="button" onClick={handleView} className="btn btn-primary btn-sm" disabled={busy}>View property</button>
                <button type="button" onClick={closeAndDismiss} className="btn btn-secondary btn-sm" disabled={busy}>Keep saved</button>
                <button type="button" onClick={handleRemove} className="saved-reminder-remove" disabled={busy}>Remove</button>
            </div>
        </aside>
    );
}
