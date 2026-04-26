import { Request, Response } from "express";

import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import {
    ApiResponse,
    asyncHandler,
    validateAndParse,
} from "../../../shared/utils";
import { createPORAssignmentSchema } from "../../../validations/porAssignment.validation";
import { porAssignmentRouteMessages } from "./assignment.messages";
import { createPORAssignment } from "./assignment.service";

export const createPORAssignmentController = asyncHandler(
    async (req: Request, res: Response) => {
        const data = validateAndParse(createPORAssignmentSchema, req.body);
        const assignment = await createPORAssignment(
            req.user!._id.toString(),
            data
        );

        res.status(HTTP_STATUS.CREATED).json(
            new ApiResponse(
                HTTP_STATUS.CREATED,
                assignment,
                porAssignmentRouteMessages.assignmentCreated
            )
        );
    }
);
