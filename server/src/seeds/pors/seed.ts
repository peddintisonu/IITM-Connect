import { type AnyBulkWriteOperation } from "mongoose";
import {
    PORRole,
    POR_SEED_ROLES,
    type PORSeedRoleDefinition,
} from "../../modules/pors";

type PORRoleSeedDocument = PORSeedRoleDefinition & {
    normalizedDisplayName: string;
    aliases: string[];
    appliesToCategories: string[];
    isArchived: boolean;
};

const normalizeTextList = (values: readonly string[] = []) => [
    ...new Set(
        values.map((value) => value.trim().toLowerCase()).filter(Boolean)
    ),
];

const buildSeedDocument = (
    role: PORSeedRoleDefinition
): PORRoleSeedDocument => ({
    ...role,
    roleKey: role.roleKey.trim().toLowerCase(),
    displayName: role.displayName.trim(),
    normalizedDisplayName: role.displayName.trim().toLowerCase(),
    aliases: normalizeTextList(role.aliases),
    appliesToCategories: [...role.appliesToCategories],
    isArchived: false,
});

export const seedPORRoles = async () => {
    if (POR_SEED_ROLES.length === 0) {
        console.warn("[pors] no POR seed roles found; skipping");
        return;
    }

    const operations: AnyBulkWriteOperation[] = POR_SEED_ROLES.map((role) => {
        const document = buildSeedDocument(role);

        return {
            updateOne: {
                filter: { roleKey: document.roleKey },
                update: {
                    $set: {
                        displayName: document.displayName,
                        normalizedDisplayName: document.normalizedDisplayName,
                        description: document.description,
                        aliases: document.aliases,
                        appliesToCategories: document.appliesToCategories,
                        defaultSortOrder: document.defaultSortOrder ?? 0,
                        isSystem: document.isSystem ?? true,
                        isArchived: document.isArchived,
                    },
                    $setOnInsert: {
                        roleKey: document.roleKey,
                    },
                },
                upsert: true,
            },
        } as const;
    });

    const result = await PORRole.bulkWrite(operations, { ordered: false });
    console.log(
        `[pors] seeded ${POR_SEED_ROLES.length} POR roles (upserted: ${result.upsertedCount}, modified: ${result.modifiedCount})`
    );
};
