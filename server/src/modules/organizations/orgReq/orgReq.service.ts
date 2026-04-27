import mongoose from "mongoose";

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiError, toObjectId } from "../../../shared/utils";
import {
    CreateOrganizationRequestInput,
    RejectOrganizationRequestInput,
} from "../../../validations/organizationRequest.validation";
import { PORAssignment, Tenure, TenureRoleConfig } from "../../pors";
import PORRole from "../../pors/roles/porRole.model";
import { buildDateRangeFromMonthYear } from "../../pors/utils";
import { ORGANIZATION_REQUEST_STATUS } from "../constants/organizationRequest.constants";
import { organizationErrorMessages } from "../organization.messages";
import OrganizationModel from "../organization.model";
import {
    buildApprovedOrganizationPayload,
    buildApprovedOrganizationRequestMetadata,
    buildApprovedTenurePayload,
    buildApprovedTenureRoleConfigPayloads,
    buildInitialCreatorPorAssignmentPayload,
    buildRejectedOrganizationRequestMetadata,
    generateSlug,
    getPendingApprovalStepIndex,
    isRoleApplicableForCategory,
} from "../utils";
import OrganizationRequest from "./orgReq.model";

export const createOrganizationRequest = async (
    requestedBy: string,
    data: CreateOrganizationRequestInput
) => {
    const {
        organization,
        firstTenure,
        firstTenureRoleConfigs,
        creatorRequestedRoleId,
    } = data;

    // 1. Logic for Slug: Use provided slug or generate from name
    const finalSlug = organization.slug || generateSlug(organization.name);

    // 2. Check for existing organization with this slug
    const existingOrganization = await OrganizationModel.findOne({
        slug: finalSlug,
    })
        .select("_id")
        .lean();

    if (existingOrganization) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            "Organization slug already taken"
        );
    }

    const existingRequest = await OrganizationRequest.findOne({
        "organization.slug": finalSlug,
        status: {
            $in: [
                ORGANIZATION_REQUEST_STATUS.PENDING,
                ORGANIZATION_REQUEST_STATUS.APPROVED,
            ],
        },
    })
        .select("_id")
        .lean();

    if (existingRequest) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            organizationErrorMessages.organizationRequestAlreadyExists
        );
    }

    if (organization.parentOrgId) {
        const parentOrganization = await OrganizationModel.findById(
            organization.parentOrgId
        )
            .select("_id")
            .lean();

        if (!parentOrganization) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                organizationErrorMessages.invalidParentOrganization
            );
        }
    }

    if (data.requiresParentTopPorApproval && !organization.parentOrgId) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            organizationErrorMessages.organizationRequestParentRequired
        );
    }

    const firstTenureDates = buildDateRangeFromMonthYear({
        startMonth: firstTenure.startMonth,
        startYear: firstTenure.startYear,
        endMonth: firstTenure.endMonth,
        endYear: firstTenure.endYear,
    });

    const roleIds = new Set<string>([creatorRequestedRoleId]);
    for (const config of firstTenureRoleConfigs) {
        roleIds.add(config.roleId);
    }

    const porRoles = await PORRole.find({
        _id: { $in: [...roleIds].map((id) => toObjectId(id)) },
        isArchived: false,
    })
        .select("_id appliesToCategories")
        .lean();

    if (porRoles.length !== roleIds.size) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            organizationErrorMessages.roleNotFound
        );
    }

    const roleById = new Map(
        porRoles.map((role) => [role._id.toString(), role.appliesToCategories])
    );

    for (const roleId of roleIds) {
        const appliesToCategories = roleById.get(roleId) ?? [];
        if (
            !isRoleApplicableForCategory(
                appliesToCategories,
                organization.category
            )
        ) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                organizationErrorMessages.roleNotApplicableForCategory
            );
        }
    }

    return OrganizationRequest.create({
        requestedBy: toObjectId(requestedBy),
        organization: {
            name: organization.name,
            slug: finalSlug,
            category: organization.category,
            establishedYear: organization.establishedYear,
            parentOrgId: organization.parentOrgId
                ? toObjectId(organization.parentOrgId)
                : undefined,
            isPermanent: organization.isPermanent,
        },
        firstTenure: {
            ...firstTenure,
            cycleYear: firstTenure.cycleYear ?? firstTenure.startYear,
            startDate: firstTenureDates.startDate,
            endDate: firstTenureDates.endDate,
        },
        firstTenureRoleConfigs: firstTenureRoleConfigs.map((config) => ({
            ...config,
            roleId: toObjectId(config.roleId),
        })),
        creatorRequestedRoleId: toObjectId(creatorRequestedRoleId),
        requiresParentTopPorApproval: data.requiresParentTopPorApproval,
    });
};

export const approveOrganizationRequest = async (
    requestId: string,
    approvedBy: string
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const organizationRequest =
            await OrganizationRequest.findById(requestId).session(session);

        if (!organizationRequest) {
            throw new ApiError(
                HTTP_STATUS.NOT_FOUND,
                organizationErrorMessages.organizationRequestNotFound
            );
        }

        if (
            organizationRequest.status !== ORGANIZATION_REQUEST_STATUS.PENDING
        ) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                organizationErrorMessages.organizationRequestNotPending
            );
        }

        const pendingStepIndex =
            getPendingApprovalStepIndex(organizationRequest);
        if (pendingStepIndex === -1) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                organizationErrorMessages.organizationRequestNotPending
            );
        }

        organizationRequest.approvalSteps[pendingStepIndex].status =
            "approved" as const;
        organizationRequest.approvalSteps[pendingStepIndex].approverStudentId =
            toObjectId(approvedBy);
        organizationRequest.approvalSteps[pendingStepIndex].actedAt =
            new Date();

        const hasRemainingPendingSteps = organizationRequest.approvalSteps.some(
            (step) => step.status === ORGANIZATION_REQUEST_STATUS.PENDING
        );

        if (!hasRemainingPendingSteps) {
            const approvedById = toObjectId(approvedBy);

            const organization = new OrganizationModel(
                buildApprovedOrganizationPayload(
                    organizationRequest,
                    organizationRequest.requestedBy,
                    approvedById
                )
            );
            await organization.save({ session });

            const tenure = new Tenure(
                buildApprovedTenurePayload(
                    organizationRequest,
                    organization._id,
                    organizationRequest.requestedBy,
                    approvedById
                )
            );
            await tenure.save({ session });

            const roleConfigPayloads = buildApprovedTenureRoleConfigPayloads(
                organizationRequest,
                organization._id,
                tenure._id,
                approvedById
            );

            const createdTenureRoleConfigs = await TenureRoleConfig.insertMany(
                roleConfigPayloads,
                { session }
            );

            const creatorRoleConfig = createdTenureRoleConfigs.find((config) =>
                config.roleId.equals(organizationRequest.creatorRequestedRoleId)
            );

            if (!creatorRoleConfig) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    organizationErrorMessages.roleNotFound
                );
            }

            const creatorAssignment = new PORAssignment(
                buildInitialCreatorPorAssignmentPayload(
                    organizationRequest,
                    organization._id,
                    tenure._id,
                    creatorRoleConfig._id,
                    approvedById
                )
            );
            await creatorAssignment.save({ session });

            Object.assign(
                organizationRequest,
                buildApprovedOrganizationRequestMetadata(
                    organizationRequest,
                    approvedById,
                    organization._id,
                    tenure._id
                )
            );
        }

        await organizationRequest.save({ session });
        await session.commitTransaction();
        return organizationRequest;
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

export const rejectOrganizationRequest = async (
    requestId: string,
    rejectedBy: string,
    data: RejectOrganizationRequestInput
) => {
    const organizationRequest = await OrganizationRequest.findById(requestId);

    if (!organizationRequest) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            organizationErrorMessages.organizationRequestNotFound
        );
    }

    if (organizationRequest.status !== ORGANIZATION_REQUEST_STATUS.PENDING) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            organizationErrorMessages.organizationRequestNotPending
        );
    }

    const pendingStepIndex = getPendingApprovalStepIndex(organizationRequest);
    if (pendingStepIndex === -1) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            organizationErrorMessages.organizationRequestNotPending
        );
    }

    organizationRequest.approvalSteps[pendingStepIndex].status =
        "rejected" as const;
    organizationRequest.approvalSteps[pendingStepIndex].approverStudentId =
        toObjectId(rejectedBy);
    organizationRequest.approvalSteps[pendingStepIndex].remarks = data.remarks;
    organizationRequest.approvalSteps[pendingStepIndex].actedAt = new Date();
    Object.assign(
        organizationRequest,
        buildRejectedOrganizationRequestMetadata(
            toObjectId(rejectedBy),
            data.remarks
        )
    );

    await organizationRequest.save();
    return organizationRequest;
};
