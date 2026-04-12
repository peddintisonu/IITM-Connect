// server/src/modules/social/follow.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IFollow extends Document {
    followerId: mongoose.Types.ObjectId;
    followingId: mongoose.Types.ObjectId;
    followingType: "student" | "org";
    status: "pending" | "accepted";
    createdAt: Date;
    acceptedAt?: Date;
}

const followSchema = new Schema<IFollow>(
    {
        followerId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        followingId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "followingType",
        },
        followingType: {
            type: String,
            enum: ["student", "org"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "accepted",
        },
        acceptedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followingId: 1, status: 1 });

export const Follow = mongoose.model<IFollow>("Follow", followSchema);
