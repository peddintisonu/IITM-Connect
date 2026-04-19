// blockStudent(blockerId, blockedId)
//   → can't block yourself
//   → check if already blocked
//   → create Block document

// unblockStudent(blockerId, blockedId)
//   → check if block exists
//   → delete Block document
//   → also delete any existing follow between them

// getBlockList(blockerId)
//   → return all students this person has blocked

import mongoose from "mongoose";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { ApiError } from "../../shared/utils";
import { SocialListPaginationInput } from "../../validations/social.validation";
import { STUDENT_STATUS } from "../students/student.constants";
import Student from "../students/student.model";
import { Block } from "./block.model";
import { Follow } from "./follow.model";
import { socialErrorMessages } from "./socialMessages";
import { encodeSocialListCursor, parseSocialListCursor } from "./utils";

export const blockStudent = async (
    blockerId: mongoose.Types.ObjectId,
    blockedId: mongoose.Types.ObjectId
) => {
    if (blockerId.equals(blockedId)) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            socialErrorMessages.cannotBlockSelf
        );
    }

    const blockedStudent = await Student.findById(blockedId).select(
        "_id status isOnboarded"
    );

    if (
        !blockedStudent ||
        !blockedStudent.isOnboarded ||
        blockedStudent.status !== STUDENT_STATUS.ACTIVE
    ) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.studentNotFound
        );
    }

    const existingBlock = await Block.findOne({
        blockerId,
        blockedId,
    });

    if (existingBlock) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            socialErrorMessages.alreadyBlockedStudent
        );
    }

    await Follow.deleteMany({
        $or: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
        ],
    });

    const block = await Block.create({
        blockerId,
        blockedId,
    });

    return block;
};

export const unblockStudent = async (
    blockerId: mongoose.Types.ObjectId,
    blockedId: mongoose.Types.ObjectId
) => {
    const block = await Block.findOneAndDelete({
        blockerId,
        blockedId,
    });

    if (!block) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            socialErrorMessages.blockNotFound
        );
    }

    return block;
};

export const getBlockList = async (
    blockerId: mongoose.Types.ObjectId,
    data: SocialListPaginationInput
) => {
    const cursorData = data.cursor
        ? (() => {
              try {
                  return parseSocialListCursor(data.cursor!);
              } catch {
                  throw new ApiError(
                      HTTP_STATUS.BAD_REQUEST,
                      socialErrorMessages.invalidListCursor
                  );
              }
          })()
        : null;

    const cursorFilter = cursorData
        ? {
              $or: [
                  { createdAt: { $lt: cursorData.createdAt } },
                  {
                      createdAt: cursorData.createdAt,
                      _id: { $lt: cursorData.id },
                  },
              ],
          }
        : {};

    const rows = await Block.find({ blockerId, ...cursorFilter })
        .sort({ createdAt: -1, _id: -1 })
        .limit(data.limit + 1)
        .populate("blockedId", "fullName profilePhoto username");

    const hasMore = rows.length > data.limit;
    const items = rows.slice(0, data.limit);
    const lastItem = items[items.length - 1];

    const nextCursor =
        hasMore && lastItem
            ? encodeSocialListCursor({
                  createdAt: lastItem.createdAt.toISOString(),
                  id: lastItem._id.toString(),
              })
            : null;

    return {
        items,
        nextCursor,
        hasMore,
    };
};
