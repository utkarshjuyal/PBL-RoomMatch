import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(() => localStorage.getItem("roommatch_theme") || "light");

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("roommatch_theme", theme);
    }, [theme]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path;

    const tenantLinks = [
        { to: "/discover", label: "Discover" },
        { to: "/saved", label: "Saved" },
        { to: "/liked", label: "Liked" },
        { to: "/profile", label: "Profile" },
        { to: "/preferences", label: "Preferences" }
    ];

    const landlordLinks = [
        { to: "/landlord", label: "Dashboard" },
        { to: "/landlord/profile", label: "Profile" },
        { to: "/landlord/new", label: "Add Property" }
    ];

    const links = user?.role === "landlord" ? landlordLinks : tenantLinks;

    return (
        <div className="app-shell">
            <header className="app-header">
                <Link to="/" className="brand">
                    <span className="brand-icon">🏠</span>
                    RoomMatch
                </Link>

                {user && (
                    <nav className="app-nav">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`nav-link ${isActive(link.to) ? "active" : ""}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                )}

                <div className="header-actions">
                    <label className="theme-picker" title="Choose appearance">
                        <span aria-hidden="true">◐</span>
                        <select aria-label="Theme" value={theme} onChange={(event) => setTheme(event.target.value)}>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="beige">Soft beige</option>
                        </select>
                    </label>
                    {user ? (
                        <>
                            <span className="user-badge">
                                {user.name}
                                <small>{user.role}</small>
                            </span>
                            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </header>

            <main className="app-main">
                {children}
            </main>
        </div>
    );
};

export default Layout;
