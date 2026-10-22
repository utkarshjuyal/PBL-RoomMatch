require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const LandlordProfile = require("../src/models/LandlordProfile");
const Property = require("../src/models/Property");
const TenantProfile = require("../src/models/TenantProfile");

const demoPassword = "RoomMatchDemo@123";
// These are explicitly labelled sample listings. Coordinates point to approximate locality centres,
// not to verified individual rental addresses. No real landlord/contact claims are made.
const areas = [
  ["Clement Town", 30.2638, 78.0034], ["Prem Nagar", 30.3517, 77.9560], ["Ballupur", 30.3345, 78.0125],
  ["Rajpur Road", 30.3675, 78.0755], ["Patel Nagar", 30.3169, 78.0050], ["Dalanwala", 30.3295, 78.0530],
  ["Kishanpur", 30.3824, 78.0718], ["Vasant Vihar", 30.3250, 78.0020], ["Jakhan", 30.3855, 78.0820],
  ["Araghar", 30.3184, 78.0430], ["ISBT", 30.2857, 78.0040], ["Canal Road", 30.3480, 78.0560],
  ["Balliwala", 30.3305, 78.0048], ["Nehru Colony", 30.3028, 78.0475], ["Mothrowala", 30.2738, 78.0475],
  ["Race Course", 30.3160, 78.0375], ["Sahastradhara Road", 30.3750, 78.0900], ["Kaulagarh", 30.3565, 78.0035],
  ["Subhash Nagar", 30.2745, 78.0065], ["GMS Road", 30.3215, 78.0095]
];
const titles = [
  ["Sunlit Student Room", "ROOM", "SINGLE", 7500, ["WiFi", "Laundry", "Power Backup"]],
  ["Comfort Sharing PG", "PG", "DOUBLE", 6800, ["WiFi", "Food", "Laundry", "Parking"]],
  ["Compact Studio Flat", "FLAT", "SINGLE", 12500, ["WiFi", "AC", "Parking", "Power Backup"]],
  ["Budget Twin-Sharing PG", "PG", "DOUBLE", 6000, ["WiFi", "Food", "Laundry"]],
  ["Quiet Furnished Student Stay", "HOSTEL", "TRIPLE", 5200, ["WiFi", "Food", "Power Backup"]],
  ["Premium Room with Study Desk", "ROOM", "SINGLE", 9000, ["WiFi", "AC", "Laundry"]],
  ["Bright Shared Apartment", "FLAT", "DOUBLE", 10500, ["WiFi", "Parking", "Power Backup"]],
  ["Homely PG with Meals", "PG", "DOUBLE", 7200, ["WiFi", "Food", "Laundry"]],
  ["Private Room near Main Road", "ROOM", "SINGLE", 8200, ["WiFi", "AC"]],
  ["Simple Student Hostel", "HOSTEL", "TRIPLE", 4800, ["WiFi", "Food"]],
  ["Modern Two-Sharing Room", "ROOM", "DOUBLE", 6500, ["WiFi", "Laundry", "Parking"]],
  ["Garden View PG", "PG", "SINGLE", 9500, ["WiFi", "Food", "AC", "Power Backup"]],
  ["Minimal Studio for One", "FLAT", "SINGLE", 14000, ["WiFi", "AC", "Parking"]],
  ["Affordable Furnished Room", "ROOM", "SINGLE", 5700, ["WiFi", "Laundry"]],
  ["Shared Flat near Shops", "FLAT", "DOUBLE", 8800, ["WiFi", "Parking", "Laundry"]],
  ["Student-Friendly PG", "PG", "DOUBLE", 7000, ["WiFi", "Food", "Power Backup"]],
  ["Quiet Single Occupancy Room", "ROOM", "SINGLE", 8500, ["WiFi", "AC", "Laundry"]],
  ["Affordable Triple Sharing", "HOSTEL", "TRIPLE", 4500, ["WiFi", "Food"]],
  ["Furnished Room with Balcony", "ROOM", "SINGLE", 9800, ["WiFi", "AC", "Parking"]],
  ["Cozy Flat Share", "FLAT", "DOUBLE", 11000, ["WiFi", "Laundry", "Power Backup"]]
];
const landlords = [
  { email: "demo.landlord1@roommatch.test", name: "Demo Host One", displayName: "RoomMatch Demo Homes", phone: "", bio: "Sample listings for demonstrating the RoomMatch experience." },
  { email: "demo.landlord2@roommatch.test", name: "Demo Host Two", displayName: "Student Stay Samples", phone: "", bio: "Sample student accommodation entries. Availability is not verified." },
  { email: "demo.landlord3@roommatch.test", name: "Demo Host Three", displayName: "City Living Samples", phone: "", bio: "Demonstration data for map and preference filtering." },
  { email: "demo.landlord4@roommatch.test", name: "Demo Host Four", displayName: "Warm Nest Samples", phone: "", bio: "Fictional demo profile; not a real landlord." }
];
async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from backend/.env");
  await connectDB();
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  let inserted = 0, updated = 0;
  const users = [];
  for (const landlord of landlords) {
    const user = await User.findOneAndUpdate({ email: landlord.email }, { $set: { name: landlord.name, role: "landlord", password: passwordHash, emailVerified: true }, $setOnInsert: { email: landlord.email } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    users.push(user);
    await LandlordProfile.findOneAndUpdate({ user: user._id }, { $set: { displayName: landlord.displayName, phone: landlord.phone, city: "Dehradun", bio: landlord.bio } }, { upsert: true, new: true, runValidators: true });
  }
  for (let i = 0; i < titles.length; i++) {
    const [title, propertyType, roomType, rent, amenities] = titles[i];
    const [area, latitude, longitude] = areas[i];
    const user = users[i % users.length];
    const doc = {
      landlordId: user._id, title: `${title} · Demo`, description: `Demonstration listing near ${area}, Dehradun. This is sample data with an approximate locality location; rent and availability are not verified.`,
      propertyType, roomType, city: "Dehradun", area, address: `${area}, Dehradun (approximate demo location)`, rent,
      securityDeposit: Math.round(rent * (i % 3 === 0 ? 1 : 0.75)), amenities, images: [
        ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"][i % 4]
      ], latitude, longitude, demoListing: true, status: "ACTIVE"
    };
    const key = { landlordId: user._id, title: doc.title };
    const existed = await Property.exists(key);
    await Property.findOneAndUpdate(key, { $set: doc }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
    if (existed) updated++; else inserted++;
  }
  const tenantEmail = "demo.tenant@roommatch.test";
  const tenant = await User.findOneAndUpdate({ email: tenantEmail }, { $set: { name: "Demo Tenant", role: "tenant", password: passwordHash, emailVerified: true }, $setOnInsert: { email: tenantEmail } }, { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true });
  await TenantProfile.findOneAndUpdate({ user: tenant._id }, { $set: { preferredCity: "Dehradun", preferredArea: "Clement Town", budgetMin: 5000, budgetMax: 10000, accommodationType: "PG", preferredRoomType: "SINGLE", preferredAmenities: ["WiFi", "Food"] } }, { upsert: true, new: true, runValidators: true });
  const total = await Property.countDocuments({ demoListing: true, status: "ACTIVE" });
  console.log(`Demo seed complete. Active demo listings: ${total}. Inserted: ${inserted}; updated: ${updated}. Safe to rerun.`);
  console.log(`Demo password for all demo accounts: ${demoPassword}`);
  console.log(`Tenant: ${tenantEmail}`);
  console.log(`Landlords: ${landlords.map(x => x.email).join(", ")}`);
  console.log("Reminder: listings and locality-centre coordinates are sample data, not verified live rentals.");
  await mongoose.disconnect();
}
main().catch(async error => { console.error("Demo seed failed:", error.message); await mongoose.disconnect().catch(() => {}); process.exit(1); });
