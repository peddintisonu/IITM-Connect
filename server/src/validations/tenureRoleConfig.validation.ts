import { z } from "zod";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const baseConfigSchema = z.object({
    isActiveInTenure: z.boolean().optional(),
    parentRoleId: z
        .union([
            z.string().regex(OBJECT_ID_REGEX, "parentRoleId must be a valid ObjectId"),
            z.literal(""),
            z.null(),
        ])
        .optional()
        .transform((value) => {
            if (value === "" || value === null) return null;
            return value;
        }),
    level: z.number().int().min(0).max(10).optional(),
    sortOrder: z.number().int().min(0).max(999).optional(),
    maxHolders: z.number().int().min(1).max(100).optional(),
    canBeVacant: z.boolean().optional(),
    effectiveFrom: z.coerce.date().optional(),
    effectiveTo: z.coerce.date().optional(),
    changeReason: z.string().trim().max(300).optional(),
});

const validateEffectiveWindow = <T extends { effectiveFrom?: Date; effectiveTo?: Date }>(
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
                        .regex(OBJECT_ID_REGEX, "roleId must be a valid ObjectId"),
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
