import { HTTP_STATUS } from "../../shared/constants/http-status.constants";
import {
    ApiResponse,
    asyncHandler,
    toObjectId,
    validateAndParse,
} from "../../shared/utils";
import {
    createCourseSchema,
    createDepartmentSchema,
    createHostelSchema,
    updateCourseSchema,
    updateDepartmentSchema,
    updateHostelSchema,
} from "../../validations/masterData.validation";
import { masterDataRouteMessages } from "./masterData.messages";
import {
    createCourse,
    createDepartment,
    createHostel,
    deleteCourse,
    deleteDepartment,
    deleteHostel,
    getAllCourses,
    getAllDepartments,
    getAllHostels,
    getMasterDataBootstrap,
    updateCourse,
    updateDepartment,
    updateHostel,
} from "./masterData.service";

export const getHostelsController = asyncHandler(async (req, res) => {
    const hostels = await getAllHostels();
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            hostels,
            masterDataRouteMessages.hostelsFetched
        )
    );
});

export const createHostelController = asyncHandler(async (req, res) => {
    const data = validateAndParse(createHostelSchema, req.body);
    const hostel = await createHostel(data);
    res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            hostel,
            masterDataRouteMessages.hostelCreated
        )
    );
});

export const deleteHostelController = asyncHandler(async (req, res) => {
    const hostelId = toObjectId(req.params.hostelId).toString();
    const deleted = await deleteHostel(hostelId);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            deleted,
            masterDataRouteMessages.hostelDeleted
        )
    );
});

export const updateHostelController = asyncHandler(async (req, res) => {
    const hostelId = toObjectId(req.params.hostelId).toString();
    const data = validateAndParse(updateHostelSchema, req.body);
    const updated = await updateHostel(hostelId, data);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            updated,
            masterDataRouteMessages.hostelUpdated
        )
    );
});

export const getDepartmentsController = asyncHandler(async (req, res) => {
    const departments = await getAllDepartments();
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            departments,
            masterDataRouteMessages.departmentsFetched
        )
    );
});

export const createDepartmentController = asyncHandler(async (req, res) => {
    const data = validateAndParse(createDepartmentSchema, req.body);
    const department = await createDepartment(data);

    res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            department,
            masterDataRouteMessages.departmentCreated
        )
    );
});

export const deleteDepartmentController = asyncHandler(async (req, res) => {
    const departmentId = toObjectId(req.params.departmentId).toString();
    const deleted = await deleteDepartment(departmentId);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            deleted,
            masterDataRouteMessages.departmentDeleted
        )
    );
});

export const updateDepartmentController = asyncHandler(async (req, res) => {
    const departmentId = toObjectId(req.params.departmentId).toString();
    const data = validateAndParse(updateDepartmentSchema, req.body);
    const updated = await updateDepartment(departmentId, data);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            updated,
            masterDataRouteMessages.departmentUpdated
        )
    );
});

export const getCoursesController = asyncHandler(async (req, res) => {
    const courses = await getAllCourses();
    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            courses,
            masterDataRouteMessages.coursesFetched
        )
    );
});

export const createCourseController = asyncHandler(async (req, res) => {
    const data = validateAndParse(createCourseSchema, req.body);
    const course = await createCourse(data);

    res.status(HTTP_STATUS.CREATED).json(
        new ApiResponse(
            HTTP_STATUS.CREATED,
            course,
            masterDataRouteMessages.courseCreated
        )
    );
});

export const deleteCourseController = asyncHandler(async (req, res) => {
    const courseId = toObjectId(req.params.courseId).toString();
    const deleted = await deleteCourse(courseId);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            deleted,
            masterDataRouteMessages.courseDeleted
        )
    );
});

export const updateCourseController = asyncHandler(async (req, res) => {
    const courseId = toObjectId(req.params.courseId).toString();
    const data = validateAndParse(updateCourseSchema, req.body);
    const updated = await updateCourse(courseId, data);

    res.json(
        new ApiResponse(
            HTTP_STATUS.OK,
            updated,
            masterDataRouteMessages.courseUpdated
        )
    );
});

export const getMasterDataBootstrapController = asyncHandler(
    async (req, res) => {
        const data = await getMasterDataBootstrap();
        res.json(
            new ApiResponse(
                HTTP_STATUS.OK,
                data,
                masterDataRouteMessages.bootstrapFetched
            )
        );
    }
);
