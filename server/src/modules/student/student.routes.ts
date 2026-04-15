// server/src/modules/student/student.routes.ts

import { Router } from "express";
import {
    protectRoute,
    requireAuth,
} from "../../shared/middleware/auth.middleware";
import {
    uploadCoverImage,
    uploadProfileImage,
} from "../../shared/middleware/upload.middleware";
import {
    getMe,
    getStudentProfile,
    onboard,
    updateCoverPhoto,
    updateHostel,
    updatePrivacy,
    updateProfile,
    updateProfilePhoto,
} from "./student.controller";

const router = Router();

router.patch("/onboarding", protectRoute, requireAuth, onboard);
router.get("/me", protectRoute, requireAuth, getMe);
router.patch("/me/profile", protectRoute, requireAuth, updateProfile);
router.patch(
    "/me/photo",
    protectRoute,
    requireAuth,
    uploadProfileImage,
    updateProfilePhoto
);
router.patch(
    "/me/cover",
    protectRoute,
    requireAuth,
    uploadCoverImage,
    updateCoverPhoto
);
router.patch("/me/hostel", protectRoute, requireAuth, updateHostel);
router.patch("/me/privacy", protectRoute, requireAuth, updatePrivacy);

router.get("/:username", protectRoute, requireAuth, getStudentProfile);

export default router;
