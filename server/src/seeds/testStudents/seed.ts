import { Course } from "../../modules/core/models/course.model";
import { Department } from "../../modules/core/models/department.model";
import Student from "../../modules/students/student.model";
import { TEST_STUDENTS } from "./data";

export const seedTestStudents = async () => {
    // Get dept and course for students
    const dept = await Department.findOne({ code: "CS" });
    const course = await Course.findOne({ code: "B" });

    if (!dept || !course) {
        throw new Error(
            "CS dept or B course not found. Run master data seed first."
        );
    }

    // Clear existing test students by deterministic email set
    await Student.deleteMany({
        email: { $in: TEST_STUDENTS.map((s) => s.smail) },
    });

    const students = TEST_STUDENTS.map((student) => ({
        email: student.smail,
        fullName: student.fullName,
        displayName: student.displayName,
        username: student.username,
        profilePhoto: `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.username}`,
        currentRollNo: student.smail.split("@")[0].toLowerCase(),
        currentDeptId: dept._id,
        currentCourseId: course._id,
        currentBatch: 2024,
        graduationYear: 2028,
        status: "active",
        isOnboarded: true,
        accountType: "public",
        role: "student",
        privacySettings: {
            hiddenFields: ["roomNo"],
            publicHiddenFields: ["roomNo"],
            privateHiddenFields: ["rollNo", "hostel", "roomNo"],
        },
    }));

    await Student.insertMany(students);
    console.log(`Seeded ${students.length} test students`);
};
