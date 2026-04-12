// server/src/modules/student/student.controller.ts

import { Request, Response } from "express";
import { ApiResponse, asyncHandler } from "../../shared/utils";
import { onboardingSchema } from "../../validations/student.validation";
import { onboardStudent } from "./student.service";

export const onboard = asyncHandler(async (req: Request, res: Response) => {
    const parsed = onboardingSchema.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
        return;
    }
    if (!req.user) {
        res.status(401).json(new ApiResponse(401, null, "Unauthorized"));
        return;
    }

    const student = await onboardStudent(req.user._id, parsed.data);

    res.status(200).json(new ApiResponse(200, student, "Onboarding complete"));
});
