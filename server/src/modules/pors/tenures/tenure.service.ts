import { HTTP_STATUS } from "../../../shared/constants/http-status.constants";
import { ApiError, toObjectId } from "../../../shared/utils";
import {
    CreateTenureInput,
    ListTenuresQueryInput,
    UpdateTenureInput,
    UpdateTenureStatusInput,
} from "../../../validations/tenure.validation";
import Organization from "../../organizations/organization.model";
import {
    TENURE_HANDOVER_STATUS,
    TENURE_STATUS,
} from "../constants/tenure.constants";
import { tenureErrorMessages } from "./tenure.messages";
import Tenure from "./tenure.model";
import {
    assertNoTenureOverlap,
    assertValidDateWindow,
    assertValidMonthYearWindow,
    assertValidStatusTransition,
    buildDateRangeFromMonthYear,
    getDefaultAcademicMonthYearPeriod,
} from "./utils";

export const createTenure = async (
    createdBy: string,
    data: CreateTenureInput
) => {
    const org = await Organization.findById(data.orgId).select("_id").lean();

    if (!org) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            tenureErrorMessages.organizationNotFound
        );
    }

    const monthYearPeriod = {
        startMonth: data.startMonth,
        startYear: data.startYear,
        endMonth: data.endMonth,
        endYear: data.endYear,
    };

    assertValidMonthYearWindow(
        monthYearPeriod.startMonth,
        monthYearPeriod.startYear,
        monthYearPeriod.endMonth,
        monthYearPeriod.endYear
    );

    const { startDate, endDate } = buildDateRangeFromMonthYear(monthYearPeriod);
    assertValidDateWindow(startDate, endDate);

    await assertNoTenureOverlap(data.orgId, startDate, endDate);

    return Tenure.create({
        orgId: toObjectId(data.orgId),
        name: data.name,
        cycleYear: data.cycleYear ?? monthYearPeriod.startYear,
        startMonth: monthYearPeriod.startMonth,
        startYear: monthYearPeriod.startYear,
        endMonth: monthYearPeriod.endMonth,
        endYear: monthYearPeriod.endYear,
        startDate,
        endDate,
        status: data.status ?? TENURE_STATUS.PLANNED,
        createdBy: toObjectId(createdBy),
        updatedBy: toObjectId(createdBy),
    });
};

export const listTenures = async (query: ListTenuresQueryInput) => {
    const filter: {
        orgId?: ReturnType<typeof toObjectId>;
        status?: ListTenuresQueryInput["status"];
        cycleYear?: number;
        startDate?: { $lte: Date };
        endDate?: { $gte: Date };
    } = {};

    if (query.orgId) {
        filter.orgId = toObjectId(query.orgId);
    }

    if (query.status) {
        filter.status = query.status;
    }

    if (query.cycleYear !== undefined) {
        filter.cycleYear = query.cycleYear;
    }

    if (query.activeOnDate) {
        filter.startDate = { $lte: query.activeOnDate };
        filter.endDate = { $gte: query.activeOnDate };
    }

    return Tenure.find(filter).sort({ startDate: -1, _id: -1 }).lean();
};

export const getTenureById = async (tenureId: string) => {
    const tenure = await Tenure.findById(tenureId).lean();

    if (!tenure) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            tenureErrorMessages.tenureNotFound
        );
    }

    return tenure;
};

export const updateTenure = async (
    tenureId: string,
    updatedBy: string,
    data: UpdateTenureInput
) => {
    const tenure = await Tenure.findById(tenureId);

    if (!tenure) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            tenureErrorMessages.tenureNotFound
        );
    }

    const defaultPeriod = getDefaultAcademicMonthYearPeriod();
    const nextStartMonth =
        data.startMonth ?? tenure.startMonth ?? defaultPeriod.startMonth;
    const nextStartYear =
        data.startYear ?? tenure.startYear ?? defaultPeriod.startYear;
    const nextEndMonth =
        data.endMonth ?? tenure.endMonth ?? defaultPeriod.endMonth;
    const nextEndYear = data.endYear ?? tenure.endYear ?? defaultPeriod.endYear;

    assertValidMonthYearWindow(
        nextStartMonth,
        nextStartYear,
        nextEndMonth,
        nextEndYear
    );

    const { startDate: computedStartDate, endDate: computedEndDate } =
        buildDateRangeFromMonthYear({
            startMonth: nextStartMonth,
            startYear: nextStartYear,
            endMonth: nextEndMonth,
            endYear: nextEndYear,
        });

    const nextStartDate = data.startDate ?? computedStartDate;
    const nextEndDate = data.endDate ?? computedEndDate;
    assertValidDateWindow(nextStartDate, nextEndDate);

    await assertNoTenureOverlap(
        tenure.orgId.toString(),
        nextStartDate,
        nextEndDate,
        tenureId
    );

    if (data.name !== undefined) tenure.name = data.name;
    if (data.cycleYear !== undefined) tenure.cycleYear = data.cycleYear;
    tenure.startMonth = nextStartMonth;
    tenure.startYear = nextStartYear;
    tenure.endMonth = nextEndMonth;
    tenure.endYear = nextEndYear;
    tenure.startDate = nextStartDate;
    tenure.endDate = nextEndDate;
    if (data.status !== undefined) tenure.status = data.status;

    tenure.updatedBy = toObjectId(updatedBy);

    await tenure.save();
    return tenure;
};

export const updateTenureStatus = async (
    tenureId: string,
    updatedBy: string,
    data: UpdateTenureStatusInput
) => {
    const tenure = await Tenure.findById(tenureId);

    if (!tenure) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            tenureErrorMessages.tenureNotFound
        );
    }

    assertValidStatusTransition(tenure.status, data.status);

    tenure.status = data.status;
    tenure.updatedBy = toObjectId(updatedBy);

    if (data.status === TENURE_STATUS.ACTIVE) {
        tenure.handoverStatus = TENURE_HANDOVER_STATUS.IN_PROGRESS;
    }

    if (data.status === TENURE_STATUS.CLOSED) {
        tenure.handoverStatus = TENURE_HANDOVER_STATUS.COMPLETED;
    }

    if (data.status === TENURE_STATUS.ARCHIVED) {
        tenure.handoverStatus = TENURE_HANDOVER_STATUS.ARCHIVED;
    }

    await tenure.save();
    return tenure;
};
