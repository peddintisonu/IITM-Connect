import mongoose from "mongoose";

export interface IStudent extends mongoose.Document {
    name: string;
    email: string;
    profilePicture?: string;
    username?: string;
    status: "active" | "inactive" | "suspended";
    isOnboarded: boolean;
    tokenVersion: number;
    incrementTokenVersion: () => Promise<void>;
}

const studentSchema = new mongoose.Schema<IStudent>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        profilePicture: {
            type: String,
        },
        username: {
            type: String,
            unique: true,
            sparse: true, // allows multiple null/undefined values
        },

        status: {
            type: String,
            enum: ["active", "inactive", "suspended"],
            default: "active",
        },

        isOnboarded: {
            type: Boolean,
            default: false,
        },

        tokenVersion: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);

studentSchema.methods.incrementTokenVersion = async function () {
    this.tokenVersion += 1;
    await this.save();
};

const Student = mongoose.model("Student", studentSchema);

export default Student;
