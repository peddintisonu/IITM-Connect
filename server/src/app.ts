import express from "express";

const app = express();

app.use(express.json());

app.get("/api/v1/health", (req, res) => {
	res.json({ status: "ok", message: "IITMConnect server is running" });
});

export default app;
