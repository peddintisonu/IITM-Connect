// server/src/modules/students/student.service.ts

import mongoose from "mongoose";
import {
    deleteFromCloudinary,
    uploadToCloudinary,
} from "../../lib/cloudinaryUpload";
import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { UPLOAD_LIMITS } from "../../shared/constants/upload.constants";
import { ApiError, ensureStudentExists } from "../../shared/utils";
import {
    OnboardingInput,
    StudentSearchInput,
    UpdateHostelInput,
    UpdatePrivacyInput,
    UpdateProfileInput,
} from "../../validations/student.validation";
import { Course } from "../core/models/course.model";
import { Department } from "../core/models/department.model";
import { Block } from "../social/block.model";
import { Follow } from "../social/follow.model";
import { isBlockedBetween } from "../social/utils";
import {
    HIDDEN_FIELD_TO_STUDENT_FIELD_MAP,
    STUDENT_PUBLIC_SELECT,
    STUDENT_SEARCH_SCORE,
    STUDENT_SELF_SELECT,
} from "./student.constants";
import { studentErrorMessages } from "./student.messages";
import Student from "./student.model";
import {
    buildStudentSearchInitials,
    cleanFullName,
    decodeStudentSearchCursor,
    encodeStudentSearchCursor,
    ensurePrivacySnapshots,
    getDefaultHiddenFields,
    normalizeStudentSearchQuery,
    parseRollNo,
    splitStudentSearchQuery,
    toUniqueAllowedHiddenFields,
} from "./utils";

const studentProfilePopulate = [
    { path: "currentDeptId", select: "name code" },
    { path: "currentCourseId", select: "name abbreviation" },
    { path: "currentHostelId", select: "name" },
];

export const createStudentFromOAuth = async (
    email: string,
    displayName: string,
    photoUrl: string
) => {
    const { deptCode, batch, courseCode, rollNo } = parseRollNo(email);

    const dept = await Department.findOne({ code: deptCode });
    const course = await Course.findOne({ code: courseCode });

    if (!dept || !course) {
        throw new Error(
            `Department or Course not found for codes: ${deptCode}, ${courseCode}`
        );
    }

    const student = await Student.create({
        email,
        fullName: cleanFullName(displayName),
        profilePhoto: photoUrl,
        currentRollNo: rollNo,
        currentDeptId: dept._id,
        currentCourseId: course._id,
        currentBatch: batch + 2000,
        graduationYear: course.duration
            ? 2000 + batch + course.duration
            : undefined,
    });

    return student;
};

export const getCurrentStudent = async (studentId: string) => {
    const student = await Student.findById(studentId)
        .select(STUDENT_SELF_SELECT)
        .populate(studentProfilePopulate);

    if (!student) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );
    }

    return student;
};

export const onboardStudent = async (
    studentId: mongoose.Types.ObjectId,
    data: OnboardingInput
) => {
    const student = await Student.findById(studentId);

    const validStudent = ensureStudentExists(student);
    if (validStudent.isOnboarded)
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            studentErrorMessages.studentAlreadyOnboarded
        );

    const existingUsername = await Student.findOne({ username: data.username });
    if (existingUsername)
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            studentErrorMessages.usernameAlreadyTaken
        );

    if (data.currentHostelId && !data.currentRoomNo) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            studentErrorMessages.roomNoRequiredIfHostelSelected
        );
    }
    if (data.currentRoomNo && !data.currentHostelId) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            studentErrorMessages.hostelRequiredIfRoomProvided
        );
    }

    validStudent.displayName = data.displayName;
    validStudent.username = data.username;
    validStudent.accountType = data.accountType;
    validStudent.isOnboarded = true;

    ensurePrivacySnapshots(validStudent);
    validStudent.privacySettings.hiddenFields = getDefaultHiddenFields(
        validStudent.accountType
    );
    if (validStudent.accountType === "private") {
        validStudent.privacySettings.privateHiddenFields = [
            ...validStudent.privacySettings.hiddenFields,
        ];
    } else {
        validStudent.privacySettings.publicHiddenFields = [
            ...validStudent.privacySettings.hiddenFields,
        ];
    }

    if (data.currentHostelId) {
        validStudent.currentHostelId = new mongoose.Types.ObjectId(
            data.currentHostelId
        );
        validStudent.currentRoomNo = data.currentRoomNo;
        validStudent.hostelHistory = [
            {
                hostelId: new mongoose.Types.ObjectId(data.currentHostelId),
                roomNo: data.currentRoomNo!,
            },
        ];
    }

    await validStudent.save();

    return validStudent;
};

export const editStudentProfile = async (
    studentId: string,
    data: UpdateProfileInput
) => {
    if (data.username) {
        const existing = await Student.findOne({ username: data.username });
        if (existing && existing._id.toString() !== studentId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                studentErrorMessages.usernameAlreadyTaken
            );
        }
    }

    const allowedFields = [
        "displayName",
        "username",
        "bio",
        "links",
        "interests",
        "skills",
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
        if (data[key as keyof UpdateProfileInput] !== undefined) {
            updateData[key] = data[key as keyof UpdateProfileInput];
        }
    }

    const updated = await Student.findByIdAndUpdate(
        studentId,
        { $set: updateData },
        { returnDocument: "after" }
    ).select(STUDENT_SELF_SELECT);

    if (!updated)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    return updated;
};

export const checkUsernameAvailability = async (
    username: string,
    currentStudentId?: string
) => {
    const existing = await Student.findOne({ username }).select("_id").lean();

    if (!existing) {
        return { available: true };
    }

    if (currentStudentId && existing._id.toString() === currentStudentId) {
        return { available: true };
    }

    return { available: false };
};

export const getStudentCards = async (viewerId: string, userIds: string[]) => {
    const uniqueUserIds = Array.from(new Set(userIds));
    const targetIds = uniqueUserIds
        .filter((id) => id !== viewerId)
        .map((id) => new mongoose.Types.ObjectId(id));

    if (targetIds.length === 0) {
        return [];
    }

    const viewerObjectId = new mongoose.Types.ObjectId(viewerId);

    const [blockedRelations, students] = await Promise.all([
        Block.find({
            $or: [
                { blockerId: viewerObjectId, blockedId: { $in: targetIds } },
                { blockedId: viewerObjectId, blockerId: { $in: targetIds } },
            ],
        })
            .select("blockerId blockedId")
            .lean(),
        Student.find({
            _id: { $in: targetIds },
            status: "active",
            isOnboarded: true,
        })
            .select("_id displayName username profilePhoto accountType")
            .lean(),
    ]);

    const blockedIdSet = new Set<string>();
    for (const relation of blockedRelations) {
        if (relation.blockerId.toString() === viewerId) {
            blockedIdSet.add(relation.blockedId.toString());
        } else {
            blockedIdSet.add(relation.blockerId.toString());
        }
    }

    const studentMap = new Map(
        students
            .filter((student) => !blockedIdSet.has(student._id.toString()))
            .map((student) => [student._id.toString(), student])
    );

    return uniqueUserIds
        .map((id) => studentMap.get(id))
        .filter((student) => student !== undefined);
};

// TODO: add rate limiting to student search endpoint to prevent abuse and expensive broad queries

export const searchStudents = async (
    viewerId: string,
    data: StudentSearchInput
) => {
    const normalizedQuery = normalizeStudentSearchQuery(data.q);
    const queryTerms = splitStudentSearchQuery(normalizedQuery);
    const queryInitials = buildStudentSearchInitials(normalizedQuery);
    const compactQuery = queryTerms.join("");
    const viewerObjectId = new mongoose.Types.ObjectId(viewerId);

    const blockedRelations = await Block.find({
        $or: [{ blockerId: viewerObjectId }, { blockedId: viewerObjectId }],
    })
        .select("blockerId blockedId")
        .lean();

    const blockedIds = new Set<string>();
    for (const relation of blockedRelations) {
        if (relation.blockerId.toString() === viewerId) {
            blockedIds.add(relation.blockedId.toString());
        } else {
            blockedIds.add(relation.blockerId.toString());
        }
    }

    const cursorData = data.cursor
        ? (() => {
              try {
                  const parsed = decodeStudentSearchCursor(data.cursor!);
                  if (parsed.q !== normalizedQuery) {
                      throw new Error("Cursor query mismatch");
                  }
                  if (
                      typeof parsed.score !== "number" ||
                      typeof parsed.id !== "string" ||
                      !mongoose.isValidObjectId(parsed.id)
                  ) {
                      throw new Error("Cursor shape mismatch");
                  }

                  return parsed;
              } catch {
                  throw new ApiError(
                      HTTP_STATUS.BAD_REQUEST,
                      studentErrorMessages.invalidSearchCursor
                  );
              }
          })()
        : null;

    const searchName = {
        $toLower: {
            $trim: {
                input: { $ifNull: ["$displayName", ""] },
            },
        },
    };

    const searchTokens = {
        $filter: {
            input: { $split: [searchName, " "] },
            as: "token",
            cond: { $ne: ["$$token", ""] },
        },
    };

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: {
                _id: {
                    $ne: viewerObjectId,
                    ...(blockedIds.size > 0
                        ? {
                              $nin: Array.from(blockedIds).map(
                                  (id) => new mongoose.Types.ObjectId(id)
                              ),
                          }
                        : {}),
                },
                status: "active",
                isOnboarded: true,
            },
        },
        {
            $addFields: {
                studentSearchName: searchName,
                studentSearchUsername: {
                    $toLower: {
                        $trim: {
                            input: { $ifNull: ["$username", ""] },
                        },
                    },
                },
                studentSearchTokens: searchTokens,
                studentSearchInitials: {
                    $reduce: {
                        input: searchTokens,
                        initialValue: "",
                        in: {
                            $concat: [
                                "$$value",
                                {
                                    $cond: [
                                        {
                                            $gt: [{ $strLenCP: "$$this" }, 0],
                                        },
                                        { $substrCP: ["$$this", 0, 1] },
                                        "",
                                    ],
                                },
                            ],
                        },
                    },
                },
                studentSearchQueryTerms: queryTerms,
                studentSearchQueryInitials: queryInitials,
                studentSearchCompactQuery: compactQuery,
            },
        },
        {
            $addFields: {
                studentSearchTokenMatches: {
                    $cond: [
                        { $gt: [{ $size: "$studentSearchQueryTerms" }, 0] },
                        {
                            $allElementsTrue: {
                                $map: {
                                    input: "$studentSearchQueryTerms",
                                    as: "searchTerm",
                                    in: {
                                        $anyElementTrue: {
                                            $map: {
                                                input: "$studentSearchTokens",
                                                as: "studentToken",
                                                in: {
                                                    $eq: [
                                                        {
                                                            $substrCP: [
                                                                "$$studentToken",
                                                                0,
                                                                {
                                                                    $strLenCP:
                                                                        "$$searchTerm",
                                                                },
                                                            ],
                                                        },
                                                        "$$searchTerm",
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        false,
                    ],
                },
                studentSearchInitialsMatch: {
                    $and: [
                        { $ne: ["$studentSearchQueryInitials", ""] },
                        {
                            $eq: [
                                {
                                    $substrCP: [
                                        "$studentSearchInitials",
                                        0,
                                        {
                                            $strLenCP:
                                                "$studentSearchQueryInitials",
                                        },
                                    ],
                                },
                                "$studentSearchQueryInitials",
                            ],
                        },
                    ],
                },
                studentSearchUsernameMatch: {
                    $and: [
                        { $ne: ["$studentSearchCompactQuery", ""] },
                        {
                            $eq: [
                                {
                                    $substrCP: [
                                        "$studentSearchUsername",
                                        0,
                                        {
                                            $strLenCP:
                                                "$studentSearchCompactQuery",
                                        },
                                    ],
                                },
                                "$studentSearchCompactQuery",
                            ],
                        },
                    ],
                },
            },
        },
        {
            $addFields: {
                studentSearchScore: {
                    $add: [
                        {
                            $cond: [
                                "$studentSearchUsernameMatch",
                                STUDENT_SEARCH_SCORE.usernamePrefix,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                "$studentSearchInitialsMatch",
                                STUDENT_SEARCH_SCORE.initialsPrefix,
                                0,
                            ],
                        },
                        {
                            $cond: [
                                "$studentSearchTokenMatches",
                                STUDENT_SEARCH_SCORE.tokenPrefix,
                                0,
                            ],
                        },
                    ],
                },
                studentSearchMatches: {
                    $or: [
                        "$studentSearchUsernameMatch",
                        "$studentSearchInitialsMatch",
                        "$studentSearchTokenMatches",
                    ],
                },
            },
        },
        { $match: { studentSearchMatches: true } },
    ];

    if (cursorData) {
        pipeline.push({
            $match: {
                $or: [
                    { studentSearchScore: { $lt: cursorData.score } },
                    {
                        studentSearchScore: cursorData.score,
                        _id: {
                            $lt: new mongoose.Types.ObjectId(cursorData.id),
                        },
                    },
                ],
            },
        });
    }

    pipeline.push(
        { $sort: { studentSearchScore: -1, _id: -1 } },
        { $limit: data.limit + 1 },
        {
            $project: {
                studentSearchScore: 1,
                _id: 1,
                displayName: 1,
                username: 1,
                profilePhoto: 1,
                accountType: 1,
            },
        }
    );

    const searchResults = await Student.aggregate(pipeline);
    const hasMore = searchResults.length > data.limit;
    const items = searchResults.slice(0, data.limit).map((student) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { studentSearchScore, ...item } = student;
        return item;
    });

    const lastItem = searchResults[data.limit - 1];
    const nextCursor =
        hasMore && lastItem
            ? encodeStudentSearchCursor({
                  score: lastItem.studentSearchScore,
                  id: lastItem._id.toString(),
                  q: normalizedQuery,
              })
            : null;

    return {
        items,
        nextCursor,
        hasMore,
    };
};

export const changeStudentHostel = async (
    studentId: string,
    data: UpdateHostelInput
) => {
    const student = await Student.findById(studentId);
    if (!student)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    // Check if provided hostel and room are the same as current - if so, no update needed
    if (
        student.currentHostelId?.toString() === data.currentHostelId &&
        student.currentRoomNo === data.currentRoomNo
    ) {
        return student;
    }
    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
            $set: {
                currentHostelId: new mongoose.Types.ObjectId(
                    data.currentHostelId
                ),
                currentRoomNo: data.currentRoomNo,
            },
            $push: {
                hostelHistory: {
                    hostelId: new mongoose.Types.ObjectId(data.currentHostelId),
                    roomNo: data.currentRoomNo,
                },
            },
        },
        { returnDocument: "after" }
    ).select(STUDENT_SELF_SELECT);

    return updatedStudent;
};

export const editPrivacySettings = async (
    studentId: string,
    data: UpdatePrivacyInput
) => {
    const student = await Student.findById(studentId);
    if (!student)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    ensurePrivacySnapshots(student);

    const currentAccountType = student.accountType;
    const targetAccountType = data.accountType ?? currentAccountType;

    if (data.hiddenFields) {
        const normalizedHiddenFields = toUniqueAllowedHiddenFields(
            data.hiddenFields
        );
        const effectiveHiddenFields =
            normalizedHiddenFields.length > 0
                ? normalizedHiddenFields
                : getDefaultHiddenFields(targetAccountType);

        student.accountType = targetAccountType;
        student.privacySettings.hiddenFields = effectiveHiddenFields;

        if (targetAccountType === "private") {
            student.privacySettings.privateHiddenFields = [
                ...effectiveHiddenFields,
            ];
        } else {
            student.privacySettings.publicHiddenFields = [
                ...effectiveHiddenFields,
            ];
        }
    } else if (data.accountType && targetAccountType !== currentAccountType) {
        student.accountType = targetAccountType;

        const restoredHiddenFields =
            targetAccountType === "private"
                ? student.privacySettings.privateHiddenFields
                : student.privacySettings.publicHiddenFields;

        student.privacySettings.hiddenFields =
            restoredHiddenFields && restoredHiddenFields.length > 0
                ? [...restoredHiddenFields]
                : getDefaultHiddenFields(targetAccountType);
    }

    if (student.accountType === "private") {
        student.privacySettings.privateHiddenFields = [
            ...student.privacySettings.hiddenFields,
        ];
    } else {
        student.privacySettings.publicHiddenFields = [
            ...student.privacySettings.hiddenFields,
        ];
    }

    await student.save();

    return await Student.findById(studentId).select(STUDENT_SELF_SELECT);
};

export const getStudentByUsername = async (
    username: string,
    viewerId: string
) => {
    const target = await Student.findOne({ username })
        .select(STUDENT_PUBLIC_SELECT)
        .populate(studentProfilePopulate);
    if (!target)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    const targetId = target._id.toString();

    // viewer is the student themselves — return everything
    if (targetId === viewerId) {
        return await Student.findById(targetId)
            .select(STUDENT_SELF_SELECT)
            .populate(studentProfilePopulate);
    }

    // check blocks in both directions
    const block = await isBlockedBetween(
        new mongoose.Types.ObjectId(viewerId),
        new mongoose.Types.ObjectId(targetId)
    );
    if (block)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    // check if viewer follows target
    const follow = await Follow.findOne({
        followerId: viewerId,
        followingId: targetId,
        status: "accepted",
    });

    const isFollower = !!follow;

    // private account, not a follower — return minimal profile
    if (target.accountType === "private" && !isFollower) {
        return {
            _id: target._id,
            displayName: target.displayName,
            username: target.username,
            profilePhoto: target.profilePhoto,
            accountType: target.accountType,
            isPrivate: true,
        };
    }

    // follower or public account — strip hidden fields
    const studentObj = target.toObject();
    for (const field of target.privacySettings.hiddenFields) {
        const actualField = HIDDEN_FIELD_TO_STUDENT_FIELD_MAP[field];
        if (actualField)
            delete studentObj[actualField as keyof typeof studentObj];
        delete studentObj["privacySettings" as keyof typeof studentObj];
    }

    return studentObj;
};

export const uploadStudentProfilePhoto = async (
    studentId: string,
    fileBuffer: Buffer,
    _mimeType: string
) => {
    void _mimeType;

    if (fileBuffer.length > UPLOAD_LIMITS.profilePhoto.maxSizeBytes) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `${studentErrorMessages.profilePhotoTooLarge} ${UPLOAD_LIMITS.profilePhoto.maxSizeMb}MB`
        );
    }

    const student = await Student.findById(studentId);
    if (!student)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    if (student.profilePhotoPublicId) {
        await deleteFromCloudinary(student.profilePhotoPublicId);
    }

    const result = await uploadToCloudinary(
        fileBuffer,
        UPLOAD_LIMITS.profilePhoto.folder,
        `profile_${studentId}`
    );

    student.profilePhoto = result.secure_url;
    student.profilePhotoPublicId = result.public_id;
    await student.save();

    return await Student.findById(studentId).select(STUDENT_SELF_SELECT);
};

export const uploadStudentCoverPhoto = async (
    studentId: string,
    fileBuffer: Buffer,
    _mimeType: string
) => {
    void _mimeType;

    if (fileBuffer.length > UPLOAD_LIMITS.coverPhoto.maxSizeBytes) {
        throw new ApiError(
            HTTP_STATUS.BAD_REQUEST,
            `${studentErrorMessages.coverPhotoTooLarge} ${UPLOAD_LIMITS.coverPhoto.maxSizeMb}MB`
        );
    }

    const student = await Student.findById(studentId);
    if (!student)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    if (student.coverPhotoPublicId) {
        await deleteFromCloudinary(student.coverPhotoPublicId);
    }

    const result = await uploadToCloudinary(
        fileBuffer,
        UPLOAD_LIMITS.coverPhoto.folder,
        `cover_${studentId}`
    );

    student.coverPhoto = result.secure_url;
    student.coverPhotoPublicId = result.public_id;
    await student.save();

    return await Student.findById(studentId).select(STUDENT_SELF_SELECT);
};

// TODO: strict image validation using size and dimensions, aspect ratio etc and also add support for webp format for better compression and performance
