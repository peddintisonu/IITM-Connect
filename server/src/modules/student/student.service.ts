// createStudentFromOAuth(email, displayName, photoUrl)
//   → parseRollNo(email)
//   → lookup dept by deptCode
//   → lookup course by courseCode
//   → handle nulls (dept/course not found)
//   → Student.create(...)
//   → return student

import mongoose from "mongoose";
import { ApiError, cleanFullName, parseRollNo } from "../../shared/utils";
import { OnboardingInput } from "../../validations/student.validation";
import { Course } from "../core/models/course.model";
import { Department } from "../core/models/department.model";
import Student, { IStudent } from "./student.model";

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

    if (!student) {
        throw new ApiError(404, "Student not found");
    }

    if (student.isOnboarded) {
        throw new ApiError(400, "Student already onboarded");
    }

    const existingUsername = await Student.findOne({ username: data.username });
    if (existingUsername) {
        throw new ApiError(400, "Username already taken");
    }

    if (data.currentHostelId && !data.currentRoomNo) {
        throw new ApiError(
            400,
            "Room number is required if hostel is selected"
        );
    }

    if (data.currentRoomNo && !data.currentHostelId) {
        throw new ApiError(
            400,
            "Hostel is required if room number is provided"
        );
    }

    const updateData: Partial<IStudent> = {
        displayName: data.displayName,
        username: data.username,
        accountType: data.accountType,
        isOnboarded: true,
    };

    if (data.currentHostelId) {
        updateData.currentHostelId = new mongoose.Types.ObjectId(
            data.currentHostelId
        );
        updateData.currentRoomNo = data.currentRoomNo;
        updateData.hostelHistory = [
            {
                hostelId: new mongoose.Types.ObjectId(data.currentHostelId),
                roomNo: data.currentRoomNo!,
            },
        ];
    }

    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $set: updateData },
        { new: true }
    ).select("-__v -createdAt -updatedAt");

    return updatedStudent;
};
