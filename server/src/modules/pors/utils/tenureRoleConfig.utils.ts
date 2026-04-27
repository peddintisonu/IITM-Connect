import mongoose from "mongoose";

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiError, toObjectId } from "../../../shared/utils";
import { TENURE_STATUS } from "../constants/tenure.constants";
import PORAssignment from "../porAssignments/porAssignment.model";
import PORRole from "../porRoles/porRole.model";
import TenureRoleConfig, {
    type ITenureRoleConfig,
} from "../tenureConfig/tenureRoleConfig.model";
import {
    tenureConfigErrorMessages,
    tenureErrorMessages,
} from "../tenures/tenure.messages";
import Tenure, { type ITenure } from "../tenures/tenure.model";

export const ensureTenureExistsForConfig = async (tenureId: string) => {
    const tenure = await Tenure.findById(tenureId);

    if (!tenure) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            tenureErrorMessages.tenureNotFound
        );
    }

    return tenure;
};

export const ensureRolesExist = async (roleIds: string[]) => {
    if (roleIds.length === 0) {
        return new Set<string>();
    }

    const roles = await PORRole.find({
        _id: { $in: roleIds.map((roleId) => toObjectId(roleId)) },
        isArchived: false,
    })
        .select("_id")
        .lean();

    if (roles.length !== new Set(roleIds).size) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureConfigErrorMessages.roleNotFound
        );
    }

    return new Set(roles.map((role) => role._id.toString()));
};

export const assertTenureAllowsConfigEdits = (tenure: ITenure) => {
    if (tenure.status === TENURE_STATUS.ARCHIVED) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            tenureConfigErrorMessages.archivedTenureLocked
        );
    }
};

export const assertConfigDatesWithinTenure = (
    tenure: ITenure,
    effectiveFrom?: Date,
    effectiveTo?: Date
) => {
    if (effectiveFrom && effectiveTo && effectiveTo <= effectiveFrom) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureConfigErrorMessages.invalidEffectiveWindow
        );
    }

    if (effectiveFrom && effectiveFrom < tenure.startDate) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureConfigErrorMessages.effectiveDateOutsideTenure
        );
    }

    if (effectiveTo && effectiveTo > tenure.endDate) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureConfigErrorMessages.effectiveDateOutsideTenure
        );
    }
};

export const ensureTenureRoleConfig = async (
    tenureId: string,
    configId: string
) => {
    const config = await TenureRoleConfig.findOne({
        _id: toObjectId(configId),
        tenureId: toObjectId(tenureId),
    });

    if (!config) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            tenureConfigErrorMessages.configNotFound
        );
    }

    return config;
};

export const assertCanDeactivateOrDeleteConfig = async (configId: string) => {
    const activeAssignments = await PORAssignment.countDocuments({
        tenureRoleConfigId: toObjectId(configId),
        isActive: true,
    });

    if (activeAssignments > 0) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            tenureConfigErrorMessages.configHasActiveAssignments
        );
    }
};

export const assertMaxHoldersNotBelowAssignments = async (
    configId: string,
    maxHolders: number
) => {
    const activeAssignments = await PORAssignment.countDocuments({
        tenureRoleConfigId: toObjectId(configId),
        isActive: true,
    });

    if (maxHolders < activeAssignments) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            tenureConfigErrorMessages.maxHoldersTooLow
        );
    }
};

export const parseBulkConfigUpdate = (
    item: {
        isActiveInTenure?: boolean;
        level?: number;
        sortOrder?: number;
        maxHolders?: number;
        canBeVacant?: boolean;
        effectiveFrom?: Date;
        effectiveTo?: Date;
        changeReason?: string;
    },
    updatedBy: mongoose.Types.ObjectId
) => {
    const patch: Record<string, unknown> = { updatedBy };

    if (item.isActiveInTenure !== undefined) {
        patch.isActiveInTenure = item.isActiveInTenure;
    }

    if (item.level !== undefined) patch.level = item.level;
    if (item.sortOrder !== undefined) patch.sortOrder = item.sortOrder;
    if (item.maxHolders !== undefined) patch.maxHolders = item.maxHolders;
    if (item.canBeVacant !== undefined) patch.canBeVacant = item.canBeVacant;
    if (item.effectiveFrom !== undefined)
        patch.effectiveFrom = item.effectiveFrom;
    if (item.effectiveTo !== undefined) patch.effectiveTo = item.effectiveTo;
    if (item.changeReason !== undefined) patch.changeReason = item.changeReason;

    return patch;
};
};
