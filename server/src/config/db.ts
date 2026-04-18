// server/src/config/db.ts

import mongoose from "mongoose";
import { ENV } from "./env";

const MONGO_URI = ENV.MONGODB_URI;
const DB_NAME = ENV.DB_NAME;

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            dbName: DB_NAME,
        });
        console.log("✅ MongoDB connected successfully");
        console.log("Connection host:", conn.connection.host);
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); // Exit the process with failure
    }
};
