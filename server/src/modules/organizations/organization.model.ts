import mongoose, { Schema } from "mongoose";

import {
    DEFAULT_ORGANIZATION_CAPABILITIES,
    ORGANIZATION_CATEGORY_ENUM,
    ORGANIZATION_STATUS_ENUM,
    type OrganizationCategory,
    type OrganizationStatus,
} from "./constants/organization.constants";

export interface IOrganizationCapabilities {
    supportsMembers: boolean;
    supportsRoles: boolean;
    supportsTenures: boolean;
    supportsEvents: boolean;
    supportsPosts: boolean;
    supportsRecruitment: boolean;
    supportsHierarchy: boolean;
}

export interface IOrganizationLink {
    label: string;
    url: string;
}

export interface IOrganization extends mongoose.Document {
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
    links: IOrganizationLink[];
    contactEmail?: string;
    website?: string;
    establishedYear?: number;
    parentOrgId?: mongoose.Types.ObjectId;
    status: OrganizationStatus;
    isPermanent: boolean;
    capabilities: IOrganizationCapabilities;
    structureVersion: number;
    profileVersion: number;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const organizationCapabilitiesSchema = new Schema<IOrganizationCapabilities>(
    {
        supportsMembers: { type: Boolean, default: true },
        supportsRoles: { type: Boolean, default: true },
        supportsTenures: { type: Boolean, default: true },
        supportsEvents: { type: Boolean, default: true },
        supportsPosts: { type: Boolean, default: true },
        supportsRecruitment: { type: Boolean, default: false },
        supportsHierarchy: { type: Boolean, default: true },
    },
    { _id: false }
);

const organizationLinkSchema = new Schema<IOrganizationLink>(
    {
        label: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const organizationSchema = new Schema<IOrganization>(
    {
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
        links: { type: [organizationLinkSchema], default: [] },
        contactEmail: { type: String, trim: true, lowercase: true },
        website: { type: String, trim: true },
        establishedYear: { type: Number },
        parentOrgId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
        },
        status: {
            type: String,
            enum: ORGANIZATION_STATUS_ENUM,
            default: "active",
        },
        isPermanent: { type: Boolean, default: false },
        capabilities: {
            type: organizationCapabilitiesSchema,
            default: () => ({ ...DEFAULT_ORGANIZATION_CAPABILITIES }),
        },
        structureVersion: { type: Number, default: 1 },
        profileVersion: { type: Number, default: 1 },
        createdBy: { type: Schema.Types.ObjectId, ref: "Student" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    },
    { timestamps: true }
);

organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ category: 1, status: 1, _id: 1 });
organizationSchema.index({ parentOrgId: 1, status: 1, _id: 1 });
organizationSchema.index({ isPermanent: 1, category: 1, _id: 1 });

const Organization = mongoose.model<IOrganization>(
    "Organization",
    organizationSchema
);

export default Organization;
