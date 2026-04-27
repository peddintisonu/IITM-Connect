import { Router } from "express";

import {
    protectRoute,
    requireOnboardingComplete,
} from "../../shared/middleware/auth.middleware";
import {
    requireOrgTopLevelFromBody,
    requireTenureTopLevel,
} from "../../shared/middleware/orgPermission.middleware";
import {
    approveClaim,
    cancelClaim,
    getMyClaims,
    getOrgPendingClaims,
    rejectClaim,
    submitClaim,
} from "./porClaims/porClaim.controller";
import {
    bulkUpsertTenureRoleConfigsController,
    cloneTenureRoleConfigsController,
    createTenureRoleConfigController,
    deleteTenureRoleConfigController,
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

// ── Claims (student actions) ───────────────────────────────────────────────────

// Submit a claim for a role in an active tenure
router.post("/claims", submitClaim);

// Cancel a pending POR claim
router.delete("/claims/:claimId", cancelClaim);

// Get all claims submitted by the current student
router.get("/claims/mine", getMyClaims);

// ── Claims (POR holder actions) ────────────────────────────────────────────────

// Get pending claims for an organization in a specific tenure
router.get("/claims/org/:orgId", getOrgPendingClaims);

// Approve a pending claim (creates POR assignment)
router.post("/claims/:claimId/approve", approveClaim);

// Reject a pending claim with mandatory reason
router.post("/claims/:claimId/reject", rejectClaim);

// ── Tenures ────────────────────────────────────────────────────────────────────

// List all tenures for the user's organizations
router.get("/tenures", listTenuresController);

// Get a specific tenure by ID
router.get("/tenures/:tenureId", getTenureByIdController);

// Create a new tenure (top-level org members only)
router.post("/tenures", requireOrgTopLevelFromBody, createTenureController);

// Update tenure details (top-level org members only)
router.patch(
    "/tenures/:tenureId",
    requireTenureTopLevel,
    updateTenureController
);

// Update tenure status (top-level org members only)
router.patch(
    "/tenures/:tenureId/status",
    requireTenureTopLevel,
    updateTenureStatusController
);

// ── Tenure Role Configs ────────────────────────────────────────────────────────

// List role configurations for a tenure
router.get("/tenures/:tenureId/role-configs", listTenureRoleConfigsController);

// Create a new role configuration (top-level org members only)
router.post(
    "/tenures/:tenureId/role-configs",
    requireTenureTopLevel,
    createTenureRoleConfigController
);

// Bulk upsert role configurations (top-level org members only)
router.put(
    "/tenures/:tenureId/role-configs/bulk",
    requireTenureTopLevel,
    bulkUpsertTenureRoleConfigsController
);

// Update a role configuration (top-level org members only)
router.patch(
    "/tenures/:tenureId/role-configs/:configId",
    requireTenureTopLevel,
    updateTenureRoleConfigController
);

// Update role configuration status (top-level org members only)
router.patch(
    "/tenures/:tenureId/role-configs/:configId/status",
    requireTenureTopLevel,
    updateTenureRoleConfigStatusController
);

// Delete a role configuration (top-level org members only)
router.delete(
    "/tenures/:tenureId/role-configs/:configId",
    requireTenureTopLevel,
    deleteTenureRoleConfigController
);

// Clone role configurations from another tenure (top-level org members only)
router.post(
    "/tenures/:tenureId/role-configs/clone-from/:sourceTenureId",
    requireTenureTopLevel,
    cloneTenureRoleConfigsController
);

export default router;
