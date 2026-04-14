import mongoose from "mongoose";

interface ISession {
    userId: mongoose.Types.ObjectId; // Reference to the User model
    refreshToken: string;
    deviceInfo?: string; // Optional field to store device information
    expiresAt: Date;
    lastAccessedAt?: Date;
    ipAddress?: string;
    userAgent?: string;
    revoked?: boolean;
}

// TODO: Add more fields to the session model, such as IP address, user agent, etc., for better security and tracking.
// Also consider adding a field for the session's creation time and last accessed time to help with session management and security.
// For example:
// - ipAddress: { type: String }
// - userAgent: { type: String }

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
        lastAccessedAt: { type: Date, default: Date.now },
        ipAddress: { type: String },
        userAgent: { type: String },
        revoked: { type: Boolean, default: false },
    },
    {
        timestamps: true, // adds createdAt and updatedAt automatically
    }
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;
