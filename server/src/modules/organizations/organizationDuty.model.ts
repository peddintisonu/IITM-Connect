import mongoose, { Schema } from "mongoose";

import {
    ORGANIZATION_DUTY_CODE_ENUM,
    type OrganizationDutyCode,
} from "./constants/organizationDuty.constants";

export interface IOrganizationDuty extends mongoose.Document {
    orgId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
    dutyCodes: OrganizationDutyCode[];
    canApproveLowerRoles: boolean;
    canApprovePeerRoles: boolean;
    isHighestApprovalRole: boolean;
    isActive: boolean;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const organizationDutySchema = new Schema<IOrganizationDuty>(
    {
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
        dutyCodes: {
            type: [String],
            enum: ORGANIZATION_DUTY_CODE_ENUM,
            default: [],
        },
        canApproveLowerRoles: { type: Boolean, default: false },
        canApprovePeerRoles: { type: Boolean, default: false },
        isHighestApprovalRole: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "Student" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    },
    { timestamps: true }
);

organizationDutySchema.index({ orgId: 1, roleId: 1 }, { unique: true });
organizationDutySchema.index({ orgId: 1, isActive: 1, _id: 1 });
organizationDutySchema.index({ orgId: 1, dutyCodes: 1, isActive: 1 });

const OrganizationDuty = mongoose.model<IOrganizationDuty>(
    "OrganizationDuty",
    organizationDutySchema
);

export default OrganizationDuty;
