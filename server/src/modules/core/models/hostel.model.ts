// server/src/modules/core/models/hostel.model.ts

import { Document, model, Schema } from "mongoose";

export interface IHostel extends Document {
    name: string;
    code: string;
    type: "boys" | "girls";
}

const hostelSchema = new Schema<IHostel>(
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
        type: {
            type: String,
            enum: ["boys", "girls"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Hostel = model<IHostel>("Hostel", hostelSchema);
