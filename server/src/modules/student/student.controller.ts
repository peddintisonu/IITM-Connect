// server/src/modules/student/student.controller.ts

import { Request, Response } from "express";
import { ApiError, ApiResponse, asyncHandler } from "../../shared/utils";
import {
    onboardingSchema,
    updateHostelSchema,
    updatePrivacySchema,
    updateProfileSchema,
} from "../../validations/student.validation";
import {
    changeStudentHostel,
    editPrivacySettings,
    editStudentProfile,
    getStudentByUsername,
    onboardStudent,
    uploadStudentCoverPhoto,
    uploadStudentProfilePhoto,
} from "./student.service";

export const onboard = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
        const errors = Object.entries(parsed.error.flatten().fieldErrors)
            .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
            .join("; ");
        throw new ApiError(400, errors);
    }

    const student = await onboardStudent(req.user._id, parsed.data);

    res.status(200).json(new ApiResponse(200, student, "Onboarding complete"));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new ApiError(401, "Unauthorized");

    res.status(200).json(
        new ApiResponse(200, req.user, "Current user fetched")
    );
});

export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) throw new ApiError(401, "Unauthorized");

        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = Object.entries(parsed.error.flatten().fieldErrors)
                .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
                .join("; ");
            throw new ApiError(400, errors);
        }

        const updated = await editStudentProfile(
            req.user._id.toString(),
            parsed.data
        );

        res.status(200).json(new ApiResponse(200, updated, "Profile updated"));
    }
);

export const updateHostel = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) throw new ApiError(401, "Unauthorized");

        const parsed = updateHostelSchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = Object.entries(parsed.error.flatten().fieldErrors)
                .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
                .join("; ");
            throw new ApiError(400, errors);
        }

        const updated = await changeStudentHostel(
            req.user._id.toString(),
            parsed.data
        );

        res.status(200).json(new ApiResponse(200, updated, "Hostel updated"));
    }
);

export const updatePrivacy = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) throw new ApiError(401, "Unauthorized");

        const parsed = updatePrivacySchema.safeParse(req.body);
        if (!parsed.success) {
            const errors = Object.entries(parsed.error.flatten().fieldErrors)
                .map(([field, messages]) => `${field}: ${messages?.join(", ")}`)
                .join("; ");
            throw new ApiError(400, errors);
        }

        const updated = await editPrivacySettings(
            req.user._id.toString(),
            parsed.data
        );

        res.status(200).json(
            new ApiResponse(200, updated, "Privacy settings updated")
        );
    }
);

export const getStudentProfile = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) throw new ApiError(401, "Unauthorized");

        const username = req.params.username as string;
        if (!username) throw new ApiError(400, "Username is required");

        const student = await getStudentByUsername(
            username,
            req.user._id.toString()
        );

        res.status(200).json(new ApiResponse(200, student, "Profile fetched"));
    }
);

export const updateProfilePhoto = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) throw new ApiError(401, "Unauthorized");
        if (!req.file) throw new ApiError(400, "No image provided");

        const updated = await uploadStudentProfilePhoto(
            req.user._id.toString(),
            req.file.buffer,
            req.file.mimetype
        );

        res.status(200).json(
            new ApiResponse(200, updated, "Profile photo updated")
        );
    }
);

export const updateCoverPhoto = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.user) throw new ApiError(401, "Unauthorized");
        if (!req.file) throw new ApiError(400, "No image provided");

        const updated = await uploadStudentCoverPhoto(
            req.user._id.toString(),
            req.file.buffer,
            req.file.mimetype
        );

        res.status(200).json(
            new ApiResponse(200, updated, "Cover photo updated")
        );
    }
);
