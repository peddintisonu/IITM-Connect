import mongoose from "mongoose";

import { ORGANIZATION_REQUEST_STATUS } from "../constants/organizationRequest.constants";
import type { IOrganizationRequest } from "../orgReq/orgReq.model";

export const getPendingApprovalStepIndex = (organizationRequest: {
    approvalSteps: { status: string }[];
}) =>
    organizationRequest.approvalSteps.findIndex(
        (step) => step.status === ORGANIZATION_REQUEST_STATUS.PENDING
    );

export const ensureCreatorRequestedRoleConfig = (
    roleConfigs: {
        roleId: mongoose.Types.ObjectId;
        parentRoleId?: mongoose.Types.ObjectId;
        level: number;
        sortOrder: number;
        maxHolders: number;
        canBeVacant: boolean;
    }[],
    creatorRequestedRoleId: mongoose.Types.ObjectId
) => {
    const hasCreatorRequestedRole = roleConfigs.some((config) =>
        config.roleId.equals(creatorRequestedRoleId)
    );

    if (hasCreatorRequestedRole) {
        return roleConfigs;
    }

    return [
        ...roleConfigs,
        {
            roleId: creatorRequestedRoleId,
            level: 0,
            sortOrder: roleConfigs.length,
            maxHolders: 1,
            canBeVacant: false,
        },
    ];
};

export const isRoleApplicableForCategory = (
    appliesToCategories: string[],
    category: string
) => {
    if (appliesToCategories.length === 0) return true;
    return appliesToCategories.includes(category);
};

export const buildApprovedOrganizationPayload = (
    organizationRequest: IOrganizationRequest,
    requestedBy: mongoose.Types.ObjectId,
    approvedBy: mongoose.Types.ObjectId
) => ({
    ...organizationRequest.organization,
    parentOrgId: organizationRequest.organization.parentOrgId ?? undefined,
    status: "active" as const,
    createdBy: requestedBy,
    updatedBy: approvedBy,
});

export const buildApprovedTenurePayload = (
    organizationRequest: IOrganizationRequest,
    orgId: mongoose.Types.ObjectId,
    requestedBy: mongoose.Types.ObjectId,
    approvedBy: mongoose.Types.ObjectId
) => ({
    orgId,
    name: organizationRequest.firstTenure.name,
    cycleYear: organizationRequest.firstTenure.cycleYear,
    startDate: organizationRequest.firstTenure.startDate,
    endDate: organizationRequest.firstTenure.endDate,
    createdBy: requestedBy,
    updatedBy: approvedBy,
});

export const buildApprovedTenureRoleConfigPayloads = (
    organizationRequest: IOrganizationRequest,
    orgId: mongoose.Types.ObjectId,
    tenureId: mongoose.Types.ObjectId,
    approvedBy: mongoose.Types.ObjectId
) => {
    const roleConfigs = ensureCreatorRequestedRoleConfig(
        organizationRequest.firstTenureRoleConfigs.map((config) => ({
            roleId: config.roleId,
            parentRoleId: config.parentRoleId,
            level: config.level,
            sortOrder: config.sortOrder,
            maxHolders: config.maxHolders,
            canBeVacant: config.canBeVacant,
        })),
        organizationRequest.creatorRequestedRoleId
    );

    return roleConfigs.map((config) => ({
        tenureId,
        orgId,
        roleId: config.roleId,
        parentRoleId: config.parentRoleId ?? null,
        level: config.level,
        sortOrder: config.sortOrder,
        maxHolders: config.maxHolders,
        canBeVacant: config.canBeVacant,
        createdBy: organizationRequest.requestedBy,
        updatedBy: approvedBy,
    }));
};

export const buildInitialCreatorPorAssignmentPayload = (
    organizationRequest: IOrganizationRequest,
    orgId: mongoose.Types.ObjectId,
    tenureId: mongoose.Types.ObjectId,
    tenureRoleConfigId: mongoose.Types.ObjectId,
    approvedBy: mongoose.Types.ObjectId
) => ({
    orgId,
    tenureId,
    tenureRoleConfigId,
    roleId: organizationRequest.creatorRequestedRoleId,
    studentId: organizationRequest.requestedBy,
    assignedBy: approvedBy,
    assignedAt: new Date(),
    isActive: true,
    notes: "Auto-assigned when the organization request was approved",
});

export const buildApprovedOrganizationRequestMetadata = (
    organizationRequest: IOrganizationRequest,
    approvedBy: mongoose.Types.ObjectId,
    approvedOrganizationId: mongoose.Types.ObjectId,
    approvedTenureId: mongoose.Types.ObjectId
) => ({
    status: ORGANIZATION_REQUEST_STATUS.APPROVED,
    approvedOrganizationId,
    approvedTenureId,
    reviewedBy: approvedBy,
    reviewedAt: new Date(),
    reviewRemarks: "Organization approved and materialized",
});

export const buildRejectedOrganizationRequestMetadata = (
    rejectedBy: mongoose.Types.ObjectId,
    remarks: string
) => ({
    status: ORGANIZATION_REQUEST_STATUS.REJECTED,
    reviewedBy: rejectedBy,
    reviewedAt: new Date(),
    reviewRemarks: remarks,
});
