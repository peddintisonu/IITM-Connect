import mongoose from "mongoose";

interface ISession {
    userId: mongoose.Types.ObjectId; // Reference to the User model
    refreshToken: string;
    deviceInfo?: string; // Optional field to store device information
    expiresAt: Date;
}
const sessionSchema = new mongoose.Schema<ISession>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        refreshToken: { type: String, required: true },
        deviceInfo: { type: String },

        expiresAt: { type: Date, required: true },
    },

    {
        timestamps: true,
    }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
