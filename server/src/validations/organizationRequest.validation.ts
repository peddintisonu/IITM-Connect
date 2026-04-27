import { z } from "zod";

import { ORGANIZATION_CATEGORY_ENUM } from "../modules/organizations/constants/organization.constants";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const CURRENT_YEAR = new Date().getFullYear();
const MONTH_SCHEMA = z.number().int().min(1).max(12);
const YEAR_SCHEMA = z.number().int().min(1900).max(2500);

const organizationLinkSchema = z.object({
    label: z.string().min(1).max(50).trim(),
    url: z.string().url(),
});

// server/src/validations/organizationRequest.validation.ts

const organizationInputSchema = z.object({
    name: z.string().min(2).max(120).trim(),
    slug: z
        .string()
        .min(3)
        .max(80)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
        )
        .trim()
        .optional(), // Made optional to support auto-generation
    category: z.enum(ORGANIZATION_CATEGORY_ENUM),
    establishedYear: z.number().int().min(1900).max(CURRENT_YEAR).optional(),
    parentOrgId: z
        .string()
        .regex(OBJECT_ID_REGEX, "parentOrgId must be a valid ObjectId")
        .optional(),
    isPermanent: z.boolean().default(false),
});

const tenureInputSchema = z
    .object({
        name: z.string().min(2).max(120).trim(),
        cycleYear: z

            .number()
            .int()
            .min(1900)
            .max(CURRENT_YEAR + 1)
            .optional(),
        startMonth: MONTH_SCHEMA,
        startYear: YEAR_SCHEMA,
        endMonth: MONTH_SCHEMA,
        endYear: YEAR_SCHEMA,
    })
    .refine(
        (value) =>
            value.endYear > value.startYear ||
            (value.endYear === value.startYear &&
                value.endMonth >= value.startMonth),
        {
            message:
                "firstTenure.endMonth/endYear must be after or equal to firstTenure.startMonth/startYear",
            path: ["endMonth"],
        }
    );

const requestRoleConfigInputSchema = z.object({
    roleId: z
        .string()
        .regex(OBJECT_ID_REGEX, "roleId must be a valid ObjectId"),
    level: z.number().int().min(0).default(0),
    sortOrder: z.number().int().min(0).default(0),
    maxHolders: z.number().int().min(1).default(1),
    canBeVacant: z.boolean().default(true),
});

export const createOrganizationRequestSchema = z
    .object({
        organization: organizationInputSchema,
        firstTenure: tenureInputSchema,
        firstTenureRoleConfigs: z
            .array(requestRoleConfigInputSchema)
            .max(100)
            .default([]),
        creatorRequestedRoleId: z
            .string()
            .regex(
                OBJECT_ID_REGEX,
                "creatorRequestedRoleId must be a valid ObjectId"
            ),

        requiresParentTopPorApproval: z.boolean().default(false),
    })
    .refine(
        (value) =>
            !value.requiresParentTopPorApproval ||
            !!value.organization.parentOrgId,
        {
            message:
                "organization.parentOrgId is required when requiresParentTopPorApproval is true",
            path: ["organization", "parentOrgId"],
        }
    );

export type CreateOrganizationRequestInput = z.infer<
    typeof createOrganizationRequestSchema
>;

export const rejectOrganizationRequestSchema = z.object({
    remarks: z.string().min(3).max(500).trim(),
});

export type RejectOrganizationRequestInput = z.infer<
    typeof rejectOrganizationRequestSchema
>;
