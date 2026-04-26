import { Request, Response } from "express";

import { HTTP_STATUS } from "../../../../shared/constants/http-status.constants";
import {
    ApiResponse,
    asyncHandler,
    validateAndParse,
} from "../../../../shared/utils";
import {
    bulkUpsertTenureRoleConfigsSchema,
    cloneTenureRoleConfigsSchema,
    createTenureRoleConfigSchema,
    listTenureRoleConfigsQuerySchema,
    updateTenureRoleConfigSchema,
    updateTenureRoleConfigStatusSchema,
} from "../../../../validations/tenureRoleConfig.validation";
import {
    bulkUpsertTenureRoleConfigs,
    cloneTenureRoleConfigs,
    createTenureRoleConfig,
    deleteTenureRoleConfig,
    getTenureRoleConfigTree,
    listTenureRoleConfigs,
    updateTenureRoleConfig,
    updateTenureRoleConfigStatus,
} from "./tenureRoleConfig.service";
import { tenureConfigRouteMessages } from "../tenure.messages";

export const createTenureRoleConfigController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const data = validateAndParse(createTenureRoleConfigSchema, req.body);

        const config = await createTenureRoleConfig(
            tenureId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse(
                HTTP_STATUS.CREATED,
                config,
                tenureConfigRouteMessages.configCreated
            )
        );
    }
);

export const bulkUpsertTenureRoleConfigsController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const data = validateAndParse(
            bulkUpsertTenureRoleConfigsSchema,
            req.body
        );

        const configs = await bulkUpsertTenureRoleConfigs(
            tenureId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                configs,
                tenureConfigRouteMessages.configsUpserted
            )
        );
    }
);

export const listTenureRoleConfigsController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const query = validateAndParse(listTenureRoleConfigsQuerySchema, req.query);

        const configs = await listTenureRoleConfigs(tenureId, query);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                configs,
                tenureConfigRouteMessages.configsFetched
            )
        );
    }
);

export const getTenureRoleConfigTreeController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const tree = await getTenureRoleConfigTree(tenureId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                tree,
                tenureConfigRouteMessages.configTreeFetched
            )
        );
    }
);

export const updateTenureRoleConfigController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const configId = req.params.configId;
        const data = validateAndParse(updateTenureRoleConfigSchema, req.body);

        const config = await updateTenureRoleConfig(
            tenureId,
            configId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                config,
                tenureConfigRouteMessages.configUpdated
            )
        );
    }
);

export const updateTenureRoleConfigStatusController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const configId = req.params.configId;
        const data = validateAndParse(
            updateTenureRoleConfigStatusSchema,
            req.body
        );

        const config = await updateTenureRoleConfigStatus(
            tenureId,
            configId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                config,
                tenureConfigRouteMessages.configStatusUpdated
            )
        );
    }
);

export const deleteTenureRoleConfigController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const configId = req.params.configId;

        await deleteTenureRoleConfig(tenureId, configId);

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                null,
                tenureConfigRouteMessages.configDeleted
            )
        );
    }
);

export const cloneTenureRoleConfigsController = asyncHandler(
    async (req: Request, res: Response) => {
        const tenureId = req.params.tenureId;
        const sourceTenureId = req.params.sourceTenureId;
        const data = validateAndParse(cloneTenureRoleConfigsSchema, req.body);

        const result = await cloneTenureRoleConfigs(
            tenureId,
            sourceTenureId,
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                result,
                tenureConfigRouteMessages.configsCloned
            )
        );
    }
);
