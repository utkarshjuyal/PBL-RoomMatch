import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const Register = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "tenant"
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await api.post(
                "/api/auth/register",
                formData
            );

            navigate("/login");

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div>

            <h1>RoomMatch</h1>

            <h2>Create Account</h2>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="tenant">
                        Tenant
                    </option>

                    <option value="landlord">
                        Landlord
                    </option>
                </select>

                <button type="submit">
                    {loading
                        ? "Creating..."
                        : "Register"}
                </button>

            </form>

        </div>
    );
};

export default Register;