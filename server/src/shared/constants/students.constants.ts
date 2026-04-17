// server/src/shared/constants/student.constants.ts

export const ACCOUNT_TYPE = {
    PUBLIC: "public",
    PRIVATE: "private",
} as const;

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export const ACCOUNT_TYPE_ENUM = [
    ACCOUNT_TYPE.PUBLIC,
    ACCOUNT_TYPE.PRIVATE,
] as const;

export const STUDENT_STATUS = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    SUSPENDED: "suspended",
} as const;

export type StudentStatus =
    (typeof STUDENT_STATUS)[keyof typeof STUDENT_STATUS];

export const STUDENT_STATUS_ENUM = [
    STUDENT_STATUS.ACTIVE,
    STUDENT_STATUS.INACTIVE,
    STUDENT_STATUS.SUSPENDED,
] as const;

export const STUDENT_SELF_SELECT =
    "-tokenVersion -__v -profilePhotoPublicId -coverPhotoPublicId";

export const STUDENT_PUBLIC_SELECT =
    "-tokenVersion -__v -profilePhotoPublicId -coverPhotoPublicId -email -hostelHistory -rollNoHistory -isOnboarded -status -createdAt -updatedAt";

export const STUDENT_REQUEST_SELECT =
    "-__v -profilePhotoPublicId -coverPhotoPublicId";
