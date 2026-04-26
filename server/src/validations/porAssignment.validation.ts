import { z } from "zod";

import { assignmentMonthYearPeriodSchema } from "./tenure.validation";

const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

export const createPORAssignmentSchema = z
    .object({
        tenureRoleConfigId: z
            .string()
            .regex(
                OBJECT_ID_REGEX,
                "tenureRoleConfigId must be a valid ObjectId"
            ),
        studentId: z
            .string()
            .regex(OBJECT_ID_REGEX, "studentId must be a valid ObjectId"),
        notes: z.string().max(500).trim().optional(),
    })
    .merge(assignmentMonthYearPeriodSchema);

export type CreatePORAssignmentInput = z.infer<
    typeof createPORAssignmentSchema
>;
