// server/src/modules/pors/porClaims/porClaim.service.ts

import mongoose from "mongoose";
import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiError } from "../../../shared/utils/ApiError";
import PORAssignment from "../porAssignments/porAssignment.model";
import TenureRoleConfig from "../tenureConfig/tenureRoleConfig.model";
import Tenure from "../tenures/tenure.model";
import { porClaimMessages } from "./porClaim.messages";
import PORClaim from "./porClaim.model";

// -----------------------------------------------------------------------
// SUBMIT CLAIM
// -----------------------------------------------------------------------

export const submitPORClaim = async (
    studentId: mongoose.Types.ObjectId,
    tenureRoleConfigId: mongoose.Types.ObjectId,
    notes?: string
) => {
    // 1. Load the config — we need orgId, tenureId, roleId, maxHolders from it
    const config = await TenureRoleConfig.findById(tenureRoleConfigId);
    if (!config) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porClaimMessages.configNotFound
        );
    }

    if (!config.isActiveInTenure) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            porClaimMessages.roleNotActiveInTenure
        );
    }

    // 2. Check tenure is active
    const tenure = await Tenure.findById(config.tenureId);
    if (!tenure || tenure.status !== "active") {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            porClaimMessages.tenureNotActive
        );
    }

    // 3. Check student doesn't already have an active POR in this org+tenure
    // Scoped to tenure so a student from a previous tenure doesn't get blocked
    const existingActivePOR = await PORAssignment.findOne({
        studentId,
        orgId: config.orgId,
        tenureId: config.tenureId,
        isActive: true,
    });
    if (existingActivePOR) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porClaimMessages.alreadyHasActivePOR
        );
    }

    // 4. Check student doesn't already have a pending claim for this role
    const existingPendingClaim = await PORClaim.findOne({
        claimedBy: studentId,
        tenureRoleConfigId,
        status: "pending",
    });
    if (existingPendingClaim) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porClaimMessages.alreadyHasPendingClaim
        );
    }

    // 5. Check role is not at capacity
    const activeHolderCount = await PORAssignment.countDocuments({
        tenureRoleConfigId,
        isActive: true,
    });
    if (activeHolderCount >= config.maxHolders) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porClaimMessages.roleAtCapacity
        );
    }

    // 6. Create the claim
    const claim = await PORClaim.create({
        orgId: config.orgId,
        tenureId: config.tenureId,
        tenureRoleConfigId,
        roleId: config.roleId,
        claimedBy: studentId,
        notes,
    });

    // TODO: notify all active POR holders at level 1 and level 2 in the same org+tenure
    // so they know a new claim is waiting for review

    return claim;
};

// -----------------------------------------------------------------------
// CANCEL CLAIM
// -----------------------------------------------------------------------

export const cancelPORClaim = async (
    studentId: mongoose.Types.ObjectId,
    claimId: mongoose.Types.ObjectId
) => {
    const claim = await PORClaim.findById(claimId);

    if (!claim) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porClaimMessages.claimNotFound
        );
    }

    if (!claim.claimedBy.equals(studentId)) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.notYourClaim
        );
    }

    if (claim.status !== "pending") {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            porClaimMessages.cannotCancelClaim
        );
    }

    claim.status = "cancelled";
    await claim.save();

    return claim;
};

// -----------------------------------------------------------------------
// APPROVE CLAIM
// -----------------------------------------------------------------------

export const approvePORClaim = async (
    approverId: mongoose.Types.ObjectId,
    claimId: mongoose.Types.ObjectId
) => {
    const claim = await PORClaim.findById(claimId);

    if (!claim) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porClaimMessages.claimNotFound
        );
    }

    if (claim.status !== "pending") {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            porClaimMessages.claimNotPending
        );
    }

    // Cannot approve your own claim
    if (claim.claimedBy.equals(approverId)) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.cannotApproveOwnClaim
        );
    }

    // FIX: Approver must have an active POR in the same org AND same tenure
    // Without tenureId filter, a holder from a previous tenure that wasn't
    // cleaned up yet could approve claims for the current tenure
    const approverAssignment = await PORAssignment.findOne({
        studentId: approverId,
        orgId: claim.orgId,
        tenureId: claim.tenureId,
        isActive: true,
    });

    if (!approverAssignment) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.approverPORNotActive
        );
    }

    // Load approver's config to check their level
    const approverConfig = await TenureRoleConfig.findById(
        approverAssignment.tenureRoleConfigId
    );

    if (!approverConfig) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.approverPORNotActive
        );
    }

    // Load claimant's requested role config to check its level
    const claimConfig = await TenureRoleConfig.findById(
        claim.tenureRoleConfigId
    );

    if (!claimConfig) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porClaimMessages.configNotFound
        );
    }

    // Chain of trust rules:
    // 1. Approver must outrank the claimant — lower level number = higher rank
    // 2. Exception: level 1 is the top role. No one is above them, so they are
    //    allowed to approve parallel level-1 claims (e.g. co-Presidents approving each other)
    // 3. Anyone below level 1 cannot approve parallel or higher-ranked roles

    const approverIsTopLevel = approverConfig.level === 1;
    const approverOutranks = approverConfig.level < claimConfig.level;

    if (!approverOutranks && !approverIsTopLevel) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.insufficientLevelToApprove
        );
    }
    // FIX: Re-check capacity right before creating the assignment
    // A different claim for the same role may have been approved between
    // when this claim was submitted and now — without this check you can
    // exceed maxHolders silently
    const currentHolderCount = await PORAssignment.countDocuments({
        tenureRoleConfigId: claim.tenureRoleConfigId,
        isActive: true,
    });

    if (currentHolderCount >= claimConfig.maxHolders) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porClaimMessages.roleAtCapacity
        );
    }

    // FIX: Re-check that claimant doesn't already have an active POR in this org+tenure
    // A separate claim for a different role in the same org may have been approved
    // between submission and now
    const existingActivePOR = await PORAssignment.findOne({
        studentId: claim.claimedBy,
        orgId: claim.orgId,
        tenureId: claim.tenureId,
        isActive: true,
    });

    if (existingActivePOR) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porClaimMessages.alreadyHasActivePOR
        );
    }

    // All checks passed — create assignment and mark claim approved in one transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        await PORAssignment.create(
            [
                {
                    studentId: claim.claimedBy,
                    orgId: claim.orgId,
                    tenureId: claim.tenureId,
                    tenureRoleConfigId: claim.tenureRoleConfigId,
                    roleId: claim.roleId,
                    assignedBy: approverId,
                    isActive: true,
                },
            ],
            { session }
        );

        claim.status = "approved";
        claim.reviewedBy = approverId;
        claim.reviewedAt = new Date();
        await claim.save({ session });

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        throw err;
    } finally {
        session.endSession();
    }

    // TODO: notify claimant that their claim was approved

    return claim;
};

// -----------------------------------------------------------------------
// REJECT CLAIM
// -----------------------------------------------------------------------

export const rejectPORClaim = async (
    rejecterId: mongoose.Types.ObjectId,
    claimId: mongoose.Types.ObjectId,
    rejectionReason: string
) => {
    const claim = await PORClaim.findById(claimId);

    if (!claim) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porClaimMessages.claimNotFound
        );
    }

    if (claim.status !== "pending") {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            porClaimMessages.claimNotPending
        );
    }

    // FIX: Rejecter must have an active POR in the same org AND same tenure
    // Same reason as approvePORClaim — old tenure holders should not be able to reject
    const rejecterAssignment = await PORAssignment.findOne({
        studentId: rejecterId,
        orgId: claim.orgId,
        tenureId: claim.tenureId,
        isActive: true,
    });

    if (!rejecterAssignment) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.approverPORNotActive
        );
    }

    const rejecterConfig = await TenureRoleConfig.findById(
        rejecterAssignment.tenureRoleConfigId
    );

    if (!rejecterConfig) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.approverPORNotActive
        );
    }

    const claimConfig = await TenureRoleConfig.findById(
        claim.tenureRoleConfigId
    );

    if (!claimConfig) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porClaimMessages.configNotFound
        );
    }

    const rejecterIsTopLevel = rejecterConfig.level === 1;
    const rejecterOutranks = rejecterConfig.level < claimConfig.level;

    if (!rejecterOutranks && !rejecterIsTopLevel) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            porClaimMessages.insufficientLevelToApprove
        );
    }

    claim.status = "rejected";
    claim.reviewedBy = rejecterId;
    claim.reviewedAt = new Date();
    claim.rejectionReason = rejectionReason;
    await claim.save();

    // TODO: notify claimant that their claim was rejected with the rejection reason

    return claim;
};

// -----------------------------------------------------------------------
// GET MY CLAIMS
// -----------------------------------------------------------------------

export const getMyPORClaims = async (
    studentId: mongoose.Types.ObjectId,
    status?: string
) => {
    const filter: Record<string, unknown> = { claimedBy: studentId };
    if (status) filter.status = status;

    const claims = await PORClaim.find(filter)
        .populate("orgId", "name slug")
        .populate("roleId", "displayName")
        .sort({ createdAt: -1 });

    return claims;
};

// -----------------------------------------------------------------------
// GET PENDING CLAIMS FOR ORG (for POR holders to review)
// -----------------------------------------------------------------------

export const getPendingClaimsForOrg = async (
    reviewerId: mongoose.Types.ObjectId,
    orgId: mongoose.Types.ObjectId,
    tenureId: mongoose.Types.ObjectId
) => {
    // Reviewer must have active POR in this org AND this specific tenure
    const reviewerAssignment = await PORAssignment.findOne({
        studentId: reviewerId,
        orgId,
        tenureId,
        isActive: true,
    });

    if (!reviewerAssignment) {
        throw new ApiError(
            HTTP_STATUS.FORBIDDEN,
            "You do not have an active POR in this organisation for this tenure"
        );
    }

    const claims = await PORClaim.find({ orgId, tenureId, status: "pending" })
        .populate("claimedBy", "displayName username")
        .populate("roleId", "displayName")
        .populate("tenureRoleConfigId", "level maxHolders")
        .sort({ createdAt: 1 });

    return claims;
};
