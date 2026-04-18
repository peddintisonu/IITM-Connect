import { runSeedTask } from "../shared/runSeedTask";
import { cleanupTestStudents } from "./cleanup";

void runSeedTask("cleanup-test-students", cleanupTestStudents);
