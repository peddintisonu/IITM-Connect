import { seedMasterData } from "./masterData/seed";
import { seedRolesFromEnv } from "./roles/seed";
import { runSeedTask } from "./shared/runSeedTask";
import { seedTestStudents } from "./testStudents/seed";

const runSeeds = async () => {
    await seedMasterData();

    if (process.env.TEST_DATA === "true") {
        await seedTestStudents();
    }

    if (process.env.SEED_ROLE_ASSIGNMENTS_JSON) {
        await seedRolesFromEnv();
    }
};

void runSeedTask("all-seeds", runSeeds);
