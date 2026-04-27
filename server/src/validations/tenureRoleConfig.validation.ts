// server/src/validations/tenureRoleConfig.validation.ts

import { z } from "zod";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const permissionsSchema = z
    .object({
        canPost: z.boolean(),
        canCreateEvents: z.boolean(),
        canEditOrgProfile: z.boolean(),
        canManageRoles: z.boolean(),
        canManageTenure: z.boolean(),
        canApproveMembers: z.boolean(),
        canVerifyPORBelow: z.boolean(),
    })
    .optional();

const baseConfigSchema = z.object({
    isActiveInTenure: z.boolean().optional(),
    level: z.number().int().min(0).max(10).optional(),
    sortOrder: z.number().int().min(0).max(999).optional(),
    maxHolders: z.number().int().min(1).max(100).optional(),
    canBeVacant: z.boolean().optional(),
    permissions: permissionsSchema,
    effectiveFrom: z.coerce.date().optional(),
    effectiveTo: z.coerce.date().optional(),
    changeReason: z.string().trim().max(300).optional(),
});

const validateEffectiveWindow = <
    T extends { effectiveFrom?: Date; effectiveTo?: Date },
>(
    value: T
) => {
    if (!value.effectiveFrom || !value.effectiveTo) return true;
    return value.effectiveTo > value.effectiveFrom;
};

export const createTenureRoleConfigSchema = z
    .object({
        roleId: z
            .string()
            .regex(OBJECT_ID_REGEX, "roleId must be a valid ObjectId"),
    })
    .merge(baseConfigSchema)
    .refine(validateEffectiveWindow, {
        message: "effectiveTo must be after effectiveFrom",
        path: ["effectiveTo"],
    });

export type CreateTenureRoleConfigInput = z.infer<
    typeof createTenureRoleConfigSchema
>;

export const bulkUpsertTenureRoleConfigsSchema = z.object({
    configs: z
        .array(
            z
                .object({
                    roleId: z
                        .string()
                        .regex(
                            OBJECT_ID_REGEX,
                            "roleId must be a valid ObjectId"
                        ),
                })
                .merge(baseConfigSchema)
                .refine(validateEffectiveWindow, {
                    message: "effectiveTo must be after effectiveFrom",
                    path: ["effectiveTo"],
                })
        )
        .min(1),
    overwriteExisting: z.boolean().optional().default(true),
});

export type BulkUpsertTenureRoleConfigsInput = z.infer<
    typeof bulkUpsertTenureRoleConfigsSchema
>;

export const listTenureRoleConfigsQuerySchema = z.object({
    isActiveInTenure: z.coerce.boolean().optional(),
});

export type ListTenureRoleConfigsQueryInput = z.infer<
    typeof listTenureRoleConfigsQuerySchema
>;

export const updateTenureRoleConfigSchema = baseConfigSchema
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one field is required",
    })
    .refine(validateEffectiveWindow, {
        message: "effectiveTo must be after effectiveFrom",
        path: ["effectiveTo"],
    });

export type UpdateTenureRoleConfigInput = z.infer<
    typeof updateTenureRoleConfigSchema
>;

export const updateTenureRoleConfigStatusSchema = z.object({
    isActiveInTenure: z.boolean(),
    changeReason: z.string().trim().max(300).optional(),
});

export type UpdateTenureRoleConfigStatusInput = z.infer<
    typeof updateTenureRoleConfigStatusSchema
>;

export const cloneTenureRoleConfigsSchema = z.object({
    overwriteExisting: z.boolean().optional().default(false),
});

export type CloneTenureRoleConfigsInput = z.infer<
    typeof cloneTenureRoleConfigsSchema
>;
