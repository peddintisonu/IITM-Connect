import { runSeedTask } from "../shared/runSeedTask";
import { seedMasterData } from "./seed";

void runSeedTask("master-data", seedMasterData);
