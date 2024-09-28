import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url"; // Import fileURLToPath
import { dirname, resolve } from "path";
// dotenv.config({ path: "./.env" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file in the same directory
dotenv.config({ path: resolve(__dirname, ".env") });

export const Db = async () => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Database Connected: ${conn.connection.host}`);
    // console.log("Database coneccted");
  } catch (error) {
    console.log("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default Db;
