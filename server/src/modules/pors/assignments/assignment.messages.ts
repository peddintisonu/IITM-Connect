export const porAssignmentErrorMessages = {
    assignmentNotFound: "POR assignment not found",
    tenureRoleConfigNotFound: "Tenure role config not found",
    studentNotFound: "Student not found",
    studentAlreadyAssigned: "Student is already assigned to this role",
    roleAtCapacity: "This role has reached its holder limit",
    roleConfigInactive: "Tenure role config is not active",
    assignmentPeriodOutsideTenure:
        "Assignment period must be within the selected tenure period",
    tenureNotFound: "Tenure not found for this role configuration",
} as const;

export const porAssignmentRouteMessages = {
    assignmentCreated: "POR assignment created",
} as const;
