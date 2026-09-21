import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { loadCurrentUser } from "./middleware/authMiddleware.js";
import { fileRoutes } from "./routes/fileRoutes.js";
import { sessionMiddleware } from "./lib/session.js";
import { pageRoutes } from "./routes/pageRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
	const app = express();

	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "views"));
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(express.static(path.join(__dirname, "public")));

	app.get("/health", (_request, response) => {
		response.json({ status: "ok" });
	});

	app.use(sessionMiddleware);
	app.use(loadCurrentUser);
	app.use(authRoutes);
	app.use(fileRoutes);
	app.use(pageRoutes);
	app.use(errorHandler);

	return app;
}
