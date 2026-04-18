// server/src/modules/students/student.routes.ts

import { Router } from "express";
import {
    protectRoute,
    requireOnboardingComplete,
} from "../../shared/middleware/auth.middleware";
import {
    uploadCoverImage,
    uploadProfileImage,
} from "../../shared/middleware/upload.middleware";
import {
    getMe,
    getStudentProfile,
    getUsernameAvailability,
    onboard,
    updateCoverPhoto,
    updateHostel,
    updatePrivacy,
    updateProfile,
    updateProfilePhoto,
} from "./student.controller";

const router = Router();

router.patch("/onboarding", protectRoute, onboard);
router.get("/username-availability", protectRoute, getUsernameAvailability);
router.get("/me", protectRoute, getMe);
router.patch(
    "/me/profile",
    protectRoute,
    requireOnboardingComplete,
    updateProfile
);
router.patch(
    "/me/photo",
    protectRoute,
    requireOnboardingComplete,
    uploadProfileImage,
    updateProfilePhoto
);
router.patch(
    "/me/cover",
    protectRoute,
    requireOnboardingComplete,
    uploadCoverImage,
    updateCoverPhoto
);
router.patch(
    "/me/hostel",
    protectRoute,
    requireOnboardingComplete,
    updateHostel
);
router.patch(
    "/me/privacy",
    protectRoute,
    requireOnboardingComplete,
    updatePrivacy
);

router.get(
    "/:username",
    protectRoute,
    requireOnboardingComplete,
    getStudentProfile
);

export default router;

// TODO: add student search with pagination and profile and cover photos delete endpoints and also add endpoint to fetch basic profile info (display name and profile photo) for a list of userIds for features like mutual followers, followers/following suggestions etc and report endpoint to report user for abuse
