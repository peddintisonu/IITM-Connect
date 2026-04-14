// server/src/shared/constants/student.constants.ts

export const STUDENT_SELF_SELECT =
    "-tokenVersion -__v -profilePhotoPublicId -coverPhotoPublicId";

export const STUDENT_PUBLIC_SELECT =
    "-tokenVersion -__v -profilePhotoPublicId -coverPhotoPublicId -email -hostelHistory -rollNoHistory -isOnboarded -status -createdAt -updatedAt";

export const STUDENT_REQUEST_SELECT =
    "-__v -profilePhotoPublicId -coverPhotoPublicId";
