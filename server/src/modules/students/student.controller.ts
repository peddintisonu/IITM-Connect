// server/src/modules/students/student.controller.ts

import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    validateAndParse,
} from "../../shared/utils";
import {
    OnboardingInput,
    UpdateHostelInput,
    UpdatePrivacyInput,
    UpdateProfileInput,
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
import { studentErrorMessages, studentRouteMessages } from "./student.messages";

export const onboard = asyncHandler(async (req: Request, res: Response) => {
    const data: OnboardingInput = validateAndParse(onboardingSchema, req.body);
    const student = await onboardStudent(req.user!._id, data);
    res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            student,
            studentRouteMessages.onboardingComplete
        )
    );
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
    res.status(HTTP_STATUS.OK).json(
        new ApiResponse(
            HTTP_STATUS.OK,
            req.user,
            studentRouteMessages.currentUserFetched
        )
    );
});

export const updateProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const data: UpdateProfileInput = validateAndParse(
            updateProfileSchema,
            req.body
        );
        const updated = await editStudentProfile(
            req.user!._id.toString(),
            data
        );
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                updated,
                studentRouteMessages.profileUpdated
            )
        );
    }
);

export const updateHostel = asyncHandler(
    async (req: Request, res: Response) => {
        const data: UpdateHostelInput = validateAndParse(
            updateHostelSchema,
            req.body
        );
        const updated = await changeStudentHostel(
            req.user!._id.toString(),
            data
        );
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                updated,
                studentRouteMessages.hostelUpdated
            )
        );
    }
);

export const updatePrivacy = asyncHandler(
    async (req: Request, res: Response) => {
        const data: UpdatePrivacyInput = validateAndParse(
            updatePrivacySchema,
            req.body
        );
        const updated = await editPrivacySettings(
            req.user!._id.toString(),
            data
        );
        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                updated,
                studentRouteMessages.privacySettingsUpdated
            )
        );
    }
);

export const getStudentProfile = asyncHandler(
    async (req: Request, res: Response) => {
        const username = req.params.username as string;
        if (!username) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                studentErrorMessages.usernameRequired
            );
        }

        const student = await getStudentByUsername(
            username,
            req.user!._id.toString()
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                student,
                studentRouteMessages.profileFetched
            )
        );
    }
);

export const updateProfilePhoto = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.file) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                studentErrorMessages.noImageProvided
            );
        }

        const updated = await uploadStudentProfilePhoto(
            req.user!._id.toString(),
            req.file.buffer,
            req.file.mimetype
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                updated,
                studentRouteMessages.profilePhotoUpdated
            )
        );
    }
);

export const updateCoverPhoto = asyncHandler(
    async (req: Request, res: Response) => {
        if (!req.file) {
            throw new ApiError(
                HTTP_STATUS.BAD_REQUEST,
                studentErrorMessages.noImageProvided
            );
        }

        const updated = await uploadStudentCoverPhoto(
            req.user!._id.toString(),
            req.file.buffer,
            req.file.mimetype
        );

        res.status(HTTP_STATUS.OK).json(
            new ApiResponse(
                HTTP_STATUS.OK,
                updated,
                studentRouteMessages.coverPhotoUpdated
            )
        );
    }
);
