const config = require("../src/config/config");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const LandlordProfile = require("../src/models/LandlordProfile");
const Property = require("../src/models/Property");
const SavedProperty = require("../src/models/SavedProperty");
const Interaction = require("../src/models/Interaction");
const TenantProfile = require("../src/models/TenantProfile");

const DEMO_PASSWORD = "RoomMatchDemo@123";
const DEMO_TENANT_EMAIL = config.DEMO_TENANT_EMAIL.trim().toLowerCase();
const DEMO_LANDLORDS = [
  { email: config.DEMO_LANDLORD1_EMAIL.trim().toLowerCase(), name: "Demo Host One", displayName: "RoomMatch Demo Homes", bio: "Fictional owner profile for product demonstrations." },
  { email: config.DEMO_LANDLORD2_EMAIL.trim().toLowerCase(), name: "Demo Host Two", displayName: "Doon Student Stays", bio: "Fictional owner profile for product demonstrations." },
  { email: config.DEMO_LANDLORD3_EMAIL.trim().toLowerCase(), name: "Demo Host Three", displayName: "The Doon Rooms", bio: "Fictional owner profile for product demonstrations." },
];
const LEGACY_DEMO_LANDLORD_EMAILS = [
  "demo.landlord1@roommatch.test",
  "demo.landlord2@roommatch.test",
  "demo.landlord3@roommatch.test",
  "demo.landlord4@roommatch.test",
];
const LEGACY_DEMO_USER_EMAILS = ["demo.tenant@roommatch.test", ...LEGACY_DEMO_LANDLORD_EMAILS];
const validDeliverableEmail = (value) => {
  if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  const domain = value.split("@").at(-1).toLowerCase();
  return !/(^|\.)(test|invalid|example|localhost)$/.test(domain);
};

// Illustrative stock interiors only. They are not photographs of these specific demo homes.
// Each URL is unique across the seed catalogue; review the source manifest before production use.
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=82`;
const listings = [
  {
    title: "Cedar House · Twin Room", owner: 0, area: "Clement Town", rent: 6800, deposit: 6800,
    propertyType: "PG", roomType: "DOUBLE", sharingArrangement: "DOUBLE_SHARING", furnishing: "FURNISHED", occupancy: 2, genderPreference: "ANY",
    amenities: ["WiFi", "Food", "Laundry", "Study Desk", "Power Backup"], latitude: 30.2638, longitude: 78.0034,
    description: "A furnished twin-sharing PG concept for students, with study space and everyday essentials. This is a fictional demonstration listing; rent and availability are sample values.",
    images: ["photo-1616486338812-3dadae4b4ace", "photo-1522708323590-d24dbb6b0267", "photo-1600210492486-724fe5c67fb0", "photo-1631049307264-da0ec9d70304"],
  },
  {
    title: "The Study Nook · Single Room", owner: 1, area: "Prem Nagar", rent: 8200, deposit: 8200,
    propertyType: "ROOM", roomType: "SINGLE", sharingArrangement: "SINGLE_OCCUPANCY", furnishing: "FURNISHED", occupancy: 1, genderPreference: "ANY",
    amenities: ["WiFi", "Study Desk", "Wardrobe", "Laundry", "Power Backup"], latitude: 30.3517, longitude: 77.9560,
    description: "A compact private-room concept with a dedicated study corner and furnished essentials. This is a fictional demonstration listing; rent and availability are sample values.",
    images: ["photo-1600607687939-ce8a6c25118c", "photo-1560448204-e02f11c45748", "photo-1600607687920-4e2a09cf159d", "photo-1600566753086-00f18fb6b3ea"],
  },
  {
    title: "Pine View PG · Triple Sharing", owner: 2, area: "Prem Nagar", rent: 5600, deposit: 5600,
    propertyType: "PG", roomType: "TRIPLE", sharingArrangement: "TRIPLE_SHARING", furnishing: "FURNISHED", occupancy: 3, genderPreference: "MALE",
    amenities: ["WiFi", "Food", "Laundry", "Common Kitchen", "Power Backup"], latitude: 30.3517, longitude: 77.9560,
    description: "A shared-stay concept intended for students looking for a lower monthly rent and basic facilities. This is a fictional demonstration listing; rent and availability are sample values.",
    images: ["photo-1600566753190-17f0baa2a6c3", "photo-1600585154340-be6161a56a0c", "photo-1600573472550-8090b5e0745a", "photo-1611892440504-42a792e24d32"],
  },
  {
    title: "Oak Studio · Furnished Flat", owner: 0, area: "Rajpur Road", rent: 14500, deposit: 14500,
    propertyType: "FLAT", roomType: "SINGLE", sharingArrangement: "SINGLE_OCCUPANCY", furnishing: "SEMI_FURNISHED", occupancy: 1, genderPreference: "ANY",
    amenities: ["WiFi", "Kitchen", "AC", "Parking", "Attached Bathroom"], latitude: 30.3675, longitude: 78.0755,
    description: "A studio-style apartment concept for someone who prefers a private space and a kitchenette. This is a fictional demonstration listing; rent and availability are sample values.",
    images: ["photo-1615874959474-d609969a20ed", "photo-1616486029423-aaa4789e8c9a", "photo-1618221195710-dd6b41faaea6", "photo-1598928506311-c55ded91a20c"],
  },
  {
    title: "Maple Residency · Double Room", owner: 1, area: "Dalanwala", rent: 7600, deposit: 7600,
    propertyType: "HOSTEL", roomType: "DOUBLE", sharingArrangement: "DOUBLE_SHARING", furnishing: "FURNISHED", occupancy: 2, genderPreference: "FEMALE",
    amenities: ["WiFi", "Food", "CCTV", "Laundry", "Common Area"], latitude: 30.3295, longitude: 78.0530,
    description: "A shared student-residence concept with furnished twin occupancy and common facilities. This is a fictional demonstration listing; rent and availability are sample values.",
    images: ["photo-1540518614846-7eded433c457", "photo-1586023492125-27b2c045efd7", "photo-1560185008-b033106af5c3", "photo-1617104678098-de229db51175"],
  },
  {
    title: "Hillview Rooms · Private Stay", owner: 2, area: "Jakhan", rent: 9800, deposit: 9800,
    propertyType: "ROOM", roomType: "SINGLE", sharingArrangement: "SINGLE_OCCUPANCY", furnishing: "FURNISHED", occupancy: 1, genderPreference: "ANY",
    amenities: ["WiFi", "AC", "Attached Bathroom", "Wardrobe", "Parking"], latitude: 30.3855, longitude: 78.0820,
    description: "A private furnished-room concept in the Jakhan locality, suitable for a tenant prioritising privacy. This is a fictional demonstration listing; rent and availability are sample values.",
    images: ["photo-1616594039964-ae9021a400a0", "photo-1618220179428-22790b461013", "photo-1615874694520-474822394e73", "photo-1600573472591-ee6b68d14c68"],
  },
];

async function main() {
  const allDemoEmails = [DEMO_TENANT_EMAIL, ...DEMO_LANDLORDS.map((item) => item.email)];
  if (!allDemoEmails.every(validDeliverableEmail) || new Set(allDemoEmails.map((email) => email.toLowerCase())).size !== allDemoEmails.length) {
    throw new Error("Set DEMO_TENANT_EMAIL and DEMO_LANDLORD1_EMAIL..DEMO_LANDLORD3_EMAIL to four distinct, deliverable inboxes in backend/.env. Demo accounts use the normal Brevo OTP verification flow.");
  }
  await connectDB();

  // Preflight all four inboxes before changing any account or listing.
  const existingDemoUsers = await User.find({ email: { $in: allDemoEmails } }).select("email role +demoAccount").lean();
  const unsafeCollision = existingDemoUsers.find((user) => user.demoAccount !== true);
  if (unsafeCollision) {
    throw new Error(`Refusing to overwrite non-demo user account: ${unsafeCollision.email}. Use four dedicated demo inboxes.`);
  }

  const landlordUsers = [];
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // Never repurpose an existing personal account as a demo account. Repeat runs
  // may update only accounts previously created by this dedicated seed.
  for (const landlord of DEMO_LANDLORDS) {
    const existing = await User.findOne({ email: landlord.email }).select("role +demoAccount").lean();
    if (existing && existing.demoAccount !== true) {
      throw new Error(`Refusing to overwrite non-demo user account: ${landlord.email}. Use four dedicated demo inboxes.`);
    }
    const user = await User.findOneAndUpdate(
      { email: landlord.email },
      { $set: { name: landlord.name, role: "landlord", password: passwordHash, emailVerified: false, demoAccount: true }, $unset: { emailVerification: "" }, $setOnInsert: { email: landlord.email } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    landlordUsers.push(user);
    await LandlordProfile.findOneAndUpdate(
      { user: user._id },
      { $set: { displayName: landlord.displayName, phone: "", city: "Dehradun", bio: landlord.bio } },
      { upsert: true, new: true, runValidators: true },
    );
  }

  // The previous seed used four fixed demo owners. Include the retired fourth owner
  // in this narrowly scoped cleanup, but do not modify or delete that user account.
  const legacyDemoOwners = await User.find({ email: { $in: LEGACY_DEMO_LANDLORD_EMAILS } }).select("_id").lean();
  const knownDemoOwnerIds = [
    ...landlordUsers.map((user) => user._id),
    ...legacyDemoOwners.map((user) => user._id),
  ];
  // Revoke the pre-verified state used by the old demo seed. These fixed .test
  // identities cannot receive email and must not remain a verification bypass.
  await User.updateMany(
    { email: { $in: LEGACY_DEMO_USER_EMAILS } },
    { $set: { emailVerified: false }, $unset: { emailVerification: "" } },
  );

  // Remove only explicitly flagged demo properties owned by known demo-only accounts.
  // First collect those exact IDs so only orphaned user interactions/saves for the
  // removed demo listings are cleaned up; unrelated user activity remains untouched.
  const oldDemoFilter = { demoListing: true, landlordId: { $in: knownDemoOwnerIds } };
  const oldDemoProperties = await Property.find(oldDemoFilter).select("_id").lean();
  const oldDemoPropertyIds = oldDemoProperties.map((item) => item._id);
  const [oldDemoRemoval, oldDemoInteractionRemoval, oldDemoSaveRemoval] = oldDemoPropertyIds.length
    ? await Promise.all([
      Property.deleteMany({ _id: { $in: oldDemoPropertyIds }, ...oldDemoFilter }),
      Interaction.deleteMany({ property: { $in: oldDemoPropertyIds } }),
      SavedProperty.deleteMany({ property: { $in: oldDemoPropertyIds } }),
    ])
    : [{ deletedCount: 0 }, { deletedCount: 0 }, { deletedCount: 0 }];

  const operations = listings.map((listing) => {
    const owner = landlordUsers[listing.owner];
    const title = `${listing.title} · Demo`;
    const payload = {
      landlordId: owner._id,
      title,
      description: listing.description,
      propertyType: listing.propertyType,
      roomType: listing.roomType,
      sharingArrangement: listing.sharingArrangement,
      furnishing: listing.furnishing,
      genderPreference: listing.genderPreference,
      occupancy: listing.occupancy,
      city: "Dehradun",
      area: listing.area,
      address: `${listing.area}, Dehradun (approximate locality only)`,
      locationPrecision: "APPROXIMATE",
      rent: listing.rent,
      securityDeposit: listing.deposit,
      availableFrom: new Date("2026-12-01T00:00:00.000Z"),
      amenities: listing.amenities,
      images: listing.images.map(image),
      latitude: listing.latitude,
      longitude: listing.longitude,
      demoListing: true,
      demoImageNote: "Illustrative Unsplash interiors; not photographs of this property.",
      status: "ACTIVE",
    };
    return {
      updateOne: {
        filter: { landlordId: owner._id, title, demoListing: true },
        update: { $set: payload },
        upsert: true,
      },
    };
  });
  const propertyResult = await Property.bulkWrite(operations, { ordered: true });

  const tenantEmail = DEMO_TENANT_EMAIL;
  const existingTenant = await User.findOne({ email: tenantEmail }).select("role +demoAccount").lean();
  if (existingTenant && existingTenant.demoAccount !== true) {
    throw new Error(`Refusing to overwrite non-demo user account: ${tenantEmail}. Use a dedicated demo inbox.`);
  }
  const tenant = await User.findOneAndUpdate(
    { email: tenantEmail },
    { $set: { name: "Demo Tenant", role: "tenant", password: passwordHash, emailVerified: false, demoAccount: true }, $unset: { emailVerification: "" }, $setOnInsert: { email: tenantEmail } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  await TenantProfile.findOneAndUpdate(
    { user: tenant._id },
    { $set: { preferredCity: "Dehradun", preferredArea: "Prem Nagar", budgetMin: 5000, budgetMax: 9500, accommodationType: "PG", preferredRoomType: "DOUBLE", preferredAmenities: ["WiFi", "Food", "Laundry"] } },
    { upsert: true, new: true, runValidators: true },
  );

  const total = await Property.countDocuments({ demoListing: true, status: "ACTIVE", landlordId: { $in: landlordUsers.map((user) => user._id) } });
  console.log(`Demo seed complete. Active curated demo listings: ${total}.`);
  console.log(`Old explicitly flagged demo listings removed: ${oldDemoRemoval.deletedCount}.`);
  console.log(`Orphan demo interactions/saves removed: ${oldDemoInteractionRemoval.deletedCount}/${oldDemoSaveRemoval.deletedCount}.`);
  console.log(`Inserted: ${propertyResult.upsertedCount}; updated: ${propertyResult.modifiedCount}.`);
  console.log(`Demo password (all accounts): ${DEMO_PASSWORD}`);
  console.log(`Tenant: ${tenantEmail}`);
  console.log(`Landlord: ${DEMO_LANDLORDS[0].email}`);
  console.log("Demo accounts are fictional and unverified. Sign in once to receive an OTP, then verify through the existing Brevo flow.");
  console.log("Locality pins and all listed prices/availability are sample-only and not live rental offers.");
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Demo seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
