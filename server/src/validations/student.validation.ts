// server/src/validations/student.validation.ts

import { z } from "zod";
import {
    ACCOUNT_TYPE_ENUM,
    ALLOWED_HIDDEN_FIELDS,
    STUDENT_SEARCH_LIMITS,
    STUDENT_SEARCH_QUERY,
} from "../modules/students/student.constants";

export const onboardingSchema = z.object({
    displayName: z
        .string()
        .min(2, "Display name must be at least 2 characters")
        .trim(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(
            /^[a-z0-9_]+$/,
            "Username can only contain lowercase letters, numbers and underscores"
        )
        .trim(),
    currentHostelId: z.string().optional(),
    currentRoomNo: z.number().optional(),
    accountType: z.enum(ACCOUNT_TYPE_ENUM).default("public"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const updateProfileSchema = z.object({
    displayName: z.string().min(2).max(50).optional(),
    username: z
        .string()
        .min(3)
        .max(30)
        .regex(
            /^[a-z0-9_]+$/,
            "Username can only have lowercase letters, numbers, underscores"
        )
        .optional(),
    bio: z.string().max(200).optional(),
    links: z
        .array(
            z.object({
                label: z.string().min(1).max(30),
                url: z.string().url(),
            })
        )
        .max(5)
        .optional(),
    interests: z.array(z.string().min(1).max(30)).max(10).optional(),
    skills: z.array(z.string().min(1).max(30)).max(15).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateHostelSchema = z.object({
    currentHostelId: z.string().min(1, "Hostel is required"),
    currentRoomNo: z.number().min(1, "Room number is required"),
});

export type UpdateHostelInput = z.infer<typeof updateHostelSchema>;

export const updatePrivacySchema = z
    .object({
        accountType: z.enum(ACCOUNT_TYPE_ENUM).optional(),
        hiddenFields: z.array(z.enum(ALLOWED_HIDDEN_FIELDS)).optional(),
    })
    .refine(
        (data) =>
            data.accountType !== undefined || data.hiddenFields !== undefined,
        {
            message:
                "At least one of accountType or hiddenFields must be provided",
        }
    );

export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;

export const usernameAvailabilitySchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .regex(
            /^[a-z0-9_]+$/,
            "Username can only have lowercase letters, numbers, underscores"
        )
        .trim(),
});

export type UsernameAvailabilityInput = z.infer<
    typeof usernameAvailabilitySchema
>;

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const studentCardsSchema = z.object({
    userIds: z
        .array(
            z
                .string()
                .regex(OBJECT_ID_REGEX, "Each userId must be a valid ObjectId")
        )
        .min(1, "At least one userId is required")
        .max(100, "Maximum 100 userIds are allowed"),
});

export type StudentCardsInput = z.infer<typeof studentCardsSchema>;

export const studentSearchSchema = z.object({
    q: z
        .string()
        .trim()
        .min(STUDENT_SEARCH_QUERY.minLength, "Search query is required")
        .max(
            STUDENT_SEARCH_QUERY.maxLength,
            `Search query must be at most ${STUDENT_SEARCH_QUERY.maxLength} characters`
        ),
    limit: z.coerce
        .number()
        .int()
        .min(STUDENT_SEARCH_LIMITS.min)
        .max(STUDENT_SEARCH_LIMITS.max)
        .default(STUDENT_SEARCH_LIMITS.default),
    cursor: z.string().trim().optional(),
});

export type StudentSearchInput = z.infer<typeof studentSearchSchema>;
