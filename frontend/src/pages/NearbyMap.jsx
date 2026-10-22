import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { saveProperty } from "../services/savedService";
import { getProfile } from "../services/profileService";

const money = value => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
const DEFAULT_CENTER = [30.3165, 78.0322];

export default function NearbyMap() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState(searchParams.get("city") || "Dehradun");
  const [maxRent, setMaxRent] = useState(Number(searchParams.get("maxRent") || 30000));
  const [kind, setKind] = useState("ALL");
  const [radius, setRadius] = useState(15);
  const [searchCoords, setSearchCoords] = useState(null);
  const [sortBy, setSortBy] = useState("recommended");
  const [viewMode, setViewMode] = useState("split");
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationMessage, setLocationMessage] = useState("Showing sample listings around Dehradun. Exact property addresses are not implied for demo data.");
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const userMarkerLayer = useRef(null);

  const loadProperties = useCallback(async (coords = searchCoords) => {
    setLoading(true); setError("");
    try {
      const params = { city: coords ? undefined : (city.trim() || undefined), maxRent: maxRent || undefined, propertyType: kind !== "ALL" ? kind : undefined };
      if (coords) { params.latitude = coords[0]; params.longitude = coords[1]; params.radiusKm = radius; }
      const response = await api.get("/api/properties", { params });
      setProperties(response.data.properties || []);
    } catch (e) { setError(e.response?.data?.message || "Could not load properties. Check the backend connection and try again."); }
    finally { setLoading(false); }
  }, [city, maxRent, kind, radius, searchCoords]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const useMyLocation = () => {
    if (!navigator.geolocation) { setLocationMessage("Location is not supported by this browser. Search for a city or locality instead."); return; }
    setLocationMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(position => {
      const coords = [position.coords.latitude, position.coords.longitude];
      setCenter(coords); setSearchCoords(coords); setCity(""); setLocationMessage("Showing listings within your selected search radius. Demo locations are approximate locality points.");
      loadProperties(coords);
      if (mapInstance.current) mapInstance.current.setView(coords, 13);
    }, () => setLocationMessage("Location permission was unavailable. You can still search by city or locality."), { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  };

  useEffect(() => {
    if (!mapRef.current || !window.L) return;
    const L = window.L;
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, { scrollWheelZoom: true }).setView(center, 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>' }).addTo(mapInstance.current);
      markersLayer.current = (L.markerClusterGroup ? L.markerClusterGroup({ showCoverageOnHover: false, spiderfyOnMaxZoom: true }) : L.layerGroup()).addTo(mapInstance.current);
      userMarkerLayer.current = L.layerGroup().addTo(mapInstance.current);
    }
    const map = mapInstance.current;
    map.setView(center, map.getZoom() < 11 ? 12 : map.getZoom());
    markersLayer.current.clearLayers();
    userMarkerLayer.current?.clearLayers();
    if (searchCoords) { const userIcon = L.divIcon({ className: "roommatch-user-marker", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] }); L.marker(searchCoords, { icon: userIcon, zIndexOffset: 1000 }).bindTooltip("Your selected location").addTo(userMarkerLayer.current); }
    properties.filter(p => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))).forEach(property => {
      const icon = L.divIcon({ className: "roommatch-map-marker", html: `<span>₹${Math.round(Number(property.rent || 0) / 1000 * 10) / 10}k</span>`, iconSize: [62, 32], iconAnchor: [31, 16] });
      const marker = L.marker([Number(property.latitude), Number(property.longitude)], { icon }).addTo(markersLayer.current);
      marker.bindTooltip(String(property.title || "Property"), { direction: "top" });
      marker.on("click", () => setSelected(property));
    });
    const timer = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(timer);
  }, [properties, center, searchCoords, viewMode]);

  useEffect(() => () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } }, []);

  const visibleProperties = useMemo(() => { const items = properties.filter(p => Number(p.rent) <= maxRent && (kind === "ALL" || p.propertyType === kind)); return items.sort((a,b) => sortBy === "rent-low" ? a.rent-b.rent : sortBy === "rent-high" ? b.rent-a.rent : sortBy === "newest" ? new Date(b.createdAt)-new Date(a.createdAt) : sortBy === "recommended" && (a.recommendationScore != null || b.recommendationScore != null) ? (b.recommendationScore || 0)-(a.recommendationScore || 0) : (a.distanceKm ?? 99999)-(b.distanceKm ?? 99999)); }, [properties, maxRent, kind, sortBy]);
  const onSearch = e => { e.preventDefault(); setSearchCoords(null); loadProperties(null); };
  const applyPreferences = async () => { try { const data = await getProfile(); const profile = data.profile || data.tenantProfile || data; const preferredLocation = profile.preferredArea || profile.preferredCity || profile.preferredLocation || "Dehradun"; const preferredBudget = Number(profile.budgetMax || 30000); const preferredType = profile.accommodationType || "ALL"; setCity(preferredLocation); setMaxRent(preferredBudget); setKind(preferredType); setSearchCoords(null); const params = { city: preferredLocation, minRent: profile.budgetMin || undefined, maxRent: preferredBudget, propertyType: preferredType !== "ALL" ? preferredType : undefined }; const response = await api.get("/api/properties", { params }); const score = p => { let n = 0; const city = profile.preferredCity || profile.preferredLocation; if (city && p.city?.toLowerCase() === city.toLowerCase()) n += 30; if (profile.preferredArea && p.area?.toLowerCase() === profile.preferredArea.toLowerCase()) n += 10; if (profile.budgetMin != null && profile.budgetMax != null && p.rent >= profile.budgetMin && p.rent <= profile.budgetMax) n += 25; else if (profile.budgetMax != null && p.rent <= profile.budgetMax) n += 15; if (profile.preferredRoomType && p.roomType === profile.preferredRoomType) n += 15; if (profile.accommodationType && p.propertyType === profile.accommodationType) n += 10; const amenities = profile.preferredAmenities || []; if (amenities.length) n += Math.round(10 * amenities.filter(a => (p.amenities || []).some(x => x.toLowerCase() === a.toLowerCase())).length / amenities.length); return n; }; setProperties((response.data.properties || []).map(p => ({ ...p, recommendationScore: score(p) })).sort((a,b) => b.recommendationScore-a.recommendationScore)); setSortBy("recommended"); setLocationMessage("Your saved tenant preferences have been applied. Listings are filtered and ranked using your budget, location, room type, accommodation type, and amenities."); } catch (e) { setError(e.response?.data?.message || "Could not load your saved preferences. Update your tenant profile first."); } };
  const save = async p => { try { await saveProperty(p._id); setLocationMessage(`Saved “${p.title}” to your saved properties.`); } catch (e) { setLocationMessage(e.response?.data?.message || "Could not save this property."); } };

  return <div className="nearby-page">
    <header className="nearby-heading"><div><span className="eyebrow">RoomMatch discovery</span><h1>Find places around you.</h1><p>Explore the map, then narrow the results to fit your life.</p></div><div className="nearby-header-actions"><button type="button" className="btn btn-secondary" onClick={applyPreferences}>Apply my preferences</button><button type="button" className="btn btn-primary" onClick={useMyLocation}>⌖ Use my location</button></div></header>
    <form className="map-filters panel-surface" onSubmit={onSearch}>
      <label>City or locality<input value={city} onChange={e=>setCity(e.target.value)} placeholder="Try Dehradun" /></label>
      <label>Property type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="ALL">All types</option><option value="PG">PG</option><option value="ROOM">Room</option><option value="FLAT">Flat</option><option value="HOSTEL">Hostel</option></select></label>
      <label className="budget-filter">Max monthly rent <strong>{money(maxRent)}</strong><input type="range" min="3000" max="30000" step="500" value={maxRent} onChange={e=>setMaxRent(Number(e.target.value))}/></label>
      <label>Radius<select value={radius} onChange={e=>setRadius(Number(e.target.value))}><option value="5">5 km</option><option value="10">10 km</option><option value="15">15 km</option><option value="25">25 km</option><option value="50">50 km</option></select></label>
      <label>Sort by<select value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="recommended">Best match / nearest</option><option value="rent-low">Lowest rent</option><option value="rent-high">Highest rent</option><option value="newest">Recently added</option></select></label>
      <button className="btn btn-primary" type="submit">Apply filters</button>
      <button className="btn btn-secondary" type="button" onClick={()=>{setCity("Dehradun");setMaxRent(30000);setKind("ALL");setSearchCoords(null);setCenter(DEFAULT_CENTER);setTimeout(()=>loadProperties(null),0);}}>Reset</button>
    </form>
    <p className="map-note">ⓘ {locationMessage}</p>
    {error && <div className="alert alert-error">{error}</div>}
    <div className={`map-results-layout view-${viewMode}`}>
      <section className="map-panel"><div className="map-panel-heading"><div><strong>Nearby map</strong><small>{visibleProperties.length} matching listings</small></div><div className="map-panel-tools"><span className="map-theme-label">{document.documentElement.dataset.theme === "dark" ? "Dark theme" : document.documentElement.dataset.theme === "beige" ? "Soft earth" : "Warm light"}</span><div className="view-toggle" aria-label="Map and list view"><button type="button" className={viewMode === "map" ? "active" : ""} onClick={()=>setViewMode("map")}>Map</button><button type="button" className={viewMode === "split" ? "active" : ""} onClick={()=>setViewMode("split")}>Both</button><button type="button" className={viewMode === "list" ? "active" : ""} onClick={()=>setViewMode("list")}>List</button></div></div></div><div className={`leaflet-map theme-map-${document.documentElement.dataset.theme || "light"}`} ref={mapRef} aria-label="Map of property listings">{!window.L && <div className="map-fallback">The interactive map could not load. Check your internet connection; the property list is still available.</div>}</div>
        <div className="map-legend"><span><i className="legend-dot"/> Property listing</span><span>Approximate demo locations</span></div>
      </section>
      <section className="map-list-panel"><div className="map-list-heading"><h2>Matching places</h2><span>{loading ? "Loading…" : visibleProperties.length}</span></div>
        {loading ? <div className="map-list-empty">Finding places…</div> : visibleProperties.length ? <div className="map-property-list">{visibleProperties.map(p=><article key={p._id} className={`map-property ${selected?._id===p._id?"selected":""}`} onClick={()=>{setSelected(p);if(mapInstance.current && p.latitude && p.longitude)mapInstance.current.setView([p.latitude,p.longitude],15);}}>
          <img src={p.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c45748?auto=format&fit=crop&w=700&q=80"} alt={p.title} loading="lazy" onError={e=>{e.currentTarget.src="https://images.unsplash.com/photo-1560448204-e02f11c45748?auto=format&fit=crop&w=700&q=80";}}/>
          <div className="map-property-content"><div className="map-property-tags"><span>{p.propertyType}</span>{p.demoListing && <span className="demo-tag">Demo</span>}</div><h3>{p.title}</h3><p>{p.area ? `${p.area}, ` : ""}{p.city}</p><strong>{money(p.rent)}<small>/month</small></strong><div className="map-card-actions"><button type="button" className="btn btn-secondary btn-small" onClick={e=>{e.stopPropagation();setSelected(p);if(mapInstance.current && p.latitude && p.longitude)mapInstance.current.setView([p.latitude,p.longitude],15);}}>View on map</button><button type="button" className="map-heart" aria-label={`Save ${p.title}`} onClick={e=>{e.stopPropagation();save(p);}}>♡</button></div></div>
        </article>)}</div> : <div className="map-list-empty"><span>⌖</span><h3>No places match yet</h3><p>Try a larger budget, a different property type, or another location.</p></div>}
      </section>
    </div>
    {selected && <div className="selected-property-bar"><img src={selected.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c45748?auto=format&fit=crop&w=300&q=80"} alt=""/><div className="selected-property-copy"><strong>{selected.title}</strong><span>{selected.area}, {selected.city} · {money(selected.rent)}/month</span><small>{selected.roomType} · {selected.propertyType}{selected.demoListing ? " · Demo listing" : ""}</small></div><button type="button" className="btn btn-secondary btn-small" onClick={()=>save(selected)}>♡ Save</button><Link to="/saved" className="text-link">Saved ↗</Link><button type="button" aria-label="Close selected property" onClick={()=>setSelected(null)}>×</button></div>}
  </div>;
}
