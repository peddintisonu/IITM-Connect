import { z } from "zod";

export const hostelTypeEnum = ["boys", "girls"] as const;

export const createHostelSchema = z.object({
    name: z.string().min(1, "Hostel name is required").trim(),
    code: z.string().min(1, "Hostel code is required").trim(),
    type: z.enum(hostelTypeEnum),
});

export type CreateHostelInput = z.infer<typeof createHostelSchema>;

export const updateHostelSchema = z
    .object({
        name: z.string().min(1, "Hostel name is required").trim().optional(),
        code: z.string().min(1, "Hostel code is required").trim().optional(),
        type: z.enum(hostelTypeEnum).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required to update",
    });

export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;

export const createDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required").trim(),
    code: z.string().min(1, "Department code is required").trim(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = z
    .object({
        name: z
            .string()
            .min(1, "Department name is required")
            .trim()
            .optional(),
        code: z
            .string()
            .min(1, "Department code is required")
            .trim()
            .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required to update",
    });

export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;

export const createCourseSchema = z.object({
    name: z.string().min(1, "Course name is required").trim(),
    code: z.string().min(1, "Course code is required").trim(),
    abbreviation: z.string().min(1, "Course abbreviation is required").trim(),
    duration: z.number().int().positive().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z
    .object({
        name: z.string().min(1, "Course name is required").trim().optional(),
        code: z.string().min(1, "Course code is required").trim().optional(),
        abbreviation: z
            .string()
            .min(1, "Course abbreviation is required")
            .trim()
            .optional(),
        duration: z.number().int().positive().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required to update",
    });

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
