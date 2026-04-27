// server/src/modules/pors/porClaims/porClaim.messages.ts

export const porClaimMessages = {
    // submit
    claimSubmitted: "POR claim submitted successfully",
    alreadyHasActivePOR: "You already have an active POR in this organisation",
    alreadyHasPendingClaim: "You already have a pending claim for this role",
    roleAtCapacity: "This role has reached its maximum number of holders",
    tenureNotActive: "This tenure is not currently active",
    roleNotActiveInTenure: "This role is not active in the current tenure",
    configNotFound: "Role configuration not found",

    // cancel
    claimCancelled: "Claim cancelled successfully",
    cannotCancelClaim: "Only pending claims can be cancelled",
    notYourClaim: "You can only cancel your own claims",

    // approve
    claimApproved: "POR claim approved successfully",
    claimNotFound: "Claim not found",
    claimNotPending: "Only pending claims can be approved or rejected",
    cannotApproveOwnClaim: "You cannot approve your own claim",
    insufficientLevelToApprove:
        "You do not have sufficient level to approve this claim",
    approverPORNotActive: "Your own POR must be active to approve claims",

    // reject
    claimRejected: "POR claim rejected successfully",
    rejectionReasonRequired: "Rejection reason is required",
};
