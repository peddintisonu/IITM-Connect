import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
    requireRoles,
} from "../../../../shared/middleware/auth.middleware";
import { STUDENT_ROLE } from "../../../students/student.model";
import {
    bulkUpsertTenureRoleConfigsController,
    cloneTenureRoleConfigsController,
    createTenureRoleConfigController,
    deleteTenureRoleConfigController,
    getTenureRoleConfigTreeController,
    listTenureRoleConfigsController,
    updateTenureRoleConfigController,
    updateTenureRoleConfigStatusController,
} from "./tenureRoleConfig.controller";

const router = Router();

router.use(protectRoute, requireOnboardingComplete);

router.get("/tenures/:tenureId/role-configs", listTenureRoleConfigsController);
router.get("/tenures/:tenureId/role-configs/tree", getTenureRoleConfigTreeController);

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
