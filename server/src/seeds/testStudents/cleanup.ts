import Student from "../../modules/students/student.model";
import { TEST_STUDENTS } from "./data";

export const cleanupTestStudents = async () => {
    const result = await Student.deleteMany({
        email: { $in: TEST_STUDENTS.map((s) => s.smail) },
    });

    console.log(`Deleted ${result.deletedCount} test students`);
};
