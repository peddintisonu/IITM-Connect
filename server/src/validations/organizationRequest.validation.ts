import { z } from "zod";

import { ORGANIZATION_CATEGORY_ENUM } from "../modules/organizations/constants/organization.constants";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const CURRENT_YEAR = new Date().getFullYear();

const organizationLinkSchema = z.object({
    label: z.string().min(1).max(50).trim(),
    url: z.string().url(),
});

const organizationInputSchema = z.object({
    name: z.string().min(2).max(120).trim(),
    shortName: z.string().min(2).max(50).trim().optional(),
    acronym: z.string().min(2).max(20).trim().optional(),
    slug: z
        .string()
        .min(3)
        .max(80)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            "Slug can only contain lowercase letters, numbers, and hyphens"
        )
        .trim(),
    category: z.enum(ORGANIZATION_CATEGORY_ENUM),
    description: z.string().max(2000).trim().optional(),
    avatar: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    avatarPublicId: z.string().min(1).trim().optional(),
    coverImagePublicId: z.string().min(1).trim().optional(),
    links: z.array(organizationLinkSchema).max(10).default([]),
    contactEmail: z.string().email().optional(),
    website: z.string().url().optional(),
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
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    })
    .refine((value) => value.endDate > value.startDate, {
        message: "firstTenure.endDate must be after firstTenure.startDate",
        path: ["endDate"],
    });

const requestRoleConfigInputSchema = z.object({
    roleId: z
        .string()
        .regex(OBJECT_ID_REGEX, "roleId must be a valid ObjectId"),
    parentRoleId: z
        .string()
        .regex(OBJECT_ID_REGEX, "parentRoleId must be a valid ObjectId")
        .optional(),
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
