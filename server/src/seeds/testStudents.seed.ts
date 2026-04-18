// server/src/seeds/testStudents.seed.ts
// Creates test students for search feature testing

import { Course } from "../modules/core/models/course.model";
import { Department } from "../modules/core/models/department.model";
import Student from "../modules/students/student.model";

const TEST_STUDENTS = [
    {
        smail: "cs24b001@smail.iitm.ac.in",
        fullName: "Rahul Kumar Parvam",
        displayName: "Rahul K",
        username: "rahul_k",
    },
    {
        smail: "cs24b002@smail.iitm.ac.in",
        fullName: "Rahul Kumar Singh",
        displayName: "Rahul S",
        username: "rahul_singh",
    },
    {
        smail: "cs24b003@smail.iitm.ac.in",
        fullName: "Karan Malhotra",
        displayName: "Karan M",
        username: "karan_mal",
    },
    {
        smail: "cs24b004@smail.iitm.ac.in",
        fullName: "Priya Sharma",
        displayName: "Priya",
        username: "priya_s",
    },
    {
        smail: "cs24b005@smail.iitm.ac.in",
        fullName: "Amit Kumar Reddy",
        displayName: "Amit",
        username: "amit_kr",
    },
    {
        smail: "cs24b006@smail.iitm.ac.in",
        fullName: "Shreya Gupta",
        displayName: "Shreya",
        username: "shreya_g",
    },
    {
        smail: "cs24b007@smail.iitm.ac.in",
        fullName: "Vikram Patel",
        displayName: "Vikram",
        username: "vikram_p",
    },
    {
        smail: "cs24b008@smail.iitm.ac.in",
        fullName: "Neha Joshi",
        displayName: "Neha",
        username: "neha_j",
    },
    {
        smail: "cs24b009@smail.iitm.ac.in",
        fullName: "Arjun Verma",
        displayName: "Arjun",
        username: "arjun_v",
    },
    {
        smail: "cs24b010@smail.iitm.ac.in",
        fullName: "Divya Singh",
        displayName: "Divya",
        username: "divya_s",
    },
    {
        smail: "cs24b011@smail.iitm.ac.in",
        fullName: "Kabir Hassan Khan",
        displayName: "Kabir",
        username: "kabir_hk",
    },
    {
        smail: "cs24b012@smail.iitm.ac.in",
        fullName: "Siddharth Mehta",
        displayName: "Sid",
        username: "sid_mehta",
    },
    {
        smail: "cs24b013@smail.iitm.ac.in",
        fullName: "Ananya Bhat",
        displayName: "Ananya",
        username: "ananya_b",
    },
    {
        smail: "cs24b014@smail.iitm.ac.in",
        fullName: "Rohit Kumar",
        displayName: "Rohit",
        username: "rohit_k",
    },
    {
        smail: "cs24b015@smail.iitm.ac.in",
        fullName: "Pooja Verma",
        displayName: "Pooja",
        username: "pooja_v",
    },
    {
        smail: "cs24b016@smail.iitm.ac.in",
        fullName: "Harsh Agarwal",
        displayName: "Harsh",
        username: "harsh_a",
    },
    {
        smail: "cs24b017@smail.iitm.ac.in",
        fullName: "Sneha Rao",
        displayName: "Sneha",
        username: "sneha_r",
    },
    {
        smail: "cs24b018@smail.iitm.ac.in",
        fullName: "Kunal Sharma Kumar",
        displayName: "Kunal",
        username: "kunal_sk",
    },
    {
        smail: "cs24b019@smail.iitm.ac.in",
        fullName: "Mira Sinha",
        displayName: "Mira",
        username: "mira_s",
    },
    {
        smail: "cs24b020@smail.iitm.ac.in",
        fullName: "Aditya Malhotra",
        displayName: "Aditya",
        username: "aditya_m",
    },
];

export const seedTestStudents = async () => {
    try {
        // Get dept and course for students
        const dept = await Department.findOne({ code: "CS" });
        const course = await Course.findOne({ code: "B" });

        if (!dept || !course) {
            throw new Error(
                "CS dept or B course not found. Run master data seed first."
            );
        }

        // Clear existing test students
        await Student.deleteMany({
            email: { $in: TEST_STUDENTS.map((s) => s.smail) },
        });

        // Create test students
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
            privacySettings: {
                hiddenFields: ["roomNo"],
                publicHiddenFields: ["roomNo"],
                privateHiddenFields: ["rollNo", "hostel", "roomNo"],
            },
            // FIXME: Remove isTest field before production deployment
            isTest: true,
        }));

        await Student.insertMany(students);
        console.log(
            `✅ Seeded ${students.length} test students for search testing`
        );
    } catch (error) {
        console.error("Test students seeding failed:", error);
        throw error;
    }
};
