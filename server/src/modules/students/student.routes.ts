// server/src/modules/students/student.routes.ts

import { Router } from "express";
import { protectRoute } from "../../shared/middleware/auth.middleware";
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

router.patch("/onboarding", protectRoute, onboard);
router.get("/me", protectRoute, getMe);
router.patch("/me/profile", protectRoute, updateProfile);
router.patch("/me/photo", protectRoute, uploadProfileImage, updateProfilePhoto);
router.patch("/me/cover", protectRoute, uploadCoverImage, updateCoverPhoto);
router.patch("/me/hostel", protectRoute, updateHostel);
router.patch("/me/privacy", protectRoute, updatePrivacy);

router.get("/:username", protectRoute, getStudentProfile);

export default router;
