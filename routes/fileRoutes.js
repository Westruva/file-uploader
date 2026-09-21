import { Router } from "express";
import {
	createFile,
	deleteFile,
	downloadFile,
} from "../controllers/fileController.js";
import { uploadFile } from "../middleware/uploadMiddleware.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const fileRoutes = Router();

fileRoutes.use(requireAuth);

fileRoutes.post("/files", uploadFile, createFile);
fileRoutes.get("/files/:id/download", downloadFile);
fileRoutes.post("/files/:id/delete", deleteFile);
