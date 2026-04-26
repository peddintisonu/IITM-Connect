import mongoose, { Schema } from "mongoose";

import {
    TENURE_HANDOVER_STATUS,
    TENURE_HANDOVER_STATUS_ENUM,
    TENURE_STATUS,
    TENURE_STATUS_ENUM,
    type TenureHandoverStatus,
    type TenureStatus,
} from "../constants/tenure.constants";

export interface ITenure extends mongoose.Document {
    orgId: mongoose.Types.ObjectId;
    name: string;
    cycleYear?: number;
    startMonth: number;
    startYear: number;
    endMonth: number;
    endYear: number;
    startDate: Date;
    endDate: Date;
    status: TenureStatus;
    previousTenureId?: mongoose.Types.ObjectId;
    nextTenureId?: mongoose.Types.ObjectId;
    templateVersion: number;
    handoverStatus: TenureHandoverStatus;
    snapshotVersion: number;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}

const tenureSchema = new Schema<ITenure>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        name: { type: String, required: true, trim: true },
        cycleYear: { type: Number },
        startMonth: { type: Number, min: 1, max: 12, required: true },
        startYear: { type: Number, min: 1900, max: 2500, required: true },
        endMonth: { type: Number, min: 1, max: 12, required: true },
        endYear: { type: Number, min: 1900, max: 2500, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        status: {
            type: String,
            enum: TENURE_STATUS_ENUM,
            default: TENURE_STATUS.PLANNED,
        },
        previousTenureId: {
            type: Schema.Types.ObjectId,
            ref: "Tenure",
            default: null,
        },
        nextTenureId: {
            type: Schema.Types.ObjectId,
            ref: "Tenure",
            default: null,
        },
        templateVersion: { type: Number, default: 1 },
        handoverStatus: {
            type: String,
            enum: TENURE_HANDOVER_STATUS_ENUM,
            default: TENURE_HANDOVER_STATUS.PENDING,
        },
        snapshotVersion: { type: Number, default: 1 },
        createdBy: { type: Schema.Types.ObjectId, ref: "Student" },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Student" },
    },
    { timestamps: true }
);

tenureSchema.pre("validate", function () {
    const hasMonthYearPeriod =
        this.startMonth && this.startYear && this.endMonth && this.endYear;

    const hasDatePeriod = this.startDate && this.endDate;

    if (hasMonthYearPeriod && !hasDatePeriod) {
        this.startDate = new Date(
            Date.UTC(this.startYear, this.startMonth - 1, 1, 0, 0, 0, 0)
        );
        this.endDate = new Date(
            Date.UTC(this.endYear, this.endMonth, 0, 23, 59, 59, 999)
        );
        return;
    }

    if (hasDatePeriod && !hasMonthYearPeriod) {
        this.startMonth = this.startDate.getUTCMonth() + 1;
        this.startYear = this.startDate.getUTCFullYear();
        this.endMonth = this.endDate.getUTCMonth() + 1;
        this.endYear = this.endDate.getUTCFullYear();
    }
});

tenureSchema.index({ orgId: 1, status: 1, startDate: 1, endDate: 1, _id: 1 });
tenureSchema.index({ orgId: 1, startYear: 1, startMonth: 1, _id: 1 });
tenureSchema.index({ orgId: 1, cycleYear: 1, _id: 1 });
tenureSchema.index({ previousTenureId: 1, nextTenureId: 1 });

const Tenure = mongoose.model<ITenure>("Tenure", tenureSchema);

export default Tenure;
