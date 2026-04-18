export const masterDataErrorMessages = {
    hostelNameExists: "Hostel name already exists",
    hostelCodeExists: "Hostel code already exists",
    hostelNotFound: "Hostel not found",
    departmentNameExists: "Department name already exists",
    departmentCodeExists: "Department code already exists",
    departmentNotFound: "Department not found",
    courseNameExists: "Course name already exists",
    courseCodeExists: "Course code already exists",
    courseAbbreviationExists: "Course abbreviation already exists",
    courseNotFound: "Course not found",
    updatePayloadRequired: "At least one field is required to update",
} as const;

export const masterDataRouteMessages = {
    hostelsFetched: "Hostels fetched successfully",
    hostelCreated: "Hostel created successfully",
    hostelUpdated: "Hostel updated successfully",
    hostelDeleted: "Hostel deleted successfully",
    departmentsFetched: "Departments fetched successfully",
    departmentCreated: "Department created successfully",
    departmentUpdated: "Department updated successfully",
    departmentDeleted: "Department deleted successfully",
    coursesFetched: "Courses fetched successfully",
    courseCreated: "Course created successfully",
    courseUpdated: "Course updated successfully",
    courseDeleted: "Course deleted successfully",
    bootstrapFetched: "Master data fetched successfully",
} as const;
