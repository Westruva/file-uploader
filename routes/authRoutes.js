import { Router } from "express";
import {
	login,
	logout,
	showLogin,
	showSignup,
	signup,
} from "../controllers/authController.js";
import {
	loginValidation,
	signupValidation,
} from "../middleware/authValidators.js";

export const authRoutes = Router();

authRoutes.get("/signup", showSignup);
authRoutes.post("/signup", signupValidation, signup);
authRoutes.get("/login", showLogin);
authRoutes.post("/login", loginValidation, login);
authRoutes.post("/logout", logout);
