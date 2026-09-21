import { prisma } from "../lib/prisma.js";

export async function loadCurrentUser(request, _response, next) {
	if (!request.session.userId) {
		return next();
	}

	request.user = await prisma.user.findUnique({
		where: { id: request.session.userId },
	});
	next();
}

export function requireAuth(request, response, next) {
	if (!request.user) {
		return response.redirect("/login");
	}

	next();
}
