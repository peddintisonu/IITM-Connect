// server/src/modules/pors/porClaims/porClaim.controller.ts

import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiResponse, asyncHandler } from "../../../shared/utils";
import { toObjectId } from "../../../shared/utils/mongooseHelper";
import { porClaimMessages } from "./porClaim.messages";
import {
    approvePORClaim,
    cancelPORClaim,
    getMyPORClaims,
    getPendingClaimsForOrg,
    rejectPORClaim,
    submitPORClaim,
} from "./porClaim.service";

export const submitClaim = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!._id;
    const { tenureRoleConfigId, notes } = req.body;

    const claim = await submitPORClaim(
        toObjectId(studentId),
        toObjectId(tenureRoleConfigId),
        notes
    );

    res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            claim,
            porClaimMessages.claimSubmitted
        )
    );
});

export const cancelClaim = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!._id;
    const { claimId } = req.params;

    const claim = await cancelPORClaim(
        toObjectId(studentId),
        toObjectId(claimId)
    );

    res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, claim, porClaimMessages.claimCancelled)
    );
});

export const approveClaim = asyncHandler(
    async (req: Request, res: Response) => {
        const approverId = req.user!._id;
        const { claimId } = req.params;

        const claim = await approvePORClaim(
            toObjectId(approverId),
            toObjectId(claimId)
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                claim,
                porClaimMessages.claimApproved
            )
        );
    }
);

export const rejectClaim = asyncHandler(async (req: Request, res: Response) => {
    const rejecterId = req.user!._id;
    const { claimId } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
            new ApiResponse(
                HTTP_STATUS.BAD_REQUEST,
                null,
                porClaimMessages.rejectionReasonRequired
            )
        );
        return;
    }

    const claim = await rejectPORClaim(
        toObjectId(rejecterId),
        toObjectId(claimId),
        rejectionReason
    );

    res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, claim, porClaimMessages.claimRejected)
    );
});

export const getMyClaims = asyncHandler(async (req: Request, res: Response) => {
    const studentId = req.user!._id;
    const { status } = req.query;

    const claims = await getMyPORClaims(
        toObjectId(studentId),
        status as string | undefined
    );

    res.status(HTTP_STATUS.OK).json(
        new ApiResponse(HTTP_STATUS.OK, claims, "Claims fetched successfully")
    );
});

export const getOrgPendingClaims = asyncHandler(
    async (req: Request, res: Response) => {
        const reviewerId = req.user!._id;
        const { orgId } = req.params;
        const { tenureId } = req.query;

        if (!tenureId || typeof tenureId !== "string") {
            res.status(HTTP_STATUS.BAD_REQUEST).json(
                new ApiResponse(
                    HTTP_STATUS.BAD_REQUEST,
                    null,
                    "tenureId query param is required"
                )
            );
            return;
        }

        const claims = await getPendingClaimsForOrg(
            toObjectId(reviewerId),
            toObjectId(orgId),
            toObjectId(tenureId)
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                claims,
                "Pending claims fetched successfully"
            )
        );
    }
);
