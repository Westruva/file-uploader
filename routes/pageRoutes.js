import { Router } from "express";
import { showHomePage } from "../controllers/pageController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

export const pageRoutes = Router();

pageRoutes.get("/", requireAuth, showHomePage);
