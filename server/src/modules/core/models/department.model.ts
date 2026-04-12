// server/src/modules/core/models/department.model.ts

import { Document, model, Schema } from "mongoose";

export interface IDepartment extends Document {
    name: string;
    code: string;
}

const departmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Department = model<IDepartment>("Department", departmentSchema);
