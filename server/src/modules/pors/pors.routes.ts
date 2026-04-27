import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
    requireRoles,
} from "../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../students/student.model";
import { createPORAssignmentController } from "./porAssignments/porAssignment.controller";
import {
    bulkUpsertTenureRoleConfigsController,
    cloneTenureRoleConfigsController,
    createTenureRoleConfigController,
    deleteTenureRoleConfigController,
    getTenureRoleConfigTreeController,
    listTenureRoleConfigsController,
    updateTenureRoleConfigController,
    updateTenureRoleConfigStatusController,
} from "./tenureConfig/tenureRoleConfig.controller";
import {
    createTenureController,
    getTenureByIdController,
    listTenuresController,
    updateTenureController,
    updateTenureStatusController,
} from "./tenures/tenure.controller";

const router = Router();

router.use(protectRoute, requireOnboardingComplete);

router.post(
    "/assignments",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createPORAssignmentController
);

router.get("/tenures", listTenuresController);
router.get("/tenures/:tenureId", getTenureByIdController);
router.post(
    "/tenures",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createTenureController
);
router.patch(
    "/tenures/:tenureId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateTenureController
);
router.patch(
    "/tenures/:tenureId/status",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateTenureStatusController
);

router.get("/tenures/:tenureId/role-configs", listTenureRoleConfigsController);
router.get(
    "/tenures/:tenureId/role-configs/tree",
    getTenureRoleConfigTreeController
);
router.post(
    "/tenures/:tenureId/role-configs",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    createTenureRoleConfigController
);
router.put(
    "/tenures/:tenureId/role-configs/bulk",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    bulkUpsertTenureRoleConfigsController
);
router.patch(
    "/tenures/:tenureId/role-configs/:configId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateTenureRoleConfigController
);
router.patch(
    "/tenures/:tenureId/role-configs/:configId/status",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    updateTenureRoleConfigStatusController
);
router.delete(
    "/tenures/:tenureId/role-configs/:configId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    deleteTenureRoleConfigController
);
router.post(
    "/tenures/:tenureId/role-configs/clone-from/:sourceTenureId",
    requireRoles(STUDENT_ROLE.ADMIN, STUDENT_ROLE.SUPER_ADMIN),
    cloneTenureRoleConfigsController
);

export default router;
