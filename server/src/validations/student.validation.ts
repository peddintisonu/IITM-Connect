// server/src/validations/student.validation.ts

import { z } from "zod";
import {
    ACCOUNT_TYPE_ENUM,
    ALLOWED_HIDDEN_FIELDS,
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
