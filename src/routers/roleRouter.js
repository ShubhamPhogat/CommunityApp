import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createRole, getAllRoles } from "../controllers/roleController.js";

const roleRouter = express.Router();

// Role routes
roleRouter.post("/", authMiddleware, createRole);
roleRouter.get("/", authMiddleware, getAllRoles);

export default roleRouter;
