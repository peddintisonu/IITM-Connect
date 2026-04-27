// server/src/modules/pors/porClaims/porClaim.model.ts

import mongoose, { Schema } from "mongoose";

export type PORClaimStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface IPORClaim extends mongoose.Document {
    orgId: mongoose.Types.ObjectId;
    tenureId: mongoose.Types.ObjectId;
    tenureRoleConfigId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
    claimedBy: mongoose.Types.ObjectId;
    status: PORClaimStatus;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    rejectionReason?: string;
    notes?: string;
}

const porClaimSchema = new Schema<IPORClaim>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        tenureId: {
            type: Schema.Types.ObjectId,
            ref: "Tenure",
            required: true,
        },
        tenureRoleConfigId: {
            type: Schema.Types.ObjectId,
            ref: "TenureRoleConfig",
            required: true,
        },
        roleId: {
            type: Schema.Types.ObjectId,
            ref: "PORRole",
            required: true,
        },
        claimedBy: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "Student",
        },
        reviewedAt: { type: Date },
        rejectionReason: { type: String, trim: true },
        notes: { type: String, trim: true },
    },
    { timestamps: true }
);

porClaimSchema.index({ claimedBy: 1, status: 1 });
porClaimSchema.index({ orgId: 1, status: 1 });
porClaimSchema.index({ tenureRoleConfigId: 1, status: 1 });
porClaimSchema.index(
    { claimedBy: 1, tenureRoleConfigId: 1 },
    {
        unique: true,
        partialFilterExpression: { status: "pending" },
    }
);

const PORClaim = mongoose.model<IPORClaim>("PORClaim", porClaimSchema);

export default PORClaim;
