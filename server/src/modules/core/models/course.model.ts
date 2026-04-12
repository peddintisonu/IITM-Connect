// server/src/modules/core/models/course.model.ts

import { Document, model, Schema } from "mongoose";

export interface ICourse extends Document {
    name: string;
    code: string;
    abbreviation: string;
    duration?: number;
}

const courseSchema = new Schema<ICourse>(
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
        abbreviation: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        duration: { type: Number },
    },
    {
        timestamps: true,
    }
);

export const Course = model<ICourse>("Course", courseSchema);
