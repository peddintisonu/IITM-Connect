import mongoose, { Schema } from "mongoose";

import {
    ORGANIZATION_CATEGORY_ENUM,
    type OrganizationCategory,
} from "../constants/organization.constants";
import {
    ORGANIZATION_APPROVAL_STATUS,
    ORGANIZATION_APPROVAL_STATUS_ENUM,
    ORGANIZATION_APPROVER_TYPE,
    ORGANIZATION_APPROVER_TYPE_ENUM,
    ORGANIZATION_REQUEST_STATUS,
    ORGANIZATION_REQUEST_STATUS_ENUM,
    type OrganizationApprovalStatus,
    type OrganizationApproverType,
    type OrganizationRequestStatus,
} from "../constants/organizationRequest.constants";

export interface IOrganizationApprovalStep {
    approverType: OrganizationApproverType;
    approverStudentId?: mongoose.Types.ObjectId;
    status: OrganizationApprovalStatus;
    remarks?: string;
    actedAt?: Date;
}

export interface IOrganizationRequestRoleConfigInput {
    roleId: mongoose.Types.ObjectId;
    parentRoleId?: mongoose.Types.ObjectId;
    level: number;
    sortOrder: number;
    maxHolders: number;
    canBeVacant: boolean;
}

export interface IOrganizationRequestLink {
    label: string;
    url: string;
}

export interface IOrganizationRequest extends mongoose.Document {
    requestedBy: mongoose.Types.ObjectId;
    status: OrganizationRequestStatus;
    organization: {
        name: string;
        shortName?: string;
        acronym?: string;
        slug: string;
        category: OrganizationCategory;
        description?: string;
        avatar?: string;
        coverImage?: string;
        avatarPublicId?: string;
        coverImagePublicId?: string;
        links: IOrganizationRequestLink[];
        contactEmail?: string;
        website?: string;
        establishedYear?: number;
        parentOrgId?: mongoose.Types.ObjectId;
        isPermanent: boolean;
    };
    firstTenure: {
        name: string;
        cycleYear?: number;
        startDate: Date;
        endDate: Date;
    };
    firstTenureRoleConfigs: IOrganizationRequestRoleConfigInput[];
    creatorRequestedRoleId: mongoose.Types.ObjectId;
    approvalSteps: IOrganizationApprovalStep[];
    requiresParentTopPorApproval: boolean;
    approvedOrganizationId?: mongoose.Types.ObjectId;
    approvedTenureId?: mongoose.Types.ObjectId;
    reviewedBy?: mongoose.Types.ObjectId;
    reviewRemarks?: string;
    reviewedAt?: Date;
}

const organizationApprovalStepSchema = new Schema<IOrganizationApprovalStep>(
    {
        approverType: {
            type: String,
            enum: ORGANIZATION_APPROVER_TYPE_ENUM,
            required: true,
        },
        approverStudentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            default: null,
        },
        status: {
            type: String,
            enum: ORGANIZATION_APPROVAL_STATUS_ENUM,
            default: ORGANIZATION_APPROVAL_STATUS.PENDING,
            required: true,
        },
        remarks: { type: String, trim: true },
        actedAt: { type: Date },
    },
    { _id: false }
);

const organizationRequestRoleConfigInputSchema =
    new Schema<IOrganizationRequestRoleConfigInput>(
        {
            roleId: {
                type: Schema.Types.ObjectId,
                ref: "PORRole",
                required: true,
            },
            parentRoleId: {
                type: Schema.Types.ObjectId,
                ref: "PORRole",
                default: null,
            },
            level: { type: Number, default: 0, required: true },
            sortOrder: { type: Number, default: 0, required: true },
            maxHolders: { type: Number, default: 1, required: true },
            canBeVacant: { type: Boolean, default: true, required: true },
        },
        { _id: false }
    );

const organizationRequestLinkSchema = new Schema<IOrganizationRequestLink>(
    {
        label: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const organizationRequestSchema = new Schema<IOrganizationRequest>(
    {
        requestedBy: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        status: {
            type: String,
            enum: ORGANIZATION_REQUEST_STATUS_ENUM,
            default: ORGANIZATION_REQUEST_STATUS.PENDING,
            required: true,
        },
        organization: {
            name: { type: String, required: true, trim: true },
            shortName: { type: String, trim: true },
            acronym: { type: String, trim: true, uppercase: true },
            slug: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
            },
            category: {
                type: String,
                enum: ORGANIZATION_CATEGORY_ENUM,
                required: true,
            },
            description: { type: String, trim: true },
            avatar: { type: String, trim: true },
            coverImage: { type: String, trim: true },
            avatarPublicId: { type: String, trim: true },
            coverImagePublicId: { type: String, trim: true },
            links: { type: [organizationRequestLinkSchema], default: [] },
            contactEmail: { type: String, trim: true, lowercase: true },
            website: { type: String, trim: true },
            establishedYear: { type: Number },
            parentOrgId: {
                type: Schema.Types.ObjectId,
                ref: "Organization",
                default: null,
            },
            isPermanent: { type: Boolean, default: false },
        },
        firstTenure: {
            name: { type: String, required: true, trim: true },
            cycleYear: { type: Number },
            startDate: { type: Date, required: true },
            endDate: { type: Date, required: true },
        },
        firstTenureRoleConfigs: {
            type: [organizationRequestRoleConfigInputSchema],
            default: [],
        },
        creatorRequestedRoleId: {
            type: Schema.Types.ObjectId,
            ref: "PORRole",
            required: true,
        },
        approvalSteps: {
            type: [organizationApprovalStepSchema],
            default: () => [
                {
                    approverType: ORGANIZATION_APPROVER_TYPE.SUPER_ADMIN,
                    status: ORGANIZATION_APPROVAL_STATUS.PENDING,
                },
            ],
        },
        requiresParentTopPorApproval: { type: Boolean, default: false },
        approvedOrganizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
        },
        approvedTenureId: {
            type: Schema.Types.ObjectId,
            ref: "Tenure",
            default: null,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            default: null,
        },
        reviewRemarks: { type: String, trim: true },
        reviewedAt: { type: Date },
    },
    { timestamps: true }
);

organizationRequestSchema.pre("validate", function () {
    if (this.requiresParentTopPorApproval) {
        const hasParentTopPorStep = this.approvalSteps.some(
            (step) =>
                step.approverType === ORGANIZATION_APPROVER_TYPE.PARENT_TOP_POR
        );

        if (!hasParentTopPorStep) {
            this.approvalSteps.push({
                approverType: ORGANIZATION_APPROVER_TYPE.PARENT_TOP_POR,
                status: ORGANIZATION_APPROVAL_STATUS.PENDING,
            });
        }
    }
});

organizationRequestSchema.index({ status: 1, createdAt: -1, _id: 1 });
organizationRequestSchema.index({ requestedBy: 1, createdAt: -1, _id: 1 });
organizationRequestSchema.index({ "organization.slug": 1 }, { unique: true });
organizationRequestSchema.index({ "organization.parentOrgId": 1, status: 1 });

const OrganizationRequest = mongoose.model<IOrganizationRequest>(
    "OrganizationRequest",
    organizationRequestSchema
);

export default OrganizationRequest;
