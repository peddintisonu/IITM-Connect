// server/src/shared/middleware/orgPermission.middleware.ts

import { NextFunction, Request, Response } from "express";
import { IRolePermissions } from "../../modules/pors/constants/permissions.constants";
import PORAssignment from "../../modules/pors/porAssignments/porAssignment.model";
import TenureRoleConfig from "../../modules/pors/tenureConfig/tenureRoleConfig.model";
import Tenure from "../../modules/pors/tenures/tenure.model";
import { HTTP_STATUS } from "../constants/http-status.constants";
import { ApiError, asyncHandler } from "../utils";

export const checkOrgPermission = (permission: keyof IRolePermissions) =>
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const student = req.user;
        const { orgId } = req.params;

        if (!student) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "Authentication required"
            );
        }

        if (!orgId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Organisation ID is required"
            );
        }

        const assignment = await PORAssignment.findOne({
            studentId: student._id,
            orgId,
            isActive: true,
        });

        if (!assignment) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "No active POR in this organisation"
            );
        }

        const config = await TenureRoleConfig.findById(
            assignment.tenureRoleConfigId
        );

        if (!config) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Role configuration not found"
            );
        }

        if (!config.permissions[permission]) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "You do not have permission to perform this action"
            );
        }

        next();
    });

export const requireOrgTopLevel = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const student = req.user;
        const { orgId } = req.params;

        if (!student) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "Authentication required"
            );
        }

        if (!orgId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Organisation ID is required"
            );
        }

        const assignment = await PORAssignment.findOne({
            studentId: student._id,
            orgId,
            isActive: true,
        });

        if (!assignment) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "No active POR in this organisation"
            );
        }

        const config = await TenureRoleConfig.findById(
            assignment.tenureRoleConfigId
        );

        if (!config) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Role configuration not found"
            );
        }

        if (config.level !== 1) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Only top-level (level 1) members can manage tenures and role configurations"
            );
        }

        next();
    }
);

export const requireTenureTopLevel = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const student = req.user;
        const { tenureId } = req.params;

        if (!student) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "Authentication required"
            );
        }

        if (!tenureId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Tenure ID is required"
            );
        }

        const tenure = await Tenure.findById(tenureId).select("orgId").lean();
        if (!tenure) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, "Tenure not found");
        }

        const assignment = await PORAssignment.findOne({
            studentId: student._id,
            orgId: tenure.orgId,
            isActive: true,
        });

        if (!assignment) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "No active POR in this organisation"
            );
        }

        const config = await TenureRoleConfig.findById(
            assignment.tenureRoleConfigId
        );

        if (!config) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Role configuration not found"
            );
        }

        if (config.level !== 1) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Only top-level (level 1) members can manage tenures and role configurations"
            );
        }

        next();
    }
);

export const requireOrgTopLevelFromBody = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const student = req.user;
        const { orgId } = req.body;

        if (!student) {
            throw new ApiError(
                HTTP_STATUS.UNAUTHORIZED,
                "Authentication required"
            );
        }

        if (!orgId) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                "Organisation ID is required in request body"
            );
        }

        const assignment = await PORAssignment.findOne({
            studentId: student._id,
            orgId,
            isActive: true,
        });

        if (!assignment) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "No active POR in this organisation"
            );
        }

        const config = await TenureRoleConfig.findById(
            assignment.tenureRoleConfigId
        );

        if (!config) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Role configuration not found"
            );
        }

        if (config.level !== 1) {
            throw new ApiError(
                HTTP_STATUS.FORBIDDEN,
                "Only top-level (level 1) members can create tenures"
            );
        }

        next();
    }
);
