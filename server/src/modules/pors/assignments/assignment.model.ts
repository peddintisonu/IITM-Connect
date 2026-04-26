import mongoose, { Schema } from "mongoose";

export interface IPORAssignment extends mongoose.Document {
    orgId: mongoose.Types.ObjectId;
    tenureId: mongoose.Types.ObjectId;
    tenureRoleConfigId: mongoose.Types.ObjectId;
    roleId: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    assignedBy?: mongoose.Types.ObjectId;
    assignedAt: Date;
    releasedAt?: Date;
    isActive: boolean;
    notes?: string;
    assignmentStartMonth?: number;
    assignmentStartYear?: number;
    assignmentEndMonth?: number;
    assignmentEndYear?: number;
}

const porAssignmentSchema = new Schema<IPORAssignment>(
    {
        orgId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
        tenureId: {
            type: Schema.Types.ObjectId,
            ref: "Tenure",
            required: true,
        },
        tenureRoleConfigId: {
            type: Schema.Types.ObjectId,
            ref: "TenureRoleConfig",
            required: true,
        },
        roleId: {
            type: Schema.Types.ObjectId,
            ref: "PORRole",
            required: true,
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        assignedBy: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            default: null,
        },
        assignedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        releasedAt: { type: Date, default: null },
        isActive: { type: Boolean, default: true },
        notes: { type: String, trim: true },
        assignmentStartMonth: {
            type: Number,
            min: 1,
            max: 12,
            default: null,
        },
        assignmentStartYear: {
            type: Number,
            min: 1900,
            max: 2500,
            default: null,
        },
        assignmentEndMonth: {
            type: Number,
            min: 1,
            max: 12,
            default: null,
        },
        assignmentEndYear: {
            type: Number,
            min: 1900,
            max: 2500,
            default: null,
        },
    },
    { timestamps: true }
);

porAssignmentSchema.index({ tenureRoleConfigId: 1, studentId: 1, isActive: 1 });
porAssignmentSchema.index({ orgId: 1, tenureId: 1, roleId: 1, isActive: 1 });
porAssignmentSchema.index({ studentId: 1, isActive: 1, _id: 1 });

const PORAssignment = mongoose.model<IPORAssignment>(
    "PORAssignment",
    porAssignmentSchema
);

export default PORAssignment;
