import { HTTP_STATUS } from "../../../../shared/constants/http-status.constants";
import { ApiError, toObjectId } from "../../../../shared/utils";
import {
    TENURE_STATUS,
    type TenureStatus,
} from "../../constants/tenure.constants";
import { tenureErrorMessages } from "../tenure.messages";
import Tenure from "../tenure.model";

const ALLOWED_STATUS_TRANSITIONS: Record<TenureStatus, TenureStatus[]> = {
    [TENURE_STATUS.PLANNED]: [TENURE_STATUS.ACTIVE, TENURE_STATUS.ARCHIVED],
    [TENURE_STATUS.ACTIVE]: [TENURE_STATUS.GRACE, TENURE_STATUS.CLOSED],
    [TENURE_STATUS.GRACE]: [TENURE_STATUS.CLOSED],
    [TENURE_STATUS.CLOSED]: [TENURE_STATUS.ARCHIVED],
    [TENURE_STATUS.ARCHIVED]: [],
};

export const assertValidDateWindow = (startDate: Date, endDate: Date) => {
    if (endDate <= startDate) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureErrorMessages.invalidDateWindow
        );
    }
};

export interface MonthYearPeriod {
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
}

export const getDefaultAcademicMonthYearPeriod = (
    now: Date = new Date()
): MonthYearPeriod => {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    if (month >= 8) {
        return {
            startMonth: 8,
            startYear: year,
            endMonth: 4,
            endYear: year + 1,
        };
    }

    return {
        startMonth: 8,
        startYear: year - 1,
        endMonth: 4,
        endYear: year,
    };
};

export const compareMonthYear = (
    leftYear: number,
    leftMonth: number,
    rightYear: number,
    rightMonth: number
) => {
    if (leftYear !== rightYear) {
        return leftYear - rightYear;
    }

    return leftMonth - rightMonth;
};

export const assertValidMonthYearWindow = (
    startMonth: number,
    startYear: number,
    endMonth: number,
    endYear: number
) => {
    if (compareMonthYear(startYear, startMonth, endYear, endMonth) > 0) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureErrorMessages.invalidMonthYearWindow
        );
    }
};

export const buildDateRangeFromMonthYear = (
    period: MonthYearPeriod
): { startDate: Date; endDate: Date } => {
    const startDate = new Date(
        Date.UTC(period.startYear, period.startMonth - 1, 1, 0, 0, 0, 0)
    );
    const endDate = new Date(
        Date.UTC(period.endYear, period.endMonth, 0, 23, 59, 59, 999)
    );

    return { startDate, endDate };
};

export const buildOverlapFilter = (
    orgId: string,
    startDate: Date,
    endDate: Date,
    excludeTenureId?: string
): Record<string, unknown> => {
    const filter: Record<string, unknown> = {
        orgId: toObjectId(orgId),
        $or: [
            {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate },
            },
        ],
    };

    if (excludeTenureId) {
        filter._id = { $ne: toObjectId(excludeTenureId) };
    }

    return filter;
};

export const assertNoTenureOverlap = async (
    orgId: string,
    startDate: Date,
    endDate: Date,
    excludeTenureId?: string
) => {
    const overlappingTenure = await Tenure.findOne(
        buildOverlapFilter(orgId, startDate, endDate, excludeTenureId)
    )
        .select("_id")
        .lean();

    if (overlappingTenure) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            tenureErrorMessages.tenureWindowOverlaps
        );
    }
};

export const assertValidStatusTransition = (
    currentStatus: TenureStatus,
    nextStatus: TenureStatus
) => {
    if (currentStatus === nextStatus) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            tenureErrorMessages.statusUnchanged
        );
    }

    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedTransitions.includes(nextStatus)) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            tenureErrorMessages.invalidStatusTransition
        );
    }
};
