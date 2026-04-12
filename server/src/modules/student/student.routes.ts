// server/src/modules/student/student.routes.ts

import { Router } from "express";

import { protectRoute } from "../../shared/middleware/auth.middleware";
import { onboard } from "./student.controller";

const router = Router();

router.patch("/onboarding", protectRoute, onboard);

export default router;
