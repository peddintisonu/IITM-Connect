// server/src/seeds/index.ts

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { seedMasterData } from "./masterData.seed";

const runSeeds = async () => {
    try {
        await connectDB();
        await seedMasterData();

        // add future seeds here
        // await seedOrgs();
        // await seedAdminUser();
    } catch (error) {
        console.error("Seeding failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};

runSeeds();
