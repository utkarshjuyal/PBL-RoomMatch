import { useEffect, useState } from "react";
import {
  getProfile,
  saveProfile,
} from "../services/profileService";

function Profile() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    occupation: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();

        if (data.profile) {
          setFormData({
            age: data.profile.age || "",
            gender: data.profile.gender || "",
            occupation: data.profile.occupation || "",
          });
        }
      } catch (err) {
        if (err.message !== "Profile not found") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await saveProfile(formData);

      setMessage("Profile saved successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <h1>My Profile</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Age</label>

          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="16"
            max="100"
          />
        </div>

        <div>
          <label>Gender</label>

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">
              Prefer not to say
            </option>
          </select>
        </div>

        <div>
          <label>Occupation</label>

          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            placeholder="Student"
          />
        </div>

        <button type="submit">
          Save Profile
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default Profile;