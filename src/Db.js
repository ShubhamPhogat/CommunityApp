import mongoose from "mongoose";

let isConnected = false;
let dbConnection = null;

const connectToMongoDB = async () => {
  // If already connected, reuse the existing connection
  if (isConnected && dbConnection) {
    console.log("Using existing database connection");
    return dbConnection;
  }

  try {
    // Connection options optimized for serverless
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Increase selection timeout
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Connect to the MongoDB database
    const db = await mongoose.connect(process.env.MONGODB_URL, options);

    isConnected = true;
    dbConnection = db;

    console.log(`MongoDB connected: ${db.connection.host}`);
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
export default connectToMongoDB;
