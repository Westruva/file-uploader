import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";

export function showSignup(request, response) {
	response.render("signup", {
		pageTitle: "Create account | The Backpack",
		formData: { email: "", confirmPassword: "" },
		error: "",
	});
}

export function showLogin(request, response) {
	response.render("login", {
		pageTitle: "Log in | The Backpack",
		formData: { email: "" },
		error: "",
	});
}

export async function signup(request, response, next) {
	const email = normalizeEmail(request.body.email);
	const password = String(request.body.password || "");
	const formData = { email, confirmPassword: "" };

	if (request.validationError) {
		return response.status(400).render("signup", {
			pageTitle: "Create account | The Backpack",
			formData,
			error: request.validationError,
		});
	}

	try {
		const passwordHash = await bcrypt.hash(password, 12);
		const user = await prisma.user.create({
			data: { email, passwordHash },
		});

		await startSession(request, response, user.id, "/");
	} catch (error) {
		if (error.code === "P2002") {
			return response.status(400).render("signup", {
				pageTitle: "Create account | The Backpack",
				formData,
				error: "An account with that email already exists.",
			});
		}

		next(error);
	}
}

export async function login(request, response, next) {
	const email = normalizeEmail(request.body.email);
	const password = String(request.body.password || "");
	const formData = { email };
	const user = await prisma.user.findUnique({ where: { email } });
	const passwordMatches = user
		? await bcrypt.compare(password, user.passwordHash)
		: false;

	if (request.validationError || !user || !passwordMatches) {
		return response.status(400).render("login", {
			pageTitle: "Log in | The Backpack",
			formData,
			error: request.validationError || "Invalid email or password.",
		});
	}

	try {
		await startSession(request, response, user.id, "/");
	} catch (error) {
		next(error);
	}
}

export function logout(request, response, next) {
	request.session.destroy((error) => {
		if (error) return next(error);
		response.clearCookie("connect.sid");
		response.redirect("/login");
	});
}

function normalizeEmail(email) {
	return String(email || "")
		.trim()
		.toLowerCase();
}

function startSession(request, response, userId, redirectPath) {
	return new Promise((resolve, reject) => {
		request.session.regenerate((error) => {
			if (error) return reject(error);
			request.session.userId = userId;
			request.session.save((saveError) => {
				if (saveError) return reject(saveError);
				response.redirect(redirectPath);
				resolve();
			});
		});
	});
}
