export const organizationErrorMessages = {
    organizationNotFound: "Organization not found",
    organizationAlreadyExists: "Organization already exists",
    organizationRequestAlreadyExists:
        "Organization request with this slug already exists",
    organizationRequestNotFound: "Organization request not found",
    organizationRequestNotPending: "Organization request is not pending",
    organizationRequestParentRequired:
        "Parent organization is required for parent POR approval",
    roleNotFound: "One or more selected POR roles are invalid",
    roleNotApplicableForCategory:
        "One or more selected POR roles are not applicable for this organization category",
    invalidOrganizationSlug: "Invalid organization slug",
    invalidParentOrganization: "Invalid parent organization",
    organizationHasChildren: "Organization has child organizations",
    organizationHasDependencies: "Organization has dependent records",
} as const;

export const organizationRouteMessages = {
    organizationCreated: "Organization created",
    organizationRequestCreated: "Organization request created",
    organizationRequestApproved: "Organization request approved",
    organizationRequestRejected: "Organization request rejected",
    organizationUpdated: "Organization updated",
    organizationFetched: "Organization fetched",
    organizationsFetched: "Organizations fetched",
    organizationArchived: "Organization archived",
} as const;
