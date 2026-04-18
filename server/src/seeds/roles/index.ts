import { runSeedTask } from "../shared/runSeedTask";
import { seedRolesFromEnv } from "./seed";

void runSeedTask("roles", seedRolesFromEnv);
