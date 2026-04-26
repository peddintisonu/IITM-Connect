import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
    requireRoles,
} from "../../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../../students/student.model";
import {
    approveOrganizationRequestController,
    createOrganizationRequestController,
    rejectOrganizationRequestController,
} from "./request.controller";

const router = Router();

router.post(
    "/requests",
    protectRoute,
    requireOnboardingComplete,
    createOrganizationRequestController
);

router.post(
    "/requests/:requestId/approve",
    protectRoute,
    requireOnboardingComplete,
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    approveOrganizationRequestController
);

router.post(
    "/requests/:requestId/reject",
    protectRoute,
    requireOnboardingComplete,
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    rejectOrganizationRequestController
);

export default router;
