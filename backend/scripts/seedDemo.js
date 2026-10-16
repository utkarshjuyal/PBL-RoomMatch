require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const LandlordProfile = require("../src/models/LandlordProfile");
const Property = require("../src/models/Property");
const TenantProfile = require("../src/models/TenantProfile");

const demoPassword = "RoomMatchDemo@123";
const listings = [
  { email: "demo.landlord1@roommatch.test", name: "Aarav Mehta", displayName: "Aarav Homes", phone: "+91 98765 10001", city: "Dehradun", bio: "Student-friendly stays with clear pricing.", properties: [
    { title: "Sunny Single Room near Graphic Era", description: "Bright furnished room with study desk, wardrobe and reliable Wi-Fi. Ideal for students.", propertyType: "ROOM", roomType: "SINGLE", city: "Dehradun", area: "Clement Town", address: "Clement Town, Dehradun", rent: 7500, securityDeposit: 7500, amenities: ["WiFi", "Laundry", "Power Backup"], images: ["https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80"] },
    { title: "Comfort PG with Meals", description: "Well-maintained PG with homely meals, housekeeping and a common lounge.", propertyType: "PG", roomType: "DOUBLE", city: "Dehradun", area: "Prem Nagar", address: "Prem Nagar, Dehradun", rent: 6800, securityDeposit: 5000, amenities: ["WiFi", "Food", "Laundry", "Parking"], images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"] }
  ]},
  { email: "demo.landlord2@roommatch.test", name: "Isha Kapoor", displayName: "Kapoor Rentals", phone: "+91 98765 10002", city: "Dehradun", bio: "Quiet, clean and well-connected accommodation.", properties: [
    { title: "Modern Studio Flat near Rajpur Road", description: "Compact studio with natural light, kitchenette and a private bathroom.", propertyType: "FLAT", roomType: "SINGLE", city: "Dehradun", area: "Rajpur Road", address: "Rajpur Road, Dehradun", rent: 12500, securityDeposit: 20000, amenities: ["WiFi", "AC", "Parking", "Power Backup"], images: ["https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"] },
    { title: "Budget Twin-Sharing Student PG", description: "Affordable twin-sharing option close to shops and public transport.", propertyType: "PG", roomType: "DOUBLE", city: "Dehradun", area: "Ballupur", address: "Ballupur, Dehradun", rent: 6000, securityDeposit: 4000, amenities: ["WiFi", "Food", "Laundry"], images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80"] }
  ]},
  { email: "demo.landlord3@roommatch.test", name: "Rohan Bhatia", displayName: "Himalayan Living", phone: "+91 98765 10003", city: "Dehradun", bio: "Furnished spaces for students and working professionals.", properties: [
    { title: "Premium Furnished PG with AC", description: "Furnished room with AC, study area and shared kitchen facilities.", propertyType: "PG", roomType: "SINGLE", city: "Dehradun", area: "Kishanpur", address: "Kishanpur, Dehradun", rent: 9000, securityDeposit: 9000, amenities: ["WiFi", "AC", "Food", "Power Backup"], images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"] }
  ]}
];

async function upsertUser({ name, email, role, passwordHash }) {
  return User.findOneAndUpdate({ email }, { $set: { name, role, password: passwordHash } }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
}
async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from backend/.env");
  await connectDB();
  const passwordHash = await bcrypt.hash(demoPassword, 12);
  for (const item of listings) {
    const user = await upsertUser({ name: item.name, email: item.email, role: "landlord", passwordHash });
    await LandlordProfile.findOneAndUpdate({ user: user._id }, { $set: { displayName: item.displayName, phone: item.phone, city: item.city, bio: item.bio } }, { upsert: true, new: true, runValidators: true });
    for (const property of item.properties) {
      await Property.findOneAndUpdate({ landlordId: user._id, title: property.title }, { $set: { ...property, landlordId: user._id, status: "ACTIVE" } }, { upsert: true, new: true, runValidators: true });
    }
  }
  const tenantEmail = "demo.tenant@roommatch.test";
  const tenant = await upsertUser({ name: "Demo Tenant", email: tenantEmail, role: "tenant", passwordHash });
  await TenantProfile.findOneAndUpdate({ user: tenant._id }, { $set: { preferredCity: "Dehradun", preferredArea: "Clement Town", budgetMin: 5000, budgetMax: 10000, accommodationType: "PG", preferredRoomType: "SINGLE", preferredAmenities: ["WiFi", "Food"] } }, { upsert: true, new: true, runValidators: true });
  console.log("Demo data is ready.");
  console.log(`Demo password for all accounts: ${demoPassword}`);
  console.log("Landlords: demo.landlord1@roommatch.test, demo.landlord2@roommatch.test, demo.landlord3@roommatch.test");
  console.log(`Tenant: ${tenantEmail}`);
  await mongoose.disconnect();
}
main().catch(async (error) => { console.error("Demo seed failed:", error.message); await mongoose.disconnect().catch(() => {}); process.exit(1); });
