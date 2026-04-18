// server/src/seeds/cleanupTestStudents.ts
// Deletes all test students marked with isTest: true

import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Student from "../modules/students/student.model";

const cleanup = async () => {
    try {
        await connectDB();
        const result = await Student.deleteMany({ isTest: true });
        console.log(`🧹 Deleted ${result.deletedCount} test students`);
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
};

cleanup();
