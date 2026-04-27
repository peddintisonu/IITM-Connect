import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
    requireRoles,
} from "../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../students/student.model";
import { createPORAssignmentController } from "./porAssignments/porAssignment.controller";

const router = Router();

router.use(protectRoute, requireOnboardingComplete);

// ── Admin-Only Routes ──────────────────────────────────────────────────────────

// POST /api/v1/admin/pors/assignments — Manually create a POR assignment (global admin-only)
router.post(
    "/assignments",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createPORAssignmentController
);

export default router;
