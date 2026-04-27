export const tenureErrorMessages = {
    tenureNotFound: "Tenure not found",
    organizationNotFound: "Organization not found",
    tenureWindowOverlaps:
        "Tenure date range overlaps with another tenure for this organization",
    invalidDateWindow: "endDate must be after startDate",
    invalidMonthYearWindow:
        "Tenure end month/year must be the same as or after start month/year",
    invalidStatusTransition: "Invalid tenure status transition",
    statusUnchanged: "Tenure status is already set to the requested value",
} as const;

export const tenureRouteMessages = {
    tenureCreated: "Tenure created",
    tenureUpdated: "Tenure updated",
    tenureStatusUpdated: "Tenure status updated",
    tenureFetched: "Tenure fetched",
    tenuresFetched: "Tenures fetched",
} as const;

export const tenureConfigErrorMessages = {
    configNotFound: "Tenure role config not found",
    roleNotFound: "POR role not found or archived",
    archivedTenureLocked: "Archived tenure cannot be edited",
    roleAlreadyConfigured: "Role is already configured for this tenure",
    invalidEffectiveWindow: "effectiveTo must be after effectiveFrom",
    effectiveDateOutsideTenure:
        "Effective dates must stay within tenure start and end dates",
    configHasActiveAssignments:
        "Config has active assignments and cannot be deactivated or deleted",
    maxHoldersTooLow:
        "maxHolders cannot be lower than current active assignment count",
    configStatusUnchanged:
        "Config status is already set to the requested value",
    targetAlreadyHasConfigs:
        "Target tenure already has role configs; enable overwriteExisting to replace",
    crossOrgCloneNotAllowed:
        "Cannot clone role configs across different organizations",
} as const;

export const tenureConfigRouteMessages = {
    configCreated: "Tenure role config created",
    configsUpserted: "Tenure role configs upserted",
    configsFetched: "Tenure role configs fetched",
    configUpdated: "Tenure role config updated",
    configStatusUpdated: "Tenure role config status updated",
    configDeleted: "Tenure role config deleted",
    configsCloned: "Tenure role configs cloned",
} as const;
