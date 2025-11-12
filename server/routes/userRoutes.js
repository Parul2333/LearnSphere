import express from "express";
import { registerUser, loginUser, getMe } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes for authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private route to verify token and get user info
router.get("/me", protect, getMe);

export default router;
