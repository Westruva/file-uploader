import { prisma } from "../lib/prisma.js";

export async function showHomePage(request, response) {
	const search = String(request.query.search || "").trim();
	const files = await prisma.upload.findMany({
		where: {
			userId: request.user.id,
			...(search ? { originalName: { contains: search } } : {}),
		},
		orderBy: { createdAt: "desc" },
	});

	response.render("home", {
		pageTitle: "The Backpack | File library",
		files,
		search,
		success: request.query.success || "",
		error: request.query.error || "",
		currentUser: request.user,
		formatFileSize,
	});
}

function formatFileSize(size) {
	if (size < 1024) return `${size} B`;
	if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`;
	return `${(size / 1024 ** 2).toFixed(1)} MB`;
}
