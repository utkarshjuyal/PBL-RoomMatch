// config.js validates every required env var and throws if any is missing.
const config = require("./src/config/config");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const start = async () => {
  await connectDB();
  app.listen(config.PORT, () => console.log(`RoomMatch API listening on http://localhost:${config.PORT}`));
};
start().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  process.exit(1);
});
