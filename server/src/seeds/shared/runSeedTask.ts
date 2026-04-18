import mongoose from "mongoose";
import { connectDB } from "../../config/db";

export const runSeedTask = async (
    taskName: string,
    task: () => Promise<void>
) => {
    try {
        await connectDB();
        await task();
        console.log(`[seed] ${taskName} completed`);
    } catch (error) {
        console.error(`[seed] ${taskName} failed:`, error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
};
