import { runSeedTask } from "../shared/runSeedTask";
import { seedTestStudents } from "./seed";

void runSeedTask("test-students", seedTestStudents);
