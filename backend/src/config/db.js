const mongoose = require("mongoose");
const config = require("./config");

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  const connection = await mongoose.connect(config.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};
module.exports = connectDB;
