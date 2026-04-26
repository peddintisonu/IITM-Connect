import mongoose, { Schema } from "mongoose";

import { ORGANIZATION_CATEGORY_ENUM } from "../../organizations/constants/organization.constants";

export interface IPORRole extends mongoose.Document {
    roleKey: string;
    displayName: string;
    normalizedDisplayName: string;
    description?: string;
    aliases: string[];
    appliesToCategories: (typeof ORGANIZATION_CATEGORY_ENUM)[number][];
    defaultSortOrder: number;
    isSystem: boolean;
    isArchived: boolean;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const porRoleSchema = new Schema<IPORRole>(
    {
        roleKey: { type: String, required: true, trim: true, lowercase: true },
        displayName: { type: String, required: true, trim: true },
        normalizedDisplayName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        description: { type: String, trim: true },
        aliases: { type: [String], default: [] },
        appliesToCategories: {
            type: [String],
            enum: ORGANIZATION_CATEGORY_ENUM,
            default: [],
        },
        defaultSortOrder: { type: Number, default: 0 },
        isSystem: { type: Boolean, default: false },
        isArchived: { type: Boolean, default: false },
        createdBy: { type: Schema.Types.ObjectId, ref: "Student" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    },
    { timestamps: true }
);

porRoleSchema.pre("validate", function () {
    if (this.displayName) {
        this.normalizedDisplayName = this.displayName.trim().toLowerCase();
    }

    if (this.aliases?.length) {
        const normalizedAliases = this.aliases
            .map((alias) => alias.trim().toLowerCase())
            .filter(Boolean);

        this.aliases = [...new Set(normalizedAliases)];
    }
});

porRoleSchema.index({ roleKey: 1 }, { unique: true });
porRoleSchema.index({ normalizedDisplayName: 1 }, { unique: true });
porRoleSchema.index({ appliesToCategories: 1, isArchived: 1, _id: 1 });

const PORRole = mongoose.model<IPORRole>("PORRole", porRoleSchema);

export default PORRole;

// TODO: Summary of Changes to Make
// Add category-based default capabilities hook in Organization
// Fix normalizedDisplayName unique index scope in PORRole
// Add consistency validation when both date formats provided in Tenure
// Add service-level check for parentRoleId belonging to same tenure in TenureRoleConfig
// Add cross-field validation for assignmentStartMonth/Year pair in PORAssignment
// Use MongoDB transactions in the org approval service
