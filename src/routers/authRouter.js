// routes/auth.routes.js
import express from "express";
import { getMe, signin, signup } from "../controllers/authController.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

// Auth routes
authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.get("/me", authMiddleware, getMe);

export default authRouter;
