const formatRent = (rent) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(rent);

const PropertyCard = ({ property, compact = false }) => {
    const imageUrl = property.images?.[0] ||
        "https://images.unsplash.com/photo-1560448204-e02f11c45748?w=800";

    if (compact) {
        return (
            <article className="property-card compact">
                <img src={imageUrl} alt={property.title} />
                <div className="property-card-body">
                    <h3>{property.title}</h3>
                    <p className="rent">{formatRent(property.rent)}/mo</p>
                    <p className="location">{property.city}{property.area ? ` · ${property.area}` : ""}</p>
                </div>
            </article>
        );
    }

    return (
        <article className="property-card swipe-card">
            <div className="property-image-wrap">
                <img src={imageUrl} alt={property.title} />
                {(property.recommendationScore ?? property.matchScore) != null && (
                    <span className="match-badge">{property.recommendationScore ?? property.matchScore}% match</span>
                )}
            </div>

            <div className="property-card-body">
                <div className="property-meta-row">
                    <span className="tag">{property.propertyType}</span>
                    <span className="tag">{property.roomType}</span>
                </div>

                <h2>{property.title}</h2>
                <p className="rent">{formatRent(property.rent)} <span>/ month</span></p>
                <p className="location">{property.city}{property.area ? ` · ${property.area}` : ""}</p>

                {property.description && (
                    <p className="description">{property.description}</p>
                )}

                {property.amenities?.length > 0 && (
                    <div className="amenities">
                        {property.amenities.map((amenity) => (
                            <span key={amenity} className="amenity-chip">{amenity}</span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
};

export default PropertyCard;
