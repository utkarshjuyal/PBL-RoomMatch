import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import { getProperty, getSimilarProperties } from "../services/propertyService";
import { getInteractions, recordInteraction, removeInteraction } from "../services/interactionService";
import { getSavedProperties, removeSavedProperty, saveProperty } from "../services/savedService";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);
const pretty = (value) => String(value || "").toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function PropertyDetail() {
    const { propertyId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [imageIndex, setImageIndex] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [brokenImage, setBrokenImage] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [busy, setBusy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const images = useMemo(() => (Array.isArray(property?.images) ? property.images.filter(Boolean) : []), [property?.images]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [data, similarData, likes, saves] = await Promise.all([
                getProperty(propertyId),
                getSimilarProperties(propertyId).catch(() => []),
                getInteractions("LIKE").catch(() => []),
                getSavedProperties().catch(() => []),
            ]);
            setProperty(data);
            setSimilar(similarData);
            setLiked(likes.some((item) => String(item.property?._id) === String(propertyId)));
            setSaved(saves.some((item) => String(item.property?._id) === String(propertyId)));
        } catch (err) {
            setError(err.response?.data?.message || "This property could not be loaded.");
        } finally {
            setLoading(false);
        }
    }, [propertyId]);

    useEffect(() => {
        setImageIndex(0);
        setBrokenImage(false);
        setImageLoading(true);
        load();
    }, [load]);

    const back = () => {
        if (window.history.state?.idx > 0) navigate(-1);
        else navigate(location.state?.from || "/discover");
    };

    const changeImage = useCallback((direction) => {
        if (!images.length) return;
        setImageIndex((current) => (current + direction + images.length) % images.length);
        setBrokenImage(false);
        setImageLoading(true);
    }, [images.length]);

    useEffect(() => {
        if (!lightbox) return undefined;
        const handleKey = (event) => {
            if (event.key === "Escape") setLightbox(false);
            if (event.key === "ArrowRight") changeImage(1);
            if (event.key === "ArrowLeft") changeImage(-1);
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightbox, changeImage]);

    const toggleLike = async () => {
        if (!property || busy) return;
        setBusy(true);
        try {
            if (liked) await removeInteraction(property._id);
            else await recordInteraction(property._id, "LIKE");
            setLiked((value) => !value);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update your liked properties.");
        } finally { setBusy(false); }
    };

    const toggleSave = async () => {
        if (!property || busy) return;
        setBusy(true);
        try {
            if (saved) await removeSavedProperty(property._id);
            else await saveProperty(property._id);
            setSaved((value) => !value);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update your saved properties.");
        } finally { setBusy(false); }
    };

    if (loading) return <div className="page-center"><div className="spinner" /><p>Opening property…</p></div>;
    if (error && !property) return <div className="page-center"><p className="error-text">{error}</p><button className="btn btn-primary" onClick={load}>Try again</button><button className="btn btn-ghost" onClick={back}>Go back</button></div>;
    if (!property) return null;

    const hasCoordinates = property.latitude !== null && property.latitude !== undefined && property.latitude !== ""
        && property.longitude !== null && property.longitude !== undefined && property.longitude !== ""
        && Number.isFinite(Number(property.latitude)) && Number.isFinite(Number(property.longitude));
    const locationSummary = [property.address, property.area, property.city].filter(Boolean).join(", ");
    const mapQuery = hasCoordinates ? `${property.latitude},${property.longitude}` : locationSummary;
    const directionsUrl = mapQuery ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery)}` : "";
    const mapEmbedUrl = mapQuery ? `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` : "";
    const landlordName = property.landlord?.displayName || property.landlordId?.name;
    const landlordPhone = property.landlord?.phone?.trim();

    return (
        <div className="property-detail-page">
            <div className="property-detail-toolbar">
                <button type="button" className="detail-back" onClick={back}><span aria-hidden="true">←</span> Back</button>
                <span>Property details</span>
                <Link to="/discover" className="detail-toolbar-link">Explore more</Link>
            </div>

            {error && <p className="alert alert-error">{error}</p>}

            <section className="property-detail-hero">
                <div className="property-gallery">
                    <div className="property-gallery-main">
                        {images.length && !brokenImage ? (
                            <button type="button" className="gallery-main-button" onClick={() => setLightbox(true)} aria-label="Open image gallery">
                                <>
                                    {imageLoading && <span className="gallery-image-loading" aria-hidden="true" />}
                                    <img src={images[imageIndex]} alt={`${property.title}, photo ${imageIndex + 1}`} onLoad={() => setImageLoading(false)} onError={() => { setImageLoading(false); setBrokenImage(true); }} fetchPriority="high" />
                                </>
                            </button>
                        ) : (
                            <div className="gallery-empty"><span>⌂</span><p>Photos are not available for this listing.</p></div>
                        )}
                        {images.length > 1 && <>
                            <button type="button" className="gallery-arrow gallery-arrow-left" onClick={() => changeImage(-1)} aria-label="Previous photo">‹</button>
                            <button type="button" className="gallery-arrow gallery-arrow-right" onClick={() => changeImage(1)} aria-label="Next photo">›</button>
                        </>}
                        {images.length > 0 && <span className="gallery-count">{imageIndex + 1} / {images.length}</span>}
                    </div>
                    {images.length > 1 && <div className="property-gallery-thumbs" aria-label="Property photos">
                        {images.map((src, index) => <button type="button" key={`${src}-${index}`} onClick={() => { setImageIndex(index); setBrokenImage(false); setImageLoading(true); }} className={index === imageIndex ? "active" : ""} aria-label={`Show photo ${index + 1}`}>
                            <img src={src} alt="" loading="lazy" />
                        </button>)}
                    </div>}
                </div>

                <div className="property-detail-summary">
                    <div className="property-detail-tags">
                        {property.demoListing && <span className="demo-label">Demo listing</span>}
                        {property.propertyType && <span>{pretty(property.propertyType)}</span>}
                        {property.roomType && <span>{pretty(property.roomType)} room</span>}
                    </div>
                    <h1>{property.title}</h1>
                    <p className="property-detail-location">{[property.area, property.city].filter(Boolean).join(", ") || "Location not specified"}</p>
                    <div className="property-detail-price">{money(property.rent)} <span>/ month</span></div>
                    <p className="property-detail-description">{property.description || "No description has been provided for this property."}</p>
                    <div className="property-detail-actions">
                        <button type="button" className={`btn ${liked ? "btn-liked" : "btn-primary"}`} onClick={toggleLike} disabled={busy}>{liked ? "♥ Liked" : "♡ Like"}</button>
                        <button type="button" className={`btn ${saved ? "btn-saved" : "btn-secondary"}`} onClick={toggleSave} disabled={busy}>{saved ? "Saved ✓" : "Save for later"}</button>
                    </div>
                    {property.demoImageNote && <p className="property-image-disclaimer">{property.demoImageNote}</p>}
                </div>
            </section>

            <div className="property-detail-mobile-actions" aria-label="Property actions">
                <button type="button" className={`btn ${liked ? "btn-liked" : "btn-primary"}`} onClick={toggleLike} disabled={busy}>{liked ? "♥ Liked" : "♡ Like"}</button>
                <button type="button" className={`btn ${saved ? "btn-saved" : "btn-secondary"}`} onClick={toggleSave} disabled={busy}>{saved ? "Saved ✓" : "Save for later"}</button>
            </div>

            <section className="property-detail-lower">
                <div className="property-detail-main-column">
                    <section className="detail-section">
                        <div className="detail-section-heading"><span>01 / AT A GLANCE</span><h2>The essentials</h2></div>
                        <div className="property-facts-grid">
                            {property.securityDeposit !== undefined && <div><small>Security deposit</small><strong>{money(property.securityDeposit)}</strong></div>}
                            {property.sharingArrangement && <div><small>Sharing</small><strong>{pretty(property.sharingArrangement)}</strong></div>}
                            {property.furnishing && <div><small>Furnishing</small><strong>{pretty(property.furnishing)}</strong></div>}
                            {property.occupancy && <div><small>Occupancy</small><strong>{property.occupancy} {property.occupancy === 1 ? "person" : "people"}</strong></div>}
                            {property.genderPreference && <div><small>Gender preference</small><strong>{pretty(property.genderPreference)}</strong></div>}
                            {property.availableFrom && <div><small>Available from</small><strong>{new Date(property.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></div>}
                        </div>
                    </section>

                    {property.amenities?.length > 0 && <section className="detail-section">
                        <div className="detail-section-heading"><span>02 / FACILITIES</span><h2>What’s included</h2></div>
                        <div className="detail-amenities">{property.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}</div>
                    </section>}

                    <section className="detail-section detail-location-section">
                        <div className="detail-section-heading"><span>03 / LOCATION</span><h2>Find your way</h2></div>
                        <div className="detail-map-card">
                            <div className="detail-map-mark" aria-hidden="true">⌖</div>
                            <div><strong>{locationSummary || "Location not provided"}</strong><p>{property.address || [property.area, property.city].filter(Boolean).join(", ") || "The listing does not include an address or coordinates."}</p>
                                {property.locationPrecision === "APPROXIMATE" && <small>Approximate locality marker · not an exact property address</small>}
                                {property.locationPrecision === "UNVERIFIED" && <small>Marker uses listing-provided details; location accuracy is unverified</small>}
                                {property.locationPrecision === "EXACT" && <small>Exact location supplied by the listing owner; confirm before visiting</small>}
                            </div>
                            {directionsUrl && <a href={directionsUrl} target="_blank" rel="noreferrer" className="detail-directions">Directions ↗</a>}
                        </div>
                        {mapEmbedUrl ? <div className="detail-map-embed">
                            <iframe title={`Map location for ${property.title}`} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                        </div> : <p className="field-hint">A map cannot be shown because this listing has no location details.</p>}
                    </section>

                    {landlordName && <section className="detail-section">
                        <div className="detail-section-heading"><span>04 / LISTED BY</span><h2>Host information</h2></div>
                        <div className="detail-host-card"><div className="detail-host-avatar">{landlordName.charAt(0).toUpperCase()}</div><div><strong>{landlordName}</strong><p>{property.landlord?.bio || "Property host"}</p></div>
                            {landlordPhone && <a href={`tel:${landlordPhone}`} className="btn btn-secondary btn-sm">Call host</a>}
                        </div>
                    </section>}
                </div>
                <aside className="property-detail-side-note">
                    <span>ROOMMATCH NOTE</span>
                    <p>Confirm the rent, deposit, current availability and all terms directly with the property owner before making a payment.</p>
                    {property.demoListing && <small>This listing is fictional demo data and does not represent an available rental.</small>}
                </aside>
            </section>

            {similar.length > 0 && <section className="more-like-this">
                <div className="more-like-heading"><div><span>BASED ON THIS PLACE</span><h2>More like this</h2></div><p>Other active listings with overlapping details.</p></div>
                <div className="property-grid">{similar.slice(0, 4).map((item) => <div key={item._id} className="similar-property-item"><PropertyCard property={item} compact />
                    {item.similarityReasons?.length > 0 && <p className="similarity-reasons">Similar: {item.similarityReasons.slice(0, 3).join(" · ")}</p>}
                    <span className="similarity-score">{item.similarityScore}% property similarity</span>
                </div>)}</div>
            </section>}

            {lightbox && images.length > 0 && <div className="property-lightbox" role="dialog" aria-modal="true" aria-label="Property photo gallery" onClick={() => setLightbox(false)}>
                <button type="button" className="lightbox-close" onClick={() => setLightbox(false)} aria-label="Close gallery">×</button>
                <button type="button" className="lightbox-arrow left" onClick={(event) => { event.stopPropagation(); changeImage(-1); }} aria-label="Previous image">‹</button>
                <img src={images[imageIndex]} alt={`${property.title}, photo ${imageIndex + 1}`} onClick={(event) => event.stopPropagation()} />
                <button type="button" className="lightbox-arrow right" onClick={(event) => { event.stopPropagation(); changeImage(1); }} aria-label="Next image">›</button>
                <span className="lightbox-counter">{imageIndex + 1} / {images.length}</span>
            </div>}
        </div>
    );
}
