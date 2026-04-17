import {
    AccountType,
    ALLOWED_HIDDEN_FIELDS,
    DEFAULT_PRIVATE_HIDDEN_FIELDS,
    DEFAULT_PUBLIC_HIDDEN_FIELDS,
} from "./student.constants";

const ROLL_NO_REGEX = /^([A-Za-z]{2})(\d{2})([A-Za-z])(\d{3})$/;

interface PrivacySettingsSnapshot {
    hiddenFields?: string[];
    publicHiddenFields?: string[];
    privateHiddenFields?: string[];
}

interface StudentPrivacyCarrier {
    accountType: AccountType;
    privacySettings?: PrivacySettingsSnapshot;
}

export function parseRollNo(smail: string) {
    const prefix = smail.split("@")[0];
    const match = prefix.match(ROLL_NO_REGEX);
    if (!match) {
        throw new Error(`Invalid smail format: ${smail}`);
    }
    const deptCode = match[1].toUpperCase();
    const batch = parseInt(match[2], 10);
    const courseCode = match[3].toUpperCase();
    const rollNo = smail.split("@")[0].toLowerCase();
    return { deptCode, batch, courseCode, rollNo };
}

export function cleanFullName(fullName: string) {
    const trimmedName = fullName.trim();
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
        return trimmedName;
    }
    const lastPart = parts[parts.length - 1];
    const isRollNo = ROLL_NO_REGEX.test(lastPart);
    return isRollNo ? parts.slice(0, -1).join(" ") : trimmedName;
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
