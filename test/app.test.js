import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();
const agent = request.agent(app);
const testEmail = `integration-${Date.now()}@example.com`;
let testUser;

test.before(async () => {
	const response = await agent.post("/signup").type("form").send({
		email: testEmail,
		password: "integration-password",
		confirmPassword: "integration-password",
	});

	assert.equal(response.status, 302);
	testUser = await prisma.user.findUnique({ where: { email: testEmail } });
	assert.ok(testUser);
});

test.after(async () => {
	if (testUser) {
		await prisma.upload.deleteMany({ where: { userId: testUser.id } });
		await prisma.user.delete({ where: { id: testUser.id } });
	}
	await prisma.$disconnect();
});

test("GET /health returns an ok status", async () => {
	const response = await request(app).get("/health");

	assert.equal(response.status, 200);
	assert.deepEqual(response.body, { status: "ok" });
});

test("GET / renders the file library", async () => {
	const response = await agent.get("/");

	assert.equal(response.status, 200);
	assert.match(response.text, /The Backpack \| File library/);
	assert.match(response.text, /Recent files/);
});

test("POST /files without a file redirects with a validation error", async () => {
	const response = await agent.post("/files");

	assert.equal(response.status, 302);
	assert.match(response.headers.location, /error=Choose%20a%20file/);
});

test("POST /files rejects files larger than 50 MB", async () => {
	const oversizedFile = Buffer.alloc(50 * 1024 * 1024 + 1);
	const response = await agent
		.post("/files")
		.attach("file", oversizedFile, "too-large.bin");

	assert.equal(response.status, 302);
	assert.match(response.headers.location, /error=Files%20must%20be%2050%20MB/);
});

test("upload, download, and delete complete a file lifecycle", async () => {
	const originalName = `integration-${Date.now()}.txt`;
	const contents = "Dropzone integration test";
	let file;

	try {
		const uploadResponse = await agent
			.post("/files")
			.attach("file", Buffer.from(contents), originalName);

		assert.equal(uploadResponse.status, 302);
		assert.match(uploadResponse.headers.location, /success=File%20uploaded/);

		file = await prisma.upload.findFirst({ where: { originalName } });
		assert.ok(file);
		assert.equal(file.mimeType, "text/plain");
		assert.ok(file.storedName);
		assert.ok(file.diskPath);

		const downloadResponse = await agent
			.get(`/files/${file.id}/download`)
			.buffer(true)
			.parse(binaryParser);
		assert.equal(downloadResponse.status, 200);
		assert.equal(downloadResponse.body.toString("utf8"), contents);

		const deleteResponse = await agent.post(`/files/${file.id}/delete`);
		assert.equal(deleteResponse.status, 302);
		assert.match(deleteResponse.headers.location, /success=File%20deleted/);

		assert.equal(
			await prisma.upload.findUnique({ where: { id: file.id } }),
			null,
		);
		file = null;
	} finally {
		if (file) {
			await prisma.upload.delete({ where: { id: file.id } });
		}
	}
});

function binaryParser(response, callback) {
	const chunks = [];

	response.on("data", (chunk) => chunks.push(chunk));
	response.on("end", () => callback(null, Buffer.concat(chunks)));
	response.on("error", callback);
}
