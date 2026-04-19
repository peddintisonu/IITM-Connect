// server/src/modules/social/block.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IBlock extends Document {
    blockerId: mongoose.Types.ObjectId;
    blockedId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const blockSchema = new Schema<IBlock>(
    {
        blockerId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        blockedId: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
    },
    { timestamps: true }
);

blockSchema.index({ blockerId: 1, blockedId: 1 }, { unique: true });
blockSchema.index({ blockerId: 1, createdAt: -1, _id: -1 });

export const Block = mongoose.model<IBlock>("Block", blockSchema);
