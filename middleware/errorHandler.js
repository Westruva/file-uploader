import multer from "multer";

export function errorHandler(error, request, response, next) {
	if (response.headersSent) {
		return next(error);
	}

	if (error instanceof multer.MulterError) {
		if (error.code === "LIMIT_FILE_SIZE") {
			return response.redirect(
				"/?error=Files%20must%20be%2050%20MB%20or%20smaller.",
			);
		}

		return response.redirect(
			"/?error=The%20file%20could%20not%20be%20uploaded.",
		);
	}

	console.error(error);
	response.status(500).send("Something went wrong on the server.");
}
