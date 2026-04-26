import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
    requireRoles,
} from "../../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../../students/student.model";
import { createPORAssignmentController } from "./assignment.controller";

const router = Router();

router.post(
    "/assignments",
    protectRoute,
    requireOnboardingComplete,
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createPORAssignmentController
);

export default router;
