import {
    AccountType,
    ALLOWED_HIDDEN_FIELDS,
    DEFAULT_PRIVATE_HIDDEN_FIELDS,
    DEFAULT_PUBLIC_HIDDEN_FIELDS,
} from "../student.constants";

interface PrivacySettingsSnapshot {
    hiddenFields?: string[];
    publicHiddenFields?: string[];
    privateHiddenFields?: string[];
}

export interface StudentPrivacyCarrier {
    accountType: AccountType;
    privacySettings?: PrivacySettingsSnapshot;
}

export const toUniqueAllowedHiddenFields = (fields: string[]) => {
    const allowedSet = new Set<string>(ALLOWED_HIDDEN_FIELDS);
    const result: string[] = [];

    for (const field of fields) {
        if (!allowedSet.has(field) || result.includes(field)) {
            continue;
        }
        result.push(field);
    }

    return result;
};

export const getDefaultHiddenFields = (accountType: AccountType): string[] => {
    const defaults =
        accountType === "private"
            ? DEFAULT_PRIVATE_HIDDEN_FIELDS
            : DEFAULT_PUBLIC_HIDDEN_FIELDS;

    return Array.from(defaults);
};

export const ensurePrivacySnapshots = (student: StudentPrivacyCarrier) => {
    const privacy = student.privacySettings || {};
    const currentHidden = toUniqueAllowedHiddenFields(
        privacy.hiddenFields || []
    );

    const resolvedCurrentHidden =
        currentHidden.length > 0
            ? currentHidden
            : getDefaultHiddenFields(student.accountType);

    const existingPublic = toUniqueAllowedHiddenFields(
        privacy.publicHiddenFields || []
    );
    const existingPrivate = toUniqueAllowedHiddenFields(
        privacy.privateHiddenFields || []
    );

    student.privacySettings = {
        hiddenFields: resolvedCurrentHidden,
        publicHiddenFields:
            existingPublic.length > 0
                ? existingPublic
                : student.accountType === "public"
                  ? resolvedCurrentHidden
                  : getDefaultHiddenFields("public"),
        privateHiddenFields:
            existingPrivate.length > 0
                ? existingPrivate
                : student.accountType === "private"
                  ? resolvedCurrentHidden
                  : getDefaultHiddenFields("private"),
    };
};
