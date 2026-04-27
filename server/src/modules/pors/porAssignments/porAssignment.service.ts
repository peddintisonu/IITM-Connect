import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import {
    ApiError,
    ensureStudentExists,
    toObjectId,
} from "../../../shared/utils";
import { CreatePORAssignmentInput } from "../../../validations/porAssignment.validation";
import Student from "../../students/student.model";
import PORRole from "../porRoles/porRole.model";
import TenureRoleConfig from "../tenureConfig/tenureRoleConfig.model";
import Tenure from "../tenures/tenure.model";
import { compareMonthYear } from "../utils";
import { porAssignmentErrorMessages } from "./porAssignment.messages";
import PORAssignment from "./porAssignment.model";

export const createPORAssignment = async (
    assignedBy: string,
    data: CreatePORAssignmentInput
) => {
    const tenureRoleConfig = await TenureRoleConfig.findById(
        data.tenureRoleConfigId
    )
        .populate("roleId")
        .lean();

    if (!tenureRoleConfig) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porAssignmentErrorMessages.tenureRoleConfigNotFound
        );
    }

    if (!tenureRoleConfig.isActiveInTenure) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porAssignmentErrorMessages.roleConfigInactive
        );
    }

    const student = ensureStudentExists(
        await Student.findById(data.studentId).select("_id status isOnboarded")
    );

    if (student.status !== "active") {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porAssignmentErrorMessages.studentNotFound
        );
    }

    const existingAssignment = await PORAssignment.findOne({
        tenureRoleConfigId: toObjectId(data.tenureRoleConfigId),
        studentId: toObjectId(data.studentId),
        isActive: true,
    })
        .select("_id")
        .lean();

    if (existingAssignment) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porAssignmentErrorMessages.studentAlreadyAssigned
        );
    }

    const activeAssignmentsCount = await PORAssignment.countDocuments({
        tenureRoleConfigId: toObjectId(data.tenureRoleConfigId),
        isActive: true,
    });

    if (activeAssignmentsCount >= tenureRoleConfig.maxHolders) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            porAssignmentErrorMessages.roleAtCapacity
        );
    }

    const role = await PORRole.findById(tenureRoleConfig.roleId)
        .select("_id")
        .lean();

    if (!role) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porAssignmentErrorMessages.tenureRoleConfigNotFound
        );
    }

    const tenure = await Tenure.findById(tenureRoleConfig.tenureId)
        .select("_id startMonth startYear endMonth endYear")
        .lean();

    if (!tenure) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            porAssignmentErrorMessages.tenureNotFound
        );
    }

    const assignmentStartMonth = data.assignmentStartMonth ?? tenure.startMonth;
    const assignmentStartYear = data.assignmentStartYear ?? tenure.startYear;
    const assignmentEndMonth = data.assignmentEndMonth ?? tenure.endMonth;
    const assignmentEndYear = data.assignmentEndYear ?? tenure.endYear;

    const startsBeforeTenure =
        compareMonthYear(
            assignmentStartYear,
            assignmentStartMonth,
            tenure.startYear,
            tenure.startMonth
        ) < 0;

    const endsAfterTenure =
        compareMonthYear(
            assignmentEndYear,
            assignmentEndMonth,
            tenure.endYear,
            tenure.endMonth
        ) > 0;

    if (startsBeforeTenure || endsAfterTenure) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            porAssignmentErrorMessages.assignmentPeriodOutsideTenure
        );
    }

    return PORAssignment.create({
        orgId: tenureRoleConfig.orgId,
        tenureId: tenureRoleConfig.tenureId,
        tenureRoleConfigId: tenureRoleConfig._id,
        roleId: tenureRoleConfig.roleId,
        studentId: toObjectId(data.studentId),
        assignedBy: toObjectId(assignedBy),
        assignedAt: new Date(),
        isActive: true,
        notes: data.notes,
        assignmentStartMonth,
        assignmentStartYear,
        assignmentEndMonth,
        assignmentEndYear,
    });
};
