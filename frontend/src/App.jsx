import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Preferences from "./pages/Preferences";
import Discover from "./pages/Discover";
import Saved from "./pages/Saved";
import Liked from "./pages/Liked";
import LandlordDashboard from "./pages/LandlordDashboard";
import LandlordForm from "./pages/LandlordForm";
import LandlordProfile from "./pages/LandlordProfile";
import NearbyMap from "./pages/NearbyMap";
import VerifyEmail from "./pages/VerifyEmail";
import { useAuth } from "./context/AuthContext";

const RoleRoute = ({ role, children }) => {
    const { user } = useAuth();

    if (user?.role !== role) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/map" element={<ProtectedRoute><RoleRoute role="tenant"><NearbyMap /></RoleRoute></ProtectedRoute>} />

                    <Route path="/discover" element={
                        <ProtectedRoute><RoleRoute role="tenant"><Discover /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/saved" element={
                        <ProtectedRoute><RoleRoute role="tenant"><Saved /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/liked" element={
                        <ProtectedRoute><RoleRoute role="tenant"><Liked /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><RoleRoute role="tenant"><Profile /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/preferences" element={
                        <ProtectedRoute><RoleRoute role="tenant"><Preferences /></RoleRoute></ProtectedRoute>
                    } />

                    <Route path="/landlord" element={
                        <ProtectedRoute><RoleRoute role="landlord"><LandlordDashboard /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/landlord/profile" element={
                        <ProtectedRoute><RoleRoute role="landlord"><LandlordProfile /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/landlord/new" element={
                        <ProtectedRoute><RoleRoute role="landlord"><LandlordForm /></RoleRoute></ProtectedRoute>
                    } />
                    <Route path="/landlord/edit/:id" element={
                        <ProtectedRoute><RoleRoute role="landlord"><LandlordForm /></RoleRoute></ProtectedRoute>
                    } />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
