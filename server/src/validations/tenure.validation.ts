import { z } from "zod";

import { TENURE_STATUS_ENUM } from "../modules/pors/constants/tenure.constants";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
const MONTH_SCHEMA = z.number().int().min(1).max(12);
const YEAR_SCHEMA = z.number().int().min(1900).max(2500);

const tenureMonthYearSchema = z
    .object({
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
                "endMonth/endYear must be after or equal to startMonth/startYear",
            path: ["endMonth"],
        }
    );

export const createTenureSchema = z
    .object({
        orgId: z
            .string()
            .regex(OBJECT_ID_REGEX, "orgId must be a valid ObjectId"),
        name: z.string().min(2).max(120).trim(),
        cycleYear: z.number().int().min(1900).max(2500).optional(),
        status: z.enum(TENURE_STATUS_ENUM).optional(),
    })
    .merge(tenureMonthYearSchema);

export type CreateTenureInput = z.infer<typeof createTenureSchema>;

export const updateTenureSchema = z
    .object({
        name: z.string().min(2).max(120).trim().optional(),
        cycleYear: z.number().int().min(1900).max(2500).optional(),
        startMonth: MONTH_SCHEMA.optional(),
        startYear: YEAR_SCHEMA.optional(),
        endMonth: MONTH_SCHEMA.optional(),
        endYear: YEAR_SCHEMA.optional(),
        status: z.enum(TENURE_STATUS_ENUM).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
        message: "At least one field is required",
    })
    .refine(
        (value) => {
            const hasAnyMonthYear =
                value.startMonth !== undefined ||
                value.startYear !== undefined ||
                value.endMonth !== undefined ||
                value.endYear !== undefined;

            if (!hasAnyMonthYear) return true;

            return (
                value.startMonth !== undefined &&
                value.startYear !== undefined &&
                value.endMonth !== undefined &&
                value.endYear !== undefined
            );
        },
        {
            message:
                "endMonth/endYear must be after or equal to startMonth/startYear",
            path: ["endMonth"],
        }
    )
    .refine(
        (value) => {
            if (
                value.startMonth === undefined ||
                value.startYear === undefined ||
                value.endMonth === undefined ||
                value.endYear === undefined
            ) {
                return true;
            }

            return (
                value.endYear > value.startYear ||
                (value.endYear === value.startYear &&
                    value.endMonth >= value.startMonth)
            );
        },
        {
            message:
                "endMonth/endYear must be after or equal to startMonth/startYear",
            path: ["endMonth"],
        }
    );

export type UpdateTenureInput = z.infer<typeof updateTenureSchema>;

export const listTenuresQuerySchema = z.object({
    orgId: z
        .string()
        .regex(OBJECT_ID_REGEX, "orgId must be a valid ObjectId")
        .optional(),
    status: z.enum(TENURE_STATUS_ENUM).optional(),
    cycleYear: z.coerce.number().int().min(1900).max(2500).optional(),
    activeOnDate: z.coerce.date().optional(),
});

export type ListTenuresQueryInput = z.infer<typeof listTenuresQuerySchema>;

export const updateTenureStatusSchema = z.object({
    status: z.enum(TENURE_STATUS_ENUM),
});

export type UpdateTenureStatusInput = z.infer<typeof updateTenureStatusSchema>;

export const assignmentMonthYearPeriodSchema = z
    .object({
        assignmentStartMonth: MONTH_SCHEMA.optional(),
        assignmentStartYear: YEAR_SCHEMA.optional(),
        assignmentEndMonth: MONTH_SCHEMA.optional(),
        assignmentEndYear: YEAR_SCHEMA.optional(),
    })
    .refine(
        (value) => {
            const hasAny =
                value.assignmentStartMonth !== undefined ||
                value.assignmentStartYear !== undefined ||
                value.assignmentEndMonth !== undefined ||
                value.assignmentEndYear !== undefined;

            if (!hasAny) return true;

            return (
                value.assignmentStartMonth !== undefined &&
                value.assignmentStartYear !== undefined &&
                value.assignmentEndMonth !== undefined &&
                value.assignmentEndYear !== undefined
            );
        },
        {
            message:
                "assignmentStartMonth, assignmentStartYear, assignmentEndMonth, and assignmentEndYear are required together",
            path: ["assignmentStartMonth"],
        }
    )
    .refine(
        (value) => {
            if (
                value.assignmentStartMonth === undefined ||
                value.assignmentStartYear === undefined ||
                value.assignmentEndMonth === undefined ||
                value.assignmentEndYear === undefined
            ) {
                return true;
            }

            return (
                value.assignmentEndYear > value.assignmentStartYear ||
                (value.assignmentEndYear === value.assignmentStartYear &&
                    value.assignmentEndMonth >= value.assignmentStartMonth)
            );
        },
        {
            message:
                "assignmentEndMonth/assignmentEndYear must be after or equal to assignmentStartMonth/assignmentStartYear",
            path: ["assignmentEndMonth"],
        }
    );

export type AssignmentMonthYearPeriodInput = z.infer<
    typeof assignmentMonthYearPeriodSchema
>;
