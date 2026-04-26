import { runSeedTask } from "../shared/runSeedTask";
import { seedPORRoles } from "./seed";

void runSeedTask("por-roles", seedPORRoles);
