import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const formatRent = (rent) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(rent) || 0);

const PropertyCard = ({ property, compact = false }) => {
    const images = Array.isArray(property.images) && property.images.length
        ? property.images
        : ["https://images.unsplash.com/photo-1560448204-e02f11c45748?auto=format&fit=crop&w=1400&q=85"];
    const [imageIndex, setImageIndex] = useState(0);
    const location = useLocation();
    const detailState = { from: location.pathname, scrollY: typeof window !== "undefined" ? window.scrollY : 0 };
    const imageUrl = images[imageIndex] || images[0];
    const matchScore = Number(property.matchScore);
    const similarityScore = Number(property.similarityScore);
    const preservePosition = () => {
        sessionStorage.setItem(`roommatch-scroll:${location.pathname}`, String(window.scrollY));
        if (location.pathname === "/discover") sessionStorage.setItem("roommatch-discover-current", String(property._id));
    };

    if (compact) {
        return (
            <Link to={`/property/${property._id}`} state={detailState} className="property-card-compact-link" onClick={preservePosition}>
                <article className="property-card compact">
                    <img src={imageUrl} alt={property.title || "Property"} loading="lazy" />
                    <div className="property-card-body">
                        <h3>{property.title}</h3>
                        <p className="rent">{formatRent(property.rent)}/mo</p>
                        <p className="location">{property.city}{property.area ? ` · ${property.area}` : ""}</p>
                        <span className="property-card-detail-label">View details ↗</span>
                    </div>
                </article>
            </Link>
        );
    }

    return (
        <article className="property-card swipe-card">
            <div className="property-image-wrap">
                <img src={imageUrl} alt={property.title || "Property interior"} draggable="false" />
                <div className="property-image-shade" />

                <div className="property-image-topline">
                    <span className="property-image-label">A place to call yours</span>
                    {matchScore > 0 && <span className="match-badge">{matchScore}% preference match</span>}
                    {similarityScore > 0 && <span className="similarity-badge">{similarityScore}% like similarity</span>}
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="property-image-control previous"
                            onClick={() => setImageIndex((index) => (index - 1 + images.length) % images.length)}
                            aria-label="Previous property image"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="property-image-control next"
                            onClick={() => setImageIndex((index) => (index + 1) % images.length)}
                            aria-label="Next property image"
                        >
                            ›
                        </button>
                        <span className="property-image-count">{imageIndex + 1} / {images.length}</span>
                    </>
                )}

                <div className="property-card-body">
                    <div className="property-meta-row">
                        {property.propertyType && <span className="tag">{property.propertyType}</span>}
                        {property.roomType && <span className="tag">{property.roomType}</span>}
                    </div>
                    <div className="property-title-row">
                        <div>
                            <Link to={`/property/${property._id}`} state={detailState} className="property-title-link" onClick={preservePosition}><h2>{property.title || "Available accommodation"}</h2></Link>
                            <p className="location">{property.area ? `${property.area}, ` : ""}{property.city || "Location not specified"}</p>
                        </div>
                        <p className="rent">{formatRent(property.rent)}<span> / month</span></p>
                    </div>
                    {property.description && <p className="description">{property.description}</p>}
                    <Link to={`/property/${property._id}`} state={detailState} className="property-view-detail" onClick={preservePosition}>Explore this place <span aria-hidden="true">↗</span></Link>
                    {property.amenities?.length > 0 && (
                        <div className="amenities">
                            {property.amenities.slice(0, 4).map((amenity) => (
                                <span key={amenity} className="amenity-chip">{amenity}</span>
                            ))}
                            {property.amenities.length > 4 && <span className="amenity-chip">+{property.amenities.length - 4}</span>}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
};

export default PropertyCard;
