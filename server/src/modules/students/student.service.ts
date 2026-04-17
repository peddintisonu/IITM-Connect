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
    UpdateHostelInput,
    UpdatePrivacyInput,
    UpdateProfileInput,
} from "../../validations/student.validation";
import { Course } from "../core/models/course.model";
import { Department } from "../core/models/department.model";
import { Follow } from "../social/follow.model";
import { isBlockedBetween } from "../social/relationships.utils";
import {
    STUDENT_PUBLIC_SELECT,
    STUDENT_SELF_SELECT,
} from "./student.constants";
import { studentErrorMessages } from "./student.messages";
import Student from "./student.model";
import { cleanFullName, parseRollNo } from "./student.utils";

const hiddenFieldMap: Record<string, string> = {
    rollNo: "currentRollNo",
    hostel: "currentHostelId",
    roomNo: "currentRoomNo",
    batch: "currentBatch",
    graduationYear: "graduationYear",
    dept: "currentDeptId",
    course: "currentCourseId",
};

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

    if (data.accountType) {
        student.accountType = data.accountType;
    }

    if (data.hiddenFields) {
        student.privacySettings.hiddenFields = data.hiddenFields;
    }

    await student.save();

    return await Student.findById(studentId).select(STUDENT_SELF_SELECT);
};

export const getStudentByUsername = async (
    username: string,
    viewerId: string
) => {
    const target = await Student.findOne({ username }).select(
        STUDENT_PUBLIC_SELECT
    );
    if (!target)
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            studentErrorMessages.studentNotFound
        );

    const targetId = target._id.toString();

    // viewer is the student themselves — return everything
    if (targetId === viewerId) {
        return await Student.findById(targetId).select(STUDENT_SELF_SELECT);
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
        const actualField = hiddenFieldMap[field];
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
