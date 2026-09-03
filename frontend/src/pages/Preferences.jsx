import { useEffect, useState } from "react";
import {
  getProfile,
  saveProfile,
} from "../services/profileService";

const amenitiesList = [
  "WiFi",
  "AC",
  "Parking",
  "Food",
  "Laundry",
  "Power Backup",
  "Gym",
];

function Preferences() {
  const [formData, setFormData] = useState({
    preferredCity: "",
    preferredArea: "",
    budgetMin: "",
    budgetMax: "",
    accommodationType: "",
    preferredRoomType: "",
    preferredAmenities: [],
    moveInDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const data = await getProfile();

        if (data.profile) {
          setFormData({
            preferredCity:
              data.profile.preferredCity || "",

            preferredArea:
              data.profile.preferredArea || "",

            budgetMin:
              data.profile.budgetMin || "",

            budgetMax:
              data.profile.budgetMax || "",

            accommodationType:
              data.profile.accommodationType || "",

            preferredRoomType:
              data.profile.preferredRoomType || "",

            preferredAmenities:
              data.profile.preferredAmenities || [],

            moveInDate: data.profile.moveInDate
              ? data.profile.moveInDate.split("T")[0]
              : "",
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

    loadPreferences();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAmenityChange = (amenity) => {
    setFormData((previous) => {
      const alreadySelected =
        previous.preferredAmenities.includes(amenity);

      return {
        ...previous,
        preferredAmenities: alreadySelected
          ? previous.preferredAmenities.filter(
              (item) => item !== amenity
            )
          : [...previous.preferredAmenities, amenity],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      formData.budgetMin &&
      formData.budgetMax &&
      Number(formData.budgetMin) >
        Number(formData.budgetMax)
    ) {
      setError(
        "Minimum budget cannot be greater than maximum budget."
      );

      return;
    }

    try {
      await saveProfile(formData);

      setMessage("Preferences saved successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <p>Loading preferences...</p>;
  }

  return (
    <div>
      <h1>My Preferences</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Preferred City</label>

          <input
            type="text"
            name="preferredCity"
            value={formData.preferredCity}
            onChange={handleChange}
            placeholder="Dehradun"
          />
        </div>

        <div>
          <label>Preferred Area</label>

          <input
            type="text"
            name="preferredArea"
            value={formData.preferredArea}
            onChange={handleChange}
            placeholder="Rajpur Road"
          />
        </div>

        <div>
          <label>Minimum Budget</label>

          <input
            type="number"
            name="budgetMin"
            value={formData.budgetMin}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div>
          <label>Maximum Budget</label>

          <input
            type="number"
            name="budgetMax"
            value={formData.budgetMax}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div>
          <label>Accommodation Type</label>

          <select
            name="accommodationType"
            value={formData.accommodationType}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="PG">PG</option>
            <option value="FLAT">Flat</option>
            <option value="ROOM">Room</option>
            <option value="HOSTEL">Hostel</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label>Room Type</label>

          <select
            name="preferredRoomType"
            value={formData.preferredRoomType}
            onChange={handleChange}
          >
            <option value="">Select Room Type</option>
            <option value="SINGLE">Single</option>
            <option value="DOUBLE">Double</option>
            <option value="TRIPLE">Triple</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label>Preferred Amenities</label>

          {amenitiesList.map((amenity) => (
            <div key={amenity}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.preferredAmenities.includes(
                    amenity
                  )}
                  onChange={() =>
                    handleAmenityChange(amenity)
                  }
                />

                {amenity}
              </label>
            </div>
          ))}
        </div>

        <div>
          <label>Move-in Date</label>

          <input
            type="date"
            name="moveInDate"
            value={formData.moveInDate}
            onChange={handleChange}
          />
        </div>

        <button type="submit">
          Save Preferences
        </button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}

export default Preferences;