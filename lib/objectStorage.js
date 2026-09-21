import {
	DeleteObjectCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const storageConfig = env.objectStorage;

export const objectStorageConfigured = Boolean(
	storageConfig.endpoint &&
	storageConfig.accessKeyId &&
	storageConfig.secretAccessKey &&
	storageConfig.bucket,
);

const s3 = objectStorageConfigured
	? new S3Client({
			region: storageConfig.region,
			endpoint: storageConfig.endpoint,
			forcePathStyle: true,
			credentials: {
				accessKeyId: storageConfig.accessKeyId,
				secretAccessKey: storageConfig.secretAccessKey,
			},
		})
	: null;

export async function uploadObject({ key, body, contentType }) {
	ensureConfigured();
	await s3.send(
		new PutObjectCommand({
			Bucket: storageConfig.bucket,
			Key: key,
			Body: body,
			ContentType: contentType,
		}),
	);
}

export async function downloadObject(key) {
	ensureConfigured();
	const response = await s3.send(
		new GetObjectCommand({ Bucket: storageConfig.bucket, Key: key }),
	);
	return response.Body;
}

export async function deleteObject(key) {
	ensureConfigured();
	await s3.send(
		new DeleteObjectCommand({ Bucket: storageConfig.bucket, Key: key }),
	);
}

function ensureConfigured() {
	if (!objectStorageConfigured) {
		throw new Error("Object storage is not configured.");
	}
}
