// server/src/shared/middleware/upload.middleware.ts

import { Request } from "express";
import multer, { FileFilterCallback } from "multer";
import { UPLOAD_LIMITS } from "../constants/upload.constants";
import { ApiError } from "../utils";

const imageFileFilter = (
    _req: Request,
    file: { mimetype: string },
    cb: FileFilterCallback
) => {
    const allowedTypes = [
        ...UPLOAD_LIMITS.profilePhoto.allowedMimeTypes,
        ...UPLOAD_LIMITS.coverPhoto.allowedMimeTypes,
    ];

    if ((allowedTypes as string[]).includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only jpeg, png and webp images are allowed"));
    }
};

const createImageUploader = (maxSizeBytes: number) =>
    multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: maxSizeBytes },
        fileFilter: imageFileFilter,
    });

export const uploadProfileImage = createImageUploader(
    UPLOAD_LIMITS.profilePhoto.maxSizeBytes
).single("image");

export const uploadCoverImage = createImageUploader(
    UPLOAD_LIMITS.coverPhoto.maxSizeBytes
).single("image");

export const uploadPostImages = createImageUploader(
    UPLOAD_LIMITS.postImage.maxSizeBytes
).array("images", UPLOAD_LIMITS.postImage.maxCount);
