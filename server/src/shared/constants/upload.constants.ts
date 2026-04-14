// server/src/shared/constants/upload.constants.ts

export const UPLOAD_LIMITS = {
    profilePhoto: {
        maxSizeMb: 5,
        maxSizeBytes: 5 * 1024 * 1024,
        allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
        ],
        minWidth: 200,
        minHeight: 200,
        allowedAspectRatios: [{ label: "1:1", width: 1, height: 1 }],
        folder: "profile-photos",
    },
    coverPhoto: {
        maxSizeMb: 10,
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
        ],
        minWidth: 800,
        minHeight: 200,
        allowedAspectRatios: [
            { label: "16:9", width: 16, height: 9 },
            { label: "3:1", width: 3, height: 1 },
        ],
        folder: "cover-photos",
    },
    postImage: {
        maxSizeMb: 10,
        maxSizeBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/heic",
            "image/heif",
        ],
        maxCount: 10,
        allowedAspectRatios: [
            { label: "1:1", width: 1, height: 1 },
            { label: "4:5", width: 4, height: 5 },
            { label: "16:9", width: 16, height: 9 },
        ],
        folder: "post-images",
    },
    document: {
        maxSizeMb: 20,
        maxSizeBytes: 20 * 1024 * 1024,
        allowedMimeTypes: ["application/pdf"],
        folder: "documents",
    },
} as const;
