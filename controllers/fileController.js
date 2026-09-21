import fs from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { prisma } from "../lib/prisma.js";
import {
	deleteObject,
	downloadObject,
	objectStorageConfigured,
	uploadObject,
} from "../lib/objectStorage.js";

export async function createFile(request, response) {
	if (!request.file) {
		return response.redirect("/?error=Choose%20a%20file%20before%20uploading.");
	}

	const storedName =
		request.file.filename || createStorageKey(request.file.originalname);
	const diskPath = objectStorageConfigured ? storedName : request.file.path;

	try {
		if (objectStorageConfigured) {
			await uploadObject({
				key: storedName,
				body: request.file.buffer,
				contentType: request.file.mimetype || "application/octet-stream",
			});
		}

		await prisma.upload.create({
			data: {
				originalName: request.file.originalname,
				storedName,
				mimeType: request.file.mimetype || "application/octet-stream",
				size: request.file.size,
				diskPath,
				userId: request.user.id,
			},
		});

		response.redirect("/?success=File%20uploaded.");
	} catch (error) {
		if (objectStorageConfigured) {
			await deleteObject(storedName).catch(() => undefined);
		} else {
			await fs.rm(request.file.path, { force: true });
		}
		throw error;
	}
}

export async function downloadFile(request, response) {
	const file = await prisma.upload.findUnique({
		where: { id: request.params.id, userId: request.user.id },
	});

	if (!file) {
		return response.status(404).send("File not found.");
	}

	if (objectStorageConfigured) {
		const stream = await downloadObject(file.diskPath);
		response.attachment(file.originalName);
		response.type(file.mimeType);
		return stream.pipe(response);
	}

	response.download(file.diskPath, file.originalName);
}

export async function deleteFile(request, response) {
	const file = await prisma.upload.findUnique({
		where: { id: request.params.id, userId: request.user.id },
	});

	if (!file) {
		return response.status(404).send("File not found.");
	}

	await prisma.upload.delete({ where: { id: file.id } });
	if (objectStorageConfigured) {
		await deleteObject(file.diskPath);
	} else {
		await fs.rm(file.diskPath, { force: true });
	}
	response.redirect("/?success=File%20deleted.");
}

function createStorageKey(originalName) {
	const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
	return `${randomUUID()}-${safeName}`;
}
