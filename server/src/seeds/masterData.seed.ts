// server/src/seeds/masterData.seed.ts

import { COURSES, DEPARTMENTS, HOSTELS } from "../shared/constants/masterData.constants";
import { Course } from "../modules/core/models/course.model";
import { Department } from "../modules/core/models/department.model";
import { Hostel } from "../modules/core/models/hostel.model";

export const seedMasterData = async () => {
    await Course.deleteMany({});
    await Department.deleteMany({});
    await Hostel.deleteMany({});

    await Course.insertMany(COURSES);
    await Department.insertMany(DEPARTMENTS);
    await Hostel.insertMany(HOSTELS);

    console.log("Seeded courses, departments and hostels ✅");
};
