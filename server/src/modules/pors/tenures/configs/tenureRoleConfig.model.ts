import mongoose, { Schema } from "mongoose";

export interface ITenureRoleConfig extends mongoose.Document {
    tenureId: mongoose.Types.ObjectId;
    orgId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
    isActiveInTenure: boolean;
    parentRoleId?: mongoose.Types.ObjectId;
    level: number;
    sortOrder: number;
    maxHolders: number;
    canBeVacant: boolean;
    effectiveFrom?: Date;
    effectiveTo?: Date;
    changeReason?: string;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const tenureRoleConfigSchema = new Schema<ITenureRoleConfig>(
    {
        tenureId: {
            type: Schema.Types.ObjectId,
            ref: "Tenure",
            required: true,
        },
        orgId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        roleId: {
            type: Schema.Types.ObjectId,
            ref: "PORRole",
            required: true,
        },
        isActiveInTenure: { type: Boolean, default: true },
        parentRoleId: {
            type: Schema.Types.ObjectId,
            ref: "PORRole",
            default: null,
        },
        level: { type: Number, default: 0 },
        sortOrder: { type: Number, default: 0 },
        maxHolders: { type: Number, default: 1 },
        canBeVacant: { type: Boolean, default: true },
        effectiveFrom: { type: Date },
        effectiveTo: { type: Date },
        changeReason: { type: String, trim: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "Student" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    },
    { timestamps: true }
);

tenureRoleConfigSchema.index({ tenureId: 1, roleId: 1 }, { unique: true });
tenureRoleConfigSchema.index({ orgId: 1, tenureId: 1, isActiveInTenure: 1 });
tenureRoleConfigSchema.index({ orgId: 1, tenureId: 1, level: 1, sortOrder: 1 });

const TenureRoleConfig = mongoose.model<ITenureRoleConfig>(
    "TenureRoleConfig",
    tenureRoleConfigSchema
);

export default TenureRoleConfig;
