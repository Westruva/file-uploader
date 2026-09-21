import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { objectStorageConfigured } from "../lib/objectStorage.js";

const uploadsDirectory = path.resolve(env.uploadsDirectory);
fs.mkdirSync(uploadsDirectory, { recursive: true });

const diskStorage = multer.diskStorage({
	destination: uploadsDirectory,
	filename: (_request, file, callback) => {
		const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
		callback(null, `${randomUUID()}-${safeName}`);
	},
});

const storage = objectStorageConfigured ? multer.memoryStorage() : diskStorage;

export const uploadFile = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 },
}).single("file");
