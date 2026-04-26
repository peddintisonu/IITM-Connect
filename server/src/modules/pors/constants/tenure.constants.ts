export const TENURE_STATUS = {
    PLANNED: "planned",
    ACTIVE: "active",
    GRACE: "grace",
    CLOSED: "closed",
    ARCHIVED: "archived",
} as const;

export type TenureStatus = (typeof TENURE_STATUS)[keyof typeof TENURE_STATUS];

export const TENURE_STATUS_ENUM = [
    TENURE_STATUS.PLANNED,
    TENURE_STATUS.ACTIVE,
    TENURE_STATUS.GRACE,
    TENURE_STATUS.CLOSED,
    TENURE_STATUS.ARCHIVED,
] as const;

export const TENURE_HANDOVER_STATUS = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    ARCHIVED: "archived",
} as const;

export type TenureHandoverStatus =
    (typeof TENURE_HANDOVER_STATUS)[keyof typeof TENURE_HANDOVER_STATUS];

export const TENURE_HANDOVER_STATUS_ENUM = [
    TENURE_HANDOVER_STATUS.PENDING,
    TENURE_HANDOVER_STATUS.IN_PROGRESS,
    TENURE_HANDOVER_STATUS.COMPLETED,
    TENURE_HANDOVER_STATUS.ARCHIVED,
] as const;
