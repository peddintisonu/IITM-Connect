// server/src/shared/constants/validation.constants.ts

export const VALIDATION_MESSAGES = {
    UNAUTHORIZED: "Unauthorized",
    INVALID_REQUEST: "Invalid request",
    FIELD_REQUIRED: (field: string) => `${field} is required`,
    INVALID_FIELD: (field: string) => `Invalid ${field}`,
} as const;

export const VALIDATION_LIMITS = {
    USERNAME_MIN: 3,
    USERNAME_MAX: 20,
    DISPLAY_NAME_MIN: 2,
    DISPLAY_NAME_MAX: 50,
    BIO_MAX: 200,
    LINKS_MAX: 5,
    INTERESTS_MAX: 10,
    SKILLS_MAX: 15,
    LINK_LABEL_MAX: 30,
    SKILL_MAX_LENGTH: 30,
    INTEREST_MAX_LENGTH: 30,
} as const;
