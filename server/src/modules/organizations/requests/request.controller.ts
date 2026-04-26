import { Request, Response } from "express";

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import {
    ApiResponse,
    asyncHandler,
    validateAndParse,
} from "../../../shared/utils";
import {
    createOrganizationRequestSchema,
    rejectOrganizationRequestSchema,
} from "../../../validations/organizationRequest.validation";
import { organizationRouteMessages } from "../organization.messages";
import {
    approveOrganizationRequest,
    createOrganizationRequest,
    rejectOrganizationRequest,
} from "./request.service";

export const createOrganizationRequestController = asyncHandler(
    async (req: Request, res: Response) => {
        const data = validateAndParse(
            createOrganizationRequestSchema,
            req.body
        );
        const organizationRequest = await createOrganizationRequest(
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse(
                HTTP_STATUS.CREATED,
                organizationRequest,
                organizationRouteMessages.organizationRequestCreated
            )
        );
    }
);

export const approveOrganizationRequestController = asyncHandler(
    async (req: Request, res: Response) => {
        const requestId = Array.isArray(req.params.requestId)
            ? req.params.requestId[0]
            : req.params.requestId;

        const organizationRequest = await approveOrganizationRequest(
            requestId,
            req.user!._id.toString()
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                organizationRequest,
                organizationRouteMessages.organizationRequestApproved
            )
        );
    }
);

export const rejectOrganizationRequestController = asyncHandler(
    async (req: Request, res: Response) => {
        const data = validateAndParse(
            rejectOrganizationRequestSchema,
            req.body
        );
        const requestId = Array.isArray(req.params.requestId)
            ? req.params.requestId[0]
            : req.params.requestId;

        const organizationRequest = await rejectOrganizationRequest(
            requestId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                organizationRequest,
                organizationRouteMessages.organizationRequestRejected
            )
        );
    }
);
