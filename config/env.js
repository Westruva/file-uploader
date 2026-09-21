import "dotenv/config";

export const env = {
	databaseUrl: process.env.DATABASE_URL,
	port: Number(process.env.PORT || 3000),
	sessionSecret: process.env.SESSION_SECRET,
	uploadsDirectory: process.env.UPLOADS_DIRECTORY || "storage",
	objectStorage: {
		endpoint: process.env.S3_ENDPOINT,
		region: process.env.S3_REGION || "auto",
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
		bucket: process.env.S3_BUCKET,
	},
};

if (!env.databaseUrl) {
	throw new Error("DATABASE_URL is required.");
}

if (!env.sessionSecret) {
	throw new Error("SESSION_SECRET is required.");
}
