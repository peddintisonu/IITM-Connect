import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
    requireRoles,
} from "../../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../../students/student.model";
import { tenureRoleConfigRoutes } from "./configs";
import {
    createTenureController,
    getTenureByIdController,
    listTenuresController,
    updateTenureController,
    updateTenureStatusController,
} from "./tenure.controller";

const router = Router();

router.get(
    "/tenures",
    protectRoute,
    requireOnboardingComplete,
    listTenuresController
);
router.get(
    "/tenures/:tenureId",
    protectRoute,
    requireOnboardingComplete,
    getTenureByIdController
);
router.post(
    "/tenures",
    protectRoute,
    requireOnboardingComplete,
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createTenureController
);
router.patch(
    "/tenures/:tenureId",
    protectRoute,
    requireOnboardingComplete,
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateTenureController
);
router.patch(
    "/tenures/:tenureId/status",
    protectRoute,
    requireOnboardingComplete,
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateTenureStatusController
);

router.use(tenureRoleConfigRoutes);

export default router;
