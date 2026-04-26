import { Request, Response } from "express";

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import {
    ApiResponse,
    asyncHandler,
    validateAndParse,
} from "../../../shared/utils";
import {
    createTenureSchema,
    listTenuresQuerySchema,
    updateTenureSchema,
    updateTenureStatusSchema,
} from "../../../validations/tenure.validation";
import { tenureRouteMessages } from "./tenure.messages";
import {
    createTenure,
    getTenureById,
    listTenures,
    updateTenure,
    updateTenureStatus,
} from "./tenure.service";

export const createTenureController = asyncHandler(
    async (req: Request, res: Response) => {
        const data = validateAndParse(createTenureSchema, req.body);
        const tenure = await createTenure(req.user!._id.toString(), data);

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse(
                HTTP_STATUS.CREATED,
                tenure,
                tenureRouteMessages.tenureCreated
            )
        );
    }
);

export const listTenuresController = asyncHandler(
    async (req: Request, res: Response) => {
        const query = validateAndParse(listTenuresQuerySchema, req.query);
        const tenures = await listTenures(query);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                tenures,
                tenureRouteMessages.tenuresFetched
            )
        );
    }
);

export const getTenureByIdController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = Array.isArray(req.params.tenureId)
            ? req.params.tenureId[0]
            : req.params.tenureId;
        const tenure = await getTenureById(tenureId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                tenure,
                tenureRouteMessages.tenureFetched
            )
        );
    }
);

export const updateTenureController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = Array.isArray(req.params.tenureId)
            ? req.params.tenureId[0]
            : req.params.tenureId;
        const data = validateAndParse(updateTenureSchema, req.body);
        const tenure = await updateTenure(
            tenureId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                tenure,
                tenureRouteMessages.tenureUpdated
            )
        );
    }
);

export const updateTenureStatusController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = Array.isArray(req.params.tenureId)
            ? req.params.tenureId[0]
            : req.params.tenureId;
        const data = validateAndParse(updateTenureStatusSchema, req.body);

        const tenure = await updateTenureStatus(
            tenureId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                tenure,
                tenureRouteMessages.tenureStatusUpdated
            )
        );
    }
);
