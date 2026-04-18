// server/src/seeds/index.ts

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import { seedMasterData } from "./masterData.seed";
import { seedTestStudents } from "./testStudents.seed";

const runSeeds = async () => {
    try {
        await connectDB();
        await seedMasterData();

        // Seed test students if TEST_DATA env is set
        if (process.env.TEST_DATA === "true") {
            await seedTestStudents();
        }

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
