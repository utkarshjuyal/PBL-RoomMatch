require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = Number(process.env.PORT) || 5000;
const start = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing from backend/.env");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("Set JWT_SECRET to a random secret of at least 32 characters in backend/.env");
  await connectDB();
  app.listen(PORT, () => console.log(`RoomMatch API listening on http://localhost:${PORT}`));
};
start().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});
