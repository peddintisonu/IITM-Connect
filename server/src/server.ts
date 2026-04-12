import app from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";

const PORT = ENV.PORT;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
