export const ORGANIZATION_CATEGORY = {
    CLUB: "club",
    TEAM: "team",
    FEST: "fest",
    HOSTEL: "hostel",
    DEPARTMENT: "department",
    COMMITTEE: "committee",
    INSTITUTE_BODY: "institute_body",
} as const;

export type OrganizationCategory =
    (typeof ORGANIZATION_CATEGORY)[keyof typeof ORGANIZATION_CATEGORY];

export const ORGANIZATION_CATEGORY_ENUM = [
    ORGANIZATION_CATEGORY.CLUB,
    ORGANIZATION_CATEGORY.TEAM,
    ORGANIZATION_CATEGORY.FEST,
    ORGANIZATION_CATEGORY.HOSTEL,
    ORGANIZATION_CATEGORY.DEPARTMENT,
    ORGANIZATION_CATEGORY.COMMITTEE,
    ORGANIZATION_CATEGORY.INSTITUTE_BODY,
] as const;

export const ORGANIZATION_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    ARCHIVED: "archived",
} as const;

export type OrganizationStatus =
    (typeof ORGANIZATION_STATUS)[keyof typeof ORGANIZATION_STATUS];

export const ORGANIZATION_STATUS_ENUM = [
    ORGANIZATION_STATUS.ACTIVE,
    ORGANIZATION_STATUS.INACTIVE,
    ORGANIZATION_STATUS.ARCHIVED,
] as const;

export const ORGANIZATION_CAPABILITIES = {
    MEMBERS: "supportsMembers",
    ROLES: "supportsRoles",
    TENURES: "supportsTenures",
    EVENTS: "supportsEvents",
    POSTS: "supportsPosts",
    RECRUITMENT: "supportsRecruitment",
    HIERARCHY: "supportsHierarchy",
} as const;

export type OrganizationCapability =
    (typeof ORGANIZATION_CAPABILITIES)[keyof typeof ORGANIZATION_CAPABILITIES];

export const DEFAULT_ORGANIZATION_CAPABILITIES = {
    supportsMembers: true,
    supportsRoles: true,
    supportsTenures: true,
    supportsEvents: true,
    supportsPosts: true,
    supportsRecruitment: false,
    supportsHierarchy: true,
} as const;
