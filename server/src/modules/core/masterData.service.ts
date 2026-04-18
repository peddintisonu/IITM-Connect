import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import { ApiError } from "../../shared/utils";
import {
    CreateCourseInput,
    CreateDepartmentInput,
    CreateHostelInput,
    UpdateCourseInput,
    UpdateDepartmentInput,
    UpdateHostelInput,
} from "../../validations/masterData.validation";
import { masterDataErrorMessages } from "./masterData.messages";
import { Course } from "./models/course.model";
import { Department } from "./models/department.model";
import { Hostel } from "./models/hostel.model";

export const getAllHostels = async () => {
    return Hostel.find().sort({ name: 1 }).lean();
};

export const createHostel = async (data: CreateHostelInput) => {
    const existingByName = await Hostel.findOne({ name: data.name })
        .select("_id")
        .lean();
    if (existingByName) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.hostelNameExists
        );
    }

    const existingByCode = await Hostel.findOne({ code: data.code })
        .select("_id")
        .lean();
    if (existingByCode) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.hostelCodeExists
        );
    }

    return Hostel.create(data);
};

export const deleteHostel = async (hostelId: string) => {
    const deleted = await Hostel.findByIdAndDelete(hostelId);
    if (!deleted) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            masterDataErrorMessages.hostelNotFound
        );
    }

    return deleted;
};

export const updateHostel = async (
    hostelId: string,
    data: UpdateHostelInput
) => {
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            masterDataErrorMessages.hostelNotFound
        );
    }

    if (data.name && data.name !== hostel.name) {
        const existingByName = await Hostel.findOne({ name: data.name })
            .select("_id")
            .lean();
        if (existingByName && existingByName._id.toString() !== hostelId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.hostelNameExists
            );
        }
    }

    if (data.code && data.code !== hostel.code) {
        const existingByCode = await Hostel.findOne({ code: data.code })
            .select("_id")
            .lean();
        if (existingByCode && existingByCode._id.toString() !== hostelId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.hostelCodeExists
            );
        }
    }

    if (data.name !== undefined) hostel.name = data.name;
    if (data.code !== undefined) hostel.code = data.code;
    if (data.type !== undefined) hostel.type = data.type;

    await hostel.save();
    return hostel;
};

export const getAllDepartments = async () => {
    return Department.find().sort({ name: 1 }).lean();
};

export const createDepartment = async (data: CreateDepartmentInput) => {
    const existingByName = await Department.findOne({ name: data.name })
        .select("_id")
        .lean();
    if (existingByName) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.departmentNameExists
        );
    }

    const existingByCode = await Department.findOne({ code: data.code })
        .select("_id")
        .lean();
    if (existingByCode) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.departmentCodeExists
        );
    }

    return Department.create(data);
};

export const deleteDepartment = async (departmentId: string) => {
    const deleted = await Department.findByIdAndDelete(departmentId);
    if (!deleted) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            masterDataErrorMessages.departmentNotFound
        );
    }

    return deleted;
};

export const updateDepartment = async (
    departmentId: string,
    data: UpdateDepartmentInput
) => {
    const department = await Department.findById(departmentId);
    if (!department) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            masterDataErrorMessages.departmentNotFound
        );
    }

    if (data.name && data.name !== department.name) {
        const existingByName = await Department.findOne({ name: data.name })
            .select("_id")
            .lean();
        if (existingByName && existingByName._id.toString() !== departmentId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.departmentNameExists
            );
        }
    }

    if (data.code && data.code !== department.code) {
        const existingByCode = await Department.findOne({ code: data.code })
            .select("_id")
            .lean();
        if (existingByCode && existingByCode._id.toString() !== departmentId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.departmentCodeExists
            );
        }
    }

    if (data.name !== undefined) department.name = data.name;
    if (data.code !== undefined) department.code = data.code;

    await department.save();
    return department;
};

export const getAllCourses = async () => {
    return Course.find().sort({ name: 1 }).lean();
};

export const createCourse = async (data: CreateCourseInput) => {
    const existingByName = await Course.findOne({ name: data.name })
        .select("_id")
        .lean();
    if (existingByName) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.courseNameExists
        );
    }

    const existingByCode = await Course.findOne({ code: data.code })
        .select("_id")
        .lean();
    if (existingByCode) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.courseCodeExists
        );
    }

    const existingByAbbreviation = await Course.findOne({
        abbreviation: data.abbreviation,
    })
        .select("_id")
        .lean();
    if (existingByAbbreviation) {
        throw new ApiError(
            HTTP_STATUS.CONFLICT,
            masterDataErrorMessages.courseAbbreviationExists
        );
    }

    return Course.create(data);
};

export const deleteCourse = async (courseId: string) => {
    const deleted = await Course.findByIdAndDelete(courseId);
    if (!deleted) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            masterDataErrorMessages.courseNotFound
        );
    }

    return deleted;
};

export const updateCourse = async (
    courseId: string,
    data: UpdateCourseInput
) => {
    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            masterDataErrorMessages.courseNotFound
        );
    }

    if (data.name && data.name !== course.name) {
        const existingByName = await Course.findOne({ name: data.name })
            .select("_id")
            .lean();
        if (existingByName && existingByName._id.toString() !== courseId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.courseNameExists
            );
        }
    }

    if (data.code && data.code !== course.code) {
        const existingByCode = await Course.findOne({ code: data.code })
            .select("_id")
            .lean();
        if (existingByCode && existingByCode._id.toString() !== courseId) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.courseCodeExists
            );
        }
    }

    if (data.abbreviation && data.abbreviation !== course.abbreviation) {
        const existingByAbbreviation = await Course.findOne({
            abbreviation: data.abbreviation,
        })
            .select("_id")
            .lean();
        if (
            existingByAbbreviation &&
            existingByAbbreviation._id.toString() !== courseId
        ) {
            throw new ApiError(
                HTTP_STATUS.CONFLICT,
                masterDataErrorMessages.courseAbbreviationExists
            );
        }
    }

    if (data.name !== undefined) course.name = data.name;
    if (data.code !== undefined) course.code = data.code;
    if (data.abbreviation !== undefined) {
        course.abbreviation = data.abbreviation;
    }
    if (data.duration !== undefined) course.duration = data.duration;

    await course.save();
    return course;
};

export const getMasterDataBootstrap = async () => {
    const [hostels, departments, courses] = await Promise.all([
        getAllHostels(),
        getAllDepartments(),
        getAllCourses(),
    ]);

    return {
        hostels,
        departments,
        courses,
    };
};
