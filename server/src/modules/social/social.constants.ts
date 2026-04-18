// server/src/modules/social/social.constants.ts

export const FOLLOW_STATUS = {
    PENDING: "pending",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
} as const;

export type FollowStatus = (typeof FOLLOW_STATUS)[keyof typeof FOLLOW_STATUS];

export const FOLLOW_TYPE = {
    STUDENT: "Student",
    ORG: "Org",
} as const;

export type FollowType = (typeof FOLLOW_TYPE)[keyof typeof FOLLOW_TYPE];

export const FOLLOW_STATUS_ENUM = [
    FOLLOW_STATUS.PENDING,
    FOLLOW_STATUS.ACCEPTED,
    FOLLOW_STATUS.REJECTED,
] as const;

export const FOLLOW_TYPE_ENUM = [FOLLOW_TYPE.STUDENT, FOLLOW_TYPE.ORG] as const;
