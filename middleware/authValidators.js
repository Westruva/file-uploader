import { body, validationResult } from "express-validator";

export const signupValidation = [
	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Enter a valid email address."),
	body("password")
		.isLength({ min: 8 })
		.withMessage("Password must be at least 8 characters long."),
	body("confirmPassword")
		.custom((value, { req }) => value === req.body.password)
		.withMessage("Passwords do not match."),
	validateRequest,
];

export const loginValidation = [
	body("email")
		.trim()
		.toLowerCase()
		.isEmail()
		.withMessage("Enter a valid email address."),
	body("password").notEmpty().withMessage("Enter your password."),
	validateRequest,
];

function validateRequest(request, response, next) {
	const errors = validationResult(request);

	if (!errors.isEmpty()) {
		request.validationError = errors.array({ onlyFirstError: true })[0].msg;
	}

	next();
}
