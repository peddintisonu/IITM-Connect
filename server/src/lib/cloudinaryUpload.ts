// server/src/lib/cloudinaryUpload.ts

import { UploadApiResponse } from "cloudinary";
import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    folder: string,
    publicId?: string
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `iitmconnect/${folder}`,
                public_id: publicId,
                overwrite: true,
                invalidate: true,
                resource_type: "image",
            },
            (error, result) => {
                if (error) reject(new Error(error.message));
                else if (!result) reject(new Error("Upload failed"));
                else resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};
