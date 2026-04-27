// server/src/modules/pors/constants/permissions.constants.ts

export interface IRolePermissions {
    canPost: boolean;
    canCreateEvents: boolean;
    canEditOrgProfile: boolean;
    canManageRoles: boolean;
    canManageTenure: boolean;
    canApproveMembers: boolean;
    canVerifyPORBelow: boolean;
}

export const DEFAULT_PERMISSIONS_BY_LEVEL: Record<number, IRolePermissions> = {
    1: {
        canPost: true,
        canCreateEvents: true,
        canEditOrgProfile: true,
        canManageRoles: true,
        canManageTenure: true,
        canApproveMembers: true,
        canVerifyPORBelow: true,
    },
    2: {
        canPost: true,
        canCreateEvents: true,
        canEditOrgProfile: false,
        canManageRoles: false,
        canManageTenure: false,
        canApproveMembers: true,
        canVerifyPORBelow: true,
    },
};

export const DEFAULT_PERMISSIONS_FALLBACK: IRolePermissions = {
    canPost: false,
    canCreateEvents: false,
    canEditOrgProfile: false,
    canManageRoles: false,
    canManageTenure: false,
    canApproveMembers: false,
    canVerifyPORBelow: false,
};

export const getDefaultPermissions = (level: number): IRolePermissions => {
    return DEFAULT_PERMISSIONS_BY_LEVEL[level] ?? DEFAULT_PERMISSIONS_FALLBACK;
};
