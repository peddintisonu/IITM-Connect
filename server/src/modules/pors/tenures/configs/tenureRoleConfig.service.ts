import { AnyBulkWriteOperation } from "mongoose";

import { HTTP_STATUS } from "../../../../shared/constants/http-status.constants";
import { ApiError, toObjectId } from "../../../../shared/utils";
import {
    BulkUpsertTenureRoleConfigsInput,
    CloneTenureRoleConfigsInput,
    CreateTenureRoleConfigInput,
    ListTenureRoleConfigsQueryInput,
    UpdateTenureRoleConfigInput,
    UpdateTenureRoleConfigStatusInput,
} from "../../../../validations/tenureRoleConfig.validation";
import Tenure from "../tenure.model";
import {
    assertCanDeactivateOrDeleteConfig,
    assertConfigDatesWithinTenure,
    assertMaxHoldersNotBelowAssignments,
    assertTenureAllowsConfigEdits,
    buildConfigTree,
    ensureRolesExist,
    ensureTenureExistsForConfig,
    ensureTenureRoleConfig,
    parseBulkConfigUpdate,
} from "../utils";
import { tenureConfigErrorMessages } from "../tenure.messages";
import TenureRoleConfig, { type ITenureRoleConfig } from "./tenureRoleConfig.model";

const toNormalizedParentRoleId = (parentRoleId?: string | null) => {
    if (!parentRoleId) {
        return null;
    }

    return toObjectId(parentRoleId);
};

export const createTenureRoleConfig = async (
    tenureId: string,
    updatedBy: string,
    data: CreateTenureRoleConfigInput
) => {
    const tenure = await ensureTenureExistsForConfig(tenureId);
    assertTenureAllowsConfigEdits(tenure);

    await ensureRolesExist(
        [data.roleId, data.parentRoleId].filter(Boolean) as string[]
    );

    assertConfigDatesWithinTenure(tenure, data.effectiveFrom, data.effectiveTo);

    try {
        return await TenureRoleConfig.create({
            tenureId: tenure._id,
            orgId: tenure.orgId,
            roleId: toObjectId(data.roleId),
            isActiveInTenure: data.isActiveInTenure ?? true,
            parentRoleId: toNormalizedParentRoleId(data.parentRoleId),
            level: data.level ?? 0,
            sortOrder: data.sortOrder ?? 0,
            maxHolders: data.maxHolders ?? 1,
            canBeVacant: data.canBeVacant ?? true,
            effectiveFrom: data.effectiveFrom,
            effectiveTo: data.effectiveTo,
            changeReason: data.changeReason,
            createdBy: toObjectId(updatedBy),
            updatedBy: toObjectId(updatedBy),
        });
    } catch (error) {
        const duplicateError = error as { code?: number };

        if (duplicateError.code === 11000) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                tenureConfigErrorMessages.roleAlreadyConfigured
            );
        }

        throw error;
    }
};

export const bulkUpsertTenureRoleConfigs = async (
    tenureId: string,
    updatedBy: string,
    data: BulkUpsertTenureRoleConfigsInput
) => {
    const tenure = await ensureTenureExistsForConfig(tenureId);
    assertTenureAllowsConfigEdits(tenure);

    const roleIds = new Set<string>();

    for (const config of data.configs) {
        roleIds.add(config.roleId);
        if (config.parentRoleId) {
            roleIds.add(config.parentRoleId);
        }

        assertConfigDatesWithinTenure(
            tenure,
            config.effectiveFrom,
            config.effectiveTo
        );
    }

    await ensureRolesExist([...roleIds]);

    if (!data.overwriteExisting) {
        const existingCount = await TenureRoleConfig.countDocuments({
            tenureId: tenure._id,
        });

        if (existingCount > 0) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                tenureConfigErrorMessages.targetAlreadyHasConfigs
            );
        }
    }

    const updatedById = toObjectId(updatedBy);

    const operations: AnyBulkWriteOperation<ITenureRoleConfig>[] =
        data.configs.map((config) => ({
            updateOne: {
                filter: {
                    tenureId: tenure._id,
                    roleId: toObjectId(config.roleId),
                },
                update: {
                    $set: parseBulkConfigUpdate(config, updatedById),
                    $setOnInsert: {
                        tenureId: tenure._id,
                        orgId: tenure.orgId,
                        roleId: toObjectId(config.roleId),
                        isActiveInTenure: true,
                        parentRoleId: null,
                        level: 0,
                        sortOrder: 0,
                        maxHolders: 1,
                        canBeVacant: true,
                        createdBy: updatedById,
                    },
                },
                upsert: true,
            },
        }));

    await TenureRoleConfig.bulkWrite(operations, { ordered: false });

    return TenureRoleConfig.find({ tenureId: tenure._id })
        .sort({ level: 1, sortOrder: 1, _id: 1 })
        .populate("roleId", "_id roleKey displayName defaultSortOrder")
        .populate("parentRoleId", "_id roleKey displayName defaultSortOrder")
        .lean();
};

export const listTenureRoleConfigs = async (
    tenureId: string,
    query: ListTenureRoleConfigsQueryInput
) => {
    const tenure = await ensureTenureExistsForConfig(tenureId);

    const filter: Record<string, unknown> = {
        tenureId: tenure._id,
    };

    if (query.isActiveInTenure !== undefined) {
        filter.isActiveInTenure = query.isActiveInTenure;
    }

    return TenureRoleConfig.find(filter)
        .sort({ level: 1, sortOrder: 1, _id: 1 })
        .populate("roleId", "_id roleKey displayName defaultSortOrder")
        .populate("parentRoleId", "_id roleKey displayName defaultSortOrder")
        .lean();
};

export const getTenureRoleConfigTree = async (tenureId: string) => {
    await ensureTenureExistsForConfig(tenureId);

    const configs = await TenureRoleConfig.find({
        tenureId: toObjectId(tenureId),
    })
        .sort({ level: 1, sortOrder: 1, _id: 1 })
        .populate("roleId", "_id roleKey displayName defaultSortOrder")
        .populate("parentRoleId", "_id roleKey displayName defaultSortOrder");

    return buildConfigTree(configs);
};

export const updateTenureRoleConfig = async (
    tenureId: string,
    configId: string,
    updatedBy: string,
    data: UpdateTenureRoleConfigInput
) => {
    const tenure = await ensureTenureExistsForConfig(tenureId);
    assertTenureAllowsConfigEdits(tenure);

    if (data.parentRoleId) {
        await ensureRolesExist([data.parentRoleId]);
    }

    assertConfigDatesWithinTenure(tenure, data.effectiveFrom, data.effectiveTo);

    const config = await ensureTenureRoleConfig(tenureId, configId);

    if (data.maxHolders !== undefined) {
        await assertMaxHoldersNotBelowAssignments(configId, data.maxHolders);
        config.maxHolders = data.maxHolders;
    }

    if (data.isActiveInTenure === false && config.isActiveInTenure) {
        await assertCanDeactivateOrDeleteConfig(configId);
    }

    if (data.isActiveInTenure !== undefined) {
        config.isActiveInTenure = data.isActiveInTenure;
    }

    if (data.parentRoleId !== undefined) {
        config.parentRoleId = toNormalizedParentRoleId(data.parentRoleId) ?? undefined;
    }

    if (data.level !== undefined) config.level = data.level;
    if (data.sortOrder !== undefined) config.sortOrder = data.sortOrder;
    if (data.canBeVacant !== undefined) config.canBeVacant = data.canBeVacant;
    if (data.effectiveFrom !== undefined) config.effectiveFrom = data.effectiveFrom;
    if (data.effectiveTo !== undefined) config.effectiveTo = data.effectiveTo;
    if (data.changeReason !== undefined) config.changeReason = data.changeReason;

    config.updatedBy = toObjectId(updatedBy);

    await config.save();
    return config;
};

export const updateTenureRoleConfigStatus = async (
    tenureId: string,
    configId: string,
    updatedBy: string,
    data: UpdateTenureRoleConfigStatusInput
) => {
    const tenure = await ensureTenureExistsForConfig(tenureId);
    assertTenureAllowsConfigEdits(tenure);

    const config = await ensureTenureRoleConfig(tenureId, configId);

    if (config.isActiveInTenure === data.isActiveInTenure) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureConfigErrorMessages.configStatusUnchanged
        );
    }

    if (!data.isActiveInTenure) {
        await assertCanDeactivateOrDeleteConfig(configId);
    }

    config.isActiveInTenure = data.isActiveInTenure;
    config.changeReason = data.changeReason;
    config.updatedBy = toObjectId(updatedBy);

    await config.save();
    return config;
};

export const deleteTenureRoleConfig = async (
    tenureId: string,
    configId: string
) => {
    const tenure = await ensureTenureExistsForConfig(tenureId);
    assertTenureAllowsConfigEdits(tenure);

    await ensureTenureRoleConfig(tenureId, configId);
    await assertCanDeactivateOrDeleteConfig(configId);

    await TenureRoleConfig.findOneAndDelete({
        _id: toObjectId(configId),
        tenureId: toObjectId(tenureId),
    });
};

export const cloneTenureRoleConfigs = async (
    tenureId: string,
    sourceTenureId: string,
    updatedBy: string,
    options: CloneTenureRoleConfigsInput
) => {
    const targetTenure = await ensureTenureExistsForConfig(tenureId);
    assertTenureAllowsConfigEdits(targetTenure);

    const sourceTenure = await ensureTenureExistsForConfig(sourceTenureId);

    if (!sourceTenure.orgId.equals(targetTenure.orgId)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureConfigErrorMessages.crossOrgCloneNotAllowed
        );
    }

    const sourceConfigs = await TenureRoleConfig.find({
        tenureId: sourceTenure._id,
    }).lean();

    if (sourceConfigs.length === 0) {
        return { clonedCount: 0 };
    }

    if (!options.overwriteExisting) {
        const existing = await TenureRoleConfig.countDocuments({
            tenureId: targetTenure._id,
        });

        if (existing > 0) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                tenureConfigErrorMessages.targetAlreadyHasConfigs
            );
        }
    }

    const updatedById = toObjectId(updatedBy);

    const operations: AnyBulkWriteOperation<ITenureRoleConfig>[] =
        sourceConfigs.map((config) => ({
            updateOne: {
                filter: {
                    tenureId: targetTenure._id,
                    roleId: config.roleId,
                },
                update: {
                    $set: {
                        isActiveInTenure: config.isActiveInTenure,
                        parentRoleId: config.parentRoleId ?? null,
                        level: config.level,
                        sortOrder: config.sortOrder,
                        maxHolders: config.maxHolders,
                        canBeVacant: config.canBeVacant,
                        effectiveFrom: config.effectiveFrom,
                        effectiveTo: config.effectiveTo,
                        changeReason: config.changeReason,
                        updatedBy: updatedById,
                    },
                    $setOnInsert: {
                        orgId: targetTenure.orgId,
                        tenureId: targetTenure._id,
                        roleId: config.roleId,
                        createdBy: updatedById,
                    },
                },
                upsert: true,
            },
        }));

    await TenureRoleConfig.bulkWrite(operations, { ordered: false });

    return { clonedCount: operations.length };
};
