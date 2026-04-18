import mongoose from "mongoose";

interface ILocationInfo {
    ip?: string;
    city?: string;
    country?: string;
}

interface ISession {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    previousRefreshToken?: string;
    deviceInfo?: string;
    expiresAt: Date;
    lastAccessedAt?: Date;
    initialLocation?: ILocationInfo;
    currentLocation?: ILocationInfo;
    userAgent?: string;
    rotatedAt?: Date;
    graceExpiresAt?: Date;
    endedAt?: Date;
    endReason?: "logout" | "expired" | "revoked";
    deletesAt?: Date;
    revoked?: boolean;
}

const sessionSchema = new mongoose.Schema<ISession>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        refreshToken: { type: String, required: true },
        previousRefreshToken: { type: String },
        deviceInfo: { type: String },
        expiresAt: { type: Date, required: true },
        lastAccessedAt: { type: Date, default: Date.now },
        initialLocation: {
            ip: { type: String },
            city: { type: String },
            country: { type: String },
        },
        currentLocation: {
            ip: { type: String },
            city: { type: String },
            country: { type: String },
        },
        userAgent: { type: String },
        rotatedAt: { type: Date },
        graceExpiresAt: { type: Date },
        endedAt: { type: Date },
        endReason: {
            type: String,
            enum: ["logout", "expired", "revoked"],
        },
        deletesAt: { type: Date },
        revoked: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// TODO: Add indexes for efficient querying and automatic cleanup of expired sessions, add logic for diff revokation types (logout, expired, revoked)
sessionSchema.index({ deletesAt: 1 }, { expireAfterSeconds: 0, sparse: true });
sessionSchema.index({ userId: 1 });

const Session = mongoose.model<ISession>("Session", sessionSchema);

export default Session;

// TODO: Add cron job to update endedAt date for expired sessions
