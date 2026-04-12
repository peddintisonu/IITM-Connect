// server/src/validations/student.validation.ts

import { z } from "zod";

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
    accountType: z.enum(["public", "private"]).default("public"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
