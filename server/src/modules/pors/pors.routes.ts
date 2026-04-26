import { Router } from "express";

import assignmentRoutes from "./assignments/assignment.routes";
import tenureRoutes from "./tenures/tenure.routes";

const router = Router();

router.use(assignmentRoutes);
router.use(tenureRoutes);

export default router;
